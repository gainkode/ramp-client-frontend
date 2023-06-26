import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
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
  isFilterCollapsed = true;
  filter: Filter | undefined = undefined;
  adminAdditionalSettings: Record<string, any> = {};
  
  private subscriptions: Subscription = new Subscription();

  constructor(
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService,
  	private router: Router,
  	private route: ActivatedRoute
  ) {
  	this.permission = this.auth.isPermittedObjectCode('NOTIFICATIONS');

  	this.route.queryParams
  		.subscribe(params => {
  			if (!!params.userId) {
  				this.filter = { search: params.userId } as Filter;
  				this.isFilterCollapsed = false;
  			} else {
  				this.filter = new Filter({});
  			}
  		});
  }

  ngOnInit(): void {
  	this.loadCommonSettings();
  	this.loadNotifications();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
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

  showDetails(notification: NotificationItem, content: any): void {
  	this.selectedMessage = notification;
  	
  	this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  }
  private loadCommonSettings(): void {
  	const settingsCommon = this.auth.getLocalSettingsCommon();
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
  		listData$.pipe(finalize(() => this.inProgress = false))
  			.subscribe({
  				next: ({ list, count }) => {
  					this.messages = list;
  					this.messageCount = count;
  				},
  				error: () => {
  					if (this.auth.token === '') {
  						void this.router.navigateByUrl('/');
  					}
  				}
  			}));
  }
}
