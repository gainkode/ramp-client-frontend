import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonDialogBoxComponent } from 'components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from 'model/cost-scheme.model';
import { AssetAddressShortListResult, KycProvider, LoginResult, PaymentApmResult, PaymentApmType, PaymentInstrument, PaymentPreauthResultShort, Rate, TransactionInput, TransactionShort, TransactionSource, TransactionType, User, Widget, WireTransferPaymentCategory } from 'model/generated-models';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategoryItem } from 'model/payment-base.model';
import { CardView, CheckoutSummary, PaymentProviderInstrumentView } from 'model/payment.model';
import { WalletItem } from 'model/wallet.model';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { NotificationService } from 'services/notification.service';
import { PaymentDataService } from 'services/payment.service';
import { ProfileDataService } from 'services/profile.service';
import { ExchangeRateService } from 'services/rate.service';
import { WidgetPagerService } from 'services/widget-pager.service';
import { WidgetService } from 'services/widget.service';

@Component({
	selector: 'app-widget-internal',
	templateUrl: './widget-internal.component.html',
	styleUrls: ['./widget-internal.component.scss']
})
export class WidgetEmbeddedComponent implements OnInit, OnDestroy {
  @Input() userParamsId = '';
  @Input() quickCheckout = false;
  @Input() isWidget = false;
  @Input() settings: WidgetSettings | undefined = undefined;
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();
  @Output() onIFramePay = new EventEmitter<boolean>();
  @ViewChild('recaptcha') private recaptchaModalContent;

  private recaptchaDialog: NgbModalRef | undefined = undefined; 
  defaultFee: number | undefined = undefined;
  requiredFields: string[] = [];
  errorMessage = '';
  rateErrorMessage = '';
  transactionErrorTitle = '';
  inProgress = false;
  initLoading = true;
  initState = true;
  mobileSummary = false;
  requiredExtraData = false;
  initMessage = 'global.widget_loading';
  summary = new CheckoutSummary();
  redirectUrl = '';
  widget = new WidgetSettings();
  showWidget = true;
  widgetLink = '';
  userWallets: WalletItem[] = [];
	selectedProvider: PaymentProviderInstrumentView;
  paymentProviders: PaymentProviderInstrumentView[] = [];
  bankAccountId = '';
  wireTransferList: WireTransferPaymentCategoryItem[] = [];
  selectedWireTransfer: WireTransferPaymentCategoryItem = {
  	id: WireTransferPaymentCategory.Au,
  	bankAccountId: '',
  	title: '',
  	data: ''
  };
  requestKyc = false;
  overLimitLevel = '';
  iframeContent = '';
  apmResult: PaymentApmResult = undefined;
  paymentComplete = false;
  notificationStarted = false;
  recentTransactions = false;
  transactionIdConfirmationCode = '';
  kycSubscribeResult: boolean | undefined = undefined;
  transactionInput: TransactionInput | undefined = undefined;
  private pNotificationsSubscription: Subscription | undefined = undefined;
  private externalKycProvideNotificationsSubscription: Subscription | undefined = undefined;
  private externalPaymentNotificationsSubscription: Subscription | undefined = undefined;
  get showTransactionsLink(): boolean {
  	return this.auth.user && this.auth.authenticated;
  }

  isOrderDetailsComplete = false;
  isSingleOrderDetailsCompleted = false;
  isSinglePage = true;

	private readonly destroy$ = new Subject<void>();
  constructor(
  	private modalService: NgbModal,
  	private changeDetector: ChangeDetectorRef,
  	public router: Router,
  	public dialog: MatDialog,
  	public pager: WidgetPagerService,
  	private exhangeRate: ExchangeRateService,
  	private widgetService: WidgetService,
  	private notification: NotificationService,
  	public auth: AuthService,
  	private dataService: PaymentDataService,
  	private profileService: ProfileDataService,
  	private errorHandler: ErrorService) { }

  private companyLevelVerificationFlag = false;
  ngOnInit(): void {
  	this.widgetService.register(
  		this.progressChanged.bind(this),
  		this.handleError.bind(this),
  		this.settingsIdRequired.bind(this),
  		this.settingsAuthRequired.bind(this),
  		this.onLoginRequired.bind(this),
  		this.checkLoginResult.bind(this),
  		this.onCodeLoginRequired.bind(this),
  		this.settingsKycState.bind(this),
  		this.onPaymentProvidersLoaded.bind(this),
  		this.onWireTransferListLoaded.bind(this),
  		this.userInfoRequired.bind(this),
  		this.companyLevelVerification.bind(this),
  		this.onRecaptchaCallback.bind(this),
  		this.quickCheckout
  	);
	
  	this.initMessage = 'global.widget_loading';

  	this.loadAccountData();
  	this.pager.init('initialization', 'widget-pager.initialization');
  	this.initPage();
  }

  private initPage(): void {
  	if (this.userParamsId === '') {
  		if (this.settings) {
  			this.widget = this.settings;
  		}
  		if (this.widget.embedded) {
  			this.pager.init('initialization', 'widget-pager.initialization');
  			this.loadDefaultFee();
  			this.loadUserWallets();
  		} else {
  			if (this.quickCheckout) {
  				this.pager.init('order_details', 'widget-pager.order_details');
  			} else {
  				this.pager.init('intro_disclaimer', 'widget-pager.disclaimer');
  			}
  			this.initData(undefined);
  		}
  		this.initLoading = false;
  	} else {
  		this.pager.init('initialization', 'widget-pager.initialization');
  		this.loadUserParams();
  	}
  }
  
