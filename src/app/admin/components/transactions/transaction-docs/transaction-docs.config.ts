import { TableColumnConfig, ColumnTypes } from 'components/data-list/table/table.model';
import { SignatureDocument } from '../models/transaction-docs.model';

export const SignaturesConfig: TableColumnConfig<SignatureDocument>[] = [
	{
		name: 'Status',
		prop: 'status',
		columnType: ColumnTypes.simple,
		// isSortable: true,
	},
	{
		name: 'Created',
		prop: 'createdAt',
		columnType: ColumnTypes.shortDate,
		// isSortable: true,
	},
	{
		name: 'Executed',
		prop: 'executedAt',
		columnType: ColumnTypes.shortDate,
		// isSortable: true,
	},
	{
		name: 'Actions',
		prop: '...',
		columnType: ColumnTypes.custom,
	},
];
