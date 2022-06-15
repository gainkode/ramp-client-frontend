import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ListRequestFilter } from 'src/app/model/filter.model';
import { AssetAddress, SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { Filter } from '../../../admin/model/filter.model';
import { FiatWalletItem, WalletItem } from '../../model/wallet.model';
import { AdminDataService } from '../../../services/admin-data.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  templateUrl: 'wallets.component.html',
  styleUrls: ['wallets.component.scss']
})
export class AdminWalletsComponent implements OnDestroy {
  permission = 0;
  selectedTab = 0;
  selectedCryptoWallet: WalletItem | null = null;
  selectedFiatWallet: FiatWalletItem | null = null;
  currencyList: CurrencyView[] = [];
  fiatCurrencyList: CurrencyView[] = [];
  cryptoWallets: WalletItem[] = [];
  fiatWallets: FiatWalletItem[] = [];
  cryptoWalletCount = 0;
  fiatWalletCount = 0;
  cryptoWalletErrorMessage = '';
  fiatWalletErrorMessage = '';
  cryptoListFilter: ListRequestFilter = {
    pageIndex: 0,
    pageSize: 25,
    sortField: 'address',
    desc: true
  };
  fiatListFilter: ListRequestFilter = {
    pageIndex: 0,
    pageSize: 25,
    sortField: 'created',
    desc: true
  };
  cryptoFilterFields = [
    'users',
    'search'
  ];
  fiatFilterFields = [
    'users',
    'assets'
  ];
  cryptoFilter = new Filter({});
  fiatFilter = new Filter({});

  private pEditMode = false;
  private subscriptions: Subscription = new Subscription();

  get editMode(): boolean {
    return this.pEditMode;
  }

  constructor(
    private layoutService: LayoutService,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private commonService: CommonDataService,
    public activeRoute: ActivatedRoute,
    private router: Router) {
    const filterUserId = activeRoute.snapshot.params['cryptouserid'];
    const filterCryptoVaultId = activeRoute.snapshot.params['cryptovaultids'];
    const filterFiatVaultId = activeRoute.snapshot.params['fiatvaultids'];
    if (filterUserId) {
      this.cryptoFilter.users = [filterUserId as string];
    }
    if (filterCryptoVaultId) {
      const filterData = (filterCryptoVaultId as string).split('#');
      this.cryptoFilter.walletIds = filterData;
    }
    if (filterFiatVaultId) {
      const filterData = (filterFiatVaultId as string).split('#');
      this.fiatFilter.walletIds = filterData;
      this.selectedTab = 1;
    }
    this.permission = this.auth.isPermittedObjectCode('WALLETS');
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.layoutService.rightPanelCloseRequested$.subscribe(() => {
        this.onCancelEdit();
      })
    );
    this.loadCurrencyData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setSelectedTab(index: number): void {
    this.onCancelEdit();
    this.selectedTab = index;
    this.loadData();
  }

  handleCryptoFilterApplied(filter: Filter): void {
    this.cryptoFilter = filter;
    this.loadData();
  }

  handleFiatFilterApplied(filter: Filter): void {
    this.fiatFilter = filter;
    this.loadData();
  }

  reloadCryptoWallets(data: ListRequestFilter): void {
    this.cryptoListFilter = data;
    this.loadData();
  }

  reloadFiatWallets(data: ListRequestFilter): void {
    this.fiatListFilter = data;
    this.loadData();
  }

  selectCryptoWallet(wallet: WalletItem | null): void {
    this.selectedCryptoWallet = wallet;
  }

  selectFiatWallet(wallet: FiatWalletItem | null): void {
    this.selectedFiatWallet = wallet;
  }

  private loadData(): void {
    this.showCryptoWalletEditor(null, false);
    this.showFiatWalletEditor(null, false);
    if (this.selectedTab === 0) {
      // Crypto wallets
      this.loadCryptoWallets();
    } else {
      // Fiat wallets
      this.loadFiatWallets();
    }
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
              this.fiatCurrencyList = this.currencyList.filter(x => x.fiat === true);
            }
          }
          this.loadData();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private loadFiatWallets(): void {
    const listData$ = this.adminService.getFiatWallets(
      this.fiatListFilter.pageIndex,
      this.fiatListFilter.pageSize,
      this.fiatListFilter.sortField,
      this.fiatListFilter.desc,
      this.fiatFilter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.fiatWallets = list;
        this.fiatWalletCount = count;
      })
    );
  }

  private loadCryptoWallets(): void {
    const listData$ = this.adminService.getWallets(
      this.cryptoListFilter.pageIndex,
      this.cryptoListFilter.pageSize,
      this.cryptoListFilter.sortField,
      this.cryptoListFilter.desc,
      this.cryptoFilter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.cryptoWallets = list;
        this.cryptoWalletCount = count;
      })
    );
  }

  private setEditMode(mode: boolean): void {
    this.pEditMode = mode;
  }

  private showCryptoWalletEditor(wallet: WalletItem | null, visible: boolean): void {
    if (visible) {
      this.selectedCryptoWallet = wallet;
    } else {
      this.selectedCryptoWallet = null;
      this.setEditMode(false);
    }
  }

  private showFiatWalletEditor(wallet: FiatWalletItem | null, visible: boolean): void {
    if (visible) {
      this.selectedFiatWallet = wallet;
    } else {
      this.selectedFiatWallet = null;
      this.setEditMode(false);
    }
  }

  onCancelEdit(): void {
    this.showCryptoWalletEditor(null, false);
    this.showFiatWalletEditor(null, false);
    this.setEditMode(false);
  }

  onDeleteCryptoWallet(address: AssetAddress): void {
    const requestData = this.adminService.deleteWallet(address.vaultId ?? '', address.userId ?? '');
    if (requestData) {
      this.subscriptions.add(
        requestData.subscribe(({ data }) => {
          this.showCryptoWalletEditor(null, false);
          this.loadData();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  onSavedCryptoWallet(address: AssetAddress): void {
    const requestData = this.adminService.updateUserVault(address);
    if (requestData) {
      this.subscriptions.add(
        requestData.subscribe(({ data }) => {
          this.showCryptoWalletEditor(null, false);
          this.loadData();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  handleDetailsPanelClosed(): void {
    this.selectedCryptoWallet = null;
    this.selectedFiatWallet = null;
  }
}
