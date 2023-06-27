import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentProviderInstrumentView, CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';


@Component({
	selector: 'app-widget-payment',
	templateUrl: 'payment.component.html',
	styleUrls: ['../../../../assets/payment.scss', '../../../../assets/button.scss', '../../../../assets/text-control.scss']
})
export class WidgetPaymentComponent implements OnInit, OnDestroy {
  @Input() providers: PaymentProviderInstrumentView[] = [];
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() errorMessage = '';
  @Output() onBack = new EventEmitter();
  @Output() onSelect = new EventEmitter<PaymentProviderInstrumentView>();
  
  private pSubscriptions: Subscription = new Subscription();
  
  constructor(
  	private changeDetector: ChangeDetectorRef,
  	private paymentService: PaymentDataService,
  	private errorHandler: ErrorService) { }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }
}
