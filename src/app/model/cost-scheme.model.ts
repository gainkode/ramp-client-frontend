import { CommonTargetValue } from "./common.model";
import { CountryCodes, getCountry, getCountryByCode3 } from "./country-code.model";
import {
    SettingsCost, PaymentInstrument, PaymentProvider, TransactionType, CostSettingsFilterType
} from "./generated-models";
import {
    PaymentInstrumentList, PaymentProviderList,
    CostTargetFilterList, TransactionTypeList
} from './payment.model';

export const CountryFilterList: CommonTargetValue[] = CountryCodes.map(c => {
    let item = new CommonTargetValue();
    item.imgClass = "country-flag";
    item.imgSource = `assets/svg-country-flags/${c.code2.toLowerCase()}.svg`;
    item.title = c.name;
    return item;
});

// temp
export const PspFilterList: CommonTargetValue[] = [
    { title: 'psp 1', imgClass: '', imgSource: '' },
    { title: 'psp 2', imgClass: '', imgSource: '' },
    { title: 'psp 3', imgClass: '', imgSource: '' },
    { title: 'psp 4', imgClass: '', imgSource: '' }
];
// temp

export class CostScheme {
    id!: string;
    isDefault: boolean = false;
    description!: string;
    name!: string;
    target: CostSettingsFilterType | null = null;
    targetValues: Array<string> = [];
    trxType: Array<TransactionType> = [];
    instrument: Array<PaymentInstrument> = [];
    provider: Array<PaymentProvider> = [];
    terms!: CostShemeTerms;

    constructor(data: SettingsCost | null) {
        if (data !== null) {
            this.name = data.name;
            this.id = data.settingsCostId;
            this.isDefault = data.default as boolean;
            this.description = data.description as string;
            this.terms = new CostShemeTerms(data.terms);
            data.targetInstruments?.forEach(x => this.instrument.push(x as PaymentInstrument));
            data.targetPaymentProviders?.forEach(x => this.provider.push(x as PaymentProvider));
            data.targetTransactionTypes?.forEach(x => this.trxType.push(x as TransactionType));
            this.target = data.targetFilterType as CostSettingsFilterType | null;
            if (this.target === CostSettingsFilterType.Country) {
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
            this.terms = new CostShemeTerms('');
        }
    }

    setTarget(filter: CostSettingsFilterType, values: string[]): void {
        this.target = filter;
        values.forEach(x => {
            if (filter === CostSettingsFilterType.Country) {
                const c = getCountry(x);
                if (c !== null) {
                    this.targetValues.push(c.code3);
                }
            } else {
                this.targetValues.push(x);
            }
        });
    }

    get targetName(): string {
        return CostTargetFilterList.find(x => x.id === this.target)?.name as string;
    }

    get transactionTypeList(): string {
        let s = '';
        let p = false;
        this.trxType.forEach(x => {
            const v = TransactionTypeList.find(t => t.id === x)?.name as string;
            s = `${s}${p ? ', ' : ''}${v}`;
            p = true;
        })
        return s;
    }

    get instrumentList(): string {
        let s = '';
        let p = false;
        this.instrument.forEach(x => {
            const v = PaymentInstrumentList.find(t => t.id === x)?.name as string;
            s = `${s}${p ? ', ' : ''}${v}`;
            p = true;
        })
        return s;
    }

    get providerList(): string {
        let s = '';
        let p = false;
        this.provider.forEach(x => {
            const v = PaymentProviderList.find(t => t.id === x)?.name as string;
            s = `${s}${p ? ', ' : ''}${v}`;
            p = true;
        })
        return s;
    }
}

export class CostShemeTerms {
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