  ngOnDestroy(): void {
  	this.stopNotificationListener();

  	this.exhangeRate.stop();
		this.externalKycProvideNotificationsSubscription?.unsubscribe();
		this.externalPaymentNotificationsSubscription?.unsubscribe();

		this.destroy$.next();
		this.destroy$.complete();
  }

  private initData(data: Widget | undefined): void {
  	this.requiredExtraData = false;
  	this.initMessage = 'global.widget_loading';

  	if (data) {
  		this.widget.allowToPayIfKycFailed = data.allowToPayIfKycFailed ?? false;
  		const userParams: Record<string, any> = {};
  		if (data.additionalSettings) {
  	
  			const extraData = JSON.parse(data.additionalSettings);

  			if (extraData.amounts && extraData.amounts.length !== 0){
  				this.widget.currencyAmounts = extraData.amounts;
  			}

  			this.widget.disclaimer = extraData.disclaimer ?? true;
  			this.widget.kycFirst = extraData.kycBeforePayment ?? false;
  			this.widget.minAmountFrom = extraData.minAmountFrom;
  			this.widget.maxAmountFrom = extraData.maxAmountFrom;
  			this.widget.showRate = extraData.showRate;
  		} else {
  			this.widget.disclaimer = true;
  			this.widget.kycFirst = false;
  		}

  		let userTransaction: TransactionType | undefined = undefined;
  		let presetAddress = false;

  		this.widget.widgetId = data.widgetId;
  		this.widget.masked = data.masked;
  		this.widget.email = data.currentUserEmail ?? '';
  		this.widget.walletAddressPreset = data.hasFixedAddress ?? false;
		
  		if (data.currentUserParams) {
  			const params = JSON.parse(data.currentUserParams).params;
		
  			if (params) {
  				this.widget.amountFrom = params.amount || this.widget.amountFrom;
  				this.summary.amountFrom = this.widget.amountFrom;
		
  				this.widget.currencyFrom = params.currency || this.widget.currencyFrom;
  				this.summary.currencyFrom = this.widget.currencyFrom;
		
  				this.widget.currencyTo = params.convertedCurrency || this.widget.currencyTo;
  				this.summary.currencyTo = this.widget.currencyTo;
		
  				userTransaction = params.transactionType || userTransaction;
  				presetAddress = !!params.destination;
  				this.redirectUrl = params.redirectUrl || this.redirectUrl;
  			}
  		}
      
  		if (data?.fee) {
  			this.defaultFee = data.fee;
  		}

  		if (!this.widget.walletAddressPreset) {
  			this.summary.address = (userParams?.params?.destination) ? userParams.params.destination : 
  				(data?.destinationAddress) ? data?.destinationAddress : '';
  		}
      
  		if (presetAddress) {
  			this.widget.walletAddressPreset = true;
  		}

  		this.widget.transaction = undefined;
  		this.widget.transactionTypes = data.transactionTypes;
		
  		if (data.currenciesCrypto?.length > 0) {
  			this.widget.cryptoList = data.currenciesCrypto.map(val => val);
  		}
  		if (data.currenciesFiat?.length > 0) {
  			this.widget.fiatList = data.currenciesFiat.map(val => val);
  		}
  		if (userTransaction) {
  			this.widget.transaction = userTransaction;
  		} else {
  			if (data.transactionTypes?.length > 0) {
  				const appropriateTransactions = data.transactionTypes.filter(x => 
  					x === TransactionType.Buy || x === TransactionType.Sell
  				);
			
  				this.widget.transaction = appropriateTransactions.length > 0
  					? appropriateTransactions[0]
  					: data.transactionTypes[0];
  			}
  		}
  		this.widget.source = (this.quickCheckout) ? TransactionSource.QuickCheckout : TransactionSource.Widget;

  	} else {  

  		if (!this.widget.embedded) {
  			this.widget.disclaimer = false;
  			this.widget.kycFirst = false;
  			this.widget.email = '';
  			this.widget.transaction = TransactionType.Buy;
  			//temp
  			this.widget.source = TransactionSource.QuickCheckout;
  		}

  		this.summary.amountFrom = this.widget.amountFrom ?? this.summary.amountFrom;
  		this.summary.currencyFrom = this.widget.currencyFrom || this.summary.currencyFrom;
  		this.summary.currencyTo = this.widget.currencyTo || this.summary.currencyTo;
  	}

  	this.summary.agreementChecked = !this.widget.disclaimer || this.summary.agreementChecked;
  	this.summary.email = this.widget.email || this.auth?.user?.email || '';
  	this.summary.transactionType = this.widget.transaction || this.summary.transactionType;
    
  	this.startExchangeRate();
  }

  private onRecaptchaCallback(): void{
  	if(this.widget && !this.widget.embedded && !this.recaptchaDialog && !this.auth.user){
  		this.recaptchaDialog = this.modalService.open(this.recaptchaModalContent, {
  			backdrop: 'static',
  			windowClass: 'modalCusSty',
  		});
  	}
  }

