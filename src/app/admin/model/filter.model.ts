import { AccountStatus, CountryCodeType, DateTimeInterval, KycStatus, PaymentInstrument, RiskAlertCodes, RiskLevel, TransactionSource, TransactionStatus, TransactionType, UserMode, UserType } from '../../model/generated-models';
import { EmptyObject } from 'apollo-angular/types';

export class Filter {
  public accountTypes?: Array<UserType>;
  public accountModes?: Array<UserMode>;
  public accountStatuses?: Array<AccountStatus>;
  public assets?: Array<string>;
  public countries?: Array<string>; // code3
  public sources?: Array<TransactionSource>;
  public user?: string;
  public users?: Array<string>;
  public widgets?: Array<string>;
  public riskAlertCode?: RiskAlertCodes;
  public transactionTypes?: Array<TransactionType>;
  public transactionStatuses?: Array<TransactionStatus>;
  public userTierLevels?: string;
  public kycStatuses?: Array<KycStatus>;
  public riskLevels?: Array<RiskLevel>;
  public paymentInstruments?: Array<PaymentInstrument>;
  public createdDateInterval?: DateTimeInterval;
  public completedDateInterval?: DateTimeInterval;
  public transactionDate?: Date;
  public registrationDate?: Date;
  public walletAddress?: string;
  public totalBuyVolumeOver?: number;
  public transactionCountOver?: number;
  public search?: string;

  constructor(filterValues: EmptyObject) {
    if (filterValues.accountTypes) {
      this.accountTypes = filterValues.accountTypes;
    }

    if (filterValues.accountStatuses) {
      this.accountStatuses = filterValues.accountStatuses;
    }

    if (filterValues.assets) {
      this.assets = filterValues.assets;
    }

    if (filterValues.countries) {
      this.countries = filterValues.countries;
    }

    if (filterValues.sources) {
      this.sources = filterValues.sources;
    }

    if (filterValues.user) {
      this.user = filterValues.user;
    }

    if (filterValues.users) {
      this.users = filterValues.users;
    }

    if (filterValues.users) {
      this.users = filterValues.users;
    }

    if (filterValues.transactionDate) {
      const dtNum = Date.parse(filterValues.transactionDate);
      this.transactionDate = isNaN(dtNum) ? undefined : new Date(dtNum);
    }

    //registrationDateOnly: [DateTime]

    if (filterValues.widgets) {
      this.widgets = filterValues.widgets;
    }

    if (filterValues.riskAlertCode) {
      this.riskAlertCode = filterValues.riskAlertCode;
    }

    if (filterValues.kycStatuses) {
      this.kycStatuses = filterValues.kycStatuses;
    }

    if (filterValues.transactionTypes) {
      this.transactionTypes = filterValues.transactionTypes;
    }

    if (filterValues.transactionStatuses) {
      this.transactionStatuses = filterValues.transactionStatuses;
    }

    if (filterValues.userTierLevels) {
      this.userTierLevels = filterValues.userTierLevels;
    }

    if (filterValues.riskLevels) {
      this.riskLevels = filterValues.riskLevels;
    }

    if (filterValues.paymentInstruments) {
      this.paymentInstruments = filterValues.paymentInstruments;
    }

    if (filterValues.createdDateRangeStart || filterValues.createdDateRangeEnd) {
      this.createdDateInterval = this.getDateTimeRange(filterValues.createdDateRangeStart, filterValues.createdDateRangeEnd);
    }

    if (filterValues.completedDateStart || filterValues.completedDateEnd) {
      this.completedDateInterval = this.getDateTimeRange(filterValues.completedDateRangeStart, filterValues.completedDateRangeEnd);
    }

    if (filterValues.walletAddress) {
      this.walletAddress = filterValues.walletAddress;
    }

    if (filterValues.totalBuyVolumeOver) {
      const val = parseInt(filterValues.totalBuyVolumeOver);
      this.totalBuyVolumeOver = isNaN(val) || val === 0 ? undefined : val;
    }

    if (filterValues.transactionCountOver) {
      const val = parseInt(filterValues.transactionCountOver);
      this.transactionCountOver = isNaN(val) || val === 0 ? undefined : val;
    }

    if (filterValues.search) {
      this.search = filterValues.search;
    }
  }

  private getDateTimeRange(start: string, end: string): DateTimeInterval {
    let startNum = Date.parse(start);
    let endNum = Date.parse(end);
    if (!isNaN(startNum) && !isNaN(endNum)) {
      if (startNum > endNum) {
        const pivot = startNum;
        startNum = endNum;
        endNum = pivot;
      }
    }
    const startDate = (isNaN(startNum)) ? undefined : new Date(startNum);
    const endDate = (isNaN(endNum)) ? undefined : new Date(endNum);
    return {
      from: startDate,
      to: endDate
    } as DateTimeInterval;
  }
}
