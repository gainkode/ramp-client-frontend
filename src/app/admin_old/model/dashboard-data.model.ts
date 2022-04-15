interface DashboardCardDataColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'percent' | 'count-volume' | 'action';
  action?: string;
}

interface DashboardCardDataRow {
  [key: string]: string | number | null;
}

export interface DashboardCardData {
  columns: Array<DashboardCardDataColumn>;
  rows: Array<DashboardCardDataRow>;
}

export interface DashboardData {
  total: DashboardCardData;
  deposits: DashboardCardData;
  transfers: DashboardCardData;
  withdrawals: DashboardCardData;
  fees: DashboardCardData;
  balances: DashboardCardData;
}
