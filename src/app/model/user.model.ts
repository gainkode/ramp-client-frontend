import { User, UserContact, UserType } from './generated-models';
import {
  UserModeShortList,
  UserModeView,
  UserTypeList,
  UserTypeView,
} from './payment.model';
import { getCountryByCode2 } from './country-code.model';
import { CommonTargetValue } from './common.model';
import { DatePipe } from '@angular/common';

export class UserItem {
  id = '';
  company = '';
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  country: CommonTargetValue | null = null;
  address = '';
  kycStatus = '';
  userType: UserTypeView | null = null;
  userMode: UserModeView | null = null;
  created = '';
  fiatCurrency = '';

  get fullName(): string {
    let result = '';
    if (this.userType?.id === UserType.Merchant) {
      result = this.company;
    } else {
      result = `${this.firstName} ${this.lastName}`;
    }
    return result;
  }

  constructor(data: User | null) {
    if (data) {
      this.id = data.userId;
      this.firstName = data.firstName as string;
      this.lastName = data.lastName as string;
      if (data.type === UserType.Merchant) {
        this.company = data.firstName ? (data.firstName as string) : '';
        this.firstName = '';
        this.lastName = '';
      }
      this.email = data.email;
      this.phone = data.phone ? (data.phone as string) : '';
      this.address = this.getAddress(data);
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = datepipe.transform(
        data.created,
        'dd-MM-YYYY HH:mm:ss'
      ) as string;
      this.kycStatus = data.kycStatus as string;
      const countryObject = getCountryByCode2(data.countryCode2 as string);
      if (countryObject !== null) {
        this.country = new CommonTargetValue();
        this.country.imgClass = 'country-flag';
        this.country.imgSource = `assets/svg-country-flags/${countryObject.code2.toLowerCase()}.svg`;
        this.country.title = countryObject.name;
      }
      this.fiatCurrency = data.defaultFiatCurrency
        ? (data.defaultFiatCurrency as string)
        : '';
      this.userType = UserTypeList.find(
        (x) => x.id === data.type
      ) as UserTypeView;
      this.userMode = UserModeShortList.find(
        (x) => x.id === data.mode
      ) as UserModeView;
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
}

export class ContactItem {
  id = '';
  userId = '';
  contactEmail = '';
  displayName = '';
  created = '';
  asset = '';
  
  private pIconUrl = '';
  
  constructor(data: UserContact | null) {
    this.id = data?.userContactId as string;
    this.userId = data?.userId as string;
    this.contactEmail = data?.contactEmail as string;
    this.displayName = data?.displayName as string;
    const datepipe: DatePipe = new DatePipe('en-US');
    this.created = datepipe.transform(data?.created, 'dd-MM-YYYY HH:mm:ss') as string;
    this.asset = data?.assetId ?? '';
    if (this.asset !== '') {
      this.pIconUrl = `assets/svg-crypto/${this.asset.toLowerCase()}.svg`;
    }
  }

  get icon(): string {
    return this.pIconUrl;
  }
}