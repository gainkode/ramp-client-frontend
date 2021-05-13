import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { TransactionItem } from '../../model/transaction.model';
import { TransactionListResult } from '../../model/generated-models';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'transactions.component.html',
  styleUrls: ['../admin.scss', 'transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private pShowDetails = false;
  private pTransactionsSubscription!: any;
  inProgress = false;
  errorMessage = '';
  selectedTransaction: TransactionItem | null = null;
  transactions: TransactionItem[] = [];
  transactionCount = 0;
  pageSize = 10;
  pageIndex = 0;
  displayedColumns: string[] = [
    'id', 'executed', 'email', 'type', 'instrument', 'paymentProvider', 'paymentProviderResponse',
    'source', 'walletSource', 'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
    'address', 'euro', 'fees', 'status', 'details'
  ];

  get showDetailed(): boolean {
    return this.pShowDetails;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    const s: Subscription = this.pTransactionsSubscription;
    if (s !== undefined) {
      s.unsubscribe();
    }
  }

  private loadTransactions(): void {
    this.transactionCount = 0;
    const transactionsData = this.adminService.getTransactions(this.pageIndex, this.pageSize);
    if (transactionsData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this.pTransactionsSubscription = transactionsData.valueChanges.subscribe(({ data }) => {
        const dataList = data.getTransactions as TransactionListResult;
        if (dataList !== null) {
          this.transactionCount = dataList?.count as number;
          if (this.transactionCount > 0) {
            this.transactions = dataList?.list?.map((val) => new TransactionItem(val)) as TransactionItem[];
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

  private refresh(): void {
    const s: Subscription = this.pTransactionsSubscription;
    if (s !== undefined) {
      s.unsubscribe();
    }
    this.loadTransactions();
  }

  private isSelectedTransaction(transactionId: string): boolean {
    let selected = false;
    if (this.selectedTransaction !== null) {
      if (this.selectedTransaction.id === transactionId) {
        selected = true;
      }
    }
    return selected;
  }

  private showEditor(transaction: TransactionItem | null, visible: boolean): void {
    this.pShowDetails = visible;
    if (visible) {
      this.selectedTransaction = transaction;
    } else {
      this.selectedTransaction = null;
    }
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.refresh();
    return event;
  }

  toggleDetails(transaction: TransactionItem): void {
    let show = true;
    if (this.isSelectedTransaction(transaction.id)) {
      show = false;
    }
    this.showEditor(transaction, show);
  }

  getDetailsIcon(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'clear' : 'description';
  }

  getDetailsTooltip(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'Hide details' : 'Transaction details';
  }
}
