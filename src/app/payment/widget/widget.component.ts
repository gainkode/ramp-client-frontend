import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoginResult, Rate } from 'src/app/model/generated-models';
import { CheckoutSummary } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { WidgetRateComponent } from './rate.component';

@Component({
  selector: 'app-widget',
  templateUrl: 'widget.component.html',
  styleUrls: ['../../../assets/payment.scss'],
})
export class WidgetComponent implements OnInit {
  @ViewChild('exchangerate') private exchangeRateComponent: WidgetRateComponent | undefined = undefined;

  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }

  internalPayment = false;
  initState = true;
  stageId = 'order_details';
  //stageId = 'login';
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();

  constructor(
    private auth: AuthService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {

  }

  onUpdateRate(rate: Rate): void {
    this.summary.exchangeRate = rate;
    // this.priceEdit = false;
    // this.updateAmountTo();
  }

  orderDetailsChanged(data: CheckoutSummary): void {
    if (this.initState && data.email && data.email !== '') {
      this.initState = false;
    }
    this.summary.email = data.email;
    this.summary.amountFrom = data.amountFrom;
    this.summary.amountTo = data.amountTo;
    const currencyFromChanged = (this.summary.currencyFrom !== data.currencyFrom);
    const currencyToChanged = (this.summary.currencyTo !== data.currencyTo);
    this.summary.currencyFrom = data.currencyFrom;
    this.summary.currencyTo = data.currencyTo;
    this.summary.transactionType = data.transactionType;
    if (currencyFromChanged || currencyToChanged) {
      this.exchangeRateComponent?.updateRate();
    }
  }

  orderDetailsComplete(register: boolean): void {
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
      if (register) {
        this.stageId = 'register';
        this.title = 'Register';
        //this.needToRegister = true;
      } else {
        // this.inProgress = true;
        // try to authorised a user
        this.auth.authenticate(this.summary.email, '', true).subscribe(({ data }) => {
          const userData = data.login as LoginResult;
          //this.handleSuccessLogin(userData);
          this.stageId = 'payment_info';
          this.title = 'Payment Info';
        }, (error) => {
        //   this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.password_null_or_empty') {
            // Internal user cannot be authorised without a password, so need to show the authorisation form to fill
            this.auth.logout();
            this.stageId = 'login';
            this.title = 'Login';
        //     this.needToLogin = true;
        //     this.loginTitle = 'Your account seems to be registered. Please, authenticate';
        //     this.defaultUserName = this.detailsEmailControl?.value;
        //   } else {
        //     this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
           }
        });
      }
    }
  }

  loginBack(): void {
    this.stageId = 'order_details';
    this.title = 'Order details';
  }
}
