import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetAddressShortListResult, PaymentInstrument, PaymentPreauthResultShort, Rate, TransactionShort, TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, PaymentCompleteDetails, PaymentProviderView, WidgetSettings } from 'src/app/model/payment.model';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { WalletItem } from '../model/wallet.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ProfileDataService } from '../services/profile.service';
import { WidgetPagerService } from '../services/widget-pager.service';

@Component({
  selector: 'app-transfer-widget',
  templateUrl: 'transfer.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class TransferWidgetComponent implements OnInit {
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();

  errorMessage = '';
  rateErrorMessage = '';
  inProgress = false;
  internalPayment = false;
  initState = true;
  showSummary = true;
  mobileSummary = false;
  initMessage = 'Initialization...';
  summary = new CheckoutSummary();
  widget = new WidgetSettings();
  userWallets: WalletItem[] = [];
  exchangeRateCountDownTitle = '';
  exchangeRateCountDownValue = '';
  paymentProviders: PaymentProviderView[] = [];
  requestKyc = false;
  readCommonSettings = false;
  iframeContent = '';
  instantpayDetails = '';
  paymentComplete = false;
  notificationStarted = false;

  private pSubscriptions: Subscription = new Subscription();
  private pNotificationsSubscription: Subscription | undefined = undefined;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private exhangeRate: ExchangeRateService,
    public pager: WidgetPagerService,
    private notification: NotificationService,
    private auth: AuthService,
    private dataService: PaymentDataService,
    private profileService: ProfileDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.initMessage = 'Initialization...';
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
    this.initMessage = 'Initialization...';
    this.summary.agreementChecked = true;
    const user = this.auth.user;
    if (user) {
      this.summary.email = this.auth?.user?.email ?? '';
      this.widget.email = this.summary.email;
    }
    this.summary.transactionType = TransactionType.Deposit;
    this.widget.transaction =  this.summary.transactionType;
  }

  private startExchangeRate(): void {
    this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  private startNotificationListener(): void {
    //this.stopNotificationListener();
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
    this.initData();
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
    const store = (id !== 'initialization' && id !== 'register' && id !== 'login_auth' && id !== 'code_auth');
    setTimeout(() => {
      this.errorMessage = '';
      this.pager.nextStage(id, name, stepId, this.showSummary, store);
      this.showSummary = summaryVisible;
    }, 50);
  }

  removeStage(stage: string) {
    this.pager.removeStage(stage);
  }

  loadUserWallets(): void {
    this.errorMessage = '';
    this.inProgress = true;
    const walletData = this.profileService.getMyWallets([]);
    if (walletData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.pSubscriptions.add(
        walletData.valueChanges.subscribe(({ data }) => {
          this.inProgress = false;
          const dataList = data.myWallets as AssetAddressShortListResult;
          if (dataList !== null) {
            const walletCount = dataList?.count as number;
            if (walletCount > 0) {
              this.userWallets = dataList?.list?.
                map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
            }
          }
          this.initData();
          this.pager.init('order_details', 'Order details');
        }, (error) => {
          this.inProgress = false;
          this.initData();
          this.pager.init('order_details', 'Order details');
        })
      );
    }
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
    if (currencyFromChanged || currencyToChanged) {
      this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
      this.exhangeRate.update();
    }
  }

  orderWalletChanged(data: string | undefined): void {
    this.summary.address = data ?? '';
  }

  orderDetailsComplete(email: string): void {
    this.getSettingsCommon();
  }
  // =======================

  // == Common settings ==
  settingsAuthRequired(email: string): void {
    this.readCommonSettings = false;
    this.onLoginRequired(email);
  }

  settingsIdRequired(): void {
    this.readCommonSettings = false;
    setTimeout(() => {
      this.nextStage('order_details', 'Order details', 1, true);
    }, 100);
  }

  settingsLoginRequired(email: string): void {
    this.readCommonSettings = false;
    this.onLoginRequired(email);
  }

  settingsKycState(state: boolean): void {
    this.requestKyc = state;
  }

  settingsCommonComplete(providers: PaymentProviderView[]): void {
    this.readCommonSettings = false;
    this.paymentProviders = providers.map(val => val);
    setTimeout(() => {
      const nextStage = 4;
      if (this.requestKyc) {
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
    }, 100);
  }
  // =====================

  // == Payment info ==
  paymentBack(): void {
    this.stageBack();
  }

  selectProvider(id: string) {
    if (id === 'Fibonatix') {
      this.createTransaction(id, PaymentInstrument.CreditCard);
    } else if (id === 'InstantPay') {
      this.createTransaction(id, PaymentInstrument.BankTransfer);
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

  creditCardBack(): void {
    this.stageBack();
  }
  // ====================

  // == Payment ===========
  processingComplete(): void {
    const details = new PaymentCompleteDetails();
    details.amount = parseFloat(this.summary.amountTo?.toFixed(this.summary.amountToPrecision) ?? '0');
    details.currency = this.summary.currencyTo;
    this.onComplete.emit(details);
  }
  // ======================

  // == Auth ========
  onLoginRequired(email: string): void {
    this.router.navigateByUrl('/');
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
      this.nextStage('payment', 'Payment info', 5, true);
    } else {
      this.selectProvider(this.paymentProviders[0].id);
    }
  }
  // ====================

  private getSettingsCommon(): void {
    this.readCommonSettings = true;
  }

  private createTransaction(providerId: string, instrument: PaymentInstrument): void {
    this.errorMessage = '';
    this.inProgress = true;
    const tempStageId = this.pager.swapStage('initialization');
    this.initMessage = 'Processing...';
    if (this.summary) {
      let destination = this.summary.address;
      this.pSubscriptions.add(
        this.dataService.createTransaction(
          this.summary.transactionType,
          TransactionSource.Wallet,
          '',
          this.summary.currencyFrom,
          this.summary.currencyTo,
          this.summary.amountFrom ?? 0,
          instrument,
          providerId,
          '',
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
            this.startPayment();
          } else {
            this.errorMessage = 'Order code is invalid';
            this.pager.swapStage(tempStageId);
          }
        }, (error) => {
          this.inProgress = false;
          this.pager.swapStage(tempStageId);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
          }
        })
      );
    }
  }

  private getTiers(): void {
    this.errorMessage = '';
    this.inProgress = true;
    let amount = 0;
    let amountCurrency = '';
    if (this.summary.transactionType === TransactionType.Deposit) {
      amount = this.summary.amountFrom ?? 0;
      amountCurrency = this.summary.currencyFrom;
    } else if (this.summary.transactionType === TransactionType.Withdrawal) {
      amount = this.summary.amountTo ?? 0;
      amountCurrency = this.summary.currencyTo;
    }
    const tiersData = this.dataService.getAppropriateSettingsKycTiers(amount, amountCurrency, TransactionSource.Widget, '');
    if (tiersData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.pSubscriptions.add(
        tiersData.valueChanges.subscribe(({ data }) => {
          this.inProgress = false;
          //this.startPayment();
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to get tiers');
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
        this.summary.instrument ?? PaymentInstrument.BankTransfer);
    } else {
      this.errorMessage = 'Invalid payment provider';
    }
  }

  private completeCreditCardTransaction(transactionId: string, provider: string, card: CardView): void {
    this.inProgress = true;
    this.iframeContent = '';
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
        }
      }
    );
  }

  private completeInstantpayTransaction(transactionId: string, provider: string, instrument: PaymentInstrument): void {
    this.inProgress = true;
    this.instantpayDetails = '';
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
        }
      }
    );
  }
}
