import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { Rate, TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { WidgetRateComponent } from './rate.component';

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
  mobileSummary = false;
  stageId = 'order_details';
  //stageId = 'login';
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();
  countDownTitle = '';
  countDownValue = '';

  private pSubscriptions: Subscription = new Subscription();
  private pRateSubscription: Subscription | undefined = undefined;
  private exchangeRateTimer = timer(0, 1000);
  private countDown = 0;
  private countDownInit = false;
  private lastChanceError = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private auth: AuthService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.startRateTimer();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    if (this.pRateSubscription) {
      this.pRateSubscription.unsubscribe();
      this.pRateSubscription = undefined;
    }
  }

  progressChanged(visible: boolean) {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private startRateTimer(): void {
    this.pSubscriptions.add(this.exchangeRateTimer.subscribe(val => {
      if (this.countDownInit) {
        if (this.countDown > 0) {
          this.countDown -= 1;
          this.lastChanceError = false;
          this.updateCountDown();
        } else {
          const success = this.loadRates();
          if (!success) {
            if (!this.lastChanceError) {
              this.countDown = 1;
              this.updateCountDown();
            }
            this.lastChanceError = true;
          } else {
            this.lastChanceError = false;
          }
        }
      } else {
        this.countDownInit = true;
      }
    })
    );
  }

  private loadRates(): boolean {
    let result = true;
    this.errorMessage = '';
    if (this.countDownInit) {
      let currencyFrom = '';
      let currencyTo = '';
      if (this.summary?.transactionType === TransactionType.Withdrawal) {
        currencyTo = this.summary?.currencyTo as string;
        currencyFrom = this.summary?.currencyFrom as string;
      } else if (this.summary?.transactionType === TransactionType.Deposit) {
        currencyFrom = this.summary?.currencyTo as string;
        currencyTo = this.summary?.currencyFrom as string;
      }
      console.log(`Need to get rate from ${currencyFrom} to ${currencyTo}`);
      if (currencyFrom && currencyTo) {
        console.log(`Get rate from ${currencyFrom} to ${currencyTo}`);
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
            this.restartCountDown();
          }, (error) => {
            this.setDefaultRate();
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load exchange rate');
            this.restartCountDown();
          });
        }
      } else {
        result = false;
      }
    }
    return result;
  }

  private setDefaultRate(): void {
    const rate = {
      currencyFrom: '',
      currencyTo: '',
      originalRate: 0,
      depositRate: 0,
      withdrawRate: 0
    };
    this.summary.exchangeRate = rate;
  }

  private restartCountDown(): void {
    this.countDown = 30;
    this.lastChanceError = false;
    this.updateCountDown();
  }

  private updateRate(): void {
    this.loadRates();
    this.restartCountDown();
  }

  private updateCountDown(): void {
    this.countDownTitle = (this.countDown > 0 && this.countDown < 30) ? 'The price will be updated in' : 'The price is';
    const sec = this.countDown === 1 ? 'second' : 'seconds';
    this.countDownValue = (this.countDown > 0 && this.countDown < 30) ? `${this.countDown} ${sec}` : 'updating';
  }

  orderDetailsChanged(data: CheckoutSummary): void {
    if (this.initState && (data.amountFrom || data.amountTo)) {
      this.initState = false;
    }
    this.summary.amountFrom = data.amountFrom;
    this.summary.amountTo = data.amountTo;
    const currencyFromChanged = (this.summary.currencyFrom !== data.currencyFrom);
    const currencyToChanged = (this.summary.currencyTo !== data.currencyTo);
    this.summary.currencyFrom = data.currencyFrom;
    this.summary.currencyTo = data.currencyTo;
    this.summary.transactionType = data.transactionType;
    if (currencyFromChanged || currencyToChanged) {
      this.updateRate();
    }
  }

  orderDetailsComplete(): void {
    let authenticated = false;
    const user = this.auth.user;
    if (user) {
      if (user.email === this.summary.email) {
        authenticated = true;
      }
    }
    if (authenticated) {
      // user is already authorised
      this.stageId = 'payment_info';
      this.title = 'Payment Info';
    } else {
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
    }
  }

  loginBack(): void {
    this.stageId = 'order_details';
    this.title = 'Order details';
  }
}
