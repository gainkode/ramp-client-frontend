export enum SignatureStatus {
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED'
}

export enum SignatureDocumnetFileType {
  AUDIT_TRAIL = 'audit_trail',
  SIGNED_DOCUMENT = 'signed_document',
}

export interface Signature {
	id: string;
	originalSignatureId: string;
	transactionId: string | null;
	description: string | null;
	status: SignatureStatus;
	subStatus: string;
	createdAt: Date | string;
	executedAt: Date | string;
	signatureDocument: SignatureDocument[];
}

export interface SignatureDocument {
	id: string;
	signatureId: string;
	userId: string;
	userEmail: string;
	userName: string;
	originalDocumentId: string;
	description: string | null;
	createdAt: Date | string;
	executedAt: Date | string | null;
	status: string;
	fileName: string;
	documentFile: SignatureDocumentFile[];
}

export interface SignatureDocumentFile {
	id: string;
	documentId: string | null;
	signatureDocumentId: string | null;
	mimetype: string;
	name: string;
	originalName: string;
	documentType: SignatureDocumnetFileType;
	created: Date | string;
}

export interface UploadSignatureParams {
	transactionId?: string | null;
	signatureId?: string | null;
	signatureStatus?: SignatureStatus;
	filesInfo: FileInfoObject[];
	files: File[];
}

export interface FileInfoObject{
	documentId?: string;
	fileName: string;
	fileType: SignatureDocumnetFileType;
}

// export interface GetSignatureResult {
// 	id: string;
// 	buffer: Buffer;
// 	mimetype: string;
// 	fileName: string;
// 	fallbackFileName: string;
// 	created: Date;
// }