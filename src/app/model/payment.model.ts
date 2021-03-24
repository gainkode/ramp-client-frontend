import {
    PaymentInstrument, PaymentProvider, TransactionType, SettingsFeeTargetFilterType, SettingsCostTargetFilterType
} from './generated-models';

export class PaymentInstrumentView {
    id!: PaymentInstrument;
    name = '';
}

export class PaymentProviderView {
    id!: PaymentProvider;
    name = '';
}

export class TransactionTypeView {
    id!: TransactionType;
    name = '';
}

export class FeeTargetFilterTypeView {
    id!: SettingsFeeTargetFilterType;
    name = '';
}

export class CostTargetFilterTypeView {
    id!: SettingsCostTargetFilterType;
    name = '';
}

export const PaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.Apm, name: 'APM' },
    { id: PaymentInstrument.Bitstamp, name: 'Bitstamp' },
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.Received, name: 'Received' },
    { id: PaymentInstrument.Send, name: 'Send' },
    { id: PaymentInstrument.WireTransfer, name: 'Wire transfer' }
];

export const PaymentProviderList: Array<PaymentProviderView> = [
    { id: PaymentProvider.Bank, name: 'Bank' },
    { id: PaymentProvider.Skrill, name: 'Skrill' },
    { id: PaymentProvider.Sofort, name: 'Sofort' },
    { id: PaymentProvider.Totalprocessing, name: 'Total processing' }
];

export const TransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Deposit, name: 'Deposit' },
    { id: TransactionType.Exchange, name: 'Exchange' },
    { id: TransactionType.System, name: 'System' },
    { id: TransactionType.Transfer, name: 'Transfer' },
    { id: TransactionType.Withdrawal, name: 'Withdrawal' }
];

export const FeeTargetFilterList: Array<FeeTargetFilterTypeView> = [
    { id: SettingsFeeTargetFilterType.AffiliateId, name: 'Affiliate identifier' },
    { id: SettingsFeeTargetFilterType.AccountId, name: 'Account identifier' },
    { id: SettingsFeeTargetFilterType.AccountType, name: 'Account type' },
    { id: SettingsFeeTargetFilterType.Country, name: 'Country' },
    { id: SettingsFeeTargetFilterType.InitiateFrom, name: 'Initiate from ...' }
];

export const CostTargetFilterList: Array<CostTargetFilterTypeView> = [
    { id: SettingsCostTargetFilterType.Country, name: 'Country' },
    { id: SettingsCostTargetFilterType.Psp, name: 'PSP' }
];
