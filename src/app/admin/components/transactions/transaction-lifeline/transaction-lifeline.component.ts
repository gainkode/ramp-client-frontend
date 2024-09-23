import { Clipboard } from '@angular/cdk/clipboard';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
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
export class TransactionLifelineComponent implements OnInit {
	@ViewChildren('updatingStepper') updateStepper: QueryList<MatStepper>;
  @ViewChildren('createStepper') createStepper: QueryList<MatStepper>;
	@Input() transactionId: string;
  transactionLifelineStatusItems$: Observable<TransactionLifelineStatusItem[]>;
  isModalOpen = false;
  currentResultStatus = {};
  constructor(
  	private route: ActivatedRoute,
  	private adminService: AdminDataService,
  	private _snackBar: MatSnackBar,
  	private clipboard: Clipboard
  ) {  }

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {

			if (params.transactionId !== undefined) {
				this.transactionId = params.transactionId;
			}

			this.transactionLifelineStatusItems$ = this.adminService
				.getTransactionLifeline(this.transactionId)
				.pipe(
					take(1),
					map((transactionLifelineStatusItems) => {
						return transactionLifelineStatusItems.map((statusItem) => {
							const newCreated = statusItem.lifelineStatus.find(status => status.created)?.created;

							const updatedLifelineStatus = statusItem.lifelineStatus.map(
								(status) => {
									const param = resultParamMapping[status.transactionStatusResult];
									if (param && status[param]) {
										try {
											const parsed = JSON.parse(status[param]);
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

							return { ...statusItem, lifelineStatus: updatedLifelineStatus, newCreated };
						});
					}),
					tap((transactionLifelineStatusItems) => {
						transactionLifelineStatusItems.forEach((item, i) => {
							const firstStatusIndex = item.lifelineStatus.findIndex((lifelineStatusItem) => lifelineStatusItem.transactionLifelineStatusId);
							// run setTimeout because of animation glitch, set focus on first status with ID
							// and reset all steps, to remove action icons.
							
							if (transactionLifelineStatusItems.length > 1) {
								setTimeout(() => {
									this.createStepper.toArray()[i].selectedIndex = firstStatusIndex;
									this.createStepper.toArray()[i].steps.forEach((step) => step.reset());
	
									this.updateStepper.toArray()[i].selectedIndex = firstStatusIndex;
									this.updateStepper.toArray()[i].steps.forEach((step) => step.reset());
								}, 500);
							}
						});
					})
				);
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
