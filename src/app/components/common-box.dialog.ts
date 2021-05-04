import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface DialogData {
    title: string;
    message: string;
}

@Component({
    selector: 'app-common-dialog-box',
    templateUrl: 'common-box.dialog.html',
})
export class CommonDialogBox {
    constructor(public dialogRef: MatDialogRef<CommonDialogBox>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onClose(): void {
        this.dialogRef.close();
    }
}