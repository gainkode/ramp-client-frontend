import { BalanceStats, DashboardStats } from "./generated-models";

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

export class DashboardModel {
    balances: DashboardBalanceModel[] = [];

    constructor(data: DashboardStats | null) {
        if (data !== null) {
            data.balances?.forEach(x => {
                this.balances.push(new DashboardBalanceModel(x));
            });
        }
    }
}
