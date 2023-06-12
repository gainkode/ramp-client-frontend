import { Component, Inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-two-fa-dialog-wizard',
	templateUrl: 'two-fa-wizard.dialog.html',
	styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/dialog.scss']
})
export class TwoFaDialogWizard {
	codeForm = this.formBuilder.group({
		code: ['', { validators: [Validators.required], updateOn: 'change' }]
	});

	codeErrorMessages: { [key: string]: string; } = {
		['required']: 'Code is required'
	};

	get codeField(): AbstractControl | null {
		return this.codeForm.get('code');
	}

	step = 1;
	GA_APP_STORE_URL = 'https://apps.apple.com/us/app/google-authenticator/id388497605';
	GA_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en';
	qrMargin = 0;
	qrCodeBackground = EnvService.color_white;
	qrCodeForeground = EnvService.color_purple_900;

	constructor(
		private formBuilder: UntypedFormBuilder,
		public dialogRef: MatDialogRef<TwoFaDialogWizard>,
		@Inject(MAT_DIALOG_DATA)
		public data: DialogData) { }

	stepOneComplete(): void {
		this.step = 2;
	}

	stepTwoComplete(): void {
		this.step = 3;
	}

	stepThreeComplete(): void {
		this.step = 4;
	}
}
