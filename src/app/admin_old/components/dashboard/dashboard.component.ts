import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Subscription } from 'rxjs';
import { Filter } from '../../model/filter.model';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.scss'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  filterFields = [
    'transactionDate',
    'accountType',
    'country',
    'source',
    'user',
    'widget'
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(public dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dashboardService.data.subscribe(d => {
      })
    );
    this.dashboardService.load();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleFilterApplied(filter: Filter): void {
    this.dashboardService.setFilter(filter);
  }
}
