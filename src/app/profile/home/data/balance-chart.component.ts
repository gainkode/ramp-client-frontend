import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BalancePoint } from 'model/balance.model';
import { SettingsCurrency, UserBalanceHistoryPeriod, UserBalanceHistoryRecordListResult, UserProfit } from 'model/generated-models';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexStroke, ApexMarkers, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexNoData } from 'ng-apexcharts';
import { take } from 'rxjs/operators';
import { getCurrencySign } from 'utils/utils';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-profile-balance-chart',
	templateUrl: './balance-chart.component.html',
	styleUrls: ['../../../../assets/menu.scss', '../../../../assets/profile.scss']
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
    }
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onCurrencyChanged = new EventEmitter<string>();
    @ViewChild('chart') chart!: ChartComponent;

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
    	type: 'area',
    	height: 213,
    	fontFamily: EnvService.main_font,
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
    fillColors: string[] = [EnvService.base_color];
    areaFill: ApexFill = {
    	type: 'gradient',
    	gradient: {
    		shadeIntensity: 1,
    		opacityFrom: 0.5,
    		opacityTo: 0.5,
    		gradientToColors: ['#fff'],
    		stops: [0, 100]
    	}
    };
    chartStroke: ApexStroke = {
    	curve: 'smooth',
    	colors: [EnvService.base_color],
    	width: 1
    };
    markers: ApexMarkers = {
    	colors: [EnvService.base_color],
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
    	type: 'datetime',
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
    		formatter: function (val) {
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
    	private formBuilder: UntypedFormBuilder,
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
    	const divBalanceStyle = `font-family: ${EnvService.main_font};font-style: normal;font-weight: 300;font-size: 14px;line-height: 28px;color: rgba(54, 44, 54, 0.75);margin: 0px 0px;`;
    	const divBalanceStart = '<div style="' + divBalanceStyle + '">';
    	const divBalanceEnd = '</div>';
    	const divDateStyle = `font-family: ${EnvService.main_font};font-style: normal;font-weight: normal;font-size: 12px;line-height: 14px;color: #B4AEB2;margin: 0px 0px;`;
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

    			let profit = 0;
    			let profitPercent = 0;
    			profitData.profits?.forEach(p => {
    				profit += p.profitFiat ?? 0;
    				profitPercent += p.profitPercent ?? 0;
    				chartPoints = this.buildChart(p.userBalanceHistory ?? undefined, chartPoints);
    			});
    			const pointerLimit = this.currencies.find(x => x.symbol === this.selectedFiat)?.precision ?? 1;
    			chartPoints.forEach(c => {
    				const str = c.balanceFiat.toFixed(pointerLimit);
    				c.balanceFiat = parseFloat(str);
    			});
    			this.positiveProfit = (profit >= 0);
    			this.profitValue = `${profit > 0 ? '+ ' : ''}${profitPercent.toFixed(2)}% (${profit} ${this.selectedFiat})`;
    			this.seriesData = [{
    				name: 'BALANCE',
    				//color: '#E0F4FF',
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
    	data: UserBalanceHistoryRecordListResult | undefined,
    	chartPoints: BalancePoint[]): BalancePoint[] {
    	if (data && data.list) {
    		let inc = 0;
    		const max = data.count ?? 0;
    		// fill chart with empty points
    		if (chartPoints.length < 1) {
    			let currentDate = new Date();
    			currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);

    			while (inc < max) {
    				const val = new BalancePoint();
    				val.date = new Date(2000, 1, 1, 0, 0, 0, 0);
    				val.date.setTime(currentDate.getTime() - inc * 86400000);
    				val.balanceCrypto = 0;
    				val.balanceFiat = this.currentBalance;
    				val.currency = this.selectedFiat;
    				val.dateLabel = val.datePointFull;
    				chartPoints.splice(0, 0, val);
    				inc++;
    			}
    		} else {
    			inc = max;
    		}

    		let spotBalance = 0;
    		while (inc > 0) {
    			inc--;
    			const dataPoint = data.list[max - inc - 1];
    			const chartPoint = chartPoints[inc];
    			chartPoint.balanceFiat -= spotBalance;
    			if (dataPoint !== null) {
    				spotBalance += dataPoint.balanceFiat ?? 0;
    			}
    		}
    	}
    	return chartPoints;
    }
}
