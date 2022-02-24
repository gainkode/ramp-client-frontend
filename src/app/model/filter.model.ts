import { TransactionSource, TransactionType } from "./generated-models";
import { CurrencyView, TransactionSourceList, UserTransactionTypeList } from "./payment.model";
import { getFormattedUtcDate } from 'src/app/utils/utils';

export interface ProfileBaseFilter {
    setData(data: any): void;
    getParameters(): {};
}

export enum FilterChipType {
    None = 'None',
    Wallet = 'Wallet',
    Transaction = 'Transaction',
    Currency = 'Currency',
    Date = 'Date',
    Sender = 'Sender',
    ZeroBalance = 'ZeroBalance',
    Email = 'Email',
    UserName = 'UserName'
}

export class FilterChip {
    filterType: FilterChipType = FilterChipType.None;
    name = '';
    value = '';
}

export class TransactionsFilter implements ProfileBaseFilter {
    walletTypes: TransactionSource[] = [];
    transactionTypes: TransactionType[] = [];
    transactionDate: Date | undefined = undefined;
    sender: string = '';
    walletAddress = '';

    setData(data: any): void {
        this.walletTypes = [];
        this.transactionTypes = [];
        if (data.wallets) {
            const selectedWallets = data.wallets.split(',');
            selectedWallets.forEach(w => { this.walletTypes.push(w as TransactionSource); });
        } else {
            TransactionSourceList.forEach(w => { this.walletTypes.push(w.id); });
        }
        if (data.types) {
            const selectedTypes = data.types.split(',');
            selectedTypes.forEach(w => { this.transactionTypes.push(w as TransactionType); });
        } else {
            UserTransactionTypeList.forEach(w => { this.transactionTypes.push(w.id); });
        }
        this.transactionDate = getFormattedUtcDate(data.date ?? '');
        this.sender = data.sender ?? '';
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

export class NotificationsFilter implements ProfileBaseFilter {
    unreadOnly = false;
    search: string = '';

    setData(data: any): void {
        this.unreadOnly = false;
        this.search = '';
        if (data.unreadOnly) {
            this.unreadOnly = (data.unreadOnly === 'true');
        }
        if (data.search) {
            this.search = data.search;
        }
    }

    getParameters(): {} {
        const result = {
            ...(this.unreadOnly && { unreadOnly: this.unreadOnly }),
            ...(this.search !== '' && { search: this.search })
        };
        return result;
    }
}

export class WalletsFilter implements ProfileBaseFilter {
    zeroBalance = false;
    currencies: string[] = [];
    currenciesSize = 0;

    setData(data: any): void {
        this.zeroBalance = false;
        this.currencies = [];
        if (data.balance) {
            this.zeroBalance = (data.balance === 'true');
        }
        if (data.currencies) {
            const selectedCurrencies = data.currencies.split(',');
            selectedCurrencies.forEach(w => { this.currencies.push((w as string).toUpperCase()); });
        }
    }

    getParameters(): {} {
        let currenciesFilter = '';
        if (this.currencies.length > 0 && this.currencies.length < this.currenciesSize) {
            let i = 0;
            this.currencies.forEach(t => {
                currenciesFilter += t.toString();
                i++;
                if (i < this.currencies.length) {
                    currenciesFilter += ',';
                }
            });
        }
        const result = {
            ...(this.zeroBalance && { balance: this.zeroBalance }),
            ...(currenciesFilter !== '' && { currencies: currenciesFilter.toLowerCase() })
        };
        return result;
    }
}

export class ContactsFilter implements ProfileBaseFilter {
    email: string = '';
    userName: string = '';
    zeroBalance = false;
    currencies: string[] = [];
    currenciesSize = 0;

    setData(data: any): void {
        this.email = '';
        this.userName = '';
        this.zeroBalance = false;
        this.currencies = [];
        if (data.email) {
            this.email = data.email;
        }
        if (data.user) {
            this.userName = data.user;
        }
        if (data.balance) {
            this.zeroBalance = (data.balance === 'true');
        }
        if (data.currencies) {
            const selectedCurrencies = data.currencies.split(',');
            selectedCurrencies.forEach(w => { this.currencies.push((w as string).toUpperCase()); });
        }
    }

    getParameters(): {} {
        let currenciesFilter = '';
        if (this.currencies.length > 0 && this.currencies.length < this.currenciesSize) {
            let i = 0;
            this.currencies.forEach(t => {
                currenciesFilter += t.toString();
                i++;
                if (i < this.currencies.length) {
                    currenciesFilter += ',';
                }
            });
        }
        const result = {
            ...(this.zeroBalance && { balance: this.zeroBalance }),
            ...(currenciesFilter !== '' && { currencies: currenciesFilter.toLowerCase() }),
            ...(this.email !== '' && { email: this.email }),
            ...(this.userName !== '' && { user: this.userName })
        };
        return result;
    }
}
