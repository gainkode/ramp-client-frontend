import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TableColumnConfig } from 'components/data-list/table/table.model';
import { Observable, Subject, Subscription, distinctUntilChanged, filter, finalize, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { customerDocumentsConfig } from '../customer-docs.config';
import { CustomerDocument, DocumentTypeValue, DocumentType, DocumentSide } from '../models/customer-docs.model';
import { CustomerDocsApi } from '../services/customer-docs.api';
import { CustomerDocsFacadeService } from '../services/customer-docs.service';
import { MatTableDataSource } from '@angular/material/table';
import { customFilterPredicate } from 'components/data-list/table/filter-predicate.util';
import { HttpEventType } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogBox } from 'components/dialogs/delete-box.dialog';
import { CustomerDocsStateService } from '../services/customer-docs.state';

@Component({
	selector: 'app-admin-customer-docs',
	templateUrl: './customer-docs.component.html',
	styleUrls: ['./customer-docs.component.scss'],
	animations: [
		trigger('fade', [
		  transition('void => true', [ // using status here for transition
				style({ opacity: 0 }),
				animate(300, style({ opacity: 1 }))
		  ]),
		  transition('* => void', [
				animate(300, style({ opacity: 0 }))
		  ])
		])
	  ],
	providers: [
		CustomerDocsApi,
		CustomerDocsStateService,
		CustomerDocsFacadeService,
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCustomerDocsComponent implements OnInit, OnDestroy {
	@Input() userId: string;
	public readonly config: TableColumnConfig<CustomerDocument>[] = customerDocumentsConfig;
	public columnsToDisplay: TableColumnConfig<CustomerDocument>[] = customerDocumentsConfig;
	public readonly tableDataSource = new MatTableDataSource<CustomerDocument>([]);
	public readonly isLoading$: Observable<boolean> = this.service.getState$.pipe(map(x => x?.isLoading));
	public readonly isLoaded$: Observable<boolean> = this.service.getState$.pipe(map(x => x?.isLoaded));

	private readonly destroy$ = new Subject<void>();
	private customerDocs: CustomerDocument;

	documentGroups: string[] = Object.values(DocumentType).map((value) => String(value));
	displayedColumns: string[] = ['name', 'description', 'type', 'created'];

	form = this.fb.group({
		group: new FormControl<DocumentType>(DocumentType.ID, Validators.required),
		type: new FormControl<DocumentTypeValue>(undefined, Validators.required),
		name: new FormControl<string>(undefined, Validators.required),
		side: new FormControl<DocumentSide>(undefined),
		description: new FormControl<string>(undefined)
	});

	isEditDocument = false;
	dataSource$: Observable<CustomerDocument[]>;
	formData: FormData;
	uploadProgress: number;
	uploadSub: Subscription;
	documentTypes$ = this.form.controls.group.valueChanges.pipe(
		startWith(this.form.controls.group.value),
		distinctUntilChanged(),
		takeUntil(this.destroy$),
		tap(() => this.form.controls.type.setValue(null)),
		map((group: DocumentType) => this.defineDocumentTypes(group)),
		shareReplay(1)
	);

	constructor(
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private serviceApi: CustomerDocsApi,
		public dialog: MatDialog,
		private service: CustomerDocsFacadeService
	) {
		this.form.controls.group.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				const typeControl = this.form.controls.type;

				if (this.isDocumentTypeGrouped) {
					typeControl.setValidators(Validators.required);
				} else {
					typeControl.clearValidators();
				}

				typeControl.updateValueAndValidity();
			});

		this.form.controls.type.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((type) => {
				const side = this.form.controls.side;

				if (type === DocumentTypeValue.Id || type === DocumentTypeValue.DrivingLicense) {
					side.setValidators(Validators.required);
				} else {
					side.clearValidators();
				}

				side.updateValueAndValidity();
			});
	}

	get isFileUploaded(): boolean {
		return this.formData?.has('files');
	}

	get isDocumentSide(): boolean {
		const type = this.form.controls.type.value;
		return [DocumentTypeValue.Id, DocumentTypeValue.DrivingLicense].includes(type);
	}

	get isDocumentTypeGrouped(): boolean {
		const group = this.form.controls.group.value;
		const validDocumentTypes = [DocumentType.ID, DocumentType.ProofOfAddress, DocumentType.DoD];

		return validDocumentTypes.includes(group);
	}

	defineDocumentTypes(group: DocumentType): DocumentTypeValue[] {
		switch (group) {
			case DocumentType.ID:
				return [
					DocumentTypeValue.Id, 
					DocumentTypeValue.DrivingLicense, 
					DocumentTypeValue.Passport
				];
		  	case DocumentType.ProofOfAddress:
				return [
					DocumentTypeValue.BankStatement, 
					DocumentTypeValue.UtilityBill, 
					DocumentTypeValue.GovernmentIssuedDoc, 
					DocumentTypeValue.TaxBill, 
					DocumentTypeValue.PropertyTax, 
					DocumentTypeValue.PermanentResidency
				];
		  	case DocumentType.DoD:
				return [
					DocumentTypeValue.DoD, 
					DocumentTypeValue.Audit, 
				];
			default: 
				return [];
		}
	}

	public ngOnInit(): void {
		this.tableDataSource.filterPredicate = customFilterPredicate;
		this.getAllDocumets(true);

		this.service.getState$
			.pipe(map(x => x?.documents), takeUntil(this.destroy$))
			.subscribe((data) => this.tableDataSource.data = data);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.isEditDocument = false;
	}

	onAddDocument(): void {
		this.isEditDocument = true;
		this.form.controls.group.setValue(DocumentType.ID);
	}

	onEditDocument(): void {
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

	// fillForm(ent: CustomerDocument): void {
	// 	this.form.patchValue({ ...ent });
	// }

	onFileRemove(document: CustomerDocument): void {
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

	onFileDownload(document: CustomerDocument): void {
		this.service.onLoadFiles(document).pipe(takeUntil(this.destroy$)).subscribe();
	}

	private mapFormToEntity(): void {
		const formValue = this.form.value;
		const documentType = formValue.group;

		switch (documentType) {
			case DocumentType.Selfie:
				formValue.type = DocumentTypeValue.Selfie;
				break;
			case DocumentType.DoDVideo:
				formValue.type = DocumentTypeValue.DoDVideo;
			  	break;
			case DocumentType.Other:
				formValue.type = DocumentTypeValue.Other;
			 	break;
			case DocumentType.SourceOfFunds:
				formValue.type = DocumentTypeValue.SupportingDocuments;
			  	break;
			default:
				break;
		}

		this.formData.append('name', formValue.name);
		this.formData.append('description', formValue.description);
		this.formData.append('type', formValue.type);
		this.formData.append('side', formValue.side ?? DocumentSide.Front);
		this.formData.append('userId', this.userId);

		this.uploadProgress = 1;

		const upload$ = this.serviceApi.addCustomerDocument(this.formData)
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

	private getAllDocumets(skipCache: boolean = false): void {
		this.service.loadAll(this.userId, skipCache).pipe(takeUntil(this.destroy$)).subscribe();
	}

	private reset(): void {
		this.uploadSub?.unsubscribe();
		this.isEditDocument = false;
		this.form.reset();
		this.uploadProgress = null;
		this.uploadSub = null;
		this.getAllDocumets(true);
	}
}