import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Filter } from 'admin/model/filter.model';
import { UserRoleObjectCode } from 'model/generated-models';
import { NotificationItem } from 'model/notification.model';
import { of, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-notifications',
	templateUrl: 'notifications.component.html',
	styleUrls: ['notifications.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
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
  	'text',
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
  
  private destroy$ = new Subject<void>();

  constructor(
		private readonly cdr: ChangeDetectorRef,
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService,
  	private router: Router,
  	private route: ActivatedRoute
  ) {
  	this.permission = this.auth.isPermittedObjectCode(UserRoleObjectCode.Notifications);

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
		this.destroy$.next();
		this.destroy$.complete();
  }

  ngAfterViewInit(): void {
		this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.sortedDesc = (this.sort.direction === 'desc');
			this.sortedField = this.sort.active;
			this.loadNotifications();
		});
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

		this.adminService.getNotifications(
			this.pageIndex,
			this.pageSize,
			this.sortedField,
			this.sortedDesc,
			this.filter
		).pipe(
			takeUntil(this.destroy$),
			switchMap(data => {
				this.messages = data.list;
				this.messageCount = data.count;
				return of(data);
			}),
			finalize(() => {
				this.inProgress = false;
				this.cdr.detectChanges();
			})
		).subscribe({
			error: () => {
				if (this.auth.token === '') {
					void this.router.navigateByUrl('/');
				}
			}
		});
	}
}
