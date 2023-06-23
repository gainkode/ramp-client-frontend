export enum DocumentTypeValue {
	Id = 'ID',
	DrivingLicense = 'DRIVING_LICENSE',
	Passport = 'PASSPORT',
	PermanentResidency = 'PERMANENT_RESIDENCY',
	Selfie = 'SELFIE',
	VideoCall = 'VIDEO_CALL',
	UtilityBill = 'UTILITY_BILL',
	BankStatement = 'BANK_STATEMENT',
	DoD = 'DOD',
	Other = 'OTHER'
}

// export enum DocumentType {
// 	Id = 'ID',
// 	DrivingLicense = 'DRIVING_LICENSE',
// 	Passport = 'PASSPORT',
// 	PermanentResidency = 'PERMANENT_RESIDENCY',
// 	Selfie = 'SELFIE',
// 	VideoCall = 'VIDEO_CALL',
// 	UtilityBill = 'UTILITY_BILL',
// 	BankStatement = 'BANK_STATEMENT',
// 	DoD = 'DOD',
// 	Other = 'OTHER'
// }

export interface CustomerDocument {
	id: string;
	userId: string;
	name: string | null;
	description: string | null;
	type: DocumentTypeValue;
	mimetype: string;
	fileName: string;
	originalName: string;
	created: Date;
}
 
// NAME / DESCRIPTION / 

export interface UploadDocumentParams {
	name?: string | null;
	description?: string | null;
	type: DocumentTypeValue;
	userId: string;
	file: File;
}
  
export interface GetDocumentFileResult {
	buffer: Buffer;
	mimetype: string;
	fileName: string;
	fallbackFileName: string;
}