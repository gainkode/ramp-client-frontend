import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, of } from 'rxjs';
import { catchError, delay, take } from 'rxjs/operators';
import { getCurrencySign } from 'utils/utils';
import { DashboardCardData, DashboardData } from 'admin/model/dashboard-data.model';
import { AdminDataService } from 'services/admin-data.service';
import { Filter } from 'admin/model/filter.model';
import { PaymentInstrumentList } from 'model/payment.model';
import { EnvService } from 'services/env.service';
import { DashboardMerchantStats, DateTimeInterval, DashboardStats, TransferStats } from 'model/generated-models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class DashboardService implements OnDestroy {
	private isLoadedSubject = new BehaviorSubject(false);

	public get isLoaded(): Observable<boolean> {
		return this.isLoadedSubject.asObservable();
	}

	private dataSubject = new ReplaySubject<DashboardData>();

	public get data(): Observable<DashboardData> {
		return this.dataSubject.asObservable();
	}

	public loading = false;

	private subscriptions: Subscription = new Subscription();
	private filter = new Filter({
		userIdOnly: [],
		widgetIdOnly: [],
		sourcesOnly: [],
		countriesOnly: [],
		accountTypesOnly: []
	});

	constructor(private adminDataService: AdminDataService, private _snackBar: MatSnackBar) { }

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	setFilter(filter: Filter): void {
		this.filter = filter;
		this.load();
	}
	
	dashboardMerchantData(from: string, to: string): Observable<DashboardMerchantStats> {
		this.filter.completedDateInterval = <DateTimeInterval>{ from, to };
		return this.adminDataService.getDashboardMerchantStats(this.filter)
			.pipe(
				delay(1000),take(1),
				catchError(() => {
					this._snackBar.open('There was an error getting dashboard data. Please contact R&D', null, { duration: 5000 });
					
					return of({
						transactionsAmount: 0,
						transactionsTotal: 0,
						usersTotal: 0
					});
				}),);
	}

	load(): void {
		this.loading = true;
		this.isLoadedSubject.next(false);
		const dashboardData$ = this.adminDataService.getDashboardStats(this.filter).pipe(take(1));
		this.subscriptions.add(dashboardData$.subscribe(rawData => {
			rawData = this.filterCardData(rawData);

			// region Total
			const totalData: DashboardCardData = {
				columns: [
					{
						key: 'type',
						label: 'Transaction Type',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: [
					{
						type: 'Deposit',
						approvedCount: rawData.deposits?.approved?.count ?? null,
						approvedVolume: rawData.deposits?.approved?.volume ?? null,
						declinedCount: rawData.deposits?.declined?.count ?? null,
						declinedVolume: rawData.deposits?.declined?.volume ?? null,
						abandonedCount: rawData.deposits?.abandoned?.count ?? null,
						abandonedVolume: rawData.deposits?.abandoned?.volume ?? null,
						failedCount: rawData.deposits?.failed?.count ?? null,
						failedVolume: rawData.deposits?.failed?.volume ?? null,
						chargedBackCount: rawData.deposits?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.deposits?.chargedBack?.volume ?? null,
						ratio: rawData.deposits?.ratio ?? null
					},
					{
						type: 'Withdrawal',
						approvedCount: rawData.withdrawals?.approved?.count ?? null,
						approvedVolume: rawData.withdrawals?.approved?.volume ?? null,
						declinedCount: rawData.withdrawals?.declined?.count ?? null,
						declinedVolume: rawData.withdrawals?.declined?.volume ?? null,
						abandonedCount: rawData.withdrawals?.abandoned?.count ?? null,
						abandonedVolume: rawData.withdrawals?.abandoned?.volume ?? null,
						failedCount: rawData.withdrawals?.failed?.count ?? null,
						failedVolume: rawData.withdrawals?.failed?.volume ?? null,
						chargedBackCount: rawData.withdrawals?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.withdrawals?.chargedBack?.volume ?? null,
						ratio: rawData.withdrawals?.ratio ?? null
					},
					{
						type: 'Buy',
						approvedCount: rawData.buys?.approved?.count ?? null,
						approvedVolume: rawData.buys?.approved?.volume ?? null,
						declinedCount: rawData.buys?.declined?.count ?? null,
						declinedVolume: rawData.buys?.declined?.volume ?? null,
						abandonedCount: rawData.buys?.abandoned?.count ?? null,
						abandonedVolume: rawData.buys?.abandoned?.volume ?? null,
						failedCount: rawData.buys?.failed?.count ?? null,
						failedVolume: rawData.buys?.failed?.volume ?? null,
						chargedBackCount: rawData.buys?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.buys?.chargedBack?.volume ?? null,
						ratio: rawData.buys?.ratio ?? null
					},
					{
						type: 'Sell',
						approvedCount: rawData.sells?.approved?.count ?? null,
						approvedVolume: rawData.sells?.approved?.volume ?? null,
						declinedCount: rawData.sells?.declined?.count ?? null,
						declinedVolume: rawData.sells?.declined?.volume ?? null,
						abandonedCount: rawData.sells?.abandoned?.count ?? null,
						abandonedVolume: rawData.sells?.abandoned?.volume ?? null,
						failedCount: rawData.sells?.failed?.count ?? null,
						failedVolume: rawData.sells?.failed?.volume ?? null,
						chargedBackCount: rawData.sells?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.sells?.chargedBack?.volume ?? null,
						ratio: rawData.sells?.ratio ?? null
					},
					{
						type: 'Send',
						approvedCount: rawData.transfers?.approved?.count ?? null,
						approvedVolume: rawData.transfers?.approved?.volume ?? null,
						declinedCount: rawData.transfers?.declined?.count ?? null,
						declinedVolume: rawData.transfers?.declined?.volume ?? null,
						abandonedCount: rawData.transfers?.abandoned?.count ?? null,
						abandonedVolume: rawData.transfers?.abandoned?.volume ?? null,
						failedCount: rawData.transfers?.failed?.count ?? null,
						failedVolume: rawData.transfers?.failed?.volume ?? null,
						chargedBackCount: rawData.transfers?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.transfers?.chargedBack?.volume ?? null,
						ratio: rawData.transfers?.ratio ?? null
					},
					{
						type: 'Receive',
						approvedCount: rawData.receives?.approved?.count ?? null,
						approvedVolume: rawData.receives?.approved?.volume ?? null,
						declinedCount: rawData.receives?.declined?.count ?? null,
						declinedVolume: rawData.receives?.declined?.volume ?? null,
						abandonedCount: rawData.receives?.abandoned?.count ?? null,
						abandonedVolume: rawData.receives?.abandoned?.volume ?? null,
						failedCount: rawData.receives?.failed?.count ?? null,
						failedVolume: rawData.receives?.failed?.volume ?? null,
						chargedBackCount: rawData.receives?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.receives?.chargedBack?.volume ?? null,
						ratio: rawData.receives?.ratio ?? null
					}
				]
			};
			if (!EnvService.deposit_withdrawal) {
				totalData.rows.splice(totalData.rows.findIndex(x => x.type === 'Deposit'), 1);
				totalData.rows.splice(totalData.rows.findIndex(x => x.type === 'Withdrawal'), 1);
			}

			// region Buys
			const buysData: DashboardCardData = {
				columns: [
					{
						key: 'instrument',
						label: 'Payment Method',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: rawData.buys?.byInstruments ?
					rawData.buys.byInstruments.map(item => {
						const instrument = PaymentInstrumentList.find(i => i.id === item.instrument);
						return {
							instrument: instrument?.name ?? '?',
							approvedCount: item.approved?.count ?? null,
							approvedVolume: item.approved?.volume ?? null,
							declinedCount: item.declined?.count ?? null,
							declinedVolume: item.declined?.volume ?? null,
							abandonedCount: item.abandoned?.count ?? null,
							abandonedVolume: item.abandoned?.volume ?? null,
							failedCount: item.failed?.count ?? null,
							failedVolume: item.failed?.volume ?? null,
							chargedBackCount: item.chargedBack?.count ?? null,
							chargedBackVolume: item.chargedBack?.volume ?? null,
							ratio: item.ratio ?? null
						};
					}) : []
			};

			// region Buys
			const paidsData: DashboardCardData = {
				columns: [
					{
						key: 'type',
						label: 'Transaction type',
						type: 'text'
					},
					{
						key: 'count',
						label: 'Count',
						type: 'number'
					},
					{
						key: 'volume',
						label: 'Total',
						type: 'count-volume'
					}
				],
				rows: [
					{type: 'Buy', volumeVolume: rawData.paids?.buys?.volume, count: rawData.paids?.buys?.count},
					{type: 'Sell', volumeVolume: rawData.paids?.sells?.volume, count: rawData.paids?.sells?.count}
				]
			};

			// region Deposits
			const depositsData: DashboardCardData = {
				columns: [
					{
						key: 'instrument',
						label: 'Payment Method',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: rawData.deposits?.byInstruments ?
					rawData.deposits.byInstruments.map(item => {
						const instrument = PaymentInstrumentList.find(i => i.id === item.instrument);
						return {
							instrument: instrument?.name ?? '?',
							approvedCount: item.approved?.count ?? null,
							approvedVolume: item.approved?.volume ?? null,
							declinedCount: item.declined?.count ?? null,
							declinedVolume: item.declined?.volume ?? null,
							abandonedCount: item.abandoned?.count ?? null,
							abandonedVolume: item.abandoned?.volume ?? null,
							failedCount: item.failed?.count ?? null,
							failedVolume: item.failed?.volume ?? null,
							chargedBackCount: item.chargedBack?.count ?? null,
							chargedBackVolume: item.chargedBack?.volume ?? null,
							ratio: item.ratio ?? null
						};
					}) : []
			};

			// region Transfers
			const transfersData: DashboardCardData = {
				columns: [
					{
						key: 'type',
						label: 'Type',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: [
					{
						type: 'To merchants',
						approvedCount: rawData.transfers?.toMerchant?.approved?.count ?? null,
						approvedVolume: rawData.transfers?.toMerchant?.approved?.volume ?? null,
						declinedCount: rawData.transfers?.toMerchant?.declined?.count ?? null,
						declinedVolume: rawData.transfers?.toMerchant?.declined?.volume ?? null,
						abandonedCount: rawData.transfers?.toMerchant?.abandoned?.count ?? null,
						abandonedVolume: rawData.transfers?.toMerchant?.abandoned?.volume ?? null,
						failedCount: rawData.transfers?.toMerchant?.failed?.count ?? null,
						failedVolume: rawData.transfers?.toMerchant?.failed?.volume ?? null,
						chargedBackCount: rawData.transfers?.toMerchant?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.transfers?.toMerchant?.chargedBack?.volume ?? null,
						ratio: rawData.transfers?.toMerchant?.ratio ?? null
					},
					{
						type: 'To customers',
						approvedCount: rawData.transfers?.toCustomer?.approved?.count ?? null,
						approvedVolume: rawData.transfers?.toCustomer?.approved?.volume ?? null,
						declinedCount: rawData.transfers?.toCustomer?.declined?.count ?? null,
						declinedVolume: rawData.transfers?.toCustomer?.declined?.volume ?? null,
						abandonedCount: rawData.transfers?.toCustomer?.abandoned?.count ?? null,
						abandonedVolume: rawData.transfers?.toCustomer?.abandoned?.volume ?? null,
						failedCount: rawData.transfers?.toMerchant?.failed?.count ?? null,
						failedVolume: rawData.transfers?.toMerchant?.failed?.volume ?? null,
						chargedBackCount: rawData.transfers?.toMerchant?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.transfers?.toMerchant?.chargedBack?.volume ?? null,
						ratio: rawData.transfers?.toCustomer?.ratio ?? null
					}
				]
			};

			// region Receives
			const receivesData: DashboardCardData = {
				columns: [
					{
						key: 'type',
						label: 'Type',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: rawData.receives ? [
					{
						type: 'Wire transfer',
						approvedCount: rawData.receives?.approved?.count ?? null,
						approvedVolume: rawData.receives?.approved?.volume ?? null,
						declinedCount: rawData.receives?.declined?.count ?? null,
						declinedVolume: rawData.receives?.declined?.volume ?? null,
						abandonedCount: rawData.receives?.abandoned?.count ?? null,
						abandonedVolume: rawData.receives?.abandoned?.volume ?? null,
						failedCount: rawData.transfers?.failed?.count ?? null,
						failedVolume: rawData.transfers?.failed?.volume ?? null,
						chargedBackCount: rawData.transfers?.chargedBack?.count ?? null,
						chargedBackVolume: rawData.transfers?.chargedBack?.volume ?? null,
						ratio: rawData.receives?.ratio ?? null
					},
				] : []
			};

			// region Withdrawals
			const withdrawalsData: DashboardCardData = {
				columns: [
					{
						key: 'instrument',
						label: 'Payment Method',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: rawData.withdrawals?.byInstruments ?
					rawData.withdrawals.byInstruments.map(item => {
						const instrument = PaymentInstrumentList.find(i => i.id === item.instrument);
						return {
							instrument: instrument?.name ?? '?',
							approvedCount: item.approved?.count ?? null,
							approvedVolume: item.approved?.volume ?? null,
							declinedCount: item.declined?.count ?? null,
							declinedVolume: item.declined?.volume ?? null,
							abandonedCount: item.abandoned?.count ?? null,
							abandonedVolume: item.abandoned?.volume ?? null,
							failedCount: item.failed?.count ?? null,
							failedVolume: item.failed?.volume ?? null,
							chargedBackCount: item.chargedBack?.count ?? null,
							chargedBackVolume: item.chargedBack?.volume ?? null,
							ratio: item.ratio ?? null
						};
					}) : []
			};

			// region Sells
			const sellsData: DashboardCardData = {
				columns: [
					{
						key: 'instrument',
						label: 'Payment Method',
						type: 'text'
					},
					{
						key: 'approved',
						label: 'Approved',
						type: 'count-volume'
					},
					{
						key: 'declined',
						label: 'Declined',
						type: 'count-volume'
					},
					{
						key: 'abandoned',
						label: 'Abandoned',
						type: 'count-volume'
					},
					{
						key: 'failed',
						label: 'Failed',
						type: 'count-volume'
					},
					{
						key: 'chargedBack',
						label: 'Charged back',
						type: 'count-volume'
					},
					{
						key: 'ratio',
						label: 'Success Rate, %',
						type: 'percent'
					}
				],
				rows: rawData.sells?.byInstruments ?
					rawData.sells.byInstruments.map(item => {
						const instrument = PaymentInstrumentList.find(i => i.id === item.instrument);
						return {
							instrument: instrument?.name ?? '?',
							approvedCount: item.approved?.count ?? null,
							approvedVolume: item.approved?.volume ?? null,
							declinedCount: item.declined?.count ?? null,
							declinedVolume: item.declined?.volume ?? null,
							abandonedCount: item.abandoned?.count ?? null,
							abandonedVolume: item.abandoned?.volume ?? null,
							failedCount: item.failed?.count ?? null,
							failedVolume: item.failed?.volume ?? null,
							chargedBackCount: item.chargedBack?.count ?? null,
							chargedBackVolume: item.chargedBack?.volume ?? null,
							ratio: item.ratio ?? null
						};
					}) : []
			};

			// region Fees
			const feesData: DashboardCardData = {
				columns: [
					{
						key: 'source',
						label: 'From',
						type: 'text'
					},
					{
						key: 'volume',
						label: 'Value',
						type: 'number'
					},
					{
						key: 'count',
						label: 'Count',
						type: 'number'
					}
					// {
					//   key: 'action',
					//   label: '',
					//   type: 'action'
					// }
				],
				rows: [
					{
						source: 'Deposit',
						volume: this.getFeeValue(rawData.deposits?.fee?.volume ?? 0),
						count: rawData.deposits?.fee?.count ?? 0
					},
					{
						source: 'Withdrawal',
						volume: this.getFeeValue(rawData.withdrawals?.fee?.volume ?? 0),
						count: rawData.withdrawals?.fee?.count ?? 0
					},
					{
						source: 'Buy',
						volume: this.getFeeValue(rawData.buys?.fee?.volume ?? 0),
						count: rawData.buys?.fee?.count ?? 0
					},
					{
						source: 'Sell',
						volume: this.getFeeValue(rawData.sells?.fee?.volume ?? 0),
						count: rawData.sells?.fee?.count ?? 0
					},
					{
						source: 'Send',
						volume: this.getFeeValue(rawData.transfers?.fee?.volume ?? 0),
						count: rawData.transfers?.fee?.count ?? 0
					},
					{
						source: 'Receive',
						volume: this.getFeeValue(rawData.receives?.fee?.volume ?? 0),
						count: rawData.receives?.fee?.count ?? 0
					}
				]
			};
			if (!EnvService.deposit_withdrawal) {
				feesData.rows.splice(feesData.rows.findIndex(x => x.source === 'Deposit'), 1);
				feesData.rows.splice(feesData.rows.findIndex(x => x.source === 'Withdrawal'), 1);
			}

			// region Balances
			const balancesData: DashboardCardData = {
				columns: [
					{
						key: 'coin',
						label: 'Base coin',
						type: 'text'
					},
					{
						key: 'value',
						label: 'Value',
						type: 'number'
					},
					{
						key: 'count',
						label: 'Wallets',
						type: 'number'
					}
					// {
					//   key: 'action',
					//   label: '',
					//   type: 'action'
					// }
				],
				rows: rawData.balances ?
					rawData.balances.map(item => {
						return {
							coin: item.currency ?? null,
							value: item.volume?.volume ?? null,
							count: item.volume?.count ?? null
						};
					}) : []
			};

			const openpaydBalances: DashboardCardData = {
				columns: [
					{
						key: 'coin',
						label: 'Base coin',
						type: 'text'
					},
					{
						key: 'value',
						label: 'Value',
						type: 'number'
					}
					// {
					//   key: 'action',
					//   label: '',
					//   type: 'action'
					// }
				],
				rows: rawData.openpaydBalances ?
					rawData.openpaydBalances.map(item => {
						return {
							coin: item.currency ?? null,
							value: item.balance ?? null
						};
					}) : []
			};

			const monoovaBalances: DashboardCardData = {
				columns: [
					{
						key: 'coin',
						label: 'Base coin',
						type: 'text'
					},
					{
						key: 'value',
						label: 'Value',
						type: 'number'
					}
					// {
					//   key: 'action',
					//   label: '',
					//   type: 'action'
					// }
				],
				rows: rawData.monoovaBalances ?
					rawData.monoovaBalances.map(item => {
						return {
							coin: item.currency ?? null,
							value: item.balance ?? null
						};
					}) : []
			};

			// region Balances
			const liquidityProviderBalancesData: DashboardCardData = {
				columns: [
					{
						key: 'coin',
						label: 'Currency',
						type: 'text'
					},
					{
						key: 'value',
						label: 'Value',
						type: 'number'
					}
				],
				rows: rawData.liquidityProviderBalances ?
					rawData.liquidityProviderBalances.map(item => {
						return {
							coin: item?.currency ?? null,
							value: item?.balance ?? null
						};
					}) : []
			};

			const data = {
				total: totalData,
				buys: buysData,
				sells: sellsData,
				deposits: depositsData,
				transfers: transfersData,
				receives: receivesData,
				withdrawals: withdrawalsData,
				fees: feesData,
				balances: balancesData,
				openpaydBalances: openpaydBalances,
				monoovaBalances: monoovaBalances,
				liquidityBalances: liquidityProviderBalancesData,
				paids: paidsData
			};

			this.dataSubject.next(data);

			if (!this.isLoadedSubject.value) {
				this.isLoadedSubject.next(true);
			}
			this.loading = false;

		}, (error) => {
			if (!this.isLoadedSubject.value) {
				this.isLoadedSubject.next(true);
			}
			this.loading = false;
		}));
	}

	getFeeValue(val: number = 0): string {
		return getCurrencySign('EUR') + val;
	}

	private filterCardData(dashboardData: DashboardStats): DashboardStats {
		if (!dashboardData) {
			return dashboardData;
		}

		const rawData = { ...dashboardData };

		if (!rawData.receives?.approved?.count &&
			!rawData.receives?.declined?.count &&
			!rawData.receives?.abandoned?.count &&
			!rawData.transfers?.failed?.count &&
			!rawData.transfers?.chargedBack?.count
		) {
			rawData.receives = null;
		}

		if (!rawData.transfers?.approved?.count &&
			!rawData.transfers?.declined?.count &&
			!rawData.transfers?.abandoned?.count &&
			!rawData.transfers?.failed?.count &&
			!rawData.transfers?.chargedBack?.count
		) {
			rawData.transfers = null;
		}

		return rawData;
	}
}
