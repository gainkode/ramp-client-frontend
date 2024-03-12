import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';
import { TransactionUpdateInput } from 'model/generated-models';

@Component({
  selector: 'app-transaction-refund-modal',
  templateUrl: './transaction-refund-modal.component.html',
  styleUrls: ['./transaction-refund-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionRefundModalComponent {
  private readonly _dialogRef = inject(MatDialogRef<TransactionRefundModalComponent>);
  private readonly _fb = inject(FormBuilder);
  transaction: TransactionUpdateInput;
  form = this._fb.group({
    amountToSell: this._fb.control<number>(undefined, [Validators.required, Validators.pattern(/^[+-]?((\.\d+)|(\d+(\.\d+)?))$/)]),
    sourceWallet: this._fb.control<string>(undefined, Validators.required)
  });

  constructor(@Inject(MAT_DIALOG_DATA) data: DialogData) {
    this.form.controls.amountToSell.patchValue(data['amountToSpend']);
    this.form.controls.sourceWallet.patchValue(data['sourceWallet']);
  }

  onSubmit(): void {
    // run refund here
    this._dialogRef.close();
  }
}
