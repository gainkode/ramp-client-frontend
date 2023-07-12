import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	AfterContentInit,
	ContentChildren,
	EventEmitter,
	Component,
	QueryList,
	ViewChild,
	OnInit,
	Output,
	Input,
} from '@angular/core';
import { MatColumnDef, MatHeaderRowDef, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnsubscriberBase } from 'services/unsubscriber.base';
import { ColumnTypes, TableColumnConfig } from './table.model';

@Component({
	selector: 'app-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> extends UnsubscriberBase implements AfterContentInit, OnInit {
	@ContentChildren(MatHeaderRowDef) headerRowDefs: QueryList<MatHeaderRowDef>;
	@ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;
	@ContentChildren(MatRowDef) rowDefs: QueryList<MatRowDef<T>>;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatTable, { static: true }) table: MatTable<T>;

	@Input() decorativeRowsCount = 0;
	@Input() pageSizeOptions: number[] = [10, 25, 50];
	@Input() pageSize = 25;

	@Input()
	public set columns(columns: TableColumnConfig<T>[]) {
		this._displayColumns = columns;
	}

	@Input() dataSource: MatTableDataSource<T>;
	@Input() withRowAction = false;
	@Input() withDetails = false;
	@Input() withTotal = false;
	@Input() maxHeight: string;
	@Input() isSticky = true;
	@Input() sort: MatSort;

	@Input() conditionForGrayOut: (row: T) => boolean = null;

	@Output() expandDetail: EventEmitter<T> = new EventEmitter<T>();
	@Output() rowClick: EventEmitter<T> = new EventEmitter<T>();

	public readonly columnTypes: typeof ColumnTypes = ColumnTypes;

	public expandedElement: T | null;

	private _displayColumns: TableColumnConfig<T>[] = [];
	private _isPresenterModeEnabled: boolean;

	constructor(
		private cdr: ChangeDetectorRef,
	) {
		super();
	}

	public ngOnInit(): void {
		this.cdr.markForCheck();
	}

	public ngAfterContentInit(): void {
		this.columnDefs.forEach((columnDef) => this.table.addColumnDef(columnDef));
		this.rowDefs.forEach((rowDef) => this.table.addRowDef(rowDef));
		this.headerRowDefs.forEach((headerRowDef) => this.table.addHeaderRowDef(headerRowDef));

		if (this.decorativeRowsCount < 1) {
			this.dataSource.paginator = this.paginator;
		}
		if (this.sort) {
			this.dataSource.sort = this.sort;
		}
	}

	public onRowClick(row: T): void {
		if (this.withDetails) {
			this.expandedElement = this.expandedElement === row ? null : row;
			this.expandDetail.emit(this.expandedElement);
		}
		if (this.withDetails || this.withRowAction) {
			this.rowClick.emit(row);
		}
	}

	public getRowColumnValue(row: T, column: TableColumnConfig<T>): any {
		if (column.nestedProp) {
			return row[column.prop as keyof T][column.nestedProp];
		}
		return row[column.prop as keyof T];
	}

	public get availableColumns(): TableColumnConfig<T>[] {
		return this._displayColumns;
	}

	public get tableColumns(): string[] {
		return this._displayColumns.map((item) => item.prop as string);
	}

	public get isPresenterModeEnabled(): boolean {
		return this._isPresenterModeEnabled;
	}
}
