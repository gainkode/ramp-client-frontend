import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AssetAddressShort, Rate, SettingsCurrencyWithDefaults, TransactionType, UserState } from 'model/generated-models';
import { WidgetSettings } from 'model/payment-base.model';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList } from 'model/payment.model';
import { WalletItem } from 'model/wallet.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';
import { getCurrencySign } from 'utils/utils';
import { WalletValidator } from 'utils/wallet.validator';

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
  @Input() internalPayment = true;
  @Input() quickCheckout = false;
  @Input() set errorMessage(val: string) {
  	if (val !== '') {
  		this.initialized = true;
  	}
  	this.errorMessageData = val;
  }
  @Input() settings: WidgetSettings = new WidgetSettings();
  @Input() defaultFee: number | undefined = undefined;
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() set depositRate(val: number | undefined) {
  	this.pDepositRate = val;
  	this.updateCurrentAmounts();
  	if (this.currentCurrencySpend) {
  		this.setSpendValidators();
  	}
  	if (this.currentCurrencyReceive) {
  		this.setReceiveValidators();
  	}
  }
  @Input() wallets: WalletItem[] = [];
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onWalletAddressUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onVerifyWhenPaidChanged = new EventEmitter<boolean>();
  @Output() onQuoteChanged = new EventEmitter<number>();
  @Output() onComplete = new EventEmitter<string>();

  private pInitState = true;
  private initValidators = true;
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

  errorMessageData = '';
  TRANSACTION_TYPE: typeof TransactionType = TransactionType;
  validData = false;
  transactionTypeEdit = false;  
  currentCurrencySpend: CurrencyView | undefined = undefined;
  currentCurrencyReceive: CurrencyView | undefined = undefined;
  currentTransaction: TransactionType = TransactionType.Buy;
  currentTransactionName = '';
  spendTitle = '';
  receiveTitle = '';
  spendCurrencyList: CurrencyView[] = [];
  receiveCurrencyList: CurrencyView[] = [];
  selectedWallet: WalletItem | undefined = undefined;
  filteredWallets: WalletItem[] = [];
  walletInit = false;
  addressInit = false;
  quoteExceed = false;
  quoteExceedHidden = false;
  quoteUnlimit = false;
  showWallet = false;
  showVerifyWhenPaid = false;
  currentTier = '';
  currentQuote = '';
  transactionList = QuickCheckoutTransactionTypeList;
  userAdditionalSettings: Record<string, any> = {};

  emailErrorMessages: { [key: string]: string; } = {
  	['pattern']: 'Email is not valid',
  	['required']: 'Email is required'
  };
  amountSpendErrorMessages: { [key: string]: string; } = {
  	['required']: 'Amount is required',
  	['pattern']: 'Amount must be a valid number',
  	['min']: 'Minimal amount',
  	['max']: 'Maximal amount'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
  	['required']: 'Amount is required',
  	['pattern']: 'Amount must be a valid number',
  	//['min']: 'Minimal amount'
  };
  walletErrorMessages: { [key: string]: string; } = {
  	['required']: 'Address is required'
  };

  dataForm = this.formBuilder.group({
  	email: ['',
  		{
  			validators: [
  				Validators.required,
  				Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
  			], updateOn: 'change'
  		}
  	],
  	amountSpend: [undefined, { validators: [], updateOn: 'change' }],
  	currencySpend: [null, { validators: [], updateOn: 'change' }],
  	amountReceive: [undefined, { validators: [], updateOn: 'change' }],
  	currencyReceive: [null, { validators: [], updateOn: 'change' }],
  	transaction: [TransactionType.Deposit, { validators: [], updateOn: 'change' }],
  	verifyWhenPaid: [undefined],
  	walletSelector: [undefined, { validators: [], updateOn: 'change' }],
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

  get walletSelectorField(): AbstractControl | null {
  	return this.dataForm.get('walletSelector');
  }

  get walletField(): AbstractControl | null {
  	return this.dataForm.get('wallet');
  }

  get verifyWhenPaidField(): AbstractControl | null {
  	return this.dataForm.get('verifyWhenPaid');
  }

  constructor(
  	private router: Router,
  	private auth: AuthService,
  	private commonService: CommonDataService,
  	private paymentService: PaymentDataService,
  	private errorHandler: ErrorService,
  	private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
  	const settings = this.auth.getLocalSettingsCommon();
  	const additionalSettingsRaw = settings?.additionalSettings;
  	const additionalSettings = (additionalSettingsRaw === null) ? undefined : JSON.parse(additionalSettingsRaw ?? '{}');

  	if(settings){
  		this.userAdditionalSettings = typeof settings.userAdditionalSettings == 'string' ? JSON.parse(settings.userAdditionalSettings) : settings.userAdditionalSettings;
  	}
    
  	this.showVerifyWhenPaid = true;
  	if (additionalSettings && additionalSettings.core) {
  		this.showVerifyWhenPaid = additionalSettings.core.verifyWhenPaid ?? true;
  	}

  	if (this.summary?.transactionType) {
  		this.currentTransaction = this.summary.transactionType;
  		this.transactionField?.setValue(this.currentTransaction);
  	}
  	if (this.summary?.address) {
  		this.walletField?.setValue(this.summary.address);
  		this.walletInit = false;
  		if (this.summary.address !== '') {
  			this.selectedWallet = this.wallets.find(x => x.address === this.summary?.address);
  			this.walletSelectorField?.setValue(this.summary.address);
  		}
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
  		if(this.auth.user?.kycValid){
  			this.currentQuoteEur = this.auth.user?.kycTier.amount ?? 0;
  			this.quoteUnlimit = (this.auth.user?.kycTier.amount === null);
  		}
  	} else {
  		this.currentTier = '';
  		this.currentQuoteEur = 0;
  	}
  	if (this.summary?.verifyWhenPaid) {
  		this.verifyWhenPaidField?.setValue(true);
  	}
  	this.setWalletVisible();
  	this.setAmountTitles();
  	this.currentTransactionName = QuickCheckoutTransactionTypeList.find(x => x.id === this.currentTransaction)?.name ?? this.currentTransaction;
  	this.loadDetailsForm(this.summary?.initialized ?? false);

  	this.pSubscriptions.add(this.currencySpendField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onCurrenciesUpdated(val, 'Spend')));

  	this.pSubscriptions.add(this.currencyReceiveField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onCurrenciesUpdated(val, 'Receive')));
    
  	this.pSubscriptions.add(this.amountSpendField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onAmountSpendUpdated(val)));
    
  	this.pSubscriptions.add(this.amountReceiveField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onAmountReceiveUpdated(val)));
    
  	this.pSubscriptions.add(this.transactionField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onTransactionUpdated(val)));

  	this.pSubscriptions.add(this.walletSelectorField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onWalletSelectorUpdated(val)));
      
  	this.pSubscriptions.add(this.walletField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onWalletUpdated(val)));
  }

  ngAfterViewInit(): void {
  	this.pInitState = false;
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  private loadDetailsForm(initState: boolean): void {
  	const currencyData = this.commonService.getSettingsCurrency();
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
  			const defaultFiat = currencyList?.list?.find(x => x.symbol === defaultFiatCurrency && x.fiat === true);
  			if (!defaultFiat) {
  				defaultFiatCurrency = 'EUR';
  			}
  			let currentCurrencySpendId = this.summary?.currencyFrom ?? '';
  			let currentCurrencyReceiveId = this.summary?.currencyTo ?? '';
  			const currentAmountSpend = this.summary?.amountFrom;
  			const currentAmountReceive = this.summary?.amountTo;
  			if (this.currentTransaction === TransactionType.Buy) {
  				if (currentCurrencySpendId === '') {
  					currentCurrencySpendId = defaultFiatCurrency ?? '';
  				}
  				if (currentCurrencyReceiveId === '') {
  					currentCurrencyReceiveId = defaultCryptoCurrency ?? '';
  				}
  			} else if (this.currentTransaction === TransactionType.Sell) {
  				if (currentCurrencyReceiveId === '') {
  					currentCurrencyReceiveId = defaultFiatCurrency ?? '';
  				}
  				if (currentCurrencySpendId === '') {
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
  			if (this.currentTransaction === TransactionType.Buy && this.wallets.length > 0) {
  				if (this.summary?.address !== '') {
  					this.walletField?.setValue(this.summary?.address);
  				}
  			}
  		}
  	}
  }

  private loadRates(): void {
  	const rateCurrencies = this.pCurrencies.filter(x => x.fiat === true && x.symbol !== 'EUR').map((val) => val.symbol);
  	const rateData = this.paymentService.getOneToManyRates('EUR', rateCurrencies, false);
  	this.pSubscriptions.add(
  		rateData.valueChanges.subscribe(
  			({ data }) => {
  				const rates = data.getOneToManyRates as Rate[];
  				this.pCurrencies.forEach(c => {
  					if (c.symbol === 'EUR') {
  						c.rateFactor = 1;
  					} else {
  						if (rates) {
  							const rate = rates.find(x => x.currencyTo === c.symbol);
  							if (rate) {
  								c.rateFactor = rate.depositRate;
  							}
  						}
  					}
  				});
  				this.loadTransactionsTotal();
  			}, (error) => {
  				this.onProgress.emit(false);
  				this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load exchange rate'));
  			})
  	);
  }

  private loadTransactionsTotal(): void {
  	this.transactionsTotalEur = 0;
  	const totalData = this.commonService.getMyTransactionsTotal();
  	this.pSubscriptions.add(
  		totalData.valueChanges.subscribe(({ data }) => {
  			if (data) {
  				const totalState = data.myState as UserState;
  				this.transactionsTotalEur = totalState.totalAmountEur ?? 0;
  			} else {
  				this.transactionsTotalEur = 0;
  			}
  			this.updateQuote();
  			this.onQuoteChanged.emit(this.quoteLimit);
  			this.onProgress.emit(false);
  		}, (error) => {
  			this.onProgress.emit(false);
  			this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load limits'));
  		})
  	);
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
  			defaultSpendCurrency = this.spendCurrencyList[0].symbol;
  		} else {
  			const presented = this.spendCurrencyList.find(x => x.symbol === defaultSpendCurrency);
  			if (!presented) {
  				defaultSpendCurrency = this.spendCurrencyList[0].symbol;
  			}
  		}
  		this.currencySpendField?.setValue(defaultSpendCurrency);
  		this.pSpendAutoUpdated = true;
  		this.amountSpendField?.setValue(defaultSpendAmount);
  	}
  	if (this.receiveCurrencyList.length > 0) {
  		if (defaultReceiveCurrency === '') {
  			defaultReceiveCurrency = this.receiveCurrencyList[0].symbol;
  		} else {
  			const presented = this.receiveCurrencyList.find(x => x.symbol === defaultReceiveCurrency);
  			if (!presented) {
  				defaultReceiveCurrency = this.receiveCurrencyList[0].symbol;
  			}
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
  	if (this.currentTransaction === TransactionType.Buy) {
  		this.spendCurrencyList = this.pCurrencies.filter((c) => this.filterFiat(c));
  		this.receiveCurrencyList = this.pCurrencies.filter((c) => this.filterCrypto(c));
  	} else if (this.currentTransaction === TransactionType.Sell) {
  		this.spendCurrencyList = this.pCurrencies.filter((c) => this.filterCrypto(c));
  		this.receiveCurrencyList = this.pCurrencies.filter((c) => this.filterFiat(c));
  	}
  }

  private filterFiat(c: CurrencyView): boolean {
  	let result = (c.fiat === true);
  	if (result && this.settings.fiatList.length > 0) {
  		result = (this.settings.fiatList.find(x => x === c.symbol) !== undefined);
  	}
  	return result;
  }

  private filterCrypto(c: CurrencyView): boolean {
  	let result = (c.fiat === false);
  	if (result && this.settings.cryptoList.length > 0) {
  		result = (this.settings.cryptoList.find(x => x === c.symbol) !== undefined);
  	}
  	return result;
  }

  private setWalletVisible(): void {
  	if (this.currentTransaction === TransactionType.Buy) {
  		this.showWallet = !this.settings?.walletAddressPreset;
  		if (this.showWallet) {
  			if (this.settings.transfer) {
  				this.showWallet = true;
  			} else {
  				this.showWallet = !this.settings.embedded;
  			}
  		}
  	} else {
  		this.showWallet = false;
  	}
  	if (!this.settings?.walletAddressPreset && this.userAdditionalSettings?.transactionSettings?.walletsRequired !== false) {
  		this.walletField?.setValidators([Validators.required]);
  	} else {
  		this.walletField?.setValidators([]);
  	}
  	this.walletField?.updateValueAndValidity();
  }

  private sendData(spend: number | undefined, receive: number | undefined): void {
  	if (this.pInitState === false) {
  		const data = new CheckoutSummary();
  		if (this.amountSpendField?.valid) {
  			data.amountFrom = parseFloat(this.amountSpendField?.value);
  		}
  		if (this.amountReceiveField?.valid) {
  			data.amountTo = parseFloat(this.amountReceiveField?.value);
  		}

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
  		//if (this.quoteExceedHidden) {
  		data.quoteLimit = this.quoteLimit;
  		//}
  		this.onDataUpdated.emit(data);
  	}
  }

  private setUpdatedDataRate(){
  	const data = new CheckoutSummary();
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
  	//if (this.quoteExceedHidden) {
  	data.quoteLimit = this.quoteLimit;
  	//}
  	this.onDataUpdated.emit(data);
  }

  private setSpendValidators(maxValid: number | undefined = undefined): void {
  	let minAmount = 0;
  	if(!this.currentCurrencySpend?.fiat){
  		minAmount = this.currentCurrencyReceive?.minAmount ?? 0;
  		this.amountSpendErrorMessages['min'] = `Min. amount ${minAmount} ${this.currentCurrencyReceive?.display}`;
  		if(this.pDepositRate){
  			minAmount = (minAmount/this.pDepositRate);
  		}
  	}else{
  		minAmount = this.currentCurrencySpend?.minAmount ?? 0;
  		this.amountSpendErrorMessages['min'] = `Min. amount ${minAmount} ${this.currentCurrencySpend?.display}`;
  	}

  	if (this.settings.minAmountFrom) {
  		minAmount = this.settings.minAmountFrom;
  	}
    
  	let validators = [
  		Validators.required,
  		Validators.pattern(this.pNumberPattern),
  		Validators.min(minAmount),
  	];
  	if (maxValid !== undefined) {
  		if (maxValid > 0) {
  			this.amountSpendErrorMessages['max'] = `Max. amount ${maxValid} ${this.currentCurrencySpend?.display}`;
  		} else {
  			this.amountSpendErrorMessages['max'] = 'Current wallet is empty';
  		}
  		validators = [
  			...validators,
  			Validators.max(maxValid)
  		];
  	}

  	if(!this.initValidators){
  		this.amountSpendField?.setValidators(validators);
  		this.amountSpendField?.updateValueAndValidity();
  	}
  }

  private setReceiveValidators(): void {
  	this.amountReceiveErrorMessages['min'] = `Min. amount ${this.currentCurrencyReceive?.minAmount} ${this.currentCurrencyReceive?.display}`;
  	if(!this.initValidators){
  		this.amountReceiveField?.setValidators([
  			Validators.required,
  			Validators.pattern(this.pNumberPattern),
  			//Validators.min(this.currentCurrencyReceive?.minAmount ?? 0),
  		]);
  		this.amountReceiveField?.updateValueAndValidity();
  	}
  }

  private setAmountTitles(): void {
  	if (this.currentTransaction === TransactionType.Buy) {
  		if(this.quickCheckout){
  			this.spendTitle = 'Pay';
  			this.receiveTitle = 'Receive';
  		}else{
  			this.spendTitle = 'Amount to Buy';
  			this.receiveTitle = 'Amount to Receive';
  		}
      
  	} else if (this.currentTransaction === TransactionType.Sell) {
  		this.spendTitle = 'Amount to Sell';
  		this.receiveTitle = 'Amount to Receive';
  	}
  }

  private checkWalletExisting(currency: string){
  	if(this?.userAdditionalSettings?.transactionSettings?.walletsRequired !== false){
  		if (this.summary?.transactionType === TransactionType.Sell) {
  			if (this.wallets.length > 0) {
  				if (this.addressInit) {
  					this.walletField?.setValue(this.summary.address ?? '');
  					this.walletInit = false;
  				}
  				this.filteredWallets = this.wallets.filter(x => x.asset === currency);
  			}
  			if (this.settings.embedded && !this.settings.transfer) {
  				const emptyList = (this.filteredWallets.length === 0);
  				if (emptyList) {
  					this.walletField?.setValue(this.summary.address ?? '');
  					this.errorMessageData = 'Unable to find wallets for selected currency';
  				} else {
  					this.filteredWallets.splice(0, 0, new WalletItem({
  						vaultName: '...',
  						address: '',
  						default: false
  					} as AssetAddressShort, '', undefined));
  					this.errorMessageData = '';
  				}
  			}
  		}
  
  		if (this.wallets.length > 0 && this.summary?.transactionType === TransactionType.Buy) {
  			if (this.addressInit) {
  				this.walletField?.setValue(this.summary.address ?? '');
  				this.walletInit = false;
  			}
  			this.filteredWallets = this.wallets.filter(x => x.asset === currency);
  		}
  
  		if (this.summary?.transactionType === TransactionType.Buy && this.settings.embedded && !this.settings.transfer) {
  			const emptyList = (this.filteredWallets.length === 0);
  			if (emptyList) {
  				this.walletField?.setValue(this.summary.address ?? '');
  				this.errorMessageData = 'Unable to find wallets for selected currency';
  			} else {
  				this.filteredWallets.splice(0, 0, new WalletItem({
  					vaultName: '...',
  					address: '',
  					default: false
  				} as AssetAddressShort, '', undefined));
  				this.errorMessageData = '';
  			}
  		}
  	}
    
  	// if (this.summary?.transactionType === TransactionType.Sell) {
  	//   this.pSpendChanged = true;
  	// } else {
  	//   this.pReceiveChanged = true;
  	// }
  	// this.updateCurrentAmounts();
  }

  private onCurrenciesUpdated(currency: string, typeCurrency: string): void{
  	if (!this.pTransactionChanged) {
  		if(typeCurrency == 'Spend'){
  			this.pSpendChanged = true;
  			this.currentCurrencySpend = this.pCurrencies.find((x) => x.symbol === currency);
  			if(!this.currentCurrencySpend?.fiat){
  				this.checkWalletExisting(currency);
  			}
  		}else if(typeCurrency == 'Receive'){
  			this.pReceiveChanged = true;
  			this.currentCurrencyReceive = this.pCurrencies.find((x) => x.symbol === currency);
  			if(!this.currentCurrencyReceive?.fiat){
  				this.checkWalletExisting(currency);
  			}
  		}

  		this.sendData(undefined, undefined);
  	}
  }
  
  private onAmountSpendUpdated(val: any) {
  	if (val && !this.pSpendAutoUpdated) {
  		if(this.initValidators){
  			this.initValidators = false;
  			if (this.currentCurrencySpend) {
  				this.setSpendValidators();
  			}
  			if (this.currentCurrencyReceive) {
  				this.setReceiveValidators();
  			}
  		}
  		this.pSpendChanged = true;

  		this.updateCurrentAmounts();
  	}
  	this.pSpendAutoUpdated = false;
  }

  private onAmountReceiveUpdated(val: any) {
  	if (val && !this.pReceiveAutoUpdated) {
  		if(this.initValidators){
  			this.initValidators = false;
  			if (this.currentCurrencySpend) {
  				this.setSpendValidators();
  			}
  			if (this.currentCurrencyReceive) {
  				this.setReceiveValidators();
  			}
  		}
  		this.pReceiveChanged = true;

  		this.updateCurrentAmounts();
  	}
  	this.pReceiveAutoUpdated = false;
  }

  private onTransactionUpdated(val: TransactionType): void {
  	this.currentTransaction = val;
  	this.currentTransactionName = QuickCheckoutTransactionTypeList.find(x => x.id === this.currentTransaction)?.name ?? this.currentTransaction;
  	this.setAmountTitles();
  	this.pSpendAutoUpdated = true;
  	this.pReceiveAutoUpdated = true;
  	this.pTransactionChanged = true;
  	const currencySpend = this.currentCurrencySpend?.symbol;
  	const currencyReceive = this.currentCurrencyReceive?.symbol;
  	this.currentCurrencySpend = this.pCurrencies.find((x) => x.symbol === currencyReceive);
  	this.currentCurrencyReceive = this.pCurrencies.find((x) => x.symbol === currencySpend);
  	this.setSpendValidators();
  	this.setReceiveValidators();
  	this.setCurrencyLists();
  	this.currencySpendField?.setValue(this.currentCurrencySpend?.symbol);
  	this.currencyReceiveField?.setValue(this.currentCurrencyReceive?.symbol);
  	this.amountSpendField?.setValue(this.amountReceiveField?.value);
  	this.setWalletVisible();
  	this.pTransactionChanged = false;
  }

  private onWalletSelectorUpdated(val: string): void {
  	this.walletField?.setValue(val);
  }

  private onWalletUpdated(val: string): void {
  	//    const proceed = this.showWallet || !this.settings.transfer;
  	//    if (proceed) {
  	this.walletInit = true;
  	this.selectedWallet = this.wallets.find(x => x.address === val);
  	if (!this.selectedWallet) {
  		this.selectedWallet = this.filteredWallets.find(x => x.address === val);
  	}
  	//    }
  	if (this.selectedWallet && this.summary?.transactionType === TransactionType.Sell) {
  		this.initValidators = false;
  		this.setSpendValidators(this.selectedWallet.total);
  	}
  	const data: CheckoutSummary = new CheckoutSummary();
  	if (this.selectedWallet) {
  		data.address = this.selectedWallet?.address ?? '';
  		data.vaultId = this.selectedWallet?.id ?? '';
  	} else {
  		data.address = val;
  		data.vaultId = '';
  	}
  	this.onWalletAddressUpdated.emit(data);
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
  	this.validData = false;
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
  	if (this.currentTransaction === TransactionType.Buy && this.currentQuoteEur !== 0) {
  		const c = this.pCurrencies.find(x => x.symbol === this.currentCurrencySpend?.symbol);
  		if (c) {
  			this.quoteLimit = (this.currentQuoteEur - this.transactionsTotalEur) * c.rateFactor;
  			this.currentQuote = `${getCurrencySign(this.currentCurrencySpend?.display ?? '')}${this.quoteLimit.toFixed(c.precision)}`;
  		}
  	} else if (this.currentTransaction === TransactionType.Sell && this.currentQuoteEur !== 0) {
  		const c = this.pCurrencies.find(x => x.symbol === this.currentCurrencyReceive?.symbol);
  		if (c) {
  			const rate = (this.pDepositRate ?? 1) / c.rateFactor;
  			this.quoteLimit = (this.currentQuoteEur - this.transactionsTotalEur) / rate;
  			this.currentQuote = `${getCurrencySign(this.currentCurrencySpend?.display ?? '')}${this.quoteLimit.toFixed(c.precision)}`;
  		}
  	}
  }

  private updateAmounts(spend: number | undefined, receive: number | undefined): void {
  	this.updateQuote();
  	this.validData = false;
  	let dst = 0;
  	if (this.pReceiveChanged) {
  		if (this.currentTransaction === TransactionType.Buy) {
  			if (receive && this.pDepositRate) {
  				const receiveWithouFee = this.defaultFee ? (receive + receive/100 * this.defaultFee) : receive;
  				dst = receiveWithouFee * this.pDepositRate;
  				this.validData = true;
  			}
  		} else if (this.currentTransaction === TransactionType.Sell) {
  			if (receive && this.pDepositRate) {
  				const rate = this.pDepositRate;
  				if (rate === 0) {
  					dst = 0;
  				} else {
  					const receiveWithouFee = this.defaultFee ? (receive + receive/100 * this.defaultFee) : receive;
  					dst = receiveWithouFee / this.pDepositRate;
  				}
  				this.validData = true;
  			}
  		}
  		if (dst > 0) {
  			const val = dst.toFixed(this.currentCurrencySpend?.precision);
  			spend = Number.parseFloat(val);
  			this.pSpendAutoUpdated = true;
  			this.amountSpendField?.setValue(val);
  		}
  	}
  	if (this.pSpendChanged) {
  		if (this.currentTransaction === TransactionType.Buy) {
  			if (spend && this.pDepositRate) {
  				const rate = this.pDepositRate;
  				if (rate === 0) {
  					dst = 0;
  				} else {
  					const spendWithouFee = this.defaultFee ? (spend - spend/100 * this.defaultFee) : spend;
  					dst = spendWithouFee / rate;
  				}
  				this.validData = true;
  			}
  		} else if (this.currentTransaction === TransactionType.Sell) {
  			if (spend && this.pDepositRate) {
  				const spendWithouFee = this.defaultFee ? (spend - spend/100 * this.defaultFee) : spend;
  				dst = spendWithouFee * this.pDepositRate;
  				this.validData = true;
  			}
  		}
  		if (dst > 0) {
  			const val = dst.toFixed(this.currentCurrencyReceive?.precision);
  			receive = Number.parseFloat(val);
  			this.pReceiveAutoUpdated = true;
  			this.amountReceiveField?.setValue(val);
  		}
  	}
  	this.quoteExceedHidden = false;
  	if (this.currentTransaction == TransactionType.Buy) {
  		const amount = this.amountSpendField?.value ?? 0;
  		if (amount > 0 && amount > this.quoteLimit && !this.quoteUnlimit) {
  			this.quoteExceedHidden = true;
  		}
  	} else if (this.currentTransaction == TransactionType.Sell) {
  		const amount = this.amountSpendField?.value ?? 0;
  		if (amount > 0 && amount > this.quoteLimit && !this.quoteUnlimit) {
  			this.quoteExceedHidden = true;
  		}
  	}
  	this.quoteExceed = (this.settings.embedded) ?
  		this.quoteExceedHidden || (this.quoteLimit === 0 && !this.quoteUnlimit) :
  		false;
  	this.pSpendChanged = false;
  	this.pReceiveChanged = false;
  	this.sendData(spend, receive);
  }

  showPersonalVerification(): void {
  	this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
  		window.location.reload();
  	});
  }

  sendAll(): void {
  	this.amountSpendField?.setValue(this.selectedWallet?.total);
  }

  onSubmit(): void {
  	this.onProgress.emit(true);
  	if (this.dataForm.valid) {
  		if (this.auth.user) {
  			if (this.auth.user.email !== this.emailField?.value) {
  				this.auth.logout();
  				return;
  			}
  		}
  		this.initialized = false;
  		this.onVerifyWhenPaidChanged.emit(this.verifyWhenPaidField?.value ?? false);
  		this.onComplete.emit(this.emailField?.value);
  	}
  }
}
