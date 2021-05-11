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
  getSettingsCommon?: Maybe<SettingsCommon>;
  getSettingsCurrency?: Maybe<SettingsCurrencyListResult>;
  getSettingsKycLevels?: Maybe<SettingsKycLevelListResult>;
  getSettingsKyc?: Maybe<SettingsKycListResult>;
  getMySettingsKyc?: Maybe<SettingsKycShort>;
  getMySettingsKycFull?: Maybe<SettingsKyc>;
  getAppropriateSettingsKyc?: Maybe<SettingsKyc>;
  getSettingsFee?: Maybe<SettingsFeeListResult>;
  getMySettingsFee?: Maybe<SettingsFeeShort>;
  getMySettingsFeeFull?: Maybe<SettingsFee>;
  getAppropriateSettingsFee?: Maybe<SettingsFee>;
  getSettingsCost?: Maybe<SettingsCostListResult>;
  getAppropriateSettingsCost?: Maybe<SettingsCostShort>;
  getAppropriateSettingsCostFull?: Maybe<SettingsCost>;
  generateWebApiToken: Scalars['String'];
  me: User;
  myKycStatus: Scalars['String'];
  userKycInfo: KycInfo;
  userCount?: Maybe<Scalars['Int']>;
  userById: User;
  userByName: User;
  userByEmail: User;
  userByOAuthAppId: User;
  userByReferralCode: User;
  getUsers: UserListResult;
  myActions: UserActionListResult;
  userActions: UserActionListResult;
  myKycInfo?: Maybe<KycInfo>;
  getMySupportTickets?: Maybe<SupportTicketListResult>;
  getSupportTickets?: Maybe<SupportTicketListResult>;
  getFeedbacks?: Maybe<FeedbackListResult>;
  getRates?: Maybe<Array<Rate>>;
  getMyTransactions?: Maybe<TransactionShortListResult>;
  getTransactions?: Maybe<TransactionListResult>;
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


export type QueryGetMySettingsFeeArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
};


export type QueryGetMySettingsFeeFullArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
};


