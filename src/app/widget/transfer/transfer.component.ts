import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShort, PaymentApmResult, PaymentInstrument, PaymentPreauthResultShort, Rate, TransactionInput, TransactionShort, TransactionSource, TransactionType, UserContactListResult, WireTransferPaymentCategory } from 'model/generated-models';
import { CardView, CheckoutSummary, PaymentProviderInstrumentView } from 'model/payment.model';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';
import { ExchangeRateService } from 'services/rate.service';
import { environment } from '@environments/environment';
import { CommonDialogBoxComponent } from 'components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from 'model/cost-scheme.model';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategoryItem, PaymentWidgetType } from 'model/payment-base.model';
import { WalletItem } from 'model/wallet.model';
import { AuthService } from 'services/auth.service';
import { NotificationService } from 'services/notification.service';
import { ProfileDataService } from 'services/profile.service';
import { WidgetPagerService } from 'services/widget-pager.service';
import { WidgetService } from 'services/widget.service';

@Component({
	selector: 'app-transfer-widget',
	templateUrl: 'transfer.component.html',
	styleUrls: [],
})
export class TransferWidgetComponent implements OnInit, OnDestroy {
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  errorMessage = '';
  rateErrorMessage = '';
  inProgress = false;
  initState = true;
  mobileSummary = false;
  initMessage = 'Loading...';
  summary = new CheckoutSummary();
  widget = new WidgetSettings();
  userWallets: WalletItem[] = [];
  exchangeRateCountDownTitle = '';
  exchangeRateCountDownValue = '';
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
  iframeContent = '';
	apmResult: PaymentApmResult = undefined;
  paymentComplete = false;
  notificationStarted = false;
	transactionInput: TransactionInput | undefined = undefined;
	requiredFields: string[] = [];

  private pSubscriptions: Subscription = new Subscription();
  private pNotificationsSubscription: Subscription | undefined = undefined;

  constructor(
  	private changeDetector: ChangeDetectorRef,
  	private router: Router,
  	public dialog: MatDialog,
  	public pager: WidgetPagerService,
  	private exhangeRate: ExchangeRateService,
  	private widgetService: WidgetService,
  	private notification: NotificationService,
  	private auth: AuthService,
  	private dataService: PaymentDataService,
  	private profileService: ProfileDataService,
  	private errorHandler: ErrorService) { }

  ngOnInit(): void {
  	this.widgetService.register(
  		this.progressChanged.bind(this),
  		this.handleError.bind(this),
  		this.settingsIdRequired.bind(this),
  		this.settingsAuthRequired.bind(this),
  		this.onLoginRequired.bind(this),
  		this.checkLoginResult.bind(this),
  		this.onLoginRequired.bind(this),
  		this.settingsKycState.bind(this),
  		this.settingsCommonComplete.bind(this),
  		this.onWireTransferListLoaded.bind(this)
  	);
  	this.initMessage = 'Loading...';
  	this.pager.init('initialization', 'Initialization');
  	this.loadUserWallets();
  	this.startExchangeRate();
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  	this.stopNotificationListener();
  	this.exhangeRate.stop();
  }

  private initData(): void {
  	this.initMessage = 'Loading...';
  	this.summary.agreementChecked = true;
  	const user = this.auth.user;
  	if (user) {
  		this.summary.email = this.auth?.user?.email ?? '';
  		this.widget.email = this.summary.email;
  	}
  	this.summary.transactionType = TransactionType.Buy;
  	this.widget.embedded = true;
  	this.widget.transaction = this.summary.transactionType;
  	this.widget.transfer = true;
  }

