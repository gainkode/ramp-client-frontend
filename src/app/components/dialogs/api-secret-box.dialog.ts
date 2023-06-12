import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';

@Component({
    selector: 'app-api-secret-dialog-box',
    templateUrl: 'api-secret-box.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/dialog.scss']
})
export class ApiSecretDialogBox {
    constructor(
        private clipboard: Clipboard,
        public dialogRef: MatDialogRef<ApiSecretDialogBox>,
        @Inject(MAT_DIALOG_DATA)
        public data: DialogData) { }

    copySecret(): void {
        this.clipboard.copy(this.data.message ?? '');
    }

    copyApiKey(): void {
        this.clipboard.copy(this.data.button ?? '');
    }
}
