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
  Byte: any;
  DateTime: any;
  Void: any;
};





export enum AccountStatus {
  Live = 'Live',
  Suspended = 'Suspended',
  Banned = 'Banned',
  Closed = 'Closed'
}

export enum AdminTransactionStatus {
  New = 'New',
  Pending = 'Pending',
  Paid = 'Paid',
  Exchanging = 'Exchanging',
  Confirming = 'Confirming',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
  Canceled = 'Canceled',
  Chargeback = 'Chargeback',
  PaymentDeclined = 'PaymentDeclined',
  AddressDeclined = 'AddressDeclined',
  ExchangeDeclined = 'ExchangeDeclined',
  TransferDeclined = 'TransferDeclined',
  BenchmarkTransferDeclined = 'BenchmarkTransferDeclined',
  KycDeclined = 'KycDeclined'
}

export type ApiKey = {
  __typename?: 'ApiKey';
  apiKeyId: Scalars['ID'];
  userId: Scalars['String'];
  user?: Maybe<User>;
  created: Scalars['DateTime'];
  disabled?: Maybe<Scalars['DateTime']>;
};

export type ApiKeyListResult = {
  __typename?: 'ApiKeyListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<ApiKey>>;
};

export type ApiKeySecret = {
  __typename?: 'ApiKeySecret';
  apiKeyId: Scalars['ID'];
  userId: Scalars['String'];
  user?: Maybe<User>;
  secret: Scalars['String'];
  created: Scalars['DateTime'];
  disabled?: Maybe<Scalars['DateTime']>;
};

export type AppropriateRecord = {
  __typename?: 'AppropriateRecord';
  appropriateId?: Maybe<Scalars['ID']>;
  appropriateType?: Maybe<AppropriateType>;
  userId?: Maybe<Scalars['String']>;
  requestParams?: Maybe<Scalars['String']>;
  appropriateObjectId?: Maybe<Scalars['String']>;
  appropriateDetails?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
};

export type AppropriateRecordListResult = {
  __typename?: 'AppropriateRecordListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<AppropriateRecord>>;
};

export enum AppropriateType {
  FeeScheme = 'feeScheme',
  CostScheme = 'costScheme',
  KycScheme = 'kycScheme',
  KycTier = 'kycTier',
  PaymentProvider = 'paymentProvider'
}

export type AssetAddress = {
  __typename?: 'AssetAddress';
  address?: Maybe<Scalars['String']>;
  legacyAddress?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  addressFormat?: Maybe<Scalars['String']>;
  assetId?: Maybe<Scalars['String']>;
  originalId?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Float']>;
  totalEur?: Maybe<Scalars['Float']>;
  totalFiat?: Maybe<Scalars['Float']>;
  available?: Maybe<Scalars['Float']>;
  availableEur?: Maybe<Scalars['Float']>;
  availableFiat?: Maybe<Scalars['Float']>;
  pending?: Maybe<Scalars['Float']>;
  lockedAmount?: Maybe<Scalars['Float']>;
  vaultId?: Maybe<Scalars['String']>;
  vaultName?: Maybe<Scalars['String']>;
  vaultOriginalId?: Maybe<Scalars['String']>;
  custodyProviderLink?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['String']>;
  userEmail?: Maybe<Scalars['String']>;
};

export type AssetAddressListResult = {
  __typename?: 'AssetAddressListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<AssetAddress>>;
};

export type AssetAddressShort = {
  __typename?: 'AssetAddressShort';
  address?: Maybe<Scalars['String']>;
  legacyAddress?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  addressFormat?: Maybe<Scalars['String']>;
  assetId?: Maybe<Scalars['String']>;
  originalId?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Float']>;
  totalEur?: Maybe<Scalars['Float']>;
  totalFiat?: Maybe<Scalars['Float']>;
  available?: Maybe<Scalars['Float']>;
  availableEur?: Maybe<Scalars['Float']>;
  availableFiat?: Maybe<Scalars['Float']>;
  pending?: Maybe<Scalars['Float']>;
  lockedAmount?: Maybe<Scalars['Float']>;
  vaultId?: Maybe<Scalars['String']>;
  vaultName?: Maybe<Scalars['String']>;
  vaultOriginalId?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
};

export type AssetAddressShortListResult = {
  __typename?: 'AssetAddressShortListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<AssetAddressShort>>;
};

export type BalancePerAsset = {
  __typename?: 'BalancePerAsset';
  assetId: Scalars['String'];
  totalBalance: Scalars['Float'];
  totalBalanceEur: Scalars['Float'];
  availableBalance: Scalars['Float'];
  availableBalanceEur: Scalars['Float'];
  totalBalanceFiat: Scalars['Float'];
  availableBalanceFiat: Scalars['Float'];
};

export type BalanceStats = {
  __typename?: 'BalanceStats';
  currency?: Maybe<Scalars['String']>;
  volume?: Maybe<TransactionStatsVolume>;
};

export type BaseStat = {
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
};

export enum BitcoinAddressFormats {
  Legacy = 'LEGACY',
  Segwit = 'SEGWIT'
}

export type BlackCountry = {
  __typename?: 'BlackCountry';
  countryCode2: Scalars['ID'];
  created: Scalars['DateTime'];
};

export type BlackCountryListResult = {
  __typename?: 'BlackCountryListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<BlackCountry>>;
};

export type BuyOrSellStats = BaseStat & {
  __typename?: 'BuyOrSellStats';
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  fee?: Maybe<TransactionStatsVolume>;
  byInstruments?: Maybe<Array<InstrumentStats>>;
};


export enum CountryCodeType {
  Code2 = 'code2',
  Code3 = 'code3'
}

export type CryptoInvoice = {
  __typename?: 'CryptoInvoice';
  cryptoInvoiceId?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  destination?: Maybe<Scalars['String']>;
  vaultId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['String']>;
  widgetId?: Maybe<Scalars['String']>;
  currencyToSend?: Maybe<Scalars['String']>;
  amountToSend?: Maybe<Scalars['Float']>;
  currencyToReceive?: Maybe<Scalars['String']>;
  amountToReceive?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  widgetUserParamsId?: Maybe<Scalars['String']>;
};

export type CryptoInvoiceCreationResult = {
  __typename?: 'CryptoInvoiceCreationResult';
  invoice?: Maybe<CryptoInvoice>;
  rate?: Maybe<Scalars['Float']>;
  convertedAmount?: Maybe<Scalars['Float']>;
  convertedCurrency?: Maybe<Scalars['String']>;
};

export type CryptoInvoiceListResult = {
  __typename?: 'CryptoInvoiceListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<CryptoInvoice>>;
};

export enum CustodyProvider {
  Fireblocks = 'Fireblocks'
}

export type DashboardStats = {
  __typename?: 'DashboardStats';
  buys?: Maybe<BuyOrSellStats>;
  sells?: Maybe<BuyOrSellStats>;
  deposits?: Maybe<DepositOrWithdrawalStats>;
  withdrawals?: Maybe<DepositOrWithdrawalStats>;
  transfers?: Maybe<TransferStats>;
  receives?: Maybe<TransferStats>;
  exchanges?: Maybe<ExchangeStats>;
  balances?: Maybe<Array<BalanceStats>>;
  openpaydBalances?: Maybe<Array<OpenpaydProviderBalance>>;
  liquidityProviderBalances?: Maybe<Array<Maybe<LiquidityProviderBalance>>>;
};

export type DateMap = {
  __typename?: 'DateMap';
  date: Scalars['DateTime'];
  value?: Maybe<Scalars['String']>;
};


export type DateTimeInterval = {
  from?: Maybe<Scalars['DateTime']>;
  to?: Maybe<Scalars['DateTime']>;
};

