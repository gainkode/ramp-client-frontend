import { Injectable } from '@angular/core';
// import { ISimpleResponse } from '@app/interfaces/api';
// import { WrapToasterService } from '@app/services/wrap-toaster-service';
// import {
// 	IAdminAccount,
// 	// IAdminAccountPermissions,
// 	// IDeleteAccountPayload,
// 	// IUpdateAccountPayload,
// } from '@modules/admin-panel/modules/admin-accounts/models/admin-account.model';
// import {
// 	IAdminAccountsState,
// 	initialAdminAccountsState,
// } from '@modules/admin-panel/modules/admin-accounts/models/admin-accounts-state.model';
// import { AdminAccountsApi } from '@modules/admin-panel/modules/admin-accounts/services/admin-accounts.api';
// import { AdminAccountsState } from '@modules/admin-panel/modules/admin-accounts/services/admin-accounts.state';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CustomerDocsApi } from './customer-docs.api';
import { CustomerDocsState, initialCustomerDocsState } from '../models/customer-docs-state.model';
import { CustomerDocument } from '../models/customer-docs.model';
import { CustomerDocsStateService } from './customer-docs.state';

@Injectable()
export class CustomerDocsFacadeService {
	public getState$: Observable<CustomerDocsState> = this.state.getState$;

	constructor(
		private api: CustomerDocsApi,
		private state: CustomerDocsStateService
	) {}

	public loadAll(userId: string): Observable<CustomerDocument[]> {
		// Verify cache
		if (this.state.getState.isLoaded) {
			// Get from cache
			return this.getState$.pipe(map(x => x?.documents));
		}
		// this.state.resetState();
		this.state.setState({ isLoading: true });

		// Get fresh data from BE
		return this.loadData(userId);
	}

	// public expandDetails(expandedElement: CustomerDocument | null): Observable<CustomerDocument> {
	// 	this.state.setState({ expandedElement });
	// 	return this.loadDetails(expandedElement?.account_uuid);
	// }

	// public updateAccount(payload: IUpdateAccountPayload): Observable<IAccount | null> {
	// 	this.state.setState({ isLoading: true });
	// 	return this.api.updateAccount(payload).pipe(
	// 		tap((updatedValue: IAccount) => {
	// 			const currentAccountsDetails = this.state.getState.accountsDetails;
	// 			currentAccountsDetails.set(payload.account_uuid, updatedValue);
	// 			const updatedAccList = this.state.getState.accounts.map((acc) => {
	// 				if (acc.account_uuid === payload.account_uuid) {
	// 					return updatedValue;
	// 				}

	// 				return acc;
	// 			});

	// 			this.state.setState({
	// 				accountsDetails: currentAccountsDetails,
	// 				accounts: updatedAccList,
	// 				expandedElement: { ...this.state.getState.expandedElement },
	// 				isLoading: false,
	// 			});
	// 			this.toasterService.handleSuccessMessage('Account details updated.');
	// 		}),
	// 		catchError((error) => {
	// 			console.error(error);
	// 			this.toasterService.handleRequestFailed(error);
	// 			this.state.setState({ isLoading: false });

	// 			return of(null);
	// 		}),
	// 	);
	// }

	// public deleteAccount(payload: IDeleteAccountPayload): Observable<ISimpleResponse> {
	// 	this.state.setState({ isLoading: true });
	// 	return this.api.deleteAccount(payload).pipe(
	// 		tap(() => {
	// 			const currentAccountsDetails = this.state.getState.accountsDetails;
	// 			currentAccountsDetails.delete(payload.account.account_uuid);
	// 			const updatedAccList = this.state.getState.accounts.filter(
	// 				(acc) => acc.account_uuid !== payload.account.account_uuid,
	// 			);

	// 			this.state.setState({
	// 				accountsDetails: currentAccountsDetails,
	// 				accounts: updatedAccList,
	// 				expandedElement: null,
	// 				isLoading: false,
	// 			});
	// 			this.toasterService.handleSuccessMessage('The account has been successfully deleted.');
	// 		}),
	// 		catchError((error) => {
	// 			console.error(error);
	// 			this.toasterService.handleErrorMessage('There was an error deleting the account. Please contact R&D');
	// 			this.state.setState({ isLoading: false });

	// 			return of(null);
	// 		}),
	// 	);
	// }

	public closeDetails(): void {
		this.state.setState({ expandedElement: null });
	}

	private loadData(userId: string): Observable<CustomerDocument[]> {
		return this.api.getCustomerDocs(userId).pipe(
			tap((data: CustomerDocument[]) => {
				this.state.setState({
					documents: data,
					isLoaded: true,
					isLoading: false,
				});
			}),
			catchError(() => {
				this.state.setState({ isLoaded: false, isLoading: false });
				return of({ ...initialCustomerDocsState }).pipe(map(x => x?.documents));
			}),
		);
	}

	// private loadDetails(account_uuid?: string): Observable<IAccount | null> {
	// 	if (!account_uuid && typeof account_uuid !== 'string') {
	// 		return of(null);
	// 	}

	// 	if (this.state.getState.accountsDetails.has(account_uuid)) {
	// 		return of(this.state.getState.accountsDetails.get(account_uuid));
	// 	}

	// 	return this.api.loadDetails(account_uuid).pipe(
	// 		tap((value: IAccount) => {
	// 			const currentAccountsDetails = this.state.getState.accountsDetails;
	// 			currentAccountsDetails.set(account_uuid, value);
	// 			this.state.setState({
	// 				accountsDetails: currentAccountsDetails,
	// 			});
	// 		}),
	// 		catchError((error) => {
	// 			console.error(error);
	// 			this.toasterService.handleRequestFailed(error);

	// 			return of(null);
	// 		}),
	// 	);
	// }
}
