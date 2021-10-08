import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { LoginResult, Rate, TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary, WidgetSettings, WidgetStage } from 'src/app/model/payment.model';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';

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
  private pRateSubscription: Subscription | undefined = undefined;
  private exchangeRateTimer = timer(0, 1000);
  private exchangeRateCountDown = 0;
  private exchangeRateCountDownInit = false;
  private lastChanceError = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    // temp
    this.widget.email = 'mister@twister.com';
    this.widget.transaction = TransactionType.Deposit;
    this.widget.walletAddress = 'mkBUjw37y46goULToq6b7y6ciJc3Qi32YM';
    // temp

    if (this.widget.email) {
      this.summary.email = this.widget.email;
    }
    if (this.widget.transaction) {
      this.summary.transactionType = this.widget.transaction;
    }
    if (this.widget.walletAddress) {
      this.summary.address = this.widget.walletAddress;
    }

    this.startExchangeRateTimer();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    if (this.pRateSubscription) {
      this.pRateSubscription.unsubscribe();
      this.pRateSubscription = undefined;
    }
  }

  handleError(message: string): void {
    this.errorMessage = message;
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  // == Exchange rate ==
  private startExchangeRateTimer(): void {
    this.pSubscriptions.add(
      this.exchangeRateTimer.subscribe(val => {
        if (this.exchangeRateCountDownInit) {
          if (this.exchangeRateCountDown > 0) {
            this.exchangeRateCountDown -= 1;
            this.lastChanceError = false;
            this.updateExchangeRateCountDown();
          } else {
            const success = this.loadExchangeRates();
            if (!success) {
              if (!this.lastChanceError) {
                this.exchangeRateCountDown = 1;
                this.updateExchangeRateCountDown();
              }
              this.lastChanceError = true;
            } else {
              this.lastChanceError = false;
            }
          }
        } else {
          this.exchangeRateCountDownInit = true;
        }
      })
    );
  }

  private loadExchangeRates(): boolean {
    let result = true;
    this.errorMessage = '';
    if (this.exchangeRateCountDownInit) {
      let currencyFrom = '';
      let currencyTo = '';
      if (this.summary?.transactionType === TransactionType.Withdrawal) {
        currencyTo = this.summary?.currencyTo as string;
        currencyFrom = this.summary?.currencyFrom as string;
      } else if (this.summary?.transactionType === TransactionType.Deposit) {
        currencyFrom = this.summary?.currencyTo as string;
        currencyTo = this.summary?.currencyFrom as string;
      }
      console.log(`Get rate ${currencyFrom}->${currencyTo}`);
      if (currencyFrom && currencyTo) {
        const ratesData = this.dataService.getRates(currencyFrom, currencyTo);
        if (ratesData === null) {
          this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
          if (this.pRateSubscription) {
            this.pRateSubscription.unsubscribe();
            this.pRateSubscription = undefined;
          }
          this.pRateSubscription = ratesData.valueChanges.subscribe(({ data }) => {
            const rates = data.getRates as Rate[];
            if (rates.length > 0) {
              this.summary.exchangeRate = rates[0];
            }
            this.restartExchangeRateCountDown();
          }, (error) => {
            this.setDefaultExchangeRate();
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load exchange rate');
            this.restartExchangeRateCountDown();
          });
        }
      } else {
        result = false;
      }
    }
    return result;
  }

  private setDefaultExchangeRate(): void {
    const rate = {
      currencyFrom: '',
      currencyTo: '',
      originalRate: 0,
      depositRate: 0,
      withdrawRate: 0
    };
    this.summary.exchangeRate = rate;
  }

  private restartExchangeRateCountDown(): void {
    this.exchangeRateCountDown = 30;
    this.lastChanceError = false;
    this.updateExchangeRateCountDown();
  }

  private updateExchangeRate(): void {
    this.loadExchangeRates();
    this.restartExchangeRateCountDown();
  }

  private updateExchangeRateCountDown(): void {
    this.exchangeRateCountDownTitle = (this.exchangeRateCountDown > 0 && this.exchangeRateCountDown < 30) ?
      'The price will be updated in' :
      'The price is';
    const sec = this.exchangeRateCountDown === 1 ? 'second' : 'seconds';
    this.exchangeRateCountDownValue = (this.exchangeRateCountDown > 0 && this.exchangeRateCountDown < 30) ?
      `${this.exchangeRateCountDown} ${sec}` :
      'updating';
  }
  // =============================

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
      this.updateExchangeRate();
    }
  }

  orderDetailsComplete(): void {
    this.stages.push({
      id: this.stageId,
      title: this.title,
      step: this.step,
      summary: this.showSummary
    } as WidgetStage);
    this.stageId = 'disclaimer';
    this.title = 'Disclaimer';
    this.step = 2;
    this.showSummary = false;
    // } else {
    // this.inProgress = true;
    // // try to authorised a user
    // this.auth.authenticate(this.summary.email, '', true).subscribe(({ data }) => {
    //   const userData = data.login as LoginResult;
    //   this.handleSuccessLogin(userData);
    //   this.stageId = 'payment_info';
    //   this.title = 'Payment Info';
    // }, (error) => {
    //    this.inProgress = false;
    //   if (this.errorHandler.getCurrentError() === 'auth.password_null_or_empty') {
    //     // Internal user cannot be authorised without a password, so need to show the authorisation form to fill
    //     this.auth.logout();
    //     this.stageId = 'login';
    //     this.title = 'Login';
    //     this.needToLogin = true;
    //     this.loginTitle = 'Your account seems to be registered. Please, authenticate';
    //     this.defaultUserName = this.detailsEmailControl?.value;
    //   } else {
    //     this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
    //    }
    // });
    // }
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
    if (this.stages.length > 0) {
      const lastStage = this.stages.splice(this.stages.length - 1, 1)[0];
      this.stageId = lastStage.id;
      this.title = lastStage.title;
      this.step = lastStage.step;
      this.showSummary = lastStage.summary;
    }
  }

  desclaimerNext(): void {
    this.stages.push({
      id: this.stageId,
      title: this.title,
      step: this.step,
      summary: this.showSummary
    } as WidgetStage);
    this.summary.agreementChecked = true;
    if (this.widget.email) {
      this.stageId = 'code_auth';
      this.title = 'Autorization';
      this.step = 3;
      this.showSummary = true;
    } else {
      this.stageId = 'complete';
      this.title = 'Complete';
      this.step = 6;
      this.showSummary = false;
    }
  }

  // ================

  loginComplete(data: LoginResult | undefined): void {
    if (data) {
      // auth success
    } else {
      // need to register
    }
  }

  loginBack(): void {
    if (this.stages.length > 0) {
      const lastStage = this.stages.splice(this.stages.length - 1, 1)[0];
      this.stageId = lastStage.id;
      this.title = lastStage.title;
      this.step = lastStage.step;
      this.showSummary = lastStage.summary;
    }
  }
}
