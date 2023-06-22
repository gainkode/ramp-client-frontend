import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/admin/model/filter.model';
import { DateTimeInterval, SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { DashboardService } from '../../services/dashboard.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { CurrencyView } from 'src/app/model/payment.model';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    'widgetName',
    'fiatCurrency'
  ];
  liquidityProviderName = '';
  showDeposits = false;
  showWithdrawals = false;
  defaultFilter: Filter | undefined = undefined;
  adminAdditionalSettings: Record<string, any> = {};
  fiatCurrencies: Array<CurrencyView> = [];


  private subscriptions: Subscription = new Subscription();

  constructor(
    private commonDataService: CommonDataService,
    private router: Router,
    public dashboardService: DashboardService,
    private auth: AuthService) {
    this.liquidityProviderName = 'Liquidity provider balances';
    this.showDeposits = EnvService.deposit_withdrawal;
    this.showWithdrawals = EnvService.deposit_withdrawal;
    const currentDate = new Date();
    const fromDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0));
    const toDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999));
    this.defaultFilter = {
      updatedDateInterval: {
        from: fromDate,
        to: toDate
      } as DateTimeInterval
    } as Filter;
  }

  private loadCommonSettings(){
    let settingsCommon = this.auth.getLocalSettingsCommon();
    if(settingsCommon){
      this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
      if(this.adminAdditionalSettings?.tabs?.dashboard?.filterFields){
        this.filterFields = this.adminAdditionalSettings.tabs.dashboard.filterFields;
      }
    }
  }
  ngOnInit(): void {
    this.loadCurrencies();
    this.loadCommonSettings();
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

  private loadCurrencies(): void {
    this.subscriptions.add(
      this.commonDataService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
          this.fiatCurrencies = currencySettings.settingsCurrency.list
            ?.map((val) => new CurrencyView(val)) as CurrencyView[];
          this.fiatCurrencies = this.fiatCurrencies.filter(item => item.fiat == true);
        } else {
          this.fiatCurrencies = [];
        }
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleFilterApplied(filter: Filter): void {
    this.dashboardService.setFilter(filter);
  }
}
