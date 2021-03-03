import { SettingsFee, PaymentInstrument } from "./generated-models";

export class PaymentInstrumentView {
    id!: PaymentInstrument;
    name: string = '';
}

export const PaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.Apm, name: 'APM' },
    { id: PaymentInstrument.Bitstamp, name: 'Bitstamp' },
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.Received, name: 'Received' },
    { id: PaymentInstrument.Send, name: 'Send' },
    { id: PaymentInstrument.WireTransfer, name: 'Wire transfer' }
]

export class FeeScheme {
    id!: string;
    isDefault: boolean = false;
    description!: string;
    name!: string;
    target!: string;
    trxType!: string;
    instrument: Array<PaymentInstrument> = [];
    provider!: string;
    terms!: FeeShemeTerms;
    details!: FeeShemeWireDetails;

    constructor(data: SettingsFee | null) {
        console.log(data);
        if (data !== null) {
            this.name = data.name;
            this.isDefault = data.default as boolean;
            this.description = data.description as string;
            this.terms = new FeeShemeTerms(data.terms);
            this.details = new FeeShemeWireDetails(data.wireDetails);
            //details.targetInstruments
        } else {
            this.terms = new FeeShemeTerms('');
            this.details = new FeeShemeWireDetails('');
        }
    }
}

export class FeeShemeTerms {
    transactionFees!: number;
    minTransactionFee!: number;
    rollingReserves!: number;
    rollingReservesDays!: number;
    chargebackFees!: number;
    monthlyFees!: number;
    minMonthlyFees!: number;

    constructor(data: string) {
        if (data !== '') {
            const terms = JSON.parse(data);
            this.transactionFees = terms.Ttransaction_fee;
            this.minTransactionFee = terms.Min_transaction_fee;
            this.rollingReserves = terms.Rolling_reserves;
            this.rollingReservesDays = terms.Rolling_reserves_days;
            this.chargebackFees = terms.Chargeback_fees;
            this.monthlyFees = terms.Monthly_fees;
            this.minMonthlyFees = terms.Min_monthly_fees;
        }
    }

    getObject(): string {
        return JSON.stringify({
            Ttransaction_fee: this.transactionFees,
            Min_transaction_fee: this.minTransactionFee,
            Rolling_reserves: this.rollingReserves,
            Rolling_reserves_days: this.rollingReservesDays,
            Chargeback_fees: this.chargebackFees,
            Monthly_fees: this.monthlyFees,
            Min_monthly_fees: this.minMonthlyFees
        });
    }
}

export class FeeShemeWireDetails {
    beneficiaryName!: string;
    beneficiaryAddress!: string;
    iban!: string;
    bankName!: string;
    bankAddress!: string;
    swift!: string;

    constructor(data: string) {
        if (data !== '') {
            const details = JSON.parse(data);
            this.bankAddress = details.Bank_address;
            this.bankName = details.Bank_name;
            this.beneficiaryAddress = details.Beneficiary_address;
            this.beneficiaryName = details.Beneficiary_name;
            this.iban = details.Iban;
            this.swift = details.Swift;
        }
    }

    getObject(): string {
        return JSON.stringify({
            Bank_address: this.bankAddress,
            Bank_name: this.bankName,
            Beneficiary_address: this.beneficiaryAddress,
            Beneficiary_name: this.beneficiaryName,
            Iban: this.iban,
            Swift: this.swift
        });
    }
}
