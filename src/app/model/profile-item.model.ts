import { TransactionItem } from "./transaction.model";

export enum ProfileItemContainerType {
    None = 'None',
    Transaction = 'Transaction',
    Wallet = 'Wallet',
    Contact = 'Contact',
}
  
export class ProfileItemContainer {
    container: ProfileItemContainerType = ProfileItemContainerType.None;
    transaction: TransactionItem | undefined = undefined;
}