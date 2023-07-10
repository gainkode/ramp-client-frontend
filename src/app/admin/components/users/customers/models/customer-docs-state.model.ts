import { CustomerDocument } from './customer-docs.model';

export interface CustomerDocsState {
	isLoaded: boolean;
	isLoading: boolean;
	documents: CustomerDocument[];
	documentsDetails: Map<string, CustomerDocument>;
	expandedElement: CustomerDocument | null;
}

export const initialCustomerDocsState: CustomerDocsState = {
	isLoaded: false,
	isLoading: false,
	documents: [],
	documentsDetails: new Map<string, CustomerDocument>(),
	expandedElement: null,
};