  private startExchangeRate(): void {
  	this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
  	this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  startNotificationListener(): void {
		if (!this.notificationStarted) {
			this.notificationStarted = true;
			this.pNotificationsSubscription = this.notification.subscribeToTransactionNotifications()
				.subscribe({
					next: ({ data }) => this.handleTransactionSubscription(data),
					error: (error) => {
						this.notificationStarted = false;
						// there was an error subscribing to notifications
						if (!environment.production) {
							console.error('Notifications error', error);
						}
					}
				}
			);
		}
  }

  private startExternalKycProvideListener(): void {
  	const isExternalProvider = this.auth.user?.kycProvider === KycProvider.Shufti || this.auth.user?.kycProvider === KycProvider.Au10tix; 
  	
  	if(this.auth.user && isExternalProvider){
  		console.log('Kyc completed notifications subscribed');

  		this.externalKycProvideNotificationsSubscription = this.notification.subscribeToKycCompleteNotifications()
  			.subscribe({
  					next: ({ data }) => {
  						const  subscriptionData= data.kycCompletedNotification;
  						console.log('KYC completed', subscriptionData);
	
  						if(subscriptionData.kycStatus === 'completed'){
  							if (subscriptionData.kycValid) {
  								this.kycSubscribeResult = true;
  							} else {
  								console.log('KYC rejected');
  								this.kycSubscribeResult = false;
  							}
  						}
  						this.loadAccountData();
  					},
  					error: (error) => {
  						console.error('KYC complete notification error', error);
  					}
  				});
  	}
  }

  private startExternalPaymentNotificationListener(): void {
  	this.externalPaymentNotificationsSubscription = this.notification.subscribeToExternalPaymentCompleteNotifications()
  		.subscribe({
  			next: ({ data }) => {
  				const subscriptionData = data.externalPaymentCompletedNotification;
  				let finishFlag = false;
  				console.log('External Payment completed', subscriptionData);
				
  				if(subscriptionData.status === 'approved'){
  					finishFlag = true;
  					this.processingComplete();
  				} else if(subscriptionData.status === 'declined') {
  					finishFlag = true;
  					this.setError('External Payment failed', 'Payment declined');
  				}

  				if(finishFlag){
  					this.showWidget = true;
  					this.widgetLink = undefined;
  					this.onIFramePay.emit(false);
  				}
  			},
  			error: (error) => {
  				console.error('External Payment notification error', error);

  				this.setError('External Payment', 'Payment declined');

  				this.showWidget = true;
  				this.widgetLink = undefined;
  				this.onIFramePay.emit(false);
  			}
  		});
  }


  private stopNotificationListener(): void { 
		this.pNotificationsSubscription?.unsubscribe();

  	this.pNotificationsSubscription = undefined;
  	this.notificationStarted = false;
  }

  private handleTransactionSubscription(data: any): void {
  	let res = false;
  	if (data.transactionServiceNotification.type === 'PaymentStatusChanged') {
  		res = true;
  	} else {
  		console.error('transactionApproved: unexpected type', data.transactionServiceNotification.type);
  	}
  	if (res) {
  		if (data.transactionServiceNotification.userId === this.auth.user?.userId) {
  			res = true;
  		} else {
  			console.error('transactionApproved: unexpected userId', data.transactionServiceNotification.userId);
  		}
  	}
  	if (res) {
  		if (data.transactionServiceNotification.operationStatus === 'approved' ||
        data.transactionServiceNotification.operationStatus === 'declined' ||
        data.transactionServiceNotification.operationStatus === 'error') {
  			res = true;
  		} else {
  			console.error('transactionApproved: unexpected operationStatus', data.transactionServiceNotification.operationStatus);
  		}
  	}
  	if (res) {
  		if (data.transactionServiceNotification.operationType === 'preauth' ||
        data.transactionServiceNotification.operationType === 'approved') {
  			res = true;
  		} else {
  			console.error('transactionApproved: unexpected operationType', data.transactionServiceNotification.operationType);
  		}
  	}
  	if (res) {
  		this.paymentComplete = true;
  	}
  }

	onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
  	this.rateErrorMessage = error;
  	if (rate) {
  		this.summary.exchangeRate = rate;
  	}
  }

  resetWizard(): void {
  	if (this.redirectUrl !== ''){
  		window.location.replace(this.redirectUrl);
  	} else {
  		this.inProgress = false;
  		this.requiredExtraData = false;

  		if (this.userParamsId === '') {
  			this.initData(undefined);

  			if (this.widget.orderDefault) {
  				this.orderDetailsComplete(this.summary.email);
  			} else {
  				this.pager.init('', '');
  				this.nextStage('order_details', 'widget-pager.order_details', 1);
  			}
  		} else {
  			this.loadUserParams();
  		}
						
  		this.isOrderDetailsComplete = false;
			
  		if (this.isSinglePage && this.isSingleOrderDetailsCompleted) {
  			this.isSingleOrderDetailsCompleted = false;
  		}
  	}

		if (this.transactionErrorTitle === 'core.wrong_transaction_parameters_1') {
			this.summary.address = ''; // clear address, force user write another
		}

		this.transactionErrorTitle = undefined;
  }

  capchaResult(): void {
  	this.recaptchaDialog?.close();
  	this.recaptchaDialog = undefined;
  	this.widgetService.authenticate(this.summary.email, this.widget.widgetId);
  }

  handleError(message: string): void {
  	this.setError('widget-error.title-transaction-failed', message);
  }

  handleReject(): void {
  	this.loadAccountData();

  	if (this.widget.kycFirst && this.widget.allowToPayIfKycFailed) {
			this.nextStage('payment', 'widget-pager.credit_card', 5);
  	}
  }
  
