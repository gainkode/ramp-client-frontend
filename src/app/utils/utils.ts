import { User, UserType } from "../model/generated-models";
import { KycTier } from "../model/identification.model";
import { PaymentWidgetType } from "../model/payment-base.model";
import { PaymentProviderView } from "../model/payment.model";
import { EnvService } from "../services/env.service";

export interface PaymentTitleInfo {
    panelTitle: string;
    riskWarning: string;
}

export function round(value: number, precision: number | undefined): number {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export function getFormattedUtcDate(value: string, delimitter: string = '/'): Date | undefined {
    if (value !== '') {
        const dateParts = value.split(delimitter);
        const d = parseInt(dateParts[0]);
        const m = parseInt(dateParts[1]);
        let y = parseInt(dateParts[2]);
        if (y < 100) {
            y += 2000;
        }
        return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    } else {
        return undefined;
    }
}

export function getCurrencySign(currency: string): string {
    let result = currency;
    switch (currency) {
        case 'EUR':
            result = '\u20AC';
            break;
        case 'GBP':
            result = '\u00A3';
            break;
        case 'USD':
            result = '$';
            break;
        case 'CAD':
            result = 'CA$';
            break;
        case 'AUD':
            result = 'AU$';
            break;
        case 'CHF':
            result = 'CHF';
            break;
        case 'JPY':
            result = '\u00A5';
            break;
    }
    return result;
}

export function getCryptoSymbol(symbol: string): string {
    let result = symbol;
    if (symbol) {
        if (symbol.toLowerCase().endsWith('_test')) {
            const p = symbol.toLowerCase().indexOf('_test');
            result = symbol.substring(0, p);
        }
    }
    return result;
}

export function shortenString(val: string, limit: number): string {
    let result = val;
    if (val.length > limit) {
        result = `${val.slice(0, limit - 1)}...`;
    }
    return result;
}

export function getFullName(user: User): string {

    let fullName = '';
    if (user.type === UserType.Merchant) {
        fullName = user.companyName ?? user.firstName ?? '';
    } else if (user.type === UserType.Personal) {
        fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`;
    }
    if (fullName === ' ' || fullName === '') {
        fullName = user?.email ?? 'No name';
    }
    return fullName;
}

export function getAvatarPath(avatarObject: string | undefined): string {
    let result = '';
    const avatarData = JSON.parse(avatarObject ?? '{}');
    if (avatarData) {
        if (avatarData.path && avatarData.originFileName) {
            result = `${EnvService.image_host}/${avatarData.path}/${avatarData.originFileName}`;
        }
    }
    return result;
}

export function getPaymentTitles(paymentId: PaymentWidgetType): PaymentTitleInfo {
    const riskWarningQuoteText = 'The final crypto quote will be based on the asset\'s price at the time of order completion, the final rate will be presented to you in the order confirmation screen.';
    const riskWarningNatureText = 'Please note that due to the nature of Crypto currencies, once your order has been submitted we will not be able to reverse it.';
    const result = {} as PaymentTitleInfo;
    if (paymentId === PaymentWidgetType.Buy || paymentId === PaymentWidgetType.Sell) {
        result.panelTitle = 'BUY or SELL any Crypto Currency using your Bank account directly in a single action!\nIt only takes 2 clicks and you’re done.';
        result.riskWarning = `${riskWarningQuoteText}\n${riskWarningNatureText}`;
    } else if (paymentId === PaymentWidgetType.Send) {
        result.panelTitle = 'Send Crypto from your wallet anywhere in one single, easy step!\nSimply add your recepient address to your Contact List, or Insert New Address.';
        result.riskWarning = riskWarningNatureText;
    } else if (paymentId === PaymentWidgetType.Receive) {
        result.panelTitle = 'Receive Crypto in your wallet is easy and simple!\nChoose the coin, then wallet to see your deposit wallet address. To aviod coins loss, make sure you use the correct network.';
        result.riskWarning = riskWarningNatureText;
    } else if (paymentId === PaymentWidgetType.Transfer) {
        result.panelTitle = 'Express Transfer allowing you with a single action to Purchase & Send Crypto direclty from your Bank account to any address!\nIt only takes 2 clicks and you’re done.';
        result.riskWarning = riskWarningNatureText;
    } else if (paymentId === PaymentWidgetType.Deposit || PaymentWidgetType.Withdrawal) {
        result.panelTitle = 'BUY or SELL any Fiat Currency using your Bank account directly in a single action!\nIt only takes 2 clicks and you’re done.';
        result.riskWarning = '';
    }
    return result;
}

export function getTransactionStatusHash(transactionStatus: string, kycStatus: string, accountStatus: string): number {
    const sum = `${transactionStatus}${kycStatus}${accountStatus}`;
    let hash = 0, i, chr;
    if (sum.length === 0) return hash;
    for (i = 0; i < sum.length; i++) {
        chr = sum.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function getTransactionAmountHash(rate: number, amount: number, fee: number): number {
    const sum = `${rate}-${amount}-${fee}`;
    let hash = 0, i, chr;
    if (sum.length === 0) return hash;
    for (i = 0; i < sum.length; i++) {
        chr = sum.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function getProviderList(instruments: string[], providers: PaymentProviderView[]): PaymentProviderView[] {
    if (instruments.length < 1) {
        return providers;
    } else {
        return providers.filter(x => {
            return x.instruments.filter(i => instruments.includes(i)).length > 0;
        });
    }
}

export function getCheckedProviderList(checkedproviders: string[], providerList: PaymentProviderView[]): string[] {
    return checkedproviders.filter(x => providerList.some(p => p.id === x));
}

export function isSumsubVerificationComplete(payload: any): {result: boolean, answer: string | null} {
    const status: string = payload?.reviewStatus ?? '';
    if (status.toLowerCase() === 'completed') {
        const reviewResult = payload?.reviewResult;
        if (reviewResult) {
            const answer = reviewResult.reviewAnswer as string;
            if (answer) {
                if (answer.toLowerCase() === 'green') {
                    return {result: true, answer: answer.toLowerCase()};
                }else{
                    return {result: false, answer: answer.toLowerCase()};
                }
            }
        }
    }
    return {result: false, answer: null};
}

export function findExistingDefaultTier(tiers: KycTier[], tier: KycTier): boolean {
    if (tier.isDefault) {
        const found = tiers.find(x => {
            const valid = x.isDefault && x.userType === tier.userType && x.id !== tier.id;
            if (valid) {
                let found = (tier.kycProviders.length > 0);
                tier.kycProviders.forEach(p => {
                    if (found && !x.kycProviders.includes(p)) {
                        found = false;
                    }
                });
                return found && tier.kycProviders.length === x.kycProviders.length;
            }
            return false;
        });
        if (found) {
            return true;
        }
    }
    return false;
}

export function getMinSec(seconds: number): string {
    const input = (seconds >= 0) ? seconds : 0;
    const mins = Math.floor(input / 60);
    const secs = input - mins * 60;
    const minVal = mins.toString();
    const secVal = secs.toString();
    return `${(minVal.length === 1) ? '0' : ''}${minVal}:${(secVal.length === 1) ? '0' : ''}${secVal}`;
}