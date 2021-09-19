import { Component, Input } from '@angular/core';
import { CheckoutSummary } from '../../model/payment.model';

@Component({
    selector: 'app-checkout-summary',
    templateUrl: 'checkout-summary.component.html',
    styleUrls: ['checkout-summary.component.scss']
})
export class CheckoutSummaryComponent {
    @Input() summary: CheckoutSummary | null | undefined = null;
}
