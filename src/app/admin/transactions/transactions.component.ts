import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { TransactionItem } from '../../model/transaction.model';

@Component({
  templateUrl: 'transactions.component.html',
  styleUrls: ['../admin.scss', 'transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private _showDetails = false;
  inProgress = false;
  errorMessage = '';
  selectedTransaction: TransactionItem | null = null;
  transactions: TransactionItem[] = [];
  displayedColumns: string[] = ['code', 'details'];

  get showDetailed(): boolean {
    return this._showDetails;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
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
    this._showDetails = visible;
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
