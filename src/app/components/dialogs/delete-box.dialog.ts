import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData } from 'src/app/model/dialog.model';

@Component({
    selector: 'app-delete-dialog-box',
    templateUrl: 'delete-box.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class DeleteDialogBox {
    constructor(public dialogRef: MatDialogRef<DeleteDialogBox>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    deleteAccept = true;

    onClose(): void {
        this.dialogRef.close();
    }
}