  handleAuthError(): void {
  	if (this.widget.embedded) {
  		void this.router.navigateByUrl('/');
  	} else {
  		if (this.widget.orderDefault) {
  			this.nextStage('login_auth', 'widget-pager.register', 3);
  		} else {
  			this.nextStage('order_details', 'widget-pager.order_details', 1);
  		}
  	}
  }

  progressChanged(visible: boolean): void {
  	this.inProgress = visible;
  	this.changeDetector.detectChanges();
  }

  showTransactions(): void {
  	this.recentTransactions = true;
  }

  transactionsBack(): void {
  	this.recentTransactions = false;
  	this.mobileSummary = false;
  }

  stageBack(): void {
  	this.inProgress = false;
		this.pager.goBack();
		
  	if (this.pager.stageId === 'order_details') {
  		this.isOrderDetailsComplete = false;

  		if (this.isSinglePage && this.isSingleOrderDetailsCompleted) {
  			this.isSingleOrderDetailsCompleted = false;
  		}
  	}
  }

  private nextStage(id: string, name: string, stepId: number): void {
  	setTimeout(() => {
  		this.errorMessage = '';
  		this.pager.nextStage(id, name, stepId);
  		this.inProgress = false;
  	}, 50);

  	if (id === 'order_details' && this.isOrderDetailsComplete) {
			this.isOrderDetailsComplete = false;

			if (this.isSinglePage && this.isSingleOrderDetailsCompleted) {
					this.isSingleOrderDetailsCompleted = false;
			}
  	}
  }

  removeStage(stage: string): void {
  	this.pager.removeStage(stage);
  }

  private loadUserParams(): void {
  	this.errorMessage = '';
  	this.inProgress = true;
		
	this.dataService.getWidget(this.userParamsId).valueChanges
		.pipe(take(1), takeUntil(this.destroy$))
		.subscribe({
			next: ({ data }) => {
				this.inProgress = false;
				this.initData(data.getWidget as Widget);

				if (this.widget.transaction) {
					const transactionType = this.widget.transaction.toLowerCase();
					const validTransactionType = ['buy', 'sell'].includes(transactionType);

					if (!validTransactionType) {
						this.showTransactionError('Wrong widget settings');
						return;
					}
				}

				if (this.widget.orderDefault) {
					if (this.auth.user?.email !== this.widget.email) {
						this.summary.email = '';
					}
					this.orderDetailsComplete(this.widget.email);
				} else {
					const isOrderDetails = this.quickCheckout || this.summary.agreementChecked;
					this.pager.init(
						isOrderDetails ? 'order_details' : 'intro_disclaimer',
						isOrderDetails ?  'widget-pager.order_details' : 'widget-pager.disclaimer'
					);
				}

				this.initLoading = false;
			}, 
			error: () => {
				this.inProgress = false;
				this.initData(undefined);
				this.showTransactionError('Wrong widget settings');
				this.setOrderDetailsStep();
			}
		});
  }

  loadUserWallets(): void {
  	this.errorMessage = '';
  	this.inProgress = true;

		this.profileService.getMyWallets([]).valueChanges
			.pipe(take(1), takeUntil(this.destroy$))
			.subscribe({
				next: ({ data }) => {
					this.inProgress = false;
					const dataList = data.myWallets as AssetAddressShortListResult;

					if (dataList !== null) {
						const walletCount = dataList?.count as number;

						if (walletCount > 0) {
							this.userWallets = dataList?.list?.map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
						}
					}

					this.initData(undefined);
				},
				error: () => {
					this.inProgress = false;
					this.initData(undefined);
					this.setOrderDetailsStep();
				}	
		});
  }

  loadDefaultFee(): void {
  	this.errorMessage = '';
  	this.inProgress = true;

		this.profileService.getMyDefaultSettingsFee().valueChanges
			.pipe(take(1), takeUntil(this.destroy$))
			.subscribe({
				next: ({ data }) => { 
					this.inProgress = false;
			
					if (data.myDefaultSettingsFee.terms && data.myDefaultSettingsFee.terms !== '') {
						const defaultFeeTerms = typeof data.myDefaultSettingsFee.terms == 'string' ? JSON.parse(data.myDefaultSettingsFee.terms) : data.myDefaultSettingsFee.terms;
						
						if (defaultFeeTerms.Transaction_fee) {
							this.defaultFee = defaultFeeTerms.Transaction_fee;
						}
					}
				},
				error: () => {
					this.inProgress = false;
					this.initData(undefined);
					this.setOrderDetailsStep();
				}
			});
  }

  // == Order details page ==
  orderDetailsChanged(data: CheckoutSummary): void {
  	this.stopNotificationListener();

  	if (this.initState && (data.amountFrom || data.amountTo)) {
  		this.initState = false;
  	}

  	this.summary.initialized = true;
  	this.summary.fee = 0;

  	const amountFromTemp = (data.amountFrom) ? data.amountFrom?.toFixed(8) : undefined;
  	this.summary.amountFrom = (amountFromTemp) ? parseFloat(amountFromTemp) : undefined;

  	const amountToTemp = (data.amountTo) ? data.amountTo?.toFixed(8) : undefined;
  	this.summary.amountTo = (amountToTemp) ? parseFloat(amountToTemp) : undefined;
  	this.summary.amountFromPrecision = data.amountFromPrecision;
  	this.summary.amountToPrecision = data.amountToPrecision;

  	const currencyFromChanged = (this.summary.currencyFrom !== data.currencyFrom);
  	const currencyToChanged = (this.summary.currencyTo !== data.currencyTo);
  	this.summary.currencyFrom = data.currencyFrom;
  	this.summary.currencyTo = data.currencyTo;
  	this.summary.transactionType = data.transactionType;
  	this.summary.quoteLimit = data.quoteLimit;

  	if (currencyFromChanged || currencyToChanged) {
  		this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
  		this.exhangeRate.update();
  	}
  }

