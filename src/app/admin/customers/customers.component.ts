import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { UserListResult } from '../../model/generated-models';
import { Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { UserItem } from 'src/app/model/user.model';

@Component({
  templateUrl: 'customers.component.html',
  styleUrls: ['../admin.scss', 'customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeEditMode = new EventEmitter<boolean>();
  @ViewChild(MatSort) sort!: MatSort;
  private pShowDetails = false;
  private pCustomerSubscription!: any;
  inProgress = false;
  errorMessage = '';
  selectedCustomer: UserItem | null = null;
  customers: UserItem[] = [];
  customerCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'lastName';
  sortedDesc = true;

  displayedColumns: string[] = [
    'id', 'created', 'type', 'email', 'firstName', 'lastName', 'country', 'mode', 'kycStatus', 'details'
  ];

  get showDetailed(): boolean {
    return this.pShowDetails;
  }

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    const s: Subscription = this.pCustomerSubscription;
    if (s !== undefined) {
      s.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadCustomers();
    });
  }

  private loadCustomers(): void {
    this.customerCount = 0;
    const customersData = this.adminService.getCustomers(this.pageIndex, this.pageSize, this.sortedField, this.sortedDesc);
    if (customersData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this.pCustomerSubscription = customersData.valueChanges.subscribe(({ data }) => {
        const dataList = data.getUsers as UserListResult;
        if (dataList !== null) {
          this.customerCount = dataList?.count as number;
          if (this.customerCount > 0) {
            this.customers = dataList?.list?.map((val) => new UserItem(val)) as UserItem[];
          }
        }
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load customers');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  private refresh(): void {
    const s: Subscription = this.pCustomerSubscription;
    if (s !== undefined) {
      s.unsubscribe();
    }
    this.loadCustomers();
  }

  private isSelectedCustomer(customerId: string): boolean {
    let selected = false;
    if (this.selectedCustomer !== null) {
      if (this.selectedCustomer.id === customerId) {
        selected = true;
      }
    }
    return selected;
  }

  private showEditor(customer: UserItem | null, visible: boolean): void {
    this.pShowDetails = visible;
    if (visible) {
      this.selectedCustomer = customer;
    } else {
      this.selectedCustomer = null;
    }
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.refresh();
    return event;
  }

  toggleDetails(customer: UserItem): void {
    let show = true;
    if (this.isSelectedCustomer(customer.id)) {
      show = false;
    }
    this.showEditor(customer, show);
  }

  getDetailsIcon(customerId: string): string {
    return (this.isSelectedCustomer(customerId)) ? 'clear' : 'description';
  }

  getDetailsTooltip(customerId: string): string {
    return (this.isSelectedCustomer(customerId)) ? 'Hide details' : 'Customer details';
  }
}
