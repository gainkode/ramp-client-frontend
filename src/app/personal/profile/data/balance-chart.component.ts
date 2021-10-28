import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalancePoint } from 'src/app/model/balance.model';
import { SettingsCurrency, UserBalanceHistoryPeriod } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexStroke, ApexMarkers, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexNoData } from 'ng-apexcharts';

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
    @Input() set loading(val: boolean) {
        this.inLoading = val;
        if (val === true) {
            this.fiatField?.disable();
        } else {
            this.fiatField?.enable();
        }
    };
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onCurrencyChanged = new EventEmitter<string>();
    @ViewChild("chart") chart!: ChartComponent;

    chartPoints: BalancePoint[] = [];
    dataPoints = [];
    labelPoints: string[] = [];
    inLoading = false;
    period = UserBalanceHistoryPeriod.LastWeek;
    periodIndex = 0;
    selectedFiat = '';
    currencyForm = this.formBuilder.group({
        fiat: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    // Chart data options
    seriesData: ApexAxisChartSeries = [
        {
            name: "BALANCE",
            color: '#E0F4FF',
            data: []
        }
    ];
    chartData: ApexChart = {
        type: "area",
        height: 213,
        fontFamily: 'Ubuntu',
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    };
    dataLabels: ApexDataLabels = {
        enabled: false
    };
    areaFill: ApexFill = {
        type: "gradient",
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.75,
            opacityTo: 0.75,
            gradientToColors: ['#fff'],
            stops: [0, 100]
        }
    };
    chartStroke: ApexStroke = {
        curve: "smooth",
        colors: ['#0081D4'],
        width: 1
    };
    markers: ApexMarkers = {
        colors: ['#0081D4'],
        shape: 'circle',
        radius: 4.5
    };
    gridSettings: ApexGrid = {
        show: true,
        borderColor: '#B4AEB2',
        strokeDashArray: 4,
        position: 'back',
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        }
    };
    xaxis: ApexXAxis = {
        type: 'category',
        tickAmount: undefined,
        min: undefined,
        max: undefined,
        overwriteCategories: undefined,
        position: 'bottom',
        labels: {
            show: true,
            rotateAlways: false,
            hideOverlappingLabels: true,
            showDuplicates: false,
            trim: true,
            minHeight: undefined,
            maxHeight: 120,
            style: {
                colors: '#362C3699'
            },
            offsetX: 0,
            offsetY: 0
        },
        axisBorder: {
            show: true,
            color: '#B4AEB2',
            offsetX: 0,
            offsetY: 0,
            strokeWidth: 0.5
        },
        axisTicks: {
            show: false,
        },
        crosshairs: {
            show: false
        },
        tooltip: {
            enabled: false
        },
    };
    yaxis: ApexYAxis = {
        show: true,
        showAlways: false,
        showForNullSeries: false,
        tickAmount: 0,
        labels: {
            show: true,
            align: 'left',
            style: {
                colors: '#362C3699'
            },
            formatter: function (val, index) {
                return val.toFixed(0);
            }
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
        title: {
            text: undefined
        },
        crosshairs: {
            show: false
        },
        tooltip: {
            enabled: false
        }
    };
    tooltips: ApexTooltip = {
        enabled: true,
        followCursor: false,
        custom: this.getTooltipLayout,
        marker: {
            show: true
        }
    };
    noDataSettings: ApexNoData = {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: '14px',
          fontFamily: undefined
        }
      };

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

    chnagePeriod(index: number): void {
        const temp = this.periodIndex;
        this.periodIndex = index;
        if (index === 1) {
            this.period = UserBalanceHistoryPeriod.LastMonth;
        } else if (index === 2) {
            this.period = UserBalanceHistoryPeriod.LastYear;
        } else if (index === 3) {
            this.period = UserBalanceHistoryPeriod.All;
        } else {
            this.period = UserBalanceHistoryPeriod.LastWeek;
            this.periodIndex = 0;
        }
        if (temp !== this.periodIndex) {
            this.loadChartData();
        }
    }

    private getTooltipLayout({ series, seriesIndex, dataPointIndex, w }): string {
        const divBlockStyle = 'display: flex;flex-direction: column;justify-content: center;align-items: flex-start;padding: 4px;background: #FFFFFF;border: 0.5px solid #ECECEC;box-sizing: border-box;box-shadow: 0px 3px 3px rgba(208, 207, 207, 0.2), 0px 3px 4px rgba(208, 207, 207, 0.14), 0px 1px 8px rgba(208, 207, 207, 0.12);border-radius: 8px;';
        const divBlockStart = '<div style="' + divBlockStyle + '">';
        const divBlockEnd = '</div>';
        const divBalanceStyle = 'font-family: Ubuntu;font-style: normal;font-weight: 300;font-size: 14px;line-height: 28px;color: rgba(54, 44, 54, 0.75);margin: 0px 0px;';
        const divBalanceStart = '<div style="' + divBalanceStyle + '">';
        const divBalanceEnd = '</div>';
        const divDateStyle = 'font-family: Ubuntu;font-style: normal;font-weight: normal;font-size: 12px;line-height: 14px;color: #B4AEB2;margin: 0px 0px;';
        const divDateStart = '<div style="' + divDateStyle + '">';
        const divDateEnd = '</div>';
        const point = w.globals.initialSeries[seriesIndex].data[dataPointIndex].meta;
        return divBlockStart + divBalanceStart + point.balance + divBalanceEnd + divDateStart + point.dateFull + divDateEnd + divBlockEnd;
    }

    private loadChartData(): void {
        const chartData = this.profileService.getBalanceHistory('', this.period);


        setTimeout(() => {


            this.chartPoints = [];

            let val = new BalancePoint();
            val.date = new Date(2021, 7, 16, 0, 0, 0, 0);
            val.balanceCrypto = 0.0125;
            val.balanceFiat = 12500;
            this.chartPoints.push(val);

            val = new BalancePoint();
            val.date = new Date(2021, 7, 17, 0, 0, 0, 0);
            val.balanceCrypto = 0.0126;
            val.balanceFiat = 12684;
            this.chartPoints.push(val);

            val = new BalancePoint();
            val.date = new Date(2021, 7, 18, 0, 0, 0, 0);
            val.balanceCrypto = 0.0111;
            val.balanceFiat = 11110;
            this.chartPoints.push(val);

            val = new BalancePoint();
            val.date = new Date(2021, 7, 19, 0, 0, 0, 0);
            val.balanceCrypto = 0.0134;
            val.balanceFiat = 13452;
            this.chartPoints.push(val);

            val = new BalancePoint();
            val.date = new Date(2021, 7, 20, 0, 0, 0, 0);
            val.balanceCrypto = 0.0126;
            val.balanceFiat = 12600;
            this.chartPoints.push(val);

            val = new BalancePoint();
            val.date = new Date(2021, 7, 21, 0, 0, 0, 0);
            val.balanceCrypto = 0.0149;
            val.balanceFiat = 14985;
            this.chartPoints.push(val);

            val = new BalancePoint();
            val.date = new Date(2021, 7, 22, 0, 0, 0, 0);
            val.balanceCrypto = 0.0236;
            val.balanceFiat = 23600;
            this.chartPoints.push(val);


            this.dataPoints = [];
            this.labelPoints = [];
            this.chartPoints.forEach((val, i) => {
                const label = (i === 0 || i === this.chartPoints.length - 1) ? '' : val.datePoint;
                val.dateLabel = label;
            });
            this.seriesData = [
                {
                    name: "BALANCE",
                    color: '#E0F4FF',
                    data: this.chartPoints.map(v => {
                        return {
                            x: v.dateLabel,
                            y: v.balanceFiat,
                            meta: {
                                balance: v.balanceFiatValue,
                                dateFull: v.datePoint
                            }
                        };
                    })
                }
            ];
        }, 1000);


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
