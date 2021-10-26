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
        case 'USD':
            result = '$';
            break;
    }
    return result;
}
