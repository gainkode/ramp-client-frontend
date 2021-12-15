import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Transaction } from 'src/app/model/generated-models';
import { TransactionItemDeprecated } from 'src/app/model/transaction.model';

@Component({
  selector: 'app-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent {
  @Input() transaction?: TransactionItemDeprecated;
  @Output() save = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  settingsId = '';
  removable = true;

  onDeleteTransaction(): void {
    if (this.transaction) {
      this.delete.emit(this.transaction.id);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
