import { Component, Input } from '@angular/core';
import { TransactionType } from '../../model/generated-models';
import { CheckoutSummary } from '../../model/payment.model';
import { round } from '../../utils/utils';

@Component({
    selector: 'app-checkout-done',
    templateUrl: 'checkout-done.component.html',
    styleUrls: ['checkout-summary.component.scss']
})
export class CheckoutDoneComponent {
    @Input() summary: CheckoutSummary | null | undefined = null;

    get amountTitle(): string {
        let title = '';
        if (this.summary?.transactionType === TransactionType.Deposit) {
            title = 'Deposit Amount';
        } else if (this.summary?.transactionType === TransactionType.Withdrawal) {
            title = 'Withdrawal Amount';
        }
        return title;
    }

    get rate(): string {
        let data = '';
        if (this.summary !== null && this.summary?.exchangeRate !== null) {
            if (this.summary?.transactionType === TransactionType.Deposit) {
                const rateValue = this.summary.exchangeRate?.depositRate ?? 0;
                const roundedRateValue = round(rateValue, 5);
                data = `1 ${this.summary.exchangeRate?.currencyTo} = ${roundedRateValue} ${this.summary.exchangeRate?.currencyFrom}`;
            } else if (this.summary?.transactionType === TransactionType.Withdrawal) {
                const rateValue = this.summary.exchangeRate?.withdrawRate ?? 0;
                const roundedRateValue = round(rateValue, 5);
                data = `1 ${this.summary.exchangeRate?.currencyFrom} = ${roundedRateValue} ${this.summary.exchangeRate?.currencyTo}`;
            }
        }
        return data;
    }
}
