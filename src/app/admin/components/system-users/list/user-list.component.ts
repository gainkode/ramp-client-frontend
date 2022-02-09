import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminDataService } from '../../../services/admin-data.service';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { UserItem } from 'src/app/model/user.model';
import { Filter } from '../../../model/filter.model';
import { take, takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../services/layout.service';
import { ErrorService } from 'src/app/services/error.service';
import { CurrencyView } from 'src/app/model/payment.model';
import { CommonDataService } from 'src/app/services/common-data.service';
import { SettingsCurrencyWithDefaults, UserNotificationLevel, UserRole } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { SendNotificationDialogBox } from 'src/app/components/dialogs/send-notification-box.dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';

@Component({
  templateUrl: 'user-list.component.html',
  styleUrls: ['user-list.component.scss']
})
export class SystemUserListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'users',
    'accountType',
    'accountMode',
    'accountStatus',
    'userTierLevel',
    'riskLevel',
    'country',
    'kycStatus',
    'registrationDateStart',
    'registrationDateEnd',
    'widget',
    'totalBuyVolume',
    'transactionCount',
    'search'
  ];

  selectedUser: UserItem | undefined = undefined;
  setRoleFlag = false;
  roleIds: string[] = [];
  userRoles: UserRole[] = [];
  users: UserItem[] = [];
  userCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'lastName';
  sortedDesc = true;
  filter = new Filter({});
  currencyList: CurrencyView[] = [];
  selected = false;

  displayedColumns: string[] = [
    'details', 'referralCode', 'firstName', 'lastName', 'email', 'accountStatus', 'kycStatus',
    'widgetId', 'totalBought', 'totalSold', 'totalSent', 'totalReceived',
    'created', 'country', 'phone', 'risk', 'id'
  ];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private errorHandler: ErrorService,
    private layoutService: LayoutService,
    private auth: AuthService,
    private commonService: CommonDataService,
    private adminService: AdminDataService,
    private router: Router,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedUser = undefined;
    });

    this.loadCurrencyData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadUsers();
    });
  }

  private loadCurrencyData(): void {
    this.currencyList = [];
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
          if (currencySettings.settingsCurrency) {
            if (currencySettings.settingsCurrency.count ?? 0 > 0) {
              this.currencyList = currencySettings.settingsCurrency.list?.
                map((val) => new CurrencyView(val)) as CurrencyView[];
            }
          }
          this.loadRoleData();
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private loadRoleData(): void {
    this.userRoles = [];
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
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadUsers();
  }

  handleDetailsPanelClosed(): void {
    this.selectedUser = undefined;
    this.setRoleFlag = false;
  }

  onUserSelected(item: UserItem): void {
    item.selected = !item.selected;
    this.selected = this.users.some(x => x.selected === true);
  }

  showTransactions(id: string): void {
    this.router.navigateByUrl(`/admin/transactions/users/${id}`);
  }

  addUser(): void {
    this.toggleDetails({} as UserItem);
  }
  
  setRole(): void {
    this.setRoleFlag = true;
  }

  sendMessage(): void {
    const dialogRef = this.dialog.open(SendNotificationDialogBox, {
      width: '550px',
      data: {
        title: 'Send message to selected users',
        message: ''
      }
    });
    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const ids = this.users.filter(x => x.selected === true).map(val => val.id);
          const form = result as FormGroup;
          const msgLevel = form.get('level')?.value ?? UserNotificationLevel.Info;
          const msgTitle = form.get('title')?.value ?? '';
          const msgText = form.get('text')?.value ?? '';
          this.sendMessageData(ids, msgLevel, msgTitle, msgText);
        }
      })
    );
  }

  sendMessageData(ids: string[], level: UserNotificationLevel, title: string, text: string) {
    const requestData$ = this.adminService.sendAdminNotification(ids, level, title, text);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private setEditMode(mode: boolean): void {
    this.changeEditMode.emit(mode);
  }

  private loadUsers(): void {
    const listData$ = this.adminService.getUsers(
      this.roleIds,
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(result => {
        this.users = result.list;
        this.userCount = result.count;
      })
    );
  }

  private isSelectedUser(userId: string): boolean {
    return !!this.selectedUser && this.selectedUser.id === userId;
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadUsers();
    return event;
  }

  private showEditor(user: UserItem | null, visible: boolean): void {
    if (visible) {
      this.selectedUser = user ?? new UserItem(null);
    } else {
      this.setRoleFlag = false;
      this.selectedUser = undefined;
      this.setEditMode(false);
    }
  }

  toggleDetails(user: UserItem): void {
    if (this.isSelectedUser(user.id)) {
      this.selectedUser = undefined;
    } else {
      this.selectedUser = user;
    }
  }

  getDetailsIcon(userId: string): string {
    return (this.isSelectedUser(userId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(userId: string): string {
    return (this.isSelectedUser(userId)) ? 'Hide details' : 'User details';
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.showEditor(null, false);
    this.setEditMode(false);
  }

  onSave(): void {
    this.showEditor(null, false);
    this.loadUsers();
  }

  export(): void {
    const ids = this.users.filter(x => x.selected === true).map(val => val.id);
    const exportData$ = this.adminService.exportUsersToCsv(ids);
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.dialog.open(CommonDialogBox, {
          width: '400px',
          data: {
            title: 'Export',
            message: 'Exported list of users has been sent to your email.'
          }
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
