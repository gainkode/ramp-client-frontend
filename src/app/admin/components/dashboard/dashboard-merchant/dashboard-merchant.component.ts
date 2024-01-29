import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from 'admin/services/dashboard.service';
import { DashboardMerchantStats } from 'model/generated-models';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-dashboard-merchant',
	templateUrl: './dashboard-merchant.component.html',
	styleUrls: ['./dashboard-merchant.component.scss'],
	providers: [DashboardService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardMerchantComponent implements OnInit, OnDestroy {
	currentDate = new Date();
	dateRangeForm = new FormGroup({
		from: new FormControl<Date | null>(this.getFirstDateOfCurrentMonth()),
		to: new FormControl<Date | null>(this.getLastDateOfCurrentMonth()),
	});
	dashboardData$: Observable<DashboardMerchantStats>;

	private subscriptions: Subscription = new Subscription();
	private dateRangeSubject = new BehaviorSubject<{ from: Date; to: Date; }>({
		from: this.dateRangeForm.controls.from.value,
		to: this.dateRangeForm.controls.to.value,
	});

	constructor(
		public dashboardService: DashboardService,
		private auth: AuthService) {
		
		this.dashboardData$ = this.dateRangeSubject.pipe(
			switchMap(range => 
			  this.dashboardService.dashboardMerchantData(
					this.getISOString(range.from),
					this.getISOString(range.to)
			  )
			)
		  );
	}

	ngOnInit(): void {
		this.auth.getLocalSettingsCommon();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	onRangeApply(): void {
		this.dateRangeSubject.next(
			{ 
				from: this.dateRangeForm.controls.from.value, 
				to: this.dateRangeForm.controls.to.value
			}
		);
	}

	private getISOString(date: Date): string {
		return date?.toISOString();
	}

	private getFirstDateOfCurrentMonth(): Date {
		const currentDate = new Date();
		return new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0));
	  }
	  
	  private getLastDateOfCurrentMonth(): Date {
		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
	  
		return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
	  }
}
