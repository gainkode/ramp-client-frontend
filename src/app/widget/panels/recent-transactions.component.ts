import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { TransactionShortListResult, TransactionStatusDescriptorMap } from 'src/app/model/generated-models';
import { TransactionItem } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

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
  sortedField = 'dt';
  sortedDesc = true;
  displayedColumns: string[] = [
    'status', 'payment'
  ];

  private pTransactionsSubscription: Subscription | undefined = undefined;
  private pStatusSubscription: Subscription | undefined = undefined;

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private profileService: ProfileDataService,
    private router: Router) {
  }

  ngOnInit(): void {
    console.log('init');
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
    console.log('status');
    const statusListData$ = this.profileService.getTransactionStatuses().valueChanges.pipe(take(1));
    this.inProgress = true;
    this.pStatusSubscription = statusListData$.subscribe(({ data }) => {
      console.log('status complete');
      this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
      this.inProgress = false;
      this.loadTransactions();
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions statuses');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }

  private loadTransactions(): void {
    console.log('transactions');
    this.transactionCount = 0;
    const transactionsData$ = this.profileService.getMyTransactions(
      this.pageIndex,
      this.pageSize,
      [],
      undefined,
      [],
      '',
      '',
      'type',
      this.sortedDesc).valueChanges.pipe(take(1));
    this.inProgress = true;
    this.pTransactionsSubscription = transactionsData$.subscribe(({ data }) => {
      console.log('transactions complete');
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
        this.router.navigateByUrl('/');
      }
    });
  }

}
