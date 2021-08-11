export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Void: any;
  Byte: any;
};





export type Query = {
  __typename?: 'Query';
  serverTime: Scalars['String'];
  myApiKeys?: Maybe<ApiKeyListResult>;
  getApiKeys?: Maybe<ApiKeyListResult>;
  myNotifications?: Maybe<UserNotificationListResult>;
  getNotifications?: Maybe<UserNotificationListResult>;
  getSettingsCommon?: Maybe<SettingsCommon>;
  getSettingsCurrency?: Maybe<SettingsCurrencyListResult>;
  getSettingsKycLevels?: Maybe<SettingsKycLevelListResult>;
  getSettingsKyc?: Maybe<SettingsKycListResult>;
  mySettingsKyc?: Maybe<SettingsKycShort>;
  mySettingsKycFull?: Maybe<SettingsKyc>;
  getAppropriateSettingsKyc?: Maybe<SettingsKyc>;
  getSettingsFee?: Maybe<SettingsFeeListResult>;
  mySettingsFee?: Maybe<SettingsFeeShort>;
  mySettingsFeeFull?: Maybe<SettingsFee>;
  getAppropriateSettingsFee?: Maybe<SettingsFee>;
  getSettingsCost?: Maybe<SettingsCostListResult>;
  getAppropriateSettingsCost?: Maybe<SettingsCostShort>;
  getAppropriateSettingsCostFull?: Maybe<SettingsCost>;
  generateWebApiToken: Scalars['String'];
  me: User;
  myState: UserState;
  getUserState: UserState;
  myKycStatus: Scalars['String'];
  userKycInfo: KycInfo;
  userCount?: Maybe<Scalars['Int']>;
  userById: User;
  userByName: User;
  userByEmail: User;
  userByOAuthAppId: User;
  userByReferralCode: User;
  getUsers: UserListResult;
  myContacts: UserContactListResult;
  getUserContacts: UserContactListResult;
  myBankAccounts: UserContactListResult;
  getUserBankAccounts: UserContactListResult;
  myActions: UserActionListResult;
  getUserActions: UserActionListResult;
  myBalanceHistory: UserBalanceHistoryListResult;
  getUserBalanceHistory: UserBalanceHistoryListResult;
  myKycInfo?: Maybe<KycInfo>;
  getUserKycInfo?: Maybe<KycInfo>;
  mySupportTickets?: Maybe<SupportTicketListResult>;
  getSupportTickets?: Maybe<SupportTicketListResult>;
  getFeedbacks?: Maybe<FeedbackListResult>;
  getRates?: Maybe<Array<Rate>>;
  myTransactions?: Maybe<TransactionShortListResult>;
  getTransactions?: Maybe<TransactionListResult>;
  getDashboardStats?: Maybe<DashboardStats>;
  myWidgets?: Maybe<WidgetListResult>;
  getWidgets?: Maybe<WidgetListResult>;
  getWidget?: Maybe<WidgetShort>;
};


export type QueryMyApiKeysArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetApiKeysArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyNotificationsArgs = {
  unreadOnly?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetNotificationsArgs = {
  userId?: Maybe<Scalars['String']>;
  unreadOnly?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetSettingsCurrencyArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
  recaptcha: Scalars['String'];
};


export type QueryGetSettingsKycLevelsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetSettingsKycArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetAppropriateSettingsKycArgs = {
  targetKycProvider: KycProvider;
  targetUserType: UserType;
  targetUserMode: UserMode;
  filterType?: Maybe<SettingsKycTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetSettingsFeeArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMySettingsFeeArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  currency?: Maybe<Scalars['String']>;
};


export type QueryMySettingsFeeFullArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  currency?: Maybe<Scalars['String']>;
};


export type QueryGetAppropriateSettingsFeeArgs = {
  transactionType: TransactionType;
  targetUserType: UserType;
  targetUserMode: UserMode;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  currency?: Maybe<Scalars['String']>;
  filterType?: Maybe<SettingsFeeTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetSettingsCostArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetAppropriateSettingsCostArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  currency?: Maybe<Scalars['String']>;
  filterType?: Maybe<SettingsCostTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetAppropriateSettingsCostFullArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  currency?: Maybe<Scalars['String']>;
  filterType?: Maybe<SettingsCostTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetUserStateArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type QueryUserKycInfoArgs = {
  userId: Scalars['String'];
};


export type QueryUserByIdArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type QueryUserByNameArgs = {
  name?: Maybe<Scalars['String']>;
};


export type QueryUserByEmailArgs = {
  email?: Maybe<Scalars['String']>;
};


export type QueryUserByOAuthAppIdArgs = {
  oAuthProvider?: Maybe<OAuthProvider>;
  oAuthAppId?: Maybe<Scalars['String']>;
};


export type QueryUserByReferralCodeArgs = {
  referralCode?: Maybe<Scalars['Int']>;
};


export type QueryGetUsersArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyContactsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetUserContactsArgs = {
  userId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyBankAccountsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetUserBankAccountsArgs = {
  userId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyActionsArgs = {
  withResult?: Maybe<UserActionResult>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetUserActionsArgs = {
  userId?: Maybe<Scalars['String']>;
  withResult?: Maybe<UserActionResult>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyBalanceHistoryArgs = {
  asset?: Maybe<Scalars['String']>;
  period?: Maybe<UserBalanceHistoryPeriod>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetUserBalanceHistoryArgs = {
  userId?: Maybe<Scalars['String']>;
  asset?: Maybe<Scalars['String']>;
  period?: Maybe<UserBalanceHistoryPeriod>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetUserKycInfoArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type QueryMySupportTicketsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetSupportTicketsArgs = {
  userId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetFeedbacksArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetRatesArgs = {
  currenciesFrom: Array<Scalars['String']>;
  currencyTo: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type QueryMyTransactionsArgs = {
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetTransactionsArgs = {
  userId?: Maybe<Scalars['String']>;
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetDashboardStatsArgs = {
  userIdOnly?: Maybe<Array<Scalars['String']>>;
  affiliateIdOnly?: Maybe<Array<Scalars['String']>>;
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  countriesOnly?: Maybe<Array<Scalars['String']>>;
  countryCodeType?: Maybe<CountryCodeType>;
  accountTypesOnly?: Maybe<Array<UserType>>;
};


export type QueryMyWidgetsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetWidgetsArgs = {
  userId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
};

export type OrderBy = {
  orderBy: Scalars['String'];
  desc: Scalars['Boolean'];
};

export type ApiKeyListResult = {
  __typename?: 'ApiKeyListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<ApiKey>>;
};

export type ApiKey = {
  __typename?: 'ApiKey';
  apiKeyId: Scalars['ID'];
  created: Scalars['DateTime'];
  disabled?: Maybe<Scalars['DateTime']>;
};


export type UserNotificationListResult = {
  __typename?: 'UserNotificationListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserNotification>>;
};

export type UserNotification = {
  __typename?: 'UserNotification';
  userNotificationId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  userNotificationTypeCode: Scalars['String'];
  created?: Maybe<Scalars['DateTime']>;
  viewed?: Maybe<Scalars['DateTime']>;
  text?: Maybe<Scalars['String']>;
  linkedId?: Maybe<Scalars['String']>;
  linkedTable?: Maybe<Scalars['String']>;
  level?: Maybe<UserNotificationLevel>;
  params?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  userId: Scalars['ID'];
  email: Scalars['String'];
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  postCode?: Maybe<Scalars['String']>;
  town?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  subStreet?: Maybe<Scalars['String']>;
  stateName?: Maybe<Scalars['String']>;
  buildingName?: Maybe<Scalars['String']>;
  buildingNumber?: Maybe<Scalars['String']>;
  flatNumber?: Maybe<Scalars['String']>;
  addressStartDate?: Maybe<Scalars['DateTime']>;
  addressEndDate?: Maybe<Scalars['DateTime']>;
  phone?: Maybe<Scalars['String']>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
  created?: Maybe<Scalars['DateTime']>;
  updated?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['DateTime']>;
  accessFailedCount?: Maybe<Scalars['Int']>;
  emailConfirmed?: Maybe<Scalars['DateTime']>;
  roles?: Maybe<Array<UserRole>>;
  contacts?: Maybe<Array<UserContact>>;
  bankAccounts?: Maybe<Array<UserBankAccount>>;
  permissions?: Maybe<Array<UserRolePermission>>;
  is2faEnabled?: Maybe<Scalars['Boolean']>;
  hasEmailAuth?: Maybe<Scalars['Boolean']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']>;
  referralCode?: Maybe<Scalars['Int']>;
  systemUser: Scalars['Boolean'];
  notificationSubscriptions?: Maybe<Array<UserNotificationSubscription>>;
  kycProvider?: Maybe<Scalars['String']>;
  kycValidationTierId?: Maybe<Scalars['String']>;
  kycApplicantId?: Maybe<Scalars['String']>;
  kycValid?: Maybe<Scalars['Boolean']>;
  kycReviewDate?: Maybe<Scalars['DateTime']>;
  kycStatus?: Maybe<Scalars['String']>;
  kycStatusDate?: Maybe<Scalars['DateTime']>;
  kycReviewComment?: Maybe<Scalars['String']>;
  kycPrivateComment?: Maybe<Scalars['String']>;
  kycReviewRejectedType?: Maybe<Scalars['String']>;
  kycReviewRejectedLabels?: Maybe<Array<Scalars['String']>>;
  kycReviewResult?: Maybe<Scalars['String']>;
  kycStatusUpdateRequired?: Maybe<Scalars['Boolean']>;
  custodyProvider?: Maybe<Scalars['String']>;
  vaultAccountId?: Maybe<Scalars['String']>;
  defaultFiatCurrency?: Maybe<Scalars['String']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']>;
};

export enum UserType {
  Merchant = 'Merchant',
  Personal = 'Personal'
}

export enum UserMode {
  InternalWallet = 'InternalWallet',
  ExternalWallet = 'ExternalWallet',
  OneTimeWallet = 'OneTimeWallet'
}

export type UserRole = {
  __typename?: 'UserRole';
  name: Scalars['String'];
  code: Scalars['String'];
  immutable?: Maybe<Scalars['Boolean']>;
};

export type UserContact = {
  __typename?: 'UserContact';
  userContactId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  contactEmail?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
};

export type UserBankAccount = {
  __typename?: 'UserBankAccount';
  userBankAccountId?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  beneficiaryName?: Maybe<Scalars['String']>;
  beneficiaryAddress?: Maybe<Scalars['String']>;
  bankName?: Maybe<Scalars['String']>;
  bankAddress?: Maybe<Scalars['String']>;
  swiftBic?: Maybe<Scalars['String']>;
  iban?: Maybe<Scalars['String']>;
  currency?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
};

export type UserRolePermission = {
  __typename?: 'UserRolePermission';
  roleCode: Scalars['String'];
  roleName: Scalars['String'];
  objectCode: Scalars['String'];
  objectName: Scalars['String'];
  objectDescription: Scalars['String'];
  fullAccess: Scalars['Boolean'];
};

export type UserNotificationSubscription = {
  __typename?: 'UserNotificationSubscription';
  userNotificationSubscriptionId: Scalars['ID'];
  userNotificationTypeCode: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  siteNotification?: Maybe<Scalars['Boolean']>;
  siteNotificationDefault?: Maybe<Scalars['Boolean']>;
  siteNotificationImmutable?: Maybe<Scalars['Boolean']>;
  emailNotification?: Maybe<Scalars['Boolean']>;
  emailNotificationDefault?: Maybe<Scalars['Boolean']>;
  emailNotificationImmutable?: Maybe<Scalars['Boolean']>;
};

export enum UserNotificationLevel {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error'
}

export type SettingsCommon = {
  __typename?: 'SettingsCommon';
  settingsCommonId?: Maybe<Scalars['String']>;
  liquidityProvider?: Maybe<Scalars['String']>;
  liquidityProviderWithdrawalAddress?: Maybe<Scalars['String']>;
  liquidityProviderWithdrawalBenchmark?: Maybe<Scalars['Float']>;
  custodyProvider?: Maybe<Scalars['String']>;
  kycProvider?: Maybe<Scalars['String']>;
  kycBaseAddress?: Maybe<Scalars['String']>;
};

export type SettingsCurrencyListResult = {
  __typename?: 'SettingsCurrencyListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsCurrency>>;
};

export type SettingsCurrency = {
  __typename?: 'SettingsCurrency';
  symbol: Scalars['ID'];
  name: Scalars['String'];
  precision: Scalars['Int'];
  minAmount: Scalars['Float'];
  maxAmount: Scalars['Float'];
  rateFactor: Scalars['Float'];
  validateAsSymbol?: Maybe<Scalars['String']>;
  fiat?: Maybe<Scalars['Boolean']>;
};

export type SettingsKycLevelListResult = {
  __typename?: 'SettingsKycLevelListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsKycLevel>>;
};

export type SettingsKycLevel = {
  __typename?: 'SettingsKycLevel';
  settingsKycLevelId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  userType?: Maybe<UserType>;
  order?: Maybe<Scalars['Int']>;
  data?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['String']>;
};

export type SettingsKycListResult = {
  __typename?: 'SettingsKycListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsKyc>>;
};

export type SettingsKyc = {
  __typename?: 'SettingsKyc';
  settingsKycId: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  targetKycProviders?: Maybe<Array<KycProvider>>;
  targetUserType: UserType;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetFilterType?: Maybe<SettingsKycTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  levels?: Maybe<Array<SettingsKycLevel>>;
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export enum KycProvider {
  Local = 'Local',
  SumSub = 'SumSub'
}

export enum SettingsKycTargetFilterType {
  None = 'None',
  AccountId = 'AccountId',
  AffiliateId = 'AffiliateId',
  Country = 'Country',
  InitiateFrom = 'InitiateFrom'
}

export type SettingsKycShort = {
  __typename?: 'SettingsKycShort';
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  levels?: Maybe<Array<SettingsKycLevelShort>>;
};

export type SettingsKycLevelShort = {
  __typename?: 'SettingsKycLevelShort';
  settingsKycLevelId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  userType?: Maybe<UserType>;
  order?: Maybe<Scalars['Int']>;
  data?: Maybe<Scalars['String']>;
};

export type SettingsFeeListResult = {
  __typename?: 'SettingsFeeListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsFee>>;
};

export type SettingsFee = {
  __typename?: 'SettingsFee';
  settingsFeeId: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  targetFilterType?: Maybe<SettingsFeeTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  targetInstruments?: Maybe<Array<Scalars['String']>>;
  targetUserTypes?: Maybe<Array<UserType>>;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetTransactionTypes?: Maybe<Array<Scalars['String']>>;
  targetPaymentProviders?: Maybe<Array<Scalars['String']>>;
  terms: Scalars['String'];
  wireDetails: Scalars['String'];
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
  currency?: Maybe<Scalars['String']>;
  rateToEur?: Maybe<Scalars['Float']>;
};

export enum SettingsFeeTargetFilterType {
  None = 'None',
  AccountId = 'AccountId',
  AffiliateId = 'AffiliateId',
  Country = 'Country',
  AccountType = 'AccountType',
  InitiateFrom = 'InitiateFrom'
}

export enum TransactionType {
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
  Transfer = 'Transfer',
  Exchange = 'Exchange',
  System = 'System'
}

export enum PaymentInstrument {
  CreditCard = 'CreditCard',
  WireTransfer = 'WireTransfer',
  Bitstamp = 'Bitstamp',
  Apm = 'APM',
  Received = 'Received',
  Send = 'Send'
}

export enum PaymentProvider {
  Fibonatix = 'Fibonatix',
  Skrill = 'Skrill',
  Totalprocessing = 'Totalprocessing',
  Sofort = 'Sofort',
  Bank = 'Bank'
}

export type SettingsFeeShort = {
  __typename?: 'SettingsFeeShort';
  terms: Scalars['String'];
  wireDetails: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  rateToEur?: Maybe<Scalars['Float']>;
};

export type SettingsCostListResult = {
  __typename?: 'SettingsCostListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsCost>>;
};

export type SettingsCost = {
  __typename?: 'SettingsCost';
  settingsCostId: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  targetFilterType?: Maybe<SettingsCostTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  targetInstruments?: Maybe<Array<Scalars['String']>>;
  targetTransactionTypes?: Maybe<Array<Scalars['String']>>;
  targetPaymentProviders?: Maybe<Array<Scalars['String']>>;
  terms: Scalars['String'];
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export enum SettingsCostTargetFilterType {
  None = 'None',
  Psp = 'PSP',
  Country = 'Country'
}

export type SettingsCostShort = {
  __typename?: 'SettingsCostShort';
  terms: Scalars['String'];
};

export type UserState = {
  __typename?: 'UserState';
  date?: Maybe<Scalars['DateTime']>;
  transactionSummary?: Maybe<Array<UserTransactionSummary>>;
  vault?: Maybe<UserVault>;
  externalWallets?: Maybe<Array<ExternalWallet>>;
  notifications?: Maybe<UserNotificationListResult>;
};


export type UserStateExternalWalletsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type UserStateNotificationsArgs = {
  unreadOnly?: Maybe<Scalars['Boolean']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};

export type UserTransactionSummary = {
  __typename?: 'UserTransactionSummary';
  assetId?: Maybe<Scalars['String']>;
  in?: Maybe<UserTransactionStats>;
  out?: Maybe<UserTransactionStats>;
};

export type UserTransactionStats = {
  __typename?: 'UserTransactionStats';
  transactionCount?: Maybe<Scalars['Int']>;
  assetAmount?: Maybe<Scalars['Float']>;
  eurAmount?: Maybe<Scalars['Float']>;
};

export type UserVault = {
  __typename?: 'UserVault';
  totalBalanceEur: Scalars['Float'];
  availableBalanceEur: Scalars['Float'];
  totalBalanceFiat: Scalars['Float'];
  availableBalanceFiat: Scalars['Float'];
  assets?: Maybe<Array<VaultAccountAsset>>;
};


export type UserVaultAssetsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};

export type VaultAccountAsset = {
  __typename?: 'VaultAccountAsset';
  id?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Float']>;
  available?: Maybe<Scalars['Float']>;
  pending?: Maybe<Scalars['String']>;
  lockedAmount?: Maybe<Scalars['String']>;
  totalStakedCPU?: Maybe<Scalars['String']>;
  totalStakedNetwork?: Maybe<Scalars['String']>;
  selfStakedCPU?: Maybe<Scalars['String']>;
  selfStakedNetwork?: Maybe<Scalars['String']>;
  pendingRefundCPU?: Maybe<Scalars['String']>;
  pendingRefundNetwork?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<VaultAccountAssetAddress>>;
};

export type VaultAccountAssetAddress = {
  __typename?: 'VaultAccountAssetAddress';
  address?: Maybe<Scalars['String']>;
  legacyAddress?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  addressFormat?: Maybe<Scalars['String']>;
};

export type ExternalWallet = {
  __typename?: 'ExternalWallet';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  customerRefId?: Maybe<Scalars['String']>;
  assets?: Maybe<Array<ExternalWalletAsset>>;
};

export type ExternalWalletAsset = {
  __typename?: 'ExternalWalletAsset';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<WalletAssetStatus>;
  activationTime?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  tag?: Maybe<Scalars['String']>;
};

export enum WalletAssetStatus {
  WaitingForApproval = 'WAITING_FOR_APPROVAL',
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Rejected = 'REJECTED',
  Failed = 'FAILED'
}

export type KycInfo = {
  __typename?: 'KycInfo';
  applicant?: Maybe<KycApplicant>;
  appliedDocuments?: Maybe<Array<KycAppliedDocument>>;
  requiredInfo?: Maybe<KycRequiredInfo>;
};

export type KycApplicant = {
  __typename?: 'KycApplicant';
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  details?: Maybe<Array<StringMap>>;
};

export type StringMap = {
  __typename?: 'StringMap';
  key: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type KycAppliedDocument = {
  __typename?: 'KycAppliedDocument';
  code: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  issuedDate?: Maybe<Scalars['String']>;
  validUntil?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  details?: Maybe<Array<StringMap>>;
};

export type KycRequiredInfo = {
  __typename?: 'KycRequiredInfo';
  documents?: Maybe<Array<KycDocumentType>>;
  fields?: Maybe<Array<KycInfoField>>;
};

export type KycDocumentType = {
  __typename?: 'KycDocumentType';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  subTypes?: Maybe<Array<KycDocumentType>>;
  options?: Maybe<Array<Scalars['String']>>;
};

export type KycInfoField = {
  __typename?: 'KycInfoField';
  name?: Maybe<Scalars['String']>;
  required?: Maybe<Scalars['Boolean']>;
};

export enum OAuthProvider {
  Google = 'google',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Microsoft = 'microsoft'
}

export type UserListResult = {
  __typename?: 'UserListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<User>>;
};

export type UserContactListResult = {
  __typename?: 'UserContactListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserContact>>;
};

export enum UserActionResult {
  Unknown = 'unknown',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Canceled = 'canceled',
  Error = 'error'
}

export type UserActionListResult = {
  __typename?: 'UserActionListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserAction>>;
};

export type UserAction = {
  __typename?: 'UserAction';
  userActionId: Scalars['ID'];
  userId: Scalars['String'];
  objectId?: Maybe<Scalars['String']>;
  actionType?: Maybe<UserActionType>;
  linkedIds?: Maybe<Array<Scalars['String']>>;
  info?: Maybe<Scalars['String']>;
  result?: Maybe<UserActionResult>;
  status?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['DateTime']>;
};

export enum UserActionType {
  Signup = 'signup',
  Login = 'login',
  Logout = 'logout',
  Send = 'send',
  Receive = 'receive',
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Transfer = 'transfer',
  Exchange = 'exchange',
  System = 'system',
  CancelTransaction = 'cancelTransaction'
}

export enum UserBalanceHistoryPeriod {
  Dayly = 'Dayly',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly'
}

export type UserBalanceHistoryListResult = {
  __typename?: 'UserBalanceHistoryListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserBalanceHistory>>;
};

export type UserBalanceHistory = {
  __typename?: 'UserBalanceHistory';
  userBalanceId?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  date: Scalars['DateTime'];
  asset: Scalars['String'];
  balance: Scalars['Float'];
  balanceFiat: Scalars['Float'];
  balanceEur: Scalars['Float'];
  transactionId?: Maybe<Scalars['String']>;
};

export type SupportTicketListResult = {
  __typename?: 'SupportTicketListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SupportTicket>>;
};

export type SupportTicket = {
  __typename?: 'SupportTicket';
  supportTicketId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  category?: Maybe<SupportTicketCategory>;
  files?: Maybe<Array<Scalars['String']>>;
  created?: Maybe<Scalars['DateTime']>;
};

export enum SupportTicketCategory {
  Authorization = 'Authorization',
  Transaction = 'Transaction',
  Exchange = 'Exchange'
}

export type FeedbackListResult = {
  __typename?: 'FeedbackListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Feedback>>;
};

export type Feedback = {
  __typename?: 'Feedback';
  feedbackId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
};

export type Rate = {
  __typename?: 'Rate';
  currencyFrom: Scalars['String'];
  currencyTo: Scalars['String'];
  originalRate: Scalars['Float'];
  depositRate: Scalars['Float'];
  withdrawRate: Scalars['Float'];
};

export enum TransactionSource {
  QuickCheckout = 'QuickCheckout',
  Widget = 'Widget',
  Wallet = 'Wallet'
}

export type TransactionShortListResult = {
  __typename?: 'TransactionShortListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<TransactionShort>>;
};

export type TransactionShort = {
  __typename?: 'TransactionShort';
  transactionId: Scalars['ID'];
  code?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateUser?: Maybe<UserShort>;
  created?: Maybe<Scalars['DateTime']>;
  executed?: Maybe<Scalars['DateTime']>;
  type: TransactionType;
  status: TransactionStatus;
  fee: Scalars['Float'];
  feePercent: Scalars['Float'];
  feeMinFiat: Scalars['Float'];
  feeMinEur: Scalars['Float'];
  feeDetails?: Maybe<Scalars['String']>;
  currencyToSpend: Scalars['String'];
  amountToSpend: Scalars['Float'];
  amountToSpendInEur: Scalars['Float'];
  amountToSpendWithoutFee: Scalars['Float'];
  currencyToReceive: Scalars['String'];
  amountToReceive: Scalars['Float'];
  amountToReceiveInEur: Scalars['Float'];
  amountToReceiveWithoutFee: Scalars['Float'];
  rate: Scalars['Float'];
  rateFiat: Scalars['Float'];
  rateEur: Scalars['Float'];
  fiatToEurRate: Scalars['Float'];
  eurToFiatRate: Scalars['Float'];
  defaultFiatToEurRate: Scalars['Float'];
  defaultCryptoToEurRate: Scalars['Float'];
  destinationType?: Maybe<TransactionDestinationType>;
  destination?: Maybe<Scalars['String']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  accountType?: Maybe<Scalars['String']>;
  source: TransactionSource;
  instrument: PaymentInstrument;
  custodyProvider?: Maybe<CustodyProvider>;
  custodyDetails?: Maybe<Scalars['String']>;
  paymentProvider?: Maybe<PaymentProvider>;
  liquidityProvider: LiquidityProvider;
  paymentOrder?: Maybe<PaymentOrder>;
  liquidityOrder?: Maybe<LiquidityOrder>;
  transferOrder?: Maybe<TransferOrder>;
  data?: Maybe<Scalars['String']>;
};

export type UserShort = {
  __typename?: 'UserShort';
  email: Scalars['String'];
  type?: Maybe<UserType>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  kycValid?: Maybe<Scalars['Boolean']>;
  kycStatus?: Maybe<Scalars['String']>;
  kycReviewComment?: Maybe<Scalars['String']>;
  defaultFiatCurrency?: Maybe<Scalars['String']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']>;
  affiliateCode?: Maybe<Scalars['String']>;
};

export enum TransactionStatus {
  New = 'New',
  Pending = 'Pending',
  Processing = 'Processing',
  Paid = 'Paid',
  AddressDeclined = 'AddressDeclined',
  PaymentDeclined = 'PaymentDeclined',
  ExchangeDeclined = 'ExchangeDeclined',
  TransferDeclined = 'TransferDeclined',
  Exchanging = 'Exchanging',
  Exchanged = 'Exchanged',
  TransferBenchmarkWaiting = 'TransferBenchmarkWaiting',
  Sending = 'Sending',
  Sent = 'Sent',
  Completed = 'Completed',
  Abounded = 'Abounded',
  Canceled = 'Canceled',
  Chargeback = 'Chargeback'
}

export enum TransactionDestinationType {
  User = 'USER',
  Affiliate = 'AFFILIATE',
  Address = 'ADDRESS',
  Widget = 'WIDGET'
}

export enum CustodyProvider {
  Trustology = 'Trustology',
  Fireblocks = 'Fireblocks'
}

export enum LiquidityProvider {
  Bitstamp = 'Bitstamp',
  Binance = 'Binance',
  Kraken = 'Kraken'
}

export type PaymentOrder = {
  __typename?: 'PaymentOrder';
  orderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  provider: PaymentProvider;
  created?: Maybe<Scalars['DateTime']>;
  amount: Scalars['Float'];
  currency: Scalars['String'];
  operations?: Maybe<Array<PaymentOperation>>;
  originalOrderId?: Maybe<Scalars['String']>;
  preauthOperationSn?: Maybe<Scalars['String']>;
  captureOperationSn?: Maybe<Scalars['String']>;
  refundOperationSn?: Maybe<Scalars['String']>;
  paymentInfo?: Maybe<Scalars['String']>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
};

export type PaymentOperation = {
  __typename?: 'PaymentOperation';
  operationId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  orderId?: Maybe<Scalars['String']>;
  originalOrderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  type: PaymentOperationType;
  sn: Scalars['String'];
  status?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
  callbackDetails?: Maybe<Scalars['String']>;
  errorCode?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
};

export enum PaymentOperationType {
  Preauth = 'preauth',
  Capture = 'capture',
  Refund = 'refund'
}

export type LiquidityOrder = {
  __typename?: 'LiquidityOrder';
  orderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  provider: LiquidityProvider;
  created: Scalars['DateTime'];
  published?: Maybe<Scalars['DateTime']>;
  publishingResult?: Maybe<Scalars['String']>;
  executed?: Maybe<Scalars['DateTime']>;
  executingResult?: Maybe<Scalars['String']>;
  symbol: Scalars['String'];
  type: LiquidityOrderType;
  side: LiquidityOrderSide;
  price?: Maybe<Scalars['Float']>;
  volume: Scalars['Float'];
  state: LiquidityOrderState;
  status: Scalars['String'];
  originalOrderId?: Maybe<Scalars['String']>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
};

export enum LiquidityOrderType {
  Limit = 'Limit',
  Market = 'Market',
  Instant = 'Instant'
}

export enum LiquidityOrderSide {
  Buy = 'Buy',
  Sell = 'Sell'
}

export enum LiquidityOrderState {
  Created = 'Created',
  Published = 'Published',
  Executed = 'Executed',
  Failed = 'Failed',
  Canceled = 'Canceled'
}

export type TransferOrder = {
  __typename?: 'TransferOrder';
  orderId: Scalars['ID'];
  userId: Scalars['String'];
  transactionId?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  published?: Maybe<Scalars['DateTime']>;
  executed?: Maybe<Scalars['DateTime']>;
  amount?: Maybe<Scalars['Float']>;
  currency?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  transferHash?: Maybe<Scalars['String']>;
  transferDetails?: Maybe<Scalars['String']>;
};

export type TransactionListResult = {
  __typename?: 'TransactionListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Transaction>>;
};

export type Transaction = {
  __typename?: 'Transaction';
  transactionId: Scalars['ID'];
  code?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  userIp?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateUser?: Maybe<User>;
  created?: Maybe<Scalars['DateTime']>;
  executed?: Maybe<Scalars['DateTime']>;
  type: TransactionType;
  status: TransactionStatus;
  kycStatus: TransactionKycStatus;
  fee: Scalars['Float'];
  feePercent: Scalars['Float'];
  feeMinFiat: Scalars['Float'];
  feeMinEur: Scalars['Float'];
  feeDetails: Scalars['String'];
  userDefaultFiatCurrency: Scalars['String'];
  userDefaultCryptoCurrency: Scalars['String'];
  currencyToSpend: Scalars['String'];
  amountToSpend: Scalars['Float'];
  amountToSpendWithoutFee: Scalars['Float'];
  amountToSpendInFiat: Scalars['Float'];
  amountToSpendInEur: Scalars['Float'];
  currencyToReceive: Scalars['String'];
  amountToReceive: Scalars['Float'];
  amountToReceiveWithoutFee: Scalars['Float'];
  amountToReceiveInFiat: Scalars['Float'];
  amountToReceiveInEur: Scalars['Float'];
  rate: Scalars['Float'];
  rateFiat: Scalars['Float'];
  rateEur: Scalars['Float'];
  rateFiatToEur: Scalars['Float'];
  rateEurToFiat: Scalars['Float'];
  defaultFiatToEurRate: Scalars['Float'];
  defaultCryptoToEurRate: Scalars['Float'];
  destinationType?: Maybe<TransactionDestinationType>;
  destination?: Maybe<Scalars['String']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  accountType?: Maybe<Scalars['String']>;
  source: TransactionSource;
  instrument: PaymentInstrument;
  custodyProvider?: Maybe<CustodyProvider>;
  custodyDetails?: Maybe<Scalars['String']>;
  paymentProvider?: Maybe<PaymentProvider>;
  paymentOrderId?: Maybe<Scalars['String']>;
  paymentOrder?: Maybe<PaymentOrder>;
  liquidityProvider: LiquidityProvider;
  liquidityOrderId?: Maybe<Scalars['String']>;
  liquidityOrder?: Maybe<LiquidityOrder>;
  transferOrderId?: Maybe<Scalars['String']>;
  transferOrder?: Maybe<TransferOrder>;
  userBalanceTotalBefore?: Maybe<Scalars['Float']>;
  userBalanceAvailableBefore?: Maybe<Scalars['Float']>;
  userBalanceTotalEurBefore?: Maybe<Scalars['Float']>;
  userBalanceAvailableEurBefore?: Maybe<Scalars['Float']>;
  userBalanceTotalFiatBefore?: Maybe<Scalars['Float']>;
  userBalanceAvailableFiatBefore?: Maybe<Scalars['Float']>;
  userBalanceTotalAfter?: Maybe<Scalars['Float']>;
  userBalanceAvailableAfter?: Maybe<Scalars['Float']>;
  userBalanceTotalEurAfter?: Maybe<Scalars['Float']>;
  userBalanceAvailableEurAfter?: Maybe<Scalars['Float']>;
  userBalanceTotalFiatAfter?: Maybe<Scalars['Float']>;
  userBalanceAvailableFiatAfter?: Maybe<Scalars['Float']>;
  data?: Maybe<Scalars['String']>;
};

export enum TransactionKycStatus {
  KycWaiting = 'KycWaiting',
  KycRejected = 'KycRejected',
  KycApproved = 'KycApproved'
}

export enum CountryCodeType {
  Code2 = 'code2',
  Code3 = 'code3'
}

export type DashboardStats = {
  __typename?: 'DashboardStats';
  deposits?: Maybe<DepositOrWithdrawalStats>;
  withdrawals?: Maybe<DepositOrWithdrawalStats>;
  transfers?: Maybe<TransferStats>;
  exchanges?: Maybe<ExchangeStats>;
  balances?: Maybe<Array<BalanceStats>>;
};

export type DepositOrWithdrawalStats = {
  __typename?: 'DepositOrWithdrawalStats';
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  abounded?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  fee?: Maybe<TransactionStatsVolume>;
  byInstruments?: Maybe<Array<InstrumentStats>>;
};

export type TransactionStatsVolume = {
  __typename?: 'TransactionStatsVolume';
  count?: Maybe<Scalars['Int']>;
  volume?: Maybe<Scalars['Float']>;
};

export type TransactionStatsByStatus = {
  __typename?: 'TransactionStatsByStatus';
  status?: Maybe<TransactionStatus>;
  volume?: Maybe<TransactionStatsVolume>;
};

export type InstrumentStats = {
  __typename?: 'InstrumentStats';
  instrument?: Maybe<PaymentInstrument>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  abounded?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  fee?: Maybe<TransactionStatsVolume>;
};

export type TransferStats = {
  __typename?: 'TransferStats';
  ratio?: Maybe<Scalars['Float']>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  toMerchant?: Maybe<Array<Maybe<Array<TransactionStatsByStatus>>>>;
  toCustomer?: Maybe<Array<Maybe<Array<TransactionStatsByStatus>>>>;
  fee?: Maybe<TransactionStatsVolume>;
};

export type ExchangeStats = {
  __typename?: 'ExchangeStats';
  ratio?: Maybe<Scalars['Int']>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  toMerchant?: Maybe<Array<Maybe<Array<TransactionStatsByStatus>>>>;
  toCustomer?: Maybe<Array<Maybe<Array<TransactionStatsByStatus>>>>;
  fee?: Maybe<TransactionStatsVolume>;
};

export type BalanceStats = {
  __typename?: 'BalanceStats';
  currency?: Maybe<Scalars['String']>;
  volume?: Maybe<TransactionStatsVolume>;
};

export type WidgetListResult = {
  __typename?: 'WidgetListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Widget>>;
};

export type Widget = {
  __typename?: 'Widget';
  widgetId: Scalars['ID'];
  userId: Scalars['String'];
  created: Scalars['DateTime'];
  transactionType?: Maybe<Array<TransactionType>>;
  currenciesFrom?: Maybe<Array<Scalars['String']>>;
  currenciesTo?: Maybe<Array<Scalars['String']>>;
  destinationAddress?: Maybe<Scalars['String']>;
  minAmountFrom?: Maybe<Scalars['Float']>;
  maxAmountFrom?: Maybe<Scalars['Float']>;
  fixAmountFrom?: Maybe<Scalars['Float']>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<PaymentProvider>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  data?: Maybe<Scalars['String']>;
};

export type WidgetShort = {
  __typename?: 'WidgetShort';
  transactionType?: Maybe<Array<TransactionType>>;
  currenciesFrom?: Maybe<Array<Scalars['String']>>;
  currenciesTo?: Maybe<Array<Scalars['String']>>;
  hasFixedAddress: Scalars['Boolean'];
  minAmountFrom?: Maybe<Scalars['Float']>;
  maxAmountFrom?: Maybe<Scalars['Float']>;
  fixAmountFrom?: Maybe<Scalars['Float']>;
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<PaymentProvider>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  data?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  foo: Scalars['String'];
  createMyApiKey?: Maybe<ApiKeySecret>;
  deleteMyApiKey?: Maybe<Scalars['Void']>;
  createApiKey?: Maybe<ApiKeySecret>;
  deleteApiKey?: Maybe<Scalars['Void']>;
  preauthFull: PaymentPreauthResult;
  preauth: PaymentPreauthResultShort;
  captureFull: PaymentOrder;
  status: Scalars['String'];
  updateSettingsCommon: SettingsCommon;
  addSettingsFee: SettingsFee;
  updateSettingsFee: SettingsFee;
  deleteSettingsFee: SettingsFee;
  addSettingsCost: SettingsCost;
  updateSettingsCost: SettingsCost;
  deleteSettingsCost: SettingsCost;
  addSettingsKycLevel: SettingsKycLevel;
  updateSettingsKycLevel: SettingsKycLevel;
  deleteSettingsKycLevel: SettingsKycLevel;
  addSettingsKyc: SettingsKyc;
  updateSettingsKyc: SettingsKyc;
  deleteSettingsKyc: SettingsKyc;
  updateMe?: Maybe<User>;
  updateUser?: Maybe<User>;
  assignRole?: Maybe<User>;
  removeRole?: Maybe<User>;
  deleteUser?: Maybe<User>;
  addMyContact?: Maybe<User>;
  updateMyContact?: Maybe<User>;
  deleteMyContact?: Maybe<User>;
  addMyBankAccount?: Maybe<User>;
  updateMyBankAccount?: Maybe<User>;
  deleteMyBankAccount?: Maybe<User>;
  addBankAccount?: Maybe<User>;
  updateBankAccount?: Maybe<User>;
  deleteBankAccount?: Maybe<User>;
  signup: LoginResult;
  login: LoginResult;
  logout: Scalars['Boolean'];
  refreshToken: Scalars['String'];
  confirmEmail: Scalars['Boolean'];
  confirmDevice: Scalars['Boolean'];
  setMyInfo: LoginResult;
  setUserInfo: LoginResult;
  forgotPassword: Scalars['Boolean'];
  setPassword: Scalars['Boolean'];
  changePassword: Scalars['Boolean'];
  generate2faCode: TwoFactorAuthenticationResult;
  get2faQRCode: Scalars['String'];
  verify2faCode: LoginResult;
  enable2fa: LoginResult;
  disable2fa: LoginResult;
  sendEmailCodePasswordChange: Scalars['Boolean'];
  addFeedback: Feedback;
  sendTestNotification?: Maybe<Scalars['Void']>;
  createTransaction?: Maybe<TransactionShort>;
  executeTransaction?: Maybe<TransactionShort>;
  cancelMyTransaction?: Maybe<TransactionShort>;
  cancelTransaction?: Maybe<Transaction>;
  createMyWidget?: Maybe<Widget>;
  createWidget?: Maybe<Widget>;
  deleteMyWidget?: Maybe<Widget>;
  deleteWidget?: Maybe<Widget>;
};


export type MutationDeleteMyApiKeyArgs = {
  apiKeyId?: Maybe<Scalars['String']>;
};


export type MutationCreateApiKeyArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type MutationDeleteApiKeyArgs = {
  apiKeyId?: Maybe<Scalars['String']>;
};


export type MutationPreauthFullArgs = {
  orderParams: PaymentPreauthInput;
};


export type MutationPreauthArgs = {
  orderParams: PaymentPreauthInput;
};


export type MutationCaptureFullArgs = {
  orderId: Scalars['String'];
};


export type MutationStatusArgs = {
  orderId: Scalars['String'];
  amount?: Maybe<Scalars['Float']>;
};


export type MutationUpdateSettingsCommonArgs = {
  settingsId: Scalars['ID'];
  settings: SettingsCommonInput;
};


export type MutationAddSettingsFeeArgs = {
  settings: SettingsFeeInput;
};


export type MutationUpdateSettingsFeeArgs = {
  settingsId: Scalars['ID'];
  settings: SettingsFeeInput;
};


export type MutationDeleteSettingsFeeArgs = {
  settingsId: Scalars['ID'];
};


export type MutationAddSettingsCostArgs = {
  settings: SettingsCostInput;
};


export type MutationUpdateSettingsCostArgs = {
  settingsId: Scalars['ID'];
  settings: SettingsCostInput;
};


export type MutationDeleteSettingsCostArgs = {
  settingsId: Scalars['ID'];
};


export type MutationAddSettingsKycLevelArgs = {
  settingsLevel: SettingsKycLevelInput;
};


export type MutationUpdateSettingsKycLevelArgs = {
  settingsLevelId: Scalars['ID'];
  settingsLevel: SettingsKycLevelInput;
};


export type MutationDeleteSettingsKycLevelArgs = {
  settingsId: Scalars['ID'];
};


export type MutationAddSettingsKycArgs = {
  settings: SettingsKycInput;
};


export type MutationUpdateSettingsKycArgs = {
  settingsId: Scalars['ID'];
  settings: SettingsKycInput;
};


export type MutationDeleteSettingsKycArgs = {
  settingsId: Scalars['ID'];
};


export type MutationUpdateMeArgs = {
  user?: Maybe<UserInput>;
};


export type MutationUpdateUserArgs = {
  userId: Scalars['ID'];
  user?: Maybe<UserInput>;
};


export type MutationAssignRoleArgs = {
  userId: Scalars['ID'];
  roleCodes?: Maybe<Array<Scalars['String']>>;
};


export type MutationRemoveRoleArgs = {
  userId: Scalars['ID'];
  roleCodes?: Maybe<Array<Scalars['String']>>;
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID'];
};


export type MutationAddMyContactArgs = {
  contactEmail: Scalars['String'];
  displayName?: Maybe<Scalars['String']>;
};


export type MutationUpdateMyContactArgs = {
  contactId: Scalars['String'];
  contactEmail?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
};


export type MutationDeleteMyContactArgs = {
  contactId: Scalars['ID'];
};


export type MutationAddMyBankAccountArgs = {
  bankAccount?: Maybe<UserBankAccountInput>;
};


export type MutationUpdateMyBankAccountArgs = {
  bankAccountId: Scalars['String'];
  bankAccount?: Maybe<UserBankAccountInput>;
};


export type MutationDeleteMyBankAccountArgs = {
  bankAccountId: Scalars['ID'];
};


export type MutationAddBankAccountArgs = {
  userId: Scalars['String'];
  bankAccount?: Maybe<UserBankAccountInput>;
};


export type MutationUpdateBankAccountArgs = {
  userId: Scalars['String'];
  bankAccountId: Scalars['String'];
  bankAccount?: Maybe<UserBankAccountInput>;
};


export type MutationDeleteBankAccountArgs = {
  bankAccountId: Scalars['ID'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  type: UserType;
  mode: UserMode;
  merchantId?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  address?: Maybe<PostAddress>;
  phone?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
  termsOfUse: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  oAuthProvider?: Maybe<OAuthProvider>;
  oAuthToken?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
  quickCheckout?: Maybe<Scalars['Boolean']>;
};


export type MutationConfirmEmailArgs = {
  token: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationConfirmDeviceArgs = {
  token: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationSetMyInfoArgs = {
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  address?: Maybe<PostAddress>;
  phone?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
};


export type MutationSetUserInfoArgs = {
  userId: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  address?: Maybe<PostAddress>;
  phone?: Maybe<Scalars['String']>;
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationSetPasswordArgs = {
  token: Scalars['String'];
  password: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  code2fa?: Maybe<Scalars['String']>;
  oldPassword: Scalars['String'];
  newPassword: Scalars['String'];
};


export type MutationGet2faQrCodeArgs = {
  data: Scalars['String'];
};


export type MutationVerify2faCodeArgs = {
  code: Scalars['String'];
};


export type MutationEnable2faArgs = {
  password: Scalars['String'];
  code: Scalars['String'];
};


export type MutationDisable2faArgs = {
  password: Scalars['String'];
  code: Scalars['String'];
};


export type MutationAddFeedbackArgs = {
  feedback: FeedbackInput;
};


export type MutationCreateTransactionArgs = {
  transaction?: Maybe<TransactionInput>;
};


export type MutationExecuteTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
};


export type MutationCancelMyTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
};


export type MutationCancelTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
};


export type MutationCreateMyWidgetArgs = {
  widget?: Maybe<WidgetInput>;
};


export type MutationCreateWidgetArgs = {
  userId?: Maybe<Scalars['String']>;
  widget?: Maybe<WidgetInput>;
};


export type MutationDeleteMyWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
};


export type MutationDeleteWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
};

export type ApiKeySecret = {
  __typename?: 'ApiKeySecret';
  apiKeyId: Scalars['ID'];
  userId: Scalars['String'];
  secret: Scalars['String'];
  created: Scalars['DateTime'];
  disabled?: Maybe<Scalars['DateTime']>;
};


export type PaymentPreauthInput = {
  transactionId: Scalars['String'];
  instrument: PaymentInstrument;
  provider: PaymentProvider;
  card?: Maybe<PaymentCard>;
};

export type PaymentCard = {
  number?: Maybe<Scalars['String']>;
  expireMonth?: Maybe<Scalars['Int']>;
  expireYear?: Maybe<Scalars['Int']>;
  cvv2?: Maybe<Scalars['Int']>;
  holder?: Maybe<Scalars['String']>;
};

export type PaymentPreauthResult = {
  __typename?: 'PaymentPreauthResult';
  order?: Maybe<PaymentOrder>;
  html?: Maybe<Scalars['String']>;
};

export type PaymentPreauthResultShort = {
  __typename?: 'PaymentPreauthResultShort';
  order?: Maybe<PaymentOrderShort>;
  html?: Maybe<Scalars['String']>;
};

export type PaymentOrderShort = {
  __typename?: 'PaymentOrderShort';
  orderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  provider: PaymentProvider;
  created?: Maybe<Scalars['DateTime']>;
  amount: Scalars['Float'];
  currency: Scalars['String'];
  operations?: Maybe<Array<PaymentOperationShort>>;
  paymentInfo?: Maybe<Scalars['String']>;
};

export type PaymentOperationShort = {
  __typename?: 'PaymentOperationShort';
  operationId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  type: PaymentOperationType;
  status?: Maybe<Scalars['String']>;
  errorCode?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
};

export type SettingsCommonInput = {
  liquidityProvider?: Maybe<Scalars['String']>;
  liquidityProviderWithdrawalAddress?: Maybe<Scalars['String']>;
  liquidityProviderWithdrawalBenchmark?: Maybe<Scalars['Float']>;
  custodyProvider?: Maybe<Scalars['String']>;
  kycProvider?: Maybe<Scalars['String']>;
  kycBaseAddress?: Maybe<Scalars['String']>;
};

export type SettingsFeeInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  targetFilterType?: Maybe<SettingsFeeTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  targetInstruments?: Maybe<Array<PaymentInstrument>>;
  targetUserTypes?: Maybe<Array<UserType>>;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetTransactionTypes?: Maybe<Array<TransactionType>>;
  targetPaymentProviders?: Maybe<Array<PaymentProvider>>;
  terms?: Maybe<Scalars['String']>;
  wireDetails?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type SettingsCostInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  targetFilterType?: Maybe<SettingsCostTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  targetInstruments?: Maybe<Array<PaymentInstrument>>;
  targetTransactionTypes?: Maybe<Array<TransactionType>>;
  targetPaymentProviders?: Maybe<Array<PaymentProvider>>;
  terms?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type SettingsKycLevelInput = {
  name: Scalars['String'];
  data: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  userType: UserType;
  order?: Maybe<Scalars['Int']>;
};

export type SettingsKycInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  targetKycProviders?: Maybe<Array<KycProvider>>;
  targetUserType: UserType;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetFilterType?: Maybe<SettingsKycTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  levelIds?: Maybe<Array<Scalars['String']>>;
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type UserInput = {
  email?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  postCode?: Maybe<Scalars['String']>;
  town?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  subStreet?: Maybe<Scalars['String']>;
  stateName?: Maybe<Scalars['String']>;
  buildingName?: Maybe<Scalars['String']>;
  buildingNumber?: Maybe<Scalars['String']>;
  flatNumber?: Maybe<Scalars['String']>;
  addressStartDate?: Maybe<Scalars['DateTime']>;
  addressEndDate?: Maybe<Scalars['DateTime']>;
  phone?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
  emailConfirmed?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['DateTime']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']>;
  defaultFiatCurrency?: Maybe<Scalars['String']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']>;
};

export type UserBankAccountInput = {
  beneficiaryName?: Maybe<Scalars['String']>;
  beneficiaryAddress?: Maybe<Scalars['String']>;
  bankName?: Maybe<Scalars['String']>;
  bankAddress?: Maybe<Scalars['String']>;
  swiftBic?: Maybe<Scalars['String']>;
  iban?: Maybe<Scalars['String']>;
  currency?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type PostAddress = {
  postCode?: Maybe<Scalars['String']>;
  town?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  subStreet?: Maybe<Scalars['String']>;
  stateName?: Maybe<Scalars['String']>;
  buildingName?: Maybe<Scalars['String']>;
  buildingNumber?: Maybe<Scalars['String']>;
  flatNumber?: Maybe<Scalars['String']>;
  addressStartDate?: Maybe<Scalars['DateTime']>;
  addressEndDate?: Maybe<Scalars['DateTime']>;
};

export type LoginResult = {
  __typename?: 'LoginResult';
  authToken?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  authTokenAction?: Maybe<Scalars['String']>;
  authTokenActionParam?: Maybe<Scalars['String']>;
};

export type TwoFactorAuthenticationResult = {
  __typename?: 'TwoFactorAuthenticationResult';
  otpauthUrl: Scalars['String'];
  code: Scalars['String'];
  qr: Scalars['String'];
};

export type FeedbackInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type TransactionInput = {
  type: TransactionType;
  currencyToSpend: Scalars['String'];
  currencyToReceive: Scalars['String'];
  amountToSpend: Scalars['Float'];
  destinationType?: Maybe<TransactionDestinationType>;
  destination?: Maybe<Scalars['String']>;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  data?: Maybe<Scalars['String']>;
};

export type WidgetInput = {
  transactionType?: Maybe<Array<TransactionType>>;
  currenciesFrom?: Maybe<Array<Scalars['String']>>;
  currenciesTo?: Maybe<Array<Scalars['String']>>;
  destinationAddresses?: Maybe<Array<Scalars['String']>>;
  minAmountFrom?: Maybe<Scalars['Float']>;
  maxAmountFrom?: Maybe<Scalars['Float']>;
  fixAmountFrom?: Maybe<Scalars['Float']>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<PaymentProvider>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  data?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  newNotification?: Maybe<Scalars['Void']>;
  transactionServiceNotification?: Maybe<Scalars['Void']>;
};

export enum UserNotificationCodes {
  TestNotification = 'TEST_NOTIFICATION',
  TransactionConfirmation = 'TRANSACTION_CONFIRMATION',
  TransactionStatusChanged = 'TRANSACTION_STATUS_CHANGED',
  KycStatusChanged = 'KYC_STATUS_CHANGED'
}

export enum BitcoinAddressFormats {
  Legacy = 'LEGACY',
  Segwit = 'SEGWIT'
}

export enum FileType {
  Avatar = 'Avatar',
  SupportTicket = 'SupportTicket'
}

export type File = {
  __typename?: 'File';
  path: Scalars['String'];
  originFileName: Scalars['String'];
  type: FileType;
  mimeType?: Maybe<Scalars['String']>;
  encoding?: Maybe<Scalars['String']>;
  fileSize?: Maybe<Scalars['Float']>;
  order?: Maybe<Scalars['Int']>;
};

export type FileInfo = {
  type?: Maybe<FileType>;
  order?: Maybe<Scalars['Int']>;
};


export type RequiredUserPermission = {
  objectCode?: Maybe<Scalars['String']>;
  fullAccess?: Maybe<Scalars['Boolean']>;
};

export type VaultAccount = {
  __typename?: 'VaultAccount';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  hiddenOnUI?: Maybe<Scalars['Boolean']>;
  customerRefId?: Maybe<Scalars['String']>;
  autoFuel?: Maybe<Scalars['Boolean']>;
  assets?: Maybe<Array<VaultAccountAsset>>;
};

export type InternalWallet = {
  __typename?: 'InternalWallet';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  customerRefId?: Maybe<Scalars['String']>;
  assets?: Maybe<Array<InternalWalletAsset>>;
};

export type InternalWalletAsset = {
  __typename?: 'InternalWalletAsset';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<WalletAssetStatus>;
  balance?: Maybe<Scalars['String']>;
  lockedAmount?: Maybe<Scalars['String']>;
  activationTime?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  tag?: Maybe<Scalars['String']>;
};

export type InternalWalletAssetShort = {
  __typename?: 'InternalWalletAssetShort';
  status?: Maybe<WalletAssetStatus>;
  balance?: Maybe<Scalars['String']>;
  lockedAmount?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
};

export type ExternalWalletAssetShort = {
  __typename?: 'ExternalWalletAssetShort';
  status?: Maybe<WalletAssetStatus>;
  address?: Maybe<Scalars['String']>;
};

export type NewAddress = {
  __typename?: 'NewAddress';
  address: Scalars['String'];
  tag?: Maybe<Scalars['String']>;
  legacyAddress?: Maybe<Scalars['String']>;
};

export type DepositAddress = {
  __typename?: 'DepositAddress';
  assetId: Scalars['String'];
  address: Scalars['String'];
  tag?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  customerRefId?: Maybe<Scalars['String']>;
  addressFormat?: Maybe<Scalars['String']>;
};

export type TransferResult = {
  __typename?: 'TransferResult';
  id?: Maybe<Scalars['String']>;
  result?: Maybe<Scalars['String']>;
};

export enum FireblocksTransactionStatus {
  Submitted = 'SUBMITTED',
  Queued = 'QUEUED',
  PendingAuthorization = 'PENDING_AUTHORIZATION',
  PendingSignature = 'PENDING_SIGNATURE',
  Broadcasting = 'BROADCASTING',
  Pending_3RdPartyManualApproval = 'PENDING_3RD_PARTY_MANUAL_APPROVAL',
  Pending_3RdParty = 'PENDING_3RD_PARTY',
  Confirming = 'CONFIRMING',
  PartiallyCompleted = 'PARTIALLY_COMPLETED',
  PendingAmlScreening = 'PENDING_AML_SCREENING',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
  Rejected = 'REJECTED',
  Blocked = 'BLOCKED',
  Failed = 'FAILED'
}

export type UserDevice = {
  __typename?: 'UserDevice';
  userDeviceId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  eu?: Maybe<Scalars['String']>;
  metro?: Maybe<Scalars['Int']>;
  area?: Maybe<Scalars['Int']>;
  location?: Maybe<Scalars['String']>;
  browser?: Maybe<Scalars['String']>;
  device?: Maybe<Scalars['String']>;
  deviceConfirmed?: Maybe<Scalars['DateTime']>;
};

export type UserLogin = {
  __typename?: 'UserLogin';
  userLoginId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  date: Scalars['DateTime'];
  result: Scalars['Int'];
  resultTokenAction?: Maybe<Scalars['String']>;
  ip?: Maybe<Scalars['String']>;
  userDeviceId?: Maybe<Scalars['String']>;
};

export type UserNotificationSubscriptionInput = {
  userId?: Maybe<Scalars['String']>;
  userNotificationTypeCode: Scalars['String'];
  siteNotification?: Maybe<Scalars['Boolean']>;
  emailNotification?: Maybe<Scalars['Boolean']>;
};

export type UserNotificationSubscriptionListResult = {
  __typename?: 'UserNotificationSubscriptionListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserNotificationSubscription>>;
};

export type UserNotificationType = {
  __typename?: 'UserNotificationType';
  userNotificationTypeCode: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  siteNotificationDefault?: Maybe<Scalars['Boolean']>;
  siteNotificationImmutable?: Maybe<Scalars['Boolean']>;
  emailNotificationDefault?: Maybe<Scalars['Boolean']>;
  emailNotificationImmutable?: Maybe<Scalars['Boolean']>;
};

export type UserNotificationTypeInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  siteNotificationDefault?: Maybe<Scalars['Boolean']>;
  siteNotificationImmutable?: Maybe<Scalars['Boolean']>;
  emailNotificationDefault?: Maybe<Scalars['Boolean']>;
  emailNotificationImmutable?: Maybe<Scalars['Boolean']>;
};

export type UserNotificationTypeListResult = {
  __typename?: 'UserNotificationTypeListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserNotificationType>>;
};

export enum TokenAction {
  Default = 'Default',
  ConfirmEmail = 'ConfirmEmail',
  ConfirmPasswordChange = 'ConfirmPasswordChange',
  UserInfoRequired = 'UserInfoRequired',
  ConfirmDevice = 'ConfirmDevice',
  TwoFactorAuth = 'TwoFactorAuth',
  KycRequired = 'KycRequired',
  ApiKey = 'ApiKey'
}

export enum KycStatus {
  Unknown = 'unknown',
  NotFound = 'notFound',
  Init = 'init',
  Pending = 'pending',
  Queued = 'queued',
  Completed = 'completed',
  OnHold = 'onHold'
}

export type KycRejectedLabel = {
  __typename?: 'KycRejectedLabel';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type PaymentCaptureInput = {
  orderId: Scalars['String'];
  instrument: PaymentInstrument;
  provider: PaymentProvider;
};

export type TransferListResult = {
  __typename?: 'TransferListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<TransferOrder>>;
};
