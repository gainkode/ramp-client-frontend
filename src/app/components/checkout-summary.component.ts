import { Component, Input } from '@angular/core';
import { CheckoutSummary } from '../model/payment.model';

@Component({
    selector: 'app-checkout-summary',
    templateUrl: 'checkout-summary.component.html',
    styleUrls: ['checkout-summary.component.scss']
})
export class CheckoutSummaryComponent {
    @Input() summary: CheckoutSummary | null | undefined = null;

    get fee(): string {
        const feeMinEuro = this.summary?.feeMinEuro as number;
        const feePercent = this.summary?.feePercent as number;
        const amountTo = this.summary?.amountTo as number;
        const val = Math.max(feeMinEuro, amountTo * feePercent / 100);
        if (val !== 0) {
            return `${val}`;
        } else {
            return '';
        }
    }

    get feeTitle(): string {
        const feeMinEuro = this.summary?.feeMinEuro as number;
        const feePercent = this.summary?.feePercent as number;
        return `Transaction fee (${feePercent}%, min ${feeMinEuro} EUR)`;
    }
}
