import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Rate, SettingsCurrencyListResult, TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-widget-order-details',
  templateUrl: 'order-details.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetOrderDetailsComponent implements OnInit, OnDestroy {
  @Input() initialized = false;
  @Input() set rate(val: Rate | undefined) {
    this.pRate = val;
    this.updateAmounts();
  }
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onComplete = new EventEmitter<void>();

  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];
  private pRate: Rate | undefined = undefined;
  private pReceiveUpdated = false;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  transactionTypeEdit = false;
  currentCurrencySpend: CurrencyView | undefined = undefined;
  currentCurrencyReceive: CurrencyView | undefined = undefined;
  currentAmountSpend = 0;
  currentAmountReceive = 0;
  currentCurrencySpendId = '';
  currentCurrencyReceiveId = '';
  currentTransaction: TransactionType = TransactionType.Deposit;
  spendCurrencyList: CurrencyView[] = [];
  receiveCurrencyList: CurrencyView[] = [];
  transactionList = QuickCheckoutTransactionTypeList;

  emailErrorMessages: { [key: string]: string; } = {
    ['email']: 'Email is not valid',
    ['required']: 'Email is required'
  };
  amountSpendErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
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
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
    this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));

    // this.detailsAmountFromControl?.valueChanges.subscribe((val) => {
    //   this.setSummuryAmountFrom(val);
    // });
    // this.detailsAmountToControl?.valueChanges.subscribe((val) => {
    //   this.setSummuryAmountTo(val);
    // });
    // this.detailsTransactionControl?.valueChanges.subscribe((val) => {
    //   const currencyFrom = this.detailsCurrencyFromControl?.value;
    //   const currencyTo = this.detailsCurrencyToControl?.value;
    //   const amountFrom = this.detailsAmountFromControl?.value;
    //   const amountTo = this.detailsAmountToControl?.value;
    //   this.transactionTypeEdit = true;
    //   this.currentTransaction = val as TransactionType;
    //   this.summary.transactionType = this.currentTransaction;
    //   this.setCurrencyValues(currencyTo, currencyFrom, amountTo, amountFrom);
    //   this.priceEdit = true;
    //   this.updateAmountTo();
    //   this.priceEdit = false;
    //   this.transactionTypeEdit = false;
    //   this.exchangeRateComponent?.updateRate();
    // });




    this.loadDetailsForm();


    this.pSubscriptions.add(this.emailField?.valueChanges.subscribe(val => this.sendData()));
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
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
      this.pSubscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyListResult;
          let itemCount = 0;
          if (currencySettings !== null) {
            itemCount = currencySettings.count as number;
            if (itemCount > 0) {
              if (this.currentTransaction === TransactionType.Deposit) {
                this.currentCurrencySpendId = this.auth.user?.defaultFiatCurrency ?? '';
                this.currentCurrencyReceiveId = this.auth.user?.defaultCryptoCurrency ?? '';
              } else if (this.currentTransaction === TransactionType.Withdrawal) {
                this.currentCurrencyReceiveId = this.auth.user?.defaultFiatCurrency ?? '';
                this.currentCurrencySpendId = this.auth.user?.defaultCryptoCurrency ?? '';
              }
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
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load available list of currency types'));
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
    if (this.emailField?.valid) {
      data.email = this.emailField?.value;
    }
    if (this.amountSpendField?.valid) {
      data.amountFrom = this.amountSpendField?.value;
    }
    if (this.amountReceiveField?.valid) {
      data.amountTo = this.amountReceiveField?.value;
    }
    if (this.currencySpendField?.valid) {
      data.currencyFrom = this.currencySpendField?.value;
    }
    if (this.currencyReceiveField?.valid) {
      data.currencyTo = this.currencyReceiveField?.value;
    }
    if (this.transactionField?.valid) {
      data.transactionType = this.transactionField?.value;
    }
    this.onDataUpdated.emit(data);
  }

  private onCurrencySpendUpdated(currency: string): void {
    this.currentCurrencySpend = this.pCurrencies.find((x) => x.id === currency);
    if (this.currentCurrencySpend) {
      this.amountSpendErrorMessages['min'] = `Minimal amount is ${this.currentCurrencySpend.minAmount} ${this.currentCurrencySpend.title}`;
      this.amountSpendField?.setValidators([
        Validators.required,
        Validators.pattern(this.pNumberPattern),
        Validators.min(this.currentCurrencySpend.minAmount),
      ]);
      this.amountSpendField?.updateValueAndValidity();
      this.sendData();
    }
  }

  private onCurrencyReceiveUpdated(currency: string): void {
    this.currentCurrencyReceive = this.pCurrencies.find((x) => x.id === currency);
    if (this.currentCurrencyReceive) {
      this.amountReceiveErrorMessages['min'] = `Minimal amount is ${this.currentCurrencyReceive.minAmount} ${this.currentCurrencyReceive.title}`;
      this.amountReceiveField?.setValidators([
        Validators.required,
        Validators.pattern(this.pNumberPattern),
        Validators.min(this.currentCurrencyReceive.minAmount),
      ]);
      this.amountReceiveField?.updateValueAndValidity();
      // if (this.amountReceiveField?.valid) {
      //   this.pReceiveUpdated = true;
      // }
      this.sendData();
    }
  }

  private updateAmounts(): void {
    if (this.pReceiveUpdated) {
      if (this.currentTransaction === TransactionType.Deposit) {
        if (this.amountReceiveField?.valid && this.pRate?.depositRate) {
          const src = parseInt(this.amountReceiveField?.value);
          const dst = src * this.pRate?.depositRate;
          const val = dst.toFixed(this.currentCurrencySpend?.precision);
          this.amountSpendField?.setValue(val);
        }
      } else if (this.currentTransaction === TransactionType.Withdrawal) {
        if (this.amountReceiveField?.valid && this.pRate?.depositRate) {
          const src = parseInt(this.amountReceiveField?.value);
          const dst = src / this.pRate?.withdrawRate;
          const val = dst.toFixed(this.currentCurrencySpend?.precision);
          this.amountSpendField?.setValue(val);
        }
      }
      this.pReceiveUpdated = false;
    } else {
      if (this.currentTransaction === TransactionType.Deposit) {
        if (this.amountSpendField?.valid && this.pRate?.depositRate) {
          const src = parseInt(this.amountSpendField?.value);
          const dst = src / this.pRate?.depositRate;
          const val = dst.toFixed(this.currentCurrencyReceive?.precision);
          this.amountReceiveField?.setValue(val);
        }
      } else if (this.currentTransaction === TransactionType.Withdrawal) {
        if (this.amountSpendField?.valid && this.pRate?.withdrawRate) {
          const src = parseInt(this.amountSpendField?.value);
          const dst = src * this.pRate?.withdrawRate;
          const val = dst.toFixed(this.currentCurrencyReceive?.precision);
          this.amountReceiveField?.setValue(val);
        }
      }
    }
  }

  onSubmit(): void {
    this.emailField?.setValidators([Validators.email, Validators.required]);
    this.emailField?.updateValueAndValidity();

    console.log('email', this.emailField?.value, this.emailField?.valid ? 'valid' : 'invalid');
    console.log('spend', this.amountSpendField?.value, this.amountSpendField?.valid ? 'valid' : 'invalid');
    console.log('spend currency', this.currencySpendField?.value, this.currencySpendField?.valid ? 'valid' : 'invalid');
    console.log('receive', this.amountReceiveField?.value, this.amountReceiveField?.valid ? 'valid' : 'invalid');
    console.log('receive currency', this.currencyReceiveField?.value, this.currencyReceiveField?.valid ? 'valid' : 'invalid');

    if (this.dataForm.valid) {
      this.onComplete.emit();
    }
  }
}
