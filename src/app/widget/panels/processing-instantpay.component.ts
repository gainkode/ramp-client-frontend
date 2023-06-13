import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstantpayDetails } from 'model/payment-base.model';

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
  
  copyReference(): void {
  	if (this.data) {
  		this.clipboard.copy(`${this.data.uniqueReference}`);
  	}
  }

  copyPayId(): void {
  	if (this.data) {
  		this.clipboard.copy(this.data.payId);
  	}
  }
}
