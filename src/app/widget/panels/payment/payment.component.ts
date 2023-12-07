import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckoutSummary, PaymentProviderInstrumentView } from 'model/payment.model';

@Component({
	selector: 'app-widget-payment',
	templateUrl: 'payment.component.html',
	styleUrls: ['../../../../assets/text-control.scss']
})
export class WidgetPaymentComponent {
  @Input() providers: PaymentProviderInstrumentView[] = [];
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() errorMessage = '';
  @Output() onBack = new EventEmitter();
  @Output() onSelect = new EventEmitter<PaymentProviderInstrumentView>();
  
  constructor() { }

}
