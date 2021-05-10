import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
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
    const transactionsData = this.adminService.getTransactions();
    if (transactionsData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this.pTransactionsSubscription = transactionsData.valueChanges.subscribe(({ data }) => {
        const dataList = data.getTransactions as TransactionListResult;
        let itemCount = 0;
        if (dataList !== null) {
          itemCount = dataList?.count as number;
          if (itemCount > 0) {
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

  ngOnDestroy(): void {
    const s: Subscription = this.pTransactionsSubscription;
    if (s !== undefined) {
      s.unsubscribe();
    }
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
