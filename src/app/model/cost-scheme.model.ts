import { CommonTargetValue } from './common.model';
import { getCountry, getCountryByCode3 } from './country-code.model';
import {
    SettingsCost, PaymentInstrument, TransactionType, SettingsCostTargetFilterType, WireTransferBankAccount
} from './generated-models';
import {
    PaymentInstrumentList, CostTargetFilterList, TransactionTypeList
} from './payment.model';

// temp
export const PspFilterList: CommonTargetValue[] = [
    { title: 'psp 1', imgClass: '', imgSource: '', id: '' },
    { title: 'psp 2', imgClass: '', imgSource: '', id: '' },
    { title: 'psp 3', imgClass: '', imgSource: '', id: '' },
    { title: 'psp 4', imgClass: '', imgSource: '', id: '' }
];
// temp

export class CostScheme {
    id!: string;
    isDefault = false;
    description!: string;
    name!: string;
    bankAccountIds: string[] = [];
    target: SettingsCostTargetFilterType | null = null;
    targetValues: Array<string> = [];
    trxType: Array<TransactionType> = [];
    instrument: Array<PaymentInstrument> = [];
    provider: string[] = [];
    terms!: CostShemeTerms;

    constructor(data: SettingsCost | null) {
        if (data !== null) {
            this.name = data.name;
            this.id = data.settingsCostId;
            this.isDefault = data.default as boolean;
            this.description = data.description as string;
            this.bankAccountIds = data.bankAccounts?.map(a => a.bankAccountId) ?? [];
            this.terms = new CostShemeTerms(data.terms ?? '');
            data.targetInstruments?.forEach(x => this.instrument.push(x as PaymentInstrument));
            data.targetPaymentProviders?.forEach(x => this.provider.push(x));
            data.targetTransactionTypes?.forEach(x => this.trxType.push(x as TransactionType));
            this.target = data.targetFilterType as SettingsCostTargetFilterType | null;
            if (this.target === SettingsCostTargetFilterType.Country) {
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

    setTarget(filter: SettingsCostTargetFilterType, values: string[]): void {
        this.target = filter;
        values.forEach(x => {
            if (filter === SettingsCostTargetFilterType.Country) {
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
        });
        return s;
    }

    get instrumentList(): string {
        let s = '';
        let p = false;
        this.instrument.forEach(x => {
            const v = PaymentInstrumentList.find(t => t.id === x)?.name as string;
            s = `${s}${p ? ', ' : ''}${v}`;
            p = true;
        });
        return s;
    }

    get providerList(): string {
        let s = '';
        let p = false;
        this.provider.forEach(x => {
            s = `${s}${p ? ', ' : ''}${x}`;
            p = true;
        });
        return s;
    }
}

export class CostShemeTerms {
    mdr!: number;
    transactionCost!: number;
    rollingReserves!: number;
    rollingReservesDays!: number;
    chargebackCost!: number;
    monthlyCost!: number;
    minMonthlyCost!: number;

    constructor(data: string) {
        if (data !== '') {
            const terms = JSON.parse(data);
            this.mdr = terms.MDR;
            this.transactionCost = terms.Per_transaction_cost;
            this.rollingReserves = terms.Rolling_reserves;
            this.rollingReservesDays = terms.Rolling_reserves_days;
            this.chargebackCost = terms.Chargeback_cost;
            this.monthlyCost = terms.Monthly_cost;
            this.minMonthlyCost = terms.Min_monthly_cost;
        }
    }

    getObject(): string {
        return JSON.stringify({
            Per_transaction_cost: this.transactionCost,
            MDR: this.mdr,
            Rolling_reserves: this.rollingReserves,
            Rolling_reserves_days: this.rollingReservesDays,
            Chargeback_cost: this.chargebackCost,
            Monthly_cost: this.monthlyCost,
            Min_monthly_cost: this.minMonthlyCost
        });
    }
}

export class WireTransferBankAccountItem {
    id = '';
    name = '';
    description = '';

    au: WireTransferBankAccountAu | undefined = undefined;
    uk: WireTransferBankAccountUk | undefined = undefined;
    eu: WireTransferBankAccountEu | undefined = undefined;

    get auAvailable(): boolean {
        return (this.au !== undefined);
    }

    get ukAvailable(): boolean {
        return (this.uk !== undefined);
    }

    get euAvailable(): boolean {
        return (this.eu !== undefined);
    }
    
    get auData(): string | undefined {
        return (this.au) ? JSON.stringify(this.au) : undefined;
    }

    get ukData(): string | undefined {
        return (this.uk) ? JSON.stringify(this.uk) : undefined;
    }

    get euData(): string | undefined {
        return (this.eu) ? JSON.stringify(this.eu) : undefined;
    }

    constructor(data: WireTransferBankAccount | undefined) {
        if (data) {
            this.id = data.bankAccountId;
            this.name = data.name ?? '';
            this.description = data.description ?? '';
            if (data.au) {
                this.au = JSON.parse(data.au) ?? undefined;
            }
            if (data.uk) {
                this.uk = JSON.parse(data.uk) ?? undefined;
            }
            if (data.eu) {
                this.eu = JSON.parse(data.eu) ?? undefined;
            }
        } else {
            this.id = '';
            this.name = '';
            this.description = '';
        }
    }
}

export class WireTransferBankAccountAu {
    accountName = '';
    accountNumber = '';
    bsb = '';
}

export class WireTransferBankAccountUk {
    accountName = '';
    accountNumber = '';
    sortCode = '';
}

export class WireTransferBankAccountEu {
    accountOwnerName = '';
    swift = '';
    iban = '';
}