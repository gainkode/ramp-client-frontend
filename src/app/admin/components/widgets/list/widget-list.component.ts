import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { WidgetItem } from '../../../model/widget.model';
import { LayoutService } from '../../../services/layout.service';

@Component({
  templateUrl: 'widget-list.component.html',
  styleUrls: ['widget-list.component.scss']
})
export class WidgetListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];

  selectedItem?: WidgetItem;
  data: WidgetItem[] = [];
  customerCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});

  displayedColumns: string[] = [
    'details',
    'name',
//    'user',
    'created',
    'transactionType',
    'currenciesFrom',
    'currenciesTo',
    'destinationAddress',
    'userNotificationId',
    'countries',
    'instruments',
    'paymentProviders',
    'liquidityProvider'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;

  constructor(
    private layoutService: LayoutService,
    private adminDataService: AdminDataService) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedItem = undefined;
        this.loadData();
        // setTimeout(() => {
        //   this.loadData();
        // }, 1500);
      });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortedDesc = (this.sort.direction === 'desc');
      this.sortedField = this.sort.active;
      this.loadData();
    });
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadData();
  }

  createNewWidget(): void {
    this.selectedItem = new WidgetItem(null);
  }

  toggleDetails(widget: WidgetItem): void {
    if (this.isSelectedWidget(widget.id ?? '')) {
      this.selectedItem = undefined;
    } else {
      this.selectedItem = widget;
    }
  }

  getDetailsIcon(widgetId: string): string {
    return (this.isSelectedWidget(widgetId)) ? 'clear' : 'open_in_new';
  }

  getDetailsTooltip(widgetId: string): string {
    return (this.isSelectedWidget(widgetId)) ? 'Hide details' : 'Widget details';
  }

  handleDetailsPanelClosed(): void {
    this.selectedItem = undefined;
  }

  private loadData(): void {
    this.listSubscription.unsubscribe();

    this.listSubscription = this.adminDataService.getWidgets(
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
        console.log('widgets', result.list);
        this.data = result.list;
        this.customerCount = result.count;
      });
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
    return event;
  }

  private isSelectedWidget(widgetId: string): boolean {
    return !!this.selectedItem && this.selectedItem.id === widgetId;
  }
}
