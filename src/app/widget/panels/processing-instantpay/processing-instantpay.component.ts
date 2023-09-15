import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentApmResult } from 'model/generated-models';
import { InstantpayDetails } from 'model/payment-base.model';

@Component({
	selector: 'app-widget-processing-instantpay',
	templateUrl: 'processing-instantpay.component.html',
	styleUrls: ['../../../../assets/text-control.scss']
})
export class WidgetProcessingInstantpayComponent {
  @Input() errorMessage = '';
  @Input() set details(val: PaymentApmResult) {
  	this.data = val;
  }
  @Output() onComplete = new EventEmitter();

  data: PaymentApmResult | undefined = undefined;

  constructor(private clipboard: Clipboard) {}
  
  copyReference(): void {
  	if (this.data) {
  		this.clipboard.copy(`${this.data.referenceCode}`);
  	}
  }

  copyPayId(): void {
  	if (this.data) {
  		this.clipboard.copy(this.data.payId);
  	}
  }
}
