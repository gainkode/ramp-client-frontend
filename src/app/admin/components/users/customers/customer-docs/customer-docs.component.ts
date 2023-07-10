import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TableColumnConfig } from 'components/data-list/table/table.model';
import { Observable, Subject, map, startWith, takeUntil, tap } from 'rxjs';
import { customerDocumentsConfig } from '../customer-docs.config';
import { CustomerDocument, DocumentTypeValue, DocumentType, DocumentSide, GetDocumentFileResult } from '../models/customer-docs.model';
import { CustomerDocsApi } from '../services/customer-docs.api';
import { CustomerDocsFacadeService } from '../services/customer-docs.service';
import { CustomerDocsStateService } from '../services/customer-docs.state';
import { MatTableDataSource } from '@angular/material/table';
import { customFilterPredicate } from 'components/data-list/table/filter-predicate.util';

@Component({
	selector: 'app-admin-customer-docs',
	templateUrl: './customer-docs.component.html',
	styleUrls: ['./customer-docs.component.scss'],
	providers: [
		CustomerDocsApi,
		CustomerDocsStateService,
		CustomerDocsFacadeService],
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
	// changeDetection: ChangeDetectionStrategy.OnPush
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
		group: new FormControl<DocumentType>(DocumentType.ID),
		type: new FormControl<DocumentTypeValue>(DocumentTypeValue.Id),
		name: new FormControl<string>(undefined),
		side: new FormControl<DocumentSide>(undefined),
		description: new FormControl<string>(undefined)
	});

	documentTypes$ = this.form.controls.group.valueChanges.pipe(
		startWith(this.form.controls.group.value),
		takeUntil(this.destroy$),
		tap(() => this.form.controls.type.setValue(null)),
		map((type: DocumentType) => this.defineDocumentTypes(type))
	);

	isEditDocument = false;
	dataSource$: Observable<CustomerDocument[]>;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private service: CustomerDocsFacadeService
	) {}

	get isDocumentSide(): boolean {
		const type = this.form.controls.type.value;

		return [DocumentTypeValue.Id, DocumentTypeValue.DrivingLicense].includes(type);
	}

	get isDocumentTypeGrouped(): boolean {
		const group = this.form.controls.group.value;
		const validDocumentTypes = [DocumentType.ID, DocumentType.POA, DocumentType.DOD];

		return validDocumentTypes.includes(group);
	}

	defineDocumentTypes(type: DocumentType): DocumentTypeValue[] {
		switch (type) {
			case DocumentType.ID:
				return [
					DocumentTypeValue.Id, 
					DocumentTypeValue.DrivingLicense, 
					DocumentTypeValue.Passport
				];
		  	case DocumentType.POA:
				return [
					DocumentTypeValue.BankStatement, 
					DocumentTypeValue.UtilityBill, 
					DocumentTypeValue.GovernmentIssuedDoc, 
					DocumentTypeValue.TaxBill, 
					DocumentTypeValue.PropertyTax, 
					DocumentTypeValue.PermanentResidency
				];
		  	case DocumentType.DOD:
				return [
					DocumentTypeValue.DoD, 
					DocumentTypeValue.Audit, 
				];
		 	 default:
				return null;
		}
	}

	public ngOnInit(): void {
		this.tableDataSource.filterPredicate = customFilterPredicate;
		this.service.loadAll(this.userId).pipe(takeUntil(this.destroy$)).subscribe();

		this.service.getState$
			.pipe(map(x => x?.documents), takeUntil(this.destroy$))
			.subscribe((data) => this.tableDataSource.data = data);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.isEditDocument = false;
	}

	onAddDocument(): void {
		this.isEditDocument = true;

		this.fillForm(this.customerDocs);
	}

	onEditDocument(): void {
		this.isEditDocument = true;
	}

	onCancelEditDocument(): void {
		this.isEditDocument = false;
	}

	onSave(): void {
		const formData = new FormData();
		// formData.append('file', this.uploadForm.get('profile').value);

		this.mapFormToEntity(this.customerDocs)
	}

	onFileSelected(event: FormData): void {
		console.log(event.has('files'))
		// if (event.target.files.length > 0) {
		// 	const file = event.target.files[0];
		// 	this.uploadForm.get('profile').setValue(file);
		//   }
	}

	fillForm(ent: CustomerDocument, file?: GetDocumentFileResult): void {
		this.form.patchValue({ ...ent });
	}

	private mapFormToEntity(entity: CustomerDocument): CustomerDocument {
		const formValue = this.form.value;
		console.log(entity)
		entity.description = formValue.description;
		entity.name = formValue.name;
		entity.side = formValue.side;
		entity.type = formValue.type;

		console.log(entity)

		return entity;
	}
}