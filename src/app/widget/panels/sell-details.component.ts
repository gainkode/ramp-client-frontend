import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WireTransferUserSelection } from 'src/app/model/cost-scheme.model';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from 'src/app/model/payment-base.model';
import { CheckoutSummary } from 'src/app/model/payment.model';

@Component({
    selector: 'app-widget-sell-details',
    templateUrl: 'sell-details.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetSellDetailsComponent {
    @Input() summary: CheckoutSummary | undefined = undefined;
    @Input() bankCategories: WireTransferPaymentCategoryItem[] = [];
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<string>();

    selectedCategory: WireTransferPaymentCategory | undefined = undefined;

    constructor() {
    }

    onSubmit(): void {
        // if (this.selectedCategory) {
        //     const selected = this.bankCategories.find(x => x.id === this.selectedCategory);
        //     this.onComplete.emit({
        //         id: this.bankAccountId,
        //         selected: selected
        //     } as WireTransferUserSelection);
        // }
    }
}
