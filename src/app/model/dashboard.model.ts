import { DecimalPipe } from "@angular/common";
import { BalanceStats, DashboardStats, DepositOrWithdrawalStats, ExchangeStats, InstrumentStats, MerchantOrCustomerStats, TransactionSource, TransactionStatsByStatus, TransactionStatsVolume, TransferStats, UserType } from "./generated-models";
import { PaymentInstrumentList } from "./payment.model";

const isDepositOrWithdrawalStats = (variableToCheck: any): variableToCheck is DepositOrWithdrawalStats =>
    (variableToCheck as DepositOrWithdrawalStats).approved !== undefined;

const isExchangeStats = (variableToCheck: any): variableToCheck is ExchangeStats =>
    (variableToCheck as ExchangeStats).toMerchant !== undefined;

const isTransferStats = (variableToCheck: any): variableToCheck is TransferStats =>
    (variableToCheck as TransferStats).toMerchant !== undefined;

const isInstrumentStats = (variableToCheck: any): variableToCheck is InstrumentStats =>
    (variableToCheck as InstrumentStats).instrument !== undefined;

export class DashboardFilter {
    userIdOnly: string[] = [];
    affiliateIdOnly: string[] = [];
    sourcesOnly: TransactionSource[] = [];
    countriesOnly: string[] = [];  // code3
    accountTypesOnly: UserType[] = [];
}

export class DashboardBalanceModel {
    currency = '';
    count = 0;
    volume = 0;

    constructor(data: BalanceStats | null) {
        this.currency = data?.currency as string;
        this.count = data?.volume?.count as number;
        this.volume = data?.volume?.volume as number;
    }
}

export class DashboardTransactionVolumeModel {
    count = 0;
    volume = 0;

    constructor(data: TransactionStatsVolume | undefined) {
        this.count = data?.count as number;
        this.volume = data?.volume as number;
    }
};

export class DashboardTransactionItemModel {
    isNull = true;
    title = '';
    ratio = 0;
    approved?: DashboardTransactionVolumeModel;
    declined?: DashboardTransactionVolumeModel;
    abandoned?: DashboardTransactionVolumeModel;
    inProcess?: DashboardTransactionVolumeModel;
    fee?: DashboardTransactionVolumeModel;
    private numberPipe: DecimalPipe = new DecimalPipe('en-US');

    get ratioValue(): string {
        return (this.ratio) ? `${this.ratio}%` : '\u2014';  // long dash
    }

    get approvedValue(): string {
        return (this.approved) ? `(${this.approved.count}) ${this.numberPipe.transform(this.approved.volume, '1.0-3')}` : '\u2014';
    }

    get declinedValue(): string {
        return (this.declined) ? `(${this.declined.count}) ${this.numberPipe.transform(this.declined.volume, '1.0-3')}` : '\u2014';
    }

    get abandonedValue(): string {
        return (this.abandoned) ? `(${this.abandoned.count}) ${this.numberPipe.transform(this.abandoned.volume, '1.0-3')}` : '\u2014';
    }

    get inProcessValue(): string {
        return (this.inProcess) ? `(${this.inProcess.count}) ${this.numberPipe.transform(this.inProcess.volume, '1.0-3')}` : '\u2014';
    }

    get feeValue(): string {
        return (this.fee) ? `(${this.fee.count}) ${this.numberPipe.transform(this.fee.volume, '1.0-3')}` : '\u2014';
    }

    constructor(data: DepositOrWithdrawalStats | InstrumentStats | ExchangeStats | TransferStats | MerchantOrCustomerStats | TransactionStatsByStatus | null,
        title: string = '') {
        this.isNull = (data === null);
        if (isDepositOrWithdrawalStats(data) || isInstrumentStats(data) || isExchangeStats(data) || isTransferStats(data)) {
            this.ratio = data.ratio as number;
            this.approved = new DashboardTransactionVolumeModel(data?.approved as TransactionStatsVolume | undefined);
            this.declined = new DashboardTransactionVolumeModel(data?.declined as TransactionStatsVolume | undefined);
            this.abandoned = new DashboardTransactionVolumeModel(data?.abandoned as TransactionStatsVolume | undefined);
            this.inProcess = new DashboardTransactionVolumeModel(data?.inProcess as TransactionStatsVolume | undefined);
            this.fee = new DashboardTransactionVolumeModel(data?.fee as TransactionStatsVolume | undefined);
            if (isInstrumentStats(data)) {
                const instrument = PaymentInstrumentList.find((x) => x.id === (data as InstrumentStats).instrument);
                if (instrument) {
                    this.title = instrument.name;
                }
            }
            if (title) {
                this.title = title;
            }
        }
    }
}

export const isOfType = <T>(varToBeChecked: any, propertyToCheckFor: keyof T): varToBeChecked is T =>
    (varToBeChecked as T)[propertyToCheckFor] !== undefined;

export class DashboardTransactionModel {
    isNull = true;
    total?: DashboardTransactionItemModel;
    details: DashboardTransactionItemModel[] = [];

    constructor(data: DepositOrWithdrawalStats | ExchangeStats | TransferStats | undefined) {
        if (data) {
            this.total = new DashboardTransactionItemModel(data);
            this.isNull = this.total.isNull;

            if (isDepositOrWithdrawalStats(data)) {
                data.byInstruments?.forEach(x => {
                    this.details.push(new DashboardTransactionItemModel(x));
                });
            }
            if (isExchangeStats(data) || isTransferStats(data)) {
                this.details.push(new DashboardTransactionItemModel(data.toMerchant as MerchantOrCustomerStats, 'To Merchants'));
                this.details.push(new DashboardTransactionItemModel(data.toCustomer as MerchantOrCustomerStats, 'To Customers'));
            }
        }
    }
}

export class DashboardModel {
    totals: DashboardTransactionItemModel[] = [];
    balances: DashboardBalanceModel[] = [];
    deposits = new DashboardTransactionModel(undefined);
    withdrawals = new DashboardTransactionModel(undefined);
    exchanges = new DashboardTransactionModel(undefined);
    transfers = new DashboardTransactionModel(undefined);

    constructor(data: DashboardStats | null) {
        if (data !== null) {
            //console.log(data);


            data.balances?.forEach(x => {
                this.balances.push(new DashboardBalanceModel(x));
            });
            this.deposits = new DashboardTransactionModel(data.deposits as DepositOrWithdrawalStats | undefined);
            this.transfers = new DashboardTransactionModel(data.transfers as TransferStats | undefined);
            this.withdrawals = new DashboardTransactionModel(data.withdrawals as DepositOrWithdrawalStats | undefined);
            this.exchanges = new DashboardTransactionModel(data.exchanges as ExchangeStats | undefined);



            // temp
            // this.transfers = new DashboardTransactionModel({
            //     __typename: 'TransferStats',
            //     ratio: 11,
            //     approved: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 7,
            //         volume: 17.71
            //     },
            //     declined: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 8,
            //         volume: 18.81
            //     },
            //     abandoned: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 9,
            //         volume: 19.91
            //     },
            //     inProcess: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 2,
            //         volume: 12.21
            //     },
            //     toMerchant: {
            //         ratio: 31.13,
            //         approved: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 32,
            //             volume: 32.92
            //         },
            //         declined: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 33,
            //             volume: 33.93
            //         },
            //         abandoned: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 34,
            //             volume: 34.94
            //         },
            //         inProcess: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 35,
            //             volume: 35.95
            //         },
            //         fee: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 36,
            //             volume: 36.96
            //         }
            //     },
            //     toCustomer: {
            //         ratio: 41.13,
            //         approved: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 42,
            //             volume: 42.92
            //         },
            //         declined: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 43,
            //             volume: 43.93
            //         },
            //         abandoned: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 44,
            //             volume: 44.94
            //         },
            //         inProcess: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 45,
            //             volume: 45.95
            //         },
            //         fee: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 46,
            //             volume: 46.96
            //         }
            //     },
            //     fee: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 5,
            //         volume: 15.51
            //     },
            // } as TransferStats);
            // this.exchanges = new DashboardTransactionModel({
            //     __typename: 'ExchangeStats',
            //     ratio: 11,
            //     approved: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 17,
            //         volume: 117.71
            //     },
            //     declined: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 18,
            //         volume: 118.81
            //     },
            //     abandoned: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 19,
            //         volume: 119.91
            //     },
            //     inProcess: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 12,
            //         volume: 112.21
            //     },
            //     toMerchant: {
            //         ratio: 51.13,
            //         approved: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 52,
            //             volume: 52.92
            //         },
            //         declined: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 53,
            //             volume: 53.93
            //         },
            //         abandoned: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 54,
            //             volume: 54.94
            //         },
            //         inProcess: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 55,
            //             volume: 55.95
            //         },
            //         fee: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 56,
            //             volume: 56.96
            //         }
            //     },
            //     toCustomer: {
            //         ratio: 61.13,
            //         approved: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 62,
            //             volume: 62.92
            //         },
            //         declined: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 63,
            //             volume: 63.93
            //         },
            //         abandoned: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 64,
            //             volume: 64.94
            //         },
            //         inProcess: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 65,
            //             volume: 65.95
            //         },
            //         fee: {
            //             __typename: 'TransactionStatsVolume',
            //             count: 66,
            //             volume: 66.96
            //         }
            //     },
            //     fee: {
            //         __typename: 'TransactionStatsVolume',
            //         count: 15,
            //         volume: 115.51
            //     },
            // } as ExchangeStats);
            // temp

            if (this.deposits.total) {
                this.deposits.total.title = 'Deposits';
                if (!this.deposits.total.isNull) {
                    this.totals.push(this.deposits.total);
                }
            }
            if (this.transfers.total) {
                this.transfers.total.title = 'Transfers';
                if (!this.transfers.total.isNull) {
                    this.totals.push(this.transfers.total);
                }
            }
            if (this.withdrawals.total) {
                this.withdrawals.total.title = 'Withdrawals';
                if (!this.withdrawals.total.isNull) {
                    this.totals.push(this.withdrawals.total);
                }
            }
            if (this.exchanges.total) {
                this.exchanges.total.title = 'Exchanges';
                if (!this.exchanges.total.isNull) {
                    this.totals.push(this.exchanges.total);
                }
            }

            //console.log(this);
        }
    }
}
