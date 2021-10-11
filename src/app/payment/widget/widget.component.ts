import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginResult, Rate } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, WidgetSettings, WidgetStage } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';

@Component({
  selector: 'app-widget',
  templateUrl: 'widget.component.html',
  styleUrls: ['../../../assets/button.scss', '../../../assets/payment.scss'],
})
export class WidgetComponent implements OnInit {
  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }

  errorMessage = '';
  rateErrorMessage = '';
  inProgress = false;
  internalPayment = false;
  initState = true;
  showSummary = true;
  mobileSummary = false;
  stageId = 'order_details';
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();
  widget = new WidgetSettings();
  stages: WidgetStage[] = [];
  exchangeRateCountDownTitle = '';
  exchangeRateCountDownValue = '';

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private exhangeRate: ExchangeRateService,
    private auth: AuthService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    // temp
    // this.widget.email = 'tugaymv@gmail.com';
    // this.widget.transaction = TransactionType.Deposit;
    // this.widget.walletAddress = 'mkBUjw37y46goULToq6b7y6ciJc3Qi32YM';
    // temp

    if (this.widget.email) {
      console.log('this.widget.email', this.widget.email);
      this.summary.email = this.widget.email;
    } else {
      const user = this.auth.user;
      console.log('user', user);
      if (user) {
        this.summary.email = this.auth?.user?.email ?? '';
      } else {
        this.auth.logout();
      }
    }
    if (this.widget.transaction) {
      this.summary.transactionType = this.widget.transaction;
    }
    if (this.widget.walletAddress) {
      this.summary.address = this.widget.walletAddress;
    }

    this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    this.exhangeRate.stop();
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
    this.exchangeRateCountDownTitle = countDownTitle;
    this.exchangeRateCountDownValue = countDownValue;
    this.rateErrorMessage = error;
    if (rate) {
      this.summary.exchangeRate = rate;
    }
  }

  handleError(message: string): void {
    this.errorMessage = message;
  }

  handleAuthError(): void {
    if (this.stages.length > 0) {
      this.removeLastStage();
      this.nextStage('identification', 'Authorization', 3, true);
    }
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private removeLastStage(): WidgetStage {
    return this.stages.splice(this.stages.length - 1, 1)[0];
  }

  private stageBack(): void {
    if (this.stages.length > 0) {
      const lastStage = this.removeLastStage();
      this.errorMessage = '';
      this.stageId = lastStage.id;
      this.title = lastStage.title;
      this.step = lastStage.step;
      this.showSummary = lastStage.summary;
    }
  }

  private nextStage(id: string, name: string, stepId: number, summaryVisible: boolean): void {
    if (
      this.stageId !== 'register' &&
      this.stageId !== 'login_auth' &&
      this.stageId !== 'code_auth') {
      this.stages.push({
        id: this.stageId,
        title: this.title,
        step: this.step,
        summary: this.showSummary
      } as WidgetStage);
    }
    this.errorMessage = '';
    this.stageId = id;
    this.title = name;
    this.step = stepId;
    this.showSummary = summaryVisible;
  }

  removeStage(stage: string) {
    const stageIndex = this.stages.findIndex(x => x.id === stage);
    if (stageIndex > -1) {
      this.stages.splice(stageIndex, 1);
    }
  }

  // == Order details page ==

  orderDetailsChanged(data: CheckoutSummary): void {
    if (this.initState && (data.amountFrom || data.amountTo)) {
      this.initState = false;
    }
    this.summary.initialized = true;
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

  orderDetailsComplete(): void {
    this.nextStage('disclaimer', 'Disclaimer', 2, false);
  }
  // =======================

  // == Disclaimer =========

  desclaimerBack(): void {
    this.stageBack();
  }

  desclaimerNext(): void {
    this.summary.agreementChecked = true;
    this.getSettingsCommon();
  }

  // ================

  // == Payment info ==

  paymentBack(): void {
    this.stageBack();
  }

  paymentComplete(data: CheckoutSummary): void {
    this.summary.provider = data.provider;
    this.summary.orderId = data.orderId;
    this.summary.fee = data.fee;
    this.summary.feeMinFiat = data.feeMinFiat;
    this.summary.feePercent = data.feePercent;
    this.summary.transactionDate = data.transactionDate;
    this.nextStage('credit-card', 'Payment info', 4, true);
  }

  // ====================

  // == Credit card ==

  creditCardPaymentComplete(data: CardView): void {

  }

  creditCardBack(): void {
    this.stageBack();
  }

  // ====================

  // == Auth ========

  onRegister(email: string): void {
    this.summary.email = email;
    this.nextStage('register', 'Authorization', 3, true);
  }

  registerComplete(email: string): void {
    this.summary.email = email;
    this.nextStage('login_auth', 'Authorization', 3, true);
  }

  registerBack(): void {
    this.stageBack();
  }

  onLoginRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('login_auth', 'Authorization', 3, true);
  }

  onConfirmRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('code_auth', 'Authorization', 3, true);
  }

  loginCodeConfirmed(): void {
    this.getSettingsCommon();
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
    this.authenticate(this.summary.email);
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
    this.nextStage('complete', 'Complete', 6, false);
  }

  // ====================

  private getSettingsCommon(): void {


    console.log(this.summary.email);


    this.errorMessage = '';
    if (this.auth.token === '') {
      if (this.summary.email) {
        this.authenticate(this.summary.email);
      } else {
        this.nextStage('identification', 'Authorization', 3, true);
      }
    } else {
      this.inProgress = true;
      const dataGetter = this.auth.getSettingsCommon();
      if (dataGetter) {
        this.pSubscriptions.add(
          dataGetter.valueChanges.subscribe((settings) => {
            this.inProgress = false;
            this.nextStage('payment', 'Payment info', 4, true);
          }, (error) => {
            this.inProgress = false;
            if (error.message === 'Access denied') {
              if (this.summary.email) {
                this.authenticate(this.summary.email);
              } else {
                this.nextStage('identification', 'Authorization', 3, true);
              }
            } else {
              this.errorMessage = this.errorHandler.getError(error.message, 'Unable to read settings');
            }
          })
        );
      } else {
        this.errorMessage = this.errorHandler.getRejectedCookieMessage();
      }
    }
  }

  private authenticate(login: string) {
    this.errorMessage = '';
    this.inProgress = true;
    // Consider that the user is one-time wallet user rather than internal one
    this.pSubscriptions.add(
      this.auth.authenticate(login, '', true).subscribe(({ data }) => {
        this.inProgress = false;
        this.checkLoginResult(data.login as LoginResult);
      }, (error) => {
        this.inProgress = false;
        if (this.errorHandler.getCurrentError() === 'auth.password_null_or_empty') {
          // Internal user cannot be authorised without a password, so need to
          //  show the authorisation form to fill
          this.auth.logout();
          this.nextStage('login_auth', 'Authorization', 3, true);
        } else if (this.errorHandler.getCurrentError() === 'auth.unconfirmed_email') {
          // User has to confirm email verifying the code
          if (login === '') {
            this.nextStage('code_auth', 'Authorization', 3, true);
          } else {
            this.errorMessage = 'Your email is not confirmed. Follow the link in the email message we have sent in order to confirm your email';
          }
        } else {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
        }
      })
    );
  }

  checkLoginResult(data: LoginResult) {
    if (data.authTokenAction === 'Default' || data.authTokenAction === 'KycRequired') {
      this.auth.setLoginUser(data);
      this.nextStage('payment', 'Payment info', 4, true);
    } else {
      this.errorMessage = `Unable to authenticate user with the action "${data.authTokenAction}"`;
    }
  }
}
