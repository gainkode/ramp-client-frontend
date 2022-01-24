import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { NotificationItem } from '../../../../model/notification.model';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

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
  messageCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});

  displayedColumns: string[] = [
    'details',
    'created',
    'viewed',
    'user',
    'title',
    'code',
    'userNotificationLevel',
    'text'
  ];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();


  constructor(
    private layoutService: LayoutService,
    private router: Router,
    private auth: AuthService,
    private adminDataService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedItem = undefined;
    });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
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

  getDetailsIcon(customerId: string): string {
    return (this.isSelectedMessage(customerId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(customerId: string): string {
    return (this.isSelectedMessage(customerId)) ? 'Hide details' : 'Customer details';
  }

  toggleDetails(message: NotificationItem): void {
    if (this.isSelectedMessage(message.id)) {
      this.selectedItem = undefined;
    } else {
      this.selectedItem = message;
    }
  }

  private loadData(): void {
    const listData$ = this.adminDataService.getNotifications(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    ).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(result => {
        this.data = result.list;
        this.messageCount = result.count;
      })
    );
  }

  private isSelectedMessage(messageId: string): boolean {
    return !!this.selectedItem && this.selectedItem.id === messageId;
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
    return event;
  }

  onMessageResend(msgId: string): void {
    const requestData$ = this.adminDataService.resendAdminNotification(msgId);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.selectedItem = undefined;
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
