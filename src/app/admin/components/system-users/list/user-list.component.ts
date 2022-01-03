import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminDataService } from '../../../services/admin-data.service';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { UserItem } from 'src/app/model/user.model';
import { Filter } from '../../../model/filter.model';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../services/layout.service';
import { ErrorService } from 'src/app/services/error.service';
import { CurrencyView } from 'src/app/model/payment.model';
import { CommonDataService } from 'src/app/services/common-data.service';
import { SettingsCurrencyWithDefaults, User, UserNotificationLevel } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { SendNotificationDialogBox } from 'src/app/components/dialogs/send-notification-box.dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';

@Component({
  templateUrl: 'user-list.component.html',
  styleUrls: ['user-list.component.scss']
})
export class SystemUserListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];

  private subscriptions: Subscription = new Subscription();

  selectedUser: UserItem | undefined = undefined;
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
    'details', 'id', 'firstName', 'lastName', 'email', 'kycStatus', 'created', 'country', 'phone'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;

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
    this.subscriptions.unsubscribe();
    this.destroy$.next();
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
  }

  onUserSelected(item: UserItem): void {
    item.selected = !item.selected;
    this.selected = this.users.some(x => x.selected === true);
  }

  showTransactions(id: string): void {
    this.router.navigateByUrl(`/admin/transactions/users/${id}`);
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
    const requestData = this.adminService.sendAdminNotification(ids, level, title, text);
    if (requestData) {
      requestData.subscribe(({ data }) => {
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  private setEditMode(mode: boolean): void {
    this.changeEditMode.emit(mode);
  }

  private loadUsers(): void {
    this.listSubscription.unsubscribe();
    this.listSubscription = this.adminService.getUsers(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    ).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.users = result.list;
      this.userCount = result.count;
    });
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

  onDeleteUser(id: string): void {
    const requestData = this.adminService.deleteCustomer(id);
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.showEditor(null, false);
        this.loadUsers();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onSaveUser(user: User): void {
    const requestData = this.adminService.saveCustomer(user);
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.showEditor(null, false);
        if (this.auth.user?.userId === user.userId) {
          this.auth.setUserName(user.firstName ?? '', user.lastName ?? '');
          this.auth.setUserCurrencies(
            user.defaultCryptoCurrency ?? 'BTC',
            user.defaultFiatCurrency ?? 'EUR');
        }
        this.loadUsers();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }
}
