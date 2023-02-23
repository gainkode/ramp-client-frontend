import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SettingsCurrencyWithDefaults, TransactionType, UserType, WidgetUserParams } from 'src/app/model/generated-models';
import { CurrencyView, QuickCheckoutTransactionTypeList, TransactionTypeView, UserTypeList, UserTypeView } from 'src/app/model/payment.model';
import { ErrorService } from 'src/app/services/error.service';
import { CommonDataService } from '../services/common-data.service';
import { EnvService } from '../services/env.service';

@Component({
  selector: 'app-widget-widget-wizard',
  templateUrl: 'widget-wizard.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss', '../../assets/text-control.scss'],
})
export class WidgetWizardComponent implements OnInit {
  private pSubscriptions: Subscription = new Subscription();
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pGuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  errorMessage = '';
  inProgress = false;
  logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
  logoAlt = EnvService.product;
  defaultCrypto = '';
  defaultFiat = '';
  currencyList: CurrencyView[] = [];
  currencySendList: CurrencyView[] = [];
  currencyReceiveList: CurrencyView[] = [];
  selectedTransactionType: TransactionTypeView | undefined = undefined;
  selectedUserType: UserTypeView | undefined = undefined;
  selectedCurrencyReceive: CurrencyView | undefined = undefined;
  done = false;
  validData = false;
  widgetLink = '';
  userTypes = UserTypeList;
  transactionTypes = QuickCheckoutTransactionTypeList;

