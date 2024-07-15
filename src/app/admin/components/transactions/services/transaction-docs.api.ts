import { HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ApiFacadeService } from 'services/api-facade.service';
import { Signature } from '../models/transaction-docs.model';
import { ISimpleResponse } from 'model/api';

@Injectable()
export class TransactionDocsApi {
	constructor(private apiFacade: ApiFacadeService) {}

	getSignatures(id: string): Observable<Signature[]> {
		// let params = new HttpParams();
		// params = params.append('userId', id);

		const params = {
			'id': '663c6c06-b993-4967-ad98-4018af1f9caf'
		};

		// const url = 'docs/v1/documents';
		const url = 'v1/dod/signatures';

		return of(
			<Signature[]>[{
				id: '663c6c06-b993-4967-ad98-4018af1f9caf',
				originalSignatureId: '7ea5c513-44d3-4520-b2c2-bc87ed923bca',
				transactionId: '7c1aa187-436d-436b-9464-4f7ff5133c7f',
				description: null,
				status: 'COMPLETED',
				subStatus: 'Init',
				createdAt: '2024-07-01T14:15:07.390Z',
				executedAt: '2024-07-01T14:17:20.443Z',
				signatureDocument: [
						{
								id: 'c8d38ac7-0256-4587-b35b-55f9d63a8d12',
								userId: '2c93dee3-dd43-4184-97e4-1c2c4100740a',
								userEmail: '2c93dee3-dd43-4184-97e4-1c2c4100740a',
								userName: '2c93dee3-dd43-4184-97e4-1c2c4100740a',
								originalDocumentId: '944f4b35-0420-4ecf-bd35-6c7a10e984b1',
								description: null,
								status: 'completed',
								fileName: '_okCUSTOMER_DECLARATION_OF_DEPOSITS.pdf',
								signatureId: '663c6c06-b993-4967-ad98-4018af1f9caf',
								createdAt: '2024-07-01T14:15:08.770Z',
								executedAt: '2024-07-01T14:16:43.017Z',
								documentFile: [
										{
												id: 'aba3691d-6938-442f-a8fb-9bba2c0a1592',
												documentId: null,
												signatureDocumentId: 'c8d38ac7-0256-4587-b35b-55f9d63a8d12',
												mimetype: '',
												name: '944f4b35-0420-4ecf-bd35-6c7a10e984b1_signed_document.pdf',
												originalName: '_okCUSTOMER_DECLARATION_OF_DEPOSITS.pdf',
												documentType: 'signed_document',
												created: '2024-07-01T14:16:54.610Z'
										},
										{
												id: 'f1e6ad4e-d848-492c-bb37-f170cce5c1af',
												documentId: null,
												signatureDocumentId: 'c8d38ac7-0256-4587-b35b-55f9d63a8d12',
												mimetype: '',
												name: '944f4b35-0420-4ecf-bd35-6c7a10e984b1_audit_trail.pdf',
												originalName: '_okCUSTOMER_DECLARATION_OF_DEPOSITS.pdf',
												documentType: 'audit_trail',
												created: '2024-07-01T14:17:12.940Z'
										}
								],
						},
				]
		}]
		);

		return this.apiFacade.post<Signature[]>(url, params).pipe(map(response => response['data']));
	}

	addSignature(formData: FormData): Observable<HttpEvent<Object>> {
		const url = 'docs/v1/documents';
		// v1/dod/signature/add

		// export type DodSignatureFileUploadObject = {
		// 	documentId?: string; id: 'c8d38ac7-0256-4587-b35b-55f9d63a8d12', (signatureDocument[0])
		// 	signatureStatus?: SignatureStatus; status 
		// 	transactionId?: string; transactionId;
		// 	filesInfo: FileInfoObject[]; 
		// };

		return this.apiFacade.postFormData(url, formData);
	}

	updateSignature(payload: any): Observable<HttpEvent<Object>> {
		const url = 'docs/v1/documents';

		return this.apiFacade.put(url, payload);
	}

	removeSignedFile(id: string): Observable<ISimpleResponse> {
		const url = `docs/v1/documents/${id}`;

		return this.apiFacade.delete(url, id);
	}

	downloadSignedFile(id: string): Observable<Blob> {
		const url = `docs/v1/documents/files/${id}`;

		return this.apiFacade.getFile(url);
	}
}
