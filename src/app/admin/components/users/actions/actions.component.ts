import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { UserActionItem } from 'model/user.model';
import { UserAction, UserActionResult, UserActionType, UserRoleObjectCode } from 'model/generated-models';

@Component({
	selector: 'app-admin-user-actions',
	templateUrl: 'actions.component.html',
	styleUrls: ['actions.component.scss']
})
export class AdminUserActionsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
  	'createdDateAction',
  	'userActionType',
  	'user',
  ];
  displayedColumns: string[] = [
  	'details',
  	'date',
  	'userId',
  	'actionType',
  	'result',
  	'status',
  ];
  inProgress = false;
  permission = 0;
  selectedAction?: UserActionItem;
  actionCount = 0;
  actions: UserActionItem[] = [];
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'date';
  sortedDesc = true;
  filter = new Filter({});
  adminAdditionalSettings: Record<string, any> = {};

  private subscriptions: Subscription = new Subscription();

  constructor(
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService,
  	private router: Router
  ) {
  	this.permission = this.auth.isPermittedObjectCode(UserRoleObjectCode.SystemUsers);
  }

  ngOnInit(): void {
  	this.loadCommonSettings();
  	this.loadUserActions();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
  	this.subscriptions.add(
  		this.sort.sortChange.subscribe(() => {
  			this.sortedDesc = (this.sort.direction === 'desc');
  			this.sortedField = this.sort.active;
  			this.loadUserActions();
  		})
  	);
  }

  handleFilterApplied(filter: Filter): void {
  	this.filter = filter;
  	this.loadUserActions();
  }

  handlePage(index: number): void {
  	this.pageIndex = index - 1;
  	this.loadUserActions();
  }

  showDetails(notification: UserActionItem, content: any): void {
  	this.selectedAction = notification;
  	this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  }

  private loadCommonSettings(): void {
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if(settingsCommon){
  		this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
  		if(this.adminAdditionalSettings?.tabs?.actions?.filterFields){
  			this.filterFields = this.adminAdditionalSettings.tabs.actions.filterFields;
  		}
  	}
  }

  private loadUserActions(): void {
  	this.inProgress = true;
  	const listData$ = this.adminService.getUserActions(
  		this.pageIndex,
  		this.pageSize,
  		this.sortedField,
  		this.sortedDesc,
  		this.filter).pipe(take(1));
  	this.subscriptions.add(
  		listData$.subscribe(({ list, count }) => {
  			this.actions = list;
  			this.actionCount = count;
  			this.inProgress = false;
  		}, (error) => {
  			this.inProgress = false;
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}

  			this.actions = [
  				new UserActionItem({
  					userActionId: 'user_action_id_1',
  					userId: 'user_id_1',
  					objectId: 'object_id_1',
  					actionType: UserActionType.CreateUser,
  					linkedIds: [
  						'linked_id_15', 'linked_id_23', 'linked_id_48'
  					],
  					info: 'Action info',
  					result: UserActionResult.Succeeded,
  					status: 'User status 1',
  					date: new Date()
  				} as UserAction),
  				new UserActionItem({
  					userActionId: 'user_action_id_2',
  					userId: 'user_id_1',
  					objectId: 'object_id_2',
  					actionType: UserActionType.AddBlackCountry,
  					linkedIds: [
  						'linked_id_7', 'linked_id_86', 'linked_id_113'
  					],
  					info: 'Action info',
  					result: UserActionResult.Failed,
  					status: 'User status 2',
  					date: new Date()
  				} as UserAction)
  			];
  		})
  	);
  }
}
