import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TransactionType } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';

@Component({
	selector: 'app-widget-rate',
	templateUrl: 'rate.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetRateComponent {
    TRANSACTION_TYPE: typeof TransactionType = TransactionType;
    @Input() spendList: CurrencyView[] = [];
    @Input() receiveList: CurrencyView[] = [];
    @Input() title = '';
    @Input() countDown = '';
    @Input() currentTransaction: TransactionType = TransactionType.Buy;
    @Input() currencySpend = '';
    @Input() currencyReceive = '';
    @Input() rate: string | undefined = undefined;
    @Input() showRate: boolean | undefined = undefined;

    constructor() { }

    get spendComboValue(): CurrencyView | undefined {
        return this.spendList?.find((x) => x.symbol === this.currencySpend);
    }

    get receiveComboValue(): CurrencyView | undefined {
        return this.receiveList?.find((x) => x.symbol === this.currencyReceive);
    }
}
