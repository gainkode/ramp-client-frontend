import {
  BalanceStats,
  DashboardStats,
  DepositOrWithdrawalStats,
  InstrumentStats,
  MerchantOrCustomerStats, 
  TransactionStatsByStatus, TransactionStatsVolume,
  TransferStats
} from '../../model/generated-models';
import { DecimalPipe } from '@angular/common';
import { PaymentInstrumentList } from '../../model/payment.model';

const isDepositOrWithdrawalStats = (variableToCheck: any): variableToCheck is DepositOrWithdrawalStats => {
  return (variableToCheck) ? (variableToCheck as DepositOrWithdrawalStats).approved !== undefined : false;
};

const isTransferStats = (variableToCheck: any): variableToCheck is TransferStats => {
  return (variableToCheck) ? (variableToCheck as TransferStats).toMerchant !== undefined : false;
};

const isInstrumentStats = (variableToCheck: any): variableToCheck is InstrumentStats => {
  return (variableToCheck) ? (variableToCheck as InstrumentStats).instrument !== undefined : false;
};

export class DashboardBalanceModel {
  currency = '';
  count = 0;
  volume = 0;

  constructor(data: BalanceStats | null) {
    this.currency = data?.currency as string;
    this.count = data?.volume?.count as number;
    this.volume = data?.volume?.volume as number;
  }
}

export class DashboardTransactionVolumeModel {
  count = 0;
  volume = 0;

  constructor(data: TransactionStatsVolume | undefined) {
    this.count = data?.count as number;
    this.volume = data?.volume as number;
  }
}

export class DashboardTransactionItemModel {
  isNull = true;
  title = '';
  ratio = 0;
  approved?: DashboardTransactionVolumeModel;
  declined?: DashboardTransactionVolumeModel;
  abandoned?: DashboardTransactionVolumeModel;
  inProcess?: DashboardTransactionVolumeModel;
  fee?: DashboardTransactionVolumeModel;
  private numberPipe: DecimalPipe = new DecimalPipe('en-US');

  get ratioValue(): string {
    return (this.ratio) ? `${this.ratio}%` : '\u2014';  // long dash
  }

  get approvedValue(): string {
    return (this.approved) ?
      `(${this.approved.count}) ${this.numberPipe.transform(this.approved.volume, '1.0-3')}` :
      '\u2014';
  }

  get declinedValue(): string {
    return (this.declined) ?
      `(${this.declined.count}) ${this.numberPipe.transform(this.declined.volume, '1.0-3')}` :
      '\u2014';
  }

  get abandonedValue(): string {
    return (this.abandoned) ?
      `(${this.abandoned.count}) ${this.numberPipe.transform(this.abandoned.volume, '1.0-3')}` :
      '\u2014';
  }

  get inProcessValue(): string {
    return (this.inProcess) ?
      `(${this.inProcess.count}) ${this.numberPipe.transform(this.inProcess.volume, '1.0-3')}` :
      '\u2014';
  }

  get feeValue(): string {
    return (this.fee) ? `(${this.fee.count}) ${this.numberPipe.transform(this.fee.volume, '1.0-3')}` : '\u2014';
  }

  constructor(
    data: DepositOrWithdrawalStats | InstrumentStats | TransferStats | MerchantOrCustomerStats | TransactionStatsByStatus | null,
    title: string = '') {
    this.isNull = (data === null);
    if (isDepositOrWithdrawalStats(data) || isInstrumentStats(data) || isTransferStats(data)) {
      this.ratio = data.ratio as number;
      this.approved = new DashboardTransactionVolumeModel(data?.approved as TransactionStatsVolume | undefined);
      this.declined = new DashboardTransactionVolumeModel(data?.declined as TransactionStatsVolume | undefined);
      this.abandoned = new DashboardTransactionVolumeModel(data?.abandoned as TransactionStatsVolume | undefined);
      this.inProcess = new DashboardTransactionVolumeModel(data?.inProcess as TransactionStatsVolume | undefined);
      this.fee = new DashboardTransactionVolumeModel(data?.fee as TransactionStatsVolume | undefined);
      if (isInstrumentStats(data)) {
        const instrument = PaymentInstrumentList.find((x) => x.id === (data as InstrumentStats).instrument);
        if (instrument) {
          this.title = instrument.name;
        }
      }
      if (title) {
        this.title = title;
      }
    }
  }
}

export const isOfType = <T>(varToBeChecked: any, propertyToCheckFor: keyof T): varToBeChecked is T =>
  (varToBeChecked as T)[propertyToCheckFor] !== undefined;

export class DashboardTransactionModel {
  isNull = true;
  total?: DashboardTransactionItemModel;
  details: DashboardTransactionItemModel[] = [];

  constructor(data: DepositOrWithdrawalStats | TransferStats | undefined) {
    if (data) {
      this.total = new DashboardTransactionItemModel(data);
      this.isNull = this.total.isNull;

      if (isDepositOrWithdrawalStats(data)) {
        data.byInstruments?.forEach(x => {
          this.details.push(new DashboardTransactionItemModel(x));
        });
      }
      if (isTransferStats(data)) {
        this.details.push(
          new DashboardTransactionItemModel(data.toMerchant as MerchantOrCustomerStats, 'To Merchants'));
        this.details.push(
          new DashboardTransactionItemModel(data.toCustomer as MerchantOrCustomerStats, 'To Customers'));
      }
    }
  }
}

export class DashboardModel {
  totals: DashboardTransactionItemModel[] = [];
  balances: DashboardBalanceModel[] = [];
  deposits = new DashboardTransactionModel(undefined);
  withdrawals = new DashboardTransactionModel(undefined);
  transfers = new DashboardTransactionModel(undefined);

  constructor(data: DashboardStats | null) {
    if (data !== null) {
      data.balances?.forEach(x => {
        this.balances.push(new DashboardBalanceModel(x));
      });
      this.deposits = new DashboardTransactionModel(data.deposits as DepositOrWithdrawalStats | undefined);
      this.transfers = new DashboardTransactionModel(data.transfers as TransferStats | undefined);
      this.withdrawals = new DashboardTransactionModel(data.withdrawals as DepositOrWithdrawalStats | undefined);

      if (this.deposits.total) {
        this.deposits.total.title = 'Deposits';
        if (!this.deposits.total.isNull) {
          this.totals.push(this.deposits.total);
        }
      }
      if (this.transfers.total) {
        this.transfers.total.title = 'Transfers';
        if (!this.transfers.total.isNull) {
          this.totals.push(this.transfers.total);
        }
      }
      if (this.withdrawals.total) {
        this.withdrawals.total.title = 'Withdrawals';
        if (!this.withdrawals.total.isNull) {
          this.totals.push(this.withdrawals.total);
        }
      }
    }
  }
}
