import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalancePoint, BalancePointType } from 'src/app/model/balance.model';
import { UserBalanceHistoryListResult, UserBalanceHistoryPeriod } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-account-balance',
    templateUrl: './profile-account-balance.component.html'
})
export class ProfileAccountBalanceComponent {
    errorMessage = '';
    inProgress = false;
    chartPoints: BalancePoint[] = [];
    period = UserBalanceHistoryPeriod.Dayly;
    private pChartSubscription!: Subscription;
    
    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.loadChartData();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pChartSubscription;
        if (s !== undefined) {
            (this.pChartSubscription as Subscription).unsubscribe();
        }
    }

    private loadChartData(): void {
        const chartData = this.profileService.getBalanceHistory(
            '',
            this.period);
        if (chartData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pChartSubscription = chartData.valueChanges.subscribe(({ data }) => {
                const chartPointsData = data.myBalanceHistory as UserBalanceHistoryListResult;


                console.log(chartPointsData);


                if (chartPointsData !== null) {
                    const pointCount = chartPointsData?.count as number;
                    if (pointCount > 0) {
                        this.chartPoints = chartPointsData?.list?.map((val) => new BalancePoint(val, BalancePointType.Balance)) as BalancePoint[];
                    }
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load chart data');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }
}
