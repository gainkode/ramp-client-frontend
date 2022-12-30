import { AccountStatus, DateTimeInterval, KycStatus, PaymentInstrument, RiskAlertCodes, RiskLevel, TransactionKycStatus, TransactionSource, TransactionStatus, TransactionType, UserActionResult, UserActionType, UserMode, UserType } from '../../model/generated-models';
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
  public widgetNames?: Array<string>;
  public riskAlertCode?: RiskAlertCodes;
  public transactionIds?: Array<string>;
  public transactionTypes?: Array<TransactionType>;
  public transactionStatuses?: Array<TransactionStatus>;
  public tiers?: Array<string>;
  public kycStatuses?: Array<KycStatus>;
  public transactionKycStatuses?: Array<TransactionKycStatus>;
  public riskLevels?: Array<RiskLevel>;
  public paymentInstruments?: Array<PaymentInstrument>;
  public createdDateInterval?: DateTimeInterval;
  public completedDateInterval?: DateTimeInterval;
  public registrationDateInterval?: DateTimeInterval;
  public updatedDateInterval?: DateTimeInterval;
  public transactionDate?: Date;
  public walletAddress?: string;
  public walletIds?: Array<string>;
  public totalBuyVolumeOver?: number;
  public transactionCountOver?: number;
  public search?: string;
  public verifyWhenPaid?: boolean;
  public transactionFlag?: boolean;
  public preauthFlag?: boolean;
  public zeroBalance?: boolean;
  public transactionId?: string;
  public userId?: string;
  public resultsOnly?: Array<UserActionResult>; 
  public statusesOnly?: Array<string>;
  public userActionTypes?: Array<UserActionType>;

  constructor(filterValues: EmptyObject) {
    if(filterValues.resultsOnly){
      this.resultsOnly = filterValues.resultsOnly;
    }

    if(filterValues.statusesOnly){
      this.statusesOnly = filterValues.statusesOnly;
    }

    if(filterValues.userActionTypes){
      this.userActionTypes = filterValues.userActionTypes;
    }

    if (filterValues.accountTypes) {
      this.accountTypes = filterValues.accountTypes;
    }

    if (filterValues.accountModes) {
      this.accountModes = filterValues.accountModes;
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

    if (filterValues.transactionDate) {
      const dtNum = Date.parse(filterValues.transactionDate);
      this.transactionDate = isNaN(dtNum) ? undefined : new Date(dtNum);
    }

    if (filterValues.widgets) {
      this.widgets = filterValues.widgets;
    }

    if (filterValues.widgetNames) {
      this.widgetNames = filterValues.widgetNames;
    }

    if (filterValues.riskAlertCode) {
      this.riskAlertCode = filterValues.riskAlertCode;
    }

    if (filterValues.kycStatuses) {
      this.kycStatuses = filterValues.kycStatuses;
    }

    if (filterValues.transactionKycStatuses) {
      this.transactionKycStatuses = filterValues.transactionKycStatuses;
    }

    if (filterValues.transactionIds) {
      this.transactionIds = filterValues.transactionIds;
    }

    if (filterValues.transactionTypes) {
      this.transactionTypes = filterValues.transactionTypes;
    }

    if (filterValues.transactionStatuses) {
      this.transactionStatuses = filterValues.transactionStatuses;
    }

    if (filterValues.tiers) {
      this.tiers = filterValues.tiers;
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

    if (filterValues.completedDateRangeStart || filterValues.completedDateRangeEnd) {
      this.completedDateInterval = this.getDateTimeRange(filterValues.completedDateRangeStart, filterValues.completedDateRangeEnd);
    }

    if (filterValues.registrationDateRangeStart || filterValues.registrationDateRangeEnd) {
      this.registrationDateInterval = this.getDateTimeRange(filterValues.registrationDateRangeStart, filterValues.registrationDateRangeEnd);
    }

    if (filterValues.updatedDateRangeStart || filterValues.updatedDateRangeEnd) {
      this.updatedDateInterval = this.getDateTimeRange(filterValues.updatedDateRangeStart, filterValues.updatedDateRangeEnd);
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

    if (filterValues.verifyWhenPaid) {
      this.verifyWhenPaid = filterValues.verifyWhenPaid;
    }
    if (filterValues.transactionFlag) {
      this.transactionFlag = filterValues.transactionFlag;
    }
    if (filterValues.preauthFlag) {
      this.preauthFlag = filterValues.preauthFlag;
    }
    if(filterValues.zeroBalance){
      this.zeroBalance = filterValues.zeroBalance;
    }
    if (filterValues.transactionId) {
      this.transactionId = filterValues.transactionId;
    }
    if (filterValues.userId) {
      this.userId = filterValues.userId;
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
    const def = startDate || endDate;
    return {
      from: (def) ? (startDate ?? new Date(0)) : startDate,
      to: (def) ? (endDate ?? new Date()) : endDate
    } as DateTimeInterval;
  }
}
