import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';
import { TransactionUpdateInput } from 'model/generated-models';

@Component({
  selector: 'app-transaction-recall-modal',
  templateUrl: './transaction-recall-modal.component.html',
  styleUrls: ['./transaction-recall-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionRecallModalComponent {
  private readonly _dialogRef = inject(MatDialogRef<TransactionRecallModalComponent>);
  private readonly _fb = inject(FormBuilder);
  form = this._fb.group({
    recallNumber: this._fb.control<string>(undefined)
  });
  isChargeBack = false;
  constructor(@Inject(MAT_DIALOG_DATA) data: DialogData) {
    this.isChargeBack = data['isRequired'];

    if (this.isChargeBack) {
      this.form.controls.recallNumber.setValidators([Validators.required]);
    }
  }

  onSubmit(): void {
    this._dialogRef.close(this.form.value);
  }

  onSkip(): void {
    this._dialogRef.close();
  }

  onClose(): void {
    this._dialogRef.close('close');
  }  
}
