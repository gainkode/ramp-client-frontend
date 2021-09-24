import { Component, Input } from '@angular/core';
import { CheckoutSummary } from 'src/app/model/payment.model';

@Component({
  selector: 'app-widget',
  templateUrl: 'widget.component.html',
  styleUrls: ['../../../assets/payment.scss'],
})
export class WidgetComponent {
  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }

  internalPayment = false;
  initState = true;
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();

  constructor() { }

  isStageActive(stageId: string): boolean {
    let result = false;
    if (stageId === 'order_details') {
      result = true;
    }
    return result;
  }

  orderDetailsChanged(data: CheckoutSummary): void {
    this.initState = false;
    this.summary.email = data.email;
    this.summary.amountFrom = data.amountFrom;
    this.summary.amountTo = data.amountTo;
    this.summary.currencyFrom = data.currencyFrom;
    this.summary.currencyTo = data.currencyTo;
    this.summary.transactionType = data.transactionType;
  }
}
