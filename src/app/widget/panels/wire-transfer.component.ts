import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { WireTransferUserSelection } from 'src/app/model/cost-scheme.model';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from 'src/app/model/payment-base.model';
import { WireTransferPaymentCategoryList } from 'src/app/model/payment.model';

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

    selectedCategory: WireTransferPaymentCategory | undefined = undefined;

    constructor() {
    }

    onSubmit(): void {
        this.onComplete.emit({
            id: this.bankAccountId,
            selected: this.selectedCategory
        } as WireTransferUserSelection);
    }
}
