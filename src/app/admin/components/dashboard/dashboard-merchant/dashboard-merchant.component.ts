import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from 'admin/services/dashboard.service';
import { AuthService } from 'services/auth.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

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
	dateRange = new FormGroup({
		from: new FormControl<Date | null>(new Date()),
		to: new FormControl<Date | null>(new Date()),
	});

	constructor(
		public dashboardService: DashboardService,
		private auth: AuthService) {
	}

	get dateRangeChange(): AbstractControl{
		// console.log(this.dateRange.controls)
		return this.dateRange.controls.from;
	}

	ngOnInit(): void {
		this.auth.getLocalSettingsCommon();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
