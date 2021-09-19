import { TransactionSource, TransactionType } from "./generated-models";
import { TransactionSourceList, UserTransactionTypeList } from "./payment.model";
import { getFormattedUtcDate } from 'src/app/utils/utils';

export enum TransactionsFilterType {
    None = 'None',
    Wallet = 'Wallet',
    Transaction = 'Transaction',
    Date = 'Date',
    Sender = 'Sender'
}

export class TransactionsFilter {
    walletTypes: TransactionSource[] = [];
    transactionTypes: TransactionType[] = [];
    transactionDate: Date | undefined = undefined;
    sender: string = '';

    setData(wallets: string | undefined, types: string | undefined, date: string | undefined, sender: string | undefined): void {
        this.walletTypes = [];
        this.transactionTypes = [];
        if (wallets) {
            const selectedWallets = wallets.split(',');
            selectedWallets.forEach(w => {
                this.walletTypes.push(w as TransactionSource);
            });
        } else {
            TransactionSourceList.forEach(w => {
                this.walletTypes.push(w.id);
            });
        }
        if (types) {
            const selectedTypes = types.split(',');
            selectedTypes.forEach(w => {
                this.transactionTypes.push(w as TransactionType);
            });
        } else {
            UserTransactionTypeList.forEach(w => {
                this.transactionTypes.push(w.id);
            });
        }
        this.transactionDate = getFormattedUtcDate(date ?? '');
        this.sender = sender ?? '';
    }

    getParameters(): {} {
        let walletsFilter = '';
        let transactionFilter = '';
        let dateFilter = '';
        if (this.walletTypes.length > 0 && this.walletTypes.length < TransactionSourceList.length) {
            let i = 0;
            walletsFilter = '';
            this.walletTypes.forEach(w => {
                walletsFilter += w.toString();
                i++;
                if (i < this.walletTypes.length) {
                    walletsFilter += ',';
                }
            });
        }
        if (this.transactionTypes.length > 0 && this.transactionTypes.length < UserTransactionTypeList.length) {
            let i = 0;
            this.transactionTypes.forEach(t => {
                transactionFilter += t.toString();
                i++;
                if (i < this.transactionTypes.length) {
                    transactionFilter += ',';
                }
            });
        }
        if (this.transactionDate) {
            dateFilter = `${this.transactionDate.getDate()}/${this.transactionDate.getMonth() + 1}/${this.transactionDate.getFullYear()}`;
        }
        if (walletsFilter === '' && transactionFilter === '' && dateFilter === '' && this.sender === '') {
            return {}
        } else {
            return {
                wallets: walletsFilter,
                types: transactionFilter,
                date: dateFilter,
                sender: this.sender
            };
        }
    }
}

export class TransactionsFilterChip {
    filterType: TransactionsFilterType = TransactionsFilterType.None;
    name = '';
    value = '';
}
