import {
    PaymentInstrument, PaymentProvider, TransactionType, FeeSettingsTargetFilterType
} from "./generated-models";

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

