import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Rate } from 'src/app/model/generated-models';
import { CheckoutSummary } from 'src/app/model/payment.model';
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
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();

  constructor() { }

  ngOnInit(): void {

  }

  onUpdateRate(rate: Rate): void {
    this.summary.exchangeRate = rate;
    // this.priceEdit = false;
    // this.updateAmountTo();
  }

  orderDetailsChanged(data: CheckoutSummary): void {
    console.log(this.initState, data.email);
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

  orderDetailsComplete(): void {
    console.log('order details complete');
  }
}
