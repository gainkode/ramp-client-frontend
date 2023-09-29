import { Clipboard } from '@angular/cdk/clipboard';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TransactionLifelineStatus, TransactionLifelineStatusItem } from 'model/generated-models';
import { Observable, take } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';

@Component({
	selector: 'app-transaction-lifeline',
	templateUrl: './transaction-lifeline.component.html',
	styleUrls: ['./transaction-lifeline.component.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: { displayDefaultIndicatorType: false }
		}
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionLifelineComponent {
	transactionLifelineStatusItems$: Observable<TransactionLifelineStatusItem[]>;
	isModalOpen = false;
	currentResultStatus = {};
	constructor( 
		private route: ActivatedRoute, 
		private adminService: AdminDataService,
		private _snackBar: MatSnackBar,
		private clipboard: Clipboard) {

  	this.route.queryParams
  		.subscribe(params => {
  			if (!!params.transactionId) {
					this.transactionLifelineStatusItems$ = this.adminService.getTransactionLifeline(params.transactionId).pipe(take(1));
  			}
  		});
	}
	
	isJsonRowButtonDisabled(data: TransactionLifelineStatus): boolean {
		const paramMapping = {
			'SUCCESS': 'resultSuccessParams',
			'FAILURE': 'resultFailureParams',
			'UNKNOWN': 'resultStatusParams'
		};
		
		const param = paramMapping[data.transactionStatusResult];
		return !(param && data[param]);
	}

	copyParameter(value: string): void {
		this.clipboard.copy(value);
		this._snackBar.open('ID copied.', null, { duration: 2000 });
	}

	onOpenJsonParameter(data: TransactionLifelineStatus): void {
		this.isModalOpen = true;

		const paramMapping = {
			'SUCCESS': 'resultSuccessParams',
			'FAILURE': 'resultFailureParams',
			'UNKNOWN': 'resultStatusParams'
		};
	
		const param = paramMapping[data.transactionStatusResult];
		if (param && data[param]) {
			this.currentResultStatus = JSON.parse(data[param]);
		}
	}

	onCloseJsonParameter(): void {
		this.isModalOpen = false;
		this.currentResultStatus = {};
	}
}