  orderQuoteChanged(quote: number): void {
  	this.summary.quoteLimit = quote;
  }

  orderWalletChanged(data: CheckoutSummary): void {
  	this.summary.address = data.address ?? '';
  	this.summary.vaultId = data.vaultId ?? '';
  }

  orderVerifyWhenPaidChanged(val: boolean): void {
  	this.summary.verifyWhenPaid = val;
  }

  orderDetailsComplete(email: string): void {
  	if (this.summary.email === email) {
  		if(this.auth.user){
  			this.disclaimerNext();
  		} else {
  			this.summary.transactionId = '';
  			this.summary.fee = 0;
  			this.summary.email = email;
  			this.widgetService.authenticate(email, this.widget.widgetId);
  		}
      
  	} else {
  		this.summary.transactionId = '';
  		this.summary.fee = 0;
  		this.summary.email = email;
  		this.widgetService.authenticate(email, this.widget.widgetId);
  	}

	  this.isOrderDetailsComplete = true;

	  if (this.isSinglePage && !this.isSingleOrderDetailsCompleted) {
  		this.isSingleOrderDetailsCompleted = true;
	  }
  }

  // == Sell ===============
  sellComplete(accountType: string): void {
  	const settingsData = JSON.stringify({ accountType });
  	this.createTransaction(this.summary.providerView?.id ?? '', PaymentInstrument.WireTransfer, settingsData);
  }

  // == Disclaimer =========
  disclaimerNext(): void {
  	this.summary.agreementChecked = true;
  	this.widgetService.getSettingsCommon(this.summary, this.widget, this.widget.orderDefault);
  }

  introDisclaimerNext(): void {
  	this.summary.agreementChecked = true;
  	let validTransactionType = true;

  	if (this.widget.transaction) {
  		validTransactionType = (this.widget.transaction === TransactionType.Buy ||
        this.widget.transaction === TransactionType.Sell);
  	}

  	if (this.widget.orderDefault && validTransactionType) {
  		if (this.auth.user?.email !== this.widget.email) {
  			this.summary.email = '';
  		}
  		this.orderDetailsComplete(this.widget.email);
  	} else {
  		this.setOrderDetailsStep();
  	}
  }

  // == Common settings ==
  settingsAuthRequired(): void {
  	this.widgetService.authenticate(this.summary.email, this.widget.widgetId);
  }

  settingsIdRequired(): void {
  	if (this.widget.orderDefault) {
  		this.orderDetailsComplete(this.summary.email);
  	} else {
  		this.nextStage('order_details', 'widget-pager.order_details', 1);
  	}
  }

  private settingsKycState(state: boolean, level: string): void {
  	if (this.summary.quoteLimit !== 0) {
  		this.widget.kycFirst = true;
  	}

  	if (level !== '') {
  		this.overLimitLevel = level;
  	}

  	this.requestKyc = state;
  }

  private onPaymentProvidersLoaded(): void {
  	const nextStage = 4;

  	if (this.widget.kycFirst && this.requestKyc && !this.widget.embedded) {
  		this.startExternalKycProvideListener();

  		if(this.companyLevelVerificationFlag){
  			this.nextStage('company_level_verification', 'widget-pager.company_level_verification', this.pager.step);
  		} else {
  			const tempStageId = this.pager.stageId;

  			if (tempStageId === 'verification') {
  				this.pager.goBack();
  			}

  			this.nextStage('verification', 'widget-pager.company_level_verification', nextStage);
  		}
  	} else {
			this.nextStage('payment', 'widget-pager.credit_card', nextStage);
		}
  }

  // == Payment info ==
  selectProvider(data: { selectedProvider: PaymentProviderInstrumentView; providers?: PaymentProviderInstrumentView[]; }): void {
		this.paymentProviders = data.providers;
		this.selectedProvider = data.selectedProvider;

  	if (this.summary.transactionType === TransactionType.Buy) {
  		this.summary.providerView = this.paymentProviders.find(x => x.id === this.selectedProvider.id);
			
			const currentCase = `payment_${this.selectedProvider.componentName}`;
			const knownCases: string[] = ['payment_yapily', 'payment_wrbankaccount'];
			debugger
			if (knownCases.includes(currentCase)) {
				if (this.selectedProvider.isSingleBankAccount) {

					this.createTransaction(
						this.selectedProvider.id, 
						this.selectedProvider.instrument, 
						'', 
						this.selectedProvider.bankAccount.bankAccountId, 
						this.selectedProvider.selectedBankAccount);
						
				} else {
					this.nextStage(`payment_${this.selectedProvider.componentName}`, 'widget-pager.wire_transfer_result', 5);
				}
			} else {
				this.createTransaction(this.selectedProvider.id, this.selectedProvider.instrument, '');
			}
  	} else {
			this.profileService.maxSellAmount(this.summary.currencyFrom)
				.pipe(take(1), takeUntil(this.destroy$))
				.subscribe(maxSellAmount => {
					if (this.summary.amountFrom > maxSellAmount ) {
						
						// Back to first page in order to validate maxSellAmount to SELL transaction type
						this.nextStage('order_details', 'widget-pager.order_details', 1);
					} else {
						if (this.selectedProvider.instrument === PaymentInstrument.WireTransfer) {
							this.nextStage('sell_details', 'widget-pager.bank-details', 2);
						} else {
							this.createTransaction(this.selectedProvider.id, this.selectedProvider.instrument, '');
						}
					}
				});
  	}
  }
  // ====================

