import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { customFilterPredicate } from 'components/data-list/table/filter-predicate.util';
import { TableColumnConfig } from 'components/data-list/table/table.model';
import { DeleteDialogBox } from 'components/dialogs/delete-box.dialog';
import { Observable, Subject, Subscription, filter, finalize, map, switchMap, takeUntil } from 'rxjs';
import { Signature, SignatureDocument, SignatureDocumentFile, SignatureStatus } from '../models/transaction-docs.model';
import { TransactionDocsApi } from '../services/transaction-docs.api';
import { TransactionDocsFacadeService } from '../services/transaction-docs.service';
import { TransactionDocsStateService } from '../services/transaction-docs.state';
import { SignaturesConfig } from './transaction-docs.config';
import { tableAnimation } from 'components/data-list/table/table.animation';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-transaction-docs',
  templateUrl: './transaction-docs.component.html',
  styleUrls: ['./transaction-docs.component.scss'],
	animations: tableAnimation,
  providers: [
    TransactionDocsApi,
    TransactionDocsStateService,
    TransactionDocsFacadeService,
  ],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDocsComponent implements OnInit, OnDestroy {
	@Input() transactionId: string;
	public readonly config: TableColumnConfig<SignatureDocument>[] = SignaturesConfig;
	public readonly tableDataSource = new MatTableDataSource<SignatureDocument>([]);
	public readonly isLoading$: Observable<boolean> = this.service.getState$.pipe(map(x => x?.isLoading));
	public readonly isLoaded$: Observable<boolean> = this.service.getState$.pipe(map(x => x?.isLoaded));
	private readonly destroy$ = new Subject<void>();

	signatureStatuses: string[] = Object.values(SignatureStatus).map((value) => String(value));
	displayedColumns: string[] = ['name', 'description', 'type', 'created'];

	form = this.fb.group({
		status: new FormControl<SignatureStatus>(SignatureStatus.COMPLETED, Validators.required),
		createdAt: new FormControl<string | Date>(undefined),
		executedAt: new FormControl<string | Date>(undefined),
	});

	isEditDocument = false;
	public expandedElement: SignatureDocument;
	dataSource$: Observable<SignatureDocument[]>;
	formData: FormData;
	uploadProgress: number;
	uploadSub: Subscription;
	selectedSignature: Signature;
	isSignatureAdd = false;
	constructor(
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private serviceApi: TransactionDocsApi,
		public dialog: MatDialog,
		private service: TransactionDocsFacadeService
	) {}

	get isFileUploaded(): boolean {
		return this.formData?.has('files');
	}

	public ngOnInit(): void {
		this.tableDataSource.filterPredicate = customFilterPredicate;
		this.getAllSignatures(true);

		this.service.getState$
			.pipe(map(x => x?.documents), takeUntil(this.destroy$))
			.subscribe((data) => {
				if (data?.length === 0) {
					this.isSignatureAdd = true;
				} else {
					this.selectedSignature = data[0];
					const datepipe = new DatePipe('en-US');
					
					this.form.patchValue({
						status: this.selectedSignature.status,
						executedAt: datepipe.transform(this.selectedSignature.executedAt, 'dd MMM YYYY') as string,
						createdAt:  datepipe.transform(this.selectedSignature.createdAt, 'dd MMM YYYY HH:mm:ss') as string,
					});

					this.tableDataSource.data = this.selectedSignature.signatureDocument;
				}
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.isEditDocument = false;
	}

	onAddDocument(): void {
		this.isEditDocument = true;
	}

	onSave(): void {
		this.mapFormToEntity();
	}

	onFileSelected(formData: FormData): void {
		this.formData = formData;
	}

	onFileRemove(document: SignatureDocumentFile): void {
		const dialogRef = this.dialog.open(DeleteDialogBox, {
    		width: '400px',
    		data: {
    			title: 'Delete Document',
					message: `You are about to delete a ${document.name} document with files`,
    			button: 'DELETE'
    		}
    	});
    	dialogRef.afterClosed()
			.pipe(
				takeUntil(this.destroy$),
				filter((isConfirmed) => !!isConfirmed),
				switchMap(() => this.service.deleteDocument(document.id)),
			)
			.subscribe();
	}

	onFileDownload(document: SignatureDocument): void {
		this.service.onLoadFiles(document).pipe(takeUntil(this.destroy$)).subscribe();
	}

	public showDetail($event: SignatureDocument): void {
		this.expandedElement = $event;
	}

	private mapFormToEntity(): void {
		const formValue = this.form.value;

		this.formData.append('transactionId', this.transactionId);
		this.formData.append('signatureStatus', formValue.status);


		for (let pair of (this.formData as any).entries()) {
			console.log(pair[0] + ': ' + pair[1]);
		}

		// filesInfo: FileInfoObject[]; 
		// export type FileInfoObject = {
		// 	fileName: string;
		// 	fileType: FileType;
		// 	documentId?: string;
		// };

		this.uploadProgress = 1;

		return
		const upload$ = this.serviceApi.addSignature(this.formData)
			.pipe(takeUntil(this.destroy$), finalize(() => this.reset()));

		this.uploadSub = upload$.subscribe({
			next: (event) => {
				if (event.type === HttpEventType.UploadProgress) {
					this.uploadProgress = Math.round(100 * (event.loaded / event.total));
				}
				this.cdr.markForCheck();
			},
			error: () => {
				this.uploadProgress = undefined;
			}
		});
	}

	private getAllSignatures(skipCache: boolean = false): void {
		this.service.loadAll(this.transactionId, skipCache).pipe(takeUntil(this.destroy$)).subscribe();
	}

	private reset(): void {
		this.uploadSub?.unsubscribe();
		this.isEditDocument = false;
		this.form.reset();
		this.uploadProgress = null;
		this.uploadSub = null;
		this.getAllSignatures(true);
	}
}