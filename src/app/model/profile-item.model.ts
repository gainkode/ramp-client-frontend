import { NotificationItem } from "./notification.model";
import { TransactionItem } from "./transaction.model";
import { WalletItem } from "./wallet.model";

export enum ProfileItemContainerType {
    None = 'None',
    Transaction = 'Transaction',
    Wallet = 'Wallet',
    Contact = 'Contact'
}

export class ProfileItemContainer {
    container: ProfileItemContainerType = ProfileItemContainerType.None;
    transaction: TransactionItem | undefined = undefined;
    wallet: WalletItem | undefined = undefined;
}