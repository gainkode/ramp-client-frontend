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
import { SettingsCurrencyWithDefaults, User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: 'customer-list.component.html',
  styleUrls: ['customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];

  private pEditMode = false;
  private subscriptions: Subscription = new Subscription();

  selectedCustomer: UserItem | undefined = undefined;
  customers: UserItem[] = [];
  customerCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'lastName';
  sortedDesc = true;
  filter = new Filter({});
  currencyList: CurrencyView[] = [];

  displayedColumns: string[] = [
    'details', 'id', 'created', 'type', 'email', 'firstName', 'lastName', 'country', 'mode', 'kycStatus'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;

  constructor(
    private errorHandler: ErrorService,
    private layoutService: LayoutService,
    private auth: AuthService,
    private commonService: CommonDataService,
    private adminService: AdminDataService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedCustomer = undefined;
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

  private setEditMode(mode: boolean): void {
    this.pEditMode = mode;
    this.changeEditMode.emit(mode);
  }

  private loadCustomers(): void {
    this.listSubscription.unsubscribe();
    this.listSubscription = this.adminService.getUsers(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    ).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.customers = result.list;
      this.customerCount = result.count;
    });
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

  onDeleteCustomer(id: string): void {
    const requestData = this.adminService.deleteCustomer(id);
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.showEditor(null, false);
        this.loadCustomers();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onSaveCustomer(customer: User): void {
    const requestData = this.adminService.saveCustomer(customer);
    if (requestData) {
      requestData.subscribe(({ data }) => {
        this.showEditor(null, false);
        if (this.auth.user?.userId === customer.userId) {
          this.auth.setUserName(customer.firstName ?? '', customer.lastName ?? '');
          this.auth.setUserCurrencies(
            customer.defaultCryptoCurrency ?? 'BTC',
            customer.defaultFiatCurrency ?? 'EUR');
        }
        this.loadCustomers();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      });
    }
  }
}
