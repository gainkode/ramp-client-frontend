import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminDataService } from '../../../services/admin-data.service';
import { Subject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { UserItem } from 'src/app/model/user.model';
import { Filter } from '../../../model/filter.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: 'customer-list.component.html',
  styleUrls: ['customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];

  selectedCustomer?: UserItem;
  customers: UserItem[] = [];
  customerCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'lastName';
  sortedDesc = true;
  filter = new Filter({});

  displayedColumns: string[] = [
    'details', 'id', 'created', 'type', 'email', 'firstName', 'lastName', 'country', 'mode', 'kycStatus'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;

  constructor(
    private adminService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadCustomers();
    });
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadCustomers();
  }


  handleDetailsPanelClosed(): void {
    this.selectedCustomer = undefined;
  }

  private loadCustomers(): void {
    this.listSubscription.unsubscribe();

    this.listSubscription = this.adminService.getUsers(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter
    )
                                    .pipe(
                                      takeUntil(this.destroy$)
                                    )
                                    .subscribe(result => {
                                      console.log(result.list);
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
}
