export function round(value: number, precision: number | undefined): number {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export function getFormattedUtcDate(value: string): Date | undefined {
    if (value !== '') {
        const dateParts = value.split('/');
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
            result = 'CH\u20AC';
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
