import { TransactionType, TransactionSource } from './generated-models';

export enum PaymentWidgetType {
    None = 'None',
    Buy = 'Buy',
    Sell = 'Sell',
    Send = 'Send',
    Receive = 'Receive',
    Transfer = 'Transfer'
}

export class WidgetSettings {
    embedded = false;
    email = '';
    transaction: TransactionType | undefined = undefined;
    source: TransactionSource = TransactionSource.QuickCheckout;
    walletAddressPreset = false;
    widgetId = '';
    kycFirst = false;
    disclaimer = false;
    transfer = false;
    fiatList: string[] = [];
    cryptoList: string[] = [];
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