  // == Credit card ==
  creditCardPaymentComplete(data: CardView): void {
  	this.paymentComplete = false;
  	this.completeCreditCardTransaction(this.summary.transactionId, this.summary.providerView?.id ?? '', data);
  }
  // ====================

  // == Wire transfer ==
  wireTransferPaymentComplete(data: WireTransferUserSelection): void {
  	this.selectedWireTransfer = data.selected;
  	const settings = {
  		settingsCostId: data.id,
  		accountType: data.selected
  	};
  	const settingsData = JSON.stringify(settings);
  	this.createTransaction(this.summary.providerView.id, PaymentInstrument.WireTransfer, settingsData);
  }

  sendWireTransaferMessageResult(): void {
  	this.dialog.open(CommonDialogBoxComponent, {
  		width: '450px',
  		data: {
  			title: 'Email Sent',
  			message: 'Bank details has been sent to your Email address'
  		}
  	});
  }

  sendWireTransaferMessage(): void {
  	this.widgetService.sendWireTransferMessage(
  		this.summary.email,
  		this.summary.transactionId,
  		this.sendWireTransaferMessageResult.bind(this)
  	);
  }

  // == Payment ===========
  requiredFieldsComplete(): void {
  	this.createTransactionInternal();
  }

  processingComplete(): void {
  	if (this.widget.embedded) {
  		const details = new PaymentCompleteDetails();
  		details.amount = parseFloat(this.summary.amountTo?.toFixed(this.summary.amountToPrecision) ?? '0');
  		details.currency = this.summary.currencyTo;
  		this.onComplete.emit(details);
  	} else {
  		if (!this.widget.kycFirst && this.requestKyc && !this.widget.embedded) {
  			this.nextStage('verification', 'widget-pager.company_level_verification', 5);
  		} else {
  			this.nextStage('complete', 'widget-pager.complete', 6);
  		}
  	}
  }
 
  // == Auth ========
  onRegister(email: string): void {
  	this.summary.email = email;
  	this.nextStage('register', 'widget-pager.register', 3);
  }

  onLoginRequired(email: string): void {
  	if (this.widget.embedded) {
  		void this.router.navigateByUrl('/');
  	} else {
  		const currentEmail = this.auth.user?.email ?? '';

  		if (currentEmail !== email) {
  			this.auth.logout();
  			this.summary.transactionId = '';
  			this.summary.fee = 0;
  		}

  		this.summary.email = email;

  		if (this.summary.transactionId === '') {
  			this.nextStage('login_auth', 'widget-pager.register', 3);
  		} else {
  			this.startPayment();
  		}
  	}
  }

  onCodeLoginRequired(email: string): void {
  	this.summary.email = email;
  	this.nextStage('code_auth', 'widget-pager.register', 3);
  }

  loginCodeConfirmed(): void {
  	this.widgetService.getSettingsCommon(this.summary, this.widget, true);
  }

  loginComplete(data: LoginResult): void {
  	this.checkLoginResult(data);
  }

  transactionConfiramtionComplete(order: TransactionShort): void {
  	this.summary.orderId = order.code as string;
  	this.summary.fee = order.feeFiat as number ?? 0;
  	this.summary.feeMinFiat = order.feeMinFiat as number ?? 0;
  	this.summary.feePercent = order.feePercent as number ?? 0;
  	this.summary.networkFee = order.approxNetworkFee ?? 0;
  	this.summary.transactionDate = new Date().toLocaleString();
  	this.summary.transactionId = order.transactionId as string;
  	if (this.summary.instrument === PaymentInstrument.WireTransfer) {
  		this.nextStage('wire_transfer_result', 'widget-pager.processing-frame', 5);
  	} else {
  		this.startPayment();
  	}
  }

  // == KYC =============

  kycComplete(): void {
  	if (this.widget.kycFirst) {
  		this.loadAccountData();
  		console.log('KYC COMPLETE');
  		this.widgetService.getSettingsCommon(this.summary, this.widget, this.widget.orderDefault);
  		this.kycSubscribeResult = undefined;
  	} else {
  		this.nextStage('complete', 'widget-pager.complete', 6);
  	}
  }
  
  private checkLoginResult(data: LoginResult): void {
  	this.stopNotificationListener();

  	if (data.user) {
  		this.summary.email = data.user.email;
  	}
		
  	if (data.authTokenAction === 'Default' || data.authTokenAction === 'KycRequired') {
  		this.auth.setLoginUser(data);

  		if (this.externalKycProvideNotificationsSubscription) {
  			this.externalKycProvideNotificationsSubscription.unsubscribe();
  		}

  		this.startExternalKycProvideListener();

  		if (this.summary.agreementChecked) {
				
  			if (this.summary.transactionId === '') {
  				this.disclaimerNext();
  			} else {
  				this.startPayment();
  			}

  		} else {
  			this.nextStage('disclaimer', 'widget-pager.disclaimer', 2);
  		}
  	} else if (data.authTokenAction === 'UserInfoRequired') {
  		this.auth.setLoginUser(data);
  		this.requiredExtraData = true;
  		this.nextStage('login_auth', 'widget-pager.register', 3);
  	} else {
  		this.setError(
  			'Authentication failed',
  			`Unable to authenticate user with the action "${data.authTokenAction}"`);
  	}
  }

