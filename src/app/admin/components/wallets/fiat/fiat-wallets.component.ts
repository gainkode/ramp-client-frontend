import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { FiatWalletItem } from 'src/app/admin/model/wallet.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-fiat-wallets',
  templateUrl: 'fiat-wallets.component.html',
  styleUrls: ['fiat-wallets.component.scss']
})
export class AdminFiatWalletsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'users',
    'search',
    'zeroBalance'
  ];
  displayedColumns: string[] = [
    'details', 'userId', 'balance', 'asset', 'created'
  ];
  inProgress = false;
  permission = 0;
  selectedWallet?: FiatWalletItem;
  walletCount = 0;
  wallets: FiatWalletItem[] = [];
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  adminAdditionalSettings: Record<string, any> = {};
  
  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
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
    this.loadCommonSettings();
    this.loadWallets();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadWallets();
      })
    );
  }

  onSaveWallet(): void {
    this.selectedWallet = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadWallets();
    }
  }

  onCloseDetails(): void {
    if (this.detailsDialog) {
      this.detailsDialog.dismiss();
    }
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadWallets();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadWallets();
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

  private loadCommonSettings(){
    let settingsCommon = this.auth.getLocalSettingsCommon();
    if(settingsCommon){
      this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
      if(this.adminAdditionalSettings?.tabs?.fiatWallet?.filterFields){
        this.filterFields = this.adminAdditionalSettings.tabs.fiatWallet.filterFields;
      }
    }
  }

  private isSelectedWallet(walletId: string): boolean {
    return !!this.selectedWallet && this.selectedWallet.id === walletId;
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
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
