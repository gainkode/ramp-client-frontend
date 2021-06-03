import {
    PaymentInstrument, PaymentProvider, TransactionType, TransactionStatus,
    SettingsFeeTargetFilterType, SettingsCostTargetFilterType, SettingsKycTargetFilterType,
    UserType, KycProvider, UserMode, SettingsCurrency, Rate, TransactionSource
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

export class TransactionSourceView {
    id!: TransactionSource;
    name = '';
}

export class TransactionStatusView {
    id!: TransactionStatus;
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

export class CardView {
    valid = false;
    cardNumber = '';
    cardType = '';
    monthExpired = 0;
    yearExpired = 0;
    cvv = 0;
    holderName = '';
    bankName = '';
    processor = '';
    bin = '';
    lastDigits = '';

    setPaymentInfo(info: string): void {
        if (info) {
            const data = JSON.parse(info);
            this.bankName = data.bankName;
            this.cardType = data.cardType.toLowerCase();
            this.monthExpired = data.cardExpMonth;
            this.yearExpired = data.cardExpYear;
            this.holderName = data.cardholderName;
            this.processor = data.processorName;
            this.bin = data.bin;
            this.lastDigits = data.lastFourDigits;
        }
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

export const QuickCheckoutPaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.Apm, name: 'APM' }
];

export const PaymentProviderList: Array<PaymentProviderView> = [
    { id: PaymentProvider.Bank, name: 'Bank' },
    { id: PaymentProvider.Fibonatix, name: 'Fibonatix' },
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

export const TransactionSourceList: Array<TransactionSourceView> = [
    { id: TransactionSource.QuickCheckout, name: 'Checkout' },
    { id: TransactionSource.Widget, name: 'Widget' },
    { id: TransactionSource.Wallet, name: 'Wallet' }
];

export const TransactionStatusList: Array<TransactionStatusView> = [
    { id: TransactionStatus.New, name: 'New' },
    { id: TransactionStatus.Pending, name: 'Pending' },
    { id: TransactionStatus.Processing, name: 'Processing' },
    { id: TransactionStatus.Paid, name: 'Paid' },
    { id: TransactionStatus.AddressDeclined, name: 'Address declined' },
    { id: TransactionStatus.PaymentDeclined, name: 'Payment declined' },
    { id: TransactionStatus.Sending, name: 'Sending' },
    { id: TransactionStatus.Sent, name: 'Sent' },
    { id: TransactionStatus.Completed, name: 'Completed' },
    { id: TransactionStatus.Abounded, name: 'Abounded' },
    { id: TransactionStatus.Canceled, name: 'Canceled' },
    { id: TransactionStatus.Chargeback, name: 'Chargeback' }
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
    { id: SettingsKycTargetFilterType.AffiliateId, name: 'Affiliate identifier' },
    { id: SettingsKycTargetFilterType.Country, name: 'Country' },
    { id: SettingsKycTargetFilterType.AccountId, name: 'Account' },
    { id: SettingsKycTargetFilterType.InitiateFrom, name: 'Initiate from ...' }
];

export const UserTypeList: Array<UserTypeView> = [
    { id: UserType.Merchant, name: 'Merchant' },
    { id: UserType.Personal, name: 'Personal' }
];

export const UserModeList: Array<UserModeView> = [
    { id: UserMode.InternalWallet, name: 'Internal wallet' },
    { id: UserMode.ExternalWallet, name: 'External wallet' },
    { id: UserMode.OneTimeWallet, name: 'One Time wallet' }
];

export const UserModeShortList: Array<UserModeView> = [
    { id: UserMode.InternalWallet, name: 'Internal' },
    { id: UserMode.ExternalWallet, name: 'External' },
    { id: UserMode.OneTimeWallet, name: 'One Time wallet' }
];

export const KycProviderList: Array<KycProviderView> = [
    { id: KycProvider.Local, name: 'Local' },
    { id: KycProvider.SumSub, name: 'SumSub' }
];

export class CheckoutSummary {
    orderId = '';
    email = '';
    currencyFrom = '';
    currencyTo = '';
    amountFrom = 0;
    amountTo = 0;
    address = '';
    fee = 0;
    feePercent = 0;
    feeMinEuro = 0;
    exchangeRate: Rate | null = null;
    transactionDate = '';
    transactionType: TransactionType = TransactionType.Deposit;
    status: TransactionStatus = TransactionStatus.Pending;
    card: CardView | null = null;

    reset(): void {
        this.orderId = '';
        this.email = '';
        this.currencyFrom = '';
        this.currencyTo = '';
        this.amountFrom = 0;
        this.amountTo = 0;
        this.address = '';
        this.fee = 0;
        this.feePercent = 0;
        this.feeMinEuro = 0;
        this.exchangeRate = null;
        this.transactionDate = '';
        this.transactionType = TransactionType.Deposit;
        this.status = TransactionStatus.Pending;
        this.card = null;
    }

    setPaymentInfo(info: string): void {
        if (info) {
            this.card = new CardView();
            this.card.setPaymentInfo(info);
        }
    }
}
