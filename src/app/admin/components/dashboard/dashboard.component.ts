import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/admin/model/filter.model';
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
    'accountType',
    'country',
    'source',
    'user',
    'widget'
  ];
  liquidityProviderName = '';
  showDeposits = false;
  showWithdrawals = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public dashboardService: DashboardService,
    private env: EnvService,
    private auth: AuthService) {
    this.liquidityProviderName = 'Liquidity provider balances';
    this.showDeposits = EnvService.deposit_withdrawal;
    this.showWithdrawals = EnvService.deposit_withdrawal;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dashboardService.data.subscribe(d => {
      })
    );
    this.auth.getLocalSettingsCommon()
    this.dashboardService.load();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleFilterApplied(filter: Filter): void {
    this.dashboardService.setFilter(filter);
  }
}
