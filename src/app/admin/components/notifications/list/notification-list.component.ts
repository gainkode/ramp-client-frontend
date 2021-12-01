import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { NotificationItem } from '../../../../model/notification.model';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';

@Component({
  templateUrl: 'notification-list.component.html',
  styleUrls: ['notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];

  selectedItem?: NotificationItem;
  data: NotificationItem[] = [];
  customerCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});

  displayedColumns: string[] = [
    'created',
    'viewed',
    'title',
    'linkedId',
    'linkedTable',
    'params',
    'userId',
    'userNotificationId',
    'userNotificationLevel',
    'userNotificationTypeCode',
    'text'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;


  constructor(
    private adminDataService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadData();
    });
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadData();
  }


  handleDetailsPanelClosed(): void {
    this.selectedItem = undefined;
  }

  private loadData(): void {
    this.listSubscription.unsubscribe();

    this.listSubscription = this.adminDataService.getNotifications(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    )
                                .pipe(
                                  takeUntil(this.destroy$)
                                )
                                .subscribe(result => {
                                  console.log(result.list);
                                  this.data = result.list;
                                  this.customerCount = result.count;
                                });
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
    return event;
  }
}
