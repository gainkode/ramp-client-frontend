import { SortDirection } from '@angular/material/sort';
import { Filter } from 'admin/model/filter.model';
import { Observable } from 'rxjs';


export enum ColumnTypes {
	simple = 'columnSimple',
	custom = 'columnCustom',
	shortDate = 'columnShortDate',
	number = 'number',
	fullDate = 'columnFullDate',
	boolean = 'columnBoolean',
	priceWithCurrency = 'priceWithCurrency',
	percent = 'percent'
}

export interface TableColumnConfig<DataType> {
	/**
	 * prop can use for identify nested property of object. Ex. 'property.nestedProperty'
	 */
	prop?: string;
	name?: string;
	isHidden?: boolean;
	isStatic?: boolean;
	nestedProp?: string;
	additionalProp?: string;
	isRestricted?: boolean;
	permissionKey?: string;
	isSortable?: boolean;
	columnType?: ColumnTypes;
	appendUnits?: string;
	isExportable?: boolean;
	presentationModeBehaviour?: PresentationModeBehaviour;
}

export const DEFAULT_ITEMS_AMOUNT = 25;
export const INITIAL_PAGE = 1;

export enum PresentationModeBehaviour {
	Hide,
	Blur,
}

export interface Sort {
	column: string;
	order: SortDirection;
}

export interface DataRequestOption<FilterType = {}> {
	pageIndex: number;
	pageSize: number;
	filters: FilterType; // IApiListFilters<FilterType>
	sort?: Sort;
}
export type DataMetrics<T extends object> = {
	avgEfficiencyScore?: number;
	totalMonthlyCost?: number;
	totalStorageCapacity?: string;
} & T;

export interface ApiResponse<DataType, TableAggregateMetrics extends object = {}> {
	pageIndex: number;
	pageSize: number;
	totalCount: number;
	items: DataType[];
	tableMetricsData?: DataMetrics<TableAggregateMetrics>;
}

export interface Api<DataType, TableAggregateMetrics extends object = object> {
	get(request: DataRequestOption<DataType>): Observable<ApiResponse<DataType, TableAggregateMetrics>>;
}

export type IApiListFilters<DataType> = Partial<Record<keyof DataType, Filter>>;

export type ItemIdentityFn<DataType> = (index: number, item: DataType) => string | number;
