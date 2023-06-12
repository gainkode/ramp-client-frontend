import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Widget, TransactionServiceNotificationType, LoginResult, CryptoInvoiceCreationResult } from 'model/generated-models';
import { InvoiceView, CheckoutSummary } from 'model/payment.model';
import { Subject, Subscription, timer } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { NotificationService } from 'services/notification.service';
import { PaymentDataService } from 'services/payment.service';
import { environment } from '@environments/environment';
import { WidgetSettings } from '../model/payment-base.model';
import { EnvService } from '../services/env.service';
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

  readonly DEFAULT_TIMEOUT = 600000;

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
  paymentSuccess = false;
  paymentTitle = '';
  notificationStarted = false;
  logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
  logoAlt = EnvService.product;
  abandonCounter = 0;

  private pSubscriptions: Subscription = new Subscription();
  private pNotificationsSubscription: Subscription | undefined = undefined;
  private abandonTimer = timer(0, 1000);
  private timerSubject = new Subject();

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
    this.startNotificationListener();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    this.stopNotificationListener();
  }

  private initData(data: Widget | undefined): void {
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
      this.widget.hideEmail = this.widget.email !== '';
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
      const userParams = JSON.parse(data.currentUserParams ?? '{}');
      if (userParams) {
        if (userParams.params) {
          this.widget.currencyFrom = userParams.params.currency ?? '';
          this.widget.amountFrom = userParams.params.amount ?? 0;
          this.widget.hideAmountFrom = (this.widget.currencyFrom !== '' && this.widget.amountFrom !== 0);
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
    console.log('startNotificationListener');
    this.notificationStarted = true;
    this.pNotificationsSubscription = this.notification.subscribeToTransactionNotifications().subscribe(
      ({ data }) => {
        console.log('Transaction notification received', data);
        this.handleTransactionSubscription(data);
      },
      (error) => {
        this.notificationStarted = false;
        // there was an error subscribing to notifications
        setTimeout(() => {
          console.error('[1] startNotificationListener error', error);
          if (!environment.production) {
            console.error('Notifications error', error);
          }
          if (error.message === 'Access denied') {
            this.pSubscriptions.add(
              this.auth.refreshToken().subscribe(
                ({ data }) => {
                  console.log('Token refreshed');
                  setTimeout(() => {
                    this.pSubscriptions.add(
                      this.notification.subscribeToTransactionNotifications().subscribe(
                        ({ data }) => {
                          console.log('Transaction notification received', data);
                          this.handleTransactionSubscription(data);
                        },
                        (error) => {
                          console.error('[2] startNotificationListener error', error);
                          window.location.reload();
                        }
                      )
                    );
                  }, 500);
                },
                (error) => {
                  console.error('Refresh token error: ', error);
                }
              )
            );
          }
        }, 500);
      }
    );
  }

  private stopNotificationListener(): void {
    console.log('stopNotificationListener');
    if (this.pNotificationsSubscription) {
      this.pNotificationsSubscription.unsubscribe();
    }
    this.pNotificationsSubscription = undefined;
    this.notificationStarted = false;
  }

  private handleTransactionSubscription(data: any): void {
    const transaction = data.transactionServiceNotification;
    if (transaction && this.invoice) {
      if (this.invoice.id === transaction.invoice) {
        this.paymentSuccess = true;
        if (transaction.type === TransactionServiceNotificationType.CryptoFullPaid) {
          this.paymentComplete = true;
          this.paymentTitle = 'Complete';
          this.nextStage('payment_done', 'Complete', 6);
        } else if (transaction.type === TransactionServiceNotificationType.CryptoPartPaid) {
          this.invoice.restAmount = transaction.restAmount ?? 0;
          this.paymentComplete = false;
          this.paymentTitle = 'Payment in progress';
          this.nextStage('payment_done', 'Payment in progress', 5);
        }
      } else if (transaction.operationType === 'test-operation-type') {
        this.paymentSuccess = true;
        if (transaction.type === TransactionServiceNotificationType.CryptoFullPaid) {
          this.paymentComplete = true;
          this.paymentTitle = 'Complete Test';
          this.nextStage('payment_done', 'Complete', 6);
        } else if (transaction.type === TransactionServiceNotificationType.CryptoPartPaid) {
          this.invoice.restAmount = transaction.restAmount ?? 0;
          this.paymentComplete = false;
          this.paymentTitle = 'Payment Test in progress';
          this.nextStage('payment_done', 'Payment in progress', 5);
        }
      }
    }
  }

  resetWizard(): void {
    this.inProgress = false;
    this.requiredExtraData = false;
    this.paymentSuccess = false;
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
        this.initData(data.getWidget as Widget);
        if (this.widget.hideEmail && this.widget.hideAmountFrom) {
          const transactionData = new CheckoutSummary();
          transactionData.initialized = true;
          transactionData.amountFrom = this.widget.amountFrom;
          transactionData.amountFromPrecision = 8;
          transactionData.currencyFrom = this.widget.currencyFrom;
          transactionData.email = this.widget.email;
          this.orderDetailsComplete(transactionData);
        } else {
          this.pager.init('order_details', 'Order details');
        }
      }, (error) => {
        this.inProgress = false;
        this.initData(undefined);
        this.pager.init('order_details', 'Order details');
      })
    );
  }

  // == Order details page ==
  orderDetailsComplete(data: CheckoutSummary): void {
    //this.stopNotificationListener();
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
    this.widgetService.getSettingsCommon(this.summary, this.widget, false);
  }

  identificationBack(): void {
    this.stageBack();
  }
  // ====================

  // ======= KYC ========
  kycBack(): void {
    this.stageBack();
  }

  kycComplete(): void {
    if (this.widget.kycFirst) {

    } else {
      this.nextStage('complete', 'Complete', 4);
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
      this.startNotificationListener();
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
    this.paymentSuccess = false;
    this.paymentComplete = false;
    this.pSubscriptions.add(
      this.dataService.createInvoice(this.userParamsId, this.summary.currencyFrom, this.summary.amountFrom ?? 0).subscribe(
        ({ data }) => {
          this.inProgress = false;
          this.invoice = new InvoiceView(data.createInvoice as CryptoInvoiceCreationResult);
          console.log(data);
          setTimeout(() => {
            //this.startNotificationListener();
            this.startAbandonTimer();
            this.nextStage('order_complete', 'Complete', 4);
          }, 500);
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

  private startAbandonTimer(): void {
    let timeout = this.DEFAULT_TIMEOUT;
    this.pSubscriptions.add(
      this.auth.getSettingsCommon().valueChanges.subscribe(
        ({ data }) => {
          this.inProgress = false;
          const settingsDataString = data.getSettingsCommon.additionalSettings;
          let settingsData = JSON.parse(settingsDataString ?? '{}');
          if (typeof settingsData === 'string') {
            settingsData = JSON.parse(settingsData);
          }
          timeout = settingsData?.cryptoWidget?.paymentTimeout ?? this.DEFAULT_TIMEOUT;
          this.startConfirmedAbandonTimer(timeout);
        }, (error) => {
          this.inProgress = false;
          this.startConfirmedAbandonTimer(timeout);
        }
      )
    );
  }

  private startConfirmedAbandonTimer(interval: number): void {
    console.log(interval);
    this.abandonCounter = interval / 1000;
    this.pSubscriptions.add(
      this.abandonTimer.pipe(takeUntil(this.timerSubject)).subscribe(val => {
        if (this.abandonCounter > 1) {
          this.abandonCounter--;
        } else {
          this.abandonInvoiceTimer();
        }
      })
    );
  }

  private abandonInvoiceTimer(): void {
    this.timerSubject.next();
    this.pSubscriptions.add(
      this.dataService.abandonCryptoInvoice(this.invoice?.invoiceId ?? '').subscribe(
        ({ data }) => {
          this.inProgress = false;
          this.paymentSuccess = false;
          this.paymentComplete = true;
          this.paymentTitle = 'Time is out';
          this.nextStage('payment_done', 'Complete', 6);
        }, (error) => {
          this.inProgress = false;
        }
      )
    );
  }

  sendTestNotification(complete: boolean): void {
    const notificationRequest$ = this.notification.sendTestTransactionNotification(
      complete ?
        TransactionServiceNotificationType.CryptoFullPaid :
        TransactionServiceNotificationType.CryptoPartPaid);
    this.pSubscriptions.add(
      notificationRequest$.subscribe(
        ({ data }) => {
        }, (error) => {
          alert(error);
        }
      )
    );
  }
}
