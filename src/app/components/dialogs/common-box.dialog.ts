import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';

@Component({
	selector: 'app-common-dialog-box',
	templateUrl: 'common-box.dialog.html',
	styleUrls: ['../../../assets/dialog.scss']
})
export class CommonDialogBoxComponent {
	buttonTitle = '';
	constructor(public dialogRef: MatDialogRef<CommonDialogBoxComponent>,
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
