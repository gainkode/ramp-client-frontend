export enum DocumentTypeValue {
	Id = 'ID',
	DrivingLicense = 'DRIVING_LICENSE',
	Passport = 'PASSPORT',

	BankStatement = 'BANK_STATEMENT',
	UtilityBill = 'UTILITY_BILL',
	GovernmentIssuedDoc = 'GOVERNMENT_ISSUED_DOC',
	TaxBill = 'TAX_BILL',
	PropertyTax = 'PROPERTY_TAX',
	PermanentResidency = 'PERMANENT_RESIDENCY',

	DoD = 'DOD',
	Audit = 'AUDIT',

	Selfie = 'SELFIE',

	SupportingDocuments = 'SUPPORTING_DOCUMENTS',

	DoDVideo = 'DOD_VIDEO',

	Other = 'OTHER'
}

export enum DocumentType {
	ID = 'ID',
	POA = 'Proof of address',
	Selfie = 'Selfie',
	SOF = 'Source of founds',
	DOD = 'DoD',
	DoDVideo = 'DoD video',
	Other = 'Other'
}

export enum DocumentSide {
	Front = 'FRONT',
	Back = 'BACK'
}

export interface CustomerDocument {
	id: string;
	userId: string;
	name: string | null;
	description: string | null;
	type: DocumentTypeValue;
	side: DocumentSide | null;
	files: DocumentFile[];
	created: Date;
}

export interface DocumentFile {
	id: string;
	documentId: string;
	mimetype: string;
	name: string;
	originalName: string;
	created: Date;
}

export interface UploadDocumentParams {
	name?: string | null;
	description?: string | null;
	type: DocumentTypeValue;
	side?: DocumentSide | null;
	userId: string;
	files: File[];
}
  
export interface GetDocumentFileResult {
	id: string;
	buffer: Buffer;
	mimetype: string;
	fileName: string;
	fallbackFileName: string;
	created: Date;
}