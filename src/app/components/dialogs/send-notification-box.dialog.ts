import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonTargetValue } from 'src/app/model/common.model';
import { DialogData } from 'src/app/model/dialog.model';

@Component({
    selector: 'app-send-notification-dialog-box',
    templateUrl: 'send-notification-box.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/dialog.scss']
})
export class SendNotificationDialogBox {
    messageForm = this.formBuilder.group({
        level: ['Info'],
        title: [''],
        text: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    textErrorMessages: { [key: string]: string; } = {
        ['required']: 'Message text is required'
    };

    get levelField(): AbstractControl | null {
        return this.messageForm.get('level');
    }

    get titleField(): AbstractControl | null {
        return this.messageForm.get('title');
    }

    get textField(): AbstractControl | null {
        return this.messageForm.get('text');
    }

    levels: CommonTargetValue[] = [
        { id: 'Request', title: 'Request', imgClass: '', imgSource: '' },
        { id: 'Debug', title: 'Debug', imgClass: '', imgSource: '' },
        { id: 'Info', title: 'Info', imgClass: '', imgSource: '' },
        { id: 'Warning', title: 'Warning', imgClass: '', imgSource: '' },
        { id: 'Error', title: 'Error', imgClass: '', imgSource: '' }
    ];

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SendNotificationDialogBox>,
        @Inject(MAT_DIALOG_DATA)
        public data: DialogData) { }
}
