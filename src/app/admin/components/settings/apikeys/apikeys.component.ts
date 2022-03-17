import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminDataService } from '../../../services/admin-data.service';
import { TransactionItemFull } from '../../../../model/transaction.model';
import { Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeyItem } from 'src/app/model/apikey.model';

@Component({
  templateUrl: 'apikeys.component.html',
  styleUrls: ['apikeys.component.scss'],
  selector: 'app-api-keys-table'
})
export class ApiKeysComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() permission = 0;
  @Input() apiKeys: ApiKeyItem[] = [];
  @ViewChild(MatSort) sort!: MatSort;

  keyCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  
  private subscriptions: Subscription = new Subscription();

  displayedColumns: string[] = [
    //'disabled',
    'title'//, 'user', 'created', 'delete'
  ];

  constructor(
    public dialog: MatDialog,
    private adminService: AdminDataService) {
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        //this.loadList();
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    //this.loadList();
    return event;
  }

  toggleDetails(transaction: TransactionItemFull): void {
    
  }

  getDetailsIcon(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'Hide details' : 'Transaction details';
  }

  handleDetailsPanelClosed(): void {
    
  }

  onTransactionSelected(item: TransactionItemFull): void {
    
  }

  addKey(): void {
    
  }

  deleteKey(key: ApiKeyItem): void {
    
  }
  
  private isSelectedTransaction(transactionId: string): boolean {
    return true;
  }

  onSaveTransaction(): void {
    
  }

  onCancelEdit(): void {
    
  }
}
