import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { TransactionItemDeprecated } from '../../../../model/transaction.model';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../services/layout.service';

@Component({
  templateUrl: 'transaction-list.component.html',
  styleUrls: ['transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'accountType',
    'country',
    'source',
    //'transactionId',
    //'transactionDate',
    //'transactionType',
    //'senderOrReceiver',
    //'paymentProvider',
    'users',
    'widget',
    'search'
  ];

  selectedTransaction?: TransactionItemDeprecated;
  transactions: TransactionItemDeprecated[] = [];
  transactionCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});

  private destroy$ = new Subject();
  private transactionsSubscription = Subscription.EMPTY;

  displayedColumns: string[] = [
    'details', 'id', 'created', 'executed', 'email', 'type', 'instrument', 'paymentProvider', 'paymentProviderResponse',
    'source', 'walletSource', 'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
    'address', 'euro', 'fees', 'status'
  ];

  constructor(
    private layoutService: LayoutService,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.selectedTransaction = undefined;
        });

    this.loadList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadList();
    });
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadList();
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadList();
    return event;
  }

  toggleDetails(transaction: TransactionItemDeprecated): void {
    if (this.isSelectedTransaction(transaction.id)) {
      this.selectedTransaction = undefined;
    } else {
      this.selectedTransaction = transaction;
    }
  }

  getDetailsIcon(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'Hide details' : 'Transaction details';
  }

  handleDetailsPanelClosed(): void {
    this.selectedTransaction = undefined;
  }

  private loadList(): void {
    this.transactionsSubscription.unsubscribe();

    this.transactionsSubscription = this.adminService.getTransactions(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    )
                                        .pipe(
                                          takeUntil(this.destroy$)
                                        )
                                        .subscribe(({ list, count }) => {
                                          this.transactions = list;
                                          this.transactionCount = count;
                                        });
  }

  private isSelectedTransaction(transactionId: string): boolean {
    return !!this.selectedTransaction && this.selectedTransaction.id === transactionId;
  }
}
