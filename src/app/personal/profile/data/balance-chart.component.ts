import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalancePoint } from 'src/app/model/balance.model';
import { SettingsCurrency, UserBalanceHistoryPeriod } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-balance-chart',
    templateUrl: './balance-chart.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss']
})
export class PersonalBalanceChartComponent implements OnInit, OnDestroy {
    @Input() set selectedCurrency(val: string) {
        this.fiatField?.setValue(val);
    }
    @Input() currencies: SettingsCurrency[] = [];
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onCurrencyChanged = new EventEmitter<string>();

    chartPoints: BalancePoint[] = [];
    period = UserBalanceHistoryPeriod.LastWeek;
    selectedFiat = '';
    currencyForm = this.formBuilder.group({
        fiat: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
        private formBuilder: FormBuilder,
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    get fiatField(): AbstractControl | null {
        return this.currencyForm.get('fiat');
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.fiatField?.valueChanges.subscribe(val => {
                if (val !== '') {
                    this.selectedFiat = val;
                    this.onCurrencyChanged.emit(val);
                }
            }));
        this.loadChartData();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadChartData(): void {
        const chartData = this.profileService.getBalanceHistory('', this.period);
        // if (chartData === null) {
        //     this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        // } else {
        //     this.inProgress = true;
        //     this.pChartSubscription = chartData.valueChanges.subscribe(({ data }) => {
        //         const chartPointsData = data.myBalanceHistory as UserBalanceHistoryListResult;


        //         console.log(chartPointsData);


        //         if (chartPointsData !== null) {
        //             const pointCount = chartPointsData?.count as number;
        //             if (pointCount > 0) {
        //                 this.chartPoints = chartPointsData?.list?.map((val) => new BalancePoint(val, BalancePointType.Balance)) as BalancePoint[];
        //             }
        //         }
        //         this.inProgress = false;
        //     }, (error) => {
        //         this.inProgress = false;
        //         if (this.auth.token !== '') {
        //             this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load chart data');
        //         } else {
        //             this.router.navigateByUrl('/');
        //         }
        //     });
        // }
    }
}
