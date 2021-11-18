import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstantpayDetails } from 'src/app/model/payment.model';

@Component({
  selector: 'app-widget-processing-instantpay',
  templateUrl: 'processing-instantpay.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetProcessingInstantpayComponent {
  @Input() errorMessage = '';
  @Input() set details(val: string) {
    this.data = JSON.parse(val);
  }
  @Output() onComplete = new EventEmitter();

  data: InstantpayDetails | undefined = undefined;

  constructor(private clipboard: Clipboard) {}

  copyReference() {
    if (this.data) {
      const val = `Pay ID: ${this.data.payId}\nReference code: ${this.data.uniqueReference}`;
      this.clipboard.copy(val);
    }
  }
}
