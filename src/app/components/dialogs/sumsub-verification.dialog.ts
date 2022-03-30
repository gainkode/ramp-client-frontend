import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData } from 'src/app/model/dialog.model';

@Component({
    selector: 'app-sumsub-verification-dialog-box',
    templateUrl: 'sumsub-verification.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class SumsubVerificationDialogBox {
    complete = false;

    constructor(public dialogRef: MatDialogRef<SumsubVerificationDialogBox>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onComplete(): void {
        this.complete = true;
        this.dialogRef.close();
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
