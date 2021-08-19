import { DecimalPipe } from "@angular/common";
import { BalanceStats, DashboardStats, DepositOrWithdrawalStats, InstrumentStats, TransactionStatsByStatus, TransactionStatsVolume, UserType } from "./generated-models";
import { PaymentInstrumentList, TransactionStatusList } from "./payment.model";

export class DashboardFilter {
    userIdOnly = [];
    affiliateIdOnly = [];
    sourcesOnly = [];
    countriesOnly = [];  // code3
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
        this.count = data?.volume as number;
        this.volume = data?.volume as number;
    }
};

export class DashboardTransactionItemModel {
    isNull = true;
    title = '';
    ratio = 0;
    approved?: DashboardTransactionVolumeModel;
    declined?: DashboardTransactionVolumeModel;
    abounded?: DashboardTransactionVolumeModel;
    inProcess?: DashboardTransactionVolumeModel;
    fee?: DashboardTransactionVolumeModel;
    numberPipe: DecimalPipe = new DecimalPipe('en-US');

    get ratioValue(): string {
        return `${this.ratio}%`;
    }

    get approvedValue(): string {
        return (this.approved) ? `(${this.approved.count}) ${this.numberPipe.transform(this.approved.volume, '1.0-3')}` : '';
    }

    get declinedValue(): string {
        return (this.declined) ? `(${this.declined.count}) ${this.numberPipe.transform(this.declined.volume, '1.0-3')}` : '';
    }

    get aboundedValue(): string {
        return (this.abounded) ? `(${this.abounded.count}) ${this.numberPipe.transform(this.abounded.volume, '1.0-3')}` : '';
    }

    get inProcessValue(): string {
        return (this.inProcess) ? `(${this.inProcess.count}) ${this.numberPipe.transform(this.inProcess.volume, '1.0-3')}` : '';
    }

    get feeValue(): string {
        return (this.fee) ? `(${this.fee.count}) ${this.numberPipe.transform(this.fee.volume, '1.0-3')}` : '';
    }

    constructor(data: DepositOrWithdrawalStats | InstrumentStats | null) {
        this.isNull = (data === null);
        this.approved = new DashboardTransactionVolumeModel(data?.abounded as TransactionStatsVolume | undefined);
        this.declined = new DashboardTransactionVolumeModel(data?.declined as TransactionStatsVolume | undefined);
        this.abounded = new DashboardTransactionVolumeModel(data?.abounded as TransactionStatsVolume | undefined);
        this.inProcess = new DashboardTransactionVolumeModel(data?.inProcess as TransactionStatsVolume | undefined);
        this.fee = new DashboardTransactionVolumeModel(data?.fee as TransactionStatsVolume | undefined);
        if (data?.__typename === 'InstrumentStats') {
            const instrument = PaymentInstrumentList.find((x) => x.id === (data as InstrumentStats).instrument);
            if (instrument) {
                this.title = instrument.name;
            }
        }
    }
}

export class DashboardTransactionModel {
    total?: DashboardTransactionItemModel;
    details: DashboardTransactionItemModel[] = [];

    constructor(data: DepositOrWithdrawalStats | undefined) {
        if (data) {
            this.total = new DashboardTransactionItemModel(data);
            data.byInstruments?.forEach(x => {
                this.details.push(new DashboardTransactionItemModel(x));
            });
        }
    }
}

export class DashboardModel {
    totals: DashboardTransactionItemModel[] = [];
    balances: DashboardBalanceModel[] = [];
    deposits = new DashboardTransactionModel(undefined);
    withdrawals = new DashboardTransactionModel(undefined);

    constructor(data: DashboardStats | null) {
        if (data !== null) {
            console.log(data);



            data.balances?.forEach(x => {
                this.balances.push(new DashboardBalanceModel(x));
            });
            this.deposits = new DashboardTransactionModel(data.deposits as DepositOrWithdrawalStats | undefined);
            this.withdrawals = new DashboardTransactionModel(data.withdrawals as DepositOrWithdrawalStats | undefined);

            data.exchanges?.toCustomer

            if (this.deposits.total) {
                this.deposits.total.title = 'Deposits';
                if (!this.deposits.total.isNull) {
                    this.totals.push(this.deposits.total);
                }
            }
            if (this.withdrawals.total) {
                this.withdrawals.total.title = 'Withdrawals';
                if (!this.withdrawals.total.isNull) {
                    this.totals.push(this.withdrawals.total);
                }
            }

            console.log(this);
        }
    }
}
