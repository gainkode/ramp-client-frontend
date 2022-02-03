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
  templateUrl: 'customer-list.component.html',
  styleUrls: ['customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit {
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

  selectedCustomer: UserItem | undefined = undefined;
  roleIds: string[] = [];
  customers: UserItem[] = [];
  customerCount = 0;
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
      this.selectedCustomer = undefined;
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
      this.loadCustomers();
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
    this.roleIds = [];
    const currencyData = this.commonService.getRoles();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const roleData = data.getRoles as UserRole[];
          const userRole = roleData.find(x => x.code === 'USER');
          if (userRole) {
            this.roleIds = [userRole.userRoleId ?? ''];
          } else {
            this.roleIds = [];
          }
          this.loadCustomers();
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
    this.loadCustomers();
  }

  handleDetailsPanelClosed(): void {
    this.selectedCustomer = undefined;
  }

  onCustomerSelected(item: UserItem): void {
    item.selected = !item.selected;
    this.selected = this.customers.some(x => x.selected === true);
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
          const ids = this.customers.filter(x => x.selected === true).map(val => val.id);
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

  private loadCustomers(): void {
    const listData$ = this.adminService.getUsers(
      this.roleIds,
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(result => {
        this.customers = result.list;
        this.customerCount = result.count;
      })
    );
  }

  private isSelectedCustomer(customerId: string): boolean {
    return !!this.selectedCustomer && this.selectedCustomer.id === customerId;
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCustomers();
    return event;
  }

  private showEditor(customer: UserItem | null, visible: boolean): void {
    if (visible) {
      this.selectedCustomer = customer ?? new UserItem(null);
    } else {
      this.selectedCustomer = undefined;
      this.setEditMode(false);
    }
  }

  toggleDetails(customer: UserItem): void {
    if (this.isSelectedCustomer(customer.id)) {
      this.selectedCustomer = undefined;
    } else {
      this.selectedCustomer = customer;
    }
  }

  getDetailsIcon(customerId: string): string {
    return (this.isSelectedCustomer(customerId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(customerId: string): string {
    return (this.isSelectedCustomer(customerId)) ? 'Hide details' : 'Customer details';
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
    this.loadCustomers();
  }

  export(): void {
    const exportData$ = this.adminService.exportUsersToCsv();
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.dialog.open(CommonDialogBox, {
          width: '400px',
          data: {
            title: 'Export',
            message: 'Exported list of customers has been sent to your email.'
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
