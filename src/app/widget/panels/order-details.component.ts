import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Rate, SettingsCurrencyWithDefaults, TransactionType, UserState } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList, WidgetSettings } from 'src/app/model/payment.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { getCryptoSymbol } from 'src/app/utils/utils';
import { WalletValidator } from 'src/app/utils/wallet.validator';

@Component({
  selector: 'app-widget-order-details',
  templateUrl: 'order-details.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss'
  ]
})
export class WidgetOrderDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() initialized = false;
  @Input() errorMessage = '';
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
  @Input() wallets: WalletItem[] = [];
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onWalletAddressUpdated = new EventEmitter<string | undefined>();
  @Output() onComplete = new EventEmitter<string>();

  private pInitState = true;
  private showWallet = true;
  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];
  private pSpendChanged = false;
  private pReceiveChanged = false;
  private pTransactionChanged = false;
  private pSpendAutoUpdated = false;
  private pReceiveAutoUpdated = false;
  private currentQuoteEur = 0;
  private quoteLimit = 0;
  private transactionsTotalEur = 0;
  private pWithdrawalRate: number | undefined = undefined;
  private pDepositRate: number | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  validData = false;
  transactionTypeEdit = false;
  currentCurrencySpend: CurrencyView | undefined = undefined;
  currentCurrencyReceive: CurrencyView | undefined = undefined;
  currentTransaction: TransactionType = TransactionType.Deposit;
  currentTransactionName = '';
  spendCurrencyList: CurrencyView[] = [];
  receiveCurrencyList: CurrencyView[] = [];
  selectedWallet: WalletItem | undefined = undefined;
  filteredWallets: WalletItem[] = [];
  walletInit = false;
  addressInit = false;
  quoteExceed = false;
  quoteExceedHidden = false;
  currentTier = '';
  currentQuote = '';
  transactionList = QuickCheckoutTransactionTypeList;

  emailErrorMessages: { [key: string]: string; } = {
    ['pattern']: 'Email is not valid',
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
  walletErrorMessages: { [key: string]: string; } = {
    ['required']: 'Address is required'
  };

  dataForm = this.formBuilder.group({
    email: ['',
      {
        validators: [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
        ], updateOn: 'change'
      }
    ],
    amountSpend: [undefined, { validators: [], updateOn: 'change' }],
    currencySpend: [null, { validators: [], updateOn: 'change' }],
    amountReceive: [undefined, { validators: [], updateOn: 'change' }],
    currencyReceive: [null, { validators: [], updateOn: 'change' }],
    transaction: [TransactionType.Deposit, { validators: [], updateOn: 'change' }],
    wallet: [undefined, { validators: [], updateOn: 'change' }]
  }, {
    validators: [
      WalletValidator.addressValidator(
        'wallet',
        'currencyReceive',
        'transaction'
      ),
    ],
    updateOn: 'change',
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

  get walletField(): AbstractControl | null {
    return this.dataForm.get('wallet');
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private commonService: CommonDataService,
    private paymentService: PaymentDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    if (this.summary?.transactionType) {
      this.currentTransaction = this.summary.transactionType;
      this.transactionField?.setValue(this.currentTransaction);
    }
    if (this.summary?.address) {
      this.walletField?.setValue(this.summary.address);
      this.walletInit = false;
    }
    if (this.summary?.email) {
      this.emailField?.setValue(this.summary.email);
    }
    if (this.summary?.initialized) {
      this.currentTransaction = this.summary.transactionType;
      this.transactionField?.setValue(this.summary.transactionType);
    }
    if (this.auth.user?.kycTier) {
      this.currentTier = this.auth.user?.kycTier.name;
      this.currentQuoteEur = this.auth.user?.kycTier.amount ?? 0;
    } else {
      this.currentTier = '';
      this.currentQuoteEur = 0;
    }
    this.setWalletVisible();
    this.currentTransactionName = QuickCheckoutTransactionTypeList.find(x => x.id === this.currentTransaction)?.name ?? this.currentTransaction;
    this.loadDetailsForm(this.summary?.initialized ?? false);
    this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
    this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));
    this.pSubscriptions.add(this.amountSpendField?.valueChanges.subscribe(val => this.onAmountSpendUpdated(val)));
    this.pSubscriptions.add(this.amountReceiveField?.valueChanges.subscribe(val => this.onAmountReceiveUpdated(val)));
    this.pSubscriptions.add(this.transactionField?.valueChanges.subscribe(val => this.onTransactionUpdated(val)));
    this.pSubscriptions.add(this.walletField?.valueChanges.subscribe(val => this.onWalletUpdated(val)));
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
          ({ data }) => {
            this.loadCurrencyList(data.getSettingsCurrency as SettingsCurrencyWithDefaults, initState);
            if (this.auth.authenticated) {
              this.loadRates();
            } else {
              this.onProgress.emit(false);
            }
          },
          (error) => {
            this.onProgress.emit(false);
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load available list of currency types'));
          })
      );
    }
  }

  private loadCurrencyList(currencySettings: SettingsCurrencyWithDefaults, initState: boolean) {
    let itemCount = 0;
    this.pCurrencies = [];
    if (currencySettings !== null) {
      const currencyList = currencySettings.settingsCurrency;
      let defaultFiatCurrency = this.auth.user?.defaultFiatCurrency ?? '';
      if (defaultFiatCurrency === '') {
        defaultFiatCurrency = 'EUR';
      }
      let defaultCryptoCurrency = this.auth.user?.defaultCryptoCurrency ?? '';
      if (defaultCryptoCurrency === '') {
        defaultCryptoCurrency = 'BTC';
      }
      itemCount = currencyList?.count as number;
      if (itemCount > 0) {
        const defaultFiat = currencyList?.list?.find(x => x.symbol === defaultFiatCurrency && x.fiat === true)
        if (!defaultFiat) {
          defaultFiatCurrency = 'EUR';
        }
        let currentCurrencySpendId = this.summary?.currencyFrom ?? '';
        let currentCurrencyReceiveId = this.summary?.currencyTo ?? '';
        let currentAmountSpend = this.summary?.amountFrom;
        let currentAmountReceive = this.summary?.amountTo;
        if (this.currentTransaction === TransactionType.Deposit) {
          if (currentCurrencySpendId === '') {
            currentCurrencySpendId = defaultFiatCurrency ?? '';
          }
          if (currentCurrencyReceiveId === '') {
            currentCurrencyReceiveId = defaultCryptoCurrency ?? '';
          }
        } else if (this.currentTransaction === TransactionType.Withdrawal) {
          if (currentCurrencySpendId === '') {
            currentCurrencyReceiveId = defaultFiatCurrency ?? '';
          }
          if (currentCurrencyReceiveId === '') {
            currentCurrencySpendId = defaultCryptoCurrency ?? '';
          }
        }
        this.pCurrencies = currencyList?.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
        this.addressInit = false;
        this.setCurrencyValues(
          initState,
          currentCurrencySpendId,
          currentCurrencyReceiveId,
          currentAmountSpend,
          currentAmountReceive);
        this.addressInit = true;
        if (this.currentTransaction === TransactionType.Deposit && this.wallets.length > 0) {
          if (this.summary?.address !== '') {
            this.walletField?.setValue(this.summary?.address);
          }
        }
      }
    }
  }

  private loadRates(): void {
    const rateCurrencies = this.pCurrencies.filter(x => x.fiat === true && x.id !== 'EUR').map((val) => val.id);
    const rateData = this.paymentService.getOneToManyRates('EUR', rateCurrencies, false);
    if (rateData === null) {
      this.onProgress.emit(false);
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.pSubscriptions.add(
        rateData.valueChanges.subscribe(
          ({ data }) => {
            const rates = data.getOneToManyRates as Rate[];
            this.pCurrencies.forEach(c => {
              if (c.id === 'EUR') {
                c.rateFactor = 1;
              } else {
                const rate = rates.find(x => x.currencyTo === c.id);
                if (rate) {
                  c.rateFactor = rate.depositRate;
                }
              }
            });
            this.loadTransactionsTotal();
          },
          (error) => {
            this.onProgress.emit(false);
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load exchange rate'));
          })
      );
    }
  }

  private loadTransactionsTotal(): void {
    this.transactionsTotalEur = 0;
    const totalData = this.commonService.getMyTransactionsTotal();
    if (totalData === null) {
      this.onProgress.emit(false);
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.pSubscriptions.add(
        totalData.valueChanges.subscribe(({ data }) => {
          const totalState = data.myState as UserState;
          this.transactionsTotalEur = totalState.totalAmountEur ?? 0;
          this.updateQuote();
          this.onProgress.emit(false);
        }, (error) => {
          this.onProgress.emit(false);
          this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load exchange rate'));
        })
      );
    }
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

  private setWalletVisible(): void {
    if (this.currentTransaction === TransactionType.Deposit) {
      this.showWallet = (!this.settings.walletAddress);
    } else {
      this.showWallet = false;
    }
    if (this.showWallet) {
      this.walletField?.setValidators([Validators.required]);
    } else {
      this.walletField?.setValidators([]);
    }
    this.walletField?.updateValueAndValidity();
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
      if (this.walletField?.valid && this.showWallet) {
        data.address = this.walletField?.value;
      }
      if (this.quoteExceedHidden) {
        data.quoteLimit = this.quoteLimit;
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
      this.pReceiveChanged = true;
      this.updateCurrentAmounts();
    }
  }

  private onCurrencyReceiveUpdated(currency: string): void {
    if (!this.pTransactionChanged) {
      this.currentCurrencyReceive = this.pCurrencies.find((x) => x.id === currency);
      if (this.currentCurrencyReceive && this.amountReceiveField?.value) {
        this.setReceiveValidators();
      }
      if (this.wallets.length > 0) {
        if (this.summary?.transactionType === TransactionType.Deposit) {
          if (this.addressInit) {
            this.walletField?.setValue('');
            this.walletInit = false;
          }
          this.filteredWallets = this.wallets.filter(x => x.asset === currency);
        }
      }
      this.pSpendChanged = true;
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
    this.currentTransactionName = QuickCheckoutTransactionTypeList.find(x => x.id === this.currentTransaction)?.name ?? this.currentTransaction;
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
    this.setWalletVisible();

    this.pTransactionChanged = false;
  }

  private onWalletUpdated(val: string): void {
    if (this.showWallet) {
      this.walletInit = true;
      this.selectedWallet = this.wallets.find(x => x.address === val);
      this.onWalletAddressUpdated.emit(this.walletField?.value);
    }
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

  private updateQuote(): void {
    this.currentQuote = '';
    if (this.currentTransaction === TransactionType.Deposit && this.currentQuoteEur !== 0) {
      const c = this.pCurrencies.find(x => x.id === this.currentCurrencySpend?.id);
      if (c) {
        this.quoteLimit = (this.currentQuoteEur - this.transactionsTotalEur) * c.rateFactor;
        this.currentQuote = `${getCryptoSymbol(this.currentCurrencySpend?.id ?? '')}${this.quoteLimit.toFixed(2)}`;
      }
    }
  }

  private updateAmounts(spend: number | undefined, receive: number | undefined): void {
    this.updateQuote();
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
    this.quoteExceedHidden = false;
    if (this.currentTransaction == TransactionType.Deposit) {
      const amount = this.amountSpendField?.value ?? 0;
      if (amount > 0 && amount > this.quoteLimit) {
        this.quoteExceedHidden = true;
      }
    }
    this.quoteExceed = (this.settings.embedded) ? this.quoteExceedHidden : false;
    this.pSpendChanged = false;
    this.pReceiveChanged = false;
    this.sendData(spend, receive);
  }

  showPersonalVerification(): void {
    this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
      window.location.reload();
    });
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      if (this.auth.user) {
        if (this.auth.user.email !== this.emailField?.value) {
          this.auth.logout();
        }
      }
      this.onComplete.emit(this.emailField?.value);
    }
  }
}
