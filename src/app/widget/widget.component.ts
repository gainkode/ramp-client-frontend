import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShortListResult, LoginResult, PaymentInstrument, PaymentPreauthResultShort, Rate, TransactionShort, TransactionSource, TransactionType, WidgetShort } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, PaymentProviderInstrumentView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { CommonDialogBox } from '../components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from '../model/cost-scheme.model';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { WalletItem } from '../model/wallet.model';
import { ProfileDataService } from '../services/profile.service';
import { WidgetPagerService } from '../services/widget-pager.service';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-widget',
  templateUrl: 'widget.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class WidgetComponent implements OnInit {
  @Input() userParamsId = '';
  @Input() quickCheckout = false;
  @Input() settings: WidgetSettings | undefined = undefined;
  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  errorMessage = '';
  rateErrorMessage = '';
  inProgress = false;
  internalPayment = false;
  initState = true;
  showSummary = true;
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
    id: WireTransferPaymentCategory.AU,
    title: '',
    data: ''
  }
  requestKyc = false;
  iframeContent = '';
  instantpayDetails = '';
  paymentComplete = false;
  notificationStarted = false;

  private pSubscriptions: Subscription = new Subscription();
  private pNotificationsSubscription: Subscription | undefined = undefined;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public router: Router,
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
      this.onCodeLoginRequired.bind(this),
      this.settingsKycState.bind(this),
      this.settingsCommonComplete.bind(this),
      this.onWireTransferListLoaded.bind(this)
    );
    this.initMessage = 'Loading...';
    if (this.userParamsId === '') {
      if (this.settings) {
        this.widget = this.settings;
      }
      if (this.widget.embedded) {
        this.pager.init('initialization', 'Initialization');
        this.loadUserWallets();
      } else {
        this.pager.init('order_details', 'Order details');
        this.initData(undefined);
      }
    } else {
      this.pager.init('initialization', 'Initialization');
      this.loadUserParams();
    }
    this.startExchangeRate();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    this.stopNotificationListener();
    this.exhangeRate.stop();
  }

  private initData(data: WidgetShort | undefined): void {
    this.initMessage = 'Loading...';
    if (data) {
      if (data.additionalSettings) {
        //{"minAmountFrom":0,"maxAmountFrom":0,"fixedAmountFrom":0,"kycBeforePayment":false,"disclaimer":true}
        const extraData = JSON.parse(data.additionalSettings);
        this.widget.disclaimer = extraData.disclaimer ?? true;
        this.widget.kycFirst = extraData.kycBeforePayment ?? false;
      } else {
        this.widget.disclaimer = true;
        this.widget.kycFirst = false;
      }

      this.widget.widgetId = data.widgetId;
      this.widget.email = data.currentUserEmail ?? '';
      this.widget.walletAddressPreset = data.hasFixedAddress ?? false;
      if (this.quickCheckout) {
        this.widget.walletAddressPreset = false;
      }
      this.widget.transaction = undefined;
      if (data.currenciesCrypto) {
        if (data.currenciesCrypto.length > 0) {
          this.widget.cryptoList = data.currenciesCrypto.map(val => val);
        }
      }
      if (data.currenciesFiat) {
        if (data.currenciesFiat.length > 0) {
          this.widget.fiatList = data.currenciesFiat.map(val => val);
        }
      }
      if (data.transactionTypes) {
        if (data.transactionTypes.length > 0) {
          this.widget.transaction = data.transactionTypes[0];
        }
      }
      this.widget.source = (this.quickCheckout) ? TransactionSource.QuickCheckout : TransactionSource.Widget;
    } else {  // Quick checkout w/o parameters
      if (!this.widget.embedded) {
        this.widget.disclaimer = false;
        this.widget.kycFirst = false;
        this.widget.email = '';
        // temp
        //this.widget.kycFirst = true;
        //this.widget.email = 'tugaymv@gmail.com';
        //this.widget.disclaimer = true;
        this.widget.transaction = TransactionType.Deposit;
        //temp
        this.widget.source = TransactionSource.QuickCheckout;
      }
      if (this.widget.amountFrom !== 0) {
        this.summary.amountFrom = this.widget.amountFrom;
      }
      if (this.widget.currencyFrom !== '') {
        this.summary.currencyFrom = this.widget.currencyFrom;
      }
      if (this.widget.currencyTo !== '') {
        this.summary.currencyTo = this.widget.currencyTo;
      }
    }

    if (!this.widget.disclaimer) {
      this.summary.agreementChecked = true;
    }
    if (this.widget.email) {
      this.summary.email = this.widget.email;
    } else {
      const user = this.auth.user;
      if (user) {
        this.summary.email = this.auth?.user?.email ?? '';
      }
    }
    if (this.widget.transaction) {
      this.summary.transactionType = this.widget.transaction;
    }
  }

  private startExchangeRate(): void {
    this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  private startNotificationListener(): void {
    console.log('transaction notification start');
    this.notificationStarted = true;
    this.pNotificationsSubscription = this.notification.subscribeToTransactionNotifications().subscribe(
      ({ data }) => {
        console.log('transaction notification', data);
        this.handleTransactionSubscription(data);
      },
      (error) => {
        this.notificationStarted = false;
        // there was an error subscribing to notifications
        console.log('Notifications error', error);
      }
    );
  }

  private stopNotificationListener(): void {
    if (this.pNotificationsSubscription) {
      console.log('transaction notification stop');
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
      console.log('transactionApproved: unexpected type', data.transactionServiceNotification.type);
    }
    if (res) {
      if (data.transactionServiceNotification.userId === this.auth.user?.userId) {
        res = true;
      } else {
        console.log('transactionApproved: unexpected userId', data.transactionServiceNotification.userId);
      }
    }
    if (res) {
      if (data.transactionServiceNotification.operationStatus === 'approved' ||
        data.transactionServiceNotification.operationStatus === 'declined' ||
        data.transactionServiceNotification.operationStatus === 'error') {
        res = true;
      } else {
        console.log('transactionApproved: unexpected operationStatus', data.transactionServiceNotification.operationStatus);
      }
    }
    if (res) {
      if (data.transactionServiceNotification.operationType === 'preauth' ||
        data.transactionServiceNotification.operationType === 'approved') {
        res = true;
      } else {
        console.log('transactionApproved: unexpected operationType', data.transactionServiceNotification.operationType);
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
    this.initData(undefined);
    this.pager.init('', '');
    this.nextStage('order_details', 'Order details', 1, false);
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  handleAuthError(): void {
    this.nextStage('order_details', 'Order details', 1, false);
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private stageBack(): void {
    this.inProgress = false;
    const stage = this.pager.goBack();
    if (stage) {
      this.showSummary = stage.summary;
    }
  }

  private nextStage(id: string, name: string, stepId: number, summaryVisible: boolean): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.pager.nextStage(id, name, stepId, this.showSummary);
      this.showSummary = summaryVisible;
    }, 50);
  }

  removeStage(stage: string) {
    this.pager.removeStage(stage);
  }

  private loadUserParams(): void {
    this.errorMessage = '';
    const widgetData = this.dataService.getWidget(this.userParamsId).valueChanges.pipe(take(1));
    this.inProgress = true;
    this.pSubscriptions.add(
      widgetData.subscribe(({ data }) => {
        this.inProgress = false;
        this.initData(data.getWidget as WidgetShort);
        this.pager.init('order_details', 'Order details');
      }, (error) => {
        this.inProgress = false;
        this.initData(undefined);
        this.pager.init('order_details', 'Order details');
      })
    );
  }

  loadUserWallets(): void {
    this.errorMessage = '';
    this.inProgress = true;
    const walletData = this.profileService.getMyWallets([]).valueChanges.pipe(take(1));
    this.pSubscriptions.add(
      walletData.subscribe(({ data }) => {
        this.inProgress = false;
        const dataList = data.myWallets as AssetAddressShortListResult;
        if (dataList !== null) {
          const walletCount = dataList?.count as number;
          if (walletCount > 0) {
            this.userWallets = dataList?.list?.map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
          }
        }
        this.initData(undefined);
        this.pager.init('order_details', 'Order details');
      }, (error) => {
        this.inProgress = false;
        this.initData(undefined);
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

  orderDetailsComplete(email: string): void {
    if (this.summary.email === email) {
      this.desclaimerNext();
    } else {
      this.summary.transactionId = '';
      this.summary.fee = 0;
      this.summary.email = email;
      this.widgetService.authenticate(email, this.widget.widgetId);
    }
  }
  // =======================

  // == Disclaimer =========
  desclaimerBack(): void {
    this.stageBack();
  }

  desclaimerNext(): void {
    this.summary.agreementChecked = true;
    if (this.summary.transactionType === TransactionType.Withdrawal) {
      this.createWithdrawalTransaction();
    } else {
      this.widgetService.getSettingsCommon(this.summary, this.widget.widgetId);
    }
  }
  // ================

  // == Common settings ==
  settingsAuthRequired(email: string): void {
    this.widgetService.authenticate(this.summary.email, this.widget.widgetId);
  }

  settingsIdRequired(): void {
    this.nextStage('order_details', 'Order details', 1, true);
  }

  private settingsKycState(state: boolean): void {
    if (this.summary.quoteLimit !== 0) {
      this.widget.kycFirst = true;
    }
    this.requestKyc = state || this.summary.quoteLimit !== 0;
  }

  private settingsCommonComplete(providers: PaymentProviderInstrumentView[]): void {
    this.paymentProviders = providers.map(val => val);
    const nextStage = 4;
    if (this.widget.kycFirst && this.requestKyc) {
      this.nextStage('verification', 'Verification', nextStage, false);
    } else {
      if (this.paymentProviders.length < 1) {
        this.errorMessage = `No supported payment providers found for "${this.summary.currencyFrom}"`;
      } else if (this.paymentProviders.length > 1) {
        if (!this.notificationStarted) {
          this.startNotificationListener();
        }
        this.nextStage('payment', 'Payment info', nextStage, true);
      } else {
        this.selectProvider(this.paymentProviders[0].id);
      }
    }
  }
  // =====================

  // == Payment info ==
  paymentBack(): void {
    this.stageBack();
  }

  selectProvider(id: string) {
    if (id === 'Fibonatix') {
      this.createDepositTransaction(id, PaymentInstrument.CreditCard, '');
    } else if (id === 'InstantPay') {
      this.createDepositTransaction(id, PaymentInstrument.Apm, '');
    } else if (id === 'WireTransferPayment') {
      this.summary.providerView = this.paymentProviders.find(x => x.id === id);
      this.startPayment();
    } else {
      this.errorMessage = `Payment using ${id} is currenctly not supported`;
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
      accountType: data.selected.id
    };

    const settingsData = JSON.stringify(settings);
    this.createDepositTransaction('', PaymentInstrument.WireTransfer, settingsData);
  }

  sendWireTransaferMessageResult(): void {
    this.dialog.open(CommonDialogBox, {
      width: '450px',
      data: {
        title: 'Payment',
        message: 'Message has been sent successfully'
      }
    });
  }

  sendWireTransaferMessage(): void {
    this.widgetService.sendWireTransferMessage(
      this.summary.email,
      this.summary.transactionId,
      this.sendWireTransaferMessageResult.bind(this)
    )
  }

  // ====================

  // == Payment ===========
  processingComplete(): void {
    if (this.widget.embedded) {
      const details = new PaymentCompleteDetails();
      details.amount = parseFloat(this.summary.amountTo?.toFixed(this.summary.amountToPrecision) ?? '0');
      details.currency = this.summary.currencyTo;
      this.onComplete.emit(details);
    } else {
      if (this.requestKyc) {
        this.nextStage('verification', 'Verification', 5, false);
      } else {
        this.nextStage('complete', 'Complete', 6, false);
      }
    }
  }
  // ======================

  // == Auth ========
  onRegister(email: string): void {
    this.summary.email = email;
    this.nextStage('register', 'Authorization', 3, true);
  }

  registerBack(): void {
    this.stageBack();
  }

  onLoginRequired(email: string): void {
    const currentEmail = this.auth.user?.email ?? '';
    if (currentEmail !== email) {
      this.auth.logout();
      this.summary.transactionId = '';
      this.summary.fee = 0;
    }
    this.summary.email = email;
    if (this.summary.transactionId === '') {
      this.nextStage('login_auth', 'Authorization', 3, true);
    } else {
      this.startPayment();
    }
  }

  onCodeLoginRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('code_auth', 'Authorization', 3, true);
  }

  loginCodeConfirmed(): void {
    this.widgetService.getSettingsCommon(this.summary, this.widget.widgetId);
  }

  loginComplete(data: LoginResult): void {
    this.checkLoginResult(data);
  }

  loginBack(): void {
    this.stageBack();
  }
  // ====================

  // == Identification ==
  identificationComplete(data: LoginResult): void {
    this.auth.setLoginUser(data);
    this.summary.email = data.user?.email ?? '';
    this.widgetService.getSettingsCommon(this.summary, this.widget.widgetId);
  }

  identificationBack(): void {
    this.stageBack();
  }
  // ====================

  // == KYC =============
  kycBack(): void {
    this.stageBack();
  }

  kycComplete(): void {
    if (this.widget.kycFirst) {
      if (this.paymentProviders.length < 1) {
        this.errorMessage = `No supported payment providers found for "${this.summary.currencyFrom}"`;
      } else if (this.paymentProviders.length > 1) {
        this.nextStage('payment', 'Payment info', 5, true);
      } else {
        this.selectProvider(this.paymentProviders[0].id);
      }
    } else {
      this.nextStage('complete', 'Complete', 6, false);
    }
  }
  // ====================

  private checkLoginResult(data: LoginResult) {
    this.stopNotificationListener();
    if (data.user) {
      this.summary.email = data.user?.email;
    }
    if (data.authTokenAction === 'Default' || data.authTokenAction === 'KycRequired') {
      this.auth.setLoginUser(data);
      if (this.summary.agreementChecked) {
        if (this.summary.transactionId === '') {
          this.desclaimerNext();
        } else {
          this.startPayment();
        }
      } else {
        this.nextStage('disclaimer', 'Disclaimer', 2, false);
      }
    } else {
      this.errorMessage = `Unable to authenticate user with the action "${data.authTokenAction}"`;
    }
  }

  private createDepositTransaction(providerId: string, instrument: PaymentInstrument, instrumentDetails: string): void {
    this.errorMessage = '';
    this.inProgress = true;
    const tempStageId = this.pager.swapStage('initialization');
    this.initMessage = 'Processing...';
    if (this.summary) {
      let destination = this.summary.address;
      if (this.widget.widgetId !== '') {
        destination = this.widget.widgetId;
      }
      this.pSubscriptions.add(
        this.dataService.createTransaction(
          this.summary.transactionType,
          this.widget.source,
          this.summary.vaultId,
          this.summary.currencyFrom,
          this.summary.currencyTo,
          this.summary.amountFrom ?? 0,
          instrument,
          instrumentDetails,
          (instrument === PaymentInstrument.WireTransfer) ? '' : providerId,
          this.userParamsId,
          destination
        ).subscribe(({ data }) => {
          if (!this.notificationStarted) {
            this.startNotificationListener();
          }
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.instrument = instrument;
            this.summary.providerView = this.paymentProviders.find(x => x.id === providerId);
            this.summary.orderId = order.code as string;
            this.summary.fee = order.feeFiat as number ?? 0;
            this.summary.feeMinFiat = order.feeMinFiat as number ?? 0;
            this.summary.feePercent = order.feePercent as number ?? 0;
            this.summary.networkFee = order.approxNetworkFee ?? 0;
            this.summary.transactionDate = new Date().toLocaleString();
            this.summary.transactionId = order.transactionId as string;
            if (instrument === PaymentInstrument.WireTransfer) {
              this.nextStage('wire_transfer_result', 'Payment', 5, false);
            } else {
              this.startPayment();
            }
          } else {
            this.errorMessage = 'Order code is invalid';
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
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
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            }
          }
        })
      );
    }
  }

  private createWithdrawalTransaction(): void {
    this.errorMessage = '';
    this.inProgress = true;
    this.initMessage = 'Processing...';
    if (this.summary) {
      let destination = this.summary.address;
      if (this.widget.widgetId !== '') {
        destination = this.widget.widgetId;
      }
      this.pSubscriptions.add(
        this.dataService.createTransaction(
          TransactionType.Withdrawal,
          this.widget.source,
          '',
          this.summary.currencyFrom,
          '',
          this.summary.amountFrom ?? 0,
          undefined,
          '',
          '',
          this.userParamsId,
          ''
        ).subscribe(({ data }) => {
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.orderId = order.code as string;
            this.summary.fee = order.feeFiat as number ?? 0;
            this.summary.feeMinFiat = order.feeMinFiat as number ?? 0;
            this.summary.feePercent = order.feePercent as number ?? 0;
            this.summary.networkFee = order.approxNetworkFee ?? 0;
            this.summary.transactionDate = new Date().toLocaleString();
            this.summary.transactionId = order.transactionId as string;
            this.nextStage('complete', 'Complete', 6, false);
          } else {
            this.errorMessage = 'Order code is invalid';
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            }
          }
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            }
          }
        })
      );
    }
  }

  private startPayment(): void {
    if (this.summary.providerView?.id === 'Fibonatix') {
      this.nextStage('credit_card', 'Payment info', this.pager.step, true);
    } else if (this.summary.providerView?.id === 'InstantPay') {
      this.completeInstantpayTransaction(
        this.summary.transactionId,
        this.summary.providerView.id,
        this.summary.instrument ?? PaymentInstrument.Apm);
    } else if (this.summary.providerView?.id === 'WireTransferPayment') {
      this.widgetService.getWireTransferSettings(this.summary);
    } else {
      this.errorMessage = 'Invalid payment provider';
    }
  }

  private completeCreditCardTransaction(transactionId: string, provider: string, card: CardView): void {
    this.inProgress = true;
    this.iframeContent = '';
    this.pSubscriptions.add(
      this.dataService.preAuthCard(transactionId, PaymentInstrument.CreditCard, provider, card).subscribe(
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
          this.nextStage('processing-frame', 'Payment', this.pager.step, false);
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            }
          }
        }
      )
    );
  }

  private completeInstantpayTransaction(transactionId: string, provider: string, instrument: PaymentInstrument): void {
    this.inProgress = true;
    this.instantpayDetails = '';
    this.pSubscriptions.add(
      this.dataService.preAuth(transactionId, instrument, provider).subscribe(
        ({ data }) => {
          const preAuthResult = data.preauth as PaymentPreauthResultShort;
          const order = preAuthResult.order;
          this.summary.setPaymentInfo(instrument, order?.paymentInfo as string);
          if (preAuthResult.details) {
            this.instantpayDetails = preAuthResult.details as string;
          }
          this.inProgress = false;
          this.nextStage('processing-instantpay', 'Payment', this.pager.step, false);
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            }
          }
        }
      )
    );
  }

  private onWireTransferListLoaded(wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string): void {
    this.bankAccountId = bankAccountId;
    this.wireTransferList = wireTransferList;
    if (this.wireTransferList.length > 1) {
      this.nextStage('wire_transfer', 'Payment info', this.pager.step, true);
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
