import { TransactionSource, TransactionType } from "./generated-models";

export class TransactionsFilter {
    walletTypes: TransactionSource[] = [];
    transactionTypes: TransactionType[] = [];
    transactionDate: Date | undefined = undefined;
    sender: string = '';
}
