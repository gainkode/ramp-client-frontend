import { Transaction } from "./generated-models";

export class TransactionItem {
    id: string = '';
    code: string = '';
    executed!: any;
    accountId: string = '';
    email: string = '';

    constructor(data: Transaction | null) {
        if (data !== null) {
            this.code = data.code as string;
            this.id = data.transactionId;
            this.executed = data.executed;
            this.accountId = data.userId;
            this.email = 'email';
        } else {
            
        }
    }
}