import {
    PaymentInstrument, PaymentProvider, TransactionType,
    SettingsFeeTargetFilterType, SettingsCostTargetFilterType, SettingsKycTargetFilterType, UserType, KycProvider, UserMode, SettingsCurrency
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

export class UserTypeView {
    id!: UserType;
    name = '';
}

export class UserModeView {
    id!: UserMode;
    name = '';
}

export class KycProviderView {
    id!: KycProvider;
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

export class KycTargetFilterTypeView {
    id!: SettingsKycTargetFilterType;
    name = '';
}

export class KycLevelView {
    id!: string;
    name = '';
    description = '';
}

export class CurrencyView {
    id!: string;
    title = '';
    name = '';
    precision = 0;
    minAmount = 0;
    rateFactor = 0;
    validateAsSymbol: string | null = null;

    constructor(data: SettingsCurrency) {
        this.id = data.symbol;
        this.title = data.symbol;
        this.name = data.name;
        this.precision = data.precision;
        this.minAmount = data.minAmount;
        this.rateFactor = data.rateFactor;
        this.validateAsSymbol = data.validateAsSymbol as string | null;
    }
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

export const QuickCheckoutTransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Deposit, name: 'Deposit' },
    { id: TransactionType.Withdrawal, name: 'Withdrawal' }
];

export const FeeTargetFilterList: Array<FeeTargetFilterTypeView> = [
    { id: SettingsFeeTargetFilterType.None, name: 'None' },
    { id: SettingsFeeTargetFilterType.AffiliateId, name: 'Affiliate identifier' },
    { id: SettingsFeeTargetFilterType.AccountId, name: 'Account' },
    { id: SettingsFeeTargetFilterType.AccountType, name: 'Account type' },
    { id: SettingsFeeTargetFilterType.Country, name: 'Country' },
    { id: SettingsFeeTargetFilterType.InitiateFrom, name: 'Initiate from ...' }
];

export const CostTargetFilterList: Array<CostTargetFilterTypeView> = [
    { id: SettingsCostTargetFilterType.None, name: 'None' },
    { id: SettingsCostTargetFilterType.Country, name: 'Country' },
    { id: SettingsCostTargetFilterType.Psp, name: 'PSP' }
];

export const KycTargetFilterList: Array<KycTargetFilterTypeView> = [
    { id: SettingsKycTargetFilterType.None, name: 'None' },
    { id: SettingsKycTargetFilterType.Country, name: 'Country' },
    { id: SettingsKycTargetFilterType.AccountId, name: 'Account' }
];

export const UserTypeList: Array<UserTypeView> = [
    { id: UserType.Merchant, name: 'Merchant' },
    { id: UserType.Personal, name: 'Personal' }
];

export const UserModeList: Array<UserModeView> = [
    { id: UserMode.InternalWallet, name: 'Internal wallet' },
    { id: UserMode.ExternalWallet, name: 'External wallet' }
];

export const KycProviderList: Array<KycProviderView> = [
    { id: KycProvider.Local, name: 'Local' },
    { id: KycProvider.SumSub, name: 'SumSub' }
];

export class CheckoutSummary {
    initialized = false;
    orderId: string = '';
    email: string = '';
    currencyFrom: string = '';
    currencyTo: string = '';
    amountFrom: number = 0;
    amountTo: number = 0;
    address: string = '';
    fees: number = 0;
}
