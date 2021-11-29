import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { AdminDataService } from '../../services/admin-data.service';
import { DashboardCardData, DashboardData } from '../../model/dashboard-data.model';
import { Filter } from '../../model/filter.model';
import { takeUntil } from 'rxjs/operators';
import { PaymentInstrumentList } from '../../../model/payment.model';

@Injectable({
  providedIn: 'any'
})
export class DashboardService implements OnDestroy {
  private isLoadedSubject = new BehaviorSubject(false);

  public get isLoaded(): Observable<boolean> {
    return this.isLoadedSubject.asObservable();
  }

  private dataSubject = new ReplaySubject<DashboardData>();

  public get data(): Observable<DashboardData> {
    return this.dataSubject.asObservable();
  }

  private destroy$ = new Subject();
  private filter = new Filter({
    userIdOnly: [],
    widgetIdOnly: [],
    sourcesOnly: [],
    countriesOnly: [],
    accountTypesOnly: []
  });

  constructor(
    private adminDataService: AdminDataService
  ) {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  setFilter(filter: Filter): void {
    this.filter = filter;
    this.load();
  }

  load(): void {
    this.adminDataService.getDashboardStats(this.filter)
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe(rawData => {

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
                key: 'ratio',
                label: 'Ratio',
                type: 'percent'
              }
            ],
            rows: [
              {
                type: 'Deposits',
                approvedCount: rawData.deposits?.approved?.count ?? null,
                approvedVolume: rawData.deposits?.approved?.volume ?? null,
                declinedCount: rawData.deposits?.declined?.count ?? null,
                declinedVolume: rawData.deposits?.declined?.volume ?? null,
                abandonedCount: rawData.deposits?.abandoned?.count ?? null,
                abandonedVolume: rawData.deposits?.abandoned?.volume ?? null,
                ratio: rawData.deposits?.ratio ?? null
              },
              {
                type: 'Transfers',
                approvedCount: rawData.transfers?.approved?.count ?? null,
                approvedVolume: rawData.transfers?.approved?.volume ?? null,
                declinedCount: rawData.transfers?.declined?.count ?? null,
                declinedVolume: rawData.transfers?.declined?.volume ?? null,
                abandonedCount: rawData.transfers?.abandoned?.count ?? null,
                abandonedVolume: rawData.transfers?.abandoned?.volume ?? null,
                ratio: rawData.transfers?.ratio ?? null
              },
              {
                type: 'Withdrawals',
                approvedCount: rawData.withdrawals?.approved?.count ?? null,
                approvedVolume: rawData.withdrawals?.approved?.volume ?? null,
                declinedCount: rawData.withdrawals?.declined?.count ?? null,
                declinedVolume: rawData.withdrawals?.declined?.volume ?? null,
                abandonedCount: rawData.withdrawals?.abandoned?.count ?? null,
                abandonedVolume: rawData.withdrawals?.abandoned?.volume ?? null,
                ratio: rawData.withdrawals?.ratio ?? null
              },
              {
                type: 'Exchanges',
                approvedCount: rawData.exchanges?.approved?.count ?? null,
                approvedVolume: rawData.exchanges?.approved?.volume ?? null,
                declinedCount: rawData.exchanges?.declined?.count ?? null,
                declinedVolume: rawData.exchanges?.declined?.volume ?? null,
                abandonedCount: rawData.exchanges?.abandoned?.count ?? null,
                abandonedVolume: rawData.exchanges?.abandoned?.volume ?? null,
                ratio: rawData.exchanges?.ratio ?? null
              }
            ]
          };
          // endregion

          // region Deposits
          const depositsData: DashboardCardData = {
            columns: [
              {
                key: 'instrument',
                label: 'Instrument',
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
                key: 'ratio',
                label: 'Ratio',
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
                  ratio: item.ratio ?? null
                };
              }) : []
          };

          // endregion

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
                key: 'ratio',
                label: 'Ratio',
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
                ratio: rawData.transfers?.toCustomer?.ratio ?? null
              }
            ]
          };

          // endregion

          // region Withdrawals
          const withdrawalsData: DashboardCardData = {
            columns: [
              {
                key: 'instrument',
                label: 'Instrument',
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
                key: 'ratio',
                label: 'Ratio',
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
                  ratio: item.ratio ?? null
                };
              }) : []
          };

          // region Exchanges
          const exchangesData: DashboardCardData = {
            columns: [
              {
                key: 'instrument',
                label: 'Instrument',
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
                key: 'ratio',
                label: 'Ratio',
                type: 'percent'
              }
            ],
            rows: [
              {
                type: 'To merchants',
                approvedCount: rawData.exchanges?.toMerchant?.approved?.count ?? null,
                approvedVolume: rawData.exchanges?.toMerchant?.approved?.volume ?? null,
                declinedCount: rawData.exchanges?.toMerchant?.declined?.count ?? null,
                declinedVolume: rawData.exchanges?.toMerchant?.declined?.volume ?? null,
                abandonedCount: rawData.exchanges?.toMerchant?.abandoned?.count ?? null,
                abandonedVolume: rawData.exchanges?.toMerchant?.abandoned?.volume ?? null,
                ratio: rawData.exchanges?.toMerchant?.ratio ?? null
              },
              {
                type: 'To customers',
                approvedCount: rawData.exchanges?.toCustomer?.approved?.count ?? null,
                approvedVolume: rawData.exchanges?.toCustomer?.approved?.volume ?? null,
                declinedCount: rawData.exchanges?.toCustomer?.declined?.count ?? null,
                declinedVolume: rawData.exchanges?.toCustomer?.declined?.volume ?? null,
                abandonedCount: rawData.exchanges?.toCustomer?.abandoned?.count ?? null,
                abandonedVolume: rawData.exchanges?.toCustomer?.abandoned?.volume ?? null,
                ratio: rawData.exchanges?.toCustomer?.ratio ?? null
              }
            ]
          };

          // endregion

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
              },
              {
                key: 'action',
                label: '',
                type: 'action'
              }
            ],
            rows: [
              {
                source: 'Deposits',
                volume: rawData.deposits?.fee?.volume ?? null,
                count: rawData.deposits?.fee?.count ?? null
              },
              {
                source: 'Transfers',
                volume: rawData.transfers?.fee?.volume ?? null,
                count: rawData.transfers?.fee?.count ?? null
              },
              {
                source: 'Withdrawals',
                volume: rawData.withdrawals?.fee?.volume ?? null,
                count: rawData.withdrawals?.fee?.count ?? null
              },
              {
                source: 'Exchanges',
                volume: rawData.exchanges?.fee?.volume ?? null,
                count: rawData.exchanges?.fee?.count ?? null
              }
            ]
          };

          //  endregion

          // region Balances

          const balancesData: DashboardCardData = {
            columns: [
              {
                key: 'coin',
                label: 'Base coin',
                type: 'text'
              },
              {
                key: 'volume',
                label: 'Value',
                type: 'number'
              },
              {
                key: 'count',
                label: 'Wallets',
                type: 'number'
              },
              {
                key: 'action',
                label: '',
                type: 'action'
              }
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

          //  endregion

          const data = {
            total: totalData,
            deposits: depositsData,
            transfers: transfersData,
            withdrawals: withdrawalsData,
            exchanges: exchangesData,
            fees: feesData,
            balances: balancesData
          };

          this.dataSubject.next(data);

          if (!this.isLoadedSubject.value) {
            this.isLoadedSubject.next(true);
          }

        });

  }

}