export type QueryGetAppropriateSettingsFeeArgs = {
  transactionType: TransactionType;
  targetUserType: UserType;
  targetUserMode: UserMode;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
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
  filterType?: Maybe<SettingsCostTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetAppropriateSettingsCostFullArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  filterType?: Maybe<SettingsCostTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
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


export type QueryMyActionsArgs = {
  withResult?: Maybe<UserActionResult>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryUserActionsArgs = {
  userId?: Maybe<Scalars['String']>;
  withResult?: Maybe<UserActionResult>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetMySupportTicketsArgs = {
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


export type QueryGetMyTransactionsArgs = {
  quickCheckoutOnly?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetTransactionsArgs = {
  userId?: Maybe<Scalars['String']>;
  quickCheckoutOnly?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};

export type SettingsCommon = {
  __typename?: 'SettingsCommon';
  settingsCommonId?: Maybe<Scalars['String']>;
  liquidityProvider?: Maybe<Scalars['String']>;
  liquidityBaseAddress?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  custodyBaseAddress?: Maybe<Scalars['String']>;
  kycProvider?: Maybe<Scalars['String']>;
  kycBaseAddress?: Maybe<Scalars['String']>;
};

export type OrderBy = {
  orderBy: Scalars['String'];
  desc: Scalars['Boolean'];
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
  rateFactor: Scalars['Float'];
  validateAsSymbol?: Maybe<Scalars['String']>;
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

export enum UserType {
  Merchant = 'Merchant',
  Personal = 'Personal'
}


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
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export enum KycProvider {
  Local = 'Local',
  SumSub = 'SumSub'
}

export enum UserMode {
  InternalWallet = 'InternalWallet',
  ExternalWallet = 'ExternalWallet'
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

export type User = {
  __typename?: 'User';
  userId: Scalars['ID'];
  email: Scalars['String'];
  name: Scalars['String'];
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  defaultCurrency?: Maybe<Scalars['String']>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
  created?: Maybe<Scalars['DateTime']>;
  updated?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['DateTime']>;
  accessFailedCount?: Maybe<Scalars['Int']>;
  nameConfirmed?: Maybe<Scalars['DateTime']>;
  emailConfirmed?: Maybe<Scalars['DateTime']>;
  roles?: Maybe<Array<UserRole>>;
  permissions?: Maybe<Array<UserRolePermission>>;
  is2faEnabled?: Maybe<Scalars['Boolean']>;
  hasEmailAuth?: Maybe<Scalars['Boolean']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']>;
  referralCode?: Maybe<Scalars['String']>;
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
  walletIds?: Maybe<Array<Scalars['String']>>;
  externalWalletIds?: Maybe<Array<Scalars['String']>>;
  state?: Maybe<UserState>;
};


export type UserStateArgs = {
  notificationUnreadOnly?: Maybe<Scalars['Boolean']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};

export type UserRole = {
  __typename?: 'UserRole';
  name: Scalars['String'];
  code: Scalars['String'];
  immutable?: Maybe<Scalars['Boolean']>;
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

export type UserState = {
  __typename?: 'UserState';
  date?: Maybe<Scalars['DateTime']>;
  internalWallets?: Maybe<Array<InternalWallet>>;
  externalWallets?: Maybe<Array<ExternalWallet>>;
  notifications?: Maybe<UserNotificationListResult>;
};


export type UserStateInternalWalletsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type UserStateExternalWalletsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type UserStateNotificationsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
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

export enum WalletAssetStatus {
  WaitingForApproval = 'WAITING_FOR_APPROVAL',
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Rejected = 'REJECTED',
  Failed = 'FAILED'
}

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

export type UserNotificationListResult = {
  __typename?: 'UserNotificationListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserNotification>>;
};

export type UserNotification = {
  __typename?: 'UserNotification';
  userNotificationId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  userNotificationTypeCode: Scalars['String'];
  created?: Maybe<Scalars['DateTime']>;
  viewed?: Maybe<Scalars['DateTime']>;
  text?: Maybe<Scalars['String']>;
  linkedId?: Maybe<Scalars['String']>;
  linkedTable?: Maybe<Scalars['String']>;
  params?: Maybe<Scalars['String']>;
};

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
  countryCode3?: Maybe<Scalars['String']>;
  status?: Maybe<KycStatus>;
  details?: Maybe<Array<StringMap>>;
};

export enum KycStatus {
  Unknown = 'unknown',
  NotFound = 'notFound',
  Init = 'init',
  Pending = 'pending',
  Queued = 'queued',
  Completed = 'completed',
  OnHold = 'onHold'
}

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

export enum UserActionResult {
  Unknown = 'unknown',
  Success = 'success',
  Fail = 'fail'
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
  Sell = 'sell',
  Buy = 'buy'
}

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
  created: Scalars['DateTime'];
  executed?: Maybe<Scalars['DateTime']>;
  type: TransactionType;
  status: TransactionStatus;
  fee: Scalars['Float'];
  feePercent: Scalars['Float'];
  feeMinEuro: Scalars['Float'];
  feeDetails?: Maybe<Scalars['String']>;
  currencyToSpend: Scalars['String'];
  amountToSpend: Scalars['Float'];
  amountToSpendWithoutFee: Scalars['Float'];
  currencyToReceive: Scalars['String'];
  amountToReceive: Scalars['Float'];
  amountToReceiveWithoutFee: Scalars['Float'];
  rate: Scalars['Float'];
  cryptoAddress?: Maybe<Scalars['String']>;
  source: TransactionSource;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  data?: Maybe<Scalars['String']>;
};

export enum TransactionStatus {
  New = 'New',
  Pending = 'Pending',
  Processing = 'Processing',
  Paid = 'Paid',
  PaymentDeclined = 'PaymentDeclined',
  ConfirmingOrder = 'ConfirmingOrder',
  SendingToAddress = 'SendingToAddress',
  Completed = 'Completed',
  KycRejected = 'KycRejected',
  Abounded = 'Abounded',
  Canceled = 'Canceled',
  Chargeback = 'Chargeback'
}

export enum TransactionSource {
  QuickCheckout = 'QuickCheckout',
  Widget = 'Widget',
  Wallet = 'Wallet'
}

export enum LiquidityProvider {
  Bitstamp = 'Bitstamp'
}

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
  created: Scalars['DateTime'];
  executed?: Maybe<Scalars['DateTime']>;
  type: TransactionType;
  status: TransactionStatus;
  fee: Scalars['Float'];
  feePercent: Scalars['Float'];
  feeMinEuro: Scalars['Float'];
  feeDetails: Scalars['String'];
  currencyToSpend: Scalars['String'];
  amountToSpend: Scalars['Float'];
  amountToSpendWithoutFee: Scalars['Float'];
  currencyToReceive: Scalars['String'];
  amountToReceive: Scalars['Float'];
  amountToReceiveWithoutFee: Scalars['Float'];
  rate: Scalars['Float'];
  cryptoAddress?: Maybe<Scalars['String']>;
  source: TransactionSource;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  paymentOrderId?: Maybe<Scalars['String']>;
  paymentOrder?: Maybe<PaymentOrder>;
  liquidityProvider: LiquidityProvider;
  liquidityOrderId?: Maybe<Scalars['String']>;
  liquidityOrder?: Maybe<LiquidityOrder>;
  transferOrderId?: Maybe<Scalars['String']>;
  transferOrder?: Maybe<TransferOrder>;
  data?: Maybe<Scalars['String']>;
};

export type PaymentOrder = {
  __typename?: 'PaymentOrder';
  orderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  provider: PaymentProvider;
  created: Scalars['DateTime'];
  amount: Scalars['Float'];
  currency: Scalars['String'];
  preauth?: Maybe<Scalars['DateTime']>;
  preauthResult?: Maybe<Scalars['String']>;
  capture?: Maybe<Scalars['DateTime']>;
  captureResult?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  originalOrderId?: Maybe<Scalars['String']>;
  executed?: Maybe<Scalars['DateTime']>;
  executingResult?: Maybe<Scalars['String']>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
};

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
  Failed = 'Failed'
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
  transactionHash?: Maybe<Scalars['String']>;
  transactionDetails?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  foo: Scalars['String'];
  createPaymentOrder: PaymentOrder;
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
  signup: LoginResult;
  login: LoginResult;
  logout: Scalars['Boolean'];
  refreshToken: Scalars['String'];
  confirmEmail: Scalars['Boolean'];
  confirmDevice: Scalars['Boolean'];
  confirmName: LoginResult;
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
  createQuickCheckout?: Maybe<TransactionShort>;
  executeQuickCheckout?: Maybe<TransactionShort>;
};


export type MutationCreatePaymentOrderArgs = {
  orderParams: PaymentOrderInput;
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


export type MutationSignupArgs = {
  email: Scalars['String'];
  name: Scalars['String'];
  type: UserType;
  mode: UserMode;
  merchantId?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2: Scalars['String'];
  countryCode3: Scalars['String'];
  phone: Scalars['String'];
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


export type MutationConfirmNameArgs = {
  token: Scalars['String'];
  name: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  type: UserType;
  mode: UserMode;
  countryCode2: Scalars['String'];
  countryCode3: Scalars['String'];
  phone: Scalars['String'];
  recaptcha: Scalars['String'];
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
  token: Scalars['String'];
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


export type MutationCreateQuickCheckoutArgs = {
  transaction?: Maybe<TransactionInput>;
  recaptcha: Scalars['String'];
};


export type MutationExecuteQuickCheckoutArgs = {
  transactionId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
};

export type PaymentOrderInput = {
  transactionId: Scalars['String'];
  instrument: PaymentInstrument;
  provider: PaymentProvider;
  amount: Scalars['Float'];
  currency: Scalars['String'];
  card?: Maybe<PaymentCard>;
};

export type PaymentCard = {
  number?: Maybe<Scalars['String']>;
  expireMonth?: Maybe<Scalars['Int']>;
  expireYear?: Maybe<Scalars['Int']>;
  cvv2?: Maybe<Scalars['Int']>;
  holder?: Maybe<Scalars['String']>;
};

export type SettingsCommonInput = {
  liquidityProvider?: Maybe<Scalars['String']>;
  liquidityBaseAddress?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  custodyBaseAddress?: Maybe<Scalars['String']>;
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
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type UserInput = {
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
  merchantIds?: Maybe<Array<Scalars['String']>>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  birthday?: Maybe<Scalars['DateTime']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  termsOfUse?: Maybe<Scalars['Boolean']>;
  emailConfirmed?: Maybe<Scalars['DateTime']>;
  nameConfirmed?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['DateTime']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']>;
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
  affiliateId?: Maybe<Scalars['String']>;
  currencyToReceive: Scalars['String'];
  amountFiat: Scalars['Float'];
  rate: Scalars['Float'];
  cryptoAddress?: Maybe<Scalars['String']>;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<PaymentProvider>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  data?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  newNotification?: Maybe<Scalars['Void']>;
};

export enum CustodyProvider {
  Trustology = 'Trustology',
  Fireblocks = 'Fireblocks'
}

export enum UserNotificationCodes {
  TestNotification = 'TEST_NOTIFICATION',
  TransactionConfirmation = 'TRANSACTION_CONFIRMATION',
  TransactionStatusChanged = 'TRANSACTION_STATUS_CHANGED',
  KycStatusChanged = 'KYC_STATUS_CHANGED'
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

export enum TokenAction {
  Default = 'Default',
  ConfirmEmail = 'ConfirmEmail',
  ConfirmPasswordChange = 'ConfirmPasswordChange',
  ConfirmName = 'ConfirmName',
  ConfirmDevice = 'ConfirmDevice',
  TwoFactorAuth = 'TwoFactorAuth',
  KycRequired = 'KycRequired'
}

export type UserDevice = {
  __typename?: 'UserDevice';
  userDeviceId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  country?: Maybe<Scalars['String']>;
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

export type VaultAccount = {
  __typename?: 'VaultAccount';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  hiddenOnUI?: Maybe<Scalars['Boolean']>;
  customerRefId?: Maybe<Scalars['String']>;
  autoFuel?: Maybe<Scalars['Boolean']>;
  assets?: Maybe<Array<VaultAccountAsset>>;
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

export type KycRejectedLabel = {
  __typename?: 'KycRejectedLabel';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type UserLogin = {
  __typename?: 'UserLogin';
  userLoginId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  date: Scalars['DateTime'];
  result: Scalars['Int'];
  ip?: Maybe<Scalars['String']>;
  userDeviceId?: Maybe<Scalars['String']>;
};

export type UserShort = {
  __typename?: 'UserShort';
  email: Scalars['String'];
  name: Scalars['String'];
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
};

export type SettingsResult = {
  __typename?: 'SettingsResult';
  settings?: Maybe<CommonSettings>;
};

export type CommonSettings = {
  __typename?: 'CommonSettings';
  maxFileSize?: Maybe<Scalars['Int']>;
  maxFiles?: Maybe<Scalars['Int']>;
};

export type TransferListResult = {
  __typename?: 'TransferListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<TransferOrder>>;
};
