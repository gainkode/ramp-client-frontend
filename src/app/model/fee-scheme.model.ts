import { CountryCodes, getCountry, getCountryByCode3 } from './country-code.model';

import {
    SettingsFee, PaymentInstrument, PaymentProvider, TransactionType,
    FeeSettingsTargetFilterType
} from "./generated-models";

export class TargetParams {
    title: string = '';
    inputPlaceholder: string = '';
    dataList: CommonTargetValue[] = [];
}

export class CommonTargetValue {
    title: string = '';
    imgClass: string = '';
    imgSource: string = '';
}

export const CountryFilterList: CommonTargetValue[] = CountryCodes.map(c => {
    let item = new CommonTargetValue();
    item.imgClass = "country-flag";
    item.imgSource = `assets/svg-country-flags/${c.code2.toLowerCase()}.svg`;
    item.title = c.name;
    return item;
});

// temp
export const AffiliateIdFilterList: CommonTargetValue[] = [
    { title: 'fb4598gbf38d73', imgClass: '', imgSource: '' },
    { title: 'ce98g6g7fb80g4', imgClass: '', imgSource: '' },
    { title: 'ee3f78f4358g74', imgClass: '', imgSource: '' },
    { title: 'abab90ag59bedb', imgClass: '', imgSource: '' }
];
export const AccountIdFilterList: CommonTargetValue[] = [
    { title: '37d83fbg8954bf', imgClass: '', imgSource: '' },
    { title: '4g08bf7g6g89ec', imgClass: '', imgSource: '' },
    { title: '47g8534f87f3ee', imgClass: '', imgSource: '' },
    { title: 'bdeb95gaabab90', imgClass: '', imgSource: '' }
];
export const WidgetFilterList: CommonTargetValue[] = [
    { title: 'Widget A', imgClass: '', imgSource: '' },
    { title: 'Widget B', imgClass: '', imgSource: '' },
    { title: 'Widget C', imgClass: '', imgSource: '' },
    { title: 'Widget D', imgClass: '', imgSource: '' }
];
// temp

export const AccountTypeFilterList: CommonTargetValue[] = [
    { title: 'Personal', imgClass: '', imgSource: '' },
    { title: 'Merchant', imgClass: '', imgSource: '' }
];

export class PaymentInstrumentView {
    id!: PaymentInstrument;
    name: string = '';
}

export class PaymentProviderView {
    id!: PaymentProvider;
    name: string = '';
}

export class TransactionTypeView {
    id!: TransactionType;
    name: string = '';
}

export class TargetFilterTypeView {
    id!: FeeSettingsTargetFilterType;
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

export const PaymentProviderList: Array<PaymentProviderView> = [
    { id: PaymentProvider.Bank, name: 'Bank' },
    { id: PaymentProvider.Skrill, name: 'Skrill' },
    { id: PaymentProvider.Sofort, name: 'Sofort' },
    { id: PaymentProvider.Totalprocessing, name: 'Total processing' }
]

export const TransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Deposit, name: 'Deposit' },
    { id: TransactionType.Exchange, name: 'Exchange' },
    { id: TransactionType.System, name: 'System' },
    { id: TransactionType.Transfer, name: 'Transfer' },
    { id: TransactionType.Withdrawal, name: 'Withdrawal' }
]

export const TargetFilterList: Array<TargetFilterTypeView> = [
    { id: FeeSettingsTargetFilterType.AffiliateId, name: 'Affiliate identifier' },
    { id: FeeSettingsTargetFilterType.AccountId, name: 'Account identifier' },
    { id: FeeSettingsTargetFilterType.AccountType, name: 'Account type' },
    { id: FeeSettingsTargetFilterType.Country, name: 'Country' },
    { id: FeeSettingsTargetFilterType.InitiateFrom, name: 'Initiate from ...' }
]

export class FeeScheme {
    id!: string;
    isDefault: boolean = false;
    description!: string;
    name!: string;
    target: FeeSettingsTargetFilterType | null = null;
    targetValues: Array<string> = [];
    trxType: Array<TransactionType> = [];
    instrument: Array<PaymentInstrument> = [];
    provider: Array<PaymentProvider> = [];
    terms!: FeeShemeTerms;
    details!: FeeShemeWireDetails;

    constructor(data: SettingsFee | null) {
        if (data !== null) {
            this.name = data.name;
            this.id = data.settingsFeeId;
            this.isDefault = data.default as boolean;
            this.description = data.description as string;
            this.terms = new FeeShemeTerms(data.terms);
            this.details = new FeeShemeWireDetails(data.wireDetails);
            data.targetInstruments?.forEach(x => this.instrument.push(x as PaymentInstrument));
            data.targetPaymentProviders?.forEach(x => this.provider.push(x as PaymentProvider));
            data.targetTransactionTypes?.forEach(x => this.trxType.push(x as TransactionType));
            this.target = data.targetFilterType as FeeSettingsTargetFilterType | null;
            if (this.target === FeeSettingsTargetFilterType.Country) {
                data.targetFilterValues?.forEach(x => {
                    const c = getCountryByCode3(x);
                    if (c != null) {
                        this.targetValues.push(c.name);
                    }
                });
            } else {
                data.targetFilterValues?.forEach(x => this.targetValues.push(x));
            }
        } else {
            this.terms = new FeeShemeTerms('');
            this.details = new FeeShemeWireDetails('');
        }
    }

    setTarget(filter: FeeSettingsTargetFilterType, values: string[]): void {
        this.target = filter;
        values.forEach(x => {
            if (filter === FeeSettingsTargetFilterType.Country) {
                const c = getCountry(x);
                if (c !== null) {
                    this.targetValues.push(c.code3);
                }
            } else {
                this.targetValues.push(x);
            }
        });
    }

    get TargetName(): string {
        return TargetFilterList.find(x => x.id === this.target)?.name as string;
    }

    get TransactionTypeList(): string {
        let s = '';
        let p = false;
        this.trxType.forEach(x => {
            const v = TransactionTypeList.find(t => t.id === x)?.name as string;
            s = `${s}${p?', ':''}${v}`;
            p = true;
        })
        return s;
    }

    get InstrumentList(): string {
        let s = '';
        let p = false;
        this.instrument.forEach(x => {
            const v = PaymentInstrumentList.find(t => t.id === x)?.name as string;
            s = `${s}${p?', ':''}${v}`;
            p = true;
        })
        return s;
    }

    get ProviderList(): string {
        let s = '';
        let p = false;
        this.provider.forEach(x => {
            const v = PaymentProviderList.find(t => t.id === x)?.name as string;
            s = `${s}${p?', ':''}${v}`;
            p = true;
        })
        return s;
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
