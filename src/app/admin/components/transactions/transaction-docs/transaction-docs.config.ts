import { TableColumnConfig, ColumnTypes } from 'components/data-list/table/table.model';
import { SignatureDocument } from '../models/transaction-docs.model';

export const SignaturesConfig: TableColumnConfig<SignatureDocument>[] = [
	{
		name: 'Status',
		prop: 'status',
		columnType: ColumnTypes.simple,
	},
	{
		name: 'Created',
		prop: 'createdAt',
		columnType: ColumnTypes.shortDate,
	},
	{
		name: 'Executed',
		prop: 'executedAt',
		columnType: ColumnTypes.shortDate,
	},
	{
		name: 'Actions',
		prop: '...',
		columnType: ColumnTypes.custom,
	},
];
