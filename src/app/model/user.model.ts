import { KycStatus, User, UserContact, UserType } from './generated-models';
import {
  UserModeShortList,
  UserModeView,
  UserTypeList,
  UserTypeView
} from './payment.model';
import { getCountryByCode2 } from './country-code.model';
import { CommonTargetValue } from './common.model';
import { DatePipe } from '@angular/common';
import { getCryptoSymbol } from '../utils/utils';

export class UserItem {
  id = '';
  referralCode = '';
  company = '';
  firstName = '';
  lastName = '';
  fullName = '';
  email = '';
  phone = '';
  country: CommonTargetValue | null = null;
  address = '';
  street = '';
  subStreet = '';
  buildingName = '';
  buildingNumber = '';
  flatNumber = '';
  town = '';
  postCode = '';
  stateName = '';
  kycStatus = '';
  accountStatus = '';
  kycVerificationStatus = '';
  kycVerificationAvailable = true;
  kycLevel = '';
  kycLevelMax = false;
  kycLevelIncreasable = false;
  kycComplete = false;
  kycRejected = false;
  userType: UserTypeView | null = null;
  userMode: UserModeView | null = null;
  created = '';
  updated = '';
  fiatCurrency = '';
  cryptoCurrency = '';
  birthday: Date | undefined = undefined;
  age = '';
  risk = '';
  totalBoughtCompleted = 0;
  totalBoughtCompletedCount = 0;
  totalBoughtInProcess = 0;
  totalBoughtInProcessCount = 0;
  totalSoldCompleted = 0;
  totalSoldCompletedCount = 0;
  totalSoldInProcess = 0;
  totalSoldInProcessCount = 0;
  totalSentCompleted = 0;
  totalSentCompletedCount = 0;
  totalSentInProcess = 0;
  totalSentInProcessCount = 0;
  totalReceivedCompleted = 0;
  totalReceivedCompletedCount = 0;
  totalReceivedInProcess = 0;
  totalReceivedInProcessCount = 0;
  totalBought = '';
  totalSold = '';
  totalSent = '';
  totalReceived = '';

  selected = false;

  get countryId(): string | undefined {
    return this.country?.id ?? undefined;
  }

  constructor(data: User | null) {
    if (data) {
      this.id = data.userId;
      this.referralCode = data.referralCode?.toString() ?? '';
      this.userType = UserTypeList.find((x) => x.id === data.type) as UserTypeView;
      this.userMode = UserModeShortList.find((x) => x.id === data.mode) as UserModeView;
      this.firstName = data.firstName as string;
      this.lastName = data.lastName as string;
      this.setFullName();
      this.birthday = (data.birthday) ? new Date(data.birthday) : undefined;
      if (this.birthday) {
        const currentDate = new Date();
        const currentMonths = currentDate.getFullYear() * 10000 + currentDate.getMonth() * 100 + currentDate.getDate();
        const birthDayMonths = this.birthday.getFullYear() * 10000 + this.birthday.getMonth() * 100 + this.birthday.getDate();
        this.age = Math.floor((currentMonths - birthDayMonths) / 10000).toString();
      }
      this.email = data.email;
      this.phone = data.phone ? (data.phone as string) : '';
      this.street = data.street ?? '';
      this.subStreet = data.subStreet ?? '';
      this.buildingName = data.buildingName ?? '';
      this.buildingNumber = data.buildingNumber ?? '';
      this.flatNumber = data.flatNumber ?? '';
      this.town = data.town ?? '';
      this.postCode = data.postCode ?? '';
      this.stateName = data.stateName ?? '';
      this.address = this.getAddress(data);
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string;
      this.updated = datepipe.transform(data.updated, 'dd MMM YYYY HH:mm:ss') as string;
      this.kycStatus = data.kycStatus as string;
      this.accountStatus = data.accountStatus ?? '';
      this.risk = data.risk ?? '';
      this.totalBoughtCompleted = data.totalBoughtCompleted ?? 0;
      this.totalBoughtCompletedCount = data.totalBoughtCompletedCount ?? 0;
      this.totalBoughtInProcess = data.totalBoughtInProcess ?? 0;
      this.totalBoughtInProcessCount = data.totalBoughtInProcessCount ?? 0;
      this.totalSoldCompleted = data.totalSoldCompleted ?? 0;
      this.totalSoldCompletedCount = data.totalSoldCompletedCount ?? 0;
      this.totalSoldInProcess = data.totalSoldInProcess ?? 0;
      this.totalSoldInProcessCount = data.totalSoldInProcessCount ?? 0;
      this.totalSentCompleted = data.totalSentCompleted ?? 0;
      this.totalSentCompletedCount = data.totalSentCompletedCount ?? 0;
      this.totalSentInProcess = data.totalSentInProcess ?? 0;
      this.totalSentInProcessCount = data.totalSentInProcessCount ?? 0;
      this.totalReceivedCompleted = data.totalReceivedCompleted ?? 0;
      this.totalReceivedCompletedCount = data.totalReceivedCompletedCount ?? 0;
      this.totalReceivedInProcess = data.totalReceivedInProcess ?? 0;
      this.totalReceivedInProcessCount = data.totalReceivedInProcessCount ?? 0;
      this.totalBought = (this.totalBoughtCompleted + this.totalBoughtInProcess).toFixed(2);
      this.totalSold = (this.totalSoldCompleted + this.totalSoldInProcess).toFixed(2);
      this.totalSent = (this.totalSentCompleted + this.totalSentInProcess).toFixed(2);
      this.totalReceived = (this.totalReceivedCompleted + this.totalReceivedInProcess).toFixed(2);

      const status = this.kycStatus.toLowerCase();
      if (status === KycStatus.Completed.toLowerCase()) {
        this.kycRejected = false;
        this.kycComplete = true;
        this.kycLevelIncreasable = true;
        this.kycVerificationAvailable = true;
      } else {
        this.kycComplete = false;
        this.kycVerificationAvailable = true;
        if (status === KycStatus.Pending.toLowerCase() ||
          status === KycStatus.Queued.toLowerCase() ||
          status === KycStatus.OnHold.toLowerCase()) {
          this.kycVerificationStatus = 'Verifying';
          this.kycVerificationAvailable = false;
        }
      }

      if (data.kycTier) {
        this.kycLevel = data.kycTier.name;
        this.kycLevelMax = (!data.kycTier.amount);
      }
      const countryObject = getCountryByCode2(data.countryCode2 as string);
      if (countryObject !== null) {
        this.country = new CommonTargetValue();
        this.country.id = countryObject.code3;
        this.country.imgClass = 'country-flag';
        this.country.imgSource = `assets/svg-country-flags/${countryObject.code2.toLowerCase()}.svg`;
        this.country.title = countryObject.name;
      }
      this.fiatCurrency = data.defaultFiatCurrency
        ? (data.defaultFiatCurrency as string)
        : '';
      this.cryptoCurrency = data.defaultCryptoCurrency
        ? (data.defaultCryptoCurrency as string)
        : '';
    }
  }

