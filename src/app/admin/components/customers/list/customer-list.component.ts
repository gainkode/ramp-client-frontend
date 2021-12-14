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

  selectedCustomer: UserItem | undefined = undefined;
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
    private errorHandler: ErrorService,
    private layoutService: LayoutService,
    private adminService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedCustomer = undefined;
      });

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

  onDeleteLevel(id: string): void {
    // this.levelEditorErrorMessage = '';
    // const requestData = this.adminService.deleteKycLevelSettings(id);
    // if (requestData === null) {
    //   this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    // } else {
    //   this.inProgress = true;
    //   requestData.subscribe(({ data }) => {
    //     this.inProgress = false;
    //     this.showEditor(null, false);
    //     this.refreshLevelList();
    //   }, (error) => {
    //     this.inProgress = false;
    //     if (this.auth.token !== '') {
    //       this.levelEditorErrorMessage = this.errorHandler.getError(error.message,
    //         'Unable to delete identification level');
    //     } else {
    //       this.router.navigateByUrl('/');
    //     }
    //   });
    // }
  }

  onSavedLevel(level: UserItem): void {
    // this.levelEditorErrorMessage = '';
    // this.inProgress = true;
    // this.adminService.saveKycLevelSettings(level, this.createLevel)
    //   .subscribe(({ data }) => {
    //     this.inProgress = false;
    //     this.setEditMode(false);
    //     this.showEditor(null, false);
    //     this.createLevel = false;
    //     this.refreshLevelList();
    //   }, (error) => {
    //     this.inProgress = false;
    //     if (this.auth.token !== '') {
    //       this.levelEditorErrorMessage = this.errorHandler.getError(error.message,
    //         'Unable to save identification level');
    //     } else {
    //       this.router.navigateByUrl('/');
    //     }
    //   });
  }
}
