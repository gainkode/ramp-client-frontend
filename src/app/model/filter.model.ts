export class TransactionsFilter {
    walletTypes: string[] = [];
    transactionTypes: string[] = [];
    transactionDate: Date | undefined = undefined;
    sender: string = '';
}
