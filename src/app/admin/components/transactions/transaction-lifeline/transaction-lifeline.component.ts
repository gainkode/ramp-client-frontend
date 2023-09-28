import { Clipboard } from '@angular/cdk/clipboard';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TransactionLifelineStatusItem } from 'model/generated-models';
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

	copyParameter(value: string): void {
		this.clipboard.copy(value);
		this._snackBar.open('ID copied.', null, { duration: 2000 });
	}
}

