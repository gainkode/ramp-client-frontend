import { CommonTargetValue } from './common.model';
import { getCountry, getCountryByCode3 } from './country-code.model';
import {
	SettingsFee, PaymentInstrument, TransactionType, SettingsFeeTargetFilterType, UserType, UserMode, TransactionSource,
	RiskAlertCodes
} from './generated-models';
import {
	PaymentInstrumentList,
	FeeTargetFilterList, TransactionTypeList
} from './payment.model';

export const TransactionSourceFilterList: CommonTargetValue[] = [
	{ id: TransactionSource.Widget, title: 'Widget', imgClass: '', imgSource: '' },
	{ id: TransactionSource.Wallet, title: 'Wallet', imgClass: '', imgSource: '' },
	{ id: TransactionSource.QuickCheckout, title: 'Quick Checkout', imgClass: '', imgSource: '' }
];

export class FeeScheme {
	id!: string;
	isDefault = false;
	description!: string;
	name!: string;
	costSchemeName = '';
	target: SettingsFeeTargetFilterType | null = null;
	targetValues: Array<string> = [];
	trxType: Array<TransactionType> = [];
	instrument: Array<PaymentInstrument> = [];
	currenciesFrom: Array<string> = [];
	currenciesTo: Array<string> = [];
	userType: Array<UserType> = [];
	userMode: Array<UserMode> = [];
	provider: string[] = [];
	terms!: FeeShemeTerms;
	details!: FeeShemeWireDetails;
	currency!: string;
	rateToEur!: number;
	deleted?: Date;
	widgetIds?: string[];

	constructor(data: SettingsFee | null) {
		if (data !== null) {
			this.widgetIds = data.widgetIds;
			this.name = data.name;
			this.id = data.settingsFeeId;
			this.isDefault = data.default as boolean;
			this.description = data.description as string;
			this.terms = new FeeShemeTerms(data.terms);
			this.details = new FeeShemeWireDetails(data.wireDetails);
			this.currency = data.currency as string ?? 'euro';
			this.currenciesFrom = data.targetCurrenciesFrom as Array<string> ?? [];
			this.currenciesTo = data.targetCurrenciesTo as Array<string> ?? [];
			this.rateToEur = data.rateToEur as number;
			this.deleted = data?.deleted;
			data.targetInstruments?.forEach(x => this.instrument.push(x as PaymentInstrument));
			data.targetPaymentProviders?.forEach(x => this.provider.push(x));
			data.targetTransactionTypes?.forEach(x => this.trxType.push(x as TransactionType));
			data.targetUserTypes?.forEach(x => this.userType.push(x as UserType));
			data.targetUserModes?.forEach(x => this.userMode.push(x as UserMode));
			this.target = data.targetFilterType as SettingsFeeTargetFilterType | null;
			if (this.target === SettingsFeeTargetFilterType.Country) {
				data.targetFilterValues?.forEach(x => {
					const c = getCountryByCode3(x);
					if (c != null) {
						this.targetValues.push(c.code3);
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

	setTarget(filter: SettingsFeeTargetFilterType, values: CommonTargetValue[]): void {
		this.target = filter;
		this.targetValues = values?.map(x => x.id);
	}

	setWidgets(values: CommonTargetValue[]): void {
		this.widgetIds = values?.map(x => x.id);
	}

	setTargetOld(filter: SettingsFeeTargetFilterType, values: string[]): void {
		this.target = filter;
		values.forEach(x => {
			if (filter === SettingsFeeTargetFilterType.Country) {
				const c = getCountry(x);
				if (c !== null) {
					this.targetValues.push(c.code3);
				}
			} else {
				this.targetValues.push(x);
			}
		});
	}

	setCostSchemeName(schemeName: string): void {
		if (this.instrument.length > 0) {
			if (this.instrument[0] === PaymentInstrument.WireTransfer) {
				this.costSchemeName = schemeName;
			}
		}
	}

	get targetName(): string {
		return FeeTargetFilterList.find(x => x.id === this.target)?.name as string;
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
		let result = '';
		if (this.instrument.length > 0) {
			if (this.instrument[0] === PaymentInstrument.WireTransfer) {
				result = this.costSchemeName;
			}
		}
		if (result === '') {
			result = this.provider.join(', ');
		}
		return result;
	}

	get feeSchemasListDataColumnStyle(): string[] {
		return [
			`fee-schemas-list-column-${this.getColorStyles()}`
		];
	}

	private getColorStyles(): string {
		return this.deleted ? 'grey' : 'white';
	}
}

export interface RiskFeeCode {
	riskCode: RiskAlertCodes;
	feePercent: number;
	selected?: boolean;
}

export class FeeShemeTerms {
	transactionFees!: number;
	minTransactionFee!: number;
	rollingReserves!: number;
	rollingReservesDays!: number;
	chargebackFees!: number;
	monthlyFees!: number;
	minMonthlyFees!: number;
	riskFees: RiskFeeCode[];

	constructor(data: string) {
		if (data !== '') {
			const terms = JSON.parse(data);

			this.transactionFees = terms.Transaction_fee;
			this.minTransactionFee = terms.Min_transaction_fee;
			this.rollingReserves = terms.Rolling_reserves;
			this.rollingReservesDays = terms.Rolling_reserves_days;
			this.chargebackFees = terms.Chargeback_fees;
			this.monthlyFees = terms.Monthly_fees;
			this.minMonthlyFees = terms.Min_monthly_fees;
			this.minMonthlyFees = terms.Min_monthly_fees;
			this.riskFees = terms.Risk_fees;
		}
	}

	getObject(): string {
		return JSON.stringify({
			Transaction_fee: this.transactionFees,
			Min_transaction_fee: this.minTransactionFee,
			Rolling_reserves: this.rollingReserves,
			Rolling_reserves_days: this.rollingReservesDays,
			Chargeback_fees: this.chargebackFees,
			Monthly_fees: this.monthlyFees,
			Min_monthly_fees: this.minMonthlyFees,
			Risk_fees: this.riskFees,
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
