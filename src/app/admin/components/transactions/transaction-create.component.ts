import { Component, ErrorHandler, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AccountStatus, KycStatus, PaymentInstrument, PaymentProvider, Rate, SettingsCommon, SettingsCurrencyWithDefaults, Transaction, TransactionInput, TransactionKycStatus, TransactionSource, TransactionStatus, TransactionStatusDescriptorMap, TransactionType } from 'src/app/model/generated-models';
import { AdminTransactionStatusList, CurrencyView, TransactionKycStatusList, TransactionStatusList, TransactionStatusView, UserStatusList } from 'src/app/model/payment.model';
import { TransactionItemFull } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { getTransactionAmountHash, getTransactionStatusHash } from 'src/app/utils/utils';
import { CostTargetFilterList, PaymentInstrumentList, PaymentProviderView, TransactionTypeList } from 'src/app/model/payment.model';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { CommonTargetValue } from 'src/app/model/common.model';
import { Filter } from 'src/app/admin/model/filter.model';
import { CommonDataService } from 'src/app/services/common-data.service';
import { getCheckedProviderList, getProviderList } from 'src/app/utils/utils';
import { CostScheme } from 'src/app/model/cost-scheme.model';
import { UserItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-admin-transaction-create',
  templateUrl: 'transaction-create.component.html',
  styleUrls: ['transaction-create.component.scss', '../../assets/scss/_validation.scss','../../../../assets/menu.scss', '../../../../assets/button.scss']
})
export class AdminTransactionCreateComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input() set users(val: UserItem[] | undefined) {
    if(val){
      this.usersPreset = val.map(x => {
        return {
            id: x.id,
            title: (x.fullName !== '') ? `${x.fullName} (${x.email})` : x.email
          } as CommonTargetValue;
        }
      );

      this.form.get('users')?.setValue(val.map(x => {
        return x.id;
      }))
      console.log(this.form.get('users')?.value)
    }
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private subscriptions: Subscription = new Subscription();
  private createDialog?: NgbModalRef;

  transactionTypes = TransactionTypeList.filter(item => item.id == TransactionType.Buy || item.id == TransactionType.Sell);
  instrumentTypes = PaymentInstrumentList.filter(item => item.id == PaymentInstrument.FiatVault);
  PAYMENT_INSTRUMENT: typeof PaymentInstrument = PaymentInstrument;

