import { Clipboard } from '@angular/cdk/clipboard';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import {
	ChangeDetectionStrategy,
	Component,
	QueryList,
	ViewChildren,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import {
	TransactionLifelineStatus,
	TransactionLifelineStatusItem,
} from 'model/generated-models';
import { Observable, map, take, tap } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';

const resultParamMapping = {
	SUCCESS: 'resultSuccessParams',
	FAILURE: 'resultFailureParams',
	UNKNOWN: 'resultStatusParams',
};

@Component({
	selector: 'app-transaction-lifeline',
	templateUrl: './transaction-lifeline.component.html',
	styleUrls: ['./transaction-lifeline.component.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: { displayDefaultIndicatorType: false },
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionLifelineComponent {
  @ViewChildren('updatingStepper') steppers: QueryList<MatStepper>;

  transactionLifelineStatusItems$: Observable<TransactionLifelineStatusItem[]>;
  isModalOpen = false;
  currentResultStatus = {};
  transactionId: string;
  selectedStepIndex = 0;
  constructor(
  	private route: ActivatedRoute,
  	private adminService: AdminDataService,
  	private _snackBar: MatSnackBar,
  	private clipboard: Clipboard
  ) {
  	this.route.queryParams.subscribe((params) => {
  		if (!!params.transactionId) {
  			this.transactionId = params.transactionId;
  			this.transactionLifelineStatusItems$ = this.adminService
  				.getTransactionLifeline(params.transactionId)
  				.pipe(
  					take(1),
  					map((transactionLifelineStatusItems) => {
  						return transactionLifelineStatusItems.map((statusItem) => {
  							const updatedLifelineStatus = statusItem.lifelineStatus.map(
  								(status) => {
  									const param = resultParamMapping[status.transactionStatusResult];
  									if (param && status[param]) {
  										try {
  											const parsed = JSON.parse(status[param]);
											console.log(parsed)
  											return {
  												...status,
  												transactionStatusResultParsed: parsed,
  											};
  										} catch (e) {
  											console.error('Failed to parse JSON:', status[param]);
  											return status;
  										}
  									}
  									return status;
  								}
  							);
  							return { ...statusItem, lifelineStatus: updatedLifelineStatus };
  						});
  					}),
  					tap((transactionLifelineStatusItems) => {
  						transactionLifelineStatusItems.slice(1).forEach((item, i) => {
  							const firstStatusIndex = item.lifelineStatus.findIndex((lifelineStatusItem) => lifelineStatusItem.transactionLifelineStatusId);
  							// run setTimeout because of animation glitch, set focus on first status with ID
  							// and reset all steps, to remove action icons.
  							setTimeout(() => {
  								this.steppers.toArray()[i].selectedIndex = firstStatusIndex;
  								this.steppers.toArray()[i].steps.forEach((step) => step.reset());
  							}, 500);
  						});
  					})
  				);
  		}
  	});
  }

  copyParameter(value: string): void {
  	this.clipboard.copy(value);
  	this._snackBar.open('ID copied.', null, { duration: 2000 });
  }
	
  onOpenJsonParameter(data: TransactionLifelineStatus): void {
  	if (data['transactionStatusResultParsed']) {
  		this.currentResultStatus = data['transactionStatusResultParsed'];
  		this.isModalOpen = true;
  	} else {
  		this._snackBar.open('JSON object is unavailable', null, { duration: 2000 });
  	}
  }

  onCloseJsonParameter(): void {
  	this.isModalOpen = false;
  	this.currentResultStatus = {};
  }
}
