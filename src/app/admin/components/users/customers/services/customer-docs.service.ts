import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CustomerDocsApi } from './customer-docs.api';
import { CustomerDocsState, initialCustomerDocsState } from '../models/customer-docs-state.model';
import { CustomerDocument } from '../models/customer-docs.model';
import { CustomerDocsStateService } from './customer-docs.state';
import { ISimpleResponse } from 'model/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';

@Injectable()
export class CustomerDocsFacadeService {
	public getState$: Observable<CustomerDocsState> = this.state.getState$;

	constructor(
		private api: CustomerDocsApi,
		private state: CustomerDocsStateService,
		private _snackBar: MatSnackBar,
	) {}

	public loadAll(userId: string, skipCache: boolean): Observable<CustomerDocument[]> {
		if (!skipCache && this.state.getState.isLoaded) {
			return this.getState$.pipe(map(x => x?.documents));
		}
		
		this.state.resetState();
		this.state.setState({ isLoading: true });

		// Get fresh data from BE
		return this.loadData(userId);
	}

	public deleteDocument(id: string): Observable<ISimpleResponse> {
		this.state.setState({ isLoading: true });
		return this.api.removeDocument(id).pipe(
			tap(() => {
				const updatedDocsList = this.state.getState.documents.filter(
					(doc) => doc.id !== id,
				);

				this.state.setState({
					documents: updatedDocsList,
					isLoading: false,
				});
				this._snackBar.open('The document has been successfully deleted.', null, { duration: 5000 });
			}),
			catchError((error) => {
				console.error(error);
				this._snackBar.open('There was an error deleting the document. Please contact R&D', null, { duration: 5000 });
				this.state.setState({ isLoading: false });

				return of(null);
			}),
		);
	}

	public onLoadFiles(document: CustomerDocument): Observable<Blob[]> {
		this.state.setState({ isLoading: true });
		const ids = document.files.map(file => this.api.downloadDocs(file.id));

		return forkJoin(ids).pipe(
			tap((response) => {
				this.state.setState({ isLoading: false });
				response.forEach((file) => saveAs(file));
			}),
			catchError(() => {
				this.state.setState({ isLoading: false });
				return of(null);
			}),
		);
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
}