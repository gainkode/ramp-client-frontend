import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstantpayDetails } from 'src/app/model/payment.model';

@Component({
  selector: 'app-widget-processing-instantpay',
  templateUrl: 'processing-instantpay.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetProcessingInstantpayComponent {
  @Input() set details(val: string) {
    this.data = JSON.parse(val);
  }
  @Output() onComplete = new EventEmitter();

  data: InstantpayDetails | undefined = undefined;
}
