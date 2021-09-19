import { Component, Input } from "@angular/core";
import { TransactionItem } from "src/app/model/transaction.model";

@Component({
    selector: 'app-personal-transaction-details',
    templateUrl: './transaction-details.component.html',
    styleUrls: ['../../../button.scss', '../../../details.scss']
})
export class PersonalTransactionDetailsComponent {
    @Input() transaction: TransactionItem | undefined;
}