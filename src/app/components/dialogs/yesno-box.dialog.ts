import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'model/dialog.model';

@Component({
	selector: 'app-yesno-dialog-box',
	templateUrl: 'yesno-box.dialog.html',
	styleUrls: ['../../../assets/dialog.scss']
})
export class YesNoDialogBox {
	constructor(public dialogRef: MatDialogRef<YesNoDialogBox>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData) { }

	dialogYes = 1;
	dialogNo = -1;

	onClose(): void {
		this.dialogRef.close();
	}
}
