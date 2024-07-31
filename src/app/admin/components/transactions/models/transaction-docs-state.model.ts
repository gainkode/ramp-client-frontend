import { Signature } from './transaction-docs.model';

export interface TransactionsDocsState {
	isLoaded: boolean;
	isLoading: boolean;
	documents: Signature[];
	documentsDetails: Map<string, Signature>;
	expandedElement: Signature | null;
}

export const initialTransactionDocsState: TransactionsDocsState = {
	isLoaded: false,
	isLoading: false,
	documents: [],
	documentsDetails: new Map<string, Signature>(),
	expandedElement: null,
};
