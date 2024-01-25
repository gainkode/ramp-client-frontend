import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';

import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { DashboardService } from 'admin/services/dashboard.service';

@Component({
  selector: 'app-dashboard-merchant',
  templateUrl: './dashboard-merchant.component.html',
  styleUrls: ['./dashboard-merchant.component.scss'],
  providers: [DashboardService],
})
export class DashboardMerchantComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  constructor(
		private commonDataService: CommonDataService,
		private router: Router,
		public dashboardService: DashboardService,
		private auth: AuthService) {

  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dashboardService.data.subscribe(data => {
      })
    );
    this.auth.getLocalSettingsCommon();
    this.dashboardService.loadMerchant();
  }

  ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
