import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData } from 'src/app/model/dialog.model';

@Component({
    selector: 'app-send-notification-dialog-box',
    templateUrl: 'send-notification-box.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class SendNotificationDialogBox {
    messageForm = this.formBuilder.group({
        title: [''],
        text: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    textErrorMessages: { [key: string]: string; } = {
        ['required']: 'Message text is required'
    };

    get titleField(): AbstractControl | null {
        return this.messageForm.get('title');
    }

    get textField(): AbstractControl | null {
        return this.messageForm.get('text');
    }

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SendNotificationDialogBox>,
        @Inject(MAT_DIALOG_DATA)
        public data: DialogData) { }
}
