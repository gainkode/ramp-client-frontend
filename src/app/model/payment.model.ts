import { E } from '@angular/cdk/keycodes';
import { EnvService } from '../services/env.service';
import { getCryptoSymbol } from '../utils/utils';
import { CommonTargetValue } from './common.model';
import {
    PaymentInstrument, PaymentProvider, TransactionType, TransactionStatus,
    SettingsFeeTargetFilterType, SettingsCostTargetFilterType, SettingsKycTargetFilterType,
    UserType, KycProvider, UserMode, SettingsCurrency, Rate, TransactionSource, UserNotificationCodes, CustodyProvider, TransactionKycStatus, RiskLevel, PaymentProviderByInstrument, AccountStatus, KycStatus, AdminTransactionStatus, UserTransactionStatus, CryptoInvoice, CryptoInvoiceCreationResult, UserAction, UserActionType, UserActionResult
} from './generated-models';
import { WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from './payment-base.model';

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
            this.name = data.provider?.displayName ?? 'APM';
            if (data.provider?.logo) {
                this.image = `${EnvService.image_host}/apm/${data.provider.logo}`;
            } else {
                this.image = './assets/svg-providers/apm.svg';
            }
        } else if (this.instrument === PaymentInstrument.CreditCard) {
            this.name = 'CARD PAYMENT';
            this.image = './assets/svg-providers/credit-card.svg';
        } else if (this.instrument === PaymentInstrument.WireTransfer) {
            //this.id = 'WireTransferPayment';
            this.name = data.provider?.displayName ?? 'WIRE TRANSFER';
            this.image = './assets/svg-providers/wire-transfer.svg';
        } else if (this.instrument === PaymentInstrument.FiatVault) {
            //this.id = 'WireTransferPayment';
            this.name = 'FIAT VAULT';
            this.image = './assets/svg-providers/fiat-vault.png';
        }
    }
}

export class PaymentProviderView {
    id = '';
    name = '';
    instruments: string[] = [];

    constructor(data: PaymentProvider) {
        this.id = data.name ?? '';
        this.name = data.name ?? '';
        this.instruments = data.instruments?.map(val => val) ?? [];
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

export class UserTransactionStatusView {
    id!: UserTransactionStatus;
    name = '';
}

export class AdminTransactionStatusView {
    id!: AdminTransactionStatus;
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

export class UserActionTypeView {
    id!: UserActionType;
    name = '';
}

export class UserActionResultView {
    id!: UserActionResult;
    name = '';
}

export class AccountStatusView {
    id!: AccountStatus;
    name = '';
}

export class KycStatusView {
    id!: KycStatus;
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
    symbol = '';
    display = '';
    code = '';
    name = '';
    img = '';
    precision = 0;
    minAmount = 0;
    rateFactor = 0;
    validateAsSymbol: string | null = null;
    fiat = false;
    ethFlag = false;
    trxFlag = false;
    stable = false;

    get fullName(): string {
        if (this.stable) {
            return this.display;
        } else {
            return `${this.code} - ${this.name}`;
        }
    }

    constructor(data: SettingsCurrency) {
        this.symbol = data.symbol;
        this.ethFlag = data.ethFlag ?? false;
        this.trxFlag = data.trxFlag ?? false;
        this.code = data.symbol;
        if (data.displaySymbol) {
            this.code = data.displaySymbol;
        }
        if (this.ethFlag) {
            this.stable = true;
            this.display = `${this.code} (ERC20)`;
        } else if (this.trxFlag) {
            this.stable = true;
            this.display = `${this.code} (TRC20)`;
        } else {
            this.display = this.code;
        }
        this.name = data.name ?? '';
        this.precision = data.precision;
        this.minAmount = data.minAmount;
        this.rateFactor = data.rateFactor;
        this.validateAsSymbol = data.validateAsSymbol as string | null;
        this.fiat = data.fiat as boolean;
        if (!this.fiat) {
            this.img = `assets/svg-crypto/${getCryptoSymbol(this.code).toLowerCase()}.svg`;
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

export class InvoiceView {
    id = '';
    invoiceId = '';
    restAmount = 0;
    walletAddress = '';
    amountSource = 0;
    amountConverted = 0;

    get amountConvertedValue(): string {
        return `${this.amountConverted} ${this.currencyConverted}`;
    }

    get amountSourceValue(): string {
        return `${this.amountSource} ${this.currencySource}`;
    }

    private currencyConverted = '';
    private currencySource = '';

    constructor(data: CryptoInvoiceCreationResult) {
        this.id = data.invoice?.name ?? '';
        this.invoiceId = data.invoice?.cryptoInvoiceId ?? '';
        this.walletAddress = data.invoice?.destination ?? '';
        this.amountSource = data.invoice?.amountToSend ?? 0;
        this.currencySource = data.invoice?.currencyToSend ?? '';
        this.amountConverted = data.convertedAmount ?? 0;
        this.currencyConverted = data.convertedCurrency ?? '';
    }
}

export const PaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.Apm, name: 'APM' },
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.WireTransfer, name: 'Wire transfer' },
    { id: PaymentInstrument.FiatVault, name: 'Fiat vault' },
    { id: PaymentInstrument.CryptoVault, name: 'Crypto vault' }
];

export const WireTransferPaymentCategoryList: Array<WireTransferPaymentCategoryItem> = [
    { id: WireTransferPaymentCategory.AU, bankAccountId: '', title: 'Australian Bank', data: '' },
    { id: WireTransferPaymentCategory.UK, bankAccountId: '', title: 'UK Bank', data: '' },
    { id: WireTransferPaymentCategory.EU, bankAccountId: '', title: 'SEPA / SWIFT', data: '' },
    { id: WireTransferPaymentCategory.OPENPAYD, bankAccountId: '', title: 'Openpayd', data: ''},
    { id: WireTransferPaymentCategory.MONOOVA, bankAccountId: '', title: 'Monoova', data: ''},
    { id: WireTransferPaymentCategory.PRIMETRUST, bankAccountId: '', title: 'PrimeTrust', data: ''},
    { id: WireTransferPaymentCategory.FLASHFX, bankAccountId: '', title: 'Flashfx', data: ''}
];

export const QuickCheckoutPaymentInstrumentList: Array<PaymentInstrumentView> = [
    { id: PaymentInstrument.CreditCard, name: 'Credit card' },
    { id: PaymentInstrument.Apm, name: 'APM' }
];

export const TransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Buy, name: 'Buy' },
    { id: TransactionType.Exchange, name: 'Swap' },
    { id: TransactionType.System, name: 'System' },
    { id: TransactionType.Receive, name: 'Receive' },
    { id: TransactionType.Transfer, name: 'Send' },
    { id: TransactionType.Sell, name: 'Sell' },
    { id: TransactionType.Deposit, name: 'Deposit' },
    { id: TransactionType.Withdrawal, name: 'Withdrawal' },
    { id: TransactionType.MerchantBuy, name: 'Merchant Buy' },
    { id: TransactionType.MerchantSell, name: 'Merchant Sell' }
];

export const UserTransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Buy, name: 'Buy' },
    { id: TransactionType.Exchange, name: 'Swap' },
    { id: TransactionType.Transfer, name: 'Send' },
    { id: TransactionType.Sell, name: 'Sell' },
    { id: TransactionType.Receive, name: 'Receive' }
];

export const MerchantTransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Buy, name: 'Buy' },
    { id: TransactionType.Exchange, name: 'Swap' },
    { id: TransactionType.Transfer, name: 'Send' },
    { id: TransactionType.Sell, name: 'Sell' },
    { id: TransactionType.Receive, name: 'Receive' },
    { id: TransactionType.Deposit, name: 'Deposit' },
    { id: TransactionType.Withdrawal, name: 'Withdrawal' },
    { id: TransactionType.MerchantBuy, name: 'Merchant Buy' },
    { id: TransactionType.MerchantSell, name: 'Merchant Sell' }
];

export const QuickCheckoutTransactionTypeList: Array<TransactionTypeView> = [
    { id: TransactionType.Buy, name: 'Buy' },
    { id: TransactionType.Sell, name: 'Sell' }
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
    { id: TransactionStatus.ExchangeDeclined, name: 'Exchange declined' },
    { id: TransactionStatus.TransferDeclined, name: 'Transfer declined' },
    { id: TransactionStatus.TransferBlocked, name: 'Transfer blocked' },
    { id: TransactionStatus.Exchanging, name: 'Exchanging' },
    { id: TransactionStatus.Exchanged, name: 'Exchanged' },
    { id: TransactionStatus.TransferBenchmarkWaiting, name: 'Transfer benchmark waiting' },
    { id: TransactionStatus.BenchmarkTransfered, name: 'Benchmark transfered' },
    { id: TransactionStatus.BenchmarkTransfering, name: 'Benchmark transfering' },
    { id: TransactionStatus.BenchmarkTransferDeclined, name: 'Benchmark transfer declined' },
    { id: TransactionStatus.Sending, name: 'Sending' },
    { id: TransactionStatus.SendingWaiting, name: 'Waiting for Sending' },
    { id: TransactionStatus.Sent, name: 'Sent' },
    { id: TransactionStatus.Distributing, name: 'Distributing' },
    { id: TransactionStatus.DistributingWaiting, name: 'DistributingWaiting' },
    { id: TransactionStatus.Distributed, name: 'Distributed' },
    { id: TransactionStatus.Completed, name: 'Completed' },
    { id: TransactionStatus.Abandoned, name: 'Abandoned' },
    { id: TransactionStatus.Canceled, name: 'Cancelled' },
    { id: TransactionStatus.Chargeback, name: 'Chargeback' },
    { id: TransactionStatus.KycDeclined, name: 'KycDeclined' }
];

export const UserTransactionStatusList: Array<UserTransactionStatusView> = [
    { id: UserTransactionStatus.New, name: 'New' },
    { id: UserTransactionStatus.Processing, name: 'Processing' },
    { id: UserTransactionStatus.Confirming, name: 'Confirming' },
    { id: UserTransactionStatus.Completed, name: 'Completed' },
    { id: UserTransactionStatus.Canceled, name: 'Cancelled' },
    { id: UserTransactionStatus.UnderReview, name: 'Under Review' },
    { id: UserTransactionStatus.Declined, name: 'Declined' },
    { id: UserTransactionStatus.SendingError, name: 'Sending Error' }
]

export const AdminTransactionStatusList: Array<AdminTransactionStatusView> = [
    { id: AdminTransactionStatus.New, name: 'New' },
    { id: AdminTransactionStatus.Pending, name: 'Pending' },
    { id: AdminTransactionStatus.Paid, name: 'Paid' },
    { id: AdminTransactionStatus.Exchanging, name: 'Exchanging' },
    { id: AdminTransactionStatus.Confirming, name: 'Confirming' },
    { id: AdminTransactionStatus.Completed, name: 'Completed' },
    { id: AdminTransactionStatus.Abandoned, name: 'Abandoned' },
    { id: AdminTransactionStatus.Canceled, name: 'Cancelled' },
    { id: AdminTransactionStatus.Chargeback, name: 'Chargeback' },
    { id: AdminTransactionStatus.PaymentDeclined, name: 'Payment declined' },
    { id: AdminTransactionStatus.AddressDeclined, name: 'Address declined' },
    { id: AdminTransactionStatus.ExchangeDeclined, name: 'Exchange declined' },
    { id: AdminTransactionStatus.TransferDeclined, name: 'Transfer declined' },
    { id: AdminTransactionStatus.BenchmarkTransferDeclined, name: 'Benchmark transfer declined' },
    { id: AdminTransactionStatus.KycDeclined, name: 'KycDeclined' }
];

export const TransactionKycStatusList: Array<TransactionKycStatusView> = [
    { id: TransactionKycStatus.KycWaiting, name: 'Waiting' },
    { id: TransactionKycStatus.KycApproved, name: 'Approved' },
    { id: TransactionKycStatus.KycRejected, name: 'Rejected' }
];

export const FeeTargetFilterList: Array<FeeTargetFilterTypeView> = [
    { id: SettingsFeeTargetFilterType.None, name: 'Default' },
    { id: SettingsFeeTargetFilterType.WidgetId, name: 'Widget' },
    { id: SettingsFeeTargetFilterType.Country, name: 'Country' },
    { id: SettingsFeeTargetFilterType.AccountId, name: 'Account' },
    { id: SettingsFeeTargetFilterType.InitiateFrom, name: 'Initiate from ...' }
];

export const CostTargetFilterList: Array<CostTargetFilterTypeView> = [
    { id: SettingsCostTargetFilterType.None, name: 'Default' },
    { id: SettingsCostTargetFilterType.Country, name: 'Country' },
    //{ id: SettingsCostTargetFilterType.Psp, name: 'PSP' }
];

export const KycTargetFilterList: Array<KycTargetFilterTypeView> = [
    { id: SettingsKycTargetFilterType.None, name: 'Default' },
    { id: SettingsKycTargetFilterType.WidgetId, name: 'Widget' },
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

export const UserActionTypeList: Array<UserActionTypeView> = [
    { id: UserActionType.Signup, name: 'Sign up' },
    { id: UserActionType.Login, name: 'Log in' },
    { id: UserActionType.Logout, name: 'Log out' },
    { id: UserActionType.Send, name: 'Send transaction created' },
    { id: UserActionType.Receive, name: 'Receive transaction created' },
    { id: UserActionType.Buy, name: 'Buy transaction created' },
    { id: UserActionType.Sell, name: 'Sell transaction created' },
    { id: UserActionType.Transfer, name: 'Transfer transaction created' },
    { id: UserActionType.Exchange, name: 'Exchange transaction created' },
    { id: UserActionType.System, name: 'System operation' },
    { id: UserActionType.SettleTransaction, name: 'Transaction settled' },
    { id: UserActionType.UnbenchmarkTransaction, name: 'Transaction unbenchmark' },
    { id: UserActionType.PaidTransaction, name: 'Transaction set Paid' },
    { id: UserActionType.UpdateTransaction, name: 'Transaction updated' },
    { id: UserActionType.CancelTransaction, name: 'Transaction canceled' },
    { id: UserActionType.CreateUser, name: 'User created' },
    { id: UserActionType.AddWidgetUserParams, name: 'Widget user params created' },
    { id: UserActionType.UpdateUser, name: 'User updated' },
    { id: UserActionType.DeleteUser, name: 'User deleted' },
    { id: UserActionType.CreateApiKey, name: 'API Key created' },
    { id: UserActionType.DeleteApiKey, name: 'API Ket deleted' },
    { id: UserActionType.ChangeRiskAlertSettings, name: 'Risk alert settings changed' },
    { id: UserActionType.Deposit, name: 'Deposit created' },
    { id: UserActionType.Withdrawal, name: 'Withdrawal created' },
    { id: UserActionType.MerchantBuy, name: 'Merchant-buy created' },
    { id: UserActionType.MerchantSell, name: 'Merchant-sell created' },
    { id: UserActionType.AbandonTransaction, name: 'Transaction abandoned' },
    { id: UserActionType.AddBlackCountry, name: 'Country added to the black list' },
    { id: UserActionType.RemoveBlackCountry, name: 'Country removed from the black list' },
    { id: UserActionType.CreateCryptoInvoice, name: 'Crypto invoice created' },
    { id: UserActionType.AbandonCryptoInvoice, name: 'Crypto invoice abbadoned' },
    { id: UserActionType.AssignRole, name: 'Assign Role' },
    { id: UserActionType.ChangeUserKycTier, name: 'User change kyc tier' },
    { id: UserActionType.GenerateKycToken, name: 'Generate kyc token' },
    { id: UserActionType.KycCallback, name: 'Kyc callback' },
    { id: UserActionType.RemoveRole, name: 'Remove role' },
    { id: UserActionType.RestoreUser, name: 'Restore role' },
    { id: UserActionType.UpdateSettings, name: 'Update settings' },
    { id: UserActionType.AddFeeSettings, name: 'Add fee settings' },
    { id: UserActionType.UpdateFeeSettings, name: 'Update fee settings' },
    { id: UserActionType.DeleteFeeSettings, name: 'Delete fee settings' },
    { id: UserActionType.AddCostSettings, name: 'Add cost settings' },
    { id: UserActionType.UpdateCostSettings, name: 'Update cost settings' },
    { id: UserActionType.DeleteCostSettings, name: 'Delete cost settings' },
    { id: UserActionType.AddKycLevelSettings, name: 'Add kyc level settings' },
    { id: UserActionType.UpdateKycLevelSettings, name: 'Update kyc level settings' },
    { id: UserActionType.DeleteKycLevelSettings, name: 'Delete kyc level settings' },
    { id: UserActionType.AddKycTierSettings, name: 'Add kyc tier settings' },
    { id: UserActionType.UpdateKycTierSettings, name: 'Update kyc tier settings' },
    { id: UserActionType.DeleteKycTierSettings, name: 'Delete kyc tier settings' },
    { id: UserActionType.AddWireTransferBankAccount, name: 'Add wire transfer bank account' },
    { id: UserActionType.UpdateWireTransferBankAccount, name: 'Update wire transfer bank account' },
    { id: UserActionType.MonoovaApproved, name: 'Monoova transction approved' },
    { id: UserActionType.MonoovaAutoReject, name: 'AutoReject by Monoova' },
    { id: UserActionType.MonoovaCallback, name: 'Monoova callback' },
    { id: UserActionType.MonoovaCreateAccount, name: 'Crete monoova account' },
    { id: UserActionType.MonoovaDeclined, name: 'Monoova transction declined' },
    { id: UserActionType.MonoovaGetAccount, name: 'Get monoova account' },
    { id: UserActionType.MonoovaGetPayId, name: 'Get monoova PayId' },
    { id: UserActionType.MonoovaPayout, name: 'Crete Monoova Payout' },
    { id: UserActionType.MonoovaRegisterPayId, name: 'Register monoova payId' },
    { id: UserActionType.OpenpaydApproved, name: 'Openpayd transction declined' },
    { id: UserActionType.OpenpaydAutoReject, name: 'AutoReject by Openpayd' },
    { id: UserActionType.OpenpaydCallback, name: 'Openpayd callback' },
    { id: UserActionType.OpenpaydDeclined, name: 'Openpayd transction declined' },

];

export const UserActionResultList: Array<UserActionResultView> = [
    { id: UserActionResult.Unknown, name: 'Unknown' },
    { id: UserActionResult.Succeeded, name: 'Succeeded' },
    { id: UserActionResult.Failed, name: 'Failed' },
    { id: UserActionResult.Canceled, name: 'Canceled' },
    { id: UserActionResult.Error, name: 'Error' }
];

export const UserStatusList: Array<AccountStatusView> = [
    { id: AccountStatus.Closed, name: 'Closed' },
    { id: AccountStatus.Banned, name: 'Banned' },
    { id: AccountStatus.Live, name: 'Live' },
    { id: AccountStatus.Suspended, name: 'Suspended' }
];

export const KycStatusList: Array<KycStatusView> = [
    { id: KycStatus.Unknown, name: 'Unknown' },
    { id: KycStatus.NotFound, name: 'Not Found' },
    { id: KycStatus.Init, name: 'Initialization' },
    { id: KycStatus.Pending, name: 'Pending' },
    { id: KycStatus.Queued, name: 'Queued' },
    { id: KycStatus.Completed, name: 'Completed' },
    { id: KycStatus.OnHold, name: 'On Hold' },
    { id: KycStatus.Canceled, name: 'Canceled' },
    { id: KycStatus.Timeout, name: 'Time out' },
    { id: KycStatus.Invalid, name: 'Invalid' },
    { id: KycStatus.Deleted, name: 'Deleted' }
];

export const KycProviderList: Array<KycProviderView> = [
    { id: KycProvider.Local, name: 'Local' },
    { id: KycProvider.SumSub, name: 'SumSub' },
    { id: KycProvider.Shufti, name: 'Shufti' }
];

export const RiskLevelViewList: Array<RiskLevelView> = [
    { id: RiskLevel.Low, name: 'Low' },
    { id: RiskLevel.Medium, name: 'Medium' },
    { id: RiskLevel.High, name: 'High' }
];

export const CustodyProviderList: Array<CustodyProviderView> = [
    { id: CustodyProvider.Fireblocks, name: 'Fireblocks' },
    { id: CustodyProvider.PrimeTrustCustody, name: 'PrimeTrust' }
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
    transactionType: TransactionType = TransactionType.Buy;
    transactionId = '';
    vaultId = '';
    status: TransactionStatus = TransactionStatus.Pending;
    card: CardView | undefined = undefined;
    provider: PaymentProvider | undefined = undefined;  // deprecated
    providerView: PaymentProviderInstrumentView | undefined = undefined;
    instrument: PaymentInstrument | undefined = undefined;
    quoteLimit = 0;
    verifyWhenPaid = false;

    get isFromCrypto(): boolean {
        let result = false;
        switch (this.transactionType) {
            case TransactionType.Sell:
                result = true;
        }
        return result;
    }

    get isToCrypto(): boolean {
        let result = false;
        switch (this.transactionType) {
            case TransactionType.Buy:
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
            case TransactionType.Buy:
                if (this.exchangeRate?.depositRate) {
                    result = (this.exchangeRate.depositRate > 0) ? this.exchangeRate.depositRate.toString() : '';
                }
                break;
            case TransactionType.Sell:
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
        this.transactionType = TransactionType.Buy;
        this.transactionId = '';
        this.status = TransactionStatus.Pending;
        this.provider = undefined;
        this.providerView = undefined;
        this.instrument = undefined;
        this.card = undefined;
        this.quoteLimit = 0;
        this.verifyWhenPaid = false;
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
