import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { PaymentInstrument, PaymentProvider, Rate, SettingsCurrencyWithDefaults, TransactionInput, TransactionSource, TransactionType } from 'model/generated-models';
import { CurrencyView, PaymentInstrumentList, PaymentProviderView, TransactionTypeList } from 'model/payment.model';
import { TransactionItemFull } from 'model/transaction.model';
import { Observable, Subject, Subscription, concat, debounceTime, distinctUntilChanged, filter, finalize, map, of, switchMap, take, tap } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { EnvService } from 'services/env.service';
import { ExchangeRateService } from 'services/rate.service';
import { getCheckedProviderList, getProviderList } from 'utils/utils';

const requiredTransactionTypes = [
	TransactionType.Buy,
	TransactionType.Sell,
	// TransactionType.Deposit,
	// TransactionType.Withdrawal,
];

@Component({
  selector: 'app-transaction-simulation',
  templateUrl: './transaction-simulation.component.html',
  styleUrls: ['./transaction-simulation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionSimulationComponent implements OnInit, OnDestroy {
  selectedTabIndex: number;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private subscriptions: Subscription = new Subscription();

  transactionTypes = TransactionTypeList.filter((item) => requiredTransactionTypes.includes(item.id));
  instrumentTypes = PaymentInstrumentList;
  PAYMENT_INSTRUMENT: typeof PaymentInstrument = PaymentInstrument;
  submitted = false;
  saveInProgress = false;
  errorMessage = '';
  data: TransactionItemFull | undefined = undefined;
  transactionType: TransactionType = TransactionType.System;
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];
  currentRate = 0;
  amountToSpendTitle = `Amount To ${TransactionType.Buy}`;
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

  form = this.formBuilder.group({
  	currencyToSpend: [null, { validators: [Validators.required], updateOn: 'change' }],
  	currencyToReceive: [null, { validators: [Validators.required], updateOn: 'change' }],
  	amountToSpend: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	amountToReceive: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	rate: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	transactionType: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	users: [undefined, { validators: [Validators.required], updateOn: 'change' }],
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

  showSetCurrentRate = EnvService.create_transaction_update_rate;

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private auth: AuthService,
  	private cdr: ChangeDetectorRef,
  	private exchangeRate: ExchangeRateService,
  	private commonService: CommonDataService,
  	private adminService: AdminDataService) { }

  ngOnInit(): void {
  	this.loadCurrencies();
  	this.usersSearch();
  	this.getPaymentProviders();
  	this.exchangeRate.register(this.onExchangeRateUpdated.bind(this));

  	this.subscriptions.add(
  		this.form.get('currencyToSpend')?.valueChanges.subscribe((_) => this.startExchangeRate())
  	);
  	this.subscriptions.add(
  		this.form.get('currencyToReceive')?.valueChanges.subscribe((_) => this.startExchangeRate())
  	);

  	this.subscriptions.add(this.transactionTypeField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onTransactionTypeUpdate(val)));

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
  		this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe({
  			next: ({ data }) =>  {
  				const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
  				this.currencyOptions = currencySettings.settingsCurrency?.list?.map((val) => new CurrencyView(val)) || [];
          this.form.get('transactionType').patchValue(TransactionType.Buy);
  			},
  			error: (error) => this.errorMessage = error
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
  	if (instrument?.length > 0) {
  		this.filteredProviders = getProviderList([instrument], this.providers);
  		this.form.get('provider')?.setValue(
		  this.providers.length > 0
  				? getCheckedProviderList(this.form.get('provider')?.value ?? [], this.filteredProviders)
  				: []
  		);
  	} else {
  		this.form.get('instrument')?.setValue(undefined);
  		this.form.get('provider')?.setValue([]);
  	}
  }

  private onTransactionTypeUpdate(transactionType: TransactionType): void {
  	this.transactionType = transactionType;

  	if(transactionType === TransactionType.Buy || transactionType === TransactionType.Sell){
  		this.onCurrenciesUpdate(transactionType);
  		this.setAmountToSpend(this.pAmountToSpend);
  	} else {
  		this.filteredProviders = this.filteredProviders.filter(item => item.id === 'FiatVault');
  		this.currenciesToSpend = this.currencyOptions.filter(item => item.fiat === true);
  	}

  	this.amountToSpendTitle = `Amount To ${transactionType}`;
  }

  private onCurrenciesUpdate(type: TransactionType): void {
  	if (type === TransactionType.Buy) {
  		this.currenciesToReceive = this.currencyOptions.filter(item => !item.fiat);
  		this.currenciesToSpend = this.currencyOptions.filter(item => item.fiat);
	  } else if (type === TransactionType.Sell) {
  		this.currenciesToReceive = this.currencyOptions.filter(item => item.fiat);
  		this.currenciesToSpend = this.currencyOptions.filter(item => !item.fiat);
  	}

  	this.currencyToSpendField?.setValue(this.currenciesToSpend[0]?.symbol);
  	this.currencyToReceiveField?.setValue(this.currenciesToReceive[0]?.symbol);
  }

  private setAmountToSpend(newAmount: number): void {
  	let receiveAmount = 0;
  	const rate = this.rateField?.value;
  	const amount = this.amountToSpendField?.value;

  	if(rate && amount){
  		if(this.transactionTypeField?.value === TransactionType.Buy){
  			receiveAmount = amount / rate;
  		} else if(this.transactionTypeField?.value === TransactionType.Sell){
  			receiveAmount = amount * rate;
  		}
  	}

  	this.pReceiveAutoUpdated = true;
  	this.pAmountToSpend = newAmount;
  	this.amountToReceiveField?.setValue(receiveAmount);
  }

  private onAmountToSpendUpdate(val: number): void {
  	if(!this.pSpendAutoUpdated && this.pAmountToSpend !== val){
  		this.setAmountToSpend(val);
  	}
  	this.pSpendAutoUpdated = false;
  }

  private onAmountToReceiveUpdate(val: number): void {
  	if(!this.pReceiveAutoUpdated && this.pAmountToReceive !== val){
  		let receiveAmount = 0;
  		const rate = this.rateField?.value;
  		const amount = this.amountToReceiveField?.value;
      
  		if(rate && amount){
  			if(this.transactionTypeField?.value === TransactionType.Buy){
  				receiveAmount = amount * rate;
  			}else if(this.transactionTypeField?.value === TransactionType.Sell){
  				receiveAmount = amount / rate;
  			}
  		}

  		this.pSpendAutoUpdated = true;
  		this.pAmountToReceive = val;
  		this.amountToSpendField?.setValue(receiveAmount);
  	}
  	this.pReceiveAutoUpdated = false;
  }

  private usersSearch(): void {
  	let searchItems:CommonTargetValue[] = [];
  	if(this.usersPreset && this.usersPreset.length !== 0){
  		searchItems = this.usersPreset;
  	}
  	this.usersOptions$ = concat(
  		of(searchItems),
  		this.usersSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minUsersLengthTerm;
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
  		this.exchangeRate.setCurrency(receive, spend, TransactionType.Sell);
  	}
  	this.exchangeRate.update();
  }

  getTransactionToCreate(): TransactionInput{
  	const transactionToCreate = {
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

  setParamsIfRequired(): void{
  	if(this.transactionType === TransactionType.Deposit || this.transactionType === TransactionType.Withdrawal){
  		this.form.get('currencyToReceive')?.setValue(this.currencyToSpendField?.value);
  		this.form.get('amountToReceive')?.setValue(this.amountToSpendField?.value);
  	}
  }

  onSubmit(): void {
  	this.submitted = true;
  	this.setParamsIfRequired();
    
  	if (this.form.valid) {
  		this.createUserTransaction();
  	}
  }

  private createUserTransaction(): void {
  	const rate = this.rateField?.value;

    const transactionToCreate = this.getTransactionToCreate();
    this.saveInProgress = true;

    const requestData = this.adminService.simulateTransaction(transactionToCreate, this.usersField?.value, parseFloat(rate))
      .pipe(finalize(() => {
        this.saveInProgress = false;
        this.cdr.markForCheck();
      } ));
    this.subscriptions.add(requestData.subscribe({
      next: () => {
        // navigate to tab
        this.selectedTabIndex = 1;
      },
      error: (error) => {
        this.errorMessage = error;
        if (this.auth.token === '') {
          void this.router.navigateByUrl('/');
        }
      }
    }));
    
  }
}

// widgetID only for Widget or QuickCheckout available
// source 
// export enum TransactionSource {
//   QuickCheckout = 'QuickCheckout',
//   Wallet = 'Wallet',
//   Widget = 'Widget'
// }