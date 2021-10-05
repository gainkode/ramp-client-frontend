import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsCurrencyListResult, TransactionType } from 'src/app/model/generated-models';
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
  @Input() set summary(val: CheckoutSummary | undefined) {
    this.pSummary = val;
  }
  @Input() set withdrawalRate(val: number | undefined) {
    this.pSpendChanged = true;
    this.pWithdrawalRate = val;
    this.updateCurrentAmounts();
  }
  @Input() set depositRate(val: number | undefined) {
    this.pSpendChanged = true;
    this.pDepositRate = val;
    this.updateCurrentAmounts();
  }
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onComplete = new EventEmitter();

  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];
  private pSummary: CheckoutSummary | undefined = undefined;
  private pSpendChanged = false;
  private pReceiveChanged = false;
  private pSpendAutoUpdated = false;
  private pReceiveAutoUpdated = false;
  private pWithdrawalRate: number | undefined = undefined;
  private pDepositRate: number | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  validData = false;
  transactionTypeEdit = false;
  currentCurrencySpend: CurrencyView | undefined = undefined;
  currentCurrencyReceive: CurrencyView | undefined = undefined;
  currentTransaction: TransactionType = TransactionType.Deposit;
  spendCurrencyList: CurrencyView[] = [];
  receiveCurrencyList: CurrencyView[] = [];
  transactionList = QuickCheckoutTransactionTypeList;

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
    amountSpend: [undefined, { validators: [], updateOn: 'change' }],
    currencySpend: [null, { validators: [], updateOn: 'change' }],
    amountReceive: [undefined, { validators: [], updateOn: 'change' }],
    currencyReceive: [null, { validators: [], updateOn: 'change' }],
    transaction: [TransactionType.Deposit, { validators: [], updateOn: 'change' }]
  });

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
    // this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
    // this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));

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
    this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
    this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));
    this.pSubscriptions.add(this.amountSpendField?.valueChanges.subscribe(val => this.onAmountSpendUpdated(val)));
    this.pSubscriptions.add(this.amountReceiveField?.valueChanges.subscribe(val => this.onAmountReceiveUpdated(val)));
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
      this.pSubscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyListResult;
          let itemCount = 0;
          if (currencySettings !== null) {
            itemCount = currencySettings.count as number;
            if (itemCount > 0) {
              let currentCurrencySpendId = this.pSummary?.currencyFrom ?? '';
              let currentCurrencyReceiveId = this.pSummary?.currencyTo ?? '';
              let currentAmountSpend = this.pSummary?.amountFrom;
              let currentAmountReceive = this.pSummary?.amountTo;
              if (this.currentTransaction === TransactionType.Deposit) {
                if (currentCurrencySpendId === '') {
                  currentCurrencySpendId = this.auth.user?.defaultFiatCurrency ?? '';
                }
                if (currentCurrencyReceiveId === '') {
                  currentCurrencyReceiveId = this.auth.user?.defaultCryptoCurrency ?? '';
                }
              } else if (this.currentTransaction === TransactionType.Withdrawal) {
                if (currentCurrencySpendId === '') {
                  currentCurrencyReceiveId = this.auth.user?.defaultFiatCurrency ?? '';
                }
                if (currentCurrencyReceiveId === '') {
                  currentCurrencySpendId = this.auth.user?.defaultCryptoCurrency ?? '';
                }
              }
              this.pCurrencies = currencySettings.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
              this.setCurrencyValues(
                currentCurrencySpendId,
                currentCurrencyReceiveId,
                currentAmountSpend,
                currentAmountReceive);
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
    defaultSpendAmount: number | undefined = undefined,
    defaultReceiveAmount: number | undefined = undefined): void {
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
      this.pSpendAutoUpdated = true;
      this.amountSpendField?.setValue(defaultSpendAmount);
    }
    if (this.receiveCurrencyList.length > 0) {
      if (defaultReceiveCurrency === '') {
        defaultReceiveCurrency = this.receiveCurrencyList[0].id;
      }
      this.currencyReceiveField?.setValue(defaultReceiveCurrency);
      this.pReceiveAutoUpdated = true;
      this.amountReceiveField?.setValue(defaultReceiveAmount);
    }
    if (this.pSpendChanged || this.pReceiveChanged) {
      this.updateCurrentAmounts();
    }
  }

  private sendData(spend: number | undefined, receive: number | undefined): void {
    const data = new CheckoutSummary();
    data.amountFrom = spend;
    data.amountTo = receive;
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
    if (this.currentCurrencySpend && this.amountSpendField?.value) {
      this.amountSpendErrorMessages['min'] = `Minimal amount is ${this.currentCurrencySpend.minAmount} ${this.currentCurrencySpend.title}`;
      this.amountSpendField?.setValidators([
        Validators.required,
        Validators.pattern(this.pNumberPattern),
        Validators.min(this.currentCurrencySpend.minAmount),
      ]);
      this.amountSpendField?.updateValueAndValidity();
    }
    this.pSpendChanged = true;
    this.updateCurrentAmounts();
  }

  private onCurrencyReceiveUpdated(currency: string): void {
    this.currentCurrencyReceive = this.pCurrencies.find((x) => x.id === currency);
    if (this.currentCurrencyReceive && this.amountReceiveField?.value) {
      this.amountReceiveErrorMessages['min'] = `Minimal amount is ${this.currentCurrencyReceive.minAmount} ${this.currentCurrencyReceive.title}`;
      this.amountReceiveField?.setValidators([
        Validators.required,
        Validators.pattern(this.pNumberPattern),
        Validators.min(this.currentCurrencyReceive.minAmount),
      ]);
      this.amountReceiveField?.updateValueAndValidity();
    }
    this.pReceiveChanged = true;
    this.updateCurrentAmounts();
  }

  private onAmountSpendUpdated(val: any) {
    if (val && !this.pSpendAutoUpdated) {
      this.pSpendAutoUpdated = false;
      if (this.hasValidators(this.amountSpendField as AbstractControl) === false) {
        if (this.currentCurrencySpend) {
          this.amountSpendErrorMessages['min'] = `Minimal amount is ${this.currentCurrencySpend.minAmount} ${this.currentCurrencySpend.title}`;
          this.amountSpendField?.setValidators([
            Validators.required,
            Validators.pattern(this.pNumberPattern),
            Validators.min(this.currentCurrencySpend.minAmount),
          ]);
          this.amountSpendField?.updateValueAndValidity();
        }
      }
      this.pSpendChanged = true;
      this.updateCurrentAmounts();
    }
    this.pSpendAutoUpdated = false;
  }

  private onAmountReceiveUpdated(val: any) {
    if (val && !this.pReceiveAutoUpdated) {
      this.pReceiveAutoUpdated = false;
      if (this.hasValidators(this.amountReceiveField as AbstractControl) === false) {
        if (this.currentCurrencyReceive) {
          this.amountReceiveErrorMessages['min'] = `Minimal amount is ${this.currentCurrencyReceive.minAmount} ${this.currentCurrencyReceive.title}`;
          this.amountReceiveField?.setValidators([
            Validators.required,
            Validators.pattern(this.pNumberPattern),
            Validators.min(this.currentCurrencyReceive.minAmount),
          ]);
          this.amountReceiveField?.updateValueAndValidity();
        }
      }
      this.pReceiveChanged = true;
      this.updateCurrentAmounts();
    }
    this.pReceiveAutoUpdated = false;
  }

  private hasValidators(control: AbstractControl) {
    if (!control) {
      return false;
    }
    if (control.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && validator.required) {
        return true;
      }
    }
    return false;
  }

  private updateCurrentAmounts(): void {
    let spend: number | undefined = undefined;
    let receive: number | undefined = undefined;
    if (this.amountSpendField?.value && this.amountSpendField?.valid) {
      spend = parseFloat(this.amountSpendField?.value);
    }
    if (this.amountReceiveField?.value && this.amountReceiveField?.valid) {
      receive = parseFloat(this.amountReceiveField?.value);
    }
    this.updateAmounts(spend, receive);
  }

  private updateAmounts(spend: number | undefined, receive: number | undefined): void {
    this.validData = false;
    let dst = 0;
    if (this.pReceiveChanged) {
      if (this.currentTransaction === TransactionType.Deposit) {
        if (receive && this.pDepositRate) {
          dst = receive * this.pDepositRate;
          this.validData = true;
        }
      } else if (this.currentTransaction === TransactionType.Withdrawal) {
        if (receive && this.pWithdrawalRate) {
          const rate = this.pWithdrawalRate;
          if (rate === 0) {
            dst = 0;
          } else {
            dst = receive / rate;
          }
          this.validData = true;
        }
      }
      if (this.validData === true) {
        spend = dst;
        const val = dst.toFixed(this.currentCurrencySpend?.precision);
        this.pSpendAutoUpdated = true;
        this.amountSpendField?.setValue(val);
      }
    }
    if (this.pSpendChanged) {
      if (this.currentTransaction === TransactionType.Deposit) {
        if (spend && this.pDepositRate) {
          const rate = this.pDepositRate;
          if (rate === 0) {
            dst = 0;
          } else {
            dst = spend / rate;
          }
          this.validData = true;
        }
      } else if (this.currentTransaction === TransactionType.Withdrawal) {
        if (spend && this.pWithdrawalRate) {
          dst = spend * this.pWithdrawalRate;
          this.validData = true;
        }
      }
      if (this.validData === true) {
        receive = dst;
        const val = dst.toFixed(this.currentCurrencyReceive?.precision);
        this.pReceiveAutoUpdated = true;
        this.amountReceiveField?.setValue(val);
      }
    }
    this.pSpendChanged = false;
    this.pReceiveChanged = false;
    this.sendData(spend, receive);
  }

  onSubmit(): void {
    console.log('spend', this.amountSpendField?.value, this.amountSpendField?.valid ? 'valid' : 'invalid');
    console.log('spend currency', this.currencySpendField?.value, this.currencySpendField?.valid ? 'valid' : 'invalid');
    console.log('receive', this.amountReceiveField?.value, this.amountReceiveField?.valid ? 'valid' : 'invalid');
    console.log('receive currency', this.currencyReceiveField?.value, this.currencyReceiveField?.valid ? 'valid' : 'invalid');

    if (this.dataForm.valid) {
      this.onComplete.emit();
    }
  }
}
