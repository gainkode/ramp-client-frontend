export enum TransactionConfirmationMode {
    Always = 'ALWAYS',
    IfOneTime = 'IF_ONE_TIME',
    Never = 'NEVER'
}

export class TransactionConfirmationModeView {
    id: TransactionConfirmationMode = TransactionConfirmationMode.Never;
    name = '';
}

export const TransactionConfirmationModeList: TransactionConfirmationModeView[] = [
    { id: TransactionConfirmationMode.Always, name: 'Always' },
    { id: TransactionConfirmationMode.IfOneTime, name: 'If one time' },
    { id: TransactionConfirmationMode.Never, name: 'Never' }
];
