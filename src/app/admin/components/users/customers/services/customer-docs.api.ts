import { HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiFacadeService } from 'services/api-facade.service';
import { CustomerDocument } from '../models/customer-docs.model';
import { ISimpleResponse } from 'model/api';

@Injectable()
export class CustomerDocsApi {
	constructor(private apiFacade: ApiFacadeService) {}

	getCustomerDocs(id: string): Observable<CustomerDocument[]> {
		let params = new HttpParams();
		params = params.append('userId', id);

		const url = 'docs/v1/documents';

		return this.apiFacade.get<CustomerDocument[]>(url, { params });
	}

	addCustomerDocument(formData: FormData): Observable<HttpEvent<Object>> {
		const url = 'docs/v1/documents';

		return this.apiFacade.postFormData(url, formData);
	}

	removeDocument(id: string): Observable<ISimpleResponse> {
		const url = `docs/v1/documents/${id}`;

		return this.apiFacade.delete(url, id);
	}

	downloadDocs(id: string): Observable<Blob> {
		const url = `docs/v1/documents/files/${id}`;

		return this.apiFacade.getFile(url);
	}
}
