import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { SettingsCurrencyWithDefaults, TransactionStatusDescriptorMap, TransactionType } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { TransactionItemFull } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-admin-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class AdminTransactionTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'accountType',
    'country',
    'source',
    'createdDate',
    'completedDate',
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
  displayedColumns: string[] = [
    'details', 'code', 'created', 'accountName', 'email', 'accountStatus', 'type', 'widgetName', 'from', 'to',
    'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
    'address', 'instrument', 'paymentProvider', 'status', 'userType', 'source', 'kycStatus', 'id'
  ];
  inProgress = false;
  permission = 0;
  unbenchmarkDialog?: NgbModalRef;
  selectedTransaction?: TransactionItemFull;
  selectedForUnbenchmark = false;
  transactionCount = 0;
  transactions: TransactionItemFull[] = [];
  userStatuses: TransactionStatusDescriptorMap[] = [];
  currencyOptions: CurrencyView[] = [];
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  
  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private commonDataService: CommonDataService,
    private adminService: AdminDataService,
    private profileService: ProfileDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('TRANSACTIONS');
  }

  ngOnInit(): void {
    this.loadList();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadList();
      })
    );
  }

  onTransactionSelected(item: TransactionItemFull): void {
    item.selected = !item.selected;
    this.selectedForUnbenchmark = this.transactions.some(x =>
      x.selected === true && x.type !== TransactionType.Receive);
  }

  onSaveTransaction(): void {
    this.selectedTransaction = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadList();
    }
  }

  onCloseDetails(): void {
    if (this.detailsDialog) {
      this.detailsDialog.dismiss();
    }
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

  showDetails(transaction: TransactionItemFull, content: any) {
    this.selectedTransaction = transaction;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  private isSelectedTransaction(transactionId: string): boolean {
    return !!this.selectedTransaction && this.selectedTransaction.id === transactionId;
  }

  private loadList(): void {
    if (this.userStatuses.length === 0) {
      this.loadTransactionStatuses();
    } else {
      this.loadTransactions();
    }
  }

  private loadTransactions(): void {
    this.inProgress = true;
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
        this.inProgress = false;
      })
    );
  }

  private loadTransactionStatuses(): void {
    this.inProgress = true;
    this.userStatuses = [];
    const statusListData$ = this.profileService.getTransactionStatuses();
    this.subscriptions.add(
      statusListData$.valueChanges.subscribe(({ data }) => {
        this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
        this.loadCurrencies();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private loadCurrencies(): void {
    this.inProgress = true;
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
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
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

  refresh(): void {
    this.loadList();
  }

  export(content: any): void {
    const exportData$ = this.adminService.exportTransactionsToCsv(
      this.transactions.filter(x => x.selected === true).map(val => val.id),
      this.sortedField,
      this.sortedDesc,
      this.filter
    );
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  unbenchmark(content: any): void {

    this.unbenchmarkDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.unbenchmarkDialog.closed.subscribe(result => {
        if (result === 'Confirm') {
          this.executeUnbenchmark();
        }
      })
    );
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
}
