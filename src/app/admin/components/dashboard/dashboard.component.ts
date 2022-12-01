import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/admin/model/filter.model';
import { DateTimeInterval } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  filterFields = [
    'createdDate',
    'completedDate',
    'updatedDate',
    'accountType',
    'country',
    'source',
    'user',
    'widgetName'
  ];
  liquidityProviderName = '';
  showDeposits = false;
  showWithdrawals = false;
  defaultFilter: Filter | undefined = undefined;;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public dashboardService: DashboardService,
    private auth: AuthService) {
    this.liquidityProviderName = 'Liquidity provider balances';
    this.showDeposits = EnvService.deposit_withdrawal;
    this.showWithdrawals = EnvService.deposit_withdrawal;
    const currentDate = new Date();
    const fromDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0));
    const toDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999));
    console.log(fromDate.getTimezoneOffset())
    this.defaultFilter = {
      updatedDateInterval: {
        from: fromDate,
        to: toDate
      } as DateTimeInterval
    } as Filter;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dashboardService.data.subscribe(d => {
      })
    );
    this.auth.getLocalSettingsCommon();
    if (this.defaultFilter) {
      this.dashboardService.setFilter(this.defaultFilter);
    } else {
      this.dashboardService.load();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleFilterApplied(filter: Filter): void {
    this.dashboardService.setFilter(filter);
  }
}
