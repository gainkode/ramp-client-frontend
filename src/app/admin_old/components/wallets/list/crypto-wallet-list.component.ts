import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { WalletItem } from '../../../model/wallet.model';
import { CurrencyView } from 'src/app/model/payment.model';
import { ListRequestFilter } from 'src/app/model/filter.model';

@Component({
  selector: 'app-crypto-wallet-list',
  templateUrl: 'crypto-wallet-list.component.html',
  styleUrls: ['crypto-wallet-list.component.scss']
})
export class CryptoWalletListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() permission = 0;
  @Input() listOptions: ListRequestFilter = {
    pageIndex: 0,
    pageSize: 25,
    sortField: 'address',
    desc: true
  };
  @Input() currencyList: CurrencyView[] = [];
  @Input() wallets: WalletItem[] = [];
  @Input() walletCount = 0;
  @Output() reload = new EventEmitter<ListRequestFilter>();
  @Output() select = new EventEmitter<WalletItem | null>();
  @ViewChild(MatSort) sort!: MatSort;

  selectedWallet: WalletItem | null = null;

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  displayedColumns: string[] = [
    'details', 'vaultName', 'userEmail', 'address', 'custodyProvider', 'legacyAddress', 'description', 'type',
    'addressFormat', 'assetId', 'originalId', 'total', 'available', 'pending', 'lockedAmount'
  ];

  constructor() {
      
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.reload.emit({
          pageIndex: this.listOptions.pageIndex,
          pageSize: this.listOptions.pageSize,
          sortField: this.sort.active,
          desc: (this.sort.direction === 'desc')
        });
      })
    );
  }

  handlePage(event: PageEvent): PageEvent {
    this.reload.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      sortField: this.listOptions.sortField,
      desc: this.listOptions.desc
    });
    return event;
  }

  toggleDetails(wallet: WalletItem): void {
    if (this.isSelectedWallet(wallet.address)) {
      this.selectedWallet = null;
    } else {
      this.selectedWallet = wallet;
    }
    this.select.emit(this.selectedWallet);
  }

  getDetailsIcon(walletAddress: string): string {
    return (this.isSelectedWallet(walletAddress)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(walletAddress: string): string {
    return (this.isSelectedWallet(walletAddress)) ? 'Hide details' : 'Wallet details';
  }

  showCustodyProvider(url: string): void {
    window.open(url, '_blank');
  }

  private isSelectedWallet(walletAddress: string): boolean {
    return !!this.selectedWallet && this.selectedWallet.address === walletAddress;
  }
}
