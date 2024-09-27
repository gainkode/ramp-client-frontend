
import { PaymentInstrumentList } from 'model/payment.model';
import { EnvService } from 'services/env.service';

// Helper function to create each row
export const createRow = (type: string, data: any) => ({
  type,
  approved: `(${data?.approved?.count ?? 'N/A'}) ${data?.approved?.volume ?? 'N/A'}`,
  declined: `(${data?.declined?.count ?? 'N/A'}) ${data?.declined?.volume ?? 'N/A'}`,
  abandoned: `(${data?.abandoned?.count ?? 'N/A'}) ${data?.abandoned?.volume ?? 'N/A'}`,
  failed: `(${data?.failed?.count ?? 'N/A'}) ${data?.failed?.volume ?? 'N/A'}`,
  chargedBack: `(${data?.chargedBack?.count ?? 'N/A'}) ${data?.chargedBack?.volume ?? 'N/A'}`,
  ratio: data?.ratio ? `${data.ratio}` : 'N/A',
});

// Helper function to generate columns

export const getColumns = (type: string) => {
  const baseColumns = [
    { key: 'approved', label: 'Approved', type: 'count-volume' },
    { key: 'declined', label: 'Declined', type: 'count-volume' },
    { key: 'abandoned', label: 'Abandoned', type: 'count-volume' },
    { key: 'failed', label: 'Failed', type: 'count-volume' },
    { key: 'chargedBack', label: 'Charged back', type: 'count-volume' },
    { key: 'ratio', label: 'Success Rate, %', type: 'percent' },
  ];

	let rowToInsert = undefined;

	if (type === 'total') {
		rowToInsert = { key: 'type', label: 'Transaction Type', type: 'text' };
	}

	if (type === 'buys' || type === 'deposits' || type === 'withdrawals' || type ==='sells') {
		rowToInsert = { key: 'type', label: 'Payment Method', type: 'text' };
	}
	
	if (type === 'receives') {
		rowToInsert = { key: 'type', label: 'Type', type: 'text' };
	}

	if (rowToInsert) {
		baseColumns.unshift(rowToInsert);
	}

  return baseColumns;
};

// Main function to create the data source
export const getTotalDataSource = (rawData: any, type: string) => {
	let parsedRowData;
	let transactionTypes = [];

	if (type === 'buys' || type === 'deposits' || type === 'withdrawals' || type ==='sells') {
		const filteredInstruments = rawData[type].byInstruments?.map(item => {
			const instrument = PaymentInstrumentList.find(i => i.id === item.instrument);
	
			return {
				...item,
				instrument: instrument?.name ?? '?',
			};
		});
		
		filteredInstruments?.map(item => {
			transactionTypes.push({ type: item.instrument, data: item });
		});	
	} else if (type === 'receives') {
		transactionTypes.push({ type: 'Wire transfer', data: rawData[type] });
	} else {
		parsedRowData = rawData;

		transactionTypes = [
			{ type: 'Deposit', data: parsedRowData.deposits },
			{ type: 'Withdrawal', data: parsedRowData.withdrawals },
			{ type: 'Buy', data: parsedRowData.buys },
			{ type: 'Sell', data: parsedRowData.sells },
			{ type: 'Send', data: parsedRowData.transfers },
			{ type: 'Receive', data: parsedRowData.receives },
		];
	}

	let rows = transactionTypes.map(({ type, data }) => createRow(type, data));

  // Conditional removal of deposit and withdrawal rows
  if (!EnvService.deposit_withdrawal) {
    rows = rows.filter(row => row.type !== 'Deposit' && row.type !== 'Withdrawal');
  }

  // Extract columns
	let columns;
	
	if (type === 'total' || type === 'buys' || type === 'sells' || type ==='receives' || type === 'deposits' || type === 'withdrawals') {
		columns = getColumns(type);
	}

  return {
    columns,
    rows,
  };
};

// Function to map rows for UI display
export const mapRowsForDisplay = (rows: any[], type: string) => rows.map(row => ({
  type: row.type || row.instrument,
  approved: row.approved,
  declined: row.declined,
  abandoned: row.abandoned,
  failed: row.failed,
  chargedBack: row.chargedBack,
  ratio: row.ratio,
}));

// Function to extract column keys for display
export const getDisplayedColumns = (columns: any[], type: string) => columns.map(col => col.key);