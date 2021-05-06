import { Transaction } from "./generated-models";

export class TransactionItem {
    id!: string;
    code!: string;

    constructor(data: Transaction | null) {
        if (data !== null) {
            this.code = data.code as string;
            this.id = data.transactionId;
        } else {
            
        }
    }
}