import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiFacadeService } from 'services/api-facade.service';

@Injectable()
export class PaymentYapiliApi {
	constructor(private apiFacade: ApiFacadeService) {}
	yapilyPaymentCallback(): Observable<void> {
		const url = 'rest/monoova/payment-callback';
		
		return this.apiFacade.post(url, null);
	}
}
