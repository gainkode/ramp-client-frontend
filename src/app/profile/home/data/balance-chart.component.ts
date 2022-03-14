import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalancePoint } from 'src/app/model/balance.model';
import { SettingsCurrency, UserBalanceHistoryPeriod, UserBalanceHistoryRecordListResult, UserProfit } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexStroke, ApexMarkers, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexNoData } from 'ng-apexcharts';
import { take } from 'rxjs/operators';
import { getCurrencySign } from 'src/app/utils/utils';

@Component({
    selector: 'app-profile-balance-chart',
    templateUrl: './balance-chart.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss']
})
export class ProfileBalanceChartComponent implements OnInit, OnDestroy {
    @Input() set selectedCurrency(val: string) {
        this.fiatField?.setValue(val);
    }
    @Input() currencies: SettingsCurrency[] = [];
    @Input() totalBalanceInit = false;
    @Input() set totalBalanceNum(val: number) {
        this.currentBalance = val;
        const c = this.currencies.find(x => x.symbol === this.selectedFiat);
        if (c) {
            this.totalBalance = `${getCurrencySign(c.symbol)}${this.currentBalance.toFixed(c?.precision ?? 2)}`;
        }
        this.loadChartData();
    }
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

    positiveProfit = true;
    profitValue = '';
    inLoading = false;
    period = UserBalanceHistoryPeriod.LastWeek;
    periodIndex = 0;
    selectedFiat = '';
    totalBalance = '';
    currencyForm = this.formBuilder.group({
        fiat: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    // Chart data options
    seriesData: ApexAxisChartSeries = [
        {
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
            trim: false,
            minHeight: undefined,
            maxHeight: 50,
            style: {
                colors: '#362C3699',
                fontSize: '8px',
                fontFamily: 'Prompt',
                fontWeight: 300
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
                colors: '#362C3699',
                fontSize: '8px',
                fontWeight: 400
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
    private currentBalance = 0;

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
                if (val !== '' && val !== this.selectedFiat) {
                    this.selectedFiat = val;
                    const c = this.currencies.find(x => x.symbol === val);
                    if (c) {
                        this.totalBalance = `${getCurrencySign(c.symbol)}${this.currentBalance.toFixed(c?.precision ?? 2)}`;
                    }
                    this.onCurrencyChanged.emit(val);
                    this.loadChartData();
                }
            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    changePeriod(index: number): void {
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
        const point = w.globals.initialSeries[seriesIndex].data[dataPointIndex].goals;
        return divBlockStart + divBalanceStart + point.balance + divBalanceEnd + divDateStart + point.dateFull + divDateEnd + divBlockEnd;
    }

    private loadChartData(): void {
        if (this.totalBalanceInit === false) {
            return;
        }
        this.onError.emit('');
        const chartData$ = this.profileService.getMyProfit(this.selectedFiat, this.period).valueChanges.pipe(take(1));
        this.profitValue = '';
        this.positiveProfit = true;
        this.onProgress.emit(true);
        let chartPoints: BalancePoint[] = [];
        this.subscriptions.add(
            chartData$.subscribe(({ data }) => {
                const profitData = data.myProfit as UserProfit;
                //const profitData = this.getFakeProfits();
                //const profitData = this.getFakeProfits2();
                //const profitData = this.getFakeProfits3();
                let profit = 0;
                let profitPercent = 0;
                profitData.profits?.forEach(p => {
                    profit += p.profitFiat ?? 0;
                    profitPercent += p.profitPercent ?? 0;
                    chartPoints = this.buildChart(profitData.period, p.userBalanceHistory ?? undefined, chartPoints);
                });
                const pointerLimit = this.currencies.find(x => x.symbol === this.selectedFiat)?.precision ?? 1;
                chartPoints.forEach(c => {
                    const str = c.balanceFiat.toFixed(pointerLimit);
                    c.balanceFiat = parseFloat(str);
                });
                this.positiveProfit = (profit >= 0);
                this.profitValue = `${profit > 0 ? '+ ' : ''}${profitPercent.toFixed(2)}% (${profit} ${this.selectedFiat})`;
                this.seriesData = [{
                    name: "BALANCE",
                    color: '#E0F4FF',
                    data: chartPoints.map(v => {
                        return {
                            x: v.dateLabel,
                            y: v.balanceFiat,
                            goals: {
                                balance: v.balanceFiatValue,
                                dateFull: v.datePointFull
                            }
                        };
                    })
                }];
                this.onProgress.emit(false);
            }, (error) => {
                this.onProgress.emit(false);
                if (this.auth.token !== '') {
                    this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load chart data'));
                } else {
                    this.router.navigateByUrl('/');
                }
            })
        );
    }

    private buildChart(
        period: UserBalanceHistoryPeriod,
        data: UserBalanceHistoryRecordListResult | undefined,
        chartPoints: BalancePoint[]): BalancePoint[] {
        if (data && data.list) {
            let inc = 0;
            const max = data.count ?? 0;
            // fill chart with empty points
            if (chartPoints.length < 1) {
                let currentDate = new Date();
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
                let allDataStopNumber = 1;
                if (period === UserBalanceHistoryPeriod.All) {
                    if (max >= 10) {
                        if (max < 30) {
                            allDataStopNumber = 2;
                        } else if (max < 400) {
                            allDataStopNumber = 10;
                        } else {
                            allDataStopNumber = Math.round(max / 30);
                        }
                    }
                }
                while (inc < max) {
                    let emptyLabel = false;
                    if (period === UserBalanceHistoryPeriod.LastMonth) {
                        emptyLabel = ((inc - 1) % 2 === 0);
                    } else if (period === UserBalanceHistoryPeriod.LastYear) {
                        emptyLabel = ((inc - 1) % 10 !== 0);
                    } else if (period === UserBalanceHistoryPeriod.All) {
                        if (max < 10) {
                            emptyLabel = false;
                        } else {
                            emptyLabel = ((inc - 1) % allDataStopNumber !== 0);
                        }
                    }
                    const val = new BalancePoint();
                    val.date = new Date(2000, 1, 1, 0, 0, 0, 0);
                    val.date.setTime(currentDate.getTime() - inc * 86400000);
                    val.balanceCrypto = 0;
                    val.balanceFiat = this.currentBalance;
                    val.currency = this.selectedFiat;
                    val.dateLabel = (inc === 0 || inc === max - 1 || emptyLabel) ? '' : val.datePoint;
                    chartPoints.splice(0, 0, val);
                    inc++;
                }
            } else {
                inc = max;
            }
            let spotBalance = 0;
            while (inc > 0) {
                inc--;
                const dataPoint = data.list[inc];
                const chartPoint = chartPoints[inc];
                //const chartPoint = chartPoints[max - inc - 1];
                if (dataPoint) {
                    spotBalance += dataPoint.balanceFiat ?? 0;
                }
                chartPoint.balanceFiat -= spotBalance;

                console.log(chartPoint.dateLabel, chartPoint.balanceFiat);
            }
        }
        return chartPoints;
    }

    private getFakeProfits(): UserProfit {
        return {
            userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
            currencyTo: "USD",
            period: UserBalanceHistoryPeriod.LastMonth,
            profits: [
                {
                    currencyFrom: "BTC",
                    profit: -0.00135655,
                    profitEur: -71.49,
                    profitFiat: -82.95,
                    profitPercent: -11.02,
                    userBalanceHistory: {
                        count: 30,
                        list: [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            {
                                userBalanceId: null,
                                userId: "4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9",
                                date: "2022-02-21T10:27:33.813Z",
                                asset: "BTC",
                                balance: 0.0155385,
                                balanceEur: 516.83,
                                balanceFiat: 585.87,
                                transactionId: "e0ee739b-bf0d-450a-81ab-60cb1b8b0981"
                            },
                            {
                                userBalanceId: null,
                                userId: "4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9",
                                date: "2022-02-20T07:44:19.552Z",
                                asset: "BTC",
                                balance: 0.00716475,
                                balanceEur: 238.31,
                                balanceFiat: 270.14,
                                transactionId: "062246f6-8e00-49ed-ad58-d4ccfde671ed"
                            },
                            null,
                            null,
                            null,
                            null,
                            {
                                userBalanceId: null,
                                userId: "4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9",
                                date: "2022-02-16T18:24:29.670Z",
                                asset: "btc_test",
                                balance: 0.019265499999999998,
                                balanceEur: -640.8,
                                balanceFiat: -726.39,
                                transactionId: "97fdd004-84fe-4b82-9cb7-48e27981ab31"
                            },
                            {
                                userBalanceId: "ff480ea2-e610-4c41-9a09-776899413658",
                                userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
                                date: "2021-10-08T17:40:37.000Z",
                                asset: "BTC",
                                balance: 0.00083068,
                                balanceEur: 43.78,
                                balanceFiat: 50.79,
                                transactionId: "bb017469-93ae-43c1-9a68-559ad395c246"
                            },
                            {
                                userBalanceId: "70fb7517-d391-49b1-aca5-9e69b5d7d54d",
                                userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
                                date: "2021-10-07T14:52:08.000Z",
                                asset: "BTC",
                                balance: 0.00353684,
                                balanceEur: 186.39,
                                balanceFiat: 216.26,
                                transactionId: "bb017469-93ae-43c1-9a68-559ad395c246"
                            },
                            {
                                userBalanceId: "e2cc1707-ea2f-4ca0-a0da-7d89783aa55e",
                                userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
                                date: "2021-10-06T17:02:48.000Z",
                                asset: "BTC",
                                balance: 0.00353684,
                                balanceEur: 186.39,
                                balanceFiat: 216.26,
                                transactionId: "bb017469-93ae-43c1-9a68-559ad395c246"
                            },
                            null,
                            {
                                userBalanceId: "e352be57-99e2-498e-99b4-5f4ee175be9d",
                                userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
                                date: "2021-09-30T13:27:13.000Z",
                                asset: "BTC",
                                balance: 0.00135655,
                                balanceEur: 71.49,
                                balanceFiat: 82.95,
                                transactionId: "d869cf5c-1247-495c-a6d9-ccff8d7d88cb"
                            }
                        ]
                    }
                },
                {
                    currencyFrom: "USDC",
                    profit: 0,
                    profitEur: 0,
                    profitFiat: 0,
                    profitPercent: null,
                    userBalanceHistory: {
                        count: 30,
                        list: [
                            null,
                            null,
                            null,
                            {
                                userBalanceId: "2d547f53-b5f8-4421-a798-29306219d73c",
                                userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
                                date: "2021-10-15T10:45:50.000Z",
                                asset: "USDC",
                                balance: 12.01,
                                balanceEur: 11.16,
                                balanceFiat: 12.01,
                                transactionId: "85bd49ab-9eb3-4553-983f-8590bfe64bf4"
                            },
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                        ]
                    }
                }
            ]
        }
    }

    private getFakeProfits2(): UserProfit {
        return {
            userId: "1a4efbf1-ad24-4900-9129-70743be6fa81",
            currencyTo: "USD",
            period: UserBalanceHistoryPeriod.LastWeek,
            profits: [
                {
                    currencyFrom: 'USDC',
                    profit: 0,
                    profitEur: 0,
                    profitFiat: 0,
                    profitPercent: 0,
                    userBalanceHistory: {
                        count: 7,
                        list: [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                        ]
                    }
                },
                {
                    currencyFrom: 'BTC',
                    profit: 0,
                    profitEur: 0,
                    profitFiat: 0,
                    profitPercent: 0,
                    userBalanceHistory: {
                        count: 7,
                        list: [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                        ]
                    }
                },
                {
                    currencyFrom: 'BTC_TEST',
                    profit: -0.00447076,
                    profitEur: -158.71,
                    profitFiat: -178.12,
                    profitPercent: 0,
                    userBalanceHistory: {
                        count: 7,
                        list: [
                            null,
                            null,
                            null,
                            null,
                            null,
                            {
                                userBalanceId: null,
                                userId: '4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9',
                                date: '2022-02-22T15:59:20.547Z',
                                asset: 'btc_test',
                                balance: -0.0015630600000000002,
                                balanceEur: -55.49,
                                balanceFiat: -62.27,
                                transactionId: '7f4f32c0-8758-4a42-b2eb-7bca50283908'
                            },
                            {
                                userBalanceId: null,
                                userId: '4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9',
                                date: '2022-02-21T10:27:33.814Z',
                                asset: 'btc_test',
                                balance: 0.0029077,
                                balanceEur: 103.22,
                                balanceFiat: 115.85105,
                                transactionId: '2a3a83d7-cd0c-4306-ad98-b25989bc7874'
                            }
                        ]
                    }
                }
            ]
        }
    }

    private getFakeProfits3(): UserProfit {
        return {
            userId: "4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9",
            currencyTo: "EUR",
            period: UserBalanceHistoryPeriod.LastWeek,
            profits: [
                {
                    currencyFrom: "USDC",
                    profit: 0,
                    profitEur: 0,
                    profitFiat: 0,
                    profitPercent: 0,
                    userBalanceHistory: {
                        count: 7,
                        list: [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                        ]
                    }
                },
                {
                    currencyFrom: "BTC",
                    profit: 0,
                    profitEur: 0,
                    profitFiat: 0,
                    profitPercent: 0,
                    userBalanceHistory: {
                        count: 7,
                        list: [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                        ]
                    }
                },
                {
                    currencyFrom: "BTC_TEST",
                    profit: 0,
                    profitEur: 0,
                    profitFiat: 0,
                    profitPercent: 0,
                    userBalanceHistory: {
                        count: 7,
                        list: [
                            null,
                            {
                                userBalanceId: null,
                                userId: "4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9",
                                date: "2022-03-13T13:14:10.503Z",
                                asset: "BTC_TEST",
                                balance: -0.001,
                                balanceEur: -35.63,
                                balanceFiat: -35.63,
                                transactionId: "567384cf-f2dd-4e42-9b2b-a37ceaeca081"
                            },
                            null,
                            null,
                            {
                                userBalanceId: null,
                                userId: "4a9f147e-d3e8-4e8e-8844-4d05e91f3ee9",
                                date: "2022-03-10T13:56:44.103Z",
                                asset: "BTC_TEST",
                                balance: -0.00190575,
                                balanceEur: -67.91,
                                balanceFiat: -67.91,
                                transactionId: "9a49d5aa-939c-4bf1-8fcc-c0b1a73b4f37"
                            },
                            null,
                            null
                        ]
                    }
                }
            ]
        }
    }
}
