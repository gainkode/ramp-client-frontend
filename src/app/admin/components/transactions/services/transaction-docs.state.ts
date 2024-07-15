import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransactionsDocsState, initialTransactionDocsState } from '../models/transaction-docs-state.model';

@Injectable()
export class TransactionDocsStateService {
	private _state$: BehaviorSubject<TransactionsDocsState> = new BehaviorSubject<TransactionsDocsState>({
		...initialTransactionDocsState,
	});

	public getState$: Observable<TransactionsDocsState> = this._state$.asObservable();

	public get getState(): TransactionsDocsState {
		return this._state$.getValue();
	}

	public setState(newState: Partial<TransactionsDocsState>): void {
		return this._state$.next({
			...this.getState,
			...newState,
		});
	}

	public resetState(): void {
		return this._state$.next({
			...initialTransactionDocsState
		});
	}
}
