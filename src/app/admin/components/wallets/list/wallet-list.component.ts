import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { takeUntil } from 'rxjs/operators';
import { AssetAddress } from '../../../../model/generated-models';
import { Wallet } from '../../../model/wallet.model';

@Component({
  templateUrl: 'wallet-list.component.html',
  styleUrls: ['wallet-list.component.scss']
})
export class WalletListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    //'asset',
    'user',
    'search'
  ];

  selectedWallet?: Wallet;
  wallets: Wallet[] = [];
  walletCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'address';
  sortedDesc = true;
  filter = new Filter({});

  private destroy$ = new Subject();
  private walletsSubscription = Subscription.EMPTY;

  displayedColumns: string[] = [
    //'details',
    'address', 'legacyAddress', 'description', 'type',
    'addressFormat', 'assetId', 'originalId', 'total', 'available', 'pending', 'lockedAmount', 'vaultId',
    'vaultName', 'userId', 'userEmail'
  ];

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService) {
  }

  ngOnInit(): void {
    this.loadWallets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadWallets();
    });
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

  toggleDetails(wallet: Wallet): void {
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

  private loadWallets(): void {
    this.walletsSubscription.unsubscribe();

    this.walletsSubscription = this.adminService.getWallets(
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
                                          this.wallets = list;
                                          this.walletCount = count;
                                        });
  }

  private isSelectedWallet(walletAddress: string): boolean {
    return !!this.selectedWallet && this.selectedWallet.address === walletAddress;
  }
}
