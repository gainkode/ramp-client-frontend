import { getCryptoSymbol } from '../utils/utils';
import { CommonTargetValue } from './common.model';
import {
    PaymentInstrument, PaymentProvider, TransactionType, TransactionStatus,
    SettingsFeeTargetFilterType, SettingsCostTargetFilterType, SettingsKycTargetFilterType,
    UserType, KycProvider, UserMode, SettingsCurrency, Rate, TransactionSource, UserNotificationCodes, CustodyProvider, TransactionKycStatus, RiskLevel, PaymentProviderByInstrument
} from './generated-models';

export class PaymentInstrumentView {
    id!: PaymentInstrument;
    name = '';
}

export class PaymentProviderInstrumentView {
    id = '';
    name = '';
    image = '';
    instrument: PaymentInstrument = PaymentInstrument.CreditCard;

    constructor(data: PaymentProviderByInstrument) {
        this.id = data.provider?.name ?? '';
        this.name = data.provider?.name ?? '';
        this.instrument = data.instrument ?? PaymentInstrument.CreditCard;
        if (this.instrument === PaymentInstrument.Apm) {
            this.name = 'APM';
            this.image = './assets/svg-providers/bank-payment.svg';
        } else if (this.instrument === PaymentInstrument.CreditCard) {
            this.name = 'CARD PAYMENT';
            this.image = './assets/svg-providers/credit-card.svg';
        } else if (this.instrument === PaymentInstrument.WireTransfer) {
            this.name = 'WIRE TRANSFER';
            this.image = './assets/svg-providers/bank-payment.svg';
        }
    }
}

export class PaymentProviderView {
    id = '';
    name = '';
    image = '';

    constructor(data: PaymentProvider) {
        this.id = data.name ?? '';
        this.name = data.name ?? '';
        if (this.id === 'Fibonatix') {
            this.image = './assets/svg-providers/fibonatix.svg';
        } else if (this.id === 'InstantPay') {
            this.image = './assets/svg-providers/instantpay.png';
        } else if (this.id === 'Sofort') {
            this.image = './assets/svg-providers/klarna.svg';
        }
    }
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

export class TransactionKycStatusView {
    id!: TransactionKycStatus;
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

export class RiskLevelView {
    id!: RiskLevel;
    name = '';
}

export class CustodyProviderView {
    id!: CustodyProvider;
    name = '';
}

export class UserNotificationCodeView {
    id!: UserNotificationCodes;
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
    id = '';
    title = '';
    name = '';
    img = '';
    precision = 0;
    minAmount = 0;
    rateFactor = 0;
    validateAsSymbol: string | null = null;
    fiat = false;

    constructor(data: SettingsCurrency) {
        this.id = data.symbol;
        this.title = data.symbol;
        this.name = data.name;
        this.precision = data.precision;
        this.minAmount = data.minAmount;
        this.rateFactor = data.rateFactor;
        this.validateAsSymbol = data.validateAsSymbol as string | null;
        this.fiat = data.fiat as boolean;
        if (!this.fiat) {
            this.img = `assets/svg-crypto/${getCryptoSymbol(data.symbol).toLowerCase()}.svg`;
        }
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
    cardInfo: CommonTargetValue | null = null;

    setPaymentInfo(info: string): void {
        if (info) {
            const data = JSON.parse(info);
            this.bankName = data.bankName;
            this.cardType = (data.cardType) ? data.cardType.toLowerCase() : '';
            this.monthExpired = parseInt(data.cardExpMonth, 10);
            this.yearExpired = parseInt(data.cardExpYear, 10);
            this.holderName = (data.cardholderName) ? (data.cardholderName as string).toUpperCase() : '';
            this.processor = data.processorName;
            this.bin = data.bin;
            this.lastDigits = data.lastFourDigits;
            if (this.cardType !== '') {
                this.cardInfo = new CommonTargetValue();
                this.cardInfo.imgClass = '__table-cell-payment-icon';
                this.cardInfo.imgSource = `assets/svg-payment-systems/${this.cardType.toLowerCase()}.svg`;
                this.cardInfo.title = this.cardType;
            }
        }
    }

    get cardExpired(): string {
        return `${this.monthExpired < 10 ? '0' : ''}${this.monthExpired}/${this.yearExpired}`;
    }

    get secureCardNumber(): string {
        return `${this.bin.substr(0, 4)} **** **** ${this.lastDigits}`;
    }
}

export const PaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.Apm, name: 'APM' },
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.WireTransfer, name: 'Wire transfer' }
];

