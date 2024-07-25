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
	@Input() userId: string;
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
	constructor(
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private serviceApi: TransactionDocsApi,
		public dialog: MatDialog,
		private service: TransactionDocsFacadeService
	) {
		// this.form.controls.group.valueChanges
		// 	.pipe(takeUntil(this.destroy$))
		// 	.subscribe(() => {
		// 		const typeControl = this.form.controls.type;

		// 		if (this.isDocumentTypeGrouped) {
		// 			typeControl.setValidators(Validators.required);
		// 		} else {
		// 			typeControl.clearValidators();
		// 		}

		// 		typeControl.updateValueAndValidity();
		// 	});

		// this.form.controls.type.valueChanges
		// 	.pipe(takeUntil(this.destroy$))
		// 	.subscribe((type) => {
		// 		const side = this.form.controls.side;

		// 		if (type === DocumentTypeValue.Id || type === DocumentTypeValue.DrivingLicense) {
		// 			side.setValidators(Validators.required);
		// 		} else {
		// 			side.clearValidators();
		// 		}

		// 		side.updateValueAndValidity();
		// 	});
	}

	get isFileUploaded(): boolean {
		return this.formData?.has('files');
	}

	// get isDocumentSide(): boolean {
	// 	const type = this.form.controls.type.value;
	// 	return [DocumentTypeValue.Id, DocumentTypeValue.DrivingLicense].includes(type);
	// }

	// get isDocumentTypeGrouped(): boolean {
	// 	const group = this.form.controls.group.value;
	// 	const validDocumentTypes = [DocumentType.ID, DocumentType.ProofOfAddress, DocumentType.DoD];

	// 	return validDocumentTypes.includes(group);
	// }

	public ngOnInit(): void {
		this.tableDataSource.filterPredicate = customFilterPredicate;
		this.getAllSignatures(true);

		this.service.getState$
			.pipe(map(x => x?.documents), takeUntil(this.destroy$))
			.subscribe((data) => {
				this.selectedSignature = data[0];
				const datepipe = new DatePipe('en-US');
				
				this.form.patchValue({
						status: this.selectedSignature.status,
						executedAt: datepipe.transform(this.selectedSignature.executedAt, 'dd MMM YYYY') as string,
						createdAt:  datepipe.transform(this.selectedSignature.createdAt, 'dd MMM YYYY HH:mm:ss') as string,
				});
			
				console.log(this.selectedSignature)

				this.tableDataSource.data = this.selectedSignature.signatureDocument;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.isEditDocument = false;
	}

	onAddDocument(): void {
		this.isEditDocument = true;
	}

	onCancelEditDocument(): void {
		this.isEditDocument = false;
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

		// this.formData.append('name', formValue.name);
		// this.formData.append('description', formValue.description);
		// this.formData.append('type', formValue.type);
		// this.formData.append('side', formValue.side ?? DocumentSide.Front);
		// this.formData.append('userId', this.userId);

		this.uploadProgress = 1;

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
		this.service.loadAll(this.userId, skipCache).pipe(takeUntil(this.destroy$)).subscribe();
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