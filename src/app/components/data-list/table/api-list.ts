import { Observable } from 'rxjs';
import { IApiListFilters } from './table.model';

export interface ApiList<DataType> {
	isUpdating$(): Observable<boolean>;

	load(payload: IApiListPayload<DataType>): Observable<IApiListState<DataType>>;

	get(): Observable<IApiListState<DataType>>;
}

export interface ApiListFilters<DataType> {
	set(filters: IApiListFilters<DataType>);

	get(): Observable<IApiListFilters<DataType>>;

	getValue(): IApiListFilters<DataType>;
}

export interface IApiListState<DataType> {
	items: DataType[];
	total_count: number;
}

export interface IApiListPayload<DataType> {
	filters: IApiListFilters<DataType>;
	sorting_column: keyof DataType;
	sorting_order: 'asc' | 'desc';
	pageSize: number;
	pageIndex: number;
}

export type Filter = DateFilter | string;
export type DateFilter = { start: string; end: string; };
