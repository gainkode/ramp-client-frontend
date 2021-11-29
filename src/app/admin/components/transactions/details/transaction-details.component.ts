import { Component, Input } from '@angular/core';
import { TransactionItemDeprecated } from 'src/app/model/transaction.model';

@Component({
  selector: 'app-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent {
  @Input() transaction?: TransactionItemDeprecated;
}
