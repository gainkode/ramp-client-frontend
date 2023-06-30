import { Component, Input } from '@angular/core';
import { CheckoutSummary } from 'model/payment.model';

@Component({
	selector: 'app-widget-summary',
	templateUrl: 'summary.component.html',
	styleUrls: ['../../../../assets/text-control.scss']
})
export class WidgetSummaryComponent {
    @Input() summary: CheckoutSummary | null | undefined = null;
}