  private createTransaction(
			providerId: string,
			instrument: PaymentInstrument, 
			instrumentDetails: string,
			wireTransferBankAccountId?: string,
			wireTransferPaymentCategory?: string,
			): void {
  	const transactionSourceVaultId = (this.summary.vaultId === '') ? undefined : this.summary.vaultId;
  	const destination = this.summary.transactionType === TransactionType.Buy ? this.summary.address : '';

  	this.transactionInput = {
  		type: this.summary.transactionType,
  		source: this.widget.source,
  		sourceVaultId: transactionSourceVaultId,
  		currencyToSpend: this.summary.currencyFrom,
  		currencyToReceive: (this.summary.currencyTo !== '') ? this.summary.currencyTo : undefined,
  		amountToSpend: this.summary.amountFrom ?? 0,
  		instrument,
			wireTransferBankAccountId: wireTransferBankAccountId ?? undefined,
			wireTransferPaymentCategory: wireTransferPaymentCategory ?? undefined,
  		instrumentDetails: (instrumentDetails !== '') ? instrumentDetails : undefined,
  		paymentProvider: (providerId !== '') ? providerId : undefined,
  		widgetUserParamsId: (this.userParamsId !== '') ? this.userParamsId : undefined,
  		destination: destination,
  		verifyWhenPaid: this.summary.transactionType === TransactionType.Buy ? this.summary.verifyWhenPaid : false
  	};

  	this.createTransactionInternal();
  }
  
