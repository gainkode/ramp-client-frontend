import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { TransactionItemFull } from '../../../../model/transaction.model';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { take, takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../services/layout.service';
import { SettingsCurrencyWithDefaults, TransactionStatusDescriptorMap, TransactionType } from 'src/app/model/generated-models';
import { ProfileDataService } from 'src/app/services/profile.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { CurrencyView } from 'src/app/model/payment.model';
import { DeleteDialogBox } from 'src/app/components/dialogs/delete-box.dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';

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
    'createdDateStart',
    'createdDateEnd',
    'completedDateStart',
    'completedDateEnd',
    'paymentInstrument',
    'transactionIds',
    'transactionType',
    'transactionStatus',
    'tier',
    'widget',
    'walletAddress',
    'users',
    'search'
  ];

  permission = 0;
  selectedTransaction?: TransactionItemFull;
  transactions: TransactionItemFull[] = [];
  transactionCount = 0;
  userStatuses: TransactionStatusDescriptorMap[] = [];
  currencyOptions: CurrencyView[] = [];
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  selectedForUnbenchmark = false;

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  displayedColumns: string[] = [
    'details', 'code', 'created', 'accountName', 'email', 'accountStatus', 'type', 'widgetName', 'from', 'to',
    'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
    'address', 'instrument', 'paymentProvider', 'status', 'userType', 'source', 'kycStatus', 'id'
  ];

  constructor(
    private layoutService: LayoutService,
    public dialog: MatDialog,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private profileService: ProfileDataService,
    private commonDataService: CommonDataService,
    private router: Router,
    public activeRoute: ActivatedRoute) {
    const id = activeRoute.snapshot.params['id'];
    if (id) {
      this.filter.users = [id as string];
    }
    this.permission = this.auth.isPermittedObjectCode('TRANSACTIONS');
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedTransaction = undefined;
    });

    this.loadList();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadList();
      })
    );
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

  toggleDetails(transaction: TransactionItemFull): void {
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

  onTransactionSelected(item: TransactionItemFull): void {
    item.selected = !item.selected;
    this.selectedForUnbenchmark = this.transactions.some(x =>
      x.selected === true && x.type !== TransactionType.Receive);
  }

  unbenchmark(): void {
    const dialogRef = this.dialog.open(DeleteDialogBox, {
      width: '400px',
      data: {
        title: 'Settle transaction(s)',
        message: `You are going to update transaction data. Confirm operation.`,
        button: 'CONFIRM'
      }
    });
    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.executeUnbenchmark();
        }
      })
    );
  }

  showWallets(transactionId: string): void {
    const transaction = this.transactions.find(x => x.id === transactionId);
    if (transaction?.type === TransactionType.Deposit || transaction?.type === TransactionType.Withdrawal) {
      this.router.navigateByUrl(`/admin/wallets/fiat/vaults/${transaction?.vaultIds.join('#') ?? ''}`);
    } else {
      this.router.navigateByUrl(`/admin/wallets/crypto/vaults/${transaction?.vaultIds.join('#') ?? ''}`);
    }
  }

  private executeUnbenchmark(): void {
    const requestData$ = this.adminService.unbenchmarkTransaction(
      this.transactions.filter(x => x.selected === true && x.type !== TransactionType.Receive).map(val => val.id)
    );
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.transactions.forEach(x => x.selected = false);
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private loadCurrencies(): void {
    this.currencyOptions = [];
    this.subscriptions.add(
      this.commonDataService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
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
      })
    );
  }

  private loadList(): void {
    if (this.userStatuses.length === 0) {
      this.loadTransactionStatuses();
    } else {
      this.loadTransactions();
    }
  }

  private loadTransactions(): void {
    const listData$ = this.adminService.getTransactions(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.transactions = list;
        this.transactionCount = count;
        this.transactions.forEach(val => {
          val.statusInfo = this.userStatuses.find(x => x.key === val.status);
        });
      })
    );
  }

  private loadTransactionStatuses(): void {
    this.userStatuses = [];
    const statusListData$ = this.profileService.getTransactionStatuses();
    this.subscriptions.add(
      statusListData$.valueChanges.subscribe(({ data }) => {
        this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
        this.loadCurrencies();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private isSelectedTransaction(transactionId: string): boolean {
    return !!this.selectedTransaction && this.selectedTransaction.id === transactionId;
  }

  onSaveTransaction(): void {
    this.selectedTransaction = undefined;
    this.loadList();
  }

  onCancelEdit(): void {
    this.selectedTransaction = undefined;
  }

  export(): void {
    const exportData$ = this.adminService.exportTransactionsToCsv(
      this.transactions.filter(x => x.selected === true).map(val => val.id),
      this.sortedField,
      this.sortedDesc,
      this.filter
    );
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.dialog.open(CommonDialogBox, {
          width: '400px',
          data: {
            title: 'Export',
            message: 'Exported list of transactions has been sent to your email.'
          }
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
