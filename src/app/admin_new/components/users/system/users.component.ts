import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { UserRole } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { UserMessageData } from '../send-message/send-message.component';

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

  roleUserForm = this.formBuilder.group({
    user: [undefined, { validators: [Validators.required], updateOn: 'change' }]
  });

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;
  private rolesDialog: NgbModalRef | undefined = undefined;
  private messageDialog: NgbModalRef | undefined = undefined;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private commonService: CommonDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('SYSTEM_USERS');
  }

  ngOnInit(): void {
    this.loadRoleData();
    this.initUserSearch();
    this.subscriptions.add(
      this.roleUserForm.controls.user.valueChanges.subscribe(val => {
        this.roleUser = val;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
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
    this.selected = this.users.some(x => x.selected === true);
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
    this.rolesDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  addUser(content: any): void {
    this.userDetailsTitle = 'Create a new User';
    this.selectedUser = undefined;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  private loadRoleData(): void {
    this.roleIds = [];
    const currencyData = this.commonService.getRoles();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          this.userRoles = data.getRoles as UserRole[];
          const filteredRoles = this.userRoles.filter(x => x.code !== 'USER');
          if (filteredRoles) {
            this.roleIds = filteredRoles.map(val => val.userRoleId ?? '');
          } else {
            this.roleIds = [];
          }
          this.loadUsers();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
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
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.users = list;
        this.userCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private initUserSearch() {
    this.usersOptions$ = concat(
      of([]),
      this.usersSearchInput$.pipe(
        filter(res => {
          return res !== null && res.length >= this.minUsersLengthTerm
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
          requestData$.subscribe(({ data }) => {
            if (removed.length > 0) {
              this.removeUserRole(this.roleUser?.id ?? '', removed);
            } else {
              this.roleInProgress = false;
              this.rolesDialog?.close('OK');
              this.loadUsers();
            }
          }, (error) => {
            this.roleInProgress = false;
            this.errorMessage = error;
            if (this.auth.token === '') {
              this.router.navigateByUrl('/');
            }
          })
        );
      } else {
        this.removeUserRole(this.roleUser.id, removed);
      }
    }
  }

  private removeUserRole(userId: string, roles: string[]): void {
    this.roleInProgress = true;
    const requestData$ = this.adminService.removeRole(userId, roles);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.roleInProgress = false;
        this.rolesDialog?.close('OK');
        this.loadUsers();
      }, (error) => {
        this.roleInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSaveUser(): void {
    this.selectedUser = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadUsers();
    }
  }

  sendMessage(content: any): void {
    this.messageDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  sendMessageStart(data: UserMessageData): void {
    this.sendMessageInProgress = true;
    this.sendMessageError = '';
    const ids = this.users.filter(x => x.selected === true).map(val => val.id);
    const requestData$ = this.adminService.sendAdminNotification(ids, data.level, data.title, data.text);
    this.subscriptions.add(
      requestData$.subscribe(({ result }) => {
        this.sendMessageInProgress = false;
        this.selected = false;
        this.users.forEach(x => x.selected = false);
        if (this.messageDialog) {
          this.messageDialog.close();
        }
      }, (error) => {
        this.sendMessageInProgress = false;
        this.sendMessageError = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  export(content: any): void {
    const ids = this.users.filter(x => x.selected === true).map(val => val.id);
    const exportData$ = this.adminService.exportUsersToCsv(
      ids,
      this.roleIds,
      this.sortedField,
      this.sortedDesc,
      this.filter);
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  showDetails(user: UserItem, content: any) {
    this.userDetailsTitle = 'User Details';
    this.selectedUser = user;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  confirmEmail(user: UserItem, content: any) {
    this.errorMessage = '';
    const requestData$ = this.adminService.confirmEmail(user.id);
    this.subscriptions.add(
      requestData$.subscribe(({ result }) => {
        this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }, (error) => {
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  showWhiteList(userId: string): void {
    this.router.navigateByUrl(`/admin/white-device-list/${userId}`);
  }
}
