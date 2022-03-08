import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { take } from 'rxjs/operators';
import { AssetAddress, SettingsCurrencyWithDefaults } from '../../../../model/generated-models';
import { WalletItem } from '../../../model/wallet.model';
import { CurrencyView } from 'src/app/model/payment.model';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: 'wallet-list.component.html',
  styleUrls: ['wallet-list.component.scss']
})
export class WalletListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    //'asset',
    'users',
    'search'
  ];

  selectedWallet?: WalletItem;
  wallets: WalletItem[] = [];
  walletCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'address';
  sortedDesc = true;
  filter = new Filter({});
  currencyList: CurrencyView[] = [];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  displayedColumns: string[] = [
    'details', 'vaultName', 'userEmail',
    'address', 'custodyProvider', 'legacyAddress', 'description', 'type',
    'addressFormat', 'assetId', 'originalId', 'total', 'available', 'pending', 'lockedAmount'
  ];

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private commonService: CommonDataService,
    private adminService: AdminDataService,
    private router: Router,
    public activeRoute: ActivatedRoute) {
      const filterUserId = activeRoute.snapshot.params['userid'];
      const filterTransactionId = activeRoute.snapshot.params['transactionid'];
      if (filterUserId) {
        this.filter.users = [filterUserId as string];
      }
      if (filterTransactionId) {
        this.filter.transactionIds = [filterTransactionId as string];
      }
  }

  ngOnInit(): void {
    this.loadCurrencyData();
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
        this.loadWallets();
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadWallets();
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadWallets();
    return event;
  }

  private showEditor(wallet: WalletItem | null, visible: boolean): void {
    if (visible) {
      this.selectedWallet = wallet ?? undefined;
    } else {
      this.selectedWallet = undefined;
      this.setEditMode(false);
    }
  }

  toggleDetails(wallet: WalletItem): void {
    if (this.isSelectedWallet(wallet.address)) {
      this.selectedWallet = undefined;
    } else {
      this.selectedWallet = wallet;
    }
  }

  getDetailsIcon(walletAddress: string): string {
    return (this.isSelectedWallet(walletAddress)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(walletAddress: string): string {
    return (this.isSelectedWallet(walletAddress)) ? 'Hide details' : 'Wallet details';
  }

  handleDetailsPanelClosed(): void {
    this.selectedWallet = undefined;
  }

  showWallets(walletId: string): void {

  }

  private setEditMode(mode: boolean): void {
    this.changeEditMode.emit(mode);
  }

  private loadCurrencyData(): void {
    this.currencyList = [];
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
          if (currencySettings.settingsCurrency) {
            if (currencySettings.settingsCurrency.count ?? 0 > 0) {
              this.currencyList = currencySettings.settingsCurrency.list?.
                map((val) => new CurrencyView(val)) as CurrencyView[];
            }
          }
          this.loadWallets();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private loadWallets(): void {
    const listData$ = this.adminService.getWallets(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.wallets = list;
        this.walletCount = count;
      })
    );
  }

  private isSelectedWallet(walletAddress: string): boolean {
    return !!this.selectedWallet && this.selectedWallet.address === walletAddress;
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.showEditor(null, false);
    this.setEditMode(false);
  }

  onDeleteWallet(customer: AssetAddress): void {
    const requestData = this.adminService.deleteWallet(customer.vaultId ?? '', customer.userId ?? '');
    if (requestData) {
      this.subscriptions.add(
        requestData.subscribe(({ data }) => {
          this.showEditor(null, false);
          this.loadWallets();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  onSaveWallet(customer: AssetAddress): void {
    const requestData = this.adminService.updateUserVault(customer);
    if (requestData) {
      this.subscriptions.add(
        requestData.subscribe(({ data }) => {
          this.showEditor(null, false);
          this.loadWallets();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }
}