  widgetErrorMessages: { [key: string]: string; } = {
    ['required']: 'Widget identifier is required to identify your settings',
    ['pattern']: 'Identifier must be a valid UUID',
  };
  emailErrorMessages: { [key: string]: string; } = {
    ['required']: 'Email is required',
    ['pattern']: 'Email is not valid'
  };
  amountSendErrorMessages: { [key: string]: string; } = {
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  dataForm = this.formBuilder.group({
    widget: [undefined, {
      validators: [
        Validators.required,
        Validators.pattern(this.pGuidPattern)
      ], updateOn: 'change'
    }],
    email: [undefined,
      {
        validators: [
          Validators.required,
          Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        ], updateOn: 'change'
      }
    ],
    transactionType: [TransactionType.Buy],
    amountSend: [undefined, {
      validators: [
        Validators.pattern(this.pNumberPattern)
      ], updateOn: 'change'
    }],
    currencySend: [undefined, { validators: [], updateOn: 'change' }],
    currencyReceive: [undefined, { validators: [], updateOn: 'change' }],
    destination: [undefined, { validators: [], updateOn: 'change' }],
    userType: [UserType.Personal],
    transactionWebHook: [undefined, { validators: [], updateOn: 'change' }]
  });

  get widgetField(): AbstractControl | null {
    return this.dataForm.get('widget');
  }

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  get transactionTypeField(): AbstractControl | null {
    return this.dataForm.get('transactionType');
  }

  get userTypeField(): AbstractControl | null {
    return this.dataForm.get('userType');
  }

  get amountSendField(): AbstractControl | null {
    return this.dataForm.get('amountSend');
  }

  get currencySendField(): AbstractControl | null {
    return this.dataForm.get('currencySend');
  }

  get currencyReceiveField(): AbstractControl | null {
    return this.dataForm.get('currencyReceive');
  }

  get destinationField(): AbstractControl | null {
    return this.dataForm.get('destination');
  }

  get transactionWebHookField(): AbstractControl | null {
    return this.dataForm.get('transactionWebHook');
  }

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private commonService: CommonDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.selectedTransactionType = this.transactionTypes.find(x => x.id === TransactionType.Buy);
    this.selectedUserType = this.userTypes.find(x => x.id === UserType.Personal);
    this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));
    this.pSubscriptions.add(this.currencySendField?.valueChanges.subscribe(val => this.onCurrencySendUpdated(val)));
    this.pSubscriptions.add(this.transactionTypeField?.valueChanges.subscribe(val => this.onTransactionTypeChanged(val)));
    this.pSubscriptions.add(this.userTypeField?.valueChanges.subscribe(val => this.onUserTypeChanged(val)));
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private onCurrencyReceiveUpdated(currency: string): void {
    this.selectedCurrencyReceive = this.currencyReceiveList.find(x => x.symbol === currency);
  }

  private onCurrencySendUpdated(currency: string): void {
    const selected = this.currencySendList.find(x => x.symbol === currency);
    let validators: ValidatorFn[] = [];
    if (selected) {
      this.amountSendErrorMessages['min'] = `Min. amount ${selected?.minAmount} ${selected?.display}`;
      validators = [
        Validators.pattern(this.pNumberPattern),
        Validators.min(selected?.minAmount ?? 0)
      ];
    } else {
      validators = [
        Validators.pattern(this.pNumberPattern)
      ];
    }
    this.amountSendField?.setValidators(validators);
    this.amountSendField?.updateValueAndValidity();
  }

  onTransactionTypeChanged(val: TransactionType): void {
    this.amountSendField?.setValue(undefined);
    this.currencySendField?.setValue(undefined);
    this.currencyReceiveField?.setValue(undefined);
    this.selectedTransactionType = this.transactionTypes.find(x => x.id === val);
    this.loadCurrencyLists();
  }

  onUserTypeChanged(val: UserType): void {
    this.selectedUserType = this.userTypes.find(x => x.id === val);
  }

  private loadCurrencyLists(): void {
    const type = this.selectedTransactionType?.id ?? TransactionType.Buy;
    this.currencySendList = this.currencyList.filter(x => x.fiat === (type === TransactionType.Buy));
    this.currencyReceiveList = this.currencyList.filter(x => x.fiat === (type === TransactionType.Sell));
    let defaultCurrencySend = this.defaultFiat;
    let defaultCurrencyReceive = this.defaultCrypto;
    if (type === TransactionType.Sell) {
      defaultCurrencySend = this.defaultCrypto;
      defaultCurrencyReceive = this.defaultFiat;
    }
    if (this.currencySendList.length > 0) {
      if (this.currencySendList.find(x => x.symbol === defaultCurrencySend)) {
        this.currencySendField?.setValue(defaultCurrencySend);
      } else {
        this.currencySendField?.setValue(this.currencySendList[0].symbol);
      }
      this.currencySendList.splice(0, 0, {
        symbol: '',
        name: ''
      } as CurrencyView);
    }
    if (this.currencyReceiveList.length > 0) {
      if (this.currencyReceiveList.find(x => x.symbol === defaultCurrencyReceive)) {
        this.currencyReceiveField?.setValue(defaultCurrencyReceive);
      } else {
        this.currencyReceiveField?.setValue(this.currencyReceiveList[0].symbol);
      }
      this.currencyReceiveList.splice(0, 0, {
        symbol: '',
        name: ''
      } as CurrencyView);
    }
  }

  loadCurrencies(): void {
    this.handleError('');
    this.progressChanged(true);
    const currencyData$ = this.commonService.getSettingsCurrency();
    this.pSubscriptions.add(
      currencyData$.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        this.progressChanged(false);
        const dataList = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        this.defaultCrypto = dataList.defaultCrypto ?? 'BTC';
        this.defaultFiat = dataList.defaultFiat ?? 'EUR';
        this.currencyList = dataList?.settingsCurrency?.list?.
          map((val) => new CurrencyView(val)) as CurrencyView[];
        this.loadCurrencyLists();
      }, (error) => {
        this.progressChanged(false);
        this.handleError(this.errorHandler.getError(error.message, 'Unable to get currency data'));
      })
    );
  }

  save(): void {
    this.handleError('');
    this.progressChanged(true);
    let wh = undefined;
    let currencyToSend = undefined;
    let amountToSend: number | undefined = undefined;
    let address = undefined;
    if (this.transactionWebHookField?.value &&
      this.transactionWebHookField?.value !== null &&
      this.transactionWebHookField?.value !== '') {
      wh = this.transactionWebHookField?.value;
    }
    if (this.currencySendField?.value &&
      this.currencySendField?.value !== null &&
      this.currencySendField?.value !== '') {
      currencyToSend = this.currencySendField?.value;
    }
    if (this.amountSendField?.value &&
      this.amountSendField?.value !== null &&
      this.amountSendField?.value !== '') {
      amountToSend = parseFloat(this.amountSendField?.value);
    }
    if (this.destinationField?.value &&
      this.destinationField?.value !== null &&
      this.destinationField?.value !== '') {
      address = this.destinationField?.value;
    }
    const paramsData = {
      convertedCurrency: (this.selectedCurrencyReceive) ? this.selectedCurrencyReceive.symbol : undefined,
      currency: currencyToSend,
      amount: amountToSend,
      destination: address,
      transactionType: this.selectedTransactionType?.id,
      onTransactionStatusChanged: wh,
      userType: this.selectedUserType?.id
      // postCode: '',
      // town: '',
      // street: '',
      // subStreet: '',
      // stateName: '',
      // buildingName: '',
      // buildingNumber: '',
      // flatNumber: '',
      // phone: '',
      // birthday: '',
      // sex: 'M/F'
    };
    const transactionData$ = this.commonService.addMyWidgetUserParams(
      this.widgetField?.value,
      this.emailField?.value,
      JSON.stringify(paramsData));
    this.pSubscriptions.add(
      transactionData$.subscribe(
        ({ data }) => {
          this.progressChanged(false);
          const p = data.addMyWidgetUserParams as WidgetUserParams;
          this.done = true;
          this.widgetLink = `${EnvService.client_host}/payment/widget/${p.widgetUserParamsId}`;
        }, (error) => {
          this.progressChanged(false);
          this.handleError(this.errorHandler.getError(error.message, 'Unable to save data'));
        }
      )
    );
  }
}
