import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { MatSort } from '@angular/material/sort';
import { Filter } from '../../../model/filter.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { RiskAlertItem } from '../../../model/risk-alert.model';

@Component({
  templateUrl: 'risk-alert-list.component.html',
  styleUrls: ['risk-alert-list.component.scss']
})
export class RiskAlertListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'user',
    'riskAlertCode',
    'search'
  ];

  data: RiskAlertItem[] = [];
  dataCount = 0;
  pageSize = 25;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});

  displayedColumns: string[] = [
    'riskAlertId',
    'user',
    'email',
    'created',
    'riskAlertTypeCode',
    'entity'
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private adminDataService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadData();
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadData();
  }

  private loadData(): void {
    const listData$ = this.adminDataService.getRiskAlerts(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(result => {
        this.data = result.list;
        this.dataCount = result.count;
      })
    );
  }

  handlePage(event: PageEvent): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
    return event;
  }
}
