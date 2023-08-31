import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomerDocsState, initialCustomerDocsState } from '../models/customer-docs-state.model';

@Injectable()
export class CustomerDocsStateService {
	private _state$: BehaviorSubject<CustomerDocsState> = new BehaviorSubject<CustomerDocsState>({
		...initialCustomerDocsState,
	});

	public getState$: Observable<CustomerDocsState> = this._state$.asObservable();

	public get getState(): CustomerDocsState {
		return this._state$.getValue();
	}

	public setState(newState: Partial<CustomerDocsState>): void {
		return this._state$.next({
			...this.getState,
			...newState,
		});
	}

	public resetState(): void {
		return this._state$.next({
			...initialCustomerDocsState
		});
	}
}
