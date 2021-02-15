export interface FeeSheme {
    id: string;
    isDefault: boolean;
    name: string;
    target: string;
    trxType: string;
    instrument: string;
    provider: string;
}

export const FeeShemes: Array<FeeSheme> = [
    {
        id: 'id0',
        isDefault: true,
        name: 'Default',
        target: 'Account',
        trxType: 'Transfer',
        instrument: 'Credit Card',
        provider: 'sofort'
    },
    {
        id: 'id1',
        isDefault: false,
        name: 'Australia',
        target: 'Country',
        trxType: 'Exchange',
        instrument: 'APM',
        provider: 'poli'
    },
    {
        id: 'id2',
        isDefault: false,
        name: 'Wallet',
        target: 'Initiat from wallet',
        trxType: 'Deposits',
        instrument: 'Bitstamp',
        provider: 'Fibonatix'
    }
];