export type DeletedVaultAccount = {
  __typename?: 'DeletedVaultAccount';
  deletedVaultAccountId?: Maybe<Scalars['ID']>;
  userId: Scalars['String'];
  vaultAccountId: Scalars['String'];
  deleted?: Maybe<Scalars['DateTime']>;
  custodyProvider: Scalars['String'];
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

export type DepositOrWithdrawalStats = BaseStat & {
  __typename?: 'DepositOrWithdrawalStats';
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  fee?: Maybe<TransactionStatsVolume>;
  byInstruments?: Maybe<Array<InstrumentStats>>;
};

export enum EntityType {
  User = 'User',
  Transaction = 'Transaction'
}

export type Error = {
  __typename?: 'Error';
  errorId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
};

export type ExchangeStats = BaseStat & {
  __typename?: 'ExchangeStats';
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  toMerchant?: Maybe<MerchantOrCustomerStats>;
  toCustomer?: Maybe<MerchantOrCustomerStats>;
  fee?: Maybe<TransactionStatsVolume>;
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

export type ExternalWalletAssetShort = {
  __typename?: 'ExternalWalletAssetShort';
  status?: Maybe<WalletAssetStatus>;
  address?: Maybe<Scalars['String']>;
};

export type Feedback = {
  __typename?: 'Feedback';
  feedbackId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
};

export type FeedbackInput = {
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type FeedbackListResult = {
  __typename?: 'FeedbackListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Feedback>>;
};

export type FiatVault = {
  __typename?: 'FiatVault';
  fiatVaultId?: Maybe<Scalars['ID']>;
  userId?: Maybe<Scalars['String']>;
  balance?: Maybe<Scalars['Float']>;
  created?: Maybe<Scalars['DateTime']>;
  currency?: Maybe<Scalars['String']>;
  generalBalance?: Maybe<Scalars['Float']>;
};

export type FiatVaultListResult = {
  __typename?: 'FiatVaultListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<FiatVault>>;
};

export type FiatVaultUser = {
  __typename?: 'FiatVaultUser';
  vault?: Maybe<FiatVault>;
  user?: Maybe<User>;
};

export type FiatVaultUserListResult = {
  __typename?: 'FiatVaultUserListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<FiatVaultUser>>;
};

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

export enum FileType {
  UserAvatar = 'USER_AVATAR',
  KycDocument = 'KYC_DOCUMENT',
  LandingPageImage = 'LANDING_PAGE_IMAGE',
  WidgetPageImage = 'WIDGET_PAGE_IMAGE',
  SupportTicket = 'SUPPORT_TICKET',
  Other = 'OTHER'
}

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

export type FlashfxObject = {
  __typename?: 'FlashfxObject';
  currency?: Maybe<Scalars['String']>;
  bsb?: Maybe<Scalars['String']>;
  beneficiaryAddress?: Maybe<Scalars['String']>;
  beneficiaryName?: Maybe<Scalars['String']>;
  accountNumber?: Maybe<Scalars['String']>;
};

export enum Gender {
  O = 'O',
  M = 'M',
  F = 'F'
}

export type GetRates = {
  __typename?: 'GetRates';
  currenciesFrom?: Maybe<Array<Maybe<Scalars['String']>>>;
  currencyTo?: Maybe<Scalars['String']>;
  withFactor?: Maybe<Scalars['Boolean']>;
};

export type InstrumentStats = BaseStat & {
  __typename?: 'InstrumentStats';
  instrument?: Maybe<PaymentInstrument>;
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  fee?: Maybe<TransactionStatsVolume>;
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

export type KycDocumentSubSubType = {
  __typename?: 'KycDocumentSubSubType';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  options?: Maybe<Array<Scalars['String']>>;
};

export type KycDocumentSubType = {
  __typename?: 'KycDocumentSubType';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  subTypes?: Maybe<Array<KycDocumentSubSubType>>;
  options?: Maybe<Array<Scalars['String']>>;
};

export type KycDocumentType = {
  __typename?: 'KycDocumentType';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  subTypes?: Maybe<Array<KycDocumentSubType>>;
  options?: Maybe<Array<Scalars['String']>>;
};

export type KycInfo = {
  __typename?: 'KycInfo';
  applicant?: Maybe<KycApplicant>;
  levelName?: Maybe<Scalars['String']>;
  appliedDocuments?: Maybe<Array<KycAppliedDocument>>;
  requiredInfo?: Maybe<KycRequiredInfo>;
};

export type KycInfoField = {
  __typename?: 'KycInfoField';
  name?: Maybe<Scalars['String']>;
  required?: Maybe<Scalars['Boolean']>;
};

export enum KycProvider {
  Local = 'Local',
  SumSub = 'SumSub',
  Shufti = 'Shufti'
}

export type KycRejectedLabel = {
  __typename?: 'KycRejectedLabel';
  code?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type KycRequiredInfo = {
  __typename?: 'KycRequiredInfo';
  documents?: Maybe<Array<KycDocumentType>>;
  fields?: Maybe<Array<KycInfoField>>;
};

export enum KycServiceNotificationType {
  KycStatusChanged = 'KycStatusChanged',
  KycCompleted = 'KycCompleted'
}

export enum KycStatus {
  Unknown = 'unknown',
  NotFound = 'notFound',
  Init = 'init',
  Pending = 'pending',
  Queued = 'queued',
  Completed = 'completed',
  OnHold = 'onHold',
  Canceled = 'canceled',
  Timeout = 'timeout',
  Invalid = 'invalid',
  Deleted = 'deleted',
  Waiting = 'waiting'
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
  statusReason?: Maybe<Scalars['String']>;
  originalOrderId?: Maybe<Scalars['String']>;
  providerSpecificStates?: Maybe<Array<DateMap>>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
};

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

export enum LiquidityOrderType {
  Limit = 'Limit',
  Market = 'Market',
  Instant = 'Instant'
}

export enum LiquidityProvider {
  Bitstamp = 'Bitstamp',
  Binance = 'Binance',
  Kraken = 'Kraken',
  GetCoins = 'GetCoins'
}

export type LoginResult = {
  __typename?: 'LoginResult';
  authToken?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  authTokenAction?: Maybe<Scalars['String']>;
  authTokenActionParam?: Maybe<Scalars['String']>;
};

export type MerchantOrCustomerStats = BaseStat & {
  __typename?: 'MerchantOrCustomerStats';
  instrument?: Maybe<PaymentInstrument>;
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  fee?: Maybe<TransactionStatsVolume>;
};

export type Mutation = {
  __typename?: 'Mutation';
  foo: Scalars['String'];
  createMyApiKey?: Maybe<ApiKeySecret>;
  deleteMyApiKey?: Maybe<ApiKey>;
  createUserApiKey?: Maybe<ApiKeySecret>;
  deleteUserApiKey?: Maybe<ApiKey>;
  sendAdminNotification?: Maybe<Array<UserNotification>>;
  resendNotification?: Maybe<UserNotification>;
  makeNotificationsViewed?: Maybe<Array<UserNotification>>;
  deleteMyNotifications?: Maybe<Array<UserNotification>>;
  deleteUserNotifications?: Maybe<Array<UserNotification>>;
  preauthFull: PaymentPreauthResult;
  preauth: PaymentPreauthResultShort;
  captureFull: PaymentOrder;
  status: Scalars['String'];
  updateSettingsCommon: SettingsCommon;
  addSettingsFee: SettingsFee;
  updateSettingsFee: SettingsFee;
  deleteSettingsFee: SettingsFee;
  companyLevelVerification?: Maybe<User>;
  addSettingsCost: SettingsCost;
  updateSettingsCost: SettingsCost;
  deleteSettingsCost: SettingsCost;
  addSettingsKycLevel: SettingsKycLevel;
  updateSettingsKycLevel: SettingsKycLevel;
  deleteSettingsKycLevel: SettingsKycLevel;
  addSettingsKyc: SettingsKyc;
  updateSettingsKyc: SettingsKyc;
  deleteSettingsKyc: SettingsKyc;
  addSettingsKycTier: Scalars['Boolean'];
  updateSettingsKycTier: Scalars['Boolean'];
  deleteSettingsKycTier: SettingsKycTier;
  addWireTransferBankAccount: WireTransferBankAccount;
  updateWireTransferBankAccount: WireTransferBankAccount;
  deleteWireTransferBankAccount: WireTransferBankAccount;
  createUser?: Maybe<User>;
  updateMe?: Maybe<User>;
  updateUser?: Maybe<User>;
  /** This endpoint can be used to add a current user's wallet. */
  addMyVault?: Maybe<VaultAccount>;
  /** This endpoint can be used to update the current user's wallet. */
  updateMyVault?: Maybe<VaultAccount>;
  /** This endpoint can be used to delete the current user's wallet. */
  deleteMyVault?: Maybe<UserVaultIdObj>;
  /** This endpoint can be used to add a user's wallet. */
  addUserVault?: Maybe<VaultAccount>;
  /** This endpoint can be used to update the user's wallet. */
  updateUserVault?: Maybe<VaultAccount>;
  /** This endpoint can be used to delete the user's wallet. */
  deleteUserVault?: Maybe<UserVaultIdObj>;
  assignRole?: Maybe<User>;
  removeRole?: Maybe<User>;
  deleteUser?: Maybe<User>;
  restoreUser?: Maybe<User>;
  addMyContact?: Maybe<User>;
  updateMyContact?: Maybe<User>;
  deleteMyContact?: Maybe<User>;
  addMyBankAccount?: Maybe<User>;
  updateMyBankAccount?: Maybe<User>;
  deleteMyBankAccount?: Maybe<User>;
  changeMyKycTier?: Maybe<User>;
  addBankAccount?: Maybe<User>;
  updateBankAccount?: Maybe<User>;
  deleteBankAccount?: Maybe<User>;
  changeUserKycTier?: Maybe<User>;
  exportUsersToCsv?: Maybe<Scalars['Boolean']>;
  signup: LoginResult;
  login: LoginResult;
  logout: Scalars['Boolean'];
  refreshToken: Scalars['String'];
  confirmEmail: Scalars['Boolean'];
  confirmUserEmail: Scalars['Boolean'];
  confirmDevice: Scalars['Boolean'];
  confirmUserDevice: Scalars['Boolean'];
  setMyInfo: LoginResult;
  setUserInfo: LoginResult;
  generateDefaultTokenWhenKycSent: LoginResult;
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
  sendTestTransactionServiceNotification?: Maybe<Scalars['Void']>;
  sendTestKycServiceNotification?: Maybe<Scalars['Void']>;
  /** This endpoint can be used to create a transaction */
  createTransaction?: Maybe<TransactionShort>;
  /** This endpoint can be used to create a merchant transaction */
  createMerchantTransaction?: Maybe<TransactionShort>;
  sendInvoice?: Maybe<Scalars['Boolean']>;
  /** This endpoint can be used to execute a transaction */
  executeTransaction?: Maybe<TransactionShort>;
  /** This endpoint can be used to update a transaction */
  updateTransaction?: Maybe<Transaction>;
  /** This endpoint can be used to abandon a transaction */
  abandonTransaction?: Maybe<TransactionShort>;
  /** This endpoint can be used to abandon a crypto invoice */
  abandonCryptoInvoice?: Maybe<CryptoInvoice>;
  exportTransactionsToCsv?: Maybe<Scalars['Boolean']>;
  /** This endpoint can be used to cancel a transaction for the current user */
  cancelMyTransaction?: Maybe<TransactionShort>;
  /** This endpoint can be used to cancel a transaction */
  cancelTransaction?: Maybe<Transaction>;
  /** Unbenchmarking Transactions */
  unbenchmarkTransactions?: Maybe<Array<Transaction>>;
  repeatDeclinedTransactions?: Maybe<Array<Transaction>>;
  /** This endpoint can be used to create a widget for the current user. */
  createMyWidget?: Maybe<Widget>;
  /** This endpoint can be used to create a widget. */
  createWidget?: Maybe<Widget>;
  /** This endpoint can be used to update a widget for the current user. */
  updateMyWidget?: Maybe<Widget>;
  /** This endpoint can be used to update a widget. */
  updateWidget?: Maybe<Widget>;
  /** This endpoint can be used to delete a widget for the current user. */
  deleteMyWidget?: Maybe<Widget>;
  /** This endpoint can be used to delete a widget. */
  deleteWidget?: Maybe<Widget>;
  /** This endpoint can be used to add user params. */
  addMyWidgetUserParams?: Maybe<WidgetUserParams>;
  exportWidgetsToCsv?: Maybe<Scalars['Boolean']>;
  updateRiskAlertType?: Maybe<RiskAlertType>;
  addBlackCountry?: Maybe<BlackCountry>;
  deleteBlackCountry?: Maybe<BlackCountry>;
  /** This endpoint can be used to create a transaction */
  createInvoice?: Maybe<CryptoInvoiceCreationResult>;
  /** This endpoint to recalculate the invoice (with current rate) */
  calculateInvoice?: Maybe<CryptoInvoiceCreationResult>;
  /** Not used */
  addFiatVault?: Maybe<FiatVault>;
  deleteFiatVault?: Maybe<FiatVault>;
  deleteDevice?: Maybe<UserDeviceListResult>;
  deleteMyDevice?: Maybe<UserDeviceListResult>;
  sendFakeLiquidityProviderTransactionChangedCallback?: Maybe<Scalars['Boolean']>;
};


export type MutationDeleteMyApiKeyArgs = {
  apiKeyId?: Maybe<Scalars['String']>;
};


export type MutationCreateUserApiKeyArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type MutationDeleteUserApiKeyArgs = {
  apiKeyId?: Maybe<Scalars['String']>;
};


export type MutationSendAdminNotificationArgs = {
  notifiedUserIds?: Maybe<Array<Scalars['String']>>;
  title?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  level?: Maybe<UserNotificationLevel>;
};


export type MutationResendNotificationArgs = {
  notificationId?: Maybe<Scalars['String']>;
};


export type MutationMakeNotificationsViewedArgs = {
  notificationIds?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteMyNotificationsArgs = {
  notificationIds?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteUserNotificationsArgs = {
  notificationIds?: Maybe<Array<Scalars['ID']>>;
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


export type MutationCompanyLevelVerificationArgs = {
  newLevel?: Maybe<Scalars['String']>;
  companyName?: Maybe<Scalars['String']>;
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


export type MutationAddSettingsKycTierArgs = {
  settings: SettingsKycTierInput;
};


export type MutationUpdateSettingsKycTierArgs = {
  settingsId: Scalars['ID'];
  settings: SettingsKycTierInput;
};


export type MutationDeleteSettingsKycTierArgs = {
  settingsId: Scalars['ID'];
};


export type MutationAddWireTransferBankAccountArgs = {
  bankAccount: WireTransferBankAccountInput;
};


export type MutationUpdateWireTransferBankAccountArgs = {
  bankAccountId: Scalars['ID'];
  bankAccount: WireTransferBankAccountInput;
};


export type MutationDeleteWireTransferBankAccountArgs = {
  bankAccountId: Scalars['ID'];
};


export type MutationCreateUserArgs = {
  user: UserInput;
  roles?: Maybe<Array<Scalars['String']>>;
};


export type MutationUpdateMeArgs = {
  user?: Maybe<UserInput>;
};


export type MutationUpdateUserArgs = {
  userId: Scalars['ID'];
  user?: Maybe<UserInput>;
};


export type MutationAddMyVaultArgs = {
  vaultName?: Maybe<Scalars['String']>;
  assetId: Scalars['String'];
  originalId?: Maybe<Scalars['String']>;
};


export type MutationUpdateMyVaultArgs = {
  vaultId?: Maybe<Scalars['String']>;
  vaultName: Scalars['String'];
};


export type MutationDeleteMyVaultArgs = {
  vaultId?: Maybe<Scalars['String']>;
};


export type MutationAddUserVaultArgs = {
  userId: Scalars['ID'];
  vaultName: Scalars['String'];
  assetId: Scalars['String'];
  originalId?: Maybe<Scalars['String']>;
};


export type MutationUpdateUserVaultArgs = {
  userId: Scalars['ID'];
  vaultId?: Maybe<Scalars['String']>;
  vaultName: Scalars['String'];
};


export type MutationDeleteUserVaultArgs = {
  userId: Scalars['ID'];
  vaultId?: Maybe<Scalars['String']>;
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


export type MutationRestoreUserArgs = {
  userId: Scalars['ID'];
};


export type MutationAddMyContactArgs = {
  contact?: Maybe<UserContactInput>;
};


export type MutationUpdateMyContactArgs = {
  contactId: Scalars['String'];
  contact?: Maybe<UserContactInput>;
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


export type MutationChangeMyKycTierArgs = {
  userTierId: Scalars['String'];
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


export type MutationChangeUserKycTierArgs = {
  userId?: Maybe<Scalars['String']>;
  userTierId: Scalars['String'];
};


export type MutationExportUsersToCsvArgs = {
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  roleIdsOnly?: Maybe<Array<Scalars['String']>>;
  accountTypesOnly?: Maybe<Array<UserType>>;
  accountModesOnly?: Maybe<Array<UserMode>>;
  accountStatusesOnly?: Maybe<Array<AccountStatus>>;
  userTierLevelsOnly?: Maybe<Array<Scalars['String']>>;
  riskLevelsOnly?: Maybe<Array<RiskLevel>>;
  countriesOnly?: Maybe<Array<Scalars['String']>>;
  countryCodeType?: Maybe<CountryCodeType>;
  kycStatusesOnly?: Maybe<Array<KycStatus>>;
  registrationDateInterval?: Maybe<DateTimeInterval>;
  widgetIdsOnly?: Maybe<Array<Scalars['String']>>;
  totalBuyVolumeOver?: Maybe<Scalars['Int']>;
  transactionCountOver?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
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
  pep: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  oAuthProvider?: Maybe<OAuthProvider>;
  oAuthToken?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
  widgetId?: Maybe<Scalars['String']>;
};


export type MutationConfirmEmailArgs = {
  token?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['Int']>;
  email?: Maybe<Scalars['String']>;
  recaptcha: Scalars['String'];
};


export type MutationConfirmUserEmailArgs = {
  user_id: Scalars['String'];
};


export type MutationConfirmDeviceArgs = {
  token: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type MutationConfirmUserDeviceArgs = {
  device_id: Scalars['String'];
};


export type MutationSetMyInfoArgs = {
  firstName?: Maybe<Scalars['String']>;
  companyName?: Maybe<Scalars['String']>;
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


export type MutationGenerateDefaultTokenWhenKycSentArgs = {
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
  recaptcha?: Maybe<Scalars['String']>;
  feedback: FeedbackInput;
};


export type MutationSendTestTransactionServiceNotificationArgs = {
  type?: Maybe<TransactionServiceNotificationType>;
};


export type MutationSendTestKycServiceNotificationArgs = {
  type?: Maybe<KycServiceNotificationType>;
};


export type MutationCreateTransactionArgs = {
  transaction?: Maybe<TransactionInput>;
};


export type MutationCreateMerchantTransactionArgs = {
  transaction?: Maybe<TransactionMerchantInput>;
  params?: Maybe<Scalars['String']>;
};


export type MutationSendInvoiceArgs = {
  transactionId?: Maybe<Scalars['String']>;
};


export type MutationExecuteTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['Int']>;
};


export type MutationUpdateTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
  transaction?: Maybe<TransactionUpdateInput>;
  recalculate?: Maybe<Scalars['Boolean']>;
};


export type MutationAbandonTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
};


export type MutationAbandonCryptoInvoiceArgs = {
  cryptoInvoiceId?: Maybe<Scalars['String']>;
};


export type MutationExportTransactionsToCsvArgs = {
  transactionIdsOnly?: Maybe<Array<Scalars['String']>>;
  transactionStatusesOnly?: Maybe<Array<Scalars['String']>>;
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  widgetIdsOnly?: Maybe<Array<Scalars['String']>>;
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  countriesOnly?: Maybe<Array<Scalars['String']>>;
  countryCodeType?: Maybe<CountryCodeType>;
  accountTypesOnly?: Maybe<Array<UserType>>;
  transactionDateOnly?: Maybe<Scalars['DateTime']>;
  transactionTypesOnly?: Maybe<Array<TransactionType>>;
  sendersOrReceiversOnly?: Maybe<Array<Scalars['String']>>;
  paymentProvidersOnly?: Maybe<Array<Scalars['String']>>;
  accountStatusesOnly?: Maybe<Array<Scalars['String']>>;
  userTierLevelsOnly?: Maybe<Array<Scalars['String']>>;
  riskLevelsOnly?: Maybe<Array<Scalars['String']>>;
  paymentInstrumentsOnly?: Maybe<Array<PaymentInstrument>>;
  createdDateInterval?: Maybe<DateTimeInterval>;
  completedDateInterval?: Maybe<DateTimeInterval>;
  walletAddressOnly?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type MutationCancelMyTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
};


export type MutationCancelTransactionArgs = {
  transactionId?: Maybe<Scalars['String']>;
};


export type MutationUnbenchmarkTransactionsArgs = {
  transactionIds?: Maybe<Array<Scalars['String']>>;
};


export type MutationRepeatDeclinedTransactionsArgs = {
  transactionIds?: Maybe<Array<Scalars['String']>>;
};


export type MutationCreateMyWidgetArgs = {
  widget?: Maybe<WidgetInput>;
};


export type MutationCreateWidgetArgs = {
  userId?: Maybe<Scalars['String']>;
  widget?: Maybe<WidgetInput>;
};


export type MutationUpdateMyWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
  widget?: Maybe<WidgetUpdateInput>;
};


export type MutationUpdateWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
  widget?: Maybe<WidgetUpdateInput>;
};


export type MutationDeleteMyWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
};


export type MutationDeleteWidgetArgs = {
  widgetId?: Maybe<Scalars['String']>;
};


export type MutationAddMyWidgetUserParamsArgs = {
  widgetUserParams?: Maybe<WidgetUserParamsInput>;
};


export type MutationExportWidgetsToCsvArgs = {
  widgetIdsOnly?: Maybe<Array<Scalars['String']>>;
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type MutationUpdateRiskAlertTypeArgs = {
  riskAlertTypeId?: Maybe<Scalars['String']>;
  riskAlertTypeInput?: Maybe<RiskAlertTypeInput>;
};


export type MutationAddBlackCountryArgs = {
  countryCode2: Scalars['String'];
};


export type MutationDeleteBlackCountryArgs = {
  countryCode2: Scalars['String'];
};


export type MutationCreateInvoiceArgs = {
  widgetId?: Maybe<Scalars['String']>;
  currencyToSend?: Maybe<Scalars['String']>;
  amountToSend?: Maybe<Scalars['Float']>;
};


export type MutationCalculateInvoiceArgs = {
  invoiceId?: Maybe<Scalars['String']>;
};


export type MutationAddFiatVaultArgs = {
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
};


export type MutationDeleteFiatVaultArgs = {
  fiatVaultId?: Maybe<Scalars['String']>;
};


export type MutationDeleteDeviceArgs = {
  deviceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type MutationDeleteMyDeviceArgs = {
  deviceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type NewAddress = {
  __typename?: 'NewAddress';
  address: Scalars['String'];
  tag?: Maybe<Scalars['String']>;
  legacyAddress?: Maybe<Scalars['String']>;
};

export enum OAuthProvider {
  Google = 'google',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Microsoft = 'microsoft'
}

export type Openpayd = {
  __typename?: 'Openpayd';
  paymentProviderId?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  currencies?: Maybe<Array<Scalars['String']>>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<Scalars['String']>>;
  default?: Maybe<Scalars['Boolean']>;
  disabled?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
};

export type OpenpaydObject = {
  __typename?: 'OpenpaydObject';
  currency?: Maybe<Scalars['String']>;
  bankAddress?: Maybe<Scalars['String']>;
  bankName?: Maybe<Scalars['String']>;
  iban?: Maybe<Scalars['String']>;
  beneficiaryAddress?: Maybe<Scalars['String']>;
  beneficiaryName?: Maybe<Scalars['String']>;
  swiftBic?: Maybe<Scalars['String']>;
  payInReference?: Maybe<Scalars['String']>;
  bankAccountHolderName?: Maybe<Scalars['String']>;
  accountNumber?: Maybe<Scalars['String']>;
  sortCode?: Maybe<Scalars['String']>;
};

export type OpenpaydProviderBalance = {
  __typename?: 'OpenpaydProviderBalance';
  currency?: Maybe<Scalars['String']>;
  balance?: Maybe<Scalars['Float']>;
};

export type OrderBy = {
  orderBy: Scalars['String'];
  desc: Scalars['Boolean'];
};

export type PaymentCaptureInput = {
  orderId: Scalars['String'];
  instrument: PaymentInstrument;
  provider: Scalars['String'];
};

export type PaymentCard = {
  number?: Maybe<Scalars['String']>;
  expireMonth?: Maybe<Scalars['Int']>;
  expireYear?: Maybe<Scalars['Int']>;
  cvv2?: Maybe<Scalars['Int']>;
  holder?: Maybe<Scalars['String']>;
};

export enum PaymentInstrument {
  CreditCard = 'CreditCard',
  WireTransfer = 'WireTransfer',
  Apm = 'APM',
  FiatVault = 'FiatVault',
  CryptoVault = 'CryptoVault'
}

export type PaymentOperation = {
  __typename?: 'PaymentOperation';
  operationId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  orderId?: Maybe<Scalars['String']>;
  originalOrderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  type: PaymentOperationType;
  sn?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  statusReason?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
  callbackDetails?: Maybe<Scalars['String']>;
  errorCode?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  providerSpecificStates?: Maybe<Array<DateMap>>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
};

export type PaymentOperationShort = {
  __typename?: 'PaymentOperationShort';
  operationId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  type: PaymentOperationType;
  status?: Maybe<Scalars['String']>;
  statusReason?: Maybe<Scalars['String']>;
  errorCode?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
};

export enum PaymentOperationType {
  Preauth = 'preauth',
  Capture = 'capture',
  Refund = 'refund'
}

export type PaymentOrder = {
  __typename?: 'PaymentOrder';
  orderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  created?: Maybe<Scalars['DateTime']>;
  amount: Scalars['Float'];
  currency: Scalars['String'];
  operations?: Maybe<Array<PaymentOperation>>;
  status?: Maybe<Scalars['String']>;
  statusReason?: Maybe<Scalars['String']>;
  originalOrderId?: Maybe<Scalars['String']>;
  preauthOperationSn?: Maybe<Scalars['String']>;
  captureOperationSn?: Maybe<Scalars['String']>;
  refundOperationSn?: Maybe<Scalars['String']>;
  paymentInfo?: Maybe<Scalars['String']>;
  paymentBankName?: Maybe<Scalars['String']>;
  paymentCardHolderName?: Maybe<Scalars['String']>;
  paymentCardType?: Maybe<Scalars['String']>;
  paymentCardLastFourDigits?: Maybe<Scalars['String']>;
  paymentProcessorName?: Maybe<Scalars['String']>;
  paymentBin?: Maybe<Scalars['String']>;
  providerSpecificStates?: Maybe<Array<DateMap>>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
  preauth?: Maybe<Scalars['Boolean']>;
};

export type PaymentOrderShort = {
  __typename?: 'PaymentOrderShort';
  orderId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  transactionId?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  created?: Maybe<Scalars['DateTime']>;
  amount: Scalars['Float'];
  currency: Scalars['String'];
  status?: Maybe<Scalars['String']>;
  statusReason?: Maybe<Scalars['String']>;
  operations?: Maybe<Array<PaymentOperationShort>>;
  paymentInfo?: Maybe<Scalars['String']>;
  paymentBankName?: Maybe<Scalars['String']>;
  paymentCardHolderName?: Maybe<Scalars['String']>;
  paymentCardType?: Maybe<Scalars['String']>;
  paymentCardLastFourDigits?: Maybe<Scalars['String']>;
  paymentProcessorName?: Maybe<Scalars['String']>;
  paymentBin?: Maybe<Scalars['String']>;
};

export type PaymentPreauthInput = {
  transactionId: Scalars['String'];
  instrument: PaymentInstrument;
  provider: Scalars['String'];
  card?: Maybe<PaymentCard>;
};

export type PaymentPreauthResult = {
  __typename?: 'PaymentPreauthResult';
  order?: Maybe<PaymentOrder>;
  html?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
};

export type PaymentPreauthResultShort = {
  __typename?: 'PaymentPreauthResultShort';
  order?: Maybe<PaymentOrderShort>;
  html?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
};

export type PaymentProvider = {
  __typename?: 'PaymentProvider';
  paymentProviderId?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  currencies?: Maybe<Array<Scalars['String']>>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<Scalars['String']>>;
  default?: Maybe<Scalars['Boolean']>;
  disabled?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
};

export type PaymentProviderByInstrument = {
  __typename?: 'PaymentProviderByInstrument';
  id?: Maybe<Scalars['ID']>;
  instrument?: Maybe<PaymentInstrument>;
  provider?: Maybe<PaymentProvider>;
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

export type Query = {
  __typename?: 'Query';
  serverTime: Scalars['String'];
  /** Get API keys for current user */
  myApiKeys?: Maybe<ApiKeyListResult>;
  /** Get API keys */
  getApiKeys?: Maybe<ApiKeyListResult>;
  /** Get notifications for current user */
  myNotifications?: Maybe<UserNotificationListResult>;
  /** Get user notifications */
  getNotificationsByUser?: Maybe<UserNotificationListResult>;
  /** Get notifications */
  getNotifications?: Maybe<UserNotificationListResult>;
  /** Get common settings */
  getSettingsCommon?: Maybe<SettingsCommon>;
  /** Get common settings */
  getTextPages?: Maybe<Array<Maybe<TextPage>>>;
  /** Get payment providers */
  getPaymentProviders?: Maybe<Array<PaymentProvider>>;
  /** Get payment providers for relevant options */
  getAppropriatePaymentProviders?: Maybe<Array<PaymentProviderByInstrument>>;
  /** Get currency settings */
  getSettingsCurrency?: Maybe<SettingsCurrencyWithDefaults>;
  getSettingsKycLevels?: Maybe<SettingsKycLevelListResult>;
  /** Get KYC settings */
  getSettingsKyc?: Maybe<SettingsKycListResult>;
  /** Get KYC settings for the current user(SettingsKycTierShort) */
  mySettingsKyc?: Maybe<SettingsKycShort>;
  /** Get KYC settings for the current user */
  mySettingsKycFull?: Maybe<SettingsKyc>;
  /** Get KYC settings for relevant options */
  getAppropriateSettingsKyc?: Maybe<SettingsKyc>;
  /** Get KYC levels settings */
  getSettingsKycTiers?: Maybe<SettingsKycTierListResult>;
  /** Get KYC levels settings for the current user(SettingsKycTierShort) */
  mySettingsKycTier?: Maybe<SettingsKycTierShort>;
  /** Get KYC levels settings for the current user */
  mySettingsKycTiers?: Maybe<SettingsKycTierShortExListResult>;
  /** Get KYC levels settings for relevant options */
  getAppropriateSettingsKycTiers?: Maybe<SettingsKycTierShortExListResult>;
  /** Get fee settings */
  getSettingsFee?: Maybe<SettingsFeeListResult>;
  /** Get fee settings for the current user(SettingsFeeShort) */
  mySettingsFee?: Maybe<SettingsFeeShort>;
  /** Get fee settings for the current user */
  mySettingsFeeFull?: Maybe<SettingsFee>;
  /** Get fee settings for the relevant parameters */
  getAppropriateSettingsFee?: Maybe<SettingsFee>;
  /** Get cost settings */
  getSettingsCost?: Maybe<SettingsCostListResult>;
  /** Get cost settings for the current user */
  mySettingsCost?: Maybe<SettingsCostShort>;
  /** Get cost settings for the relevant parameters */
  getAppropriateSettingsCostFull?: Maybe<SettingsCost>;
  /** API token generation */
  getWireTransferBankAccounts?: Maybe<WireTransferBankAccountListResult>;
  /** API getVerificationLink for shuftiProvider */
  getVerificationLink?: Maybe<Scalars['String']>;
  /** API token generation */
  generateWebApiToken: Scalars['String'];
  me: User;
  /** Get state for the current user */
  myState: UserState;
  /** Get state for the selected user */
  getUserState: UserState;
  /** Transaction history for the current user */
  myProfit: UserProfit;
  /** Transaction history for the selected user */
  userProfit: UserProfit;
  myKycStatus: Scalars['String'];
  userKycInfo: KycInfo;
  /** User count */
  userCount?: Maybe<Scalars['Int']>;
  /** Get user by email */
  userById: User;
  /** Get user by name */
  userByName: User;
  /** Get user by email */
  userByEmail: User;
  /** Get user by OAuthAppId */
  userByOAuthAppId: User;
  /** Get user by referral code */
  userByReferralCode: User;
  /** Get users by parameters */
  getUsers: UserListResult;
  /** Get contacts for current user */
  myContacts: UserContactListResult;
  /** Get contacts for selected user */
  getUserContacts: UserContactListResult;
  /** Get bank accounts for current user */
  myBankAccounts: UserContactListResult;
  /** Get bank accounts for selected user */
  getUserBankAccounts: UserContactListResult;
  /** Get my actions with filters */
  myActions: UserActionListResult;
  /** Get user actions with filters */
  getUserActions: UserActionListResult;
  /** Get my balance history with filters */
  myBalanceHistory: UserBalanceHistoryRecordListResult;
  /** Get balance history with filters */
  getUserBalanceHistory: UserBalanceHistoryRecordListResult;
  /** Get KYC information for current user */
  myKycInfo?: Maybe<KycInfo>;
  /** Get KYC information for selected user */
  getUserKycInfo?: Maybe<KycInfo>;
  /** Get Roles */
  getRoles?: Maybe<Array<UserRole>>;
  /** Get support tickets for current user */
  mySupportTickets?: Maybe<SupportTicketListResult>;
  /** Get support tickets */
  getSupportTickets?: Maybe<SupportTicketListResult>;
  /** get feedbacks */
  getFeedbacks?: Maybe<FeedbackListResult>;
  /** Get the exchange rate of several currencies to one */
  getRates?: Maybe<Array<Rate>>;
  /** Get the rate of one currency to many */
  getOneToManyRates?: Maybe<Array<Rate>>;
  /** This endpoint can be used to get all transactions for current user. */
  myTransactions?: Maybe<TransactionShortListResult>;
  /** This endpoint can be used to get all transactions with their description. */
  getTransactions?: Maybe<TransactionListResult>;
  /** Get transaction history with filters */
  getTransactionStatusHistory: TransactionStatusHistoryListResult;
  /** This endpoint can be used to get all wallets of the current user with their description. */
  myWallets?: Maybe<AssetAddressShortListResult>;
  /** This endpoint can be used to get all wallets with their description. */
  getWallets?: Maybe<AssetAddressListResult>;
  /** This endpoint can be used to get all transaction statuses with their description */
  getTransactionStatuses?: Maybe<Array<TransactionStatusDescriptorMap>>;
  /** Get toolbar statistics */
  getDashboardStats?: Maybe<DashboardStats>;
  /** This endpoint can be used to get all widgets for the current user. */
  myWidgets?: Maybe<WidgetListResult>;
  /** This endpoint can be used to get all widgets for the selected user. */
  getWidgetsByUser?: Maybe<WidgetListResult>;
  /** This endpoint can be used to get all widgets. */
  getWidgets?: Maybe<WidgetListResult>;
  /** This endpoint can be used to get a widget by id */
  getWidget?: Maybe<Widget>;
  getRiskAlerts?: Maybe<RiskAlertResultList>;
  /** Get wallet address */
  getSellAddress?: Maybe<Scalars['String']>;
  /** Get a black list of countries */
  getCountryBlackList?: Maybe<BlackCountryListResult>;
  /** Get fake error */
  getFakeError?: Maybe<Scalars['Void']>;
  /** This endpoint can be used to get all fiat wallets with their description */
  getFiatVaults?: Maybe<FiatVaultUserListResult>;
  /** This endpoint can be used to get all fiat wallets for the current user */
  myFiatVaults?: Maybe<FiatVaultListResult>;
  /** Get the rate of one currency to many (using for liquidity provider functionality) */
  getOneToManyRatesMerchant?: Maybe<Array<Maybe<Rate>>>;
  /** Get system balance */
  getSystemBalanceMany?: Maybe<Scalars['String']>;
  getDevices?: Maybe<UserDeviceListResult>;
  myDevices?: Maybe<UserDeviceListResult>;
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


export type QueryGetNotificationsByUserArgs = {
  userId?: Maybe<Scalars['String']>;
  unreadOnly?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetNotificationsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetAppropriatePaymentProvidersArgs = {
  fiatCurrency?: Maybe<Scalars['String']>;
  widgetId?: Maybe<Scalars['String']>;
  source?: Maybe<TransactionSource>;
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


export type QueryGetSettingsKycTiersArgs = {
  userId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMySettingsKycTiersArgs = {
  source?: Maybe<TransactionSource>;
  widgetId?: Maybe<Scalars['String']>;
};


export type QueryGetAppropriateSettingsKycTiersArgs = {
  amount?: Maybe<Scalars['Float']>;
  currency?: Maybe<Scalars['String']>;
  targetKycProvider: KycProvider;
  source?: Maybe<TransactionSource>;
  widgetId?: Maybe<Scalars['String']>;
};


export type QueryGetSettingsFeeArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMySettingsFeeArgs = {
  transactionType: TransactionType;
  transactionSource: TransactionSource;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<Scalars['String']>;
  currencyTo?: Maybe<Scalars['String']>;
  currencyFrom?: Maybe<Scalars['String']>;
  widgetId?: Maybe<Scalars['String']>;
};


export type QueryMySettingsFeeFullArgs = {
  transactionType: TransactionType;
  transactionSource: TransactionSource;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<Scalars['String']>;
  currencyTo?: Maybe<Scalars['String']>;
  currencyFrom?: Maybe<Scalars['String']>;
  widgetId?: Maybe<Scalars['String']>;
};


export type QueryGetAppropriateSettingsFeeArgs = {
  transactionType: TransactionType;
  targetUserType: UserType;
  targetUserMode: UserMode;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<Scalars['String']>;
  currencyTo?: Maybe<Scalars['String']>;
  currencyFrom?: Maybe<Scalars['String']>;
  filterType?: Maybe<SettingsFeeTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetSettingsCostArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMySettingsCostArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<Scalars['String']>;
  currency?: Maybe<Scalars['String']>;
};


export type QueryGetAppropriateSettingsCostFullArgs = {
  transactionType: TransactionType;
  instrument: PaymentInstrument;
  paymentProvider?: Maybe<Scalars['String']>;
  currency?: Maybe<Scalars['String']>;
  filterType?: Maybe<SettingsCostTargetFilterType>;
  filterValue?: Maybe<Scalars['String']>;
};


export type QueryGetWireTransferBankAccountsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetVerificationLinkArgs = {
  userId?: Maybe<Scalars['String']>;
};


export type QueryGenerateWebApiTokenArgs = {
  newLevel?: Maybe<Scalars['String']>;
};


export type QueryMyStateArgs = {
  options?: Maybe<UserStateInput>;
};


export type QueryGetUserStateArgs = {
  userId?: Maybe<Scalars['String']>;
  options?: Maybe<UserStateInput>;
};


export type QueryMyProfitArgs = {
  options?: Maybe<UserProfitInput>;
};


export type QueryUserProfitArgs = {
  userId: Scalars['String'];
  options?: Maybe<UserProfitInput>;
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
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  roleIdsOnly?: Maybe<Array<Scalars['String']>>;
  accountTypesOnly?: Maybe<Array<UserType>>;
  accountModesOnly?: Maybe<Array<UserMode>>;
  accountStatusesOnly?: Maybe<Array<AccountStatus>>;
  userTierLevelsOnly?: Maybe<Array<Scalars['String']>>;
  riskLevelsOnly?: Maybe<Array<RiskLevel>>;
  countriesOnly?: Maybe<Array<Scalars['String']>>;
  countryCodeType?: Maybe<CountryCodeType>;
  kycStatusesOnly?: Maybe<Array<KycStatus>>;
  registrationDateInterval?: Maybe<DateTimeInterval>;
  widgetIdsOnly?: Maybe<Array<Scalars['String']>>;
  totalBuyVolumeOver?: Maybe<Scalars['Int']>;
  transactionCountOver?: Maybe<Scalars['Int']>;
  verifyWhenPaid?: Maybe<Scalars['Boolean']>;
  flag?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyContactsArgs = {
  assetIds?: Maybe<Array<Scalars['String']>>;
  contactEmails?: Maybe<Array<Scalars['String']>>;
  contactDisplayNames?: Maybe<Array<Scalars['String']>>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetUserContactsArgs = {
  userId?: Maybe<Scalars['String']>;
  assetIds?: Maybe<Array<Scalars['String']>>;
  contactEmails?: Maybe<Array<Scalars['String']>>;
  contactDisplayNames?: Maybe<Array<Scalars['String']>>;
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
  resultsOnly?: Maybe<Array<UserActionResult>>;
  statusesOnly?: Maybe<Array<Scalars['String']>>;
  actionTypesOnly?: Maybe<Array<UserActionType>>;
  createdDateInterval?: Maybe<DateTimeInterval>;
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
  recaptcha?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetRatesArgs = {
  currenciesFrom: Array<Scalars['String']>;
  currencyTo: Scalars['String'];
  recaptcha?: Maybe<Scalars['String']>;
};


export type QueryGetOneToManyRatesArgs = {
  currencyFrom: Scalars['String'];
  currenciesTo: Array<Scalars['String']>;
  reverse?: Maybe<Scalars['Boolean']>;
};


export type QueryMyTransactionsArgs = {
  transactionIdsOnly?: Maybe<Array<Scalars['String']>>;
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  transactionDateOnly?: Maybe<Scalars['DateTime']>;
  transactionTypesOnly?: Maybe<Array<TransactionType>>;
  sendersOrReceiversOnly?: Maybe<Array<Scalars['String']>>;
  paymentProvidersOnly?: Maybe<Array<Scalars['String']>>;
  walletAddressOnly?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetTransactionsArgs = {
  transactionIdsOnly?: Maybe<Array<Scalars['String']>>;
  transactionStatusesOnly?: Maybe<Array<Scalars['String']>>;
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  widgetIdsOnly?: Maybe<Array<Scalars['String']>>;
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  countriesOnly?: Maybe<Array<Scalars['String']>>;
  countryCodeType?: Maybe<CountryCodeType>;
  accountTypesOnly?: Maybe<Array<UserType>>;
  kycStatusesOnly?: Maybe<Array<TransactionKycStatus>>;
  transactionDateOnly?: Maybe<Scalars['DateTime']>;
  transactionTypesOnly?: Maybe<Array<TransactionType>>;
  sendersOrReceiversOnly?: Maybe<Array<Scalars['String']>>;
  paymentProvidersOnly?: Maybe<Array<Scalars['String']>>;
  accountStatusesOnly?: Maybe<Array<Scalars['String']>>;
  userTierLevelsOnly?: Maybe<Array<Scalars['String']>>;
  riskLevelsOnly?: Maybe<Array<Scalars['String']>>;
  paymentInstrumentsOnly?: Maybe<Array<PaymentInstrument>>;
  createdDateInterval?: Maybe<DateTimeInterval>;
  updateDateInterval?: Maybe<DateTimeInterval>;
  completedDateInterval?: Maybe<DateTimeInterval>;
  walletAddressOnly?: Maybe<Scalars['String']>;
  verifyWhenPaid?: Maybe<Scalars['Boolean']>;
  accountModesOnly?: Maybe<Array<Maybe<UserMode>>>;
  flag?: Maybe<Scalars['Boolean']>;
  preauth?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetTransactionStatusHistoryArgs = {
  transactionIds?: Maybe<Array<Scalars['String']>>;
  userIds?: Maybe<Array<Scalars['String']>>;
  statusesOnly?: Maybe<Array<Scalars['String']>>;
  createdDateInterval?: Maybe<DateTimeInterval>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyWalletsArgs = {
  assetIdsOnly?: Maybe<Array<Scalars['String']>>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetWalletsArgs = {
  walletIdsOnly?: Maybe<Array<Scalars['String']>>;
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  assetIdsOnly?: Maybe<Array<Scalars['String']>>;
  zeroBalance?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetDashboardStatsArgs = {
  updateDateInterval?: Maybe<DateTimeInterval>;
  transactionDateOnly?: Maybe<Scalars['DateTime']>;
  createdDateInterval?: Maybe<DateTimeInterval>;
  userIdOnly?: Maybe<Array<Scalars['String']>>;
  widgetIdOnly?: Maybe<Array<Scalars['String']>>;
  sourcesOnly?: Maybe<Array<TransactionSource>>;
  countriesOnly?: Maybe<Array<Scalars['String']>>;
  countryCodeType?: Maybe<CountryCodeType>;
  completedDateInterval?: Maybe<DateTimeInterval>;
  accountTypesOnly?: Maybe<Array<UserType>>;
};


export type QueryMyWidgetsArgs = {
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetWidgetsByUserArgs = {
  userId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetWidgetsArgs = {
  widgetIdsOnly?: Maybe<Array<Scalars['String']>>;
  userIdsOnly?: Maybe<Array<Scalars['String']>>;
  name?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetWidgetArgs = {
  id: Scalars['String'];
  recaptcha: Scalars['String'];
};


export type QueryGetRiskAlertsArgs = {
  userId?: Maybe<Scalars['String']>;
  code?: Maybe<RiskAlertCodes>;
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetSellAddressArgs = {
  currency?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
};


export type QueryGetFiatVaultsArgs = {
  userIdsOnly?: Maybe<Array<Maybe<Scalars['String']>>>;
  assetsOnly?: Maybe<Array<Maybe<Scalars['String']>>>;
  vaultIdsOnly?: Maybe<Array<Maybe<Scalars['String']>>>;
  zeroBalance?: Maybe<Scalars['Boolean']>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryMyFiatVaultsArgs = {
  assetsOnly?: Maybe<Array<Maybe<Scalars['String']>>>;
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export type QueryGetOneToManyRatesMerchantArgs = {
  currencyFrom?: Maybe<Scalars['String']>;
  currenciesTo?: Maybe<Array<Maybe<Scalars['String']>>>;
  withFactor?: Maybe<Scalars['Boolean']>;
};

export type Rate = {
  __typename?: 'Rate';
  currencyFrom: Scalars['String'];
  currencyTo: Scalars['String'];
  originalRate: Scalars['Float'];
  depositRate: Scalars['Float'];
  withdrawRate: Scalars['Float'];
};

export type RequiredUserPermission = {
  objectCode?: Maybe<Scalars['String']>;
  fullAccess?: Maybe<Scalars['Boolean']>;
};

export type RiskAlert = {
  __typename?: 'RiskAlert';
  riskAlertId?: Maybe<Scalars['ID']>;
  userId: Scalars['String'];
  user?: Maybe<User>;
  riskAlertTypeCode: RiskAlertCodes;
  created: Scalars['DateTime'];
  details?: Maybe<Scalars['String']>;
};

export enum RiskAlertCodes {
  UserAge = 'USER_AGE',
  TooManyFailedLoginAttempts = 'TOO_MANY_FAILED_LOGIN_ATTEMPTS',
  UnusualUserIpAddress = 'UNUSUAL_USER_IP_ADDRESS',
  TwoOrMoreCustomersWithdrawalSameAddress = 'TWO_OR_MORE_CUSTOMERS_WITHDRAWAL_SAME_ADDRESS',
  DepositXPercentUpThanTheLastOne = 'DEPOSIT_X_PERCENT_UP_THAN_THE_LAST_ONE',
  DepositAbove_10K = 'DEPOSIT_ABOVE_10K',
  DepositAbove_50K = 'DEPOSIT_ABOVE_50K',
  DepositAboveXAmountInYTimeframe = 'DEPOSIT_ABOVE_X_AMOUNT_IN_Y_TIMEFRAME',
  SumsubWords = 'SUMSUB_WORDS',
  WithdrawalOwner = 'WITHDRAWAL_OWNER',
  OpenpaydMismatch = 'OPENPAYD_MISMATCH',
  FlashfxMismatch = 'FLASHFX_MISMATCH'
}

export type RiskAlertResultList = {
  __typename?: 'RiskAlertResultList';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<RiskAlert>>;
};

export type RiskAlertType = {
  __typename?: 'RiskAlertType';
  riskAlertTypeCode: RiskAlertCodes;
  description?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  disabled?: Maybe<Scalars['DateTime']>;
};

export type RiskAlertTypeInput = {
  riskAlertTypeCode: RiskAlertCodes;
  description?: Maybe<Scalars['String']>;
  disabled?: Maybe<Scalars['DateTime']>;
};

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export type SettingsCommon = {
  __typename?: 'SettingsCommon';
  settingsCommonId?: Maybe<Scalars['String']>;
  liquidityProvider?: Maybe<Scalars['String']>;
  mailProvider?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  kycProvider?: Maybe<Scalars['String']>;
  kycBaseAddress?: Maybe<Scalars['String']>;
  adminEmails?: Maybe<Array<Scalars['String']>>;
  stoppedForServicing?: Maybe<Scalars['Boolean']>;
  additionalSettings?: Maybe<Scalars['String']>;
  proxyLiquidityProviderUrl?: Maybe<Scalars['String']>;
  proxyLiquidityProviderApiKey?: Maybe<Scalars['String']>;
  proxyLiquidityProviderApiSecret?: Maybe<Scalars['String']>;
  proxyLiquidityProvider?: Maybe<Scalars['String']>;
  proxyLiquidityProviderTransactionChangedCallback?: Maybe<Scalars['String']>;
  textPages?: Maybe<Array<Maybe<TextPage>>>;
};

export type SettingsCommonInput = {
  liquidityProvider?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  mailProvider?: Maybe<Scalars['String']>;
  kycProvider?: Maybe<Scalars['String']>;
  adminEmails?: Maybe<Array<Scalars['String']>>;
  stoppedForServicing?: Maybe<Scalars['Boolean']>;
  additionalSettings?: Maybe<Scalars['String']>;
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
  terms?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  bankAccounts?: Maybe<Array<WireTransferBankAccount>>;
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
  targetPaymentProviders?: Maybe<Array<Scalars['String']>>;
  terms?: Maybe<Scalars['String']>;
  bankAccountIds?: Maybe<Array<Scalars['String']>>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type SettingsCostListResult = {
  __typename?: 'SettingsCostListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsCost>>;
};

export type SettingsCostShort = {
  __typename?: 'SettingsCostShort';
  terms?: Maybe<Scalars['String']>;
  bankAccounts?: Maybe<Array<WireTransferBankAccountShort>>;
};

export enum SettingsCostTargetFilterType {
  None = 'None',
  Psp = 'PSP',
  Country = 'Country'
}

export type SettingsCurrency = {
  __typename?: 'SettingsCurrency';
  symbol: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  precision: Scalars['Int'];
  minAmount: Scalars['Float'];
  maxAmount: Scalars['Float'];
  rateFactor: Scalars['Float'];
  validateAsSymbol?: Maybe<Scalars['String']>;
  fiat?: Maybe<Scalars['Boolean']>;
  defaultBankTransferProvider?: Maybe<Scalars['String']>;
  defaultWireTransferProvider?: Maybe<Scalars['String']>;
  defaultCreditCardProvider?: Maybe<Scalars['String']>;
  explorerLink?: Maybe<Scalars['String']>;
  ethFlag?: Maybe<Scalars['Boolean']>;
  trxFlag?: Maybe<Scalars['Boolean']>;
  disabled?: Maybe<Scalars['String']>;
  displaySymbol?: Maybe<Scalars['String']>;
};

export type SettingsCurrencyListResult = {
  __typename?: 'SettingsCurrencyListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsCurrency>>;
};

export type SettingsCurrencyWithDefaults = {
  __typename?: 'SettingsCurrencyWithDefaults';
  settingsCurrency?: Maybe<SettingsCurrencyListResult>;
  defaultFiat?: Maybe<Scalars['String']>;
  defaultCrypto?: Maybe<Scalars['String']>;
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
  targetCurrenciesFrom?: Maybe<Array<Scalars['String']>>;
  targetCurrenciesTo?: Maybe<Array<Scalars['String']>>;
  terms: Scalars['String'];
  wireDetails: Scalars['String'];
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
  currency?: Maybe<Scalars['String']>;
  rateToEur?: Maybe<Scalars['Float']>;
  costs?: Maybe<Array<SettingsCost>>;
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
  targetPaymentProviders?: Maybe<Array<Scalars['String']>>;
  targetCurrenciesFrom?: Maybe<Array<Scalars['String']>>;
  targetCurrenciesTo?: Maybe<Array<Scalars['String']>>;
  terms?: Maybe<Scalars['String']>;
  wireDetails?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type SettingsFeeListResult = {
  __typename?: 'SettingsFeeListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsFee>>;
};

export type SettingsFeeShort = {
  __typename?: 'SettingsFeeShort';
  terms: Scalars['String'];
  wireDetails: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  rateToEur?: Maybe<Scalars['Float']>;
  costs?: Maybe<Array<SettingsCostShort>>;
  requiredFields?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum SettingsFeeTargetFilterType {
  None = 'None',
  AccountId = 'AccountId',
  WidgetId = 'WidgetId',
  Country = 'Country',
  AccountType = 'AccountType',
  InitiateFrom = 'InitiateFrom'
}

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

export type SettingsKycLevel = {
  __typename?: 'SettingsKycLevel';
  settingsKycLevelId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  originalLevelName?: Maybe<Scalars['String']>;
  originalFlowName?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  userType?: Maybe<UserType>;
  order?: Maybe<Scalars['Int']>;
  data?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['String']>;
};

export type SettingsKycLevelInput = {
  name: Scalars['String'];
  originalLevelName?: Maybe<Scalars['String']>;
  originalFlowName?: Maybe<Scalars['String']>;
  data: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  userType: UserType;
  order?: Maybe<Scalars['Int']>;
};

export type SettingsKycLevelListResult = {
  __typename?: 'SettingsKycLevelListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsKycLevel>>;
};

export type SettingsKycLevelShort = {
  __typename?: 'SettingsKycLevelShort';
  settingsKycLevelId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  originalLevelName?: Maybe<Scalars['String']>;
  originalFlowName?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  userType?: Maybe<UserType>;
  order?: Maybe<Scalars['Int']>;
  data?: Maybe<Scalars['String']>;
};

export type SettingsKycLevelShufti = {
  __typename?: 'SettingsKycLevelShufti';
  settingsKycLevelShuftiId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
};

export type SettingsKycListResult = {
  __typename?: 'SettingsKycListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsKyc>>;
};

export type SettingsKycShort = {
  __typename?: 'SettingsKycShort';
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  levels?: Maybe<Array<SettingsKycLevelShort>>;
};

export enum SettingsKycTargetFilterType {
  None = 'None',
  AccountId = 'AccountId',
  WidgetId = 'WidgetId',
  Country = 'Country',
  InitiateFrom = 'InitiateFrom'
}

export type SettingsKycTier = {
  __typename?: 'SettingsKycTier';
  settingsKycTierId: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  targetKycProviders?: Maybe<Array<KycProvider>>;
  targetUserType: UserType;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetFilterType?: Maybe<SettingsKycTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  levelId: Scalars['String'];
  level?: Maybe<SettingsKycLevel>;
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
  skipForWaiting?: Maybe<Scalars['Boolean']>;
  showForm?: Maybe<Scalars['Boolean']>;
};

export type SettingsKycTierInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  targetKycProviders?: Maybe<Array<KycProvider>>;
  targetUserType?: Maybe<UserType>;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetFilterType?: Maybe<SettingsKycTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']>>;
  levelId?: Maybe<Scalars['String']>;
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  default?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type SettingsKycTierListResult = {
  __typename?: 'SettingsKycTierListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsKycTier>>;
};

export type SettingsKycTierShort = {
  __typename?: 'SettingsKycTierShort';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
};

export type SettingsKycTierShortEx = {
  __typename?: 'SettingsKycTierShortEx';
  settingsKycTierId: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  requireUserFullName?: Maybe<Scalars['Boolean']>;
  requireUserPhone?: Maybe<Scalars['Boolean']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']>;
  requireUserAddress?: Maybe<Scalars['Boolean']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']>;
  levelId?: Maybe<Scalars['String']>;
  levelName?: Maybe<Scalars['String']>;
  levelDescription?: Maybe<Scalars['String']>;
  originalLevelName?: Maybe<Scalars['String']>;
  originalFlowName?: Maybe<Scalars['String']>;
  skipForWaiting?: Maybe<Scalars['Boolean']>;
  showForm?: Maybe<Scalars['Boolean']>;
  currency?: Maybe<Scalars['String']>;
};

export type SettingsKycTierShortExListResult = {
  __typename?: 'SettingsKycTierShortExListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SettingsKycTierShortEx>>;
};

export type StringMap = {
  __typename?: 'StringMap';
  key: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  newNotification?: Maybe<Scalars['Void']>;
  transactionServiceNotification?: Maybe<Scalars['Void']>;
  kycServiceNotification?: Maybe<Scalars['Void']>;
  kycCompletedNotification?: Maybe<Scalars['Void']>;
};

export type SupportTicket = {
  __typename?: 'SupportTicket';
  supportTicketId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
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

export type SupportTicketListResult = {
  __typename?: 'SupportTicketListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<SupportTicket>>;
};

export type TextPage = {
  __typename?: 'TextPage';
  page?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
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

export type Transaction = {
  __typename?: 'Transaction';
  transactionId: Scalars['ID'];
  code?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  userReferralCode: Scalars['Int'];
  userIp?: Maybe<Scalars['String']>;
  userTierId?: Maybe<Scalars['String']>;
  userTier?: Maybe<SettingsKycTierShortEx>;
  requiredUserTierId?: Maybe<Scalars['String']>;
  requiredUserTier?: Maybe<SettingsKycTierShortEx>;
  sourceVaultId?: Maybe<Scalars['String']>;
  sourceVault?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  created?: Maybe<Scalars['DateTime']>;
  updated?: Maybe<Scalars['DateTime']>;
  executed?: Maybe<Scalars['DateTime']>;
  type: TransactionType;
  status: TransactionStatus;
  subStatus?: Maybe<Scalars['String']>;
  kycStatus?: Maybe<TransactionKycStatus>;
  accountStatus?: Maybe<AccountStatus>;
  feeFiat?: Maybe<Scalars['Float']>;
  feePercent?: Maybe<Scalars['Float']>;
  feeMinFiat?: Maybe<Scalars['Float']>;
  feeDetails?: Maybe<Scalars['String']>;
  approxNetworkFee?: Maybe<Scalars['Float']>;
  approxNetworkFeeFiat?: Maybe<Scalars['Float']>;
  userDefaultFiatCurrency: Scalars['String'];
  userDefaultCryptoCurrency: Scalars['String'];
  currencyToSpend?: Maybe<Scalars['String']>;
  amountToSpend?: Maybe<Scalars['Float']>;
  amountToSpendWithoutFee?: Maybe<Scalars['Float']>;
  currencyToReceive: Scalars['String'];
  initialAmountToReceive?: Maybe<Scalars['Float']>;
  initialAmountToReceiveWithoutFee?: Maybe<Scalars['Float']>;
  amountToReceive?: Maybe<Scalars['Float']>;
  amountToReceiveWithoutFee?: Maybe<Scalars['Float']>;
  amountInEur?: Maybe<Scalars['Float']>;
  initialRate?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  rateFiatToEur?: Maybe<Scalars['Float']>;
  destVaultId?: Maybe<Scalars['String']>;
  destVault?: Maybe<Scalars['String']>;
  destination?: Maybe<Scalars['String']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  accountType?: Maybe<Scalars['String']>;
  source?: Maybe<TransactionSource>;
  instrument?: Maybe<PaymentInstrument>;
  instrumentDetails?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<CustodyProvider>;
  custodyDetails?: Maybe<Scalars['String']>;
  paymentProvider?: Maybe<Scalars['String']>;
  paymentOrderId?: Maybe<Scalars['String']>;
  paymentOrder?: Maybe<PaymentOrder>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  liquidityOrderId?: Maybe<Scalars['String']>;
  liquidityOrder?: Maybe<LiquidityOrder>;
  transferOrderId?: Maybe<Scalars['String']>;
  transferOrder?: Maybe<TransferOrder>;
  transferOrderBlockchainLink?: Maybe<Scalars['String']>;
  benchmarkTransferOrderId?: Maybe<Scalars['String']>;
  benchmarkTransferOrder?: Maybe<TransferOrder>;
  benchmarkTransferOrderBlockchainLink?: Maybe<Scalars['String']>;
  userBalanceTotalBefore?: Maybe<Scalars['Float']>;
  userBalanceAvailableBefore?: Maybe<Scalars['Float']>;
  userBalanceTotalAfter?: Maybe<Scalars['Float']>;
  userBalanceAvailableAfter?: Maybe<Scalars['Float']>;
  totalUserAmountBeforeTransactionInEur?: Maybe<Scalars['Float']>;
  hasBeenBenchmarked?: Maybe<Scalars['Boolean']>;
  widgetId?: Maybe<Scalars['String']>;
  widgetCode?: Maybe<Scalars['String']>;
  widgetUserParamsId?: Maybe<Scalars['String']>;
  widgetUserParams?: Maybe<Scalars['String']>;
  widget?: Maybe<Scalars['String']>;
  destinationUserId?: Maybe<Scalars['String']>;
  manuallyEditedAmounts?: Maybe<Scalars['Boolean']>;
  manuallyEditedFee?: Maybe<Scalars['Boolean']>;
  manuallyEditedStatus?: Maybe<Scalars['Boolean']>;
  manuallyEditedKycStatus?: Maybe<Scalars['Boolean']>;
  manuallyEditedAccountStatus?: Maybe<Scalars['Boolean']>;
  risk: RiskLevel;
  riskCodes?: Maybe<Array<Scalars['String']>>;
  backups?: Maybe<Array<Scalars['String']>>;
  comment?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
  verifyWhenPaid?: Maybe<Scalars['Boolean']>;
  requestParams?: Maybe<Scalars['String']>;
  cryptoInvoiceName?: Maybe<Scalars['String']>;
  sourceAddress?: Maybe<Scalars['String']>;
  flag?: Maybe<Scalars['Boolean']>;
  costDetails?: Maybe<Scalars['String']>;
  screeningAnswer?: Maybe<Scalars['String']>;
  screeningRiskscore?: Maybe<Scalars['Float']>;
  screeningStatus?: Maybe<Scalars['String']>;
  screeningData?: Maybe<Scalars['String']>;
};

export enum TransactionConfirmationMode {
  Always = 'ALWAYS',
  IfOneTime = 'IF_ONE_TIME',
  Never = 'NEVER'
}

export type TransactionInput = {
  type: TransactionType;
  source: TransactionSource;
  sourceVaultId?: Maybe<Scalars['String']>;
  destVaultId?: Maybe<Scalars['String']>;
  destination?: Maybe<Scalars['String']>;
  currencyToSpend?: Maybe<Scalars['String']>;
  currencyToReceive?: Maybe<Scalars['String']>;
  amountToSpend: Scalars['Float'];
  instrument?: Maybe<PaymentInstrument>;
  instrumentDetails?: Maybe<Scalars['String']>;
  paymentProvider?: Maybe<Scalars['String']>;
  widgetUserParamsId?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
  verifyWhenPaid?: Maybe<Scalars['Boolean']>;
  sourceAddress?: Maybe<Scalars['String']>;
};

export enum TransactionKycStatus {
  KycWaiting = 'KycWaiting',
  KycRejected = 'KycRejected',
  KycApproved = 'KycApproved'
}

export type TransactionListResult = {
  __typename?: 'TransactionListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Transaction>>;
};

export type TransactionMerchantInput = {
  type: TransactionType;
  source: TransactionSource;
  sourceVaultId?: Maybe<Scalars['String']>;
  destVaultId?: Maybe<Scalars['String']>;
  destination?: Maybe<Scalars['String']>;
  currencyToSpend?: Maybe<Scalars['String']>;
  amountToSpend: Scalars['Float'];
  amountToSpendWithoutFee?: Maybe<Scalars['Float']>;
  currencyToReceive?: Maybe<Scalars['String']>;
  initialAmountToReceive?: Maybe<Scalars['Float']>;
  initialAmountToReceiveWithoutFee?: Maybe<Scalars['Float']>;
  amountToReceive?: Maybe<Scalars['Float']>;
  amountToReceiveWithoutFee?: Maybe<Scalars['Float']>;
  amountInEur?: Maybe<Scalars['Float']>;
  initialRate?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  rateFiatToEur?: Maybe<Scalars['Float']>;
  instrument?: Maybe<PaymentInstrument>;
  instrumentDetails?: Maybe<Scalars['String']>;
  paymentProvider?: Maybe<Scalars['String']>;
  widgetUserParamsId?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
  status?: Maybe<TransactionStatus>;
  transactionChangedCallback?: Maybe<Scalars['String']>;
  sourceAddress?: Maybe<Scalars['String']>;
};

export type TransactionSh = {
  __typename?: 'TransactionSH';
  code?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
};

export enum TransactionServiceNotificationType {
  PaymentStatusChanged = 'PaymentStatusChanged',
  CryptoPartPaid = 'CryptoPartPaid',
  CryptoFullPaid = 'CryptoFullPaid'
}

export type TransactionShort = {
  __typename?: 'TransactionShort';
  transactionId: Scalars['ID'];
  code?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  userReferralCode: Scalars['Int'];
  sourceVaultId?: Maybe<Scalars['String']>;
  sourceVault?: Maybe<Scalars['String']>;
  userIp?: Maybe<Scalars['String']>;
  userTierId?: Maybe<Scalars['String']>;
  userTier?: Maybe<SettingsKycTierShortEx>;
  requiredUserTierId?: Maybe<Scalars['String']>;
  requiredUserTier?: Maybe<SettingsKycTierShortEx>;
  created?: Maybe<Scalars['DateTime']>;
  updated?: Maybe<Scalars['DateTime']>;
  executed?: Maybe<Scalars['DateTime']>;
  type: TransactionType;
  status: TransactionStatus;
  subStatus?: Maybe<Scalars['String']>;
  kycStatus?: Maybe<TransactionKycStatus>;
  accountStatus?: Maybe<AccountStatus>;
  feeFiat?: Maybe<Scalars['Float']>;
  feePercent?: Maybe<Scalars['Float']>;
  feeMinFiat?: Maybe<Scalars['Float']>;
  feeDetails?: Maybe<Scalars['String']>;
  approxNetworkFee?: Maybe<Scalars['Float']>;
  approxNetworkFeeFiat?: Maybe<Scalars['Float']>;
  currencyToSpend?: Maybe<Scalars['String']>;
  amountToSpend?: Maybe<Scalars['Float']>;
  amountToSpendWithoutFee?: Maybe<Scalars['Float']>;
  currencyToReceive?: Maybe<Scalars['String']>;
  initialAmountToReceive?: Maybe<Scalars['Float']>;
  initialAmountToReceiveWithoutFee?: Maybe<Scalars['Float']>;
  amountToReceive?: Maybe<Scalars['Float']>;
  amountToReceiveWithoutFee?: Maybe<Scalars['Float']>;
  amountInEur?: Maybe<Scalars['Float']>;
  initialRate?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  rateFiatToEur?: Maybe<Scalars['Float']>;
  destVaultId?: Maybe<Scalars['String']>;
  destVault?: Maybe<Scalars['String']>;
  destination?: Maybe<Scalars['String']>;
  countryCode2?: Maybe<Scalars['String']>;
  countryCode3?: Maybe<Scalars['String']>;
  accountType?: Maybe<Scalars['String']>;
  source?: Maybe<TransactionSource>;
  instrument?: Maybe<PaymentInstrument>;
  instrumentDetails?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<CustodyProvider>;
  custodyDetails?: Maybe<Scalars['String']>;
  paymentProvider?: Maybe<Scalars['String']>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  paymentOrder?: Maybe<PaymentOrder>;
  liquidityOrder?: Maybe<LiquidityOrder>;
  transferOrder?: Maybe<TransferOrder>;
  widgetId?: Maybe<Scalars['String']>;
  widgetCode?: Maybe<Scalars['String']>;
  widgetUserParamsId?: Maybe<Scalars['String']>;
  widgetUserParams?: Maybe<Scalars['String']>;
  widget?: Maybe<Scalars['String']>;
  destinationUserId?: Maybe<Scalars['String']>;
  risk: RiskLevel;
  riskCodes?: Maybe<Array<Scalars['String']>>;
  cryptoInvoiceName?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
  sourceAddress?: Maybe<Scalars['String']>;
  flag?: Maybe<Scalars['Boolean']>;
  costDetails?: Maybe<Scalars['String']>;
  screeningAnswer?: Maybe<Scalars['String']>;
  screeningRiskscore?: Maybe<Scalars['Float']>;
  screeningStatus?: Maybe<Scalars['String']>;
  screeningData?: Maybe<Scalars['String']>;
};

export type TransactionShortListResult = {
  __typename?: 'TransactionShortListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<TransactionShort>>;
};

export enum TransactionSource {
  QuickCheckout = 'QuickCheckout',
  Widget = 'Widget',
  Wallet = 'Wallet'
}

export type TransactionStatsByStatus = {
  __typename?: 'TransactionStatsByStatus';
  status?: Maybe<TransactionStatus>;
  volume?: Maybe<TransactionStatsVolume>;
};

export type TransactionStatsVolume = {
  __typename?: 'TransactionStatsVolume';
  count?: Maybe<Scalars['Int']>;
  volume?: Maybe<Scalars['Float']>;
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
  TransferBlocked = 'TransferBlocked',
  Exchanging = 'Exchanging',
  Exchanged = 'Exchanged',
  TransferBenchmarkWaiting = 'TransferBenchmarkWaiting',
  BenchmarkTransfering = 'BenchmarkTransfering',
  BenchmarkTransfered = 'BenchmarkTransfered',
  BenchmarkTransferDeclined = 'BenchmarkTransferDeclined',
  Sending = 'Sending',
  SendingWaiting = 'SendingWaiting',
  Sent = 'Sent',
  Distributing = 'Distributing',
  DistributingWaiting = 'DistributingWaiting',
  Distributed = 'Distributed',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
  Canceled = 'Canceled',
  Chargeback = 'Chargeback',
  KycDeclined = 'KycDeclined'
}

export type TransactionStatusDescriptor = {
  __typename?: 'TransactionStatusDescriptor';
  notifyUser: Scalars['Boolean'];
  canBeCancelled: Scalars['Boolean'];
  description: Scalars['String'];
  userStatus: UserTransactionStatus;
  adminStatus: AdminTransactionStatus;
  level: TransactionStatusLevel;
  repeatFromStatus?: Maybe<TransactionStatus>;
  updateWhenOwnLiquidityProvider?: Maybe<Scalars['Boolean']>;
};

export type TransactionStatusDescriptorMap = {
  __typename?: 'TransactionStatusDescriptorMap';
  key: TransactionStatus;
  value: TransactionStatusDescriptor;
};

export type TransactionStatusHistory = {
  __typename?: 'TransactionStatusHistory';
  transactionStatusHistoryId: Scalars['ID'];
  transactionId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  userEmail?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  oldStatus?: Maybe<Scalars['String']>;
  newStatus?: Maybe<Scalars['String']>;
  newStatusReason?: Maybe<Scalars['String']>;
  initialTransactionHandlingData?: Maybe<Scalars['String']>;
  transaction?: Maybe<Array<Maybe<TransactionSh>>>;
  transactionHandlingData?: Maybe<Scalars['String']>;
  transactionDataBefore?: Maybe<Scalars['String']>;
  transactionDataAfter?: Maybe<Scalars['String']>;
};

export type TransactionStatusHistoryListResult = {
  __typename?: 'TransactionStatusHistoryListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<TransactionStatusHistory>>;
};

export enum TransactionStatusLevel {
  Info = 'info',
  Error = 'error'
}

export enum TransactionSubStatus {
  PartiallyPaid = 'PartiallyPaid'
}

export enum TransactionType {
  Buy = 'Buy',
  Sell = 'Sell',
  Transfer = 'Transfer',
  Receive = 'Receive',
  Exchange = 'Exchange',
  System = 'System',
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
  MerchantBuy = 'MerchantBuy',
  MerchantSell = 'MerchantSell'
}

export type TransactionUpdateInput = {
  sourceVaultId?: Maybe<Scalars['String']>;
  currencyToSpend?: Maybe<Scalars['String']>;
  currencyToReceive?: Maybe<Scalars['String']>;
  amountToSpend?: Maybe<Scalars['Float']>;
  amountToReceive?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  destination?: Maybe<Scalars['String']>;
  feeFiat?: Maybe<Scalars['Float']>;
  widgetId?: Maybe<Scalars['String']>;
  widgetUserParamsId?: Maybe<Scalars['String']>;
  status?: Maybe<TransactionStatus>;
  subStatus?: Maybe<Scalars['String']>;
  kycStatus?: Maybe<TransactionKycStatus>;
  launchAfterUpdate?: Maybe<Scalars['Boolean']>;
  accountStatus?: Maybe<AccountStatus>;
  transferOrderChanges?: Maybe<TransactionUpdateTransferOrderChanges>;
  benchmarkTransferOrderChanges?: Maybe<TransactionUpdateTransferOrderChanges>;
  comment?: Maybe<Scalars['String']>;
  requestParams?: Maybe<Scalars['String']>;
  cryptoInvoiceName?: Maybe<Scalars['String']>;
  flag?: Maybe<Scalars['Boolean']>;
};

export type TransactionUpdateTransferOrderChanges = {
  orderId?: Maybe<Scalars['String']>;
  hash?: Maybe<Scalars['String']>;
};

export type TransferListResult = {
  __typename?: 'TransferListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<TransferOrder>>;
};

export type TransferOrder = {
  __typename?: 'TransferOrder';
  orderId?: Maybe<Scalars['ID']>;
  userId: Scalars['String'];
  transactionId?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  operation?: Maybe<Scalars['String']>;
  signed?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  published?: Maybe<Scalars['DateTime']>;
  publishingResult?: Maybe<Scalars['String']>;
  executed?: Maybe<Scalars['DateTime']>;
  executingResult?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  currency?: Maybe<Scalars['String']>;
  sourceVaultId?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  destination?: Maybe<Scalars['String']>;
  type?: Maybe<TransferType>;
  originalOrderId?: Maybe<Scalars['String']>;
  transferHash?: Maybe<Scalars['String']>;
  transferDetails?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  subStatus?: Maybe<Scalars['String']>;
  feeCurrency?: Maybe<Scalars['Float']>;
  cryptoInvoiceName?: Maybe<Scalars['String']>;
  screeningAnswer?: Maybe<Scalars['String']>;
  screeningRiskscore?: Maybe<Scalars['Float']>;
  screeningStatus?: Maybe<Scalars['String']>;
  screeningData?: Maybe<Scalars['String']>;
};

export type TransferResult = {
  __typename?: 'TransferResult';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  result?: Maybe<Scalars['String']>;
};

export type TransferStats = BaseStat & {
  __typename?: 'TransferStats';
  ratio?: Maybe<Scalars['Float']>;
  approved?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  abandoned?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  toMerchant?: Maybe<MerchantOrCustomerStats>;
  toCustomer?: Maybe<MerchantOrCustomerStats>;
  fee?: Maybe<TransactionStatsVolume>;
};

export enum TransferType {
  Send = 'Send',
  Receive = 'Receive'
}

export type TwoFactorAuthenticationResult = {
  __typename?: 'TwoFactorAuthenticationResult';
  otpauthUrl: Scalars['String'];
  code: Scalars['String'];
  qr: Scalars['String'];
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
  accountStatus?: Maybe<AccountStatus>;
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
  kycTierId?: Maybe<Scalars['String']>;
  kycTier?: Maybe<SettingsKycTierShort>;
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
  kycDocs?: Maybe<Array<Scalars['String']>>;
  custodyProvider?: Maybe<Scalars['String']>;
  vaults?: Maybe<Array<UserVaultIdObj>>;
  defaultFiatCurrency?: Maybe<Scalars['String']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']>;
  risk?: Maybe<RiskLevel>;
  riskCodes?: Maybe<Array<Scalars['String']>>;
  riskAlertCount?: Maybe<Scalars['Int']>;
  widgetId?: Maybe<Scalars['String']>;
  widgetCode?: Maybe<Scalars['String']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateCode?: Maybe<Scalars['String']>;
  totalDepositCompleted?: Maybe<Scalars['Float']>;
  totalDepositCompletedCount?: Maybe<Scalars['Int']>;
  totalDepositInProcess?: Maybe<Scalars['Float']>;
  totalDepositInProcessCount?: Maybe<Scalars['Int']>;
  totalWithdrawalCompleted?: Maybe<Scalars['Float']>;
  totalWithdrawalCompletedCount?: Maybe<Scalars['Int']>;
  totalWithdrawalInProcess?: Maybe<Scalars['Float']>;
  totalWithdrawalInProcessCount?: Maybe<Scalars['Int']>;
  totalBoughtCompleted?: Maybe<Scalars['Float']>;
  totalBoughtCompletedCount?: Maybe<Scalars['Int']>;
  totalBoughtInProcess?: Maybe<Scalars['Float']>;
  totalBoughtInProcessCount?: Maybe<Scalars['Int']>;
  totalSoldCompleted?: Maybe<Scalars['Float']>;
  totalSoldCompletedCount?: Maybe<Scalars['Int']>;
  totalSoldInProcess?: Maybe<Scalars['Float']>;
  totalSoldInProcessCount?: Maybe<Scalars['Int']>;
  totalSentCompleted?: Maybe<Scalars['Float']>;
  totalSentCompletedCount?: Maybe<Scalars['Int']>;
  totalSentInProcess?: Maybe<Scalars['Float']>;
  totalSentInProcessCount?: Maybe<Scalars['Int']>;
  totalReceivedCompleted?: Maybe<Scalars['Float']>;
  totalReceivedCompletedCount?: Maybe<Scalars['Int']>;
  totalReceivedInProcess?: Maybe<Scalars['Float']>;
  totalReceivedInProcessCount?: Maybe<Scalars['Int']>;
  totalTransactionCount?: Maybe<Scalars['Int']>;
  averageTransaction?: Maybe<Scalars['Float']>;
  avarageTransaction?: Maybe<Scalars['Float']>;
  manuallyEditedRisk?: Maybe<Scalars['Boolean']>;
  lastLogin?: Maybe<Scalars['DateTime']>;
  data?: Maybe<Scalars['String']>;
  fiatVaults?: Maybe<Array<FiatVault>>;
  gender?: Maybe<Gender>;
  addressLine?: Maybe<Scalars['String']>;
  openpaydIds?: Maybe<Scalars['String']>;
  openpaydAccountHolderId?: Maybe<Scalars['String']>;
  widgetName?: Maybe<Scalars['String']>;
  document_num?: Maybe<Scalars['String']>;
  document_type?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  flag?: Maybe<Scalars['Boolean']>;
  companyName?: Maybe<Scalars['String']>;
  companyRegisterNumber?: Maybe<Scalars['String']>;
  companyType?: Maybe<Scalars['String']>;
};

export type UserAction = {
  __typename?: 'UserAction';
  userActionId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  userEmail?: Maybe<Scalars['String']>;
  currentUserEmail?: Maybe<Scalars['String']>;
  ip?: Maybe<Scalars['String']>;
  objectId?: Maybe<Scalars['String']>;
  actionType?: Maybe<UserActionType>;
  linkedIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  info?: Maybe<Scalars['String']>;
  result?: Maybe<UserActionResult>;
  status?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['DateTime']>;
};

export type UserActionListResult = {
  __typename?: 'UserActionListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserAction>>;
};

export enum UserActionResult {
  Unknown = 'unknown',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Canceled = 'canceled',
  Error = 'error',
  NotVerified = 'notVerified'
}

export enum UserActionType {
  Signup = 'signup',
  Login = 'login',
  Logout = 'logout',
  Send = 'send',
  Receive = 'receive',
  Buy = 'buy',
  Sell = 'sell',
  Transfer = 'transfer',
  Exchange = 'exchange',
  System = 'system',
  SettleTransaction = 'settleTransaction',
  UnbenchmarkTransaction = 'unbenchmarkTransaction',
  PaidTransaction = 'paidTransaction',
  UpdateTransaction = 'updateTransaction',
  AbandonTransaction = 'abandonTransaction',
  AbandonCryptoInvoice = 'abandonCryptoInvoice',
  CancelTransaction = 'cancelTransaction',
  CreateUser = 'createUser',
  AddWidgetUserParams = 'addWidgetUserParams',
  UpdateUser = 'updateUser',
  DeleteUser = 'deleteUser',
  RestoreUser = 'restoreUser',
  AssignRole = 'assignRole',
  RemoveRole = 'removeRole',
  ChangeUserKycTier = 'changeUserKycTier',
  CreateApiKey = 'createApiKey',
  DeleteApiKey = 'deleteApiKey',
  ChangeRiskAlertSettings = 'changeRiskAlertSettings',
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
  MerchantBuy = 'MerchantBuy',
  MerchantSell = 'MerchantSell',
  GenerateKycToken = 'generateKycToken',
  KycCallback = 'kycCallback',
  OpenpaydCallback = 'openpaydCallback',
  FlashfxCallback = 'flashfxCallback',
  AddBlackCountry = 'addBlackCountry',
  RemoveBlackCountry = 'removeBlackCountry',
  CreateCryptoInvoice = 'createCryptoInvoice',
  UpdateSettings = 'updateSettings',
  AddFeeSettings = 'addFeeSettings',
  UpdateFeeSettings = 'updateFeeSettings',
  DeleteFeeSettings = 'deleteFeeSettings',
  AddCostSettings = 'addCostSettings',
  UpdateCostSettings = 'updateCostSettings',
  DeleteCostSettings = 'deleteCostSettings',
  AddKycLevelSettings = 'addKycLevelSettings',
  UpdateKycLevelSettings = 'updateKycLevelSettings',
  DeleteKycLevelSettings = 'deleteKycLevelSettings',
  AddKycTierSettings = 'addKycTierSettings',
  UpdateKycTierSettings = 'updateKycTierSettings',
  DeleteKycTierSettings = 'deleteKycTierSettings',
  AddWireTransferBankAccount = 'addWireTransferBankAccount',
  UpdateWireTransferBankAccount = 'updateWireTransferBankAccount',
  DeleteWireTransferBankAccount = 'deleteWireTransferBankAccount'
}

export type UserAddress = {
  __typename?: 'UserAddress';
  address?: Maybe<Scalars['ID']>;
  type?: Maybe<Scalars['String']>;
  asset?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  vaultId?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
  details?: Maybe<Scalars['String']>;
};

export type UserAddressListResult = {
  __typename?: 'UserAddressListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserAddress>>;
};

export enum UserBalanceHistoryPeriod {
  LastWeek = 'LastWeek',
  LastMonth = 'LastMonth',
  LastYear = 'LastYear',
  All = 'All'
}

export type UserBalanceHistoryRecord = {
  __typename?: 'UserBalanceHistoryRecord';
  userBalanceId?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  date: Scalars['DateTime'];
  asset: Scalars['String'];
  balance?: Maybe<Scalars['Float']>;
  balanceEur?: Maybe<Scalars['Float']>;
  balanceFiat?: Maybe<Scalars['Float']>;
  transactionId?: Maybe<Scalars['String']>;
};

export type UserBalanceHistoryRecordListResult = {
  __typename?: 'UserBalanceHistoryRecordListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Maybe<UserBalanceHistoryRecord>>>;
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

export type UserContact = {
  __typename?: 'UserContact';
  userContactId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  contactEmail?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  assetId?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['DateTime']>;
};

export type UserContactInput = {
  contactEmail?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  assetId?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
};

export type UserContactListResult = {
  __typename?: 'UserContactListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserContact>>;
};

export type UserCurrencyProfit = {
  __typename?: 'UserCurrencyProfit';
  currencyFrom?: Maybe<Scalars['String']>;
  profit?: Maybe<Scalars['Float']>;
  profitEur?: Maybe<Scalars['Float']>;
  profitFiat?: Maybe<Scalars['Float']>;
  profitPercent?: Maybe<Scalars['Float']>;
  userBalanceHistory?: Maybe<UserBalanceHistoryRecordListResult>;
};

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
  ip?: Maybe<Scalars['String']>;
};

export type UserDeviceListResult = {
  __typename?: 'UserDeviceListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Maybe<UserDevice>>>;
};

export type UserInput = {
  email?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  mode?: Maybe<UserMode>;
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
  accountStatus?: Maybe<AccountStatus>;
  defaultFiatCurrency?: Maybe<Scalars['String']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']>;
  risk?: Maybe<RiskLevel>;
  riskCodes?: Maybe<Array<Scalars['String']>>;
  widgetId?: Maybe<Scalars['String']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']>;
  kycProvider?: Maybe<KycProvider>;
  kycTierId?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['DateTime']>;
  gender?: Maybe<Gender>;
  comment?: Maybe<Scalars['String']>;
  companyName?: Maybe<Scalars['String']>;
  companyRegisterNumber?: Maybe<Scalars['String']>;
  companyType?: Maybe<Scalars['String']>;
  flag?: Maybe<Scalars['Boolean']>;
};

export type UserKycHistory = {
  __typename?: 'UserKycHistory';
  userKycHistoryId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  kycProvider?: Maybe<Scalars['String']>;
  kycValidationTierId?: Maybe<Scalars['String']>;
  kycApplicantId?: Maybe<Scalars['String']>;
  kycValid?: Maybe<Scalars['Boolean']>;
  kycLevelName?: Maybe<Scalars['String']>;
  kycTierId?: Maybe<Scalars['String']>;
  kycReviewDate?: Maybe<Scalars['DateTime']>;
  kycStatus?: Maybe<Scalars['String']>;
  kycStatusDate?: Maybe<Scalars['DateTime']>;
  kycReviewComment?: Maybe<Scalars['String']>;
  kycPrivateComment?: Maybe<Scalars['String']>;
  kycReviewRejectedType?: Maybe<Scalars['String']>;
  kycReviewRejectedLabels?: Maybe<Array<Scalars['String']>>;
  kycReviewResult?: Maybe<Scalars['String']>;
  kycStatusUpdateRequired?: Maybe<Scalars['Boolean']>;
  kycDocs?: Maybe<Array<Scalars['String']>>;
};

export type UserListResult = {
  __typename?: 'UserListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<User>>;
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

export enum UserMode {
  InternalWallet = 'InternalWallet',
  ExternalWallet = 'ExternalWallet',
  OneTimeWallet = 'OneTimeWallet'
}

export type UserNotification = {
  __typename?: 'UserNotification';
  userNotificationId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  userNotificationTypeCode: Scalars['String'];
  userNotificationLevel?: Maybe<UserNotificationLevel>;
  created?: Maybe<Scalars['DateTime']>;
  viewed?: Maybe<Scalars['DateTime']>;
  title?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  linkedId?: Maybe<Scalars['String']>;
  linkedTable?: Maybe<Scalars['String']>;
  params?: Maybe<Scalars['String']>;
};

export enum UserNotificationCodes {
  TestNotification = 'TEST_NOTIFICATION',
  AdminToUserNotification = 'ADMIN_TO_USER_NOTIFICATION',
  TransactionDeclinedAdminNotification = 'TRANSACTION_DECLINED_ADMIN_NOTIFICATION',
  TransactionConfirmation = 'TRANSACTION_CONFIRMATION',
  TransactionStatusChanged = 'TRANSACTION_STATUS_CHANGED',
  KycStatusChanged = 'KYC_STATUS_CHANGED',
  AskTransactionRedo = 'ASK_TRANSACTION_REDO'
}

export enum UserNotificationLevel {
  Request = 'Request',
  Debug = 'Debug',
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error'
}

export type UserNotificationListResult = {
  __typename?: 'UserNotificationListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserNotification>>;
};

export type UserNotificationSubscription = {
  __typename?: 'UserNotificationSubscription';
  userNotificationSubscriptionId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  userNotificationTypeCode: Scalars['String'];
  siteNotification?: Maybe<Scalars['Boolean']>;
  emailNotification?: Maybe<Scalars['Boolean']>;
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

export type UserProfit = {
  __typename?: 'UserProfit';
  userId: Scalars['String'];
  currencyTo?: Maybe<Scalars['String']>;
  period: UserBalanceHistoryPeriod;
  profits?: Maybe<Array<UserCurrencyProfit>>;
};

export type UserProfitInput = {
  currencyTo?: Maybe<Scalars['String']>;
  period: UserBalanceHistoryPeriod;
};

export type UserRole = {
  __typename?: 'UserRole';
  userRoleId?: Maybe<Scalars['String']>;
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
  accountStatus?: Maybe<AccountStatus>;
  kycValid?: Maybe<Scalars['Boolean']>;
  kycStatus?: Maybe<Scalars['String']>;
  kycTierId?: Maybe<Scalars['String']>;
  kycTier?: Maybe<SettingsKycTierShort>;
  kycReviewComment?: Maybe<Scalars['String']>;
  kycDocs?: Maybe<Array<Scalars['String']>>;
  defaultFiatCurrency?: Maybe<Scalars['String']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']>;
  risk?: Maybe<RiskLevel>;
  riskCodes?: Maybe<Array<Scalars['String']>>;
  riskAlertCount?: Maybe<Scalars['Int']>;
  totalTransactionCount?: Maybe<Scalars['Int']>;
  lastLogin?: Maybe<Scalars['DateTime']>;
  data?: Maybe<Scalars['String']>;
};

export type UserState = {
  __typename?: 'UserState';
  date?: Maybe<Scalars['DateTime']>;
  kycProviderLink?: Maybe<Scalars['String']>;
  totalAmountEur?: Maybe<Scalars['Float']>;
  transactionSummary?: Maybe<Array<UserTransactionSummary>>;
  vaults?: Maybe<Array<VaultAccountEx>>;
  fiatVaults?: Maybe<Array<FiatVault>>;
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

export type UserStateInput = {
  currencyTo?: Maybe<Scalars['String']>;
};

export type UserTransactionStats = {
  __typename?: 'UserTransactionStats';
  transactionCount?: Maybe<Scalars['Int']>;
  amount?: Maybe<Scalars['Float']>;
  amountEur?: Maybe<Scalars['Float']>;
  amountFiat?: Maybe<Scalars['Float']>;
};

export enum UserTransactionStatus {
  New = 'New',
  Processing = 'Processing',
  Confirming = 'Confirming',
  Completed = 'Completed',
  Canceled = 'Canceled',
  UnderReview = 'UnderReview',
  Declined = 'Declined',
  SendingError = 'SendingError'
}

export type UserTransactionSummary = {
  __typename?: 'UserTransactionSummary';
  assetId?: Maybe<Scalars['String']>;
  in?: Maybe<UserTransactionStats>;
  out?: Maybe<UserTransactionStats>;
};

export enum UserType {
  Merchant = 'Merchant',
  Personal = 'Personal'
}

export type UserVaultIdObj = {
  __typename?: 'UserVaultIdObj';
  userVaultId: Scalars['ID'];
  userId?: Maybe<Scalars['String']>;
  custodyProvider?: Maybe<Scalars['String']>;
  originalId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  created?: Maybe<Scalars['DateTime']>;
  disabled?: Maybe<Scalars['DateTime']>;
  subWallets?: Maybe<Array<Scalars['String']>>;
  additionalSettings?: Maybe<Scalars['String']>;
};

export type UserVaultIdObjListResult = {
  __typename?: 'UserVaultIdObjListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<UserVaultIdObj>>;
};

export type VaultAccount = {
  __typename?: 'VaultAccount';
  id?: Maybe<Scalars['ID']>;
  userId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  custodyProviderLink?: Maybe<Scalars['String']>;
  rawData?: Maybe<Scalars['String']>;
  assets?: Maybe<Array<VaultAccountAsset>>;
};

export type VaultAccountAsset = {
  __typename?: 'VaultAccountAsset';
  id?: Maybe<Scalars['String']>;
  originalId?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Float']>;
  available?: Maybe<Scalars['Float']>;
  pending?: Maybe<Scalars['Float']>;
  lockedAmount?: Maybe<Scalars['Float']>;
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

export type VaultAccountEx = {
  __typename?: 'VaultAccountEx';
  id?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  custodyProviderLink?: Maybe<Scalars['String']>;
  default?: Maybe<Scalars['Boolean']>;
  rawData?: Maybe<Scalars['String']>;
  assets?: Maybe<Array<VaultAccountAsset>>;
  totalBalanceEur?: Maybe<Scalars['Float']>;
  availableBalanceEur?: Maybe<Scalars['Float']>;
  totalBalanceFiat?: Maybe<Scalars['Float']>;
  availableBalanceFiat?: Maybe<Scalars['Float']>;
  balancesPerAsset?: Maybe<Array<BalancePerAsset>>;
};


export type VaultAccountExAssetsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<OrderBy>>;
};


export enum WalletAssetStatus {
  WaitingForApproval = 'WAITING_FOR_APPROVAL',
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Rejected = 'REJECTED',
  Failed = 'FAILED'
}

export type Widget = {
  __typename?: 'Widget';
  widgetId: Scalars['ID'];
  code: Scalars['String'];
  userId: Scalars['String'];
  userCode?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  createdByUser?: Maybe<User>;
  transactionTypes?: Maybe<Array<TransactionType>>;
  currenciesCrypto?: Maybe<Array<Scalars['String']>>;
  currenciesFiat?: Maybe<Array<Scalars['String']>>;
  destinationAddress?: Maybe<Array<WidgetDestination>>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<Scalars['String']>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  additionalSettings?: Maybe<Scalars['String']>;
  currentUserEmail?: Maybe<Scalars['String']>;
  currentUserParams?: Maybe<Scalars['String']>;
  hasFixedAddress: Scalars['Boolean'];
  secret?: Maybe<Scalars['String']>;
  allowToPayIfKycFailed?: Maybe<Scalars['Boolean']>;
};

export type WidgetDestination = {
  __typename?: 'WidgetDestination';
  currency: Scalars['String'];
  destination: Scalars['String'];
};

export type WidgetDestinationInput = {
  currency: Scalars['String'];
  destination: Scalars['String'];
};

export type WidgetInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  transactionTypes?: Maybe<Array<TransactionType>>;
  currenciesCrypto?: Maybe<Array<Scalars['String']>>;
  currenciesFiat?: Maybe<Array<Scalars['String']>>;
  destinationAddress?: Maybe<Array<Maybe<WidgetDestinationInput>>>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<Scalars['String']>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  additionalSettings?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  allowToPayIfKycFailed?: Maybe<Scalars['Boolean']>;
};

export type WidgetListResult = {
  __typename?: 'WidgetListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<Widget>>;
};

export type WidgetShort = {
  __typename?: 'WidgetShort';
  widgetId: Scalars['ID'];
  code: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  transactionTypes?: Maybe<Array<TransactionType>>;
  currenciesCrypto?: Maybe<Array<Scalars['String']>>;
  currenciesFiat?: Maybe<Array<Scalars['String']>>;
  hasFixedAddress: Scalars['Boolean'];
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<Scalars['String']>>;
  additionalSettings?: Maybe<Scalars['String']>;
  currentUserEmail?: Maybe<Scalars['String']>;
  allowToPayIfKycFailed?: Maybe<Scalars['Boolean']>;
};

export type WidgetUpdateInput = {
  name: Scalars['String'];
  userId: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  transactionTypes?: Maybe<Array<TransactionType>>;
  currenciesCrypto?: Maybe<Array<Scalars['String']>>;
  currenciesFiat?: Maybe<Array<Scalars['String']>>;
  destinationAddress?: Maybe<Array<Maybe<WidgetDestinationInput>>>;
  countriesCode2?: Maybe<Array<Scalars['String']>>;
  instruments?: Maybe<Array<PaymentInstrument>>;
  paymentProviders?: Maybe<Array<Scalars['String']>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  additionalSettings?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  allowToPayIfKycFailed?: Maybe<Scalars['Boolean']>;
};

export type WidgetUserParams = {
  __typename?: 'WidgetUserParams';
  widgetUserParamsId?: Maybe<Scalars['ID']>;
  widgetId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  params?: Maybe<Scalars['String']>;
};

export type WidgetUserParamsInput = {
  widgetId: Scalars['String'];
  userEmail: Scalars['String'];
  params?: Maybe<Scalars['String']>;
};

export type WireTransferBankAccount = {
  __typename?: 'WireTransferBankAccount';
  bankAccountId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  au?: Maybe<Scalars['String']>;
  uk?: Maybe<Scalars['String']>;
  eu?: Maybe<Scalars['String']>;
  openpayd?: Maybe<Scalars['Boolean']>;
  flashfx?: Maybe<Scalars['Boolean']>;
  openpaydObject?: Maybe<Scalars['String']>;
  flashfxObject?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type WireTransferBankAccountInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  au?: Maybe<Scalars['String']>;
  uk?: Maybe<Scalars['String']>;
  eu?: Maybe<Scalars['String']>;
  openpayd?: Maybe<Scalars['Boolean']>;
  flashfx?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['DateTime']>;
};

export type WireTransferBankAccountListResult = {
  __typename?: 'WireTransferBankAccountListResult';
  count?: Maybe<Scalars['Int']>;
  list?: Maybe<Array<WireTransferBankAccount>>;
};

export type WireTransferBankAccountShort = {
  __typename?: 'WireTransferBankAccountShort';
  bankAccountId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  au?: Maybe<Scalars['String']>;
  uk?: Maybe<Scalars['String']>;
  eu?: Maybe<Scalars['String']>;
  openpaydObject?: Maybe<Scalars['String']>;
  openpayd?: Maybe<Scalars['Boolean']>;
  flashfxObject?: Maybe<Scalars['String']>;
  flashfx?: Maybe<Scalars['Boolean']>;
};

export type LiquidityProviderBalance = {
  __typename?: 'liquidityProviderBalance';
  currency?: Maybe<Scalars['String']>;
  balance?: Maybe<Scalars['Float']>;
};
