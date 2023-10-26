import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionItem } from 'model/transaction.model';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
	selector: 'app-profile-transaction-details',
	templateUrl: './transaction-details.component.html',
	styleUrls: [
		'../../../../assets/details.scss',
		'../../../../assets/text-control.scss'
	]
})
export class ProfileTransactionDetailsComponent {
    @Input() transaction: TransactionItem | undefined;

    constructor( 
    	private _snackBar: MatSnackBar,
    	private clipboard: Clipboard) {
    }

    copyParameter(value: string): void {
    	this.clipboard.copy(value);
    	this._snackBar.open('Hash copied.', null, { duration: 2000 });
    }
}