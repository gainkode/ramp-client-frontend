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
        target: 'AccountId',
        trxType: 'Transfer',
        instrument: 'Credit Card',
        provider: 'Sofort'
    },
    {
        id: 'id1',
        isDefault: false,
        name: 'Australia',
        target: 'Country',
        trxType: 'Exchange',
        instrument: 'APM',
        provider: 'Poli'
    },
    {
        id: 'id2',
        isDefault: false,
        name: 'Wallet',
        target: 'Initiate from wallet',
        trxType: 'Deposits',
        instrument: 'Bitstamp',
        provider: 'Fibonatix'
    }
];
