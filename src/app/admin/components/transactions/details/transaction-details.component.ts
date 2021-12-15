import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Transaction } from 'src/app/model/generated-models';
import { TransactionItemDeprecated } from 'src/app/model/transaction.model';

@Component({
  selector: 'app-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent {
  @Input() set transaction(val: TransactionItemDeprecated | undefined) {
    this.data = val;
    this.transactionId = val?.id ?? '';
    this.removable = val?.statusInfo?.value.canBeCancelled ?? false;
  }
  @Input() cancelable = false;
  @Output() save = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  data: TransactionItemDeprecated | undefined = undefined;
  removable = false;
  transactionId = '';

  onDeleteTransaction(): void {
    if (this.transactionId !== '' && this.removable) {
      this.delete.emit(this.transactionId);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
