import { PaymentCompleteDetails } from "./payment-base.model";
import { TransactionItem } from "./transaction.model";
import { ContactItem } from "./user.model";
import { WalletItem } from "./wallet.model";

export enum ProfileItemContainerType {
    None = 'None',
    Transaction = 'Transaction',
    Wallet = 'Wallet',
    Contact = 'Contact',
    PaymentComplete = 'PaymentComplete'
}

export enum ProfileItemActionType {
    None = 'None',
    List = 'List',
    Create = 'Create',
    Remove = 'Remove',
    Redirect = 'Redirect'
}

export class ProfileItemContainer {
    container: ProfileItemContainerType = ProfileItemContainerType.None;
    action: ProfileItemActionType = ProfileItemActionType.None;
    transaction: TransactionItem | undefined = undefined;
    wallet: WalletItem | undefined = undefined;
    contact: ContactItem | undefined = undefined;
    paymentDetails: PaymentCompleteDetails | undefined = undefined;
    meta: any;
}
