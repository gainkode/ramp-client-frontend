import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsCurrencyListResult, TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList, WidgetSettings } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-widget-order-details',
  templateUrl: 'order-details.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetOrderDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() initialized = false;
  @Input() settings: WidgetSettings = new WidgetSettings();
  @Input() summary: CheckoutSummary | undefined = undefined;
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
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onComplete = new EventEmitter();

  private pInitState = true;
  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];
  private pSpendChanged = false;
  private pReceiveChanged = false;
  private pTransactionChanged = false;
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
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    if (this.summary?.transactionType) {
      this.currentTransaction = this.summary.transactionType;
      this.transactionField?.setValue(this.currentTransaction);
    }
    if (this.summary?.initialized) {
      this.currentTransaction = this.summary.transactionType;
      this.transactionField?.setValue(this.summary.transactionType);
    }
    this.loadDetailsForm(this.summary?.initialized ?? false);
    this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
    this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));
    this.pSubscriptions.add(this.amountSpendField?.valueChanges.subscribe(val => this.onAmountSpendUpdated(val)));
    this.pSubscriptions.add(this.amountReceiveField?.valueChanges.subscribe(val => this.onAmountReceiveUpdated(val)));
    this.pSubscriptions.add(this.transactionField?.valueChanges.subscribe(val => this.onTransactionUpdated(val)));
  }

  ngAfterViewInit(): void {
    this.pInitState = false;
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  private loadDetailsForm(initState: boolean): void {
    this.onError.emit('');
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.onProgress.emit(true);
      this.pSubscriptions.add(
        currencyData.valueChanges.subscribe(
          ({ data }) => this.loadCurrencyList(data.getSettingsCurrency as SettingsCurrencyListResult, initState),
          (error) => {
            this.onProgress.emit(false);
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load available list of currency types'));
          })
      );
    }
  }

  private loadCurrencyList(currencySettings: SettingsCurrencyListResult, initState: boolean) {
    let itemCount = 0;
    if (currencySettings !== null) {
      itemCount = currencySettings.count as number;
      if (itemCount > 0) {
        let currentCurrencySpendId = this.summary?.currencyFrom ?? '';
        let currentCurrencyReceiveId = this.summary?.currencyTo ?? '';
        let currentAmountSpend = this.summary?.amountFrom;
        let currentAmountReceive = this.summary?.amountTo;
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
          initState,
          currentCurrencySpendId,
          currentCurrencyReceiveId,
          currentAmountSpend,
          currentAmountReceive);
      }
    }
    this.onProgress.emit(false);
  }

  private setCurrencyValues(
    initState: boolean,
    defaultSpendCurrency: string = '',
    defaultReceiveCurrency: string = '',
    defaultSpendAmount: number | undefined = undefined,
    defaultReceiveAmount: number | undefined = undefined): void {
    this.setCurrencyLists();
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
    if (initState === true) {
      this.pSpendChanged = true;
    }
    if (this.pSpendChanged || this.pReceiveChanged) {
      this.updateCurrentAmounts();
    }
  }

  private setCurrencyLists(): void {
    if (this.currentTransaction === TransactionType.Deposit) {
      this.spendCurrencyList = this.pCurrencies.filter((c) => c.fiat);
      this.receiveCurrencyList = this.pCurrencies.filter((c) => !c.fiat);
    } else if (this.currentTransaction === TransactionType.Withdrawal) {
      this.spendCurrencyList = this.pCurrencies.filter((c) => !c.fiat);
      this.receiveCurrencyList = this.pCurrencies.filter((c) => c.fiat);
    }
  }

  private sendData(spend: number | undefined, receive: number | undefined): void {
    if (this.pInitState === false) {
      const data = new CheckoutSummary();
      data.amountFrom = spend;
      data.amountTo = receive;
      if (this.currencySpendField?.valid) {
        data.currencyFrom = this.currencySpendField?.value;
        data.amountFromPrecision = this.currentCurrencySpend?.precision ?? 2;
      }
      if (this.currencyReceiveField?.valid) {
        data.currencyTo = this.currencyReceiveField?.value;
        data.amountToPrecision = this.currentCurrencyReceive?.precision ?? 2;
      }
      if (this.transactionField?.valid) {
        data.transactionType = this.transactionField?.value;
      }
      this.onDataUpdated.emit(data);
    }
  }

  private setSpendValidators(): void {
    this.amountSpendErrorMessages['min'] = `Minimal amount is ${this.currentCurrencySpend?.minAmount} ${this.currentCurrencySpend?.title}`;
    this.amountSpendField?.setValidators([
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.min(this.currentCurrencySpend?.minAmount ?? 0),
    ]);
    this.amountSpendField?.updateValueAndValidity();
  }

  private setReceiveValidators(): void {
    this.amountReceiveErrorMessages['min'] = `Minimal amount is ${this.currentCurrencyReceive?.minAmount} ${this.currentCurrencyReceive?.title}`;
    this.amountReceiveField?.setValidators([
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.min(this.currentCurrencyReceive?.minAmount ?? 0),
    ]);
    this.amountReceiveField?.updateValueAndValidity();
  }

  private onCurrencySpendUpdated(currency: string): void {
    if (!this.pTransactionChanged) {
      this.currentCurrencySpend = this.pCurrencies.find((x) => x.id === currency);
      if (this.currentCurrencySpend && this.amountSpendField?.value) {
        this.setSpendValidators();
      }
      this.pSpendChanged = true;
      this.updateCurrentAmounts();
    }
  }

  private onCurrencyReceiveUpdated(currency: string): void {
    if (!this.pTransactionChanged) {
      this.currentCurrencyReceive = this.pCurrencies.find((x) => x.id === currency);
      if (this.currentCurrencyReceive && this.amountReceiveField?.value) {
        this.setReceiveValidators();
      }
      this.pReceiveChanged = true;
      this.updateCurrentAmounts();
    }
  }

  private onAmountSpendUpdated(val: any) {
    if (val && !this.pSpendAutoUpdated) {
      this.pSpendAutoUpdated = false;
      if (this.hasValidators(this.amountSpendField as AbstractControl) === false && this.currentCurrencySpend) {
        this.setSpendValidators();
      }
      this.pSpendChanged = true;
      this.updateCurrentAmounts();
    }
    this.pSpendAutoUpdated = false;
  }

  private onAmountReceiveUpdated(val: any) {
    if (val && !this.pReceiveAutoUpdated) {
      this.pReceiveAutoUpdated = false;
      if (this.hasValidators(this.amountReceiveField as AbstractControl) === false && this.currentCurrencyReceive) {
        this.setReceiveValidators();
      }
      this.pReceiveChanged = true;
      this.updateCurrentAmounts();
    }
    this.pReceiveAutoUpdated = false;
  }

  private onTransactionUpdated(val: TransactionType): void {
    this.currentTransaction = val;
    this.pSpendAutoUpdated = true;
    this.pReceiveAutoUpdated = true;
    this.pTransactionChanged = true;
    const currencySpend = this.currentCurrencySpend?.id;
    const currencyReceive = this.currentCurrencyReceive?.id;
    this.currentCurrencySpend = this.pCurrencies.find((x) => x.id === currencyReceive);
    this.currentCurrencyReceive = this.pCurrencies.find((x) => x.id === currencySpend);
    this.setSpendValidators();
    this.setReceiveValidators();
    this.setCurrencyLists();
    this.currencySpendField?.setValue(this.currentCurrencySpend?.id);
    this.currencyReceiveField?.setValue(this.currentCurrencyReceive?.id);
    this.amountSpendField?.setValue(this.amountReceiveField?.value);

    this.pTransactionChanged = false;
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
    if (this.dataForm.valid) {
      this.onComplete.emit();
    }
  }
}
