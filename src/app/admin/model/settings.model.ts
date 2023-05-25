export enum TransactionConfirmationMode {
    Always = 'ALWAYS',
    PerWidget = 'PER_WIDGET',
    Never = 'NEVER'
}

export class TransactionConfirmationModeView {
    id: TransactionConfirmationMode = TransactionConfirmationMode.Never;
    name = '';
}

export const TransactionConfirmationModeList: TransactionConfirmationModeView[] = [
    { id: TransactionConfirmationMode.Always, name: 'Always' },
    { id: TransactionConfirmationMode.PerWidget, name: 'Per widget' },
    { id: TransactionConfirmationMode.Never, name: 'Never' }
];
