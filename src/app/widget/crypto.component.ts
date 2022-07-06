import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShortListResult, CryptoInvoice, LoginResult, PaymentInstrument, PaymentPreauthResultShort, Rate, TransactionShort, TransactionSource, TransactionType, UserMode, WidgetShort } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, InvoiceView, PaymentProviderInstrumentView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { CommonDialogBox } from '../components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from '../model/cost-scheme.model';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { WalletItem } from '../model/wallet.model';
import { CommonDataService } from '../services/common-data.service';
import { EnvService } from '../services/env.service';
import { ProfileDataService } from '../services/profile.service';
import { WidgetPagerService } from '../services/widget-pager.service';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-crypto-widget',
  templateUrl: 'crypto.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class CryptoWidgetComponent implements OnInit {
  @Input() userParamsId = '';
  @Input() settings: WidgetSettings | undefined = undefined;

  errorMessage = '';
  transactionErrorTitle = '';
  transactionErrorMessage = '';
  invoice: InvoiceView | undefined = undefined;
  inProgress = false;
  initState = true;
  requiredExtraData = false;
  initMessage = 'Loading...';
  summary = new CheckoutSummary();
  widget = new WidgetSettings();
  paymentComplete = false;
  notificationStarted = false;
  logoSrc = `${EnvService.image_host}/images/logo-color.png`;
  logoAlt = EnvService.product;

  private pSubscriptions: Subscription = new Subscription();
  private pNotificationsSubscription: Subscription | undefined = undefined;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public router: Router,
    public dialog: MatDialog,
    public pager: WidgetPagerService,
    private widgetService: WidgetService,
    private notification: NotificationService,
    public auth: AuthService,
    private dataService: PaymentDataService,
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
      undefined,
      undefined,
      undefined
    );
    this.initMessage = 'Loading...';
    this.pager.init('initialization', 'Initialization');
    this.loadUserParams();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    this.stopNotificationListener();
  }

  private initData(data: WidgetShort | undefined): void {
    this.requiredExtraData = false;
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
    } else {  // Quick checkout w/o parameters
      if (!this.widget.embedded) {
        this.widget.disclaimer = false;
        this.widget.kycFirst = false;
        this.widget.email = '';
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
  }

  private startNotificationListener(): void {
    this.notificationStarted = true;
    this.pNotificationsSubscription = this.notification.subscribeToTransactionNotifications().subscribe(
      ({ data }) => {
        this.handleTransactionSubscription(data);
      },
      (error) => {
        this.notificationStarted = false;
        // there was an error subscribing to notifications
        console.error('Notifications error', error);
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
    // if (data.transactionServiceNotification.operationType === 'preauth' ||
    //   data.transactionServiceNotification.operationType === 'approved') {
    //   res = true;
    // } else {
    //   console.error('transactionApproved: unexpected operationType', data.transactionServiceNotification.operationType);
    // }

    this.nextStage('payment_done', 'Complete', 6);

    this.paymentComplete = true;
  }

  resetWizard(): void {
    this.inProgress = false;
    this.requiredExtraData = false;
    this.paymentComplete = false;
    this.summary.reset();
    this.initData(undefined);
    this.pager.init('', '');
    this.nextStage('order_details', 'Order details', 2);
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  handleAuthError(): void {
    this.nextStage('order_details', 'Order details', 2);
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private stageBack(): void {
    this.inProgress = false;
    this.pager.goBack();
  }

  private nextStage(id: string, name: string, stepId: number): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.pager.nextStage(id, name, stepId, false);
      this.inProgress = false;
      this.changeDetector.detectChanges();
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

  // == Order details page ==
  orderDetailsComplete(data: CheckoutSummary): void {
    this.stopNotificationListener();
    if (this.initState && (data.amountFrom)) {
      this.initState = false;
    }
    this.summary.initialized = true;
    const amountFromTemp = (data.amountFrom) ? data.amountFrom?.toFixed(8) : undefined;
    this.summary.amountFrom = (amountFromTemp) ? parseFloat(amountFromTemp) : undefined;
    this.summary.amountFromPrecision = data.amountFromPrecision;
    this.summary.currencyFrom = data.currencyFrom;
    this.summary.email = data.email;
    if (this.summary.email === this.auth.user?.email) {
      this.createTransaction();
    } else {
      this.widgetService.authenticate(data.email, this.widget.widgetId);
    }
  }
  // =======================

  // == Disclaimer =========
  desclaimerBack(): void {
    this.stageBack();
  }

  desclaimerNext(): void {
    this.summary.agreementChecked = true;
  }
  // ================

  // == Common settings ==
  settingsAuthRequired(email: string): void {
    this.widgetService.authenticate(this.summary.email, this.widget.widgetId);
  }

  settingsIdRequired(): void {
    this.nextStage('order_details', 'Order details', 2);
  }

  // == Auth ========
  onRegister(email: string): void {
    this.summary.email = email;
    this.nextStage('register', 'Authorization', 3);
  }

  registerBack(): void {
    this.stageBack();
  }

  onLoginRequired(email: string): void {
    if (this.widget.embedded) {
      this.router.navigateByUrl('/');
    } else {
      const currentEmail = this.auth.user?.email ?? '';
      if (currentEmail !== email) {
        this.auth.logout();
        this.summary.transactionId = '';
        this.summary.fee = 0;
      }
      this.summary.email = email;
      this.nextStage('login_auth', 'Authorization', 3);
    }
  }

  onCodeLoginRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('code_auth', 'Authorization', 3);
  }

  loginCodeConfirmed(): void {
    this.createTransaction();
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
    this.widgetService.getSettingsCommon(this.summary, this.widget.widgetId, false);
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

    } else {
      this.nextStage('complete', 'Complete', 5);
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
      this.createTransaction();
    } else if (data.authTokenAction === 'UserInfoRequired') {
      this.auth.setLoginUser(data);
      this.requiredExtraData = true;
      this.nextStage('login_auth', 'Authorization', 3);
    } else {
      this.errorMessage = `Unable to authenticate user with the action "${data.authTokenAction}"`;
    }
  }

  private createTransaction(): void {
    this.inProgress = true;
    this.pSubscriptions.add(
      this.dataService.createInvoice(this.widget.widgetId, this.summary.currencyFrom, this.summary.amountFrom ?? 0).subscribe(
        ({ data }) => {
          this.inProgress = false;
          this.invoice = new InvoiceView(data.createInvoice as CryptoInvoice);
          this.startNotificationListener();
          this.nextStage('order_complete', 'Complete', 5);
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to handle your order');
            this.showTransactionError('Transaction handling failed', this.errorMessage);
          }
        }
      )
    );
  }

  private showTransactionError(messageTitle: string, messageText: string): void {
    this.transactionErrorMessage = messageText;
    this.transactionErrorTitle = messageTitle;
    this.nextStage('error', 'Error', 6);
  }
}
