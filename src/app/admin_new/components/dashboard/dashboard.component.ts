import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/admin_new/model/filter.model';
import { AuthService } from 'src/app/services/auth.service';
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

  private subscriptions: Subscription = new Subscription();

  constructor(
    public dashboardService: DashboardService,
    private auth: AuthService) {
    const commonSettings = this.auth.getLocalSettingsCommon();
    this.liquidityProviderName = `${commonSettings?.liquidityProvider} Balances` ?? '';
    if (this.liquidityProviderName === '') {
      this.liquidityProviderName = 'Liquidity provider balances';
    }
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
