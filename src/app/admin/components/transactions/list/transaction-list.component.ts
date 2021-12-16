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
import { SettingsCurrencyWithDefaults, Transaction, TransactionStatusDescriptorMap } from 'src/app/model/generated-models';
import { ProfileDataService } from 'src/app/services/profile.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { CurrencyView } from 'src/app/model/payment.model';

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
  userStatuses: TransactionStatusDescriptorMap[] = [];
  currencyOptions: CurrencyView[] = [];
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  selected = false;

  private destroy$ = new Subject();
  private transactionsSubscription = Subscription.EMPTY;
  private subscriptions: Subscription = new Subscription();

  displayedColumns: string[] = [
    'details', 'id', 'created', 'executed', 'email', 'type', 'instrument', 'paymentProvider', 'paymentProviderResponse',
    'source', 'walletSource', 'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
    'address', 'euro', 'fees', 'status'
  ];

  constructor(
    private layoutService: LayoutService,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private profileService: ProfileDataService,
    private commonDataService: CommonDataService,
    private router: Router
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
    this.subscriptions.unsubscribe();
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

  onTransactionSelected(item: TransactionItemDeprecated): void {
    item.selected = !item.selected;
    this.selected = this.transactions.some(x => x.selected === true);
  }

  unbenchmark(): void {
    const requestData = this.adminService.unbenchmarkTransaction(
      this.transactions.map(val => val.id)
    );
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.transactions.forEach(x => x.selected = false);
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  private loadCurrencies(): void {
    this.currencyOptions = [];
    this.commonDataService.getSettingsCurrency()?.valueChanges.subscribe(({ data }) => {
      const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
      if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
        this.currencyOptions = currencySettings.settingsCurrency.list
          ?.map((val) => new CurrencyView(val)) as CurrencyView[];
      } else {
        this.currencyOptions = [];
      }
      this.loadTransactions();
    }, (error) => {
      if (this.auth.token === '') {
        this.router.navigateByUrl('/');
      }
    });
  }

  private loadList(): void {
    if (this.userStatuses.length === 0) {
      this.loadTransactionStatuses();
    } else {
      this.loadTransactions();
    }
  }

  private loadTransactions(): void {
    this.transactionsSubscription.unsubscribe();

    this.transactionsSubscription = this.adminService.getTransactions(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    ).pipe(takeUntil(this.destroy$)).subscribe(({ list, count }) => {
      this.transactions = list;
      this.transactionCount = count;
      this.transactions.forEach(val => {
        val.statusInfo = this.userStatuses.find(x => x.key === val.status);
      });
    });
  }

  private loadTransactionStatuses(): void {
    this.userStatuses = [];
    const statusListData = this.profileService.getTransactionStatuses();
    if (statusListData) {
      this.subscriptions.add(
        statusListData.valueChanges.subscribe(({ data }) => {
          this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
          this.loadCurrencies();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private isSelectedTransaction(transactionId: string): boolean {
    return !!this.selectedTransaction && this.selectedTransaction.id === transactionId;
  }

  onSaveTransaction(transaction: Transaction): void {
    const requestData = this.adminService.updateTransaction(transaction);
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.selectedTransaction = undefined;
        this.loadList();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onDeleteTransaction(id: string): void {
    const requestData = this.adminService.deleteTransaction(id);
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.selectedTransaction = undefined;
        this.loadList();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onCancelEdit(): void {
    this.selectedTransaction = undefined;
  }
}
