import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { FiatWalletItem } from '../../../model/wallet.model';
import { ListRequestFilter } from 'src/app/model/filter.model';

@Component({
  selector: 'app-fiat-wallet-list',
  templateUrl: 'fiat-wallet-list.component.html',
  styleUrls: ['fiat-wallet-list.component.scss']
})
export class FiatWalletListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() permission = 0;
  @Input() listOptions: ListRequestFilter = {
    pageIndex: 0,
    pageSize: 25,
    sortField: 'created',
    desc: true
  };
  @Input() wallets: FiatWalletItem[] = [];
  @Input() walletCount = 0;
  @Output() reload = new EventEmitter<ListRequestFilter>();
  @Output() select = new EventEmitter<FiatWalletItem | null>();
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  selectedWallet: FiatWalletItem | null = null;
  displayedColumns: string[] = [
    'details', 'userId', 'balance', 'asset', 'created'
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

  toggleDetails(wallet: FiatWalletItem): void {
    if (this.isSelectedWallet(wallet.id)) {
      this.selectedWallet = null;
    } else {
      this.selectedWallet = wallet;
    }
    this.select.emit(this.selectedWallet);
  }

  getDetailsIcon(walletId: string): string {
    return (this.isSelectedWallet(walletId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(walletId: string): string {
    return (this.isSelectedWallet(walletId)) ? 'Hide details' : 'Wallet details';
  }

  private isSelectedWallet(walletId: string): boolean {
    return !!this.selectedWallet && this.selectedWallet.id === walletId;
  }
}
