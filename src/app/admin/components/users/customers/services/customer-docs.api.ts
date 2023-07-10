import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiFacadeService } from 'services/api-facade.service';
import { CustomerDocument } from '../models/customer-docs.model';

@Injectable()
export class CustomerDocsApi {
	constructor(private apiFacade: ApiFacadeService) {}

	getCustomerDocs(id: string): Observable<CustomerDocument[]> {
		let params = new HttpParams();
		params = params.append('userId', id);

		const url = 'docs/v1/documents';

		return this.apiFacade.get<CustomerDocument[]>(url, { params });
	}
}