  private getAddress(user: User): string {
    const postCodeValue = user.postCode ? `${user.postCode}` : '';
    const townValue = user.town ? `${user.town}, ` : '';
    const streetValue = user.street ? `${user.street}` : '';
    const subStreetValue = user.subStreet
      ? ` (${user.subStreet})`
      : '';
    let fullStreetValue = `${streetValue}${subStreetValue}`;
    if (fullStreetValue !== '') {
      fullStreetValue = `${fullStreetValue}. `;
    }
    const stateValue = user.stateName ? `${user.stateName}. ` : '';
    const buildingNameValue = user.buildingName
      ? `${user.buildingName} `
      : '';
    const buildingValue = user.buildingNumber
      ? `${user.buildingNumber}, `
      : '';
    const flatValue = user.flatNumber ? `${user.flatNumber}, ` : '';

    return `${flatValue}${buildingNameValue}${buildingValue}${fullStreetValue}${townValue}${stateValue}${postCodeValue}`;
  }

  setFullName(): void {
    if (this.userType?.id === UserType.Merchant) {
      this.company = (this.firstName) ? this.firstName : '';
      this.firstName = '';
      this.lastName = '';
      this.fullName = this.company;
    } else if (this.userType?.id === UserType.Personal) {
      this.fullName = `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
    }
  }
}

export class ContactItem {
  id = '';
  userId = '';
  contactEmail = '';
  displayName = '';
  created = '';
  asset = '';
  address = '';
  sent = 4200;
  received = 0.0042;
  lastTransactionDate = '16-12-2020';
  lastTransactionStatus = 'Pending';

  private pIconUrl = '';

  constructor(data: UserContact | null) {
    this.id = data?.userContactId ?? '';
    this.userId = data?.userId ?? '';
    this.contactEmail = data?.contactEmail ?? '';
    this.displayName = data?.displayName ?? '';
    this.address = data?.address ?? '';
    const datepipe: DatePipe = new DatePipe('en-US');
    this.created = datepipe.transform(data?.created, 'dd MMM YYYY HH:mm:ss') ?? '';
    this.asset = data?.assetId ?? '';
    if (this.asset !== '') {
      this.pIconUrl = `assets/svg-crypto/${getCryptoSymbol(this.asset).toLowerCase()}.svg`;
    }
  }

  get icon(): string {
    return this.pIconUrl;
  }
}
