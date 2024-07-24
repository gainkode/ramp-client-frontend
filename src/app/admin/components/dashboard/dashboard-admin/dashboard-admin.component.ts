import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Filter } from 'admin/model/filter.model';
import { DashboardService } from 'admin/services/dashboard.service';
import { DateTimeInterval, SettingsCurrencyWithDefaults } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-dashboard-admin',
	templateUrl: './dashboard-admin.component.html',
	styleUrls: ['./dashboard-admin.component.scss'],
	providers: [DashboardService]
})
export class DashboardAdminComponent implements OnInit, OnDestroy {
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
	showDeposits = EnvService.deposit_withdrawal;
	showWithdrawals = EnvService.deposit_withdrawal;
	defaultFilter: Filter | undefined = undefined;
	adminAdditionalSettings: Record<string, any> = {};
	fiatCurrencies: Array<CurrencyView> = [];
	private readonly _destroy$ = new Subject<void>();
	constructor(
		private commonDataService: CommonDataService,
		private router: Router,
		public dashboardService: DashboardService,
		private auth: AuthService) {
			
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

	ngOnInit(): void {
		this.loadCurrencies();
		this.loadCommonSettings();

		this.auth.getLocalSettingsCommon();

		if (this.auth.user?.filters?.dashboard?.includes('updatedDate') || !this.auth.user?.filters ) {
			this.dashboardService.setFilter(this.defaultFilter);
		} else {
			this.dashboardService.load();
		}
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

	private loadCommonSettings(): void{
		const settingsCommon = this.auth.getLocalSettingsCommon();

		if(settingsCommon){
			this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
			
			if(this.adminAdditionalSettings?.tabs?.dashboard?.filterFields){
				this.filterFields = this.adminAdditionalSettings.tabs.dashboard.filterFields;
			}
		}
	}

	private loadCurrencies(): void {
		this.commonDataService.getSettingsCurrency()?.valueChanges
			.pipe(take(1), takeUntil(this._destroy$))
			.subscribe({
				next: ({ data }) => {
					const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;

					if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
						this.fiatCurrencies = currencySettings.settingsCurrency.list
							?.map((val) => new CurrencyView(val)) as CurrencyView[];
						this.fiatCurrencies = this.fiatCurrencies.filter(item => item.fiat);
					} else {
						this.fiatCurrencies = [];
					}
				},
				error: () => {
					if (this.auth.token === '') {
						void this.router.navigateByUrl('/');
					}
				},
			});
	}

	handleFilterApplied(filter: Filter): void {
		this.dashboardService.setFilter(filter);
	}
}
