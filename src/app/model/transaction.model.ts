import { CommonTargetValue } from "./common.model";
import {
    PaymentInstrument, PaymentProvider, Transaction, TransactionSource,
    TransactionStatus, TransactionType
} from "./generated-models";
import {
    TransactionTypeList, PaymentInstrumentList, PaymentProviderList,
    TransactionSourceList, TransactionStatusList
} from './payment.model';

export class TransactionItem {
    id: string = '';
    code: string = '';
    executed: Date | null = null;
    accountId: string = '';
    email: string = '';
    type: TransactionType | undefined = undefined;
    instrument: PaymentInstrument | undefined = undefined;
    instrumentDetails: CommonTargetValue | null = null;
    paymentProvider: PaymentProvider | undefined = undefined;
    paymentProviderResponse: string = '';
    source: TransactionSource | undefined = undefined;
    walletSource: string = '';
    currencyToSpend: string = '';
    currencyToReceive: string = '';
    amountToSpend: number = 0;
    amountToReceive: number = 0;
    address: string = '';
    ip: string = '';
    euro: number = 0;
    fees: number = 0;
    rate: number = 0;
    status: TransactionStatus | undefined = undefined;

    constructor(data: Transaction | null) {
        if (data !== null) {
            this.code = data.code as string;
            this.id = data.transactionId;
            this.executed = data.executed;
            this.accountId = data.userId;
            this.email = 'email@email.com';
            this.paymentProviderResponse = 'Response';
            this.walletSource = 'Wallet source';
            this.address = 'Wallet address';
            this.ip = '149.18.236.101';

            this.instrumentDetails = new CommonTargetValue();
            this.instrumentDetails.imgClass = 'payment-logo';
            this.instrumentDetails.imgSource = `assets/svg-payment-systems/visa.svg`;
            this.instrumentDetails.title = '6461 **** **** 1654';

            this.euro = 100;
            this.type = data.type;
            this.instrument = data.instrument;
            this.paymentProvider = data.paymentProvider as PaymentProvider | undefined;
            this.source = data.source;
            this.currencyToSpend = data.currencyToSpend;
            this.currencyToReceive = data.currencyToReceive;
            this.amountToSpend = data.amountToSpend;
            this.amountToReceive = data.amountToReceive;
            this.rate = data.rate;
            this.fees = data.fee;
            this.status = data.status;
        }
    }

    get transactionTypeName(): string {
        return TransactionTypeList.find(t => t.id === this.type)?.name as string;
    }

    get transactionSourceName(): string {
        return TransactionSourceList.find(t => t.id === this.source)?.name as string;
    }

    get transactionStatusName(): string {
        return TransactionStatusList.find(t => t.id === this.status)?.name as string;
    }

    get instrumentName(): string {
        return PaymentInstrumentList.find(i => i.id === this.instrument)?.name as string;
    }

    get paymentProviderName(): string {
        return PaymentProviderList.find(p => p.id === this.paymentProvider)?.name as string;
    }
}