import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { WalletItem } from 'admin/model/wallet.model';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-crypto-wallets',
	templateUrl: 'crypto-wallets.component.html',
	styleUrls: ['crypto-wallets.component.scss']
})
export class AdminCryptoWalletsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
  	'users',
  	'search',
  	'zeroBalance'
  ];
  displayedColumns: string[] = [
  	'details', 'vaultName', 'userEmail', 'address', 'custodyProvider', 'legacyAddress', 'description', 'type',
  	'addressFormat', 'assetId', 'originalId', 'total', 'available', 'pending', 'lockedAmount'
  ];
  inProgress = false;
  permission = 0;
  selectedWallet?: WalletItem;
  walletCount = 0;
  wallets: WalletItem[] = [];
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'address';
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

  ngAfterViewInit(): void {
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

  toggleDetails(wallet: WalletItem): void {
  	if (this.isSelectedWallet(wallet.address)) {
  		this.selectedWallet = undefined;
  	} else {
  		this.selectedWallet = wallet;
  	}
  }

  showDetails(wallet: WalletItem, content: any): void {
  	this.selectedWallet = wallet;
  	this.detailsDialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  }

  private loadCommonSettings(): void{
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if(settingsCommon){
  		this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
  		if(this.adminAdditionalSettings?.tabs?.cryptoWallet?.filterFields){
  			this.filterFields = this.adminAdditionalSettings.tabs.cryptoWallet.filterFields;
  		}
  	}
  }

  private isSelectedWallet(walletAddress: string): boolean {
  	return !!this.selectedWallet && this.selectedWallet.address === walletAddress;
  }

  private loadWallets(): void {
  	this.inProgress = true;
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
  			this.inProgress = false;
  		}, (error) => {
  			this.inProgress = false;
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }

  showCustodyProvider(url: string): void {
  	window.open(url, '_blank');
  }
}
