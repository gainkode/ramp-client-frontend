import { Injectable, OnDestroy } from '@angular/core';
import { Filter } from 'admin/model/filter.model';
import { TransactionItemFull } from 'model/transaction.model';
import { Observable, ReplaySubject, Subscription, lastValueFrom } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';

@Injectable()
export class TransactionService implements OnDestroy {
	private sizePerLoad = 5;
	private dataSubject = new ReplaySubject<{
		list: TransactionItemFull[];
		count: number;
	}>();

	public get data(): Observable<{
		list: TransactionItemFull[];
		count: number;
	}> {
		return this.dataSubject.asObservable();
	}

	public loading = false;

	private subscriptions: Subscription = new Subscription();

	constructor(private adminDataService: AdminDataService) { }

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	async load(
		pageIndex: number,
		pageSize: number,
		sortedField: string,
		sortedDesc: boolean,
		filter?: Filter
	): Promise<void> {
		this.loading = true;
		// We have to multiply requested page index by requested page size
		let pageIndexInternal = pageIndex * pageSize / this.sizePerLoad;
		
		while (pageSize > 0) {
			// If preseted size per load less then page size we should only query the remaining transactions
			const currentSizePerLoad = this.sizePerLoad <= pageSize ? this.sizePerLoad : this.sizePerLoad - pageSize;
			
			const newVal$ = this.adminDataService.getTransactions(
				pageIndexInternal,
				currentSizePerLoad,
				sortedField,
				sortedDesc,
				filter
			);
			
			// Execute query and send to subscriber received data transactions
			const data = await lastValueFrom(newVal$);
			this.dataSubject.next(data);
			
			if (data.count < pageSize) {
				pageSize = -1;
			} else {
				// Reduce the page size by the received number of transactions
				pageIndexInternal++;
				pageSize -= currentSizePerLoad;
			}
		}
	}
}
