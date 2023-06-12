import { Component, Input } from "@angular/core";
import { TransactionItem } from "model/transaction.model";

@Component({
    selector: 'app-profile-transaction-details',
    templateUrl: './transaction-details.component.html',
    styleUrls: [
        '../../../../assets/button.scss',
        '../../../../assets/details.scss',
        '../../../../assets/text-control.scss'
    ]
})
export class ProfileTransactionDetailsComponent {
    @Input() transaction: TransactionItem | undefined;
}