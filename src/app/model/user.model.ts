import { Gender, KycProvider, KycStatus, User, UserAction, UserContact, UserDevice, UserRole, UserType } from './generated-models';
import {
  KycStatusList,
  UserActionResultList,
  UserActionResultView,
  UserActionTypeList,
  UserActionTypeView,
  UserModeShortList,
  UserModeView,
  UserTypeList,
  UserTypeView
} from './payment.model';
import { Country, getCountryByCode2, getCountryByCode3 } from './country-code.model';
import { CommonTargetValue } from './common.model';
import { DatePipe } from '@angular/common';
import { getCryptoSymbol } from '../utils/utils';

export class GenderView {
  id!: Gender;
  name = '';
}

export const GenderList: Array<GenderView> = [
  { id: Gender.M, name: 'Male' },
  { id: Gender.F, name: 'Female' },
  { id: Gender.O, name: 'Other' }
];

export class UserItem {
  id = '';
  referralCode = '';
  deleted = false;
  company = '';
  firstName = '';
  lastName = '';
  fullName = '';
  gender = '';
  email = '';
  emailConfirmed = false;
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
  accountStatus = '';
  widgetId = '';
  widgetName = '';
  widgetCode = '';
  affiliateId = '';
  affiliateCode = '';
  kycProvider = '';
  kycStatusValue = KycStatus.Unknown;
  kycStatus = '';
  kycValid = false;
  kycVerificationStatus = '';
  kycVerificationAvailable = true;
  kycLevel = '';
  kycLevelMax = false;
  kycLevelIncreasable = false;
  kycComplete = false;
  kycRejected = false;
  kycReviewDate = '';
  kycStatusDate = '';
  kycReviewComment = '';
  kycPrivateComment = '';
  kycReviewRejectedType = '';
  kycReviewRejectedLabels: string[] = [];
  kycReviewResult = '';
  kycStatusUpdateRequired = 'No';
  userType: UserTypeView | null = null;
  userMode: UserModeView | null = null;
  created = '';
  updated = '';
  lastLogin = '';
  fiatCurrency = '';
  cryptoCurrency = '';
  birthday: Date | undefined = undefined;
  age = '';
  risk = '';
  riskCodes: string[] = [];
  roles: string[] = [];
  totalTransactionCount = 0;
  averageTransaction = 0;
  totalDepositCompleted = 0;
  totalDepositCompletedCount = 0;
  totalDepositInProcess = 0;
  totalDepositInProcessCount = 0;
  totalWithdrawalCompleted = 0;
  totalWithdrawalCompletedCount = 0;
  totalWithdrawalInProcess = 0;
  totalWithdrawalInProcessCount = 0;
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
  totalDepositCompletedResult = '';
  totalDepositInProcessResult = '';
  totalWithdrawalCompletedResult = '';
  totalWithdrawalInProcessResult = '';
  totalBoughtCompletedResult = '';
  totalBoughtInProcessResult = '';
  totalSoldCompletedResult = '';
  totalSoldInProcessResult = '';
  totalSentCompletedResult = '';
  totalSentInProcessResult = '';
  totalReceivedCompletedResult = '';
  totalReceivedInProcessResult = '';
  totalDeposit = '';
  totalWithdrawal = '';
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
      this.deleted = data.deleted !== undefined && data.deleted !== null;
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
      this.gender = data.gender ?? '';
      this.email = data.email;
      this.emailConfirmed = data.emailConfirmed ?? false;
      this.phone = data.phone ? (data.phone as string) : '';
      this.street = data.street ?? '';
      this.subStreet = data.subStreet ?? '';
      this.buildingName = data.buildingName ?? '';
      this.buildingNumber = data.buildingNumber ?? '';
      this.flatNumber = data.flatNumber ?? '';
      this.town = data.town ?? '';
      this.postCode = data.postCode ?? '';
      this.stateName = data.stateName ?? '';
      if (data.addressLine) {
        this.address = data.addressLine;
      } else {
        this.address = this.getAddress(data);
      }
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') ?? '';
      this.updated = datepipe.transform(data.updated, 'dd MMM YYYY HH:mm:ss') ?? '';
      this.lastLogin = datepipe.transform(data.lastLogin, 'dd MMM YYYY HH:mm:ss') ?? '';
      this.widgetId = data.widgetId ?? '';
      this.widgetName = data.widgetName ?? '';
      this.widgetCode = data.widgetCode ?? '';
      this.affiliateId = data.affiliateId ?? '';
      this.affiliateCode = data.affiliateCode ?? '';
      this.accountStatus = data.accountStatus ?? '';
      this.roles = data.roles?.map(val => val.code) ?? [];
      this.risk = data.risk ?? '';
      this.riskCodes = data.riskCodes?.map(code => {
        const riskData = JSON.parse(code);
        return riskData.code ?? '';
      }) ?? [];
      this.totalTransactionCount = data.totalTransactionCount ?? 0;
      this.averageTransaction = data.averageTransaction ?? 0;
      this.totalDepositCompleted = data.totalDepositCompleted ?? 0;
      this.totalDepositCompletedCount = data.totalDepositCompletedCount ?? 0;
      this.totalDepositInProcess = data.totalDepositInProcess ?? 0;
      this.totalDepositInProcessCount = data.totalDepositInProcessCount ?? 0;
      this.totalWithdrawalCompleted = data.totalWithdrawalCompleted ?? 0;
      this.totalWithdrawalCompletedCount = data.totalWithdrawalCompletedCount ?? 0;
      this.totalWithdrawalInProcess = data.totalWithdrawalInProcess ?? 0;
      this.totalWithdrawalInProcessCount = data.totalWithdrawalInProcessCount ?? 0;
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
      this.totalDepositCompletedResult = this.getTransactionResult(this.totalDepositCompleted, this.totalDepositCompletedCount);
      this.totalDepositInProcessResult = this.getTransactionResult(this.totalDepositInProcess, this.totalDepositInProcessCount);
      this.totalWithdrawalCompletedResult = this.getTransactionResult(this.totalWithdrawalCompleted, this.totalWithdrawalCompletedCount);
      this.totalWithdrawalInProcessResult = this.getTransactionResult(this.totalWithdrawalInProcess, this.totalWithdrawalInProcessCount);
      this.totalBoughtCompletedResult = this.getTransactionResult(this.totalBoughtCompleted, this.totalBoughtCompletedCount);
      this.totalBoughtInProcessResult = this.getTransactionResult(this.totalBoughtInProcess, this.totalBoughtInProcessCount);
      this.totalSoldCompletedResult = this.getTransactionResult(this.totalSoldCompleted, this.totalSoldCompletedCount);
      this.totalSoldInProcessResult = this.getTransactionResult(this.totalSoldInProcess, this.totalSoldInProcessCount);
      this.totalSentCompletedResult = this.getTransactionResult(this.totalSentCompleted, this.totalSentCompletedCount);
      this.totalSentInProcessResult = this.getTransactionResult(this.totalSentInProcess, this.totalSentInProcessCount);
      this.totalReceivedCompletedResult = this.getTransactionResult(this.totalReceivedCompleted, this.totalReceivedCompletedCount);
      this.totalReceivedInProcessResult = this.getTransactionResult(this.totalReceivedInProcess, this.totalReceivedInProcessCount);
      this.totalDeposit = this.totalDepositCompleted.toFixed(2);
      this.totalWithdrawal = this.totalWithdrawalCompleted.toFixed(2);
      this.totalBought = this.totalBoughtCompleted.toFixed(2);
      this.totalSold = this.totalSoldCompleted.toFixed(2);
      this.totalSent = this.totalSentCompleted.toFixed(2);
      this.totalReceived = this.totalReceivedCompleted.toFixed(2);
      this.kycProvider = data.kycProvider ?? '';
      this.kycValid = data.kycValid ?? false;
      this.kycStatusValue = data.kycStatus as KycStatus ?? KycStatus.Unknown;
      this.kycStatus = KycStatusList.find(x => x.id === data.kycStatus?.toLowerCase())?.name ?? '';
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
      this.kycReviewDate = datepipe.transform(data.kycReviewDate, 'dd MMM YYYY HH:mm:ss') ?? '';
      this.kycStatusDate = datepipe.transform(data.kycStatusDate, 'dd MMM YYYY HH:mm:ss') ?? '';
      this.kycReviewComment = data.kycReviewComment ?? '';
      this.kycPrivateComment = data.kycPrivateComment ?? '';
      this.kycReviewRejectedType = data.kycReviewRejectedType ?? '';
      this.kycReviewRejectedLabels = data.kycReviewRejectedLabels ?? [];
      if (data.kycReviewResult) {
        const kycReviewResultData = JSON.parse(data.kycReviewResult ?? '');
        if (kycReviewResultData !== null) {
          if (this.kycProvider === KycProvider.SumSub) {
            this.kycReviewResult = kycReviewResultData.reviewAnswer ?? '';
          } else if (this.kycProvider === KycProvider.Shufti) {
            this.kycReviewResult = kycReviewResultData.event ?? '';
          }
        }
      }
      this.kycStatusUpdateRequired = (data.kycStatusUpdateRequired) ? ((data.kycStatusUpdateRequired === true) ? 'Yes' : 'No') : 'No';
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

  private getTransactionResult(val: number, count: number): string {
    return `${val.toFixed(2)} (${this.getTransactionCount(count)})`;
  }

  private getTransactionCount(c: number): string {
    return (c === 1) ? '1 transaction' : `${c} transactions`;
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

  private getKycStatusColor(): string {
    let color = 'grey';
    switch (this.kycStatusValue) {
      case KycStatus.Unknown:
        color = 'white';
        break;
      case KycStatus.Canceled:
      case KycStatus.Timeout:
        color = 'yellow';
        break;
      case KycStatus.Init:
      case KycStatus.NotFound:
      case KycStatus.Deleted:
      case KycStatus.Invalid:
      case KycStatus.Timeout:
        color = 'red';
        break;
      case KycStatus.Completed:
        color = (this.kycValid) ? 'green' : 'red';
        break;
      default:
        color = 'grey';
    }
    return color;
  }

  get customerListSelectorColumnStyle(): string[] {
    return [
      'customer-list-selector-column',
      `customer-list-column-${this.getKycStatusColor()}`
    ];
  }

  get customerListDataColumnStyle(): string[] {
    return [
      'customer-list-data-column',
      `customer-list-column-${this.getKycStatusColor()}`
    ];
  }

  get fullFirstName(): string {
    if (this.userType?.id === UserType.Merchant) {
      return this.company;
    } else if (this.userType?.id === UserType.Personal) {
      return this.firstName;
    }
    return '';
  }

  get roleNames(): string {
    return this.roles.join(', ');
  }

  get extendedName(): string {
    if (this.fullName === '') {
      return this.email;
    } else {
      return `${this.fullName} (${this.email})`;
    }
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

export class RoleItem {
  id = '';
  name = '';
  code = '';
  selected = false;

  constructor(data: UserRole | null) {
    this.id = data?.userRoleId ?? '';
    this.name = data?.name ?? '';
    this.code = data?.code ?? '';
  }
}

export class DeviceItem {
  id = '';
  userId = '';
  created = '';
  country?: Country;
  countryImg = '';
  city = '';
  region = '';
  eu = '';
  metro = 0;
  area = 0;
  location = '';
  browser = '';
  device = '';
  deviceConfirmed = '';
  ip = '';

  constructor(data: UserDevice | null) {
    this.id = data?.userDeviceId ?? '';
    const datepipe: DatePipe = new DatePipe('en-US');
    this.created = datepipe.transform(data?.created, 'dd MMM YYYY HH:mm:ss') ?? '';
    this.deviceConfirmed = datepipe.transform(data?.deviceConfirmed, 'dd MMM YYYY HH:mm:ss') ?? '';
    this.country = getCountryByCode3(data?.countryCode3 ?? '') ?? undefined;
    if (this.country) {
      this.countryImg = `assets/svg-country-flags/${this.country?.code2.toLowerCase()}.svg`;
    }
    this.city = data?.city ?? '';
    this.region = data?.region ?? '';
    this.eu = data?.eu ?? '';
    this.metro = data?.metro ?? 0;
    this.area = data?.area ?? 0;
    this.location = data?.location ?? '';
    this.browser = data?.browser ?? '';
    this.device = data?.device ?? '';
    this.ip = data?.ip ?? ''
  }
}

export class UserActionItem {
  id = '';
  userId = '';
  userEmail = '';
  currentUserEmail = '';
  date = '';
  objectId = '';
  linkedIds: any = [];
  info = '';
  status = '';
  actionType: UserActionTypeView | null = null;
  result: UserActionResultView | null = null;

  constructor(data: UserAction | null) {
    this.id = data?.userActionId ?? '';
    this.userId = data?.userId ?? '';
    this.userEmail = data?.userEmail ?? '';
    this.currentUserEmail = data?.currentUserEmail ?? '';
    const datepipe: DatePipe = new DatePipe('en-US');
    this.date = datepipe.transform(data?.date, 'dd MMM YYYY HH:mm:ss') ?? '';
    this.objectId = data?.objectId ?? '';
    this.linkedIds = data?.linkedIds ?? [];
    this.info = data?.info ?? '';
    this.status = data?.status ?? '';
    this.actionType = UserActionTypeList.find((x) => x.id === data?.actionType) as UserActionTypeView;
    this.result = UserActionResultList.find((x) => x.id === data?.result) as UserActionResultView;
  }
}
