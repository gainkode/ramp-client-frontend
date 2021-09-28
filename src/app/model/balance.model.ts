import { UserBalanceHistory } from "./generated-models";

export enum BalancePointType {
    Balance = 'Balance',
    BalanceEur = 'BalanceEur'
}

export class BalancePoint {
    date!: Date;
    balance = 0;
    transactionId = '';

    constructor(point: UserBalanceHistory | undefined, pointType: BalancePointType) {
        if (point) {
            this.date = point.date;
            this.transactionId = point.transactionId as string;
            if (pointType === BalancePointType.Balance) {
                this.balance = point.balance;
            } else if (pointType === BalancePointType.BalanceEur) {
                this.balance = point.balanceEur;
            }
        }
    }
}