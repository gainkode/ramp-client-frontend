import { TransactionType, TransactionSource } from './generated-models';

export enum PaymentWidgetType {
    None = 'None',
    Buy = 'Buy',
    Sell = 'Sell',
    Send = 'Send',
    Receive = 'Receive',
    Transfer = 'Transfer',
    Deposit = 'Deposit',
    Withdrawal = 'Withdrawal',
}

export enum WireTransferPaymentCategory {
    AU = 'AU',
    UK = 'UK',
    EU = 'EU',
    OPENPAYD = 'OPENPAYD',
    MONOOVA = 'MONOOVA',
    PRIMETRUST = 'PRIMETRUST',
    FLASHFX = 'FLASHFX'
}

export class WidgetSettings {
    embedded = false;
    email = '';
    hideEmail = false;
    transaction: TransactionType | undefined = undefined;
    source: TransactionSource = TransactionSource.QuickCheckout;
    walletAddressPreset = false;
    widgetId = '';
    kycFirst = false;
    disclaimer = false;
    transfer = false;
    fiatList: string[] = [];
    cryptoList: string[] = [];
    currencyFrom = '';
    currencyTo = '';
    hideAmountFrom = false;
    amountFrom = 0;
    minAmountFrom: number | undefined = undefined;
    maxAmountFrom: number | undefined = undefined;
    allowToPayIfKycFailed: boolean = false;
    fee: number | undefined = undefined;
    showRate: boolean | undefined = undefined;
    
    get orderDefault(): boolean {
        return (this.amountFrom !== 0 &&
            this.currencyFrom !== '' &&
            this.currencyTo !== '' &&
            this.walletAddressPreset &&
            this.transaction !== undefined);
    }
}

export class WidgetStage {
    id = '';
    title = '';
    step = 0;
    summary = true;
}

export class InstantpayDetails {
    status = '';
    redirectUrl = '';
    uniqueReference = 0;
    payId = '';
}

export class PaymentCompleteDetails {
    paymentType: PaymentWidgetType = PaymentWidgetType.None;
    amount = 0;
    currency = '';
}

export class PaymentErrorDetails {
    paymentType: PaymentWidgetType = PaymentWidgetType.None;
    errorMessage = '';
}

export class WireTransferPaymentCategoryItem {
    id = WireTransferPaymentCategory.AU;
    bankAccountId = '';
    title = '';
    data = '';
}
