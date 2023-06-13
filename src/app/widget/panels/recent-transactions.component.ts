import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionStatusDescriptorMap, TransactionSource, TransactionShortListResult } from 'model/generated-models';
import { TransactionItem } from 'model/transaction.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-widget-recent-transactions',
	templateUrl: 'recent-transactions.component.html',
	styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/profile.scss']
})
export class WidgetRecentTransactionsComponent implements OnDestroy, OnInit {
  @Output() back = new EventEmitter();

  inProgress = false;
  errorMessage = '';
  userStatuses: TransactionStatusDescriptorMap[] = [];
  transactions: TransactionItem[] = [];
  transactionCount = 0;
  selectedTransaction: TransactionItem | null = null;
  pageSize = 10;
  pageIndex = 0;

  private pTransactionsSubscription: Subscription | undefined = undefined;
  private pStatusSubscription: Subscription | undefined = undefined;

  constructor(
  	private auth: AuthService,
  	private errorHandler: ErrorService,
  	private profileService: ProfileDataService,
  	private router: Router) {
  }

  ngOnInit(): void {
  	if (this.userStatuses.length === 0) {
  		this.loadTransactionStatuses();
  	} else {
  		this.loadTransactions();
  	}
  }

  ngOnDestroy(): void {
  	if (this.pTransactionsSubscription !== undefined) {
  		this.pTransactionsSubscription.unsubscribe();
  		this.pTransactionsSubscription = undefined;
  	}
  	if (this.pStatusSubscription !== undefined) {
  		this.pStatusSubscription.unsubscribe();
  		this.pStatusSubscription = undefined;
  	}
  }

  private loadTransactionStatuses(): void {
  	const statusListData$ = this.profileService.getTransactionStatuses().valueChanges.pipe(take(1));
  	this.inProgress = true;
  	this.pStatusSubscription = statusListData$.subscribe(({ data }) => {
  		this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
  		this.inProgress = false;
  		this.loadTransactions();
  	}, (error) => {
  		this.inProgress = false;
  		if (this.auth.token !== '') {
  			this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions statuses');
  		} else {
  			void this.router.navigateByUrl('/');
  		}
  	});
  }

  private loadTransactions(): void {
  	this.transactionCount = 0;
  	const transactionsData$ = this.profileService.getMyTransactions(
  		this.pageIndex,
  		this.pageSize,
  		[TransactionSource.Widget, TransactionSource.QuickCheckout],
  		undefined,
  		[],
  		'',
  		'',
  		'created',
  		true).valueChanges.pipe(take(1));
  	this.inProgress = true;
  	this.pTransactionsSubscription = transactionsData$.subscribe(({ data }) => {
  		const dataList = data.myTransactions as TransactionShortListResult;
  		if (dataList !== null) {
  			this.transactionCount = dataList?.count as number;
  			if (this.transactionCount > 0) {
  				this.transactions = dataList?.list?.map((val) => {
  					const status = this.userStatuses.find(x => x.key === val.status);
  					return new TransactionItem(val, status);
  				}) as TransactionItem[];
  			}
  		}
  		this.inProgress = false;
  	}, (error) => {
  		this.inProgress = false;
  		if (this.auth.token !== '') {
  			this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions');
  		} else {
  			void this.router.navigateByUrl('/');
  		}
  	});
  }
}
