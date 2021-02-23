import { Tracing } from "trace_events";

export interface FeeSheme {
    id: string;
    isDefault: boolean;
    name: string;
    target: string;
    trxType: string;
    instrument: string;
    provider: string;
    transactionFees: number;
    minTransactionFee: number;
    rollingReserves: number;
    rollingReservesDays: number;
    chargebackFees: number;
    monthlyFees: number;
    minMonthlyFees: number;
    beneficiaryName: string;
    beneficiaryAddress: string;
    iban: string;
    bankName: string;
    bankAddress: string;
    swift: string;
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
        transactionFees: 5,
        minTransactionFee: 5,
        rollingReserves: 5,
        rollingReservesDays: 30,
        chargebackFees: 50,
        monthlyFees: 500,
        minMonthlyFees: 0,
        beneficiaryName: 'My name',
        beneficiaryAddress: 'Street 2',
        iban: 'FRTETV5456',
        bankName: 'Fia Bank',
        bankAddress: 'Street 16',
        swift: 'FIABKNA3'
    },
    {
        id: 'id1',
        isDefault: false,
        name: 'Australia',
        target: 'Country',
        trxType: 'Exchange',
        instrument: 'APM',
        provider: 'Poli',
        transactionFees: 3,
        minTransactionFee: 4,
        rollingReserves: 51,
        rollingReservesDays: 15,
        chargebackFees: 50,
        monthlyFees: 100,
        minMonthlyFees: 12,
        beneficiaryName: 'Your name',
        beneficiaryAddress: 'Street 23',
        iban: 'IBAN1342',
        bankName: 'Your Bank',
        bankAddress: 'Street 106',
        swift: 'YOURBANK'
    },
    {
        id: 'id2',
        isDefault: false,
        name: 'Wallet',
        target: 'Initiate from wallet',
        trxType: 'Deposits',
        instrument: 'Bitstamp',
        provider: 'Fibonatix',
        transactionFees: 4.5,
        minTransactionFee: 4.23,
        rollingReserves: 27,
        rollingReservesDays: 18,
        chargebackFees: 25,
        monthlyFees: 100,
        minMonthlyFees: 13.5,
        beneficiaryName: 'Just name',
        beneficiaryAddress: 'Street 42',
        iban: 'IBAN0000',
        bankName: 'Bank Name',
        bankAddress: 'Street 63',
        swift: 'SWIFT001'
    }
];
