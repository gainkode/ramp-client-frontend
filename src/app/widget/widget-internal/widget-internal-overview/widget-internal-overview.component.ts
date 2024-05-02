import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Validators, AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HashMap, LangDefinition, TranslateParams, TranslocoService } from '@ngneat/transloco';
import { TransactionType, SettingsCurrencyWithDefaults, Rate, UserState, AssetAddressShort, User } from 'model/generated-models';
import { WidgetSettings } from 'model/payment-base.model';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList } from 'model/payment.model';
import { WalletItem } from 'model/wallet.model';
import { Subject, Subscription, distinctUntilChanged, take, takeUntil } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';
import { getCurrencySign } from 'utils/utils';
import { WalletValidator } from 'utils/wallet.validator';
import { EnvService } from 'services/env.service';
import { ThemeService } from 'services/theme-service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-widget-internal-overview',
	templateUrl: './widget-internal-overview.component.html',
	styleUrls: ['./widget-internal-overview.component.scss']
})
export class WidgetEmbeddedOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isSinglePage = false;
  @Input() initialized = false;
  @Input() quickCheckout = false;

  @Input() set errorMessage(val: string) {
  	if (val !== '') {
  		this.initialized = true;
  	}
  	this.errorMessageData = val;
  }
  @Input() set isOrderDetailsComplete(val: boolean) {
  	if (!val && !this.isSecondPartActive && !this.hideProceedButton) {
  		this.isSecondPartActive = true;
  	}
  }

  @Input() settings: WidgetSettings = new WidgetSettings();
  @Input() defaultFee: number | undefined = undefined;
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() set depositRate(val: number | undefined) {
  	this.pDepositRate = val;
  	this.updateCurrentAmounts();

  	if (this.currentCurrencySpend) {
  		this.setSpendValidators(this.maxSellAmount);
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
  USER: User = undefined;
  availableLangs: LangDefinition[];
  activeLang: string;
  
  logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
  logoAlt = EnvService.product;

  hideProceedButton = true;
  isSecondPartActive = false;

  private pInitState = true;
  private initValidators = true;
  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];
  private pSpendChanged = false;
  private pReceiveChanged = false;
  private pTransactionChanged = false;
  private amountReceiveChanged = false;
  private pSpendAutoUpdated = false;
  private pReceiveAutoUpdated = false;
  private currentQuoteEur = 0;
  private quoteLimit = 0;
  private transactionsTotalEur = 0;
  private pDepositRate: number | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
	maxSellAmount!: number;
  errorMessageData = '';
  TRANSACTION_TYPE: typeof TransactionType = TransactionType;
  validData = false;
  mobileSummary = false;
  currentCurrencySpend: CurrencyView | undefined = undefined;
  currentCurrencyReceive: CurrencyView | undefined = undefined;
  currentTransaction: TransactionType = TransactionType.Buy;
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
  isMasked = false;
  currentTier = '';
  currentQuote = '';
  transactionList = QuickCheckoutTransactionTypeList;
  userAdditionalSettings: Record<string, any> = {};
  emailErrorMessages: { [key: string]: string; } = {
  	['pattern']: 'widget-internal-overview.field_email-error-pattern',
  	['required']: 'widget-internal-overview.field-email-error-required'
  };
  amountSpendErrorMessages: { [key: string]: string; } = {
  	['required']: 'widget-internal-overview.field_receive-error-required',
  	['pattern']: 'widget-internal-overview.field_receive-error-pattern',
  	['min']: 'widget-internal-overview.field_spend-error-min',
  	['max']: 'widget-internal-overview.field_spend-error-max'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
  	['required']: 'widget-internal-overview.field_receive-error-required',
  	['pattern']: 'widget-internal-overview.field_receive-error-pattern',
  };
  walletErrorMessages: { [key: string]: string; } = {
  	['required']: 'widget-internal-overview.field_wallet-error-required'
  };

  dataForm = this.formBuilder.group({
  	email: ['',
  		{
  			validators: [
  				Validators.required,
  				Validators.email,
  				Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
  			], updateOn: 'change'
  		}
  	],
  	amountSpend: [undefined, { validators: [], updateOn: 'change' }],
  	amountReceive: [undefined, { validators: [], updateOn: 'change' }],
  	currencySpend: [null, { validators: [], updateOn: 'change' }],
  	currencyReceive: [null, { validators: [], updateOn: 'change' }],
  	transaction: [TransactionType.Deposit, { validators: [], updateOn: 'change' }],
  	verifyWhenPaid: [undefined],
  	walletSelector: [undefined, { validators: [], updateOn: 'change' }],
  	wallet: [undefined, { validators: [], updateOn: 'change' }]
  });

  termsLink = EnvService.terms_link;
  privacyLink = EnvService.privacy_link;
  isBuyButton = false;
  isSellButton = false;
  
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

  get isOrderDetailsFormValid(): boolean {
  	if (this.currentTransaction === this.TRANSACTION_TYPE.Buy) {
  		return this.dataForm.valid &&  this.amountSpendField.value &&  this.emailField?.valid && this.walletField?.valid;
  	} else if (this.currentTransaction === this.TRANSACTION_TYPE.Sell) {
  		return this.amountSpendField.valid && this.amountSpendField.value &&this.emailField?.valid;
  	}

  	return false;
  }

  get isOrderProceedFormValid(): boolean {
  	if (this.isSinglePage) {
  		return this.isOrderDetailsFormValid;
  	}

  	return this.amountSpendField.valid && this.amountSpendField.value;
  }

  public t: <T = string>(key: TranslateParams, params?: HashMap, lang?: string) => T;
	private readonly destroy$ = new Subject<void>();
  constructor(
  	public transloco: TranslocoService,
  	private router: Router,
  	private auth: AuthService,
  	private commonService: CommonDataService,
  	private paymentService: PaymentDataService,
  	private errorHandler: ErrorService,
  	private formBuilder: UntypedFormBuilder,
		private profileService: ProfileDataService,
  	public themeService: ThemeService) {
  	this.availableLangs = <LangDefinition[]>transloco.getAvailableLangs();
  	const activeLangId = transloco.getActiveLang();
  	this.activeLang = this.availableLangs.find(l => l.id === activeLangId).label;
	
  	this.USER = this.auth.user;
  	this.t = transloco.translate.bind(transloco);
  }

  ngOnInit(): void {
  	const settings = this.auth.getLocalSettingsCommon();
  	const additionalSettingsRaw = settings?.additionalSettings;
  	const additionalSettings = (additionalSettingsRaw === null) ? undefined : JSON.parse(additionalSettingsRaw ?? '{}');
  	const {
  		transactionType,
  		address,
  		email,
  		initialized,
  		verifyWhenPaid
  	} = this.summary || {};
  	const {
  		kycTier,
  		kycValid
  	} = this.USER || {};

  	if (settings){
  		this.userAdditionalSettings = typeof settings.userAdditionalSettings == 'string' ? JSON.parse(settings.userAdditionalSettings) : settings.userAdditionalSettings;
  	}
	
  	this.isMasked = this.settings.masked;

	this.isBuyButton = this.settings.transactionTypes?.length === 0 || this.settings.transactionTypes.includes(this.TRANSACTION_TYPE.Buy);
	this.isSellButton = this.settings.transactionTypes?.length === 0 || this.settings.transactionTypes.includes(this.TRANSACTION_TYPE.Sell);

  	this.showVerifyWhenPaid = additionalSettings?.core?.verifyWhenPaid || true;

  	if (transactionType) {
  		this.currentTransaction = transactionType;
  		this.transactionField?.setValue(transactionType);
  	}

  	if (address) {
  		this.walletField?.setValue(address);
  		this.walletInit = false;
  		if (address !== '') {
				this.selectedWallet = this.wallets.find(x => x.address === address);
				this.walletSelectorField?.setValue(address);
  		}
  	}

  	if (email) {
  		this.emailField?.setValue(email);
  	}
  	
  	if (initialized) {
  		this.currentTransaction = transactionType;
  		this.transactionField?.setValue(transactionType);
  	}
  	
  	if (kycTier) {
  		this.currentTier = kycTier.name;
  		if (kycValid) {
				this.currentQuoteEur = kycTier.amount || 0;
				this.quoteUnlimit = kycTier.amount === null;
  		}
  	} else {
  		this.currentTier = '';
  		this.currentQuoteEur = 0;
  	}
  	
  	if (verifyWhenPaid) {
  		this.verifyWhenPaidField?.setValue(true);
  	}

  	this.setWalletVisible();
  	this.setAmountTitles();
  	
  	this.loadDetailsForm(initialized ?? false);

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
		this.destroy$.next();
		this.destroy$.complete();
  }

  toggleTransationType(type: TransactionType): void {
  	this.onTransactionUpdated(type);
  }

  private loadDetailsForm(initState: boolean): void {
  	const currencyData = this.commonService.getSettingsCurrency();
  	this.onProgress.emit(true);
  	this.pSubscriptions.add(
  		currencyData.valueChanges.subscribe(
  			({ data }) => {
  				this.loadCurrencyList(data.getSettingsCurrency as SettingsCurrencyWithDefaults, initState);
  				
  				if (this.auth.authenticated && this.USER.email === this.emailField?.value && this.settings.embedded) {
  					this.loadRates();
  					this.loadTransactionsTotal();
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

  private loadCurrencyList(currencySettings: SettingsCurrencyWithDefaults, initState: boolean): void {
  	let itemCount = 0;
  	this.pCurrencies = [];

  	if (currencySettings !== null) {
  		const currencyList = currencySettings.settingsCurrency;

  		let defaultFiatCurrency = this.USER?.defaultFiatCurrency || 'EUR';
  		const defaultCryptoCurrency = this.USER?.defaultCryptoCurrency || 'BTC';

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
  				currentCurrencySpendId = currentCurrencySpendId || defaultFiatCurrency;
  				currentCurrencyReceiveId = currentCurrencyReceiveId || defaultCryptoCurrency;
  			} else if (this.currentTransaction === TransactionType.Sell) {
  				currentCurrencyReceiveId = currentCurrencyReceiveId || defaultFiatCurrency;
  				currentCurrencySpendId = currentCurrencySpendId || defaultCryptoCurrency;
  			}

  			this.pCurrencies = currencyList?.list?.map(val => new CurrencyView(val)) || [];
			
			this.dataForm.setValidators(
				WalletValidator.addressValidator(
					'wallet',
					'currencyReceive',
					'transaction',
					this.pCurrencies
				)
			);

  			this.addressInit = false;
			
  			this.setCurrencyValues(
  				initState,
  				currentCurrencySpendId,
  				currentCurrencyReceiveId,
  				currentAmountSpend,
  				currentAmountReceive
  			);

  			this.addressInit = true;

  			if (this.currentTransaction === TransactionType.Buy && this.wallets.length > 0 && this.summary?.address) {
  				this.walletField?.setValue(this.summary?.address);
  			}
  		}
  	}
  }

  private loadRates(): void {
  	const rateCurrencies = this.pCurrencies.filter(x => x.fiat && x.symbol !== 'EUR').map((val) => val.symbol);
  	const rateData = this.paymentService.getOneToManyRates('EUR', rateCurrencies, false);

  	this.pSubscriptions.add(
  		rateData.valueChanges.subscribe(
  			({ data }) => {
  				const rates = data.getOneToManyRates as Rate[];

  				this.pCurrencies.forEach(c => {
  					if (c.symbol === 'EUR') {
  						c.rateFactor = 1;
  					} else {
  						const rate = rates?.find(x => x.currencyTo === c.symbol);
  						if (rate) {
						  	c.rateFactor = rate.depositRate;
  						}
  					}
  				});
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
  	if (this.currentTransaction === TransactionType.Buy || this.currentTransaction === TransactionType.Sell) {
  		const isBuy = this.currentTransaction === TransactionType.Buy;
	
  		this.spendCurrencyList = this.pCurrencies.filter(c => isBuy ? this.filterFiat(c) : this.filterCrypto(c));
  		this.receiveCurrencyList = this.pCurrencies.filter(c => {
  			if (isBuy) {
  				return this.isMasked ? this.filterMaskedCrypto(c) : this.filterCrypto(c);
  			}

  			return this.filterFiat(c);
  		});
  	}
  }

  private filterFiat(c: CurrencyView): boolean {
  	return c.fiat && (this.settings.fiatList.length === 0 || this.settings.fiatList.includes(c.symbol));
  }

  private filterMaskedCrypto(c: CurrencyView): boolean {
  	return c.fiat && this.isInCryptoList(c);
  }

  private filterCrypto(c: CurrencyView): boolean {
  	return !c.fiat && this.isInCryptoList(c);
  }

  private isInCryptoList(c: CurrencyView): boolean {
  	return this.settings.cryptoList.length === 0 || this.settings.cryptoList.includes(c.symbol);
  }

  private setWalletVisible(): void {
  	switch (this.currentTransaction) {
  		case TransactionType.Buy:
  			this.showWallet = !this.settings?.walletAddressPreset ? (this.settings.transfer || !this.settings.embedded) : false;
  			break;
  		case TransactionType.Sell:
  			this.showWallet = false;
  			break;
  	}

  	if (!this.settings?.walletAddressPreset && this.userAdditionalSettings?.transactionSettings?.walletsRequired !== false) {
  		this.walletField?.setValidators([Validators.required]);
  	} else {
  		this.walletField?.setValidators([]);
  	}
	
  	this.walletField?.updateValueAndValidity();
  }

  private sendData(): void {
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
  		if (this.currentTransaction) {
  			data.transactionType = this.currentTransaction;
  		}
  		if (this.walletField?.valid && this.showWallet) {
  			data.address = this.walletField?.value;
  		}
  	
  		data.quoteLimit = this.quoteLimit;

  		this.onDataUpdated.emit(data);
  	}
  }

  private setSpendValidators(maxValid: number | undefined = undefined): void {
  	let minAmount = this.currentCurrencySpend?.minAmount ?? 0;
  	let currencyDisplay = this.currentCurrencySpend?.display;

  	let maxAmount = this.currentCurrencySpend?.maxAmount ?? 0;
  	let minAmountDisplay = this.currentCurrencySpend?.minAmount ?? 0;

  	let maxAmountDisplay = this.currentCurrencySpend?.maxAmount ?? 0;
  
  	if(!this.currentCurrencySpend?.fiat){
  		currencyDisplay = this.currentCurrencyReceive?.display;

  		if (this.pDepositRate) {
  			minAmountDisplay = parseFloat((minAmount * this.pDepositRate).toFixed(2));
  		}
  	}

  	if(this.settings.currencyAmounts?.length !== 0){
  		const currencyAmount = this.settings.currencyAmounts.find(item => item.currency === this.currentCurrencySpend?.display);
			const calculateDisplayAmount = (amount: number, rate: number): number =>
				!this.currentCurrencySpend?.fiat && rate
					? parseFloat((amount * rate).toFixed(2))
					: amount;

			if (currencyAmount) {
				minAmount = currencyAmount.minAmount || minAmount;
				minAmountDisplay = calculateDisplayAmount(minAmount, this.pDepositRate);

				maxAmount = currencyAmount.maxAmount || maxAmount;
				maxAmountDisplay = calculateDisplayAmount(maxAmount, this.pDepositRate);
			}
  	}
	
  	this.amountSpendErrorMessages['min'] = `Min. amount ${minAmountDisplay} ${currencyDisplay}`;
		
  	let validators = [
  		Validators.required,
  		Validators.pattern(this.pNumberPattern),
  		Validators.min(minAmount),
  	];

  
  	if(!maxAmount || maxAmount === 0){
			console.log(maxValid)
  		if (maxValid !== undefined) {
				this.amountSpendErrorMessages['max'] = maxValid > 0 
					? this.t(this.amountSpendErrorMessages['max'],{ value: `${maxValid} ${currencyDisplay}` }) 
					: 'widget-internal-overview.spend-max-empty';

  			validators = [
  				...validators,
  				Validators.max(maxValid)
  			];
  		}
  	} else {
			this.amountSpendErrorMessages['max'] = this.t(this.amountSpendErrorMessages['max'],{ value: `${maxAmountDisplay} ${currencyDisplay}` });
			
			validators = [
				...validators,
				Validators.max(maxAmount)
			];
  	}
		
  	if(!this.initValidators){
  		this.amountSpendField?.setValidators(validators);
  		this.amountSpendField?.updateValueAndValidity();
  	}
  }
  
  private setReceiveValidators(): void {
  	this.amountReceiveErrorMessages['min'] =  `Min. amount ${this.currentCurrencyReceive?.minAmount} ${this.currentCurrencyReceive?.display}`
  	
		if(!this.initValidators){
  		this.amountReceiveField?.setValidators([
  			Validators.required,
  			Validators.pattern(this.pNumberPattern),
  		]);

  		this.amountReceiveField?.updateValueAndValidity();
  	}
  }

  private setAmountTitles(): void {
  	if (this.currentTransaction === TransactionType.Buy) {
  		if(this.quickCheckout){
  			this.spendTitle = 'widget-internal-overview.buy-spend-title';
  			this.receiveTitle = 'widget-internal-overview.buy-receive-title';
  		} else {
  			this.spendTitle = 'widget-internal-overview.buy-spend-q-title';
  			this.receiveTitle = 'widget-internal-overview.buy-receive-q-title';
  		}
      
  	} else if (this.currentTransaction === TransactionType.Sell) {
  		this.spendTitle = 'widget-internal-overview.sell-spend-title';
  		this.receiveTitle = 'widget-internal-overview.sell-receive-title';
  	}
  }

  private checkWalletExisting(currency: string): void{
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
  }

  private onCurrenciesUpdated(currency: string, typeCurrency: string): void{
  	if (!this.pTransactionChanged) {
  		if(typeCurrency === 'Spend'){
  			this.currentCurrencySpend = this.pCurrencies.find((x) => x.symbol === currency);

  			if(!this.currentCurrencySpend?.fiat){
  				this.checkWalletExisting(currency);
  			}
  		} else if (typeCurrency === 'Receive'){
				if (this.summary?.transactionType === TransactionType.Sell && this.USER) {
					this.profileService.maxSellAmount(currency)
						.pipe(take(1), takeUntil(this.destroy$))
						.subscribe( ({ maxSellAmount }) =>  this.maxSellAmount = maxSellAmount.total);
				}

  			this.currentCurrencyReceive = this.pCurrencies.find((x) => x.symbol === currency);
		
  			if(!this.currentCurrencyReceive?.fiat){
  				this.checkWalletExisting(currency);
  			}
  		}

  		this.sendData();
  	}
  }
  
  private onAmountSpendUpdated(val: any): void {
  	if (val && !this.pSpendAutoUpdated) {
  		if (this.initValidators) {
  			this.initValidators = false;
  			if (this.currentCurrencySpend) {
  				this.setSpendValidators(this.maxSellAmount);
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

  private onAmountReceiveUpdated(val: any): void {
  	if (val && !this.pReceiveAutoUpdated) {
  		if (this.initValidators) {
  			this.initValidators = false;
  			if (this.currentCurrencySpend) {
  				this.setSpendValidators(this.maxSellAmount);
  			}
  			if (this.currentCurrencyReceive) {
  				this.setReceiveValidators();
  			}
  		}
  		this.amountReceiveChanged = true;

  		this.updateCurrentAmounts();
  	}
	
  	this.pReceiveAutoUpdated = false;
  }

  private onTransactionUpdated(val: TransactionType): void {
  	if (this.currentTransaction === val) {
  		return;
  	}

  	this.walletField?.setValue(undefined);
	
  	this.currentTransaction = val;
  	
  	this.setAmountTitles();
  	this.pSpendAutoUpdated = true;
  	this.pReceiveAutoUpdated = true;
  	this.pTransactionChanged = true;

  	const currencySpend = this.currentCurrencySpend?.symbol;
  	const currencyReceive = this.currentCurrencyReceive?.symbol;

  	this.currentCurrencySpend = this.pCurrencies.find((x) => x.symbol === currencyReceive);
  	this.currentCurrencyReceive = this.pCurrencies.find((x) => x.symbol === currencySpend);
  	this.setSpendValidators(this.maxSellAmount);
  	this.setReceiveValidators();
  	this.setCurrencyLists();

  	this.currencySpendField?.setValue(this.currentCurrencySpend?.symbol);
  	this.currencyReceiveField?.setValue(this.currentCurrencyReceive?.symbol);

  	this.setWalletVisible();
  	this.pTransactionChanged = false;
  	this.amountSpendField?.setValue(undefined);
  	this.amountReceiveField?.setValue(undefined);

  	this.sendData();
  }

  private onWalletSelectorUpdated(val: string): void {
  	this.walletField?.setValue(val);
  }

  private onWalletUpdated(val: string): void {
  	this.walletInit = true;
  	this.selectedWallet = this.wallets.find(x => x.address === val);

  	if (!this.selectedWallet) {
  		this.selectedWallet = this.filteredWallets.find(x => x.address === val);
  	}

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

  	if (this.amountReceiveChanged) {
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
  	} else {
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

  	if (this.currentTransaction === TransactionType.Buy || this.currentTransaction === TransactionType.Sell) {
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
	this.amountReceiveChanged = false;
  	this.sendData();
  }

  showPersonalVerification(): void {
  	void this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
  		window.location.reload();
  	});
  }

  sendAll(): void {
  	this.amountSpendField?.setValue(this.selectedWallet?.total);
  }

  onSubmit(): void {
  	this.onProgress.emit(true);

  	if (this.USER?.email !== this.emailField?.value) {
  		this.auth.logout();
  	}
  
  	this.initialized = false;
  	this.isSecondPartActive = false;
  	this.onVerifyWhenPaidChanged.emit(this.verifyWhenPaidField?.value ?? false);
  	this.onComplete.emit(this.emailField?.value);
  }

  onProceed(): void {
  	if (this.isSinglePage) {
  		this.onSubmit();
  	} else {
  		this.isSecondPartActive = true;
  		this.hideProceedButton = false;
  	}
  }

  onCancel(): void {
  	this.isSecondPartActive = false;
  	this.hideProceedButton = true;
  }

  onLangSelect(lang: LangDefinition): void {
  	this.transloco.setActiveLang(lang.id);
  	this.activeLang = lang.label;
  }
}