import { TransactionItem } from "./transaction.model";
import { WalletItem } from "./wallet.model";

export enum ProfileItemContainerType {
    None = 'None',
    Transaction = 'Transaction',
    Wallet = 'Wallet',
    Contact = 'Contact'
}

export enum ProfileItemActionType {
    None = 'None',
    List = 'List',
    Create = 'Create',
    Remove = 'Remove'
}

export class ProfileItemContainer {
    container: ProfileItemContainerType = ProfileItemContainerType.None;
    action: ProfileItemActionType = ProfileItemActionType.None;
    transaction: TransactionItem | undefined = undefined;
    wallet: WalletItem | undefined = undefined;
    meta: any;
}