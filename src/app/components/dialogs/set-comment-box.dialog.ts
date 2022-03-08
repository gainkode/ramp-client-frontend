import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/model/dialog.model';

@Component({
    selector: 'app-set-comment-dialog-box',
    templateUrl: 'set-comment-box.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/dialog.scss']
})
export class SetCommentDialogBox {
    messageForm = this.formBuilder.group({
        comment: ['']
    });

    get commentField(): AbstractControl | null {
        return this.messageForm.get('comment');
    }

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SetCommentDialogBox>,
        @Inject(MAT_DIALOG_DATA)
        public data: DialogData) { }
}