  private createTransactionInternal(): void {
  	this.errorMessage = '';
  	this.inProgress = true;
	
  	const tempStageId = this.pager.swapStage('initialization');
  	this.initMessage = 'global.widget_processing';

		this.dataService.createTransaction(this.transactionInput)
			.pipe(takeUntil(this.destroy$))
				.subscribe(({ data }) => {
					this.startNotificationListener();

					const order = data.createTransaction as TransactionShort;
					this.inProgress = false;
					
					if(order.requiredFields && order.requiredFields.length !== 0) {
						this.userInfoRequired(order.requiredFields);
						return;
					}
					if (order.code) {
						this.transactionWithCodeHandler(order);
					} else {
						this.transactionWithoutCodeHandler(order, tempStageId);
					}
				}, (error) => {
					this.inProgress = false;

					if (tempStageId === 'verification') {
						this.pager.goBack();
					}
					
					if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
						this.handleAuthError();
					} else {
						const msg = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
						this.errorMessage = msg;
						
						if (this.widget.embedded) {
							this.onError.emit({ errorMessage: msg } as PaymentErrorDetails);
						} else {
							if (msg === 'core.wrong_transaction_parameters_1') {
								this.setError(msg, msg);
							} else {
								this.setError('Transaction handling failed', msg);
							}
						}
					}
				});
  }
	
  private transactionWithCodeHandler(order: TransactionShort): void {
  	this.summary.orderId = order.code as string;
  	this.summary.fee = order.feeFiat ?? 0;
  	this.summary.feeMinFiat = order.feeMinFiat ?? 0;
  	this.summary.feePercent = order.feePercent ?? 0;
  	this.summary.networkFee = order.approxNetworkFee ?? 0;
  	this.summary.transactionDate = new Date().toLocaleString();
  	this.summary.transactionId = order.transactionId;
		
  	if(this.transactionInput.type === TransactionType.Buy){
  		this.summary.instrument = this.transactionInput.instrument;
  		this.summary.providerView = this.paymentProviders.find(x => x.id === this.transactionInput.paymentProvider);

  		if (this.transactionInput.instrument === PaymentInstrument.WireTransfer) {
  			if(order.instrumentDetails) {
  				const instrumentDetails = typeof order.instrumentDetails == 'string' ? JSON.parse(order.instrumentDetails) : order.instrumentDetails;
					this.selectedWireTransfer.data = instrumentDetails;
  			}
			
  			this.nextStage('wire_transfer_result', 'widget-pager.wire_transfer_result', 5);
  		} else {
  			this.startPayment();
  		}
  	} else if(this.transactionInput.type === TransactionType.Sell) {

  		if (this.isWidget && order.sourceAddress) {
  			this.summary.sourceAddress = order.sourceAddress;
  			this.nextStage('sell_widget_complete', 'widget-pager.complete', 5);
  		} else {
  			this.processingComplete();
  		}
  	}
  }

  private transactionWithoutCodeHandler(order: TransactionShort, tempStageId: string): void {
  	this.errorMessage = 'Order code is invalid';
  	if (this.widget.embedded) {
  		this.onError.emit({
  			errorMessage: this.errorMessage
  		} as PaymentErrorDetails);

  		return;
  	}

  	if (tempStageId === 'verification') {
  		this.pager.goBack();
  		return;
  	}

  	if(order.transactionId){
  		if(this.transactionInput.type === TransactionType.Buy){
  			this.summary.instrument = this.transactionInput.instrument;
  			this.summary.providerView = this.paymentProviders.find(x => x.id === this.transactionInput.paymentProvider);
  		}

  		this.transactionIdConfirmationCode = order.transactionId;
  		this.nextStage('code_auth', 'widget-pager.login_auth', 3);
  	} else {
  		if (this.transactionInput.type === TransactionType.Buy) {
  			this.pager.swapStage(tempStageId);
  		} else if(this.transactionInput.type === TransactionType.Sell) {
  			this.setError('widget-error.title-transaction-failed', this.errorMessage);
  		}
  	}
  }

  private startPayment(): void {
  	if (this.summary.providerView?.instrument === PaymentInstrument.CreditCard) {
  		this.nextStage('credit_card', 'widget-pager.credit_card', this.pager.step);
  	} else if (this.summary.providerView?.instrument === PaymentInstrument.Apm) {
  		this.completeApmTransaction(this.summary.transactionId, PaymentInstrument.Apm);
  	} else if(this.summary.providerView?.instrument === PaymentInstrument.FiatVault){
  		this.nextStage('complete', 'widget-pager.complete', 6);
  	} else if (this.summary.providerView?.instrument === PaymentInstrument.WireTransfer) {
  		this.widgetService.getWireTransferSettings(this.summary, this.widget);
  	} else {
  		this.setError(
  			'Invalid payment instrument',
  			`Invalid payment instrument ${this.summary.providerView?.instrument}`);
  	}
  }

  private completeApmTransaction(transactionId: string, instrument: PaymentInstrument): void {
  	this.inProgress = true;

		this.dataService.createApmPayment(transactionId, instrument)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ({ data }) => {
					this.inProgress = false;
					const preAuthResult = data.createApmPayment as PaymentApmResult;

					if (preAuthResult.type === PaymentApmType.External) {
						this.showWidget = false;
						this.inProgress = false;
						this.onIFramePay.emit(true);
						this.widgetLink = preAuthResult.externalUrl;
						if (this.widgetLink) {
							this.startExternalPaymentNotificationListener();
						}
					} else {
						this.apmResult = preAuthResult;
						this.nextStage('processing-instantpay', 'widget-pager.processing-instantpay', this.pager.step);
					}
				},
				error: (error) => {
					this.inProgress = false;
					if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
						this.handleAuthError();
					} else {
						this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
						if (this.widget.embedded) {
							this.onError.emit({ errorMessage: this.errorMessage } as PaymentErrorDetails);
						} else {
							this.setError('widget-error.title-transaction-failed', this.errorMessage);
						}
					}
				}
			});
  }

  private completeCreditCardTransaction(transactionId: string, provider: string, card: CardView): void {
  	this.inProgress = true;
  	this.iframeContent = '';

		this.dataService.preAuthCard(transactionId, PaymentInstrument.CreditCard, provider, card)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ({ data }) => {
					this.startNotificationListener();

					const preAuthResult = data.preauth as PaymentPreauthResultShort;
					const order = preAuthResult.order;

					this.summary.setPaymentInfo(PaymentInstrument.CreditCard, order?.paymentInfo as string);
					this.iframeContent = preAuthResult.html as string;
					this.inProgress = false;
					this.nextStage('processing-frame', 'widget-pager.processing-frame', this.pager.step);
				},
				error: (error) => {
					this.inProgress = false;
					if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
						this.handleAuthError();
					} else {
						this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
						
						if (this.widget.embedded) {
							this.onError.emit({
								errorMessage: this.errorMessage
							} as PaymentErrorDetails);
						} else {
							this.setError('widget-error.title-transaction-failed', this.errorMessage);
						}
					}
				}
			});
  }

  private loadAccountData(): void {
		this.profileService.getProfileData().valueChanges
			.pipe(take(1), takeUntil(this.destroy$))
			.subscribe(({ data }) => {
				if (data) {
					console.log('loadAccountData result:', data);
					this.auth.setUser(data.me as User);
					this.auth.notifyUserUpdated();
				}
			});
  }

	// REMOVE THIS METHOD WHEN YOU ARE DONE WITH THE WIRE TRANSFER
  private onWireTransferListLoaded(wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string): void {
  	this.bankAccountId = bankAccountId;
  	this.wireTransferList = wireTransferList;
		
  	if (this.wireTransferList.length > 1) {
  		this.nextStage('wire_transfer', 'widget-pager.credit_card', this.pager.step);
  	} else if (this.wireTransferList.length === 1) {
  		this.wireTransferPaymentComplete({
  			id: this.bankAccountId,
  			selected: this.wireTransferList[0]
  		} as WireTransferUserSelection);
  	} else {
  		this.setError(
			'widget-error.title-transaction-failed', 
			'No settings found for wire transfer'
		);
  	}
  }

  private userInfoRequired(requiredFields: string[]): void {
  	this.requiredFields = requiredFields;
  	this.nextStage('wire_transfer_info_required', 'widget-pager.credit_card', this.pager.step);
  }

  private companyLevelVerification(): void {
  	this.companyLevelVerificationFlag = true;
  }

  private setError(title: string, message: string): void {
  	this.errorMessage = message;
  	this.changeDetector.detectChanges();

  	if (this.pager.stageId !== 'order_details') {
  		this.showTransactionError(title);
  	} else if (this.pager.stageId === 'order_details' && this.isSingleOrderDetailsCompleted) {
  		this.showTransactionError(title);
  	}
  }

  private showTransactionError(messageTitle: string): void {
  	this.transactionErrorTitle = messageTitle;
  	this.nextStage('error', 'widget-pager.error', 6);
  }

  private setOrderDetailsStep(): void {
  	this.pager.init('order_details', 'widget-pager.order_details');
  	this.isOrderDetailsComplete = false;

  	if (this.isSinglePage && this.isSingleOrderDetailsCompleted) {
  		this.isSingleOrderDetailsCompleted = false;
  	}
  }
}
