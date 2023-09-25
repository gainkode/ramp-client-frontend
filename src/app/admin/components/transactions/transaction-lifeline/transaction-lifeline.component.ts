import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionLifelineStatus, TransactionLifelineStatusItem, TransactionStatusDescriptor, TransactionStatusDescriptorMap } from 'model/generated-models';
import { combineLatest, map, take } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-transaction-lifeline',
	templateUrl: './transaction-lifeline.component.html',
	styleUrls: ['./transaction-lifeline.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionLifelineComponent {
	transactionLifelineStatusItems$: any;
	creatingTransactionStatus: TransactionLifelineStatusItem = undefined;
	updatingTransactionStatuses: TransactionLifelineStatusItem[] = undefined;
	liflines: TransactionLifelineStatusItem[];
	finalTransactionStatuses: TransactionStatusDescriptorMap[] = [];
	creatingFinalTransactionStatuses: TransactionStatusDescriptorMap[] = [];
	updatingFinalTransactionStatuses: TransactionStatusDescriptorMap[] = [];

	constructor( private route: ActivatedRoute, private adminService: AdminDataService, private profileService: ProfileDataService) {

  	this.route.queryParams
  		.subscribe(params => {
  			if (!!params.transactionId) {
					this.transactionLifelineStatusItems$ = combineLatest([
						this.adminService.getTransactionLifeline(params.transactionId).pipe(take(1)),
						this.profileService.getTransactionStatuses().valueChanges
					]).pipe(
						map(([lifeLineStatusItems, transactionStatusData]) => {
							this.creatingTransactionStatus = lifeLineStatusItems[0];
							this.updatingTransactionStatuses = lifeLineStatusItems.slice(1);

							const statusDescriptors = transactionStatusData.data.getTransactionStatuses as TransactionStatusDescriptorMap[];
							const finalStatusDescriptors = statusDescriptors
								.filter(status => status.value.buyLifeline.newNode)
								.sort((a, b) => a.value.buyLifeline.seqNo - b.value.buyLifeline.seqNo);

							this.creatingFinalTransactionStatuses = this.mergeStatuses(finalStatusDescriptors, this.creatingTransactionStatus.lifeLineStatus);
							this.updatingTransactionStatuses.forEach(item => {
								this.updatingFinalTransactionStatuses.push(...this.mergeStatuses(finalStatusDescriptors, item.lifeLineStatus));
							});

							return finalStatusDescriptors;
						})
					);

  			}
  		});
	}

	private mergeStatuses(finalTransactionStatuses: TransactionStatusDescriptorMap[], lifeLineStatus: TransactionLifelineStatus[]): TransactionStatusDescriptorMap[] {
		return finalTransactionStatuses.map(finalStatus => {
			const matchingLifelineStatus = lifeLineStatus.find(l => l.transactionStatus === finalStatus.key);

			if (matchingLifelineStatus) {
				const mergedObject = { ...finalStatus.value, ...matchingLifelineStatus };
				return { 
					key: finalStatus.key, 
					value: mergedObject as TransactionStatusDescriptor 
				};
			}

			return {
				...finalStatus,
				statusName: finalStatus.value.buyLifeline.statusName
			};
		});
	}
}

