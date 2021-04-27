import { Component, Input } from '@angular/core';
import { TransactionType } from '../model/generated-models';
import { CheckoutSummary } from '../model/payment.model';
import { round } from '../utils/utils';

@Component({
    selector: 'app-checkout-done',
    templateUrl: 'checkout-done.component.html',
    styleUrls: ['checkout-summary.component.scss']
})
export class CheckoutDoneComponent {
    @Input() summary: CheckoutSummary | null | undefined = null;

    get fee(): string {
        const feeMinEuro = this.summary?.feeMinEuro as number;
        const feePercent = this.summary?.feePercent as number;
        const amountTo = this.summary?.amountTo as number;
        const val = Math.max(feeMinEuro, amountTo * feePercent / 100);
        if (val !== 0) {
            return `${round(val, 4)}`;
        } else {
            return '';
        }
    }

    get feeTitle(): string {
        const feeMinEuro = this.summary?.feeMinEuro as number;
        const feePercent = this.summary?.feePercent as number;
        return `Transaction fee (${feePercent}%, min ${feeMinEuro} EUR)`;
    }

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
                const rateValue = round(this.summary.exchangeRate.depositRate, 5);
                data = `1 ${this.summary.currencyTo} = ${rateValue} ${this.summary.currencyFrom}`;
            } else if (this.summary?.transactionType === TransactionType.Withdrawal) {
                const rateValue = round(this.summary.exchangeRate.withdrawRate, 5);
                data = `1 ${this.summary.currencyFrom} = ${rateValue} ${this.summary.currencyTo}`;
            }
        }
        return data;
    }
}
