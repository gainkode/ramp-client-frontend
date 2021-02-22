export interface FeeSheme {
    id: string;
    isDefault: boolean;
    name: string;
    target: string;
    trxType: string;
    instrument: string;
    provider: string;
    transactionFees: number;
}

export const FeeShemes: Array<FeeSheme> = [
    {
        id: 'id0',
        isDefault: true,
        name: 'Default',
        target: 'AccountId',
        trxType: 'Transfer',
        instrument: 'Credit Card',
        provider: 'Sofort',
        transactionFees: 5
    },
    {
        id: 'id1',
        isDefault: false,
        name: 'Australia',
        target: 'Country',
        trxType: 'Exchange',
        instrument: 'APM',
        provider: 'Poli',
        transactionFees: 3
    },
    {
        id: 'id2',
        isDefault: false,
        name: 'Wallet',
        target: 'Initiate from wallet',
        trxType: 'Deposits',
        instrument: 'Bitstamp',
        provider: 'Fibonatix',
        transactionFees: 4.5
    }
];
