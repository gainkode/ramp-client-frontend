import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DashboardService } from 'admin/services/dashboard.service';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-dashboard-merchant',
	templateUrl: './dashboard-merchant.component.html',
	styleUrls: ['./dashboard-merchant.component.scss'],
	providers: [DashboardService],
})
export class DashboardMerchantComponent implements OnInit, OnDestroy {
	private subscriptions: Subscription = new Subscription();
	date = new Date();
	dashboardData$ = this.dashboardService.dashboardMerchantData();
	constructor(
		public dashboardService: DashboardService,
		private auth: AuthService) {
	}

	ngOnInit(): void {
		this.auth.getLocalSettingsCommon();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
