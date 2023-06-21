import { trigger, transition, style, animate } from '@angular/animations';
import { DataSource } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerDocument, DocumentTypeValueType, GetDocumentFileResult } from 'admin/model/customer.model';
import { Observable, ReplaySubject, Subject } from 'rxjs';

const ELEMENT_DATA: any[] = [
	{position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
	{position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
	{position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
	{position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
	{position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
	{position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
	{position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
	{position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
	{position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
	{position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];

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
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCustomerDocsComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	documentTypes: string[] = Object.values(DocumentTypeValueType).map((value) => String(value));
	displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
	dataToDisplay = [...ELEMENT_DATA];
  
	dataSource = new ExampleDataSource(this.dataToDisplay);

	form = this.fb.group({
		type: new FormControl<DocumentTypeValueType>(undefined),
		name: new FormControl<string>(undefined),
		description: new FormControl<string>(undefined)
	});

	isEditDocument = false;
	
	constructor(
		private fb: FormBuilder,
		private router: Router
	) {}

	ngOnInit(): void {
		console.log(this.documentTypes)
	}

	ngOnDestroy(): void {
		this.destroy$.next();
	}

	onAddDocument(): void {
		this.isEditDocument = true;
	}

	onEditDocument(): void {
		this.isEditDocument = true;
	}

	onCancelEditDocument(): void {
		this.isEditDocument = false;
	}

	fillForm(ent: CustomerDocument, file?: GetDocumentFileResult): void {
		// this.form.patchValue({
		// 	type: ent.type,
		// 	desription: ent.description,
		// 	name: ent.name
		// });
		this.form.patchValue({ ...ent });
	}
}

class ExampleDataSource extends DataSource<any> {
	private _dataStream = new ReplaySubject<any[]>();
  
	constructor(initialData: any[]) {
	  super();
	  this.setData(initialData);
	}
  
	connect(): Observable<any[]> {
	  return this._dataStream;
	}
  
	disconnect() {}
  
	setData(data: any[]) {
	  this._dataStream.next(data);
	}
}