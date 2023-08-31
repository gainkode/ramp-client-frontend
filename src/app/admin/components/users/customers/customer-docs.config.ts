import { TableColumnConfig, ColumnTypes } from 'components/data-list/table/table.model';
import { CustomerDocument } from './models/customer-docs.model';

export const customerDocumentsConfig: TableColumnConfig<CustomerDocument>[] = [
	{
		name: 'Name',
		prop: 'name',
		columnType: ColumnTypes.simple,
		// isSortable: true,
	},
	{
		name: 'Description',
		prop: 'description',
		columnType: ColumnTypes.simple,
		// isSortable: true,
	},
	{
		name: 'Type',
		prop: 'type',
		columnType: ColumnTypes.simple,
		// isSortable: true,
	},
	{
		name: 'Created',
		prop: 'created',
		columnType: ColumnTypes.shortDate,
		// isSortable: true,
	},
	{
		name: 'Actions',
		prop: '...',
		columnType: ColumnTypes.custom,
	},
];
