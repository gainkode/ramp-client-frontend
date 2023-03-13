import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/model/dialog.model';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-common-dialog-box',
    templateUrl: 'common-box.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class CommonDialogBox {
    buttonTitle = '';
    supportEmail = EnvService.support_email;
    constructor(public dialogRef: MatDialogRef<CommonDialogBox>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        this.buttonTitle = data.button ?? 'OK';
        if (this.buttonTitle === '') {
            this.buttonTitle = 'OK';
        }
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
