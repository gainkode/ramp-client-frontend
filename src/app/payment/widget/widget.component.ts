import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginResult, PaymentInstrument, Rate, TransactionDestinationType, TransactionShort, TransactionType } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, PaymentProviderView, WidgetSettings, WidgetStage } from 'src/app/model/payment.model';
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
  paymentProviders: PaymentProviderView[] = [];
  requestKyc = false;
  readCommonSettings = false;

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private exhangeRate: ExchangeRateService,
    private auth: AuthService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    // temp
    //this.widget.kycFirst = true;
    //this.widget.email = 'tugaymv@gmail.com';
    this.widget.transaction = TransactionType.Deposit;
    //this.widget.walletAddress = 'mkBUjw37y46goULToq6b7y6ciJc3Qi32YM';
    // temp

    if (this.widget.email) {
      this.summary.email = this.widget.email;
    } else {
      const user = this.auth.user;
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
    this.changeDetector.detectChanges();
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
    this.inProgress = false;
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
    //console.log('stage', this.stageId, '=>', id);
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
    if (this.widget.email === '') {
      this.nextStage('identification', 'Authorization', 3, true);
    } else {
      this.getSettingsCommon();
    }
  }

  // ================

  // == Common settings ==
  settingsAuthRequired(email: string): void {
    this.readCommonSettings = false;
    setTimeout(() => {
      this.authenticate(this.summary.email);
    }, 100);
  }

  settingsIdRequired(): void {
    this.readCommonSettings = false;
    setTimeout(() => {
      this.nextStage('identification', 'Authorization', 3, true);
    }, 100);
  }

  settingsLoginRequired(email: string): void {
    this.readCommonSettings = false;
    this.onLoginRequired(this.summary.email);
  }

  settingsKycState(state: boolean): void {
    this.requestKyc = state;
  }

  settingsCommonComplete(providers: PaymentProviderView[]): void {
    this.readCommonSettings = false;
    setTimeout(() => {
      this.summary.fee = 0;
      const nextStage = 4;
      if (this.widget.kycFirst && this.requestKyc) {
        this.nextStage('verification', 'Verification', nextStage, false);
      } else {
        this.paymentProviders = providers.map(val => val);
        if (this.paymentProviders.length < 1) {
          this.errorMessage = `No supported payment providers found for "${this.summary.currencyFrom}"`;
        } else if (this.paymentProviders.length > 1) {
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
    } else {
      this.errorMessage = `Payment using ${id} is currenctly not supported`;
    }
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

  registerBack(): void {
    this.stageBack();
  }

  onLoginRequired(email: string): void {
    this.auth.logout();
    this.summary.email = email;
    setTimeout(() => {
      this.nextStage('login_auth', 'Authorization', 3, true);
    }, 50);
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
    this.getSettingsCommon();
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
    this.readCommonSettings = true;
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
          this.onLoginRequired(login);
        } else if (this.errorHandler.getCurrentError() === 'auth.unconfirmed_email') {
          // User has to confirm email verifying the code
          this.onConfirmRequired(login);
        } else {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
        }
      })
    );
  }

  private checkLoginResult(data: LoginResult) {
    if (data.authTokenAction === 'Default' || data.authTokenAction === 'KycRequired') {
      this.auth.setLoginUser(data);
      this.getSettingsCommon();
    } else {
      this.errorMessage = `Unable to authenticate user with the action "${data.authTokenAction}"`;
    }
  }

  private createTransaction(providerId: string, instrument: PaymentInstrument): void {
    this.errorMessage = '';
    this.inProgress = true;
    if (this.summary) {
      let destinationType = TransactionDestinationType.Address;
      let destination = this.summary.address;
      if (this.widget.affiliateCode !== '') {
        destinationType = TransactionDestinationType.Widget;
        destination = this.widget.affiliateCode;
      }
      this.pSubscriptions.add(
        this.dataService.createQuickCheckout(
          this.summary.transactionType,
          this.summary.currencyFrom,
          this.summary.currencyTo,
          this.summary.amountFrom ?? 0,
          instrument,
          providerId,
          destinationType,
          destination
        ).subscribe(({ data }) => {
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.providerView = this.paymentProviders.find(x => x.id === providerId);
            this.summary.orderId = order.code as string;
            this.summary.fee = order.feeFiat;
            this.summary.feeMinFiat = order.feeMinFiat;
            this.summary.feePercent = order.feePercent;
            this.summary.transactionDate = new Date().toLocaleString();
            if (providerId === 'Fibonatix') {
              this.nextStage('credit_card', 'Payment info', this.step, true);
            } else {
              this.errorMessage = 'Invalid payment provider';
            }
          } else {
            this.errorMessage = 'Order code is invalid';
          }
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
          }
        })
      );
    }
  }
}
