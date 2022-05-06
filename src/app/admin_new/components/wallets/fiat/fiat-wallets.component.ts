import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { FiatWalletItem } from 'src/app/admin_old/model/wallet.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';

@Component({
  selector: 'app-admin-fiat-wallets',
  templateUrl: 'fiat-wallets.component.html',
  styleUrls: ['fiat-wallets.component.scss']
})
export class AdminFiatWalletsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'users',
    'search'
  ];
  displayedColumns: string[] = [
    'details', 'userId', 'balance', 'asset', 'created'
  ];
  inProgress = false;
  permission = 0;
  selectedWallet?: FiatWalletItem;
  walletCount = 0;
  currencyOptions: CurrencyView[] = [];
  fiatCurrencyList: CurrencyView[] = [];
  wallets: FiatWalletItem[] = [];
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
    public activeRoute: ActivatedRoute,
    private router: Router
  ) {
    const filterUserId = activeRoute.snapshot.params['userid'];
    const filterVaultId = activeRoute.snapshot.params['vaultids'];
    if (filterUserId) {
      this.filter.users = [filterUserId as string];
    }
    if (filterVaultId) {
      const filterData = (filterVaultId as string).split('#');
      this.filter.walletIds = filterData;
    }
    this.permission = this.auth.isPermittedObjectCode('WALLETS');
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

  onSaveWallet(): void {
    this.selectedWallet = undefined;
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

  toggleDetails(wallet: FiatWalletItem): void {
    if (this.isSelectedWallet(wallet.id)) {
      this.selectedWallet = undefined;
    } else {
      this.selectedWallet = wallet;
    }
  }

  showDetails(wallet: FiatWalletItem, content: any) {
    this.selectedWallet = wallet;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  private isSelectedWallet(walletId: string): boolean {
    return !!this.selectedWallet && this.selectedWallet.id === walletId;
  }

  private loadList(): void {
    if (this.currencyOptions.length === 0) {
      this.loadCurrencies();
    } else {
      this.loadWallets();
    }
  }

  private loadWallets(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getFiatWallets(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.wallets = list;
        this.walletCount = count;
        this.inProgress = false;
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
            this.fiatCurrencyList = this.currencyOptions.filter(x => x.fiat === true);
        } else {
          this.currencyOptions = [];
          this.fiatCurrencyList = [];
        }
        this.loadWallets();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  // showWallets(transactionId: string): void {
  //   const transaction = this.transactions.find(x => x.id === transactionId);
  //   if (transaction?.type === TransactionType.Deposit || transaction?.type === TransactionType.Withdrawal) {
  //     this.router.navigateByUrl(`/admin/wallets/fiat/vaults/${transaction?.vaultIds.join('#') ?? ''}`);
  //   } else {
  //     this.router.navigateByUrl(`/admin/wallets/crypto/vaults/${transaction?.vaultIds.join('#') ?? ''}`);
  //   }
  // }

  refresh(): void {
    this.loadList();
  }
}
