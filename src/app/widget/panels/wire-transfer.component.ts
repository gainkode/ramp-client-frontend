import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WireTransferUserSelection } from 'model/cost-scheme.model';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from 'model/payment-base.model';

@Component({
	selector: 'app-widget-wire-transfer',
	templateUrl: 'wire-transfer.component.html',
	styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetWireTransferComponent {
    @Input() bankAccountId = '';
    @Input() bankCategories: WireTransferPaymentCategoryItem[] = [];
    @Input() errorMessage = '';
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<WireTransferUserSelection>();

    done = false;
    selectedCategory: WireTransferPaymentCategory | undefined = undefined;

    constructor() {
    }

    onSubmit(): void {
    	if (this.selectedCategory) {
    		const selected = this.bankCategories.find(x => x.id === this.selectedCategory);
    		this.done = true;
    		this.onComplete.emit({
    			id: this.bankAccountId,
    			selected: selected
    		} as WireTransferUserSelection);
    	}
    }
}
