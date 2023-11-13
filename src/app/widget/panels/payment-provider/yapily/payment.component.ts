import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentBank } from 'model/generated-models';
import { CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { WidgetPaymentPagerService } from 'services/widget-payment-pager.service';


@Component({
	selector: 'app-widget-payment-yapily',
	templateUrl: 'payment.component.html',
	styleUrls: []
})
export class WidgetPaymentYapilyComponent implements OnInit, OnDestroy {
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() errorMessage = '';
  @Output() onBack = new EventEmitter();
  
  private pSubscriptions: Subscription = new Subscription();
  banks: PaymentBank[] = [];
  constructor(
    public pager: WidgetPaymentPagerService
  ) { }
  
  get providerName(): string {
  	return 'Yapily';
  }
  
  ngOnInit(): void {
    this.pager.init('initialization', 'Banks');
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  bankSelected() {
    console.log(this.summary)
  }

  stageBack(): void {
  	const stage = this.pager.goBack();
  	if (!stage) {
  		this.onBack.emit();
  	}
  }
}
