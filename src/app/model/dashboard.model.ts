import { BalanceStats, DashboardStats, DepositOrWithdrawalStats, InstrumentStats, TransactionStatsByStatus, TransactionStatsVolume } from "./generated-models";
import { PaymentInstrumentList, TransactionStatusList } from "./payment.model";

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

export class DashboardTransactionStatusModel {
    status = '';
    volume = new DashboardTransactionVolumeModel(undefined);

    constructor(data: TransactionStatsByStatus | undefined) {
        const transactionStatus = TransactionStatusList.find((x) => x.id === data?.status);
        if (transactionStatus) {
            this.status = transactionStatus.name;
        }
        this.volume = new DashboardTransactionVolumeModel(data?.volume as TransactionStatsVolume | undefined);
    }
};

export class DashboardTransactionItemModel {
    title = '';
    ratio = 0;
    approved?: DashboardTransactionVolumeModel;
    declined?: DashboardTransactionVolumeModel;
    abounded?: DashboardTransactionVolumeModel;
    inProcess?: DashboardTransactionVolumeModel;
    fee?: DashboardTransactionVolumeModel;

    constructor(data: DepositOrWithdrawalStats | InstrumentStats | null) {
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
    byInstruments: DashboardTransactionItemModel[] = [];
    byStatus: DashboardTransactionStatusModel[] = [];

    constructor(data: DepositOrWithdrawalStats | undefined) {
        if (data) {
            this.total = new DashboardTransactionItemModel(data);
            data.byInstruments?.forEach(x => {
                this.byInstruments.push(new DashboardTransactionItemModel(x));
            });
            data.byStatus?.forEach(x => {
                this.byStatus.push(new DashboardTransactionStatusModel(x));
            });
        }
    }
}

export class DashboardModel {
    balances: DashboardBalanceModel[] = [];
    deposits?: DashboardTransactionModel;
    withdrawals?: DashboardTransactionModel;

    constructor(data: DashboardStats | null) {
        if (data !== null) {
            console.log(data);



            data.balances?.forEach(x => {
                this.balances.push(new DashboardBalanceModel(x));
            });
            this.deposits = new DashboardTransactionModel(data.deposits as DepositOrWithdrawalStats | undefined);
            this.withdrawals = new DashboardTransactionModel(data.withdrawals as DepositOrWithdrawalStats | undefined);



            console.log(this);
        }
    }
}
