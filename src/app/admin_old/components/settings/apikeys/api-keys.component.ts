import { Component, Output, EventEmitter, Input, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { ApiKeyItem } from 'src/app/model/apikey.model';
import { ListRequestFilter } from 'src/app/model/filter.model';

@Component({
  templateUrl: 'api-keys.component.html',
  styleUrls: ['api-keys.component.scss'],
  selector: 'app-apikey-table'
})
export class ApiKeyListComponent implements OnDestroy, AfterViewInit {
  @Input() permission = 0;
  @Input() filter: ListRequestFilter = {
    pageIndex: 0,
    pageSize: 0,
    sortField: '',
    desc: false
  };
  @Input() apiKeys: ApiKeyItem[] = [];
  @Input() keyCount = 0;
  @Output() onDelete = new EventEmitter<ApiKeyItem>();
  @Output() onUpdate = new EventEmitter<ListRequestFilter>();
  @ViewChild(MatSort) sort!: MatSort;

  accounts: ApiKeyItem[] = [{
    title: 'name',
    created: 'created'
  } as ApiKeyItem];

  displayedColumns: string[] = [
    'lock', 'title', 'user', 'created', 'delete'
  ];

  private subscriptions: Subscription = new Subscription();

  constructor() {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.onUpdate.emit({
          pageIndex: this.filter.pageIndex,
          pageSize: this.filter.pageSize,
          sortField: this.sort.active,
          desc: (this.sort.direction === 'desc')
        });
      })
    );
  }

  deleteKey(key: ApiKeyItem): void {
    this.onDelete.emit(key);
  }

  handlePage(event: PageEvent): PageEvent {
    this.onUpdate.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      sortField: this.filter.sortField,
      desc: this.filter.desc
    });
    return event;
  }
}