  submitted = false;
  saveInProgress = false;
  errorMessage = '';
  TRANSACTION_TYPE: typeof TransactionType = TransactionType;
  data: TransactionItemFull | undefined = undefined;
  removable = false;
  transactionType: TransactionType = TransactionType.System;
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];
  currentRate = 0;
  amountToSpendTitle = 'Amount To Buy';
  currencyToSpendTitle = 'Currency To Buy';
  currencyOptions: CurrencyView[] = [];

  usersOptions$: Observable<CommonTargetValue[]> = of([]);
  usersSearchInput$ = new Subject<string>();
  isUsersLoading = false;
  minUsersLengthTerm = 1;
  usersPreset: CommonTargetValue[] = [];

  pSpendAutoUpdated = false;
  pReceiveAutoUpdated = false;
  pAmountToSpend = 0;
  pAmountToReceive = 0;

  filteredProviders: PaymentProviderView[] = [];
  providers: PaymentProviderView[] = [];
  showPaymentProvider = false;

  costSchemes: CostScheme[] = [];

  form = this.formBuilder.group({
    currencyToSpend: [null, { validators: [Validators.required], updateOn: 'change' }],
    currencyToReceive: [null, { validators: [Validators.required], updateOn: 'change' }],
    amountToSpend: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    amountToReceive: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    rate: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    transactionType: [null, { validators: [Validators.required], updateOn: 'change' }],
    users: [[], { validators: [Validators.required], updateOn: 'change' }],
    fullAmount: [false],
    instrument:[PaymentInstrument.FiatVault, { validators: [Validators.required], updateOn: 'change' }],
    provider: [undefined],
  });

  get transactionTypeField(): AbstractControl | null {
    return this.form.get('transactionType');
  }
  get currencyToSpendField(): AbstractControl | null {
    return this.form.get('currencyToSpend');
  }
  get currencyToReceiveField(): AbstractControl | null {
    return this.form.get('currencyToReceive');
  }
  get rateField(): AbstractControl | null {
    return this.form.get('rate');
  }
  get amountToSpendField(): AbstractControl | null {
    return this.form.get('amountToSpend');
  }
  get amountToReceiveField(): AbstractControl | null {
    return this.form.get('amountToReceive');
  }
  get fullAmountField(): AbstractControl | null {
    return this.form.get('fullAmount');
  }
  get instrumentTypeField(): AbstractControl | null {
    return this.form.get('instrument');
  }
  get usersField(): AbstractControl | null {
    return this.form.get('users');
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private modalService: NgbModal,
    private errorHandler: ErrorService,
    private exchangeRate: ExchangeRateService,
    private commonService: CommonDataService,
    private adminService: AdminDataService) { }

  ngOnInit(): void {
    this.getSettingsCommon();
    this.loadCurrencies();
    this.usersSearch();
    this.getPaymentProviders();
    // this.setFData();
    this.exchangeRate.register(this.onExchangeRateUpdated.bind(this));
    this.subscriptions.add(
      this.form.get('currencyToSpend')?.valueChanges.subscribe(val => {
        this.startExchangeRate();
      })
    );
    this.subscriptions.add(
      this.form.get('currencyToReceive')?.valueChanges.subscribe(val => {
        this.startExchangeRate();
      })
    );

    this.subscriptions.add(this.transactionTypeField?.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(val => this.onCurrenciesUpdate(val)));

    this.subscriptions.add(this.amountToSpendField?.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(val => this.onAmountToSpendUpdate(val)));

    this.subscriptions.add(this.rateField?.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(val => this.onAmountToSpendUpdate(val)));

    this.subscriptions.add(this.amountToReceiveField?.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(val => this.onAmountToReceiveUpdate(val)));
      
    this.subscriptions.add(this.instrumentTypeField?.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(val => this.onFilterPaymentProviders(val)));
    
    this.subscriptions.add(this.fullAmountField?.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => prev === curr))
      .subscribe(val => this.onFullAmount(val)));
    
  }

  ngOnDestroy(): void {
    this.exchangeRate.stop();
    this.subscriptions.unsubscribe();
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
    //this.rateErrorMessage = error;
    if (rate) {
      this.currentRate = rate.depositRate;
    }
  }

  private getPaymentProviders(): void {
    this.providers = [];
    const data$ = this.adminService.getProviders()?.valueChanges;
    this.subscriptions.add(
      data$.subscribe(({ data }) => {
        const providers = data.getPaymentProviders as PaymentProvider[];
        this.providers = providers?.map((val) => new PaymentProviderView(val));
        const instrument = this.form.get('instrument')?.value;
        this.onFilterPaymentProviders(instrument);
      })
    );
  }

  private loadCurrencies(): void {
    this.subscriptions.add(
      this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
          this.currencyOptions = currencySettings.settingsCurrency.list?. map((val) => new CurrencyView(val)) as CurrencyView[];
        } else {
          this.currencyOptions = [];
        }
      }, (error) => {
        this.errorMessage = error;
      })
    );
  }

  private onFullAmount(fullAmount: boolean): void {
    if (fullAmount) {
      this.amountToSpendField?.setValue(0);
      this.amountToReceiveField?.setValue(0);
    }
  }
  
  private onFilterPaymentProviders(instrument: PaymentInstrument): void {
    if (instrument) {
      if (instrument.length > 0) {
        if (!instrument.includes(PaymentInstrument.WireTransfer)) {
          console.log(this.providers, instrument)
          this.filteredProviders = getProviderList([instrument], this.providers);
          this.showPaymentProvider = this.filteredProviders.length > 0;
          if (this.providers.length > 0) {
            this.form.get('provider')?.setValue(getCheckedProviderList(
              this.form.get('provider')?.value ?? [],
              this.filteredProviders));
          } else {
            this.form.get('provider')?.setValue([]);
          }
        }
      } else {
        this.form.get('instrument')?.setValue(undefined);
        this.form.get('provider')?.setValue([]);
      }
    } else {
      this.form.get('provider')?.setValue([]);
    }
  }

  private onCurrenciesUpdate(val): void {
    if(val == TransactionType.Buy){
      this.currenciesToReceive = this.currencyOptions.filter(item => item.fiat !== true);
      this.currenciesToSpend = this.currencyOptions.filter(item => item.fiat === true);
    }else if(val == TransactionType.Sell){
      this.currenciesToReceive = this.currencyOptions.filter(item => item.fiat === true);
      this.currenciesToSpend = this.currencyOptions.filter(item => item.fiat !== true);
      console.log(this.currenciesToSpend, this.currenciesToReceive)
    }
    this.currencyToSpendField?.setValue(this.currenciesToSpend[0].symbol);
    this.currencyToReceiveField?.setValue(this.currenciesToReceive[0].symbol);
  }

  private onAmountToSpendUpdate(val): void {
    if(!this.pSpendAutoUpdated && this.pAmountToSpend != val){
      let receiveAmount = 0;
      const rate = this.rateField?.value;
      const amount = this.amountToSpendField?.value;
      
      if(rate && amount){
        receiveAmount = rate * amount;
      }
      
      this.pReceiveAutoUpdated = true;
      this.pAmountToSpend = val;
      this.amountToReceiveField?.setValue(receiveAmount);
    }
    this.pSpendAutoUpdated = false;
  }

  private onAmountToReceiveUpdate(val): void {
    if(!this.pReceiveAutoUpdated && this.pAmountToReceive != val){
      let receiveAmount = 0;
      const rate = this.rateField?.value;
      const amount = this.amountToReceiveField?.value;

      if(rate && amount){
        receiveAmount = amount / rate;
      }

      this.pSpendAutoUpdated = true;
      this.pAmountToReceive = val;
      this.amountToSpendField?.setValue(receiveAmount);
    }
    this.pReceiveAutoUpdated = false;
  }

  private usersSearch(): void {
    let searchItems:CommonTargetValue[] = [];
    if(this.usersPreset && this.usersPreset.length != 0){
      searchItems = this.usersPreset;
    }
    this.usersOptions$ = concat(
      of(searchItems),
      this.usersSearchInput$.pipe(
        filter(res => {
          return res !== null && res.length >= this.minUsersLengthTerm
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isUsersLoading = true;
        }),
        switchMap(searchString => {
          this.isUsersLoading = false;
          return this.adminService.getUsers(
            [],
            0,
            100,
            'email',
            false,
            new Filter({ search: searchString })
          ).pipe(map(result => {
            return result.list.map(x => {
              return {
                id: x.id,
                title: (x.fullName !== '') ? `${x.fullName} (${x.email})` : x.email
              } as CommonTargetValue;
            });
          }));
        })
      ));
  }

  private startExchangeRate(): void {
    if (this.currenciesToSpend.length === 0) {
      return;
    }
    const currencyToSpendSymbol = this.data?.currencyToSpend;
    const currencyToSpend = this.currenciesToSpend.find(x => x.symbol === currencyToSpendSymbol);
    const spendFiat = currencyToSpend?.fiat ?? false;
    const spend = this.form.get('currencyToSpend')?.value;
    const receive = this.form.get('currencyToReceive')?.value;
    if (spendFiat) {
      this.exchangeRate.setCurrency(spend, receive, TransactionType.Buy);
    } else {
      this.exchangeRate.setCurrency(receive, spend, TransactionType.Buy);
    }
    this.exchangeRate.update();
  }

  private getSettingsCommon(): void {
    this.subscriptions.add(
      this.adminService.getSettingsCommon()?.valueChanges.subscribe(settings => {
        const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
        const additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
      })
    );
  }

  getTransactionToCreate(){
    const currentRateValue = this.form.get('rate')?.value;
    let currentRate: number | undefined = undefined;
    if (currentRateValue !== undefined) {
      currentRate = parseFloat(currentRateValue);
    }
    let transactionToCreate = {
      type: this.form.get('transactionType')?.value,
      source: TransactionSource.Wallet,
      currencyToSpend: this.form.get('currencyToSpend')?.value,
      currencyToReceive: this.form.get('currencyToReceive')?.value,
      amountToSpend: parseFloat(this.form.get('amountToSpend')?.value ?? '0'),
      instrument: this.form.get('instrument')?.value,
      paymentProvider: this.form.get('provider')?.value,
    } as TransactionInput;

    return transactionToCreate;
  }

  updateRate(): void {
    if (this.currentRate) {
      this.form.get('rate')?.setValue(this.currentRate);
    }
  }


  onSubmit(content: any): void {
    this.submitted = true;
    if (this.form.valid) {
      this.createDialog = this.modalService.open(content, {
        backdrop: 'static',
        windowClass: 'modalCusSty',
      });
    }
  }

  private createUserTransaction(): void {
    const users = this.usersField?.value;
    const rate = this.rateField?.value;
    if(users && users.length != 0 && rate){
      for(let user of users){
        const transactionToCreate = this.getTransactionToCreate();
        this.saveInProgress = true;
        const requestData = this.adminService.createUserTransaction(transactionToCreate, user, rate);
        this.subscriptions.add(
          requestData.subscribe(({ data }) => {
            this.saveInProgress = false;
            this.save.emit();
          }, (error) => {
            this.errorMessage = error;
            this.saveInProgress = false;
            if (this.auth.token === '') {
              this.router.navigateByUrl('/');
            }
          })
        );
      }
    }
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onCreateUserTransactionConfirm(confirm: number): void {
    if (this.createDialog) {
      this.createDialog.close('');
    }
    
    if(confirm == 1){
      this.createUserTransaction();
    }
  }
}
