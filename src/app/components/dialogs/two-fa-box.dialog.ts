import { Component, Inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';

@Component({
	selector: 'app-two-fa-dialog-box',
	templateUrl: 'two-fa-box.dialog.html',
	styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class TwoFaDialogBox {
	codeForm = this.formBuilder.group({
		code: ['', { validators: [Validators.required], updateOn: 'change' }]
	});

	codeErrorMessages: { [key: string]: string; } = {
		['required']: 'Code is required'
	};

	get codeField(): AbstractControl | null {
		return this.codeForm.get('code');
	}

	constructor(
		private formBuilder: UntypedFormBuilder,
		public dialogRef: MatDialogRef<TwoFaDialogBox>,
		@Inject(MAT_DIALOG_DATA)
		public data: DialogData) { }
}