  private startExchangeRate(): void {
  	this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
  	this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  private startNotificationListener(): void {
  	//this.stopNotificationListener();
  	this.notificationStarted = true;
  	this.pNotificationsSubscription = this.notification.subscribeToTransactionNotifications().subscribe(
  		({ data }) => {
  			this.handleTransactionSubscription(data);
  		},
  		(error) => {
  			this.notificationStarted = false;
  			// there was an error subscribing to notifications
  			if (!environment.production) {
  				console.error('Notifications error', error);
  			}
  		}
  	);
  }

  private stopNotificationListener(): void {
  	if (this.pNotificationsSubscription) {
  		this.pNotificationsSubscription.unsubscribe();
  	}
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
  	this.exchangeRateCountDownTitle = countDownTitle;
  	this.exchangeRateCountDownValue = countDownValue;
  	this.rateErrorMessage = error;
  	if (rate) {
  		this.summary.exchangeRate = rate;
  	}
  }

  resetWizard(): void {
  	this.summary.reset();
  	this.initData();
  	this.pager.init('', '');
  	this.nextStage('order_details', 'Order details', 1);
  }

  handleError(message: string): void {
  	this.errorMessage = message;
  	this.changeDetector.detectChanges();
  }

  handleAuthError(): void {
  	if (this.widget.embedded) {
  		void this.router.navigateByUrl('/');
  	} else {
  		this.nextStage('order_details', 'Order details', 1);
  	}
  }

  progressChanged(visible: boolean): void {
  	this.inProgress = visible;
  	this.changeDetector.detectChanges();
  }

  private stageBack(): void {
  	this.inProgress = false;
  }

  private nextStage(id: string, name: string, stepId: number): void {
  	setTimeout(() => {
  		this.errorMessage = '';
  		this.pager.nextStage(id, name, stepId);
  	}, 50);
  }

  removeStage(stage: string): void {
  	this.pager.removeStage(stage);
  }

  loadUserWallets(): void {
  	this.errorMessage = '';
  	this.inProgress = true;
  	const walletData = this.profileService.getMyContacts([], [], [], 0, 1000, 'displayName', false);
  	this.pSubscriptions.add(
  		walletData.valueChanges.pipe(take(1)).subscribe(({ data }) => {
  			this.inProgress = false;
  			const dataList = data.myContacts as UserContactListResult;
  			if (dataList !== null) {
  				const walletCount = dataList?.count as number;
  				if (walletCount > 0) {
  					this.userWallets = dataList?.list?.map((val) => {
  						const walletData = {
  							address: val.address,
  							vaultName: val.displayName,
  							assetId: val.assetId
  						} as AssetAddressShort;
  						return new WalletItem(walletData, '', undefined);
  					}) as WalletItem[];
  				}
  			}
  			this.initData();
  			this.pager.init('order_details', 'Order details');
  		}, () => {
  			this.inProgress = false;
  			this.initData();
  			this.pager.init('order_details', 'Order details');
  		})
  	);
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

  orderWalletChanged(data: CheckoutSummary): void {
  	this.summary.address = data.address ?? '';
  	this.summary.vaultId = data.vaultId ?? '';
  }

  orderVerifyWhenPaidChanged(val: boolean): void {
  	this.summary.verifyWhenPaid = val;
  }

  orderDetailsComplete(): void {
  	this.widgetService.getSettingsCommon(this.summary, this.widget, false);
  }
  // =======================

  // == Common settings ==
  settingsAuthRequired(): void {
  	this.onLoginRequired();
  }

  settingsIdRequired(): void {
  	this.nextStage('order_details', 'Order details', 1);
  }

  settingsKycState(state: boolean): void {
  	this.requestKyc = state;
  }

  settingsCommonComplete(providers: PaymentProviderInstrumentView[]): void {
  	this.paymentProviders = providers.map(val => val);
  	setTimeout(() => {
  		const nextStage = 4;

  		if (this.paymentProviders.length < 1) {
  			this.errorMessage = `No supported payment providers found for "${this.summary.currencyFrom}"`;
  		} else if (this.paymentProviders.length > 1) {
  			if (!this.notificationStarted) {
  				this.startNotificationListener();
  			}
  			this.nextStage('payment', 'Payment info', nextStage);
  		} else {
  			this.selectProvider(this.paymentProviders[0]);
  		}
  		//}
  	}, 100);
  }
  // =====================

  private checkLoginResult(): void { }

  // == Payment info ==
  paymentBack(): void {
  	this.stageBack();
  }

  selectProvider(provider: PaymentProviderInstrumentView): void {

  	if (provider.instrument === PaymentInstrument.WireTransfer) {
  		this.summary.providerView = this.paymentProviders.find(x => x.id === provider.id);
  		this.startPayment();
  	} else {
  		this.createTransaction(provider.id, provider.instrument, '');
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
  	this.createTransaction('', PaymentInstrument.WireTransfer, settingsData);
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
  // ====================

  // == Payment ===========
  processingComplete(): void {
  	const details = new PaymentCompleteDetails();
  	details.paymentType = PaymentWidgetType.Transfer;
  	details.amount = parseFloat(this.summary.amountTo?.toFixed(this.summary.amountToPrecision) ?? '0');
  	details.currency = this.summary.currencyTo;
  	this.onComplete.emit(details);
  }
  // ======================

  // == Auth ========
  onLoginRequired(): void {
  	void this.router.navigateByUrl('/');
  }
  // ====================

  // == KYC =============
  kycBack(): void {
  	this.stageBack();
  }

  kycComplete(): void {
  	if (this.paymentProviders.length < 1) {
  		this.errorMessage = `No supported payment providers found for "${this.summary.currencyFrom}"`;
  	} else if (this.paymentProviders.length > 1) {
  		this.nextStage('payment', 'Payment info', 5);
  	} else {
  		this.selectProvider(this.paymentProviders[0]);
  	}
  }

	requiredFieldsComplete(): void {
		this.createTransactionInternal();
  }
  // ====================

	private userInfoRequired(requiredFields: string[]): void {
  	this.requiredFields = requiredFields;
		this.nextStage('wire_transfer_info_required', 'Payment info', this.pager.step);
  }

  private createTransaction(providerId: string, instrument: PaymentInstrument, instrumentDetails: string): void {
		this.transactionInput = {
			type: this.summary.transactionType,
			source: TransactionSource.Wallet,
			sourceVaultId: this.summary.vaultId,
			currencyToSpend: this.summary.currencyFrom,
			currencyToReceive: (this.summary.currencyTo !== '') ? this.summary.currencyTo : undefined,
			amountToSpend: this.summary.amountFrom ?? 0,
			instrument,
			instrumentDetails: (instrumentDetails !== '') ? instrumentDetails : undefined,
			paymentProvider: (instrument === PaymentInstrument.WireTransfer) ? '' : providerId,
			widgetUserParamsId: '',
			destination: this.summary.address,
			verifyWhenPaid: this.summary.transactionType === TransactionType.Buy ? this.summary.verifyWhenPaid : false
		};
  	
		this.createTransactionInternal();
  }

	private createTransactionInternal(): void {
		this.errorMessage = '';
  	this.inProgress = true;
  	const tempStageId = this.pager.swapStage('initialization');
  	this.initMessage = 'Processing...';
  	if (this.summary) {
  		this.pSubscriptions.add(
  			this.dataService.createTransaction(this.transactionInput).subscribe(({ data }) => {
  				if (!this.notificationStarted) {
  					this.startNotificationListener();
  				}
  				const order = data.createTransaction as TransactionShort;
  				this.inProgress = false;
					if(order.requiredFields && order.requiredFields.length !== 0) {
						this.userInfoRequired(order.requiredFields);
						return;
					}
  				if (order.code) {
  					this.summary.instrument = this.transactionInput.instrument;
  					this.summary.providerView = this.paymentProviders.find(x => x.id === this.transactionInput.paymentProvider);
  					this.summary.orderId = order.code ?? '';
  					this.summary.fee = order.feeFiat ?? 0;
  					this.summary.feeMinFiat = order.feeMinFiat ?? 0;
  					this.summary.feePercent = order.feePercent ?? 0;
  					this.summary.networkFee = order.approxNetworkFee ?? 0;
  					this.summary.transactionDate = new Date().toLocaleString();
  					this.summary.transactionId = order.transactionId as string;
  					if (this.transactionInput.instrument === PaymentInstrument.WireTransfer) {
  						this.nextStage('wire_transfer_result', 'Payment', 5);
  					} else {
  						this.startPayment();
  					}
  				} else {
  					this.errorMessage = 'Order code is invalid';
  					if (this.widget.embedded) {
  						this.onError.emit({
  							errorMessage: this.errorMessage,
  							paymentType: PaymentWidgetType.Transfer
  						} as PaymentErrorDetails);
  					} else {
  						this.pager.swapStage(tempStageId);
  					}
  				}
  			}, (error) => {
  				this.inProgress = false;
  				this.pager.swapStage(tempStageId);
  				if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  					this.handleAuthError();
  				} else {
  					this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
  					this.onError.emit({
  						errorMessage: this.errorMessage,
  						paymentType: PaymentWidgetType.Transfer
  					} as PaymentErrorDetails);
  				}
  			})
  		);
  	}
	}

  private startPayment(): void {
  	if (this.summary.providerView?.instrument === PaymentInstrument.CreditCard) {
  		this.nextStage('credit_card', 'Payment info', this.pager.step);
  	} else if (this.summary.providerView?.instrument === PaymentInstrument.Apm) {
  		this.completeInstantpayTransaction(
  			this.summary.transactionId,
  			this.summary.providerView.id,
  			PaymentInstrument.Apm);
  	} else if (this.summary.providerView?.instrument === PaymentInstrument.WireTransfer) {
  		this.widgetService.getWireTransferSettings(this.summary, this.widget);
  	} else {
  		this.errorMessage = `Invalid payment instrument ${this.summary.providerView?.instrument}`;
  	}
  }

  private completeCreditCardTransaction(transactionId: string, provider: string, card: CardView): void {
  	this.inProgress = true;
  	this.iframeContent = '';
  	const transactionData$ = this.dataService.preAuthCard(transactionId, PaymentInstrument.CreditCard, provider, card);
  	this.pSubscriptions.add(
  		transactionData$.subscribe(
  			({ data }) => {
  				// One more chance to start notifictions
  				if (!this.notificationStarted) {
  					this.startNotificationListener();
  				}
  				const preAuthResult = data.preauth as PaymentPreauthResultShort;
  				const order = preAuthResult.order;
  				this.summary.setPaymentInfo(PaymentInstrument.CreditCard, order?.paymentInfo as string);
  				this.iframeContent = preAuthResult.html as string;
  				this.inProgress = false;
  				this.nextStage('processing-frame', 'Payment', this.pager.step);
  			}, (error) => {
  				this.inProgress = false;
  				if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  					this.handleAuthError();
  				} else {
  					this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
  					this.onError.emit({
  						errorMessage: this.errorMessage,
  						paymentType: PaymentWidgetType.Transfer
  					} as PaymentErrorDetails);
  				}
  			}
  		)
  	);
  }

  private completeInstantpayTransaction(transactionId: string, provider: string, instrument: PaymentInstrument): void {
  	this.inProgress = true;
  	const transactionData$ = this.dataService.preAuth(transactionId, instrument, provider);
  	this.pSubscriptions.add(
  		transactionData$.subscribe(
  			({ data }) => {
  				const preAuthResult = data.createApmPayment as PaymentApmResult;
  				this.apmResult = preAuthResult;
  				this.inProgress = false;
  				this.nextStage('processing-instantpay', 'Payment', this.pager.step);
  			}, (error) => {
  				this.inProgress = false;
  				if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  					this.handleAuthError();
  				} else {
  					this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
  					this.onError.emit({
  						errorMessage: this.errorMessage,
  						paymentType: PaymentWidgetType.Transfer
  					} as PaymentErrorDetails);
  				}
  			}
  		)
  	);
  }

  private onWireTransferListLoaded(wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string): void {
  	this.bankAccountId = bankAccountId;
  	this.wireTransferList = wireTransferList;
  	if (this.wireTransferList.length > 1) {
  		this.nextStage('wire_transfer', 'Payment info', this.pager.step);
  	} else if (this.wireTransferList.length === 1) {
  		this.wireTransferPaymentComplete({
  			id: this.bankAccountId,
  			selected: this.wireTransferList[0]
  		} as WireTransferUserSelection);
  	} else {
  		this.errorMessage = 'No settings found for wire transfer';
  	}
  }
}
