import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { AdminDataService } from 'services/admin-data.service';
import { NotificationItem } from 'model/notification.model';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'app-admin-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['notifications.component.scss']
})
export class AdminNotificationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search',
    'notificationType'
  ];
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
  inProgress = false;
  permission = 0;
  selectedMessage?: NotificationItem;
  messageCount = 0;
  messages: NotificationItem[] = [];
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
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('NOTIFICATIONS');
  }

  ngOnInit(): void {
    this.loadCommonSettings();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadNotifications();
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadNotifications();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadNotifications();
  }

  showDetails(notification: NotificationItem, content: any) {
    this.selectedMessage = notification;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }
  private loadCommonSettings(){
    let settingsCommon = this.auth.getLocalSettingsCommon();
    if(settingsCommon){
      this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
      if(this.adminAdditionalSettings?.tabs?.notification?.filterFields){
        this.filterFields = this.adminAdditionalSettings.tabs.notification.filterFields;
      }
    }
  }
  private loadNotifications(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getNotifications(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.messages = list;
        this.messageCount = count;
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