export const QuickCheckoutPaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.Apm, name: 'APM' }
];

export const TransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Deposit, name: 'Buy' },
    { id: TransactionType.Exchange, name: 'Swap' },
    { id: TransactionType.System, name: 'System' },
    { id: TransactionType.Transfer, name: 'Send' },
    { id: TransactionType.Withdrawal, name: 'Sell' }
];

export const UserTransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Deposit, name: 'Buy' },
    { id: TransactionType.Exchange, name: 'Swap' },
    { id: TransactionType.Transfer, name: 'Send' },
    { id: TransactionType.Withdrawal, name: 'Sell' }
];

export const QuickCheckoutTransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Deposit, name: 'Buy' },
    { id: TransactionType.Withdrawal, name: 'Sell' }
];

export const TransactionSourceList: Array<TransactionSourceView> = [
    { id: TransactionSource.Widget, name: 'Widget' },
    { id: TransactionSource.Wallet, name: 'Wallet' },
    { id: TransactionSource.QuickCheckout, name: 'Quick Checkout' }
];

export const TransactionStatusList: Array<TransactionStatusView> = [
    { id: TransactionStatus.New, name: 'New' },
    { id: TransactionStatus.Pending, name: 'Pending' },
    { id: TransactionStatus.Processing, name: 'Processing' },
    { id: TransactionStatus.Paid, name: 'Paid' },
    { id: TransactionStatus.AddressDeclined, name: 'Address declined' },
    { id: TransactionStatus.PaymentDeclined, name: 'Payment declined' },
    { id: TransactionStatus.ExchangeDeclined, name: 'Exchange Declined' },
    { id: TransactionStatus.TransferDeclined, name: 'Transfer Declined' },
    { id: TransactionStatus.Exchanging, name: 'Exchanging' },
    { id: TransactionStatus.Exchanged, name: 'Exchanged' },
    { id: TransactionStatus.TransferBenchmarkWaiting, name: 'Transfer benchmark waiting' },
    { id: TransactionStatus.BenchmarkTransfered, name: 'Benchmark transfered' },
    { id: TransactionStatus.BenchmarkTransfering, name: 'Benchmark transfering' },
    { id: TransactionStatus.Sending, name: 'Sending' },
    { id: TransactionStatus.Sent, name: 'Sent' },
    { id: TransactionStatus.Completed, name: 'Completed' },
    { id: TransactionStatus.Abandoned, name: 'Abandoned' },
    { id: TransactionStatus.Canceled, name: 'Canceled' },
    { id: TransactionStatus.Chargeback, name: 'Chargeback' }
];

export const TransactionKycStatusList: Array<TransactionKycStatusView> = [
    { id: TransactionKycStatus.KycWaiting, name: 'Waiting' },
    { id: TransactionKycStatus.KycApproved, name: 'Approved' },
    { id: TransactionKycStatus.KycRejected, name: 'Rejected' }
];

