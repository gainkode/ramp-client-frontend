import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Subject } from 'rxjs';
import { Filter } from '../../model/filter.model';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.scss'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  filterFields = [
    'accountType',
    'country',
    'source',
    'user',
    'widget'
  ];

  private destroy$ = new Subject();

  constructor(
    public dashboardService: DashboardService
  ) {
  }

  ngOnInit(): void {
    this.dashboardService.data.subscribe(d => {
      console.log(d);
    });

    this.dashboardService.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  handleFilterApplied(filter: Filter): void {
    this.dashboardService.setFilter(filter);
  }

}
