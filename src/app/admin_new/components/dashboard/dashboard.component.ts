import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/admin_new/model/filter.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  filterFields = [
    'createdDate',
    'completedDate',
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
