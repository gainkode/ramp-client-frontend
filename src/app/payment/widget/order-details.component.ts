import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsCurrencyListResult, TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentDataService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-widget-order-details',
  templateUrl: 'order-details.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetOrderDetailsComponent implements OnInit, OnDestroy {
  @Input() initialized = false;
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();

  private subscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];

  currentCurrencySpend: CurrencyView | null = null;
  currentCurrencyReceive: CurrencyView | null = null;
  currentAmountSpend = 0;
  currentAmountReceive = 0;
  currentCurrencySpendId = '';
  currentCurrencyReceiveId = '';
  currentTransaction = TransactionType.Deposit;
  spendCurrencyList: CurrencyView[] = [];
  receiveCurrencyList: CurrencyView[] = [];

  emailErrorMessages: { [key: string]: string; } = {
    ['email']: 'Email is not valid',
    ['required']: 'Email is required'
  };
  amountSpendErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required'
  };

  dataForm = this.formBuilder.group({
    email: [null, { validators: [Validators.email], updateOn: 'change' }],
    amountSpend: [0, { validators: [], updateOn: 'change' }],
    currencySpend: [null, { validators: [], updateOn: 'change' }],
    amountReceive: [0, { validators: [], updateOn: 'change' }],
    currencyReceive: [null, { validators: [], updateOn: 'change' }],
    transaction: [TransactionType.Deposit, { validators: [], updateOn: 'change' }]
  });

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  get amountSpendField(): AbstractControl | null {
    return this.dataForm.get('amountSpend');
  }

  get currencySpendField(): AbstractControl | null {
    return this.dataForm.get('currencySpend');
  }

  get amountReceiveField(): AbstractControl | null {
    return this.dataForm.get('amountReceive');
  }

  get currencyReceiveField(): AbstractControl | null {
    return this.dataForm.get('currencyReceive');
  }

  get transactionField(): AbstractControl | null {
    return this.dataForm.get('transaction');
  }

  constructor(
    private auth: AuthService,
    private dataService: PaymentDataService,
    private notification: NotificationService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.emailField?.valueChanges.subscribe(val => {
        if (this.emailField?.valid) {
          this.sendData();
        }
      }));
    this.loadDetailsForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadDetailsForm(): void {
    this.onError.emit('');
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.onProgress.emit(true);
      const user = this.auth.user;
      if (user) {
        this.emailField?.setValue(user.email);
      }
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyListResult;
          let itemCount = 0;
          if (currencySettings !== null) {
            itemCount = currencySettings.count as number;
            if (itemCount > 0) {
              this.pCurrencies = currencySettings.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
              this.setCurrencyValues(
                this.currentCurrencySpendId,
                this.currentCurrencyReceiveId,
                this.currentAmountSpend,
                this.currentAmountReceive);
              this.currentCurrencySpendId = '';
              this.currentCurrencyReceiveId = '';
              this.currentAmountSpend = 0;
              this.currentAmountReceive = 0;
            }
          }
          this.onProgress.emit(false);
        }, (error) => {
          this.onProgress.emit(false);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
            this.onReset.emit();
          } else {
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load settings'));
          }
        })
      );
    }
  }

  private setCurrencyValues(
    defaultSpendCurrency: string = '',
    defaultReceiveCurrency: string = '',
    defaultSpendAmount: number = 0,
    defaultReceiveAmount: number = 0): void {
    if (this.currentTransaction === TransactionType.Deposit) {
      this.spendCurrencyList = this.pCurrencies.filter((c) => c.fiat);
      this.receiveCurrencyList = this.pCurrencies.filter((c) => !c.fiat);
    } else if (this.currentTransaction === TransactionType.Withdrawal) {
      this.spendCurrencyList = this.pCurrencies.filter((c) => c.fiat);
      this.receiveCurrencyList = this.pCurrencies.filter((c) => !c.fiat);
    }
    if (this.spendCurrencyList.length > 0) {
      if (defaultSpendCurrency === '') {
        defaultSpendCurrency = this.spendCurrencyList[0].id;
      }
      this.currencySpendField?.setValue(defaultSpendCurrency);
      if (this.currentCurrencySpend) {
        if (defaultSpendAmount === 0) {
          defaultSpendAmount = this.currentCurrencySpend.minAmount;
        }
      }
      this.amountSpendField?.setValue(defaultSpendAmount);
    }
    if (this.receiveCurrencyList.length > 0) {
      if (defaultReceiveCurrency === '') {
        defaultReceiveCurrency = this.receiveCurrencyList[0].id;
      }
      this.currencyReceiveField?.setValue(defaultReceiveCurrency);
      if (defaultReceiveAmount !== 0) {
        this.amountReceiveField?.setValue(defaultReceiveAmount);
      }
    }
  }

  private sendData(): void {
    const data = new CheckoutSummary();
    data.email = this.emailField?.value;
    data.amountFrom = this.amountSpendField?.value;
    data.amountTo = this.amountReceiveField?.value;
    data.currencyFrom = this.currencySpendField?.value;
    data.currencyTo = this.currencyReceiveField?.value;
    this.onDataUpdated.emit(data);
  }

  onSubmit(): void {
    this.emailField?.setValidators([Validators.email, Validators.required]);
    this.emailField?.updateValueAndValidity();
    this.amountSpendField?.setValidators([Validators.required]);
    this.amountSpendField?.updateValueAndValidity();
    this.currencySpendField?.setValidators([Validators.required]);
    this.currencySpendField?.updateValueAndValidity();
    this.amountReceiveField?.setValidators([Validators.required]);
    this.amountReceiveField?.updateValueAndValidity();
    this.currencyReceiveField?.setValidators([Validators.required]);
    this.currencyReceiveField?.updateValueAndValidity();

    console.log('email', this.emailField?.value, this.emailField?.valid ? 'valid' : 'invalid');
    console.log('spend', this.amountSpendField?.value, this.amountSpendField?.valid ? 'valid' : 'invalid');
    console.log('spend currency', this.currencySpendField?.value, this.currencySpendField?.valid ? 'valid' : 'invalid');
    console.log('receive', this.amountReceiveField?.value, this.amountReceiveField?.valid ? 'valid' : 'invalid');
    console.log('receive currency', this.currencyReceiveField?.value, this.currencyReceiveField?.valid ? 'valid' : 'invalid');
  }
}