export const FeeTargetFilterList: Array<FeeTargetFilterTypeView> = [
    { id: SettingsFeeTargetFilterType.None, name: 'None' },
    { id: SettingsFeeTargetFilterType.WidgetId, name: 'Widget identifier' },
    { id: SettingsFeeTargetFilterType.AccountId, name: 'Account' },
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
    { id: SettingsKycTargetFilterType.WidgetId, name: 'Widget identifier' },
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

export const RiskLevelViewList: Array<RiskLevelView> = [
    { id: RiskLevel.Low, name: 'Low' },
    { id: RiskLevel.Medium, name: 'Medium' },
    { id: RiskLevel.High, name: 'High' }
];

export const CustodyProviderList: Array<CustodyProviderView> = [
    { id: CustodyProvider.Fireblocks, name: 'Fireblocks' },
    { id: CustodyProvider.Trustology, name: 'Trustology' }
];

export const UserNotificationCodeList: Array<UserNotificationCodeView> = [
    { id: UserNotificationCodes.KycStatusChanged, name: 'KYC Status Changed' },
    { id: UserNotificationCodes.TestNotification, name: 'Test' },
    { id: UserNotificationCodes.TransactionConfirmation, name: 'Transaction Confirmed' },
    { id: UserNotificationCodes.TransactionStatusChanged, name: 'Transaction Status Changed' },
    { id: UserNotificationCodes.TransactionDeclinedAdminNotification, name: 'Transaction Declined' },
    { id: UserNotificationCodes.AdminToUserNotification, name: 'Administrator Request' },
    { id: UserNotificationCodes.AskTransactionRedo, name: 'Transaction Redo Request' }
];

export class CheckoutSummary {
    initialized = false;
    orderId = '';
    email = '';
    agreementChecked = false;
    currencyFrom = '';
    currencyTo = '';
    amountFrom: number | undefined = undefined;
    amountTo: number | undefined = undefined;
    amountFromPrecision: number = 2;
    amountToPrecision: number = 2;
    address = '';
    addressPreset = false;
    fee = 0;
    feePercent = 0;
    feeMinFiat = 0;
    networkFee = 0;
    exchangeRate: Rate | undefined = undefined;
    transactionDate = '';
    transactionType: TransactionType = TransactionType.Deposit;
    transactionId = '';
    vaultId = '';
    status: TransactionStatus = TransactionStatus.Pending;
    card: CardView | undefined = undefined;
    provider: PaymentProvider | undefined = undefined;  // deprecated
    providerView: PaymentProviderView | undefined = undefined;
    instrument: PaymentInstrument | undefined = undefined;
    quoteLimit = 0;

    get isFromCrypto(): boolean {
        let result = false;
        switch (this.transactionType) {
            case TransactionType.Withdrawal:
                result = true;
        }
        return result;
    }

    get isToCrypto(): boolean {
        let result = false;
        switch (this.transactionType) {
            case TransactionType.Deposit:
                result = true;
        }
        return result;
    }

    get transactionFee(): string {
        const val = this.fee;
        if (val !== 0) {
            return `${val}`;
        } else {
            return '';
        }
    }

    get transactionFeeTitle(): string {
        const feeMinFiat = this.feeMinFiat as number;
        const feePercent = this.feePercent as number;
        return `Transaction fee (${feePercent}%, min ${feeMinFiat} ${this.transactionFeeCurrency})`;
    }

    get transactionFeeCurrency(): string {
        let result = '';
        if (this.isFromCrypto) {
            result = this.currencyTo;
        } else {
            result = this.currencyFrom as string;
        }
        return result;
    }

    get networkFeeCurrency(): string {
        let result = '';
        if (this.isFromCrypto) {
            result = this.currencyFrom;
        } else {
            result = this.currencyTo as string;
        }
        return result;
    }

    get rate(): string {
        let result = '';
        switch (this.transactionType) {
            case TransactionType.Deposit:
                if (this.exchangeRate?.depositRate) {
                    result = (this.exchangeRate.depositRate > 0) ? this.exchangeRate.depositRate.toString() : '';
                }
                break;
            case TransactionType.Withdrawal:
                if (this.exchangeRate?.withdrawRate) {
                    result = (this.exchangeRate.withdrawRate > 0) ? this.exchangeRate.withdrawRate.toString() : '';
                }
                break;
        }
        return result;
    }

    get transaction(): string {
        return TransactionTypeList.find(x => x.id === this.transactionType)?.name ?? '';
    }

    get validAmounts(): boolean {
        const validFrom = (this.amountFrom) ? (this.amountFrom > 0) : false;
        const validTo = (this.amountTo) ? (this.amountTo > 0) : false;
        return validFrom && validTo;
    }

    reset(): void {
        this.orderId = '';
        this.email = '';
        this.currencyFrom = '';
        this.currencyTo = '';
        this.amountFrom = undefined;
        this.amountTo = undefined;
        this.address = '';
        this.fee = 0;
        this.feePercent = 0;
        this.feeMinFiat = 0;
        this.networkFee = 0;
        this.exchangeRate = undefined;
        this.transactionDate = '';
        this.transactionType = TransactionType.Deposit;
        this.transactionId = '';
        this.status = TransactionStatus.Pending;
        this.provider = undefined;
        this.providerView = undefined;
        this.instrument = undefined;
        this.card = undefined;
        this.quoteLimit = 0;
    }

    setPaymentInfo(instrument: PaymentInstrument, info: string): void {
        if (info) {
            if (instrument === PaymentInstrument.CreditCard) {
                this.card = new CardView();
                if (info) {
                    this.card.setPaymentInfo(info);
                }
            }
        }
    }
}
