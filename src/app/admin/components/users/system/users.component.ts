import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { AdminDataService } from 'services/admin-data.service';
import { UserRole, UserRoleObjectCode } from 'model/generated-models';
import { UserItem } from 'model/user.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { UserMessageData } from '../send-message/send-message.component';

const USER_ROLE_ID = '30cebffa-7e64-4be3-96d8-a96626bb81c6';

@Component({
	selector: 'app-admin-system-users',
	templateUrl: 'users.component.html',
	styleUrls: ['users.component.scss']
})
export class AdminSystemUsersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
  	'users',
  	'accountType',
  	'accountStatus',
  	'country',
  	'registrationDate',
  	'search'
  ];
  displayedColumns: string[] = [
  	'details',
  	'referralCode',
  	'firstName',
  	'lastName',
  	'email',
  	'role',
  	'accountStatus',
  	'lastLogin',
  	'created'
  ];
  sendMessageInProgress = false;
  sendMessageError = '';
  inProgress = false;
  roleInProgress = false;
  errorMessage = '';
  permission = 0;
  selectedUser?: UserItem;
  userDetailsTitle = 'User Details';
  roleUser?: UserItem;
  roleUserSelected = false;
  roleIds: string[] = [];
  newRoleIds: string[] = [];
  userRoles: UserRole[] = [];
  selected = false;
  users: UserItem[] = [];
  userCount = 0;
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  isUsersLoading = false;
  usersSearchInput$ = new Subject<string>();
  usersOptions$: Observable<UserItem[]> = of([]);
  minUsersLengthTerm = 1;
  adminAdditionalSettings: Record<string, any> = {};

  roleUserForm = this.formBuilder.group({
  	user: [undefined, { validators: [Validators.required], updateOn: 'change' }]
  });

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;
  private rolesDialog: NgbModalRef | undefined = undefined;
  private messageDialog: NgbModalRef | undefined = undefined;

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService,
  	private commonService: CommonDataService,
  	private router: Router
  ) {
  	this.permission = this.auth.isPermittedObjectCode(UserRoleObjectCode.SystemUsers);
  }
  ngOnInit(): void {
  	this.loadCommonSettings();
  	this.loadRoleData();
  	this.initUserSearch();
  	this.subscriptions.add(
  		this.roleUserForm.controls.user.valueChanges.subscribe(val => this.roleUser = val)
  	);
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
  	this.subscriptions.add(
  		this.sort.sortChange.subscribe(() => {
  			this.sortedDesc = (this.sort.direction === 'desc');
  			this.sortedField = this.sort.active;
  			this.loadUsers();
  		})
  	);
  }

  onUserSelected(item: UserItem): void {
  	item.selected = !item.selected;
  	this.selected = this.users.some(x => x.selected);
  }

  handleFilterApplied(filter: Filter): void {
  	this.filter = filter;
  	this.loadUsers();
  }

  handlePage(index: number): void {
  	this.pageIndex = index - 1;
  	this.loadUsers();
  }

  setUserRole(item: UserItem | undefined, content: any): void {
  	this.roleUserForm.reset();
  	this.roleUser = item;
  	this.roleUserSelected = (item !== undefined);
  	this.rolesDialog = this.openModalDialog(content);
  }

  addUser(content: any): void {
  	this.userDetailsTitle = 'Create a new User';
  	this.selectedUser = undefined;
  	this.detailsDialog = this.openModalDialog(content);
  }

  selectAll(): void {
  	this.users.forEach(x => x.selected = true);
  	this.selected = (this.users.length > 0);
  }
  private loadCommonSettings(): void{
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if(settingsCommon){
  		this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
  		if(this.adminAdditionalSettings?.tabs?.systemCustomers?.filterFields){
  			this.filterFields = this.adminAdditionalSettings.tabs.systemCustomers.filterFields;
  		}
  	}
  }
  private loadRoleData(): void {
  	this.roleIds = [];
  	const currencyData = this.commonService.getRoles();
		
  	if (currencyData) {
  		this.subscriptions.add(
  			currencyData.valueChanges.subscribe({
  				next: ({ data }) => {
  					this.userRoles = data.getRoles as UserRole[];
  					const filteredRoles = this.userRoles;
  					this.roleIds = filteredRoles ? filteredRoles.map(val => val.userRoleId ?? '') : [];
  					this.roleIds = [... this.roleIds.filter(r => r !== USER_ROLE_ID)];
  					this.loadUsers();
  				},
  				error: () => {
  					this.inProgress = false;
  					this.nagivateToHome();
  				}
  			}));
  	}
  }

  private loadUsers(): void {
  	this.inProgress = true;
  	const listData$ = this.adminService.getSystemUsers(
  		this.roleIds,
  		this.pageIndex,
  		this.pageSize,
  		this.sortedField,
  		this.sortedDesc,
  		this.filter).pipe(take(1));
  	this.selected = false;

  	this.subscriptions.add(
  		listData$.pipe(finalize(() => this.inProgress = false))
  			.subscribe({
  				next: ({ list, count }) => {
  					this.users = list;
  					this.userCount = count;
  				},
  				error: () => {
  					this.nagivateToHome();
  				}
  			}));
  }

  private initUserSearch(): void {
  	this.usersOptions$ = concat(
  		of([]),
  		this.usersSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minUsersLengthTerm;
  			}),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => {
  				this.isUsersLoading = true;
  			}),
  			switchMap(searchString => {
  				this.isUsersLoading = false;
  				return this.adminService.findUsers(new Filter({ search: searchString }))
  					.pipe(map(result => result.list));
  			})
  		));
  }

  private getAssignedRoles(current: string[], state: string[]): string[] {
  	let result: string[] = [];
  	current.forEach(x => {
  		if (!state.includes(x)) {
  			result = [...result, x];
  		}
  	});
  	return result;
  }

  private getRemovedRoles(current: string[], state: string[]): string[] {
  	let result: string[] = [];
  	state.forEach(x => {
  		if (!current.includes(x)) {
  			result = [...result, x];
  		}
  	});
  	return result;
  }

  onRolesUpdated(roles: string[]): void {
  	if (this.roleUser) {
  		this.newRoleIds = roles;
  	}
  }

  updateRole(): void {
  	if (this.roleUser) {
  		this.errorMessage = '';
  		const assigned = this.getAssignedRoles(this.newRoleIds, this.roleUser.roles);
  		const removed = this.getRemovedRoles(this.newRoleIds, this.roleUser.roles);
  		if (assigned.length > 0) {
  			this.roleInProgress = true;
  			const requestData$ = this.adminService.assignRole(this.roleUser.id, assigned);

  			this.subscriptions.add(
  				requestData$.pipe()
  					.subscribe({
  						next: () => {
  							if (removed.length > 0) {
  								this.removeUserRole(this.roleUser?.id ?? '', removed);
  							} else {
  								this.roleInProgress = false;
  								this.rolesDialog?.close('OK');
  								this.loadUsers();
  							}
  						},
  						error: (error) => {
  							this.roleInProgress = false;
  							this.sendMessageError = error;
  							this.nagivateToHome();
  						}
  					}));

  		} else {
  			this.removeUserRole(this.roleUser.id, removed);
  		}
  	}
  }

  private removeUserRole(userId: string, roles: string[]): void {
  	this.roleInProgress = true;
  	const requestData$ = this.adminService.removeRole(userId, roles);
	  this.subscriptions.add(
  		requestData$.pipe(finalize(() => this.roleInProgress = false))
  			.subscribe({
  				next: () => {
  					this.rolesDialog?.close('OK');
  					this.loadUsers();
  				},
  				error: (error) => {
  					this.sendMessageError = error;
  					this.nagivateToHome();
  				}
  			}));
  }

  onSaveUser(): void {
  	this.selectedUser = undefined;
  	if (this.detailsDialog) {
  		this.detailsDialog.close();
  		this.loadUsers();
  	}
  }

  sendMessage(content: any): void {
  	this.messageDialog = this.openModalDialog(content);
  }

  sendMessageStart(data: UserMessageData): void {
  	this.sendMessageInProgress = true;
  	this.sendMessageError = '';

  	const requestData$ = this.adminService.sendAdminNotification(data.users, data.level, data.title, data.text);

	  this.subscriptions.add(
  		requestData$.pipe(finalize(() => this.sendMessageInProgress = false))
  			.subscribe({
  				next: () => {
  					this.selected = false;
  					this.users.forEach(x => x.selected = false);
  					if (this.messageDialog) {
  						this.messageDialog.close();
  					}
  				},
  				error: (error) => {
  					this.sendMessageError = error;
  					this.nagivateToHome();
  				}
  			}));
  }

  export(content: any): void {
  	const ids = this.users.filter(x => x.selected).map(val => val.id);
  	const exportData$ = this.adminService.exportUsersToCsv(
  		ids,
  		this.roleIds,
  		this.sortedField,
  		this.sortedDesc,
  		this.filter);

	  	this.subscriptions.add(
  		exportData$.pipe()
  			.subscribe({
  				next: () => this.openModalDialog(content),
  				error: () => this.nagivateToHome()
  			}));
  }

  showDetails(user: UserItem, content: any): void {
  	this.userDetailsTitle = 'User Details';
  	this.selectedUser = user;
  	this.detailsDialog = this.openModalDialog(content);
  }

  confirmEmail(user: UserItem, content: any): void {
  	this.errorMessage = '';
  	const requestData$ = this.adminService.confirmEmail(user.id);
  	this.subscriptions.add(
  		requestData$.pipe()
  			.subscribe({
  				next: () => this.openModalDialog(content),
  				error: (error) => {
  					this.errorMessage = error;
  					this.nagivateToHome();
  				} 
  			}));
  }

  showWhiteList(userId: string): void {
  	void this.router.navigateByUrl(`/admin/white-device-list/${userId}`);
  }

  private openModalDialog(content: any): NgbModalRef {
  	return this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  }

  private nagivateToHome(): void {
  	if (this.auth.token === '') {
  		void this.router.navigateByUrl('/');
  	}
  }
}
