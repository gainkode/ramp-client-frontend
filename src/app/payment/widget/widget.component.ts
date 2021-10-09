import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginResult, Rate } from 'src/app/model/generated-models';
import { CheckoutSummary, WidgetSettings, WidgetStage } from 'src/app/model/payment.model';
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
    // this.widget.email = 'mister@twister.com';
    // this.widget.transaction = TransactionType.Deposit;
    // this.widget.walletAddress = 'mkBUjw37y46goULToq6b7y6ciJc3Qi32YM';
    // temp

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
      this.nextStage('login_auth', 'Autorization', 3, true);
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
    this.pSubscriptions.unsubscribe();
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
 
  orderDetailsComplete(): void {
    this.nextStage('disclaimer', 'Disclaimer', 2, false);
  }
  // =======================

  // == Payment ============

  paymentComplete(data: CheckoutSummary): void {
    this.summary.provider = data.provider;
    this.summary.instrument = data.instrument;
    this.summary.card = data.card;
  }

  // =======================

  // == Disclaimer =========

  desclaimerBack(): void {
    this.stageBack();
  }

  desclaimerNext(): void {
    this.summary.agreementChecked = true;
    let needToLogin = true;
    if (this.summary.email) {
      needToLogin = (!this.auth.authenticated);
    }
    if (needToLogin) {
      this.nextStage('identification', 'Autorization', 3, true);
    } else {
      this.nextStage('verification', 'Verification', 5, false);
    }
  }

  // ================

  onRegister(email: string): void {
    this.summary.email = email;
    this.nextStage('register', 'Autorization', 3, true);
  }

  registerComplete(email: string): void {
    this.summary.email = email;
    this.nextStage('login_auth', 'Autorization', 3, true);
  }

  registerBack(): void {
    this.stageBack();
  }

  onLoginRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('login_auth', 'Autorization', 3, true);
  }

  onConfirmRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('code_auth', 'Autorization', 3, true);
  }

  // == Identification ==

  identificationComplete(data: LoginResult): void {
    this.auth.setLoginUser(data);
    this.summary.email = data.user?.email ?? '';
    this.inProgress = true;
    // this.pSubscriptions.add(
    //   this.auth.getSettingsCommon().valueChanges.subscribe((settings) => {
    //     this.inProgress = false;
    //     if (this.auth.user !== null) {
    //       const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
    //       this.auth.setLocalSettingsCommon(settingsCommon);
    //       this.needToLogin = false;
    //       if (this.stepper) {
    //         this.stepper?.next();
    //       }
    //     }
    //   }, (error) => {
    //     this.inProgress = false;
    //     if (this.auth.token !== '') {
    //       this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load common settings');
    //     } else {
    //       this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
    //     }
    //   })
    // );
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

  loginComplete(data: LoginResult): void {
    if (data) {
      // auth success

      // remove identification stage from history
      const stageIndex = this.stages.findIndex(x => x.id === 'identification');
      if (stageIndex > -1) {
        this.stages.splice(stageIndex, 1);
      }
    } else {
      // need to register
    }
  }

  loginBack(): void {
    this.stageBack();
  }
}
