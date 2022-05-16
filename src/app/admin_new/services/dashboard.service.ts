import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { getCurrencySign } from 'src/app/utils/utils';
import { BalanceStats } from 'src/app/model/generated-models';
import { DashboardCardData, DashboardData } from 'src/app/admin_old/model/dashboard-data.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { PaymentInstrumentList } from 'src/app/model/payment.model';

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

  public loading = false;

  private subscriptions: Subscription = new Subscription();
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
    //this.load();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setFilter(filter: Filter): void {
    this.filter = filter;
    this.load();
  }

  load(): void {
    this.loading = true;
    const dashboardData$ = this.adminDataService.getDashboardStats(this.filter).pipe(take(1));
    this.subscriptions.add(dashboardData$.subscribe(rawData => {
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
            label: 'Success Rate',
            type: 'percent'
          }
        ],
        rows: [
          {
            type: 'Buy',
            approvedCount: rawData.deposits?.approved?.count ?? null,
            approvedVolume: rawData.deposits?.approved?.volume ?? null,
            declinedCount: rawData.deposits?.declined?.count ?? null,
            declinedVolume: rawData.deposits?.declined?.volume ?? null,
            abandonedCount: rawData.deposits?.abandoned?.count ?? null,
            abandonedVolume: rawData.deposits?.abandoned?.volume ?? null,
            ratio: rawData.deposits?.ratio ?? null
          },
          {
            type: 'Sell',
            approvedCount: rawData.withdrawals?.approved?.count ?? null,
            approvedVolume: rawData.withdrawals?.approved?.volume ?? null,
            declinedCount: rawData.withdrawals?.declined?.count ?? null,
            declinedVolume: rawData.withdrawals?.declined?.volume ?? null,
            abandonedCount: rawData.withdrawals?.abandoned?.count ?? null,
            abandonedVolume: rawData.withdrawals?.abandoned?.volume ?? null,
            ratio: rawData.withdrawals?.ratio ?? null
          },
          {
            type: 'Send',
            approvedCount: rawData.transfers?.approved?.count ?? null,
            approvedVolume: rawData.transfers?.approved?.volume ?? null,
            declinedCount: rawData.transfers?.declined?.count ?? null,
            declinedVolume: rawData.transfers?.declined?.volume ?? null,
            abandonedCount: rawData.transfers?.abandoned?.count ?? null,
            abandonedVolume: rawData.transfers?.abandoned?.volume ?? null,
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
            ratio: rawData.receives?.ratio ?? null
          }
        ]
      };
      // endregion

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
            key: 'ratio',
            label: 'Success Rate',
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
            label: 'Success Rate',
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
            key: 'ratio',
            label: 'Success Rate',
            type: 'percent'
          }
        ],
        rows: [
          {
            type: 'To merchants',
            approvedCount: rawData.receives?.toMerchant?.approved?.count ?? null,
            approvedVolume: rawData.receives?.toMerchant?.approved?.volume ?? null,
            declinedCount: rawData.receives?.toMerchant?.declined?.count ?? null,
            declinedVolume: rawData.receives?.toMerchant?.declined?.volume ?? null,
            abandonedCount: rawData.receives?.toMerchant?.abandoned?.count ?? null,
            abandonedVolume: rawData.receives?.toMerchant?.abandoned?.volume ?? null,
            ratio: rawData.receives?.toMerchant?.ratio ?? null
          },
          {
            type: 'To customers',
            approvedCount: rawData.receives?.toCustomer?.approved?.count ?? null,
            approvedVolume: rawData.receives?.toCustomer?.approved?.volume ?? null,
            declinedCount: rawData.receives?.toCustomer?.declined?.count ?? null,
            declinedVolume: rawData.receives?.toCustomer?.declined?.volume ?? null,
            abandonedCount: rawData.receives?.toCustomer?.abandoned?.count ?? null,
            abandonedVolume: rawData.receives?.toCustomer?.abandoned?.volume ?? null,
            ratio: rawData.receives?.toCustomer?.ratio ?? null
          }
        ]
      };
      // endregion

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
            key: 'ratio',
            label: 'Success Rate',
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
          }
          // {
          //   key: 'action',
          //   label: '',
          //   type: 'action'
          // }
        ],
        rows: [
          {
            source: 'Buy',
            volume: this.getFeeValue(rawData.deposits?.fee?.volume ?? null),
            count: rawData.deposits?.fee?.count ?? null
          },
          {
            source: 'Sell',
            volume: this.getFeeValue(rawData.withdrawals?.fee?.volume ?? null),
            count: rawData.withdrawals?.fee?.count ?? null
          },
          {
            source: 'Send',
            volume: this.getFeeValue(rawData.transfers?.fee?.volume ?? null),
            count: rawData.transfers?.fee?.count ?? null
          },
          {
            source: 'Receive',
            volume: this.getFeeValue(rawData.receives?.fee?.volume ?? null),
            count: rawData.receives?.fee?.count ?? null
          }
        ]
      };

      //  endregion

      // region Balances

      const testBalances: BalanceStats[] = [
        {
          currency: 'BTC',
          volume: {
            count: 5,
            volume: 15
          }
        },
        {
          currency: 'ETH',
          volume: {
            count: 2,
            volume: 3.154
          }
        }
      ];
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

      //  endregion

      const data = {
        total: totalData,
        deposits: depositsData,
        transfers: transfersData,
        receives: receivesData,
        withdrawals: withdrawalsData,
        fees: feesData,
        balances: balancesData
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

  getFeeValue(val: number | null): string | null {
    if (val === null) {
      return null;
    } else {
      return `${getCurrencySign('EUR')}${val}`;
    }
  }
}
