import { CountryCodeType, DateTimeInterval, PaymentInstrument, RiskAlertCodes, TransactionSource, TransactionType, UserType } from '../../model/generated-models';
import { EmptyObject } from 'apollo-angular/types';

export class Filter {
  public accountTypes?: Array<UserType>;
  public assets?: Array<string>;
  public countries?: Array<string>; // code3
  public sources?: Array<TransactionSource>;
  public user?: string;
  public users?: Array<string>;
  public widgets?: Array<string>;
  public riskAlertCode?: RiskAlertCodes;
  public transactionTypes?: Array<TransactionType>;
  public userTierLevels?: string;
  public riskLevels?: Array<string>;
  public paymentInstruments?: Array<PaymentInstrument>;
  public createdDateInterval?: DateTimeInterval;
  public completedDateInterval?: DateTimeInterval;
  public walletAddress?: string;
  public search?: string;

  constructor(filterValues: EmptyObject) {
    if (filterValues.accountTypes) {
      this.accountTypes = filterValues.accountTypes;
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

    if (filterValues.widgets) {
      this.widgets = filterValues.widgets;
    }

    if (filterValues.riskAlertCode) {
      this.riskAlertCode = filterValues.riskAlertCode;
    }

    if (filterValues.transactionTypes) {
      this.transactionTypes = filterValues.transactionTypes;
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

    if (filterValues.createdDateStart && filterValues.createdDateEnd) {
      this.createdDateInterval = {
        from: filterValues.createdDateStart,
        to: filterValues.createdDateEnd
      };
    }

    if (filterValues.completedDateStart && filterValues.completedDateEnd) {
      this.completedDateInterval = {
        from: filterValues.completedDateStart,
        to: filterValues.completedDateEnd
      };
    }

    if (filterValues.walletAddress) {
      this.walletAddress = filterValues.walletAddress;
    }

    if (filterValues.search) {
      this.search = filterValues.search;
    }
  }

}
