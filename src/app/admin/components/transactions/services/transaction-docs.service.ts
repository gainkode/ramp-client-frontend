import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TransactionDocsApi } from './transaction-docs.api';
import { TransactionsDocsState, initialTransactionDocsState } from '../models/transaction-docs-state.model';
import { Signature, SignatureDocument } from '../models/transaction-docs.model';
import { TransactionDocsStateService } from './transaction-docs.state';
import { ISimpleResponse } from 'model/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';

@Injectable()
export class TransactionDocsFacadeService {
	public getState$: Observable<TransactionsDocsState> = this.state.getState$;

	constructor(
		private api: TransactionDocsApi,
		private state: TransactionDocsStateService,
		private _snackBar: MatSnackBar,
	) {}

	public loadAll(userId: string, skipCache: boolean): Observable<Signature[]> {
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
		return this.api.removeSignedFile(id).pipe(
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

	public onLoadFiles(document: SignatureDocument): Observable<Blob[]> {
		this.state.setState({ isLoading: true });
		const ids = document.documentFile.map(file => this.api.downloadSignedFile(file.id));

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

	private loadData(userId: string): Observable<Signature[]> {
		return this.api.getSignatures(userId).pipe(
			tap((data: Signature[]) => {
				this.state.setState({
					documents: data,
					isLoaded: true,
					isLoading: false,
				});
			}),
			catchError(() => {
				this.state.setState({ isLoaded: false, isLoading: false });
				return of({ ...initialTransactionDocsState }).pipe(map(x => x?.documents));
			}),
		);
	}
}