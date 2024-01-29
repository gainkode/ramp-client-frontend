export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Byte: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Void: { input: any; output: any; }
};

export enum AccountStatus {
  Banned = 'Banned',
  Closed = 'Closed',
  Live = 'Live',
  Suspended = 'Suspended'
}

export enum AdminTransactionStatus {
  Abandoned = 'Abandoned',
  AddressDeclined = 'AddressDeclined',
  BenchmarkTransferDeclined = 'BenchmarkTransferDeclined',
  Canceled = 'Canceled',
  Chargeback = 'Chargeback',
  Completed = 'Completed',
  Confirming = 'Confirming',
  ExchangeDeclined = 'ExchangeDeclined',
  Exchanging = 'Exchanging',
  KycDeclined = 'KycDeclined',
  New = 'New',
  Paid = 'Paid',
  PaymentDeclined = 'PaymentDeclined',
  Pending = 'Pending',
  Refund = 'Refund',
  TransferDeclined = 'TransferDeclined'
}

export type ApiKey = {
  __typename?: 'ApiKey';
  apiKeyId: Scalars['ID']['output'];
  created: Scalars['DateTime']['output'];
  disabled?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type ApiKeyListResult = {
  __typename?: 'ApiKeyListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<ApiKey>>;
};

export type ApiKeySecret = {
  __typename?: 'ApiKeySecret';
  apiKeyId: Scalars['ID']['output'];
  created: Scalars['DateTime']['output'];
  disabled?: Maybe<Scalars['DateTime']['output']>;
  secret: Scalars['String']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type AppropriateRecord = {
  __typename?: 'AppropriateRecord';
  appropriateDetails?: Maybe<Scalars['String']['output']>;
  appropriateId?: Maybe<Scalars['ID']['output']>;
  appropriateObjectId?: Maybe<Scalars['String']['output']>;
  appropriateType?: Maybe<AppropriateType>;
  created?: Maybe<Scalars['DateTime']['output']>;
  requestParams?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type AppropriateRecordListResult = {
  __typename?: 'AppropriateRecordListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<AppropriateRecord>>;
};

export enum AppropriateType {
  CostScheme = 'costScheme',
  FeeScheme = 'feeScheme',
  KycScheme = 'kycScheme',
  KycTier = 'kycTier',
  PaymentProvider = 'paymentProvider'
}

export type AssetAddress = {
  __typename?: 'AssetAddress';
  address?: Maybe<Scalars['String']['output']>;
  addressFormat?: Maybe<Scalars['String']['output']>;
  assetId?: Maybe<Scalars['String']['output']>;
  available?: Maybe<Scalars['Float']['output']>;
  availableEur?: Maybe<Scalars['Float']['output']>;
  availableFiat?: Maybe<Scalars['Float']['output']>;
  custodyProvider?: Maybe<Scalars['String']['output']>;
  custodyProviderLink?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  legacyAddress?: Maybe<Scalars['String']['output']>;
  lockedAmount?: Maybe<Scalars['Float']['output']>;
  originalId?: Maybe<Scalars['String']['output']>;
  pending?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  totalEur?: Maybe<Scalars['Float']['output']>;
  totalFiat?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userEmail?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  vaultId?: Maybe<Scalars['String']['output']>;
  vaultName?: Maybe<Scalars['String']['output']>;
  vaultOriginalId?: Maybe<Scalars['String']['output']>;
};

export type AssetAddressListResult = {
  __typename?: 'AssetAddressListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<AssetAddress>>;
};

export type AssetAddressShort = {
  __typename?: 'AssetAddressShort';
  address?: Maybe<Scalars['String']['output']>;
  addressFormat?: Maybe<Scalars['String']['output']>;
  assetId?: Maybe<Scalars['String']['output']>;
  available?: Maybe<Scalars['Float']['output']>;
  availableEur?: Maybe<Scalars['Float']['output']>;
  availableFiat?: Maybe<Scalars['Float']['output']>;
  custodyProvider?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  legacyAddress?: Maybe<Scalars['String']['output']>;
  lockedAmount?: Maybe<Scalars['Float']['output']>;
  originalId?: Maybe<Scalars['String']['output']>;
  pending?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  totalEur?: Maybe<Scalars['Float']['output']>;
  totalFiat?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  vaultId?: Maybe<Scalars['String']['output']>;
  vaultName?: Maybe<Scalars['String']['output']>;
  vaultOriginalId?: Maybe<Scalars['String']['output']>;
};

export type AssetAddressShortListResult = {
  __typename?: 'AssetAddressShortListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<AssetAddressShort>>;
};

export type BalancePerAsset = {
  __typename?: 'BalancePerAsset';
  assetId: Scalars['String']['output'];
  availableBalance: Scalars['Float']['output'];
  availableBalanceEur: Scalars['Float']['output'];
  availableBalanceFiat: Scalars['Float']['output'];
  totalBalance: Scalars['Float']['output'];
  totalBalanceEur: Scalars['Float']['output'];
  totalBalanceFiat: Scalars['Float']['output'];
};

export type BalanceStats = {
  __typename?: 'BalanceStats';
  currency?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<TransactionStatsVolume>;
};

export type BankCategory = {
  __typename?: 'BankCategory';
  countryCode?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id?: Maybe<WireTransferPaymentCategory>;
  instrument?: Maybe<Array<Maybe<PaymentInstrument>>>;
  title?: Maybe<Scalars['String']['output']>;
  transactionSource?: Maybe<Array<Maybe<TransactionSource>>>;
  transactionType?: Maybe<Array<Maybe<TransactionType>>>;
};

export type BankDetails = {
  __typename?: 'BankDetails';
  bankDetailsId: Scalars['ID']['output'];
  created: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  disabled?: Maybe<Scalars['DateTime']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
};

export type BankDetailsListResult = {
  __typename?: 'BankDetailsListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<BankDetails>>;
};

export type BankDetailsObject = {
  __typename?: 'BankDetailsObject';
  accountName?: Maybe<Scalars['String']['output']>;
  bankAccountHolderName?: Maybe<Scalars['String']['output']>;
  bankAccountName?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankAddress?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  beneficiaryAddress?: Maybe<Scalars['String']['output']>;
  beneficiaryName?: Maybe<Scalars['String']['output']>;
  bsb?: Maybe<Scalars['String']['output']>;
  creditTo?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  depositoryBankName?: Maybe<Scalars['String']['output']>;
  iban?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  payInReference?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['Boolean']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  routingNumber?: Maybe<Scalars['String']['output']>;
  sortCode?: Maybe<Scalars['String']['output']>;
  swiftBic?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type BaseStat = {
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
};

export enum BitcoinAddressFormats {
  Legacy = 'LEGACY',
  Segwit = 'SEGWIT'
}

export type BlackCountry = {
  __typename?: 'BlackCountry';
  countryCode2: Scalars['ID']['output'];
  created?: Maybe<Scalars['DateTime']['output']>;
};

export type BlackCountryListResult = {
  __typename?: 'BlackCountryListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<BlackCountry>>;
};

export type BuyOrSellStats = BaseStat & {
  __typename?: 'BuyOrSellStats';
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byInstruments?: Maybe<Array<InstrumentStats>>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  fee?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
};

export type Callback = {
  __typename?: 'Callback';
  callbackId?: Maybe<Scalars['ID']['output']>;
  created?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  objectId?: Maybe<Scalars['String']['output']>;
  params?: Maybe<Scalars['String']['output']>;
  payload?: Maybe<Scalars['String']['output']>;
  response?: Maybe<Scalars['String']['output']>;
  responseStatusCode?: Maybe<Scalars['String']['output']>;
  status?: Maybe<CallbackStatus>;
  type?: Maybe<CallbackType>;
  url?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  widgetUserParamsId?: Maybe<Scalars['String']['output']>;
};

export type CallbackResultList = {
  __typename?: 'CallbackResultList';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Callback>>;
};

export enum CallbackStatus {
  Completed = 'completed',
  Failed = 'failed',
  Pending = 'pending',
  Unknown = 'unknown'
}

export enum CallbackType {
  ExternalAu10tixCallback = 'externalAu10tixCallback',
  ExternalCoriunderCallback = 'externalCoriunderCallback',
  ExternalFibonatixCallback = 'externalFibonatixCallback',
  ExternalFireblocksCallback = 'externalFireblocksCallback',
  ExternalFlashfxCallback = 'externalFlashfxCallback',
  ExternalGetcoinsCallback = 'externalGetcoinsCallback',
  ExternalMonoovaCallback = 'externalMonoovaCallback',
  ExternalNppCallback = 'externalNppCallback',
  ExternalOpenpaydCallback = 'externalOpenpaydCallback',
  ExternalPrimetrustCallback = 'externalPrimetrustCallback',
  ExternalSendgridCallback = 'externalSendgridCallback',
  ExternalSuftiCallback = 'externalSuftiCallback',
  ExternalSumsubCallback = 'externalSumsubCallback',
  ExternalYapilyAuthCallback = 'externalYapilyAuthCallback',
  ExternalYapilyCallback = 'externalYapilyCallback',
  ExternalYapilyQrcodeCallback = 'externalYapilyQrcodeCallback',
  TransactionStatusChanged = 'transactionStatusChanged',
  TransactionStatusChangedAdmin = 'transactionStatusChangedAdmin',
  UserVerificationChanged = 'userVerificationChanged'
}

export type CheckOrCreateDestinationAddressResult = {
  __typename?: 'CheckOrCreateDestinationAddressResult';
  destVaultId?: Maybe<Scalars['String']['output']>;
  destination?: Maybe<Scalars['String']['output']>;
};

export type CheckOrCreateSourceAddressResult = {
  __typename?: 'CheckOrCreateSourceAddressResult';
  sourceAddress?: Maybe<Scalars['String']['output']>;
  sourceVaultId?: Maybe<Scalars['String']['output']>;
};

export type CoriunderWebAuthParams = {
  __typename?: 'CoriunderWebAuthParams';
  PLID?: Maybe<Scalars['String']['output']>;
  amount_options?: Maybe<Scalars['String']['output']>;
  client_billAddress1?: Maybe<Scalars['String']['output']>;
  client_billAddress2?: Maybe<Scalars['String']['output']>;
  client_billCity?: Maybe<Scalars['String']['output']>;
  client_billCountry?: Maybe<Scalars['String']['output']>;
  client_billState?: Maybe<Scalars['String']['output']>;
  client_billZipcode?: Maybe<Scalars['String']['output']>;
  client_email?: Maybe<Scalars['String']['output']>;
  client_fullName?: Maybe<Scalars['String']['output']>;
  client_idNum?: Maybe<Scalars['String']['output']>;
  client_phoneNum?: Maybe<Scalars['String']['output']>;
  disp_lng?: Maybe<Scalars['String']['output']>;
  disp_lngList?: Maybe<Scalars['String']['output']>;
  disp_mobile?: Maybe<Scalars['String']['output']>;
  disp_payFor?: Maybe<Scalars['String']['output']>;
  disp_paymentType?: Maybe<Scalars['String']['output']>;
  disp_recurring?: Maybe<Scalars['Int']['output']>;
  hashtype?: Maybe<Scalars['Int']['output']>;
  merchantID?: Maybe<Scalars['String']['output']>;
  notification_url?: Maybe<Scalars['String']['output']>;
  show_edit?: Maybe<Scalars['String']['output']>;
  show_marketing?: Maybe<Scalars['String']['output']>;
  signature?: Maybe<Scalars['String']['output']>;
  terms_url?: Maybe<Scalars['String']['output']>;
  trans_amount?: Maybe<Scalars['Float']['output']>;
  trans_comment?: Maybe<Scalars['String']['output']>;
  trans_currency?: Maybe<Scalars['String']['output']>;
  trans_installments?: Maybe<Scalars['Float']['output']>;
  trans_refNum?: Maybe<Scalars['String']['output']>;
  trans_storePm?: Maybe<Scalars['Float']['output']>;
  trans_type?: Maybe<Scalars['Int']['output']>;
  ui_version?: Maybe<Scalars['Int']['output']>;
  url_redirect?: Maybe<Scalars['String']['output']>;
};

export enum CountryCodeType {
  Code2 = 'code2',
  Code3 = 'code3'
}

export type CreateLiquidityExchangeOrderParams = {
  amountToReceive?: InputMaybe<Scalars['Float']['input']>;
  amountToSpend?: InputMaybe<Scalars['Float']['input']>;
  currencyToReceive?: InputMaybe<Scalars['String']['input']>;
  currencyToSpend?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['Float']['input']>;
  side?: InputMaybe<LiquidityExchangeOrderSide>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<LiquidityExchangeOrderType>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTransferOrderParams = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  benchmarkTransfer?: InputMaybe<Scalars['Boolean']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  destination?: InputMaybe<Scalars['String']['input']>;
  estimatingFee?: InputMaybe<Scalars['Float']['input']>;
  providerName?: InputMaybe<Scalars['String']['input']>;
  sourceAddress?: InputMaybe<Scalars['String']['input']>;
  sourceVaultAccountId?: InputMaybe<SourceVaultAccountIdObject>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
  treatAsGrossAmount?: InputMaybe<Scalars['Boolean']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type CryptoInvoice = {
  __typename?: 'CryptoInvoice';
  amountToReceive?: Maybe<Scalars['Float']['output']>;
  amountToSend?: Maybe<Scalars['Float']['output']>;
  created?: Maybe<Scalars['String']['output']>;
  cryptoInvoiceId?: Maybe<Scalars['ID']['output']>;
  currencyToReceive?: Maybe<Scalars['String']['output']>;
  currencyToSend?: Maybe<Scalars['String']['output']>;
  destination?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rate?: Maybe<Scalars['Float']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  vaultId?: Maybe<Scalars['String']['output']>;
  widgetId?: Maybe<Scalars['String']['output']>;
  widgetUserParamsId?: Maybe<Scalars['String']['output']>;
};

export type CryptoInvoiceCreationResult = {
  __typename?: 'CryptoInvoiceCreationResult';
  convertedAmount?: Maybe<Scalars['Float']['output']>;
  convertedCurrency?: Maybe<Scalars['String']['output']>;
  invoice?: Maybe<CryptoInvoice>;
  rate?: Maybe<Scalars['Float']['output']>;
};

export type CryptoInvoiceListResult = {
  __typename?: 'CryptoInvoiceListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<CryptoInvoice>>;
};

export enum CurrencyBlockchain {
  Avalanche = 'AVALANCHE',
  Bsc = 'BSC',
  Cardano = 'CARDANO',
  Eos = 'EOS',
  Ethereum = 'ETHEREUM',
  Polkadot = 'POLKADOT',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

export type CurrencyPairLiquidityProvider = {
  __typename?: 'CurrencyPairLiquidityProvider';
  currencyPairLiquidityProviderId: Scalars['String']['output'];
  deleted?: Maybe<Scalars['String']['output']>;
  fixedRate?: Maybe<Scalars['Float']['output']>;
  fromCurrency: Scalars['String']['output'];
  liquidityProviderId: Scalars['String']['output'];
  liquidityProviderName: Scalars['String']['output'];
  toCurrency: Scalars['String']['output'];
};

export type CurrencyPairLiquidityProvidersListResult = {
  __typename?: 'CurrencyPairLiquidityProvidersListResult';
  count: Scalars['Int']['output'];
  list: Array<CurrencyPairLiquidityProvider>;
};

export enum CustodyProvider {
  Fireblocks = 'Fireblocks',
  PrimeTrustCustody = 'PrimeTrustCustody'
}

export type CustodyWithdrawalOrderInfo = {
  __typename?: 'CustodyWithdrawalOrderInfo';
  created?: Maybe<Scalars['DateTime']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  feeCurrency?: Maybe<Scalars['Float']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transferHash?: Maybe<Scalars['String']['output']>;
};

export type DashboardMerchantStats = {
  __typename?: 'DashboardMerchantStats';
  currency?: Maybe<Scalars['String']['output']>;
  transactionsAmount?: Maybe<Scalars['Float']['output']>;
  transactionsTotal?: Maybe<Scalars['Int']['output']>;
  usersKycWaitingTotal?: Maybe<Scalars['Int']['output']>;
  usersTotal?: Maybe<Scalars['Int']['output']>;
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  balances?: Maybe<Array<BalanceStats>>;
  buys?: Maybe<BuyOrSellStats>;
  deposits?: Maybe<DepositOrWithdrawalStats>;
  exchanges?: Maybe<ExchangeStats>;
  liquidityProviderBalances?: Maybe<Array<Maybe<LiquidityProviderBalance>>>;
  monoovaBalances?: Maybe<Array<MonoovaProviderBalance>>;
  openpaydBalances?: Maybe<Array<OpenpaydProviderBalance>>;
  receives?: Maybe<TransferStats>;
  sells?: Maybe<BuyOrSellStats>;
  transfers?: Maybe<TransferStats>;
  withdrawals?: Maybe<DepositOrWithdrawalStats>;
};

export type DateMap = {
  __typename?: 'DateMap';
  date: Scalars['DateTime']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type DateTimeInterval = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeletedVaultAccount = {
  __typename?: 'DeletedVaultAccount';
  custodyProvider: Scalars['String']['output'];
  deleted?: Maybe<Scalars['DateTime']['output']>;
  deletedVaultAccountId?: Maybe<Scalars['ID']['output']>;
  userId: Scalars['String']['output'];
  vaultAccountId: Scalars['String']['output'];
};

export type DepositAddress = {
  __typename?: 'DepositAddress';
  address: Scalars['String']['output'];
  addressFormat?: Maybe<Scalars['String']['output']>;
  assetId: Scalars['String']['output'];
  customerRefId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type DepositOrWithdrawalStats = BaseStat & {
  __typename?: 'DepositOrWithdrawalStats';
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byInstruments?: Maybe<Array<InstrumentStats>>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  fee?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
};

export enum EntityType {
  Transaction = 'Transaction',
  User = 'User'
}

export type Error = {
  __typename?: 'Error';
  code?: Maybe<Scalars['Int']['output']>;
  created?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  errorId?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type ExchangeStats = BaseStat & {
  __typename?: 'ExchangeStats';
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  fee?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
  toCustomer?: Maybe<MerchantOrCustomerStats>;
  toMerchant?: Maybe<MerchantOrCustomerStats>;
};

export type ExternalWallet = {
  __typename?: 'ExternalWallet';
  assets?: Maybe<Array<ExternalWalletAsset>>;
  customerRefId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ExternalWalletAsset = {
  __typename?: 'ExternalWalletAsset';
  activationTime?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  status?: Maybe<WalletAssetStatus>;
  tag?: Maybe<Scalars['String']['output']>;
};

export type ExternalWalletAssetShort = {
  __typename?: 'ExternalWalletAssetShort';
  address?: Maybe<Scalars['String']['output']>;
  status?: Maybe<WalletAssetStatus>;
};

export type Feedback = {
  __typename?: 'Feedback';
  created?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  feedbackId: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type FeedbackInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type FeedbackListResult = {
  __typename?: 'FeedbackListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Feedback>>;
};

export type FiatProvider = {
  __typename?: 'FiatProvider';
  countriesCode2?: Maybe<Array<Scalars['String']['output']>>;
  currencies?: Maybe<Array<Scalars['String']['output']>>;
  default?: Maybe<Scalars['Boolean']['output']>;
  disabled?: Maybe<Scalars['DateTime']['output']>;
  fiatProviderId?: Maybe<Scalars['ID']['output']>;
  instruments?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  source?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  transactionTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  userTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type FiatVault = {
  __typename?: 'FiatVault';
  balance?: Maybe<Scalars['Float']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  fiatVaultId?: Maybe<Scalars['ID']['output']>;
  generalBalance?: Maybe<Scalars['Float']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type FiatVaultListResult = {
  __typename?: 'FiatVaultListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<FiatVault>>;
};

export type FiatVaultUser = {
  __typename?: 'FiatVaultUser';
  user?: Maybe<User>;
  vault?: Maybe<FiatVault>;
};

export type FiatVaultUserListResult = {
  __typename?: 'FiatVaultUserListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<FiatVaultUser>>;
};

export type File = {
  __typename?: 'File';
  encoding?: Maybe<Scalars['String']['output']>;
  fileSize?: Maybe<Scalars['Float']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  originFileName: Scalars['String']['output'];
  path: Scalars['String']['output'];
  type: FileType;
};

export type FileInfo = {
  order?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<FileType>;
};

export enum FileType {
  KycDocument = 'KYC_DOCUMENT',
  LandingPageImage = 'LANDING_PAGE_IMAGE',
  Other = 'OTHER',
  SupportTicket = 'SUPPORT_TICKET',
  UserAvatar = 'USER_AVATAR',
  WidgetPageImage = 'WIDGET_PAGE_IMAGE'
}

export enum FireblocksTransactionStatus {
  Blocked = 'BLOCKED',
  Broadcasting = 'BROADCASTING',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirming = 'CONFIRMING',
  Failed = 'FAILED',
  PartiallyCompleted = 'PARTIALLY_COMPLETED',
  Pending_3RdParty = 'PENDING_3RD_PARTY',
  Pending_3RdPartyManualApproval = 'PENDING_3RD_PARTY_MANUAL_APPROVAL',
  PendingAmlScreening = 'PENDING_AML_SCREENING',
  PendingAuthorization = 'PENDING_AUTHORIZATION',
  PendingSignature = 'PENDING_SIGNATURE',
  Queued = 'QUEUED',
  Rejected = 'REJECTED',
  Submitted = 'SUBMITTED'
}

export enum Gender {
  F = 'F',
  M = 'M',
  O = 'O'
}

export type GetCoriunderWebAuthResult = {
  __typename?: 'GetCoriunderWebAuthResult';
  full_url?: Maybe<Scalars['String']['output']>;
  params?: Maybe<CoriunderWebAuthParams>;
  paramsString?: Maybe<Scalars['String']['output']>;
  signature?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type GetRates = {
  __typename?: 'GetRates';
  currenciesFrom?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  currencyTo?: Maybe<Scalars['String']['output']>;
  withFactor?: Maybe<Scalars['Boolean']['output']>;
};

export type InstitutionCountry = {
  __typename?: 'InstitutionCountry';
  countryCode2?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
};

export type InstrumentStats = BaseStat & {
  __typename?: 'InstrumentStats';
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  fee?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  instrument?: Maybe<PaymentInstrument>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
};

export type InternalWallet = {
  __typename?: 'InternalWallet';
  assets?: Maybe<Array<InternalWalletAsset>>;
  customerRefId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type InternalWalletAsset = {
  __typename?: 'InternalWalletAsset';
  activationTime?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  balance?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  lockedAmount?: Maybe<Scalars['String']['output']>;
  status?: Maybe<WalletAssetStatus>;
  tag?: Maybe<Scalars['String']['output']>;
};

export type InternalWalletAssetShort = {
  __typename?: 'InternalWalletAssetShort';
  address?: Maybe<Scalars['String']['output']>;
  balance?: Maybe<Scalars['String']['output']>;
  lockedAmount?: Maybe<Scalars['String']['output']>;
  status?: Maybe<WalletAssetStatus>;
};

export type KycApplicant = {
  __typename?: 'KycApplicant';
  birthday?: Maybe<Scalars['DateTime']['output']>;
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Array<StringMap>>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type KycAppliedDocument = {
  __typename?: 'KycAppliedDocument';
  code: Scalars['String']['output'];
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Array<StringMap>>;
  firstName?: Maybe<Scalars['String']['output']>;
  issuedDate?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  validUntil?: Maybe<Scalars['String']['output']>;
};

export type KycDocumentSubSubType = {
  __typename?: 'KycDocumentSubSubType';
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Scalars['String']['output']>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type KycDocumentSubType = {
  __typename?: 'KycDocumentSubType';
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Scalars['String']['output']>>;
  subTypes?: Maybe<Array<KycDocumentSubSubType>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type KycDocumentType = {
  __typename?: 'KycDocumentType';
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Scalars['String']['output']>>;
  subTypes?: Maybe<Array<KycDocumentSubType>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type KycInfo = {
  __typename?: 'KycInfo';
  applicant?: Maybe<KycApplicant>;
  appliedDocuments?: Maybe<Array<KycAppliedDocument>>;
  levelName?: Maybe<Scalars['String']['output']>;
  requiredInfo?: Maybe<KycRequiredInfo>;
};

export type KycInfoField = {
  __typename?: 'KycInfoField';
  name?: Maybe<Scalars['String']['output']>;
  required?: Maybe<Scalars['Boolean']['output']>;
};

export enum KycProvider {
  Au10tix = 'Au10tix',
  Local = 'Local',
  Shufti = 'Shufti',
  SumSub = 'SumSub'
}

export type KycRejectedLabel = {
  __typename?: 'KycRejectedLabel';
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type KycRequiredInfo = {
  __typename?: 'KycRequiredInfo';
  documents?: Maybe<Array<KycDocumentType>>;
  fields?: Maybe<Array<KycInfoField>>;
};

export enum KycServiceNotificationType {
  KycCompleted = 'KycCompleted',
  KycStatusChanged = 'KycStatusChanged'
}

export enum KycStatus {
  Canceled = 'canceled',
  Completed = 'completed',
  Deleted = 'deleted',
  Init = 'init',
  Invalid = 'invalid',
  NotFound = 'notFound',
  OnHold = 'onHold',
  Pending = 'pending',
  Queued = 'queued',
  Timeout = 'timeout',
  Unknown = 'unknown',
  Waiting = 'waiting'
}

export enum LiquidityDepositOrderStatus {
  Failure = 'FAILURE',
  Initial = 'INITIAL',
  Partial = 'PARTIAL',
  Pending = 'PENDING',
  Settled = 'SETTLED',
  Success = 'SUCCESS'
}

export type LiquidityExchangeOrder = {
  __typename?: 'LiquidityExchangeOrder';
  created: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  executed?: Maybe<Scalars['DateTime']['output']>;
  executingResult?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  provider: LiquidityProvider;
  providerSpecificParams?: Maybe<Array<StringMap>>;
  providerSpecificStates?: Maybe<Array<DateMap>>;
  published?: Maybe<Scalars['DateTime']['output']>;
  publishingResult?: Maybe<Scalars['String']['output']>;
  side: LiquidityExchangeOrderSide;
  state: LiquidityExchangeOrderState;
  status: Scalars['String']['output'];
  statusReason?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
  type: LiquidityExchangeOrderType;
  userId?: Maybe<Scalars['String']['output']>;
  volume: Scalars['Float']['output'];
};

export type LiquidityExchangeOrderInfo = {
  __typename?: 'LiquidityExchangeOrderInfo';
  created?: Maybe<Scalars['DateTime']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export enum LiquidityExchangeOrderSide {
  Buy = 'Buy',
  Sell = 'Sell'
}

export enum LiquidityExchangeOrderState {
  Canceled = 'Canceled',
  Created = 'Created',
  Executed = 'Executed',
  Failed = 'Failed',
  Published = 'Published'
}

export enum LiquidityExchangeOrderType {
  Instant = 'Instant',
  Limit = 'Limit',
  Market = 'Market'
}

export enum LiquidityProvider {
  Binance = 'Binance',
  Bitstamp = 'Bitstamp',
  GetCoins = 'GetCoins',
  Kraken = 'Kraken',
  PrimeTrustLiquidity = 'PrimeTrustLiquidity',
  Xbo = 'Xbo'
}

export type LiquidityProviderEntity = {
  __typename?: 'LiquidityProviderEntity';
  liquidityProviderId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
};

export type LiquidityWithdrawalOrderInfo = {
  __typename?: 'LiquidityWithdrawalOrderInfo';
  created?: Maybe<Scalars['DateTime']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  feeCurrency?: Maybe<Scalars['Float']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transferHash?: Maybe<Scalars['String']['output']>;
};

export type LiquidityWithdrawalPotentialFeeInfo = {
  __typename?: 'LiquidityWithdrawalPotentialFeeInfo';
  data?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  limit?: Maybe<Scalars['Float']['output']>;
};

export type LoginResult = {
  __typename?: 'LoginResult';
  authToken?: Maybe<Scalars['String']['output']>;
  authTokenAction?: Maybe<Scalars['String']['output']>;
  authTokenActionParam?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type MerchantOrCustomerStats = BaseStat & {
  __typename?: 'MerchantOrCustomerStats';
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  fee?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  instrument?: Maybe<PaymentInstrument>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
};

export type Message = {
  __typename?: 'Message';
  created?: Maybe<Scalars['String']['output']>;
  messageEmailId?: Maybe<Scalars['String']['output']>;
  messageId: Scalars['ID']['output'];
  messageStatus?: Maybe<Scalars['String']['output']>;
  messageType?: Maybe<Scalars['String']['output']>;
  objectId?: Maybe<Scalars['String']['output']>;
  params?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
  userNotificationId?: Maybe<Scalars['String']['output']>;
};

export type MessageListResult = {
  __typename?: 'MessageListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Message>>;
};

export enum MessageType {
  AdminToUserNotification = 'ADMIN_TO_USER_NOTIFICATION',
  BankDepositInvoice = 'BANK_DEPOSIT_INVOICE',
  DeclinedTransactionAdminNotification = 'DECLINED_TRANSACTION_ADMIN_NOTIFICATION',
  DeviceConfirmation = 'DEVICE_CONFIRMATION',
  EmailConfirmationWithCode = 'EMAIL_CONFIRMATION_WITH_CODE',
  EmailConfirmationWithLink = 'EMAIL_CONFIRMATION_WITH_LINK',
  File = 'FILE',
  KycStatusChanged = 'KYC_STATUS_CHANGED',
  PasswordChangingConfirmation = 'PASSWORD_CHANGING_CONFIRMATION',
  PasswordResetConfirmation = 'PASSWORD_RESET_CONFIRMATION',
  SystemUserCredentialsConfirmation = 'SYSTEM_USER_CREDENTIALS_CONFIRMATION',
  TransactionConfirmationCode = 'TRANSACTION_CONFIRMATION_CODE',
  TransactionRedoRequest = 'TRANSACTION_REDO_REQUEST',
  TransactionStatusChanged = 'TRANSACTION_STATUS_CHANGED'
}

export type MonoovaProviderBalance = {
  __typename?: 'MonoovaProviderBalance';
  balance?: Maybe<Scalars['Float']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** This endpoint can be used to abandon a crypto invoice */
  abandonCryptoInvoice?: Maybe<CryptoInvoice>;
  /** This endpoint can be used to abandon a transaction */
  abandonTransaction?: Maybe<TransactionShort>;
  /** Add an asset to a vault account */
  addAssetToVaultAccount?: Maybe<VaultAccount>;
  addBankAccount?: Maybe<UserBankAccount>;
  addBlackCountry?: Maybe<BlackCountry>;
  addFeedback: Feedback;
  /** Not used */
  addFiatVault?: Maybe<FiatVault>;
  addMyBankAccount?: Maybe<UserBankAccount>;
  addMyContact?: Maybe<UserContact>;
  /** This endpoint can be used to add a current user's wallet. */
  addMyVault?: Maybe<VaultAccount>;
  /** This endpoint can be used to add user params. */
  addMyWidgetUserParams?: Maybe<WidgetUserParams>;
  addSettingsCost: SettingsCost;
  addSettingsFee: SettingsFee;
  addSettingsKyc: SettingsKyc;
  addSettingsKycLevel: SettingsKycLevel;
  addSettingsKycTier: Scalars['Boolean']['output'];
  /** This endpoint can be used to add a user's wallet. */
  addUserVault?: Maybe<VaultAccount>;
  addWireTransferBankAccount: WireTransferBankAccount;
  assignCostToFees?: Maybe<Array<Maybe<SettingsFee>>>;
  assignRole?: Maybe<User>;
  /** This endpoint to recalculate the invoice with current rate */
  calculateInvoice?: Maybe<CryptoInvoiceCreationResult>;
  /** This endpoint can be used to cancel a transaction for the current user */
  cancelMyTransaction?: Maybe<TransactionShort>;
  /** This endpoint can be used to cancel a transaction */
  cancelTransaction?: Maybe<Transaction>;
  captureFull: PaymentOrder;
  changeMyKycTier?: Maybe<User>;
  changePassword: Scalars['Boolean']['output'];
  changeUserKycTier?: Maybe<User>;
  companyLevelVerification?: Maybe<User>;
  confirmDevice: Scalars['Boolean']['output'];
  confirmEmail: Scalars['Boolean']['output'];
  confirmUserDevice: Scalars['Boolean']['output'];
  confirmUserEmail: Scalars['Boolean']['output'];
  /** Create account if not exists */
  createAccount?: Maybe<Scalars['String']['output']>;
  createApmPayment: PaymentApmResult;
  /** This endpoint can be used to create an order to withdraw from custody provider */
  createCustodyWithdrawalOrder?: Maybe<TransferOrder>;
  /** This endpoint can be used to create a crypto invoice */
  createInvoice?: Maybe<CryptoInvoiceCreationResult>;
  /** This endpoint can be used to create a liquidity exchange order */
  createLiquidityExchangeOrder?: Maybe<LiquidityExchangeOrder>;
  /** This endpoint can be used to create an order to withdraw from liquidity provider */
  createLiquidityWithdrawalOrder?: Maybe<TransferOrder>;
  /** This endpoint can be used to create a merchant transaction */
  createMerchantTransaction?: Maybe<TransactionShort>;
  createMyApiKey?: Maybe<ApiKeySecret>;
  /** This endpoint can be used to create a widget for the current user. */
  createMyWidget?: Maybe<Widget>;
  createPaymentProviderPayout: Scalars['Boolean']['output'];
  createPaymentProviderRefund: Scalars['Boolean']['output'];
  /** This endpoint can be used to create a transaction */
  createTransaction?: Maybe<TransactionShort>;
  createUser?: Maybe<User>;
  createUserApiKey?: Maybe<ApiKeySecret>;
  /** This endpoint can be used to create a transaction in behalf of a user */
  createUserTransaction?: Maybe<TransactionShort>;
  /** Create new vault account */
  createVaultAccount?: Maybe<VaultAccount>;
  /** This endpoint can be used to create a widget. */
  createWidget?: Maybe<Widget>;
  delCurrencyPairLiquidityProvider: CurrencyPairLiquidityProvider;
  deleteBankAccount?: Maybe<UserBankAccount>;
  deleteBlackCountry?: Maybe<BlackCountry>;
  deleteDevice?: Maybe<UserDeviceListResult>;
  deleteFiatVault?: Maybe<FiatVault>;
  deleteMyApiKey?: Maybe<ApiKey>;
  deleteMyBankAccount?: Maybe<UserBankAccount>;
  deleteMyContact?: Maybe<UserContact>;
  deleteMyDevice?: Maybe<UserDeviceListResult>;
  deleteMyNotifications?: Maybe<Array<UserNotification>>;
  /** This endpoint can be used to delete the current user's wallet. */
  deleteMyVault?: Maybe<UserVaultIdObj>;
  /** This endpoint can be used to delete a widget for the current user. */
  deleteMyWidget?: Maybe<Widget>;
  deleteSettingsCost: SettingsCost;
  deleteSettingsFee: SettingsFee;
  deleteSettingsKyc: SettingsKyc;
  deleteSettingsKycLevel: SettingsKycLevel;
  deleteSettingsKycTier: SettingsKycTier;
  deleteUser?: Maybe<User>;
  deleteUserApiKey?: Maybe<ApiKey>;
  deleteUserNotifications?: Maybe<Array<UserNotification>>;
  /** This endpoint can be used to delete the user's wallet. */
  deleteUserVault?: Maybe<UserVaultIdObj>;
  /** This endpoint can be used to delete a widget. */
  deleteWidget?: Maybe<Widget>;
  deleteWireTransferBankAccount: WireTransferBankAccount;
  disable2fa: LoginResult;
  enable2fa: LoginResult;
  /** This endpoint can be used to execute a transaction */
  executeTransaction?: Maybe<TransactionShort>;
  exportTransactionsToCsv?: Maybe<Scalars['Boolean']['output']>;
  exportUsersToCsv?: Maybe<Scalars['Boolean']['output']>;
  exportWidgetsToCsv?: Maybe<Scalars['Boolean']['output']>;
  foo: Scalars['String']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  generate2faCode: TwoFactorAuthenticationResult;
  generateDefaultTokenWhenKycSent: LoginResult;
  get2faQRCode: Scalars['String']['output'];
  login: LoginResult;
  loginWidget: LoginResult;
  logout: Scalars['Boolean']['output'];
  makeNotificationsViewed?: Maybe<Array<UserNotification>>;
  preauth: PaymentPreauthResultShort;
  preauthFull: PaymentPreauthResult;
  refreshToken: Scalars['String']['output'];
  removeRole?: Maybe<User>;
  repeatDeclinedTransactions?: Maybe<Array<Transaction>>;
  resendNotification?: Maybe<UserNotification>;
  restoreUser?: Maybe<User>;
  sendAdminNotification?: Maybe<Array<UserNotification>>;
  sendEmailCodePasswordChange: Scalars['Boolean']['output'];
  sendFakeLiquidityProviderTransactionChangedCallback?: Maybe<Scalars['Boolean']['output']>;
  sendInvoice?: Maybe<Scalars['Boolean']['output']>;
  sendTestKycServiceNotification?: Maybe<Scalars['Void']['output']>;
  sendTestNotification?: Maybe<Scalars['Void']['output']>;
  sendTestTransactionServiceNotification?: Maybe<Scalars['Void']['output']>;
  setCurrencyPairLiquidityProvider: CurrencyPairLiquidityProvider;
  setMyInfo: LoginResult;
  setPassword: Scalars['Boolean']['output'];
  setUserInfo: LoginResult;
  signup: LoginResult;
  status: Scalars['String']['output'];
  /** Unbenchmarking Transactions */
  unbenchmarkTransactions?: Maybe<Array<Transaction>>;
  updateBankAccount?: Maybe<UserBankAccount>;
  updateMe?: Maybe<User>;
  updateMyBankAccount?: Maybe<UserBankAccount>;
  updateMyContact?: Maybe<UserContact>;
  /** This endpoint can be used to update the current user's wallet. */
  updateMyVault?: Maybe<VaultAccount>;
  /** This endpoint can be used to update a widget for the current user. */
  updateMyWidget?: Maybe<Widget>;
  updateRiskAlertType?: Maybe<RiskAlertType>;
  updateSettingsCommon: SettingsCommon;
  updateSettingsCost: SettingsCost;
  updateSettingsFee: SettingsFee;
  updateSettingsKyc: SettingsKyc;
  updateSettingsKycLevel: SettingsKycLevel;
  updateSettingsKycTier: Scalars['Boolean']['output'];
  /** This endpoint can be used to update a transaction */
  updateTransaction?: Maybe<Transaction>;
  /** This endpoint can be used to update transaction flag */
  updateTransactionFlag?: Maybe<Transaction>;
  updateUser?: Maybe<User>;
  updateUserFlag?: Maybe<User>;
  /** This endpoint can be used to update the user's wallet. */
  updateUserVault?: Maybe<VaultAccount>;
  /** Update vault account */
  updateVaultAccount?: Maybe<VaultAccount>;
  /** This endpoint can be used to update a widget. */
  updateWidget?: Maybe<Widget>;
  updateWireTransferBankAccount: WireTransferBankAccount;
  verify2faCode: LoginResult;
};


export type MutationAbandonCryptoInvoiceArgs = {
  cryptoInvoiceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAbandonTransactionArgs = {
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddAssetToVaultAccountArgs = {
  assetId: Scalars['String']['input'];
  custodyProviderName?: InputMaybe<Scalars['String']['input']>;
  vaultId: Scalars['String']['input'];
};


export type MutationAddBankAccountArgs = {
  bankAccount?: InputMaybe<UserBankAccountInput>;
  userId: Scalars['String']['input'];
};


export type MutationAddBlackCountryArgs = {
  countryCode2: Scalars['String']['input'];
};


export type MutationAddFeedbackArgs = {
  feedback: FeedbackInput;
};


export type MutationAddFiatVaultArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAddMyBankAccountArgs = {
  bankAccount?: InputMaybe<UserBankAccountInput>;
};


export type MutationAddMyContactArgs = {
  contact?: InputMaybe<UserContactInput>;
};


export type MutationAddMyVaultArgs = {
  assetId: Scalars['String']['input'];
  originalId?: InputMaybe<Scalars['String']['input']>;
  vaultName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddMyWidgetUserParamsArgs = {
  widgetUserParams?: InputMaybe<WidgetUserParamsInput>;
};


export type MutationAddSettingsCostArgs = {
  settings: SettingsCostInput;
};


export type MutationAddSettingsFeeArgs = {
  settings: SettingsFeeInput;
};


export type MutationAddSettingsKycArgs = {
  settings: SettingsKycInput;
};


export type MutationAddSettingsKycLevelArgs = {
  settingsLevel: SettingsKycLevelInput;
};


export type MutationAddSettingsKycTierArgs = {
  settings: SettingsKycTierInput;
};


export type MutationAddUserVaultArgs = {
  assetId: Scalars['String']['input'];
  originalId?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
  vaultName: Scalars['String']['input'];
};


export type MutationAddWireTransferBankAccountArgs = {
  bankAccount: WireTransferBankAccountInput;
};


export type MutationAssignCostToFeesArgs = {
  costId: Scalars['ID']['input'];
  settingsIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationAssignRoleArgs = {
  roleCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  userId: Scalars['ID']['input'];
};


export type MutationCalculateInvoiceArgs = {
  invoiceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelMyTransactionArgs = {
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelTransactionArgs = {
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCaptureFullArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationChangeMyKycTierArgs = {
  userTierId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  code2fa?: InputMaybe<Scalars['String']['input']>;
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationChangeUserKycTierArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
  userTierId: Scalars['String']['input'];
};


export type MutationCompanyLevelVerificationArgs = {
  companyName?: InputMaybe<Scalars['String']['input']>;
  newLevel?: InputMaybe<Scalars['String']['input']>;
};


export type MutationConfirmDeviceArgs = {
  recaptcha: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationConfirmEmailArgs = {
  code?: InputMaybe<Scalars['Int']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  recaptcha: Scalars['String']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
};


export type MutationConfirmUserDeviceArgs = {
  device_id: Scalars['String']['input'];
};


export type MutationConfirmUserEmailArgs = {
  user_id: Scalars['String']['input'];
};


export type MutationCreateAccountArgs = {
  custodyProviderName: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateApmPaymentArgs = {
  orderParams: PaymentApmInput;
};


export type MutationCreateCustodyWithdrawalOrderArgs = {
  params?: InputMaybe<CreateTransferOrderParams>;
};


export type MutationCreateInvoiceArgs = {
  amountToSend?: InputMaybe<Scalars['Float']['input']>;
  currencyToSend?: InputMaybe<Scalars['String']['input']>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateLiquidityExchangeOrderArgs = {
  params?: InputMaybe<CreateLiquidityExchangeOrderParams>;
};


export type MutationCreateLiquidityWithdrawalOrderArgs = {
  params?: InputMaybe<CreateTransferOrderParams>;
};


export type MutationCreateMerchantTransactionArgs = {
  params?: InputMaybe<Scalars['String']['input']>;
  transaction?: InputMaybe<TransactionMerchantInput>;
};


export type MutationCreateMyWidgetArgs = {
  widget?: InputMaybe<WidgetInput>;
};


export type MutationCreatePaymentProviderPayoutArgs = {
  paymentProvider: Scalars['String']['input'];
  type?: InputMaybe<PaymentProviderPayoutType>;
};


export type MutationCreatePaymentProviderRefundArgs = {
  options?: InputMaybe<RefundInput>;
  paymentProvider: Scalars['String']['input'];
};


export type MutationCreateTransactionArgs = {
  transaction?: InputMaybe<TransactionInput>;
};


export type MutationCreateUserArgs = {
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
  user: UserInput;
};


export type MutationCreateUserApiKeyArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateUserTransactionArgs = {
  rate?: InputMaybe<Scalars['Float']['input']>;
  transaction?: InputMaybe<TransactionInput>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateVaultAccountArgs = {
  custodyProviderName?: InputMaybe<Scalars['String']['input']>;
  params?: InputMaybe<Array<StringMapInput>>;
  userId: Scalars['String']['input'];
};


export type MutationCreateWidgetArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
  widget?: InputMaybe<WidgetInput>;
};


export type MutationDelCurrencyPairLiquidityProviderArgs = {
  currencyPairLiquidityProviderId: Scalars['String']['input'];
};


export type MutationDeleteBankAccountArgs = {
  bankAccountId: Scalars['ID']['input'];
};


export type MutationDeleteBlackCountryArgs = {
  countryCode2: Scalars['String']['input'];
};


export type MutationDeleteDeviceArgs = {
  deviceIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationDeleteFiatVaultArgs = {
  fiatVaultId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteMyApiKeyArgs = {
  apiKeyId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteMyBankAccountArgs = {
  bankAccountId: Scalars['ID']['input'];
};


export type MutationDeleteMyContactArgs = {
  contactId: Scalars['ID']['input'];
};


export type MutationDeleteMyDeviceArgs = {
  deviceIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationDeleteMyNotificationsArgs = {
  notificationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationDeleteMyVaultArgs = {
  vaultId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteMyWidgetArgs = {
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteSettingsCostArgs = {
  settingsId: Scalars['ID']['input'];
};


export type MutationDeleteSettingsFeeArgs = {
  settingsId: Scalars['ID']['input'];
};


export type MutationDeleteSettingsKycArgs = {
  settingsId: Scalars['ID']['input'];
};


export type MutationDeleteSettingsKycLevelArgs = {
  settingsId: Scalars['ID']['input'];
};


export type MutationDeleteSettingsKycTierArgs = {
  settingsId: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationDeleteUserApiKeyArgs = {
  apiKeyId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteUserNotificationsArgs = {
  notificationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationDeleteUserVaultArgs = {
  userId: Scalars['ID']['input'];
  vaultId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteWidgetArgs = {
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteWireTransferBankAccountArgs = {
  bankAccountId: Scalars['ID']['input'];
};


export type MutationDisable2faArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationEnable2faArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationExecuteTransactionArgs = {
  code?: InputMaybe<Scalars['Int']['input']>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationExportTransactionsToCsvArgs = {
  accountStatusesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  accountTypesOnly?: InputMaybe<Array<UserType>>;
  completedDateInterval?: InputMaybe<DateTimeInterval>;
  countriesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  countryCodeType?: InputMaybe<CountryCodeType>;
  createdDateInterval?: InputMaybe<DateTimeInterval>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  paymentInstrumentsOnly?: InputMaybe<Array<PaymentInstrument>>;
  paymentProvidersOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  riskLevelsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  sendersOrReceiversOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sourcesOnly?: InputMaybe<Array<TransactionSource>>;
  transactionDateOnly?: InputMaybe<Scalars['DateTime']['input']>;
  transactionIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionStatusesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionTypesOnly?: InputMaybe<Array<TransactionType>>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  userTierLevelsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  walletAddressOnly?: InputMaybe<Scalars['String']['input']>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationExportUsersToCsvArgs = {
  accountModesOnly?: InputMaybe<Array<UserMode>>;
  accountStatusesOnly?: InputMaybe<Array<AccountStatus>>;
  accountTypesOnly?: InputMaybe<Array<UserType>>;
  countriesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  countryCodeType?: InputMaybe<CountryCodeType>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  kycStatusesOnly?: InputMaybe<Array<KycStatus>>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  registrationDateInterval?: InputMaybe<DateTimeInterval>;
  riskLevelsOnly?: InputMaybe<Array<RiskLevel>>;
  roleIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  totalBuyVolumeOver?: InputMaybe<Scalars['Int']['input']>;
  transactionCountOver?: InputMaybe<Scalars['Int']['input']>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  userTierLevelsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationExportWidgetsToCsvArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationGenerateDefaultTokenWhenKycSentArgs = {
  recaptcha: Scalars['String']['input'];
};


export type MutationGet2faQrCodeArgs = {
  data: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  oAuthProvider?: InputMaybe<OAuthProvider>;
  oAuthToken?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  recaptcha: Scalars['String']['input'];
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginWidgetArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  oAuthProvider?: InputMaybe<OAuthProvider>;
  oAuthToken?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMakeNotificationsViewedArgs = {
  notificationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationPreauthArgs = {
  orderParams: PaymentPreauthInput;
};


export type MutationPreauthFullArgs = {
  orderParams: PaymentPreauthInput;
};


export type MutationRemoveRoleArgs = {
  roleCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  userId: Scalars['ID']['input'];
};


export type MutationRepeatDeclinedTransactionsArgs = {
  transactionIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationResendNotificationArgs = {
  notificationId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRestoreUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationSendAdminNotificationArgs = {
  level?: InputMaybe<UserNotificationLevel>;
  notifiedUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  text?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendInvoiceArgs = {
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendTestKycServiceNotificationArgs = {
  type?: InputMaybe<KycServiceNotificationType>;
};


export type MutationSendTestTransactionServiceNotificationArgs = {
  type?: InputMaybe<TransactionServiceNotificationType>;
};


export type MutationSetCurrencyPairLiquidityProviderArgs = {
  fixedRate?: InputMaybe<Scalars['Float']['input']>;
  fromCurrency: Scalars['String']['input'];
  liquidityProviderId: Scalars['String']['input'];
  toCurrency: Scalars['String']['input'];
};


export type MutationSetMyInfoArgs = {
  address?: InputMaybe<PostAddress>;
  birthday?: InputMaybe<Scalars['DateTime']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetPasswordArgs = {
  password: Scalars['String']['input'];
  recaptcha: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationSetUserInfoArgs = {
  address?: InputMaybe<PostAddress>;
  birthday?: InputMaybe<Scalars['DateTime']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  address?: InputMaybe<PostAddress>;
  birthday?: InputMaybe<Scalars['DateTime']['input']>;
  countryCode2?: InputMaybe<Scalars['String']['input']>;
  countryCode3?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  merchantId?: InputMaybe<Scalars['String']['input']>;
  mode: UserMode;
  password?: InputMaybe<Scalars['String']['input']>;
  pep: Scalars['Boolean']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  recaptcha: Scalars['String']['input'];
  termsOfUse: Scalars['Boolean']['input'];
  type: UserType;
};


export type MutationStatusArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  orderId: Scalars['String']['input'];
};


export type MutationUnbenchmarkTransactionsArgs = {
  transactionIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateBankAccountArgs = {
  bankAccount?: InputMaybe<UserBankAccountInput>;
  bankAccountId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdateMeArgs = {
  user?: InputMaybe<UserInput>;
};


export type MutationUpdateMyBankAccountArgs = {
  bankAccount?: InputMaybe<UserBankAccountInput>;
  bankAccountId: Scalars['String']['input'];
};


export type MutationUpdateMyContactArgs = {
  contact?: InputMaybe<UserContactInput>;
  contactId: Scalars['String']['input'];
};


export type MutationUpdateMyVaultArgs = {
  vaultId?: InputMaybe<Scalars['String']['input']>;
  vaultName: Scalars['String']['input'];
};


export type MutationUpdateMyWidgetArgs = {
  widget?: InputMaybe<WidgetUpdateInput>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateRiskAlertTypeArgs = {
  riskAlertTypeId?: InputMaybe<Scalars['String']['input']>;
  riskAlertTypeInput?: InputMaybe<RiskAlertTypeInput>;
};


export type MutationUpdateSettingsCommonArgs = {
  settings: SettingsCommonInput;
  settingsId: Scalars['ID']['input'];
};


export type MutationUpdateSettingsCostArgs = {
  settings: SettingsCostInput;
  settingsId: Scalars['ID']['input'];
};


export type MutationUpdateSettingsFeeArgs = {
  settings: SettingsFeeInput;
  settingsId: Scalars['ID']['input'];
};


export type MutationUpdateSettingsKycArgs = {
  settings: SettingsKycInput;
  settingsId: Scalars['ID']['input'];
};


export type MutationUpdateSettingsKycLevelArgs = {
  settingsLevel: SettingsKycLevelInput;
  settingsLevelId: Scalars['ID']['input'];
};


export type MutationUpdateSettingsKycTierArgs = {
  settings: SettingsKycTierInput;
  settingsId: Scalars['ID']['input'];
};


export type MutationUpdateTransactionArgs = {
  recalculate?: InputMaybe<Scalars['Boolean']['input']>;
  transaction?: InputMaybe<TransactionUpdateInput>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTransactionFlagArgs = {
  flag: Scalars['Boolean']['input'];
  transactionId: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  user?: InputMaybe<UserInput>;
  userId: Scalars['ID']['input'];
};


export type MutationUpdateUserFlagArgs = {
  flag: Scalars['Boolean']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateUserVaultArgs = {
  userId: Scalars['ID']['input'];
  vaultId?: InputMaybe<Scalars['String']['input']>;
  vaultName: Scalars['String']['input'];
};


export type MutationUpdateVaultAccountArgs = {
  custodyProviderName?: InputMaybe<Scalars['String']['input']>;
  params?: InputMaybe<Array<StringMapInput>>;
  vaultId: Scalars['String']['input'];
};


export type MutationUpdateWidgetArgs = {
  widget?: InputMaybe<WidgetUpdateInput>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateWireTransferBankAccountArgs = {
  bankAccount: WireTransferBankAccountInput;
  bankAccountId: Scalars['ID']['input'];
};


export type MutationVerify2faCodeArgs = {
  code: Scalars['String']['input'];
};

export type NewAddress = {
  __typename?: 'NewAddress';
  address: Scalars['String']['output'];
  legacyAddress?: Maybe<Scalars['String']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
};

export enum OAuthProvider {
  Facebook = 'facebook',
  Google = 'google',
  Microsoft = 'microsoft',
  Twitter = 'twitter'
}

export type OpenBankingDetails = {
  __typename?: 'OpenBankingDetails';
  yapily?: Maybe<YapilyOpenBankingDetails>;
};

export type OpenBankingPreauthObject = {
  __typename?: 'OpenBankingPreauthObject';
  yapily?: Maybe<YapilyPreauthObject>;
};

export type Openpayd = {
  __typename?: 'Openpayd';
  countriesCode2?: Maybe<Array<Scalars['String']['output']>>;
  currencies?: Maybe<Array<Scalars['String']['output']>>;
  default?: Maybe<Scalars['Boolean']['output']>;
  disabled?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  instruments?: Maybe<Array<Scalars['String']['output']>>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  paymentProviderId?: Maybe<Scalars['ID']['output']>;
};

export type OpenpaydProviderBalance = {
  __typename?: 'OpenpaydProviderBalance';
  balance?: Maybe<Scalars['Float']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
};

export type OrderBy = {
  desc: Scalars['Boolean']['input'];
  orderBy: Scalars['String']['input'];
};

export type PaymentApmInput = {
  instrument: PaymentInstrument;
  transactionId: Scalars['String']['input'];
};

export type PaymentApmResult = {
  __typename?: 'PaymentApmResult';
  externalUrl?: Maybe<Scalars['String']['output']>;
  payId?: Maybe<Scalars['String']['output']>;
  referenceCode?: Maybe<Scalars['String']['output']>;
  type: PaymentApmType;
};

export enum PaymentApmType {
  External = 'external',
  PayId = 'payId'
}

export type PaymentBank = {
  __typename?: 'PaymentBank';
  countries?: Maybe<Array<Maybe<InstitutionCountry>>>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type PaymentBankInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentCaptureInput = {
  instrument: PaymentInstrument;
  orderId: Scalars['String']['input'];
  provider: Scalars['String']['input'];
};

export type PaymentCard = {
  cvv2?: InputMaybe<Scalars['Int']['input']>;
  expireMonth?: InputMaybe<Scalars['Int']['input']>;
  expireYear?: InputMaybe<Scalars['Int']['input']>;
  holder?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
};

export enum PaymentInstrument {
  Apm = 'APM',
  CreditCard = 'CreditCard',
  CryptoVault = 'CryptoVault',
  FiatVault = 'FiatVault',
  OpenBanking = 'OpenBanking',
  WireTransfer = 'WireTransfer'
}

export type PaymentOperation = {
  __typename?: 'PaymentOperation';
  callbackDetails?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  providerSpecificParams?: Maybe<Array<StringMap>>;
  providerSpecificStates?: Maybe<Array<DateMap>>;
  sn?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  statusReason?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  type: PaymentOperationType;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PaymentOperationShort = {
  __typename?: 'PaymentOperationShort';
  created?: Maybe<Scalars['DateTime']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  statusReason?: Maybe<Scalars['String']['output']>;
  type: PaymentOperationType;
};

export enum PaymentOperationType {
  Capture = 'capture',
  Preauth = 'preauth',
  Refund = 'refund'
}

export type PaymentOrder = {
  __typename?: 'PaymentOrder';
  amount: Scalars['Float']['output'];
  captureOperationSn?: Maybe<Scalars['String']['output']>;
  captured?: Maybe<Scalars['Boolean']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  currency: Scalars['String']['output'];
  operations?: Maybe<Array<PaymentOperation>>;
  orderId?: Maybe<Scalars['String']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  paymentBankName?: Maybe<Scalars['String']['output']>;
  paymentBin?: Maybe<Scalars['String']['output']>;
  paymentCardHolderName?: Maybe<Scalars['String']['output']>;
  paymentCardLastFourDigits?: Maybe<Scalars['String']['output']>;
  paymentCardType?: Maybe<Scalars['String']['output']>;
  paymentInfo?: Maybe<Scalars['String']['output']>;
  paymentProcessorName?: Maybe<Scalars['String']['output']>;
  preauth?: Maybe<Scalars['Boolean']['output']>;
  preauthOperationSn?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  providerSpecificParams?: Maybe<Array<StringMap>>;
  providerSpecificStates?: Maybe<Array<DateMap>>;
  refundOperationSn?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  statusReason?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PaymentOrderShort = {
  __typename?: 'PaymentOrderShort';
  amount: Scalars['Float']['output'];
  created?: Maybe<Scalars['DateTime']['output']>;
  currency: Scalars['String']['output'];
  operations?: Maybe<Array<PaymentOperationShort>>;
  orderId?: Maybe<Scalars['String']['output']>;
  paymentBankName?: Maybe<Scalars['String']['output']>;
  paymentBin?: Maybe<Scalars['String']['output']>;
  paymentCardHolderName?: Maybe<Scalars['String']['output']>;
  paymentCardLastFourDigits?: Maybe<Scalars['String']['output']>;
  paymentCardType?: Maybe<Scalars['String']['output']>;
  paymentInfo?: Maybe<Scalars['String']['output']>;
  paymentProcessorName?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  statusReason?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PaymentPreauthInput = {
  bank?: InputMaybe<PaymentBankInput>;
  card?: InputMaybe<PaymentCard>;
  instrument: PaymentInstrument;
  provider: Scalars['String']['input'];
  transactionId: Scalars['String']['input'];
};

export type PaymentPreauthResult = {
  __typename?: 'PaymentPreauthResult';
  details?: Maybe<Scalars['String']['output']>;
  html?: Maybe<Scalars['String']['output']>;
  openBankingObject?: Maybe<OpenBankingPreauthObject>;
  operation?: Maybe<PaymentOperation>;
  order?: Maybe<PaymentOrder>;
};

export type PaymentPreauthResultShort = {
  __typename?: 'PaymentPreauthResultShort';
  details?: Maybe<Scalars['String']['output']>;
  html?: Maybe<Scalars['String']['output']>;
  openBankingObject?: Maybe<OpenBankingPreauthObject>;
  order?: Maybe<PaymentOrderShort>;
};

export type PaymentProvider = {
  __typename?: 'PaymentProvider';
  allowAutoExchange?: Maybe<Scalars['Boolean']['output']>;
  countriesCode2?: Maybe<Array<Scalars['String']['output']>>;
  currencies?: Maybe<Array<Scalars['String']['output']>>;
  default?: Maybe<Scalars['Boolean']['output']>;
  disabled?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  external?: Maybe<Scalars['Boolean']['output']>;
  instruments?: Maybe<Array<Scalars['String']['output']>>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  paymentProviderId?: Maybe<Scalars['ID']['output']>;
  transactionTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  userTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  virtual?: Maybe<Scalars['Boolean']['output']>;
};

export type PaymentProviderByInstrument = {
  __typename?: 'PaymentProviderByInstrument';
  id?: Maybe<Scalars['ID']['output']>;
  instrument?: Maybe<PaymentInstrument>;
  provider?: Maybe<PaymentProvider>;
};

export enum PaymentProviderPayoutType {
  All = 'all',
  Benchmark = 'benchmark'
}

export type PostAddress = {
  addressEndDate?: InputMaybe<Scalars['DateTime']['input']>;
  addressStartDate?: InputMaybe<Scalars['DateTime']['input']>;
  buildingName?: InputMaybe<Scalars['String']['input']>;
  buildingNumber?: InputMaybe<Scalars['String']['input']>;
  flatNumber?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  stateName?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  subStreet?: InputMaybe<Scalars['String']['input']>;
  town?: InputMaybe<Scalars['String']['input']>;
};

export type PreSettingsCommon = {
  __typename?: 'PreSettingsCommon';
  allowMercahntSignUp?: Maybe<Scalars['Boolean']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** Check or create destination address */
  checkOrCreateDestinationAddress?: Maybe<CheckOrCreateDestinationAddressResult>;
  /** Check or create source vault address */
  checkOrCreateSourceVaultAddress?: Maybe<CheckOrCreateSourceAddressResult>;
  /** KYC widget API token generation */
  generateWebApiToken: Scalars['String']['output'];
  /** Get API keys */
  getApiKeys?: Maybe<ApiKeyListResult>;
  /** Get payment providers for relevant options */
  getAppropriatePaymentProviders?: Maybe<Array<PaymentProviderByInstrument>>;
  /** Get cost settings for the relevant parameters */
  getAppropriateSettingsCostFull?: Maybe<SettingsCost>;
  /** Get fee settings for the relevant parameters */
  getAppropriateSettingsFee?: Maybe<SettingsFee>;
  /** Get KYC settings for relevant options */
  getAppropriateSettingsKyc?: Maybe<SettingsKyc>;
  /** Get KYC levels settings for relevant options */
  getAppropriateSettingsKycTiers?: Maybe<SettingsKycTierShortExListResult>;
  /** This endpoint can be used to get transaction for chatbot with their description. */
  getChatbotTransactions?: Maybe<TransactionListResult>;
  /** This endpoint can be used to get transaction for chatbot with their description. */
  getChatbotUsers?: Maybe<UserListResult>;
  /** Get a black list of countries */
  getCountryBlackList?: Maybe<BlackCountryListResult>;
  getCurrencyPairLiquidityProvider?: Maybe<CurrencyPairLiquidityProvider>;
  getCurrencyPairLiquidityProviders: CurrencyPairLiquidityProvidersListResult;
  /** Get custody withdrawal order status */
  getCustodyWithdrawalOrderStatus?: Maybe<CustodyWithdrawalOrderInfo>;
  /** Get custody withdrawal orders */
  getCustodyWithdrawalOrders?: Maybe<Array<CustodyWithdrawalOrderInfo>>;
  /** Get toolbar merchant statistics */
  getDashboardMerchantStats?: Maybe<DashboardMerchantStats>;
  /** Get toolbar statistics */
  getDashboardStats?: Maybe<DashboardStats>;
  getDevices?: Maybe<UserDeviceListResult>;
  /** Get fake error */
  getFakeError?: Maybe<Scalars['Void']['output']>;
  /** get feedbacks */
  getFeedbacks?: Maybe<FeedbackListResult>;
  /** This endpoint can be used to get all fiat wallets with their description */
  getFiatVaults?: Maybe<FiatVaultUserListResult>;
  /** Get liquidity exchange order status */
  getLiquidityExchangeOrderStatus?: Maybe<LiquidityExchangeOrderInfo>;
  getLiquidityProviders: Array<LiquidityProviderEntity>;
  /** Get liquidity withdrawal potential fee */
  getLiquidityWithdrawalPotentialFeeInfo?: Maybe<LiquidityWithdrawalPotentialFeeInfo>;
  /** Get messages */
  getMessages?: Maybe<MessageListResult>;
  /** Get network fee */
  getNetworkFee?: Maybe<Scalars['Float']['output']>;
  /** Get notifications */
  getNotifications?: Maybe<UserNotificationListResult>;
  /** Get user notifications */
  getNotificationsByUser?: Maybe<UserNotificationListResult>;
  /** Get the rate of one currency to many */
  getOneToManyRates?: Maybe<Array<Rate>>;
  /** Get the rate of one currency to many (using for liquidity provider functionality) */
  getOneToManyRatesMerchant?: Maybe<Array<Maybe<Rate>>>;
  /** Get banks for OpenBanking */
  getOpenBankingDetails?: Maybe<OpenBankingDetails>;
  /** Get payment providers */
  getPaymentProviders?: Maybe<Array<PaymentProvider>>;
  /** Get common settings */
  getPreSettingsCommon?: Maybe<PreSettingsCommon>;
  /** Get the exchange rate of several currencies to one */
  getRates?: Maybe<Array<Rate>>;
  /** Get receive wallets for users */
  getReceiveWallets?: Maybe<AssetAddressShortListResult>;
  getRiskAlerts?: Maybe<RiskAlertResultList>;
  /** Get Roles */
  getRoles?: Maybe<Array<UserRole>>;
  /** Get wallet address */
  getSellAddress?: Maybe<Scalars['String']['output']>;
  /** Get common settings */
  getSettingsCommon?: Maybe<SettingsCommon>;
  /** Get cost settings */
  getSettingsCost?: Maybe<SettingsCostListResult>;
  /** Get currency settings */
  getSettingsCurrency?: Maybe<SettingsCurrencyWithDefaults>;
  /** Get fee settings */
  getSettingsFee?: Maybe<SettingsFeeListResult>;
  /** Get KYC settings */
  getSettingsKyc?: Maybe<SettingsKycListResult>;
  getSettingsKycLevels?: Maybe<SettingsKycLevelListResult>;
  /** Get KYC levels settings */
  getSettingsKycTiers?: Maybe<SettingsKycTierListResult>;
  /** Get support tickets */
  getSupportTickets?: Maybe<SupportTicketListResult>;
  /** Get system balance */
  getSystemBalanceMany?: Maybe<Scalars['String']['output']>;
  /** Get common settings */
  getTextPages?: Maybe<Array<Maybe<TextPage>>>;
  /** This endpoint can be used to get all transaction life lines with their description. */
  getTransactionLifelines?: Maybe<TransactionHistory>;
  /** Get transaction history with filters */
  getTransactionStatusHistory: TransactionStatusHistoryListResult;
  /** This endpoint can be used to get all transaction statuses with their description */
  getTransactionStatuses?: Maybe<Array<TransactionStatusDescriptorMap>>;
  /** This endpoint can be used to get all transactions with their description. */
  getTransactions?: Maybe<TransactionListResult>;
  /** Get user actions with filters */
  getUserActions: UserActionListResult;
  /** Get balance history with filters */
  getUserBalanceHistory: UserBalanceHistoryRecordListResult;
  /** Get bank accounts for selected user */
  getUserBankAccounts: UserContactListResult;
  /** Get contacts for selected user */
  getUserContacts: UserContactListResult;
  /** Get KYC information for selected user */
  getUserKycInfo?: Maybe<KycInfo>;
  /** Get state for the selected user */
  getUserState: UserState;
  /** Get User Vaults */
  getUserVaults?: Maybe<Array<Maybe<VaultAccountEx>>>;
  /** Get users by parameters */
  getUsers: UserListResult;
  /** Get vault account */
  getVaultAccount?: Maybe<VaultAccount>;
  /** Get custody wallets for users */
  getVaultAccountListForUsers?: Maybe<Array<VaultAccount>>;
  /** API getVerificationLink for shuftiProvider */
  getVerificationLink?: Maybe<Scalars['String']['output']>;
  /** Get current API module version */
  getVersion?: Maybe<Scalars['String']['output']>;
  /** This endpoint can be used to get all wallets with their description. */
  getWallets?: Maybe<AssetAddressListResult>;
  /** This endpoint can be used to get a widget by id */
  getWidget?: Maybe<Widget>;
  /** This endpoint can be used to get all widgets. */
  getWidgets?: Maybe<WidgetListResult>;
  /** This endpoint can be used to get all widgets for the selected user. */
  getWidgetsByUser?: Maybe<WidgetListResult>;
  /** API token generation */
  getWireTransferBankAccounts?: Maybe<WireTransferBankAccountListResult>;
  /** Returns true if liquidity deposit is completed and credited to the liquidity account */
  isLiquidityDepositCompleted?: Maybe<Scalars['Boolean']['output']>;
  me: User;
  /** Get my actions with filters */
  myActions: UserActionListResult;
  /** Get API keys for current user */
  myApiKeys?: Maybe<ApiKeyListResult>;
  /** Get my balance history with filters */
  myBalanceHistory: UserBalanceHistoryRecordListResult;
  /** Get bank accounts for current user */
  myBankAccounts: UserContactListResult;
  /** Get fee settings for the current user(SettingsFeeShort) */
  myBankCategories?: Maybe<Array<Maybe<BankCategory>>>;
  /** Get contacts for current user */
  myContacts: UserContactListResult;
  myDefaultSettingsFee?: Maybe<SettingsFee>;
  myDevices?: Maybe<UserDeviceListResult>;
  /** This endpoint can be used to get all fiat wallets for the current user */
  myFiatVaults?: Maybe<FiatVaultListResult>;
  /** Get KYC information for current user */
  myKycInfo?: Maybe<KycInfo>;
  myKycStatus: Scalars['String']['output'];
  /** Get notifications for current user */
  myNotifications?: Maybe<UserNotificationListResult>;
  /** Transaction history for the current user */
  myProfit: UserProfit;
  /** This endpoint can be used to get all receive wallets of the current user with their description. */
  myReceiveWallets?: Maybe<AssetAddressShortListResult>;
  /** Get cost settings for the current user */
  mySettingsCost?: Maybe<SettingsCostShort>;
  /** Get fee settings for the current user(SettingsFeeShort) */
  mySettingsFee?: Maybe<SettingsFeeShort>;
  /** Get fee settings for the current user */
  mySettingsFeeFull?: Maybe<SettingsFee>;
  /** Get KYC settings for the current user(SettingsKycTierShort) */
  mySettingsKyc?: Maybe<SettingsKycShort>;
  /** Get KYC settings for the current user */
  mySettingsKycFull?: Maybe<SettingsKyc>;
  /** Get KYC levels settings for the current user(SettingsKycTierShort) */
  mySettingsKycTier?: Maybe<SettingsKycTierShort>;
  /** Get KYC levels settings for the current user */
  mySettingsKycTiers?: Maybe<SettingsKycTierShortExListResult>;
  /** Get state for the current user */
  myState: UserState;
  /** Get support tickets for current user */
  mySupportTickets?: Maybe<SupportTicketListResult>;
  /** This endpoint can be used to get all transactions for current user. */
  myTransactions?: Maybe<TransactionShortListResult>;
  /** This endpoint can be used to get all wallets of the current user with their description. */
  myWallets?: Maybe<AssetAddressShortListResult>;
  /** This endpoint can be used to get all widgets for the current user. */
  myWidgets?: Maybe<WidgetListResult>;
  serverTime: Scalars['String']['output'];
  /** Get user by email */
  userByEmail: User;
  /** Get user by email */
  userById: User;
  /** Get user by name */
  userByName: User;
  /** Get user by OAuthAppId */
  userByOAuthAppId: User;
  /** Get user by referral code */
  userByReferralCode: User;
  /** User count */
  userCount?: Maybe<Scalars['Int']['output']>;
  userKycInfo: KycInfo;
  /** Transaction history for the selected user */
  userProfit: UserProfit;
};


export type QueryCheckOrCreateDestinationAddressArgs = {
  custodyProviderName: Scalars['String']['input'];
  transactionInput: TransactionInput;
  userId: Scalars['String']['input'];
};


export type QueryCheckOrCreateSourceVaultAddressArgs = {
  custodyProviderName: Scalars['String']['input'];
  transactionInput: TransactionInput;
  userId: Scalars['String']['input'];
};


export type QueryGenerateWebApiTokenArgs = {
  newLevel?: InputMaybe<Scalars['String']['input']>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetApiKeysArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetAppropriatePaymentProvidersArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  fiatCurrency?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<TransactionSource>;
  transactionType?: InputMaybe<TransactionType>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAppropriateSettingsCostFullArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  filterType?: InputMaybe<SettingsCostTargetFilterType>;
  filterValue?: InputMaybe<Scalars['String']['input']>;
  instrument: PaymentInstrument;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  transactionType: TransactionType;
};


export type QueryGetAppropriateSettingsFeeArgs = {
  currencyFrom?: InputMaybe<Scalars['String']['input']>;
  currencyTo?: InputMaybe<Scalars['String']['input']>;
  filterType?: InputMaybe<SettingsFeeTargetFilterType>;
  filterValue?: InputMaybe<Scalars['String']['input']>;
  instrument: PaymentInstrument;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  targetUserMode: UserMode;
  targetUserType: UserType;
  transactionType: TransactionType;
};


export type QueryGetAppropriateSettingsKycArgs = {
  filterType?: InputMaybe<SettingsKycTargetFilterType>;
  filterValue?: InputMaybe<Scalars['String']['input']>;
  targetKycProvider: KycProvider;
  targetUserMode: UserMode;
  targetUserType: UserType;
};


export type QueryGetAppropriateSettingsKycTiersArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<TransactionSource>;
  targetKycProvider: KycProvider;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetChatbotTransactionsArgs = {
  keyObjects?: InputMaybe<Scalars['String']['input']>;
  transactionIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetChatbotUsersArgs = {
  keyObjects?: InputMaybe<Scalars['String']['input']>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetCurrencyPairLiquidityProviderArgs = {
  fromCurrency: Scalars['String']['input'];
  toCurrency: Scalars['String']['input'];
};


export type QueryGetCurrencyPairLiquidityProvidersArgs = {
  fromCurrencies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  toCurrencies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryGetCustodyWithdrawalOrderStatusArgs = {
  custodyProviderName: Scalars['String']['input'];
  orderId: Scalars['String']['input'];
};


export type QueryGetCustodyWithdrawalOrdersArgs = {
  custodyProviderName: Scalars['String']['input'];
  transferOrdersTrackingTimedeltaDays: Scalars['Int']['input'];
};


export type QueryGetDashboardMerchantStatsArgs = {
  accountTypesOnly?: InputMaybe<Array<UserType>>;
  completedDateInterval?: InputMaybe<DateTimeInterval>;
  countriesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  countryCodeType?: InputMaybe<CountryCodeType>;
  createdDateInterval?: InputMaybe<DateTimeInterval>;
  fiatCurrency?: InputMaybe<Scalars['String']['input']>;
  sourcesOnly?: InputMaybe<Array<TransactionSource>>;
  transactionDateOnly?: InputMaybe<Scalars['DateTime']['input']>;
  updateDateInterval?: InputMaybe<DateTimeInterval>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetDashboardStatsArgs = {
  accountTypesOnly?: InputMaybe<Array<UserType>>;
  completedDateInterval?: InputMaybe<DateTimeInterval>;
  countriesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  countryCodeType?: InputMaybe<CountryCodeType>;
  createdDateInterval?: InputMaybe<DateTimeInterval>;
  fiatCurrency?: InputMaybe<Scalars['String']['input']>;
  sourcesOnly?: InputMaybe<Array<TransactionSource>>;
  transactionDateOnly?: InputMaybe<Scalars['DateTime']['input']>;
  updateDateInterval?: InputMaybe<DateTimeInterval>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetFeedbacksArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetFiatVaultsArgs = {
  assetsOnly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userIdsOnly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vaultIdsOnly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  zeroBalance?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetLiquidityExchangeOrderStatusArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryGetLiquidityWithdrawalPotentialFeeInfoArgs = {
  params: CreateTransferOrderParams;
  providerName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetMessagesArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetNetworkFeeArgs = {
  custodyProviderName: Scalars['String']['input'];
  params: CreateTransferOrderParams;
};


export type QueryGetNotificationsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userNotificationTypeCode?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetNotificationsByUserArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetOneToManyRatesArgs = {
  currenciesTo: Array<Scalars['String']['input']>;
  currencyFrom: Scalars['String']['input'];
  reverse?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetOneToManyRatesMerchantArgs = {
  currenciesTo?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  currencyFrom?: InputMaybe<Scalars['String']['input']>;
  withFactor?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetOpenBankingDetailsArgs = {
  paymentProvider: Scalars['String']['input'];
};


export type QueryGetRatesArgs = {
  currenciesFrom: Array<Scalars['String']['input']>;
  currencyTo: Scalars['String']['input'];
  provider?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetReceiveWalletsArgs = {
  assetId: Scalars['String']['input'];
  custodyProviderName: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryGetRiskAlertsArgs = {
  code?: InputMaybe<RiskAlertCodes>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSellAddressArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSettingsCostArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSettingsCurrencyArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSettingsFeeArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSettingsKycArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSettingsKycLevelsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSettingsKycTiersArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSupportTicketsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTransactionLifelinesArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTransactionStatusHistoryArgs = {
  createdDateInterval?: InputMaybe<DateTimeInterval>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  statusesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionIds?: InputMaybe<Array<Scalars['String']['input']>>;
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetTransactionsArgs = {
  accountModesOnly?: InputMaybe<Array<InputMaybe<UserMode>>>;
  accountStatusesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  accountTypesOnly?: InputMaybe<Array<UserType>>;
  completedDateInterval?: InputMaybe<DateTimeInterval>;
  countriesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  countryCodeType?: InputMaybe<CountryCodeType>;
  createdDateInterval?: InputMaybe<DateTimeInterval>;
  fiatCurrency?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  flag?: InputMaybe<Scalars['Boolean']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  kycStatusesOnly?: InputMaybe<Array<TransactionKycStatus>>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  paymentInstrumentsOnly?: InputMaybe<Array<PaymentInstrument>>;
  paymentProvidersOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  preauth?: InputMaybe<Scalars['Boolean']['input']>;
  riskLevelsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  sendersOrReceiversOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sourcesOnly?: InputMaybe<Array<TransactionSource>>;
  transactionDateOnly?: InputMaybe<Scalars['DateTime']['input']>;
  transactionIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionStatusesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionTypesOnly?: InputMaybe<Array<TransactionType>>;
  updateDateInterval?: InputMaybe<DateTimeInterval>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  userTierLevelsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  verifyWhenPaid?: InputMaybe<Scalars['Boolean']['input']>;
  walletAddressOnly?: InputMaybe<Scalars['String']['input']>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetUserActionsArgs = {
  actionTypesOnly?: InputMaybe<Array<UserActionType>>;
  createdDateInterval?: InputMaybe<DateTimeInterval>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  resultsOnly?: InputMaybe<Array<UserActionResult>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  statusesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserBalanceHistoryArgs = {
  asset?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  period?: InputMaybe<UserBalanceHistoryPeriod>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserBankAccountsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserContactsArgs = {
  assetIds?: InputMaybe<Array<Scalars['String']['input']>>;
  contactDisplayNames?: InputMaybe<Array<Scalars['String']['input']>>;
  contactEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserKycInfoArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserStateArgs = {
  options?: InputMaybe<UserStateInput>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserVaultsArgs = {
  custodyProviderName: Scalars['String']['input'];
  options?: InputMaybe<UserStateInput>;
  userId: Scalars['String']['input'];
};


export type QueryGetUsersArgs = {
  accountModesOnly?: InputMaybe<Array<UserMode>>;
  accountStatusesOnly?: InputMaybe<Array<AccountStatus>>;
  accountTypesOnly?: InputMaybe<Array<UserType>>;
  countriesOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  countryCodeType?: InputMaybe<CountryCodeType>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  flag?: InputMaybe<Scalars['Boolean']['input']>;
  kycStatusesOnly?: InputMaybe<Array<KycStatus>>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  registrationDateInterval?: InputMaybe<DateTimeInterval>;
  riskLevelsOnly?: InputMaybe<Array<RiskLevel>>;
  roleIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  totalBuyVolumeOver?: InputMaybe<Scalars['Int']['input']>;
  transactionCountOver?: InputMaybe<Scalars['Int']['input']>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  userTierLevelsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  verifyWhenPaid?: InputMaybe<Scalars['Boolean']['input']>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetVaultAccountArgs = {
  custodyProviderName: Scalars['String']['input'];
  vaultId: Scalars['String']['input'];
};


export type QueryGetVaultAccountListForUsersArgs = {
  admin?: InputMaybe<Scalars['Boolean']['input']>;
  custodyProviderName: Scalars['String']['input'];
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetVerificationLinkArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetWalletsArgs = {
  assetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  walletIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  zeroBalance?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetWidgetArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetWidgetsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  widgetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetWidgetsByUserArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetWireTransferBankAccountsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryIsLiquidityDepositCompletedArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryMyActionsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  withResult?: InputMaybe<UserActionResult>;
};


export type QueryMyApiKeysArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyBalanceHistoryArgs = {
  asset?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  period?: InputMaybe<UserBalanceHistoryPeriod>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyBankAccountsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyBankCategoriesArgs = {
  instrument: PaymentInstrument;
  transactionSource: TransactionSource;
  transactionType: TransactionType;
};


export type QueryMyContactsArgs = {
  assetIds?: InputMaybe<Array<Scalars['String']['input']>>;
  contactDisplayNames?: InputMaybe<Array<Scalars['String']['input']>>;
  contactEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyFiatVaultsArgs = {
  assetsOnly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyNotificationsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyProfitArgs = {
  options?: InputMaybe<UserProfitInput>;
};


export type QueryMyReceiveWalletsArgs = {
  assetIdOnly?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMySettingsCostArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  instrument: PaymentInstrument;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  transactionType: TransactionType;
};


export type QueryMySettingsFeeArgs = {
  currencyFrom?: InputMaybe<Scalars['String']['input']>;
  currencyTo?: InputMaybe<Scalars['String']['input']>;
  instrument: PaymentInstrument;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  transactionSource: TransactionSource;
  transactionType: TransactionType;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMySettingsFeeFullArgs = {
  currencyFrom?: InputMaybe<Scalars['String']['input']>;
  currencyTo?: InputMaybe<Scalars['String']['input']>;
  instrument: PaymentInstrument;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  transactionSource: TransactionSource;
  transactionType: TransactionType;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMySettingsKycTiersArgs = {
  source?: InputMaybe<TransactionSource>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyStateArgs = {
  options?: InputMaybe<UserStateInput>;
};


export type QueryMySupportTicketsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyTransactionsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  paymentProvidersOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  sendersOrReceiversOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sourcesOnly?: InputMaybe<Array<TransactionSource>>;
  transactionDateOnly?: InputMaybe<Scalars['DateTime']['input']>;
  transactionIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  transactionTypesOnly?: InputMaybe<Array<TransactionType>>;
  walletAddressOnly?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyWalletsArgs = {
  assetIdsOnly?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyWidgetsArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserByEmailArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserByIdArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserByNameArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserByOAuthAppIdArgs = {
  oAuthAppId?: InputMaybe<Scalars['String']['input']>;
  oAuthProvider?: InputMaybe<OAuthProvider>;
};


export type QueryUserByReferralCodeArgs = {
  referralCode?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserKycInfoArgs = {
  userId: Scalars['String']['input'];
};


export type QueryUserProfitArgs = {
  options?: InputMaybe<UserProfitInput>;
  userId: Scalars['String']['input'];
};

export type Rate = {
  __typename?: 'Rate';
  currencyFrom: Scalars['String']['output'];
  currencyTo: Scalars['String']['output'];
  depositRate: Scalars['Float']['output'];
  originalRate: Scalars['Float']['output'];
  withdrawRate: Scalars['Float']['output'];
};

export type RefundInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
};

export type RequiredUserPermission = {
  fullAccess?: InputMaybe<Scalars['Boolean']['input']>;
  objectCode?: InputMaybe<Scalars['String']['input']>;
  userRolePermissionId?: InputMaybe<Scalars['String']['input']>;
};

export type RiskAlert = {
  __typename?: 'RiskAlert';
  created: Scalars['DateTime']['output'];
  details?: Maybe<Scalars['String']['output']>;
  riskAlertId?: Maybe<Scalars['ID']['output']>;
  riskAlertTypeCode: RiskAlertCodes;
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export enum RiskAlertCodes {
  DepositAbove_10K = 'DEPOSIT_ABOVE_10K',
  DepositAbove_50K = 'DEPOSIT_ABOVE_50K',
  DepositAboveXAmountInYTimeframe = 'DEPOSIT_ABOVE_X_AMOUNT_IN_Y_TIMEFRAME',
  DepositXPercentUpThanTheLastOne = 'DEPOSIT_X_PERCENT_UP_THAN_THE_LAST_ONE',
  FlashfxMismatch = 'FLASHFX_MISMATCH',
  MonoovaMismatch = 'MONOOVA_MISMATCH',
  OpenpaydMismatch = 'OPENPAYD_MISMATCH',
  PrimetrustMismatch = 'PRIMETRUST_MISMATCH',
  SumsubWords = 'SUMSUB_WORDS',
  TooManyFailedLoginAttempts = 'TOO_MANY_FAILED_LOGIN_ATTEMPTS',
  TwoOrMoreCustomersWithdrawalSameAddress = 'TWO_OR_MORE_CUSTOMERS_WITHDRAWAL_SAME_ADDRESS',
  UnusualUserIpAddress = 'UNUSUAL_USER_IP_ADDRESS',
  UserAge = 'USER_AGE',
  WithdrawalOwner = 'WITHDRAWAL_OWNER'
}

export type RiskAlertResultList = {
  __typename?: 'RiskAlertResultList';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<RiskAlert>>;
};

export type RiskAlertType = {
  __typename?: 'RiskAlertType';
  created: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  disabled?: Maybe<Scalars['DateTime']['output']>;
  riskAlertTypeCode: RiskAlertCodes;
};

export type RiskAlertTypeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  disabled?: InputMaybe<Scalars['DateTime']['input']>;
  riskAlertTypeCode: RiskAlertCodes;
};

export enum RiskLevel {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium'
}

export type RoleOptions = {
  permissions?: InputMaybe<Array<RequiredUserPermission>>;
  roles: Array<Scalars['String']['input']>;
};

export type SettingsCommon = {
  __typename?: 'SettingsCommon';
  additionalSettings?: Maybe<Scalars['String']['output']>;
  adminAdditionalSettings?: Maybe<Scalars['String']['output']>;
  adminEmails?: Maybe<Array<Scalars['String']['output']>>;
  custodyFiatProvider?: Maybe<Scalars['String']['output']>;
  custodyProvider?: Maybe<Scalars['String']['output']>;
  kycBaseAddress?: Maybe<Scalars['String']['output']>;
  kycProvider?: Maybe<Scalars['String']['output']>;
  liquidityProvider?: Maybe<Scalars['String']['output']>;
  mailProvider?: Maybe<Scalars['String']['output']>;
  proxyLiquidityProvider?: Maybe<Scalars['String']['output']>;
  proxyLiquidityProviderApiKey?: Maybe<Scalars['String']['output']>;
  proxyLiquidityProviderApiSecret?: Maybe<Scalars['String']['output']>;
  proxyLiquidityProviderTransactionChangedCallback?: Maybe<Scalars['String']['output']>;
  proxyLiquidityProviderUrl?: Maybe<Scalars['String']['output']>;
  settingsCommonId?: Maybe<Scalars['String']['output']>;
  stoppedForServicing?: Maybe<Scalars['Boolean']['output']>;
  textPages?: Maybe<Array<Maybe<TextPage>>>;
  transactionTypeSettings?: Maybe<Array<Maybe<TransactionTypeSetting>>>;
  userAdditionalSettings?: Maybe<Scalars['String']['output']>;
};

export type SettingsCommonInput = {
  additionalSettings?: InputMaybe<Scalars['String']['input']>;
  adminEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  custodyProvider?: InputMaybe<Scalars['String']['input']>;
  kycProvider?: InputMaybe<Scalars['String']['input']>;
  liquidityProvider?: InputMaybe<Scalars['String']['input']>;
  mailProvider?: InputMaybe<Scalars['String']['input']>;
  stoppedForServicing?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SettingsCost = {
  __typename?: 'SettingsCost';
  bankAccounts?: Maybe<Array<WireTransferBankAccount>>;
  created: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  deleted?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  settingsCostId: Scalars['ID']['output'];
  targetFilterType?: Maybe<SettingsCostTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']['output']>>;
  targetInstruments?: Maybe<Array<Scalars['String']['output']>>;
  targetPaymentProviders?: Maybe<Array<Scalars['String']['output']>>;
  targetTransactionTypes?: Maybe<Array<Scalars['String']['output']>>;
  terms?: Maybe<Scalars['String']['output']>;
};

export type SettingsCostInput = {
  bankAccountIds?: InputMaybe<Array<Scalars['String']['input']>>;
  default?: InputMaybe<Scalars['Boolean']['input']>;
  deleted?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  targetFilterType?: InputMaybe<SettingsCostTargetFilterType>;
  targetFilterValues?: InputMaybe<Array<Scalars['String']['input']>>;
  targetInstruments?: InputMaybe<Array<PaymentInstrument>>;
  targetPaymentProviders?: InputMaybe<Array<Scalars['String']['input']>>;
  targetTransactionTypes?: InputMaybe<Array<TransactionType>>;
  terms?: InputMaybe<Scalars['String']['input']>;
};

export type SettingsCostListResult = {
  __typename?: 'SettingsCostListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsCost>>;
};

export type SettingsCostShort = {
  __typename?: 'SettingsCostShort';
  bankAccounts?: Maybe<Array<WireTransferBankAccountShort>>;
  settingsCostId: Scalars['ID']['output'];
  terms?: Maybe<Scalars['String']['output']>;
};

export enum SettingsCostTargetFilterType {
  Country = 'Country',
  None = 'None',
  Psp = 'PSP'
}

export type SettingsCurrency = {
  __typename?: 'SettingsCurrency';
  countryCode2?: Maybe<Scalars['String']['output']>;
  currencyBlockchain?: Maybe<CurrencyBlockchain>;
  defaultBankTransferProvider?: Maybe<Scalars['String']['output']>;
  defaultCreditCardProvider?: Maybe<Scalars['String']['output']>;
  defaultWireTransferProvider?: Maybe<Scalars['String']['output']>;
  disabled?: Maybe<Scalars['String']['output']>;
  displaySymbol?: Maybe<Scalars['String']['output']>;
  explorerLink?: Maybe<Scalars['String']['output']>;
  fiat?: Maybe<Scalars['Boolean']['output']>;
  maskSymbol?: Maybe<Scalars['String']['output']>;
  maxAmount: Scalars['Float']['output'];
  minAmount: Scalars['Float']['output'];
  name?: Maybe<Scalars['String']['output']>;
  originalSymbol?: Maybe<Scalars['String']['output']>;
  precision: Scalars['Int']['output'];
  rateFactor: Scalars['Float']['output'];
  symbol: Scalars['ID']['output'];
  validateAsSymbol?: Maybe<Scalars['String']['output']>;
};

export type SettingsCurrencyListResult = {
  __typename?: 'SettingsCurrencyListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsCurrency>>;
};

export type SettingsCurrencyWithDefaults = {
  __typename?: 'SettingsCurrencyWithDefaults';
  defaultCrypto?: Maybe<Scalars['String']['output']>;
  defaultFiat?: Maybe<Scalars['String']['output']>;
  settingsCurrency?: Maybe<SettingsCurrencyListResult>;
};

export type SettingsFee = {
  __typename?: 'SettingsFee';
  costs?: Maybe<Array<SettingsCost>>;
  created: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  deleted?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  rateToEur?: Maybe<Scalars['Float']['output']>;
  settingsFeeId: Scalars['ID']['output'];
  targetCurrenciesFrom?: Maybe<Array<Scalars['String']['output']>>;
  targetCurrenciesTo?: Maybe<Array<Scalars['String']['output']>>;
  targetFilterType?: Maybe<SettingsFeeTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']['output']>>;
  targetInstruments?: Maybe<Array<Scalars['String']['output']>>;
  targetPaymentProviders?: Maybe<Array<Scalars['String']['output']>>;
  targetTransactionTypes?: Maybe<Array<Scalars['String']['output']>>;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetUserTypes?: Maybe<Array<UserType>>;
  terms: Scalars['String']['output'];
  wireDetails: Scalars['String']['output'];
};

export type SettingsFeeInput = {
  default?: InputMaybe<Scalars['Boolean']['input']>;
  deleted?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  targetCurrenciesFrom?: InputMaybe<Array<Scalars['String']['input']>>;
  targetCurrenciesTo?: InputMaybe<Array<Scalars['String']['input']>>;
  targetFilterType?: InputMaybe<SettingsFeeTargetFilterType>;
  targetFilterValues?: InputMaybe<Array<Scalars['String']['input']>>;
  targetInstruments?: InputMaybe<Array<PaymentInstrument>>;
  targetPaymentProviders?: InputMaybe<Array<Scalars['String']['input']>>;
  targetTransactionTypes?: InputMaybe<Array<TransactionType>>;
  targetUserModes?: InputMaybe<Array<UserMode>>;
  targetUserTypes?: InputMaybe<Array<UserType>>;
  terms?: InputMaybe<Scalars['String']['input']>;
  wireDetails?: InputMaybe<Scalars['String']['input']>;
};

export type SettingsFeeListResult = {
  __typename?: 'SettingsFeeListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsFee>>;
};

export type SettingsFeeShort = {
  __typename?: 'SettingsFeeShort';
  costs?: Maybe<Array<SettingsCostShort>>;
  currency?: Maybe<Scalars['String']['output']>;
  rateToEur?: Maybe<Scalars['Float']['output']>;
  requiredFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  settingsFeeId: Scalars['ID']['output'];
  terms: Scalars['String']['output'];
  wireDetails: Scalars['String']['output'];
};

export enum SettingsFeeTargetFilterType {
  AccountId = 'AccountId',
  AccountType = 'AccountType',
  Country = 'Country',
  InitiateFrom = 'InitiateFrom',
  None = 'None',
  WidgetId = 'WidgetId'
}

export type SettingsKyc = {
  __typename?: 'SettingsKyc';
  created: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  deleted?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  levels?: Maybe<Array<SettingsKycLevel>>;
  name: Scalars['String']['output'];
  requireUserAddress?: Maybe<Scalars['Boolean']['output']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']['output']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']['output']>;
  requireUserFullName?: Maybe<Scalars['Boolean']['output']>;
  requireUserPhone?: Maybe<Scalars['Boolean']['output']>;
  settingsKycId: Scalars['ID']['output'];
  targetFilterType?: Maybe<SettingsKycTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']['output']>>;
  targetKycProviders?: Maybe<Array<KycProvider>>;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetUserType: UserType;
};

export type SettingsKycInput = {
  default?: InputMaybe<Scalars['Boolean']['input']>;
  deleted?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  levelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  requireUserAddress?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserBirthday?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserFlatNumber?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserFullName?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserPhone?: InputMaybe<Scalars['Boolean']['input']>;
  targetFilterType?: InputMaybe<SettingsKycTargetFilterType>;
  targetFilterValues?: InputMaybe<Array<Scalars['String']['input']>>;
  targetKycProviders?: InputMaybe<Array<KycProvider>>;
  targetUserModes?: InputMaybe<Array<UserMode>>;
  targetUserType: UserType;
};

export type SettingsKycLevel = {
  __typename?: 'SettingsKycLevel';
  created?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  originalFlowName?: Maybe<Scalars['String']['output']>;
  originalLevelName?: Maybe<Scalars['String']['output']>;
  settingsKycLevelId: Scalars['ID']['output'];
  userType?: Maybe<UserType>;
};

export type SettingsKycLevelInput = {
  data: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  originalFlowName?: InputMaybe<Scalars['String']['input']>;
  originalLevelName?: InputMaybe<Scalars['String']['input']>;
  userType: UserType;
};

export type SettingsKycLevelListResult = {
  __typename?: 'SettingsKycLevelListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsKycLevel>>;
};

export type SettingsKycLevelShort = {
  __typename?: 'SettingsKycLevelShort';
  data?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  originalFlowName?: Maybe<Scalars['String']['output']>;
  originalLevelName?: Maybe<Scalars['String']['output']>;
  settingsKycLevelId: Scalars['ID']['output'];
  userType?: Maybe<UserType>;
};

export type SettingsKycLevelShufti = {
  __typename?: 'SettingsKycLevelShufti';
  data?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  settingsKycLevelShuftiId: Scalars['ID']['output'];
};

export type SettingsKycListResult = {
  __typename?: 'SettingsKycListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsKyc>>;
};

export type SettingsKycShort = {
  __typename?: 'SettingsKycShort';
  levels?: Maybe<Array<SettingsKycLevelShort>>;
  requireUserAddress?: Maybe<Scalars['Boolean']['output']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']['output']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']['output']>;
  requireUserFullName?: Maybe<Scalars['Boolean']['output']>;
  requireUserPhone?: Maybe<Scalars['Boolean']['output']>;
};

export enum SettingsKycTargetFilterType {
  AccountId = 'AccountId',
  Country = 'Country',
  InitiateFrom = 'InitiateFrom',
  None = 'None',
  WidgetId = 'WidgetId'
}

export type SettingsKycTier = {
  __typename?: 'SettingsKycTier';
  amount?: Maybe<Scalars['Float']['output']>;
  created: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  deleted?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  level?: Maybe<SettingsKycLevel>;
  levelId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  requireUserAddress?: Maybe<Scalars['Boolean']['output']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']['output']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']['output']>;
  requireUserFullName?: Maybe<Scalars['Boolean']['output']>;
  requireUserPhone?: Maybe<Scalars['Boolean']['output']>;
  settingsKycTierId: Scalars['ID']['output'];
  showForm?: Maybe<Scalars['Boolean']['output']>;
  skipForWaiting?: Maybe<Scalars['Boolean']['output']>;
  targetFilterType?: Maybe<SettingsKycTargetFilterType>;
  targetFilterValues?: Maybe<Array<Scalars['String']['output']>>;
  targetKycProviders?: Maybe<Array<KycProvider>>;
  targetUserModes?: Maybe<Array<UserMode>>;
  targetUserType: UserType;
};

export type SettingsKycTierInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  default?: InputMaybe<Scalars['Boolean']['input']>;
  deleted?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  levelId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  requireUserAddress?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserBirthday?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserFlatNumber?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserFullName?: InputMaybe<Scalars['Boolean']['input']>;
  requireUserPhone?: InputMaybe<Scalars['Boolean']['input']>;
  targetFilterType?: InputMaybe<SettingsKycTargetFilterType>;
  targetFilterValues?: InputMaybe<Array<Scalars['String']['input']>>;
  targetKycProviders?: InputMaybe<Array<KycProvider>>;
  targetUserModes?: InputMaybe<Array<UserMode>>;
  targetUserType?: InputMaybe<UserType>;
};

export type SettingsKycTierListResult = {
  __typename?: 'SettingsKycTierListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsKycTier>>;
};

export type SettingsKycTierShort = {
  __typename?: 'SettingsKycTierShort';
  amount?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  requireUserAddress?: Maybe<Scalars['Boolean']['output']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']['output']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']['output']>;
  requireUserFullName?: Maybe<Scalars['Boolean']['output']>;
  requireUserPhone?: Maybe<Scalars['Boolean']['output']>;
};

export type SettingsKycTierShortEx = {
  __typename?: 'SettingsKycTierShortEx';
  amount?: Maybe<Scalars['Float']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  levelDescription?: Maybe<Scalars['String']['output']>;
  levelId?: Maybe<Scalars['String']['output']>;
  levelName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  originalFlowName?: Maybe<Scalars['String']['output']>;
  originalLevelName?: Maybe<Scalars['String']['output']>;
  requireUserAddress?: Maybe<Scalars['Boolean']['output']>;
  requireUserBirthday?: Maybe<Scalars['Boolean']['output']>;
  requireUserFlatNumber?: Maybe<Scalars['Boolean']['output']>;
  requireUserFullName?: Maybe<Scalars['Boolean']['output']>;
  requireUserPhone?: Maybe<Scalars['Boolean']['output']>;
  settingsKycTierId: Scalars['String']['output'];
  showForm?: Maybe<Scalars['Boolean']['output']>;
  skipForWaiting?: Maybe<Scalars['Boolean']['output']>;
};

export type SettingsKycTierShortExListResult = {
  __typename?: 'SettingsKycTierShortExListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SettingsKycTierShortEx>>;
};

export type SourceVaultAccountIdObject = {
  address?: InputMaybe<Scalars['String']['input']>;
  subWalletName?: InputMaybe<Scalars['String']['input']>;
  vaultId?: InputMaybe<Scalars['String']['input']>;
  walletId?: InputMaybe<Scalars['String']['input']>;
};

export type StringMap = {
  __typename?: 'StringMap';
  key: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type StringMapInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  externalPaymentCompletedNotification?: Maybe<Scalars['Void']['output']>;
  kycCompletedNotification?: Maybe<Scalars['Void']['output']>;
  kycServiceNotification?: Maybe<Scalars['Void']['output']>;
  newNotification?: Maybe<Scalars['Void']['output']>;
  paymentStatusChanged?: Maybe<Scalars['Void']['output']>;
  transactionServiceNotification?: Maybe<Scalars['Void']['output']>;
};

export type SupportTicket = {
  __typename?: 'SupportTicket';
  category?: Maybe<SupportTicketCategory>;
  created?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  files?: Maybe<Array<Scalars['String']['output']>>;
  supportTicketId: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export enum SupportTicketCategory {
  Authorization = 'Authorization',
  Exchange = 'Exchange',
  Transaction = 'Transaction'
}

export type SupportTicketListResult = {
  __typename?: 'SupportTicketListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<SupportTicket>>;
};

export type TextPage = {
  __typename?: 'TextPage';
  page?: Maybe<Scalars['Int']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export enum TokenAction {
  ApiKey = 'ApiKey',
  ConfirmDevice = 'ConfirmDevice',
  ConfirmEmail = 'ConfirmEmail',
  ConfirmPasswordChange = 'ConfirmPasswordChange',
  Default = 'Default',
  KycRequired = 'KycRequired',
  TwoFactorAuth = 'TwoFactorAuth',
  UserInfoRequired = 'UserInfoRequired'
}

export type Transaction = {
  __typename?: 'Transaction';
  accountStatus?: Maybe<AccountStatus>;
  accountType?: Maybe<Scalars['String']['output']>;
  amountInEur?: Maybe<Scalars['Float']['output']>;
  amountToReceive?: Maybe<Scalars['Float']['output']>;
  amountToReceiveWithoutFee?: Maybe<Scalars['Float']['output']>;
  amountToSpend?: Maybe<Scalars['Float']['output']>;
  amountToSpendWithoutFee?: Maybe<Scalars['Float']['output']>;
  approxNetworkFee?: Maybe<Scalars['Float']['output']>;
  approxNetworkFeeFiat?: Maybe<Scalars['Float']['output']>;
  backups?: Maybe<Array<Scalars['String']['output']>>;
  benchmarkTransferOrder?: Maybe<TransferOrder>;
  benchmarkTransferOrderBlockchainLink?: Maybe<Scalars['String']['output']>;
  benchmarkTransferOrderId?: Maybe<Scalars['String']['output']>;
  canBeCancelled?: Maybe<Scalars['Boolean']['output']>;
  canBeReviewed?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  costDetails?: Maybe<Scalars['String']['output']>;
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  cryptoInvoiceName?: Maybe<Scalars['String']['output']>;
  currencyToReceive: Scalars['String']['output'];
  currencyToSpend?: Maybe<Scalars['String']['output']>;
  custodyDetails?: Maybe<Scalars['String']['output']>;
  custodyFiatProvider?: Maybe<Scalars['String']['output']>;
  custodyProvider?: Maybe<CustodyProvider>;
  data?: Maybe<Scalars['String']['output']>;
  destVault?: Maybe<Scalars['String']['output']>;
  destVaultId?: Maybe<Scalars['String']['output']>;
  destination?: Maybe<Scalars['String']['output']>;
  destinationUserId?: Maybe<Scalars['String']['output']>;
  executed?: Maybe<Scalars['DateTime']['output']>;
  feeDetails?: Maybe<Scalars['String']['output']>;
  feeFiat?: Maybe<Scalars['Float']['output']>;
  feeMinFiat?: Maybe<Scalars['Float']['output']>;
  feePercent?: Maybe<Scalars['Float']['output']>;
  flag?: Maybe<Scalars['Boolean']['output']>;
  hasBeenBenchmarked?: Maybe<Scalars['Boolean']['output']>;
  hasToBeRefunded?: Maybe<Scalars['Boolean']['output']>;
  initialAmountToReceive?: Maybe<Scalars['Float']['output']>;
  initialAmountToReceiveWithoutFee?: Maybe<Scalars['Float']['output']>;
  initialRate?: Maybe<Scalars['Float']['output']>;
  instrument?: Maybe<PaymentInstrument>;
  instrumentDetails?: Maybe<Scalars['String']['output']>;
  kycStatus?: Maybe<TransactionKycStatus>;
  lifelineId?: Maybe<Scalars['String']['output']>;
  liquidityOrder?: Maybe<LiquidityExchangeOrder>;
  liquidityOrderId?: Maybe<Scalars['String']['output']>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  manuallyEditedAccountStatus?: Maybe<Scalars['Boolean']['output']>;
  manuallyEditedAmounts?: Maybe<Scalars['Boolean']['output']>;
  manuallyEditedFee?: Maybe<Scalars['Boolean']['output']>;
  manuallyEditedKycStatus?: Maybe<Scalars['Boolean']['output']>;
  manuallyEditedStatus?: Maybe<Scalars['Boolean']['output']>;
  merchantFeeTransferOrder?: Maybe<TransferOrder>;
  merchantFeeTransferOrderBlockchainLink?: Maybe<Scalars['String']['output']>;
  merchantFeeTransferOrderId?: Maybe<Scalars['String']['output']>;
  merchantTransferOrder?: Maybe<TransferOrder>;
  paymentOrder?: Maybe<PaymentOrder>;
  paymentOrderId?: Maybe<Scalars['String']['output']>;
  paymentProvider?: Maybe<Scalars['String']['output']>;
  rate?: Maybe<Scalars['Float']['output']>;
  rateFiatToEur?: Maybe<Scalars['Float']['output']>;
  recipientName?: Maybe<Scalars['String']['output']>;
  requestParams?: Maybe<Scalars['String']['output']>;
  requiredFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  requiredUserTier?: Maybe<SettingsKycTierShortEx>;
  requiredUserTierId?: Maybe<Scalars['String']['output']>;
  risk: RiskLevel;
  riskCodes?: Maybe<Array<Scalars['String']['output']>>;
  screeningAnswer?: Maybe<Scalars['String']['output']>;
  screeningData?: Maybe<Scalars['String']['output']>;
  screeningRiskscore?: Maybe<Scalars['Float']['output']>;
  screeningStatus?: Maybe<Scalars['String']['output']>;
  senderName?: Maybe<Scalars['String']['output']>;
  source?: Maybe<TransactionSource>;
  sourceAddress?: Maybe<Scalars['String']['output']>;
  sourceVault?: Maybe<Scalars['String']['output']>;
  sourceVaultId?: Maybe<Scalars['String']['output']>;
  status: TransactionStatus;
  subStatus?: Maybe<Scalars['String']['output']>;
  totalUserAmountBeforeTransactionInEur?: Maybe<Scalars['Float']['output']>;
  transactionId: Scalars['ID']['output'];
  transferOrder?: Maybe<TransferOrder>;
  transferOrderBlockchainLink?: Maybe<Scalars['String']['output']>;
  transferOrderId?: Maybe<Scalars['String']['output']>;
  type: TransactionType;
  updated?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userBalanceAvailableAfter?: Maybe<Scalars['Float']['output']>;
  userBalanceAvailableBefore?: Maybe<Scalars['Float']['output']>;
  userBalanceTotalAfter?: Maybe<Scalars['Float']['output']>;
  userBalanceTotalBefore?: Maybe<Scalars['Float']['output']>;
  userDefaultCryptoCurrency: Scalars['String']['output'];
  userDefaultFiatCurrency: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userIp?: Maybe<Scalars['String']['output']>;
  userReferralCode: Scalars['Int']['output'];
  userTier?: Maybe<SettingsKycTierShortEx>;
  userTierId?: Maybe<Scalars['String']['output']>;
  verifyWhenPaid?: Maybe<Scalars['Boolean']['output']>;
  widget?: Maybe<Scalars['String']['output']>;
  widgetCode?: Maybe<Scalars['String']['output']>;
  widgetId?: Maybe<Scalars['String']['output']>;
  widgetUserParams?: Maybe<WidgetUserParams>;
  widgetUserParamsId?: Maybe<Scalars['String']['output']>;
};

export enum TransactionConfirmationMode {
  Always = 'ALWAYS',
  Never = 'NEVER',
  PerWidget = 'PER_WIDGET'
}

export type TransactionHistory = {
  __typename?: 'TransactionHistory';
  lifeline?: Maybe<TransactionLifelineStatusListResult>;
};

export type TransactionInput = {
  amountToSpend: Scalars['Float']['input'];
  currencyToReceive?: InputMaybe<Scalars['String']['input']>;
  currencyToSpend?: InputMaybe<Scalars['String']['input']>;
  custodyFiatProvider?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<Scalars['String']['input']>;
  destVaultId?: InputMaybe<Scalars['String']['input']>;
  destination?: InputMaybe<Scalars['String']['input']>;
  instrument?: InputMaybe<PaymentInstrument>;
  instrumentDetails?: InputMaybe<Scalars['String']['input']>;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  source: TransactionSource;
  sourceAddress?: InputMaybe<Scalars['String']['input']>;
  sourceVaultId?: InputMaybe<Scalars['String']['input']>;
  type: TransactionType;
  verifyWhenPaid?: InputMaybe<Scalars['Boolean']['input']>;
  widgetUserParamsId?: InputMaybe<Scalars['String']['input']>;
};

export enum TransactionKycStatus {
  KycApproved = 'KycApproved',
  KycRejected = 'KycRejected',
  KycWaiting = 'KycWaiting'
}

export type TransactionLifelineStatus = {
  __typename?: 'TransactionLifelineStatus';
  created?: Maybe<Scalars['DateTime']['output']>;
  lifelineId?: Maybe<Scalars['String']['output']>;
  lifelineStatusDescriptor?: Maybe<TransactionStatusLifelineDescriptor>;
  resultFailureParams?: Maybe<Scalars['String']['output']>;
  resultStatusParams?: Maybe<Scalars['String']['output']>;
  resultSuccessParams?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  transactionLifelineStatusId?: Maybe<Scalars['ID']['output']>;
  transactionStatus?: Maybe<TransactionStatus>;
  transactionStatusResult?: Maybe<TransactionLifelineStatusResult>;
  updated?: Maybe<Scalars['DateTime']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type TransactionLifelineStatusItem = {
  __typename?: 'TransactionLifelineStatusItem';
  lifelineId?: Maybe<Scalars['String']['output']>;
  lifelineStatus?: Maybe<Array<TransactionLifelineStatus>>;
};

export type TransactionLifelineStatusListResult = {
  __typename?: 'TransactionLifelineStatusListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<TransactionLifelineStatusItem>>;
};

export enum TransactionLifelineStatusResult {
  Failure = 'FAILURE',
  Success = 'SUCCESS',
  Unknown = 'UNKNOWN'
}

export type TransactionListResult = {
  __typename?: 'TransactionListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Transaction>>;
};

export type TransactionMerchantInput = {
  amountInEur?: InputMaybe<Scalars['Float']['input']>;
  amountToReceive?: InputMaybe<Scalars['Float']['input']>;
  amountToReceiveWithoutFee?: InputMaybe<Scalars['Float']['input']>;
  amountToSpend: Scalars['Float']['input'];
  amountToSpendWithoutFee?: InputMaybe<Scalars['Float']['input']>;
  currencyToReceive?: InputMaybe<Scalars['String']['input']>;
  currencyToSpend?: InputMaybe<Scalars['String']['input']>;
  custodyFiatProvider?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<Scalars['String']['input']>;
  destVaultId?: InputMaybe<Scalars['String']['input']>;
  destination?: InputMaybe<Scalars['String']['input']>;
  initialAmountToReceive?: InputMaybe<Scalars['Float']['input']>;
  initialAmountToReceiveWithoutFee?: InputMaybe<Scalars['Float']['input']>;
  initialRate?: InputMaybe<Scalars['Float']['input']>;
  instrument?: InputMaybe<PaymentInstrument>;
  instrumentDetails?: InputMaybe<Scalars['String']['input']>;
  paymentProvider?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['Float']['input']>;
  rateFiatToEur?: InputMaybe<Scalars['Float']['input']>;
  source: TransactionSource;
  sourceAddress?: InputMaybe<Scalars['String']['input']>;
  sourceVaultId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TransactionStatus>;
  transactionChangedCallback?: InputMaybe<Scalars['String']['input']>;
  type: TransactionType;
  widgetUserParamsId?: InputMaybe<Scalars['String']['input']>;
};

export type TransactionSh = {
  __typename?: 'TransactionSH';
  code?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
};

export enum TransactionServiceNotificationType {
  CryptoFullPaid = 'CryptoFullPaid',
  CryptoPartPaid = 'CryptoPartPaid',
  PaymentStatusChanged = 'PaymentStatusChanged'
}

export type TransactionShort = {
  __typename?: 'TransactionShort';
  accountStatus?: Maybe<AccountStatus>;
  accountType?: Maybe<Scalars['String']['output']>;
  amountInEur?: Maybe<Scalars['Float']['output']>;
  amountToReceive?: Maybe<Scalars['Float']['output']>;
  amountToReceiveWithoutFee?: Maybe<Scalars['Float']['output']>;
  amountToSpend?: Maybe<Scalars['Float']['output']>;
  amountToSpendWithoutFee?: Maybe<Scalars['Float']['output']>;
  approxNetworkFee?: Maybe<Scalars['Float']['output']>;
  approxNetworkFeeFiat?: Maybe<Scalars['Float']['output']>;
  canBeCancelled?: Maybe<Scalars['Boolean']['output']>;
  canBeReviewed?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  costDetails?: Maybe<Scalars['String']['output']>;
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  cryptoInvoiceName?: Maybe<Scalars['String']['output']>;
  currencyToReceive?: Maybe<Scalars['String']['output']>;
  currencyToSpend?: Maybe<Scalars['String']['output']>;
  custodyDetails?: Maybe<Scalars['String']['output']>;
  custodyFiatProvider?: Maybe<Scalars['String']['output']>;
  custodyProvider?: Maybe<CustodyProvider>;
  data?: Maybe<Scalars['String']['output']>;
  destVault?: Maybe<Scalars['String']['output']>;
  destVaultId?: Maybe<Scalars['String']['output']>;
  destination?: Maybe<Scalars['String']['output']>;
  destinationUserId?: Maybe<Scalars['String']['output']>;
  executed?: Maybe<Scalars['DateTime']['output']>;
  feeDetails?: Maybe<Scalars['String']['output']>;
  feeFiat?: Maybe<Scalars['Float']['output']>;
  feeMinFiat?: Maybe<Scalars['Float']['output']>;
  feePercent?: Maybe<Scalars['Float']['output']>;
  flag?: Maybe<Scalars['Boolean']['output']>;
  hasToBeRefunded?: Maybe<Scalars['Boolean']['output']>;
  initialAmountToReceive?: Maybe<Scalars['Float']['output']>;
  initialAmountToReceiveWithoutFee?: Maybe<Scalars['Float']['output']>;
  initialRate?: Maybe<Scalars['Float']['output']>;
  instrument?: Maybe<PaymentInstrument>;
  instrumentDetails?: Maybe<Scalars['String']['output']>;
  kycStatus?: Maybe<TransactionKycStatus>;
  lifelineId?: Maybe<Scalars['String']['output']>;
  liquidityOrder?: Maybe<LiquidityExchangeOrder>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  merchantTransferOrder?: Maybe<TransferOrder>;
  paymentOrder?: Maybe<PaymentOrder>;
  paymentProvider?: Maybe<Scalars['String']['output']>;
  rate?: Maybe<Scalars['Float']['output']>;
  rateFiatToEur?: Maybe<Scalars['Float']['output']>;
  recipientName?: Maybe<Scalars['String']['output']>;
  requiredFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  requiredUserTier?: Maybe<SettingsKycTierShortEx>;
  requiredUserTierId?: Maybe<Scalars['String']['output']>;
  risk: RiskLevel;
  riskCodes?: Maybe<Array<Scalars['String']['output']>>;
  screeningAnswer?: Maybe<Scalars['String']['output']>;
  screeningData?: Maybe<Scalars['String']['output']>;
  screeningRiskscore?: Maybe<Scalars['Float']['output']>;
  screeningStatus?: Maybe<Scalars['String']['output']>;
  senderName?: Maybe<Scalars['String']['output']>;
  source?: Maybe<TransactionSource>;
  sourceAddress?: Maybe<Scalars['String']['output']>;
  sourceVault?: Maybe<Scalars['String']['output']>;
  sourceVaultId?: Maybe<Scalars['String']['output']>;
  status: TransactionStatus;
  subStatus?: Maybe<Scalars['String']['output']>;
  transactionId: Scalars['ID']['output'];
  transferOrder?: Maybe<TransferOrder>;
  transferOrderBlockchainLink?: Maybe<Scalars['String']['output']>;
  type: TransactionType;
  updated?: Maybe<Scalars['DateTime']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userIp?: Maybe<Scalars['String']['output']>;
  userReferralCode: Scalars['Int']['output'];
  userTier?: Maybe<SettingsKycTierShortEx>;
  userTierId?: Maybe<Scalars['String']['output']>;
  widget?: Maybe<Scalars['String']['output']>;
  widgetCode?: Maybe<Scalars['String']['output']>;
  widgetId?: Maybe<Scalars['String']['output']>;
  widgetUserParams?: Maybe<WidgetUserParams>;
  widgetUserParamsId?: Maybe<Scalars['String']['output']>;
};

export type TransactionShortListResult = {
  __typename?: 'TransactionShortListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<TransactionShort>>;
};

export enum TransactionSource {
  QuickCheckout = 'QuickCheckout',
  Wallet = 'Wallet',
  Widget = 'Widget'
}

export type TransactionStatsByStatus = {
  __typename?: 'TransactionStatsByStatus';
  status?: Maybe<TransactionStatus>;
  volume?: Maybe<TransactionStatsVolume>;
};

export type TransactionStatsVolume = {
  __typename?: 'TransactionStatsVolume';
  count?: Maybe<Scalars['Int']['output']>;
  volume?: Maybe<Scalars['Float']['output']>;
};

export enum TransactionStatus {
  Abandoned = 'Abandoned',
  AddressDeclined = 'AddressDeclined',
  BenchmarkTransferDeclined = 'BenchmarkTransferDeclined',
  BenchmarkTransfered = 'BenchmarkTransfered',
  BenchmarkTransfering = 'BenchmarkTransfering',
  Canceled = 'Canceled',
  Chargeback = 'Chargeback',
  Completed = 'Completed',
  Distributed = 'Distributed',
  Distributing = 'Distributing',
  DistributingWaiting = 'DistributingWaiting',
  ExchangeDeclined = 'ExchangeDeclined',
  Exchanged = 'Exchanged',
  Exchanging = 'Exchanging',
  KycDeclined = 'KycDeclined',
  New = 'New',
  Paid = 'Paid',
  PaymentDeclined = 'PaymentDeclined',
  Pending = 'Pending',
  Processing = 'Processing',
  Refund = 'Refund',
  Sending = 'Sending',
  SendingWaiting = 'SendingWaiting',
  Sent = 'Sent',
  TransferBenchmarkWaiting = 'TransferBenchmarkWaiting',
  TransferBlocked = 'TransferBlocked',
  TransferDeclined = 'TransferDeclined'
}

export type TransactionStatusDescriptor = {
  __typename?: 'TransactionStatusDescriptor';
  adminStatus: AdminTransactionStatus;
  buyLifeline?: Maybe<TransactionStatusLifelineDescriptor>;
  canBeCancelled: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  failureFinalStatus?: Maybe<TransactionStatus>;
  hasToBeRefunded: Scalars['Boolean']['output'];
  level: TransactionStatusLevel;
  notifyUser: Scalars['Boolean']['output'];
  processingStatus?: Maybe<Array<TransactionStatus>>;
  receiveLifeline?: Maybe<TransactionStatusLifelineDescriptor>;
  repeatFromStatus?: Maybe<TransactionStatus>;
  sellLifeline?: Maybe<TransactionStatusLifelineDescriptor>;
  status?: Maybe<TransactionStatus>;
  statusType: TransactionStatusType;
  successFinalStatus?: Maybe<TransactionStatus>;
  transferLifeline?: Maybe<TransactionStatusLifelineDescriptor>;
  updateWhenOwnLiquidityProvider?: Maybe<Scalars['Boolean']['output']>;
  userStatus: UserTransactionStatus;
};

export type TransactionStatusDescriptorMap = {
  __typename?: 'TransactionStatusDescriptorMap';
  key: TransactionStatus;
  value: TransactionStatusDescriptor;
};

export type TransactionStatusHistory = {
  __typename?: 'TransactionStatusHistory';
  created?: Maybe<Scalars['DateTime']['output']>;
  initialTransactionHandlingData?: Maybe<Scalars['String']['output']>;
  newStatus?: Maybe<Scalars['String']['output']>;
  newStatusReason?: Maybe<Scalars['String']['output']>;
  oldStatus?: Maybe<Scalars['String']['output']>;
  transaction?: Maybe<Array<Maybe<TransactionSh>>>;
  transactionDataAfter?: Maybe<Scalars['String']['output']>;
  transactionDataBefore?: Maybe<Scalars['String']['output']>;
  transactionHandlingData?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  transactionStatusHistoryId: Scalars['ID']['output'];
  userEmail?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type TransactionStatusHistoryListResult = {
  __typename?: 'TransactionStatusHistoryListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<TransactionStatusHistory>>;
};

export enum TransactionStatusLevel {
  Error = 'error',
  Info = 'info'
}

export type TransactionStatusLifelineDescriptor = {
  __typename?: 'TransactionStatusLifelineDescriptor';
  newNode: Scalars['Boolean']['output'];
  seqNo?: Maybe<Scalars['Int']['output']>;
  statusDescription?: Maybe<Scalars['String']['output']>;
  statusName?: Maybe<Scalars['String']['output']>;
};

export enum TransactionStatusType {
  Cancelation = 'Cancelation',
  Error = 'Error',
  Final = 'Final',
  Processing = 'Processing'
}

export enum TransactionSubStatus {
  PartiallyPaid = 'PartiallyPaid'
}

export enum TransactionType {
  Buy = 'Buy',
  Deposit = 'Deposit',
  Exchange = 'Exchange',
  MerchantBuy = 'MerchantBuy',
  MerchantSell = 'MerchantSell',
  Receive = 'Receive',
  Sell = 'Sell',
  System = 'System',
  Transfer = 'Transfer',
  Withdrawal = 'Withdrawal'
}

export type TransactionUpdateInput = {
  accountStatus?: InputMaybe<AccountStatus>;
  amountToReceive?: InputMaybe<Scalars['Float']['input']>;
  amountToSpend?: InputMaybe<Scalars['Float']['input']>;
  benchmarkTransferOrderChanges?: InputMaybe<TransactionUpdateTransferOrderChanges>;
  comment?: InputMaybe<Scalars['String']['input']>;
  cryptoInvoiceName?: InputMaybe<Scalars['String']['input']>;
  currencyToReceive?: InputMaybe<Scalars['String']['input']>;
  currencyToSpend?: InputMaybe<Scalars['String']['input']>;
  destination?: InputMaybe<Scalars['String']['input']>;
  feeFiat?: InputMaybe<Scalars['Float']['input']>;
  flag?: InputMaybe<Scalars['Boolean']['input']>;
  kycStatus?: InputMaybe<TransactionKycStatus>;
  launchAfterUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  paymentOrderChanges?: InputMaybe<TransactionUpdatePaymentOrderChanges>;
  rate?: InputMaybe<Scalars['Float']['input']>;
  requestParams?: InputMaybe<Scalars['String']['input']>;
  sourceVaultId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TransactionStatus>;
  subStatus?: InputMaybe<Scalars['String']['input']>;
  transferOrderChanges?: InputMaybe<TransactionUpdateTransferOrderChanges>;
  type?: InputMaybe<TransactionType>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
  widgetUserParamsChanges?: InputMaybe<WidgetUserParamsChanges>;
  widgetUserParamsId?: InputMaybe<Scalars['String']['input']>;
};

export type TransactionUpdatePaymentOrderChanges = {
  originalOrderId?: InputMaybe<Scalars['String']['input']>;
};

export type TransactionUpdateTransferOrderChanges = {
  hash?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
};

export type TransferListResult = {
  __typename?: 'TransferListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<TransferOrder>>;
};

export type TransferOrder = {
  __typename?: 'TransferOrder';
  amount?: Maybe<Scalars['Float']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  cryptoInvoiceName?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  destination?: Maybe<Scalars['String']['output']>;
  executed?: Maybe<Scalars['DateTime']['output']>;
  executingResult?: Maybe<Scalars['String']['output']>;
  feeCurrency?: Maybe<Scalars['Float']['output']>;
  operation?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['ID']['output']>;
  originalOrderId?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  published?: Maybe<Scalars['DateTime']['output']>;
  publishingResult?: Maybe<Scalars['String']['output']>;
  screeningAnswer?: Maybe<Scalars['String']['output']>;
  screeningData?: Maybe<Scalars['String']['output']>;
  screeningRiskscore?: Maybe<Scalars['Float']['output']>;
  screeningStatus?: Maybe<Scalars['String']['output']>;
  signed?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  sourceVaultId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subStatus?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  transferDetails?: Maybe<Scalars['String']['output']>;
  transferHash?: Maybe<Scalars['String']['output']>;
  type?: Maybe<TransferType>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type TransferResult = {
  __typename?: 'TransferResult';
  id?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type TransferStats = BaseStat & {
  __typename?: 'TransferStats';
  abandoned?: Maybe<TransactionStatsVolume>;
  approved?: Maybe<TransactionStatsVolume>;
  byStatus?: Maybe<Array<TransactionStatsByStatus>>;
  chargedBack?: Maybe<TransactionStatsVolume>;
  declined?: Maybe<TransactionStatsVolume>;
  failed?: Maybe<TransactionStatsVolume>;
  fee?: Maybe<TransactionStatsVolume>;
  inProcess?: Maybe<TransactionStatsVolume>;
  ratio?: Maybe<Scalars['Float']['output']>;
  refund?: Maybe<TransactionStatsVolume>;
  toCustomer?: Maybe<MerchantOrCustomerStats>;
  toMerchant?: Maybe<MerchantOrCustomerStats>;
};

export enum TransferType {
  Receive = 'Receive',
  Send = 'Send'
}

export type TwoFactorAuthenticationResult = {
  __typename?: 'TwoFactorAuthenticationResult';
  code: Scalars['String']['output'];
  otpauthUrl: Scalars['String']['output'];
  qr: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  accessFailedCount?: Maybe<Scalars['Int']['output']>;
  accountStatus?: Maybe<AccountStatus>;
  addressEndDate?: Maybe<Scalars['DateTime']['output']>;
  addressLine?: Maybe<Scalars['String']['output']>;
  addressStartDate?: Maybe<Scalars['DateTime']['output']>;
  affiliateCode?: Maybe<Scalars['String']['output']>;
  affiliateId?: Maybe<Scalars['String']['output']>;
  avarageTransaction?: Maybe<Scalars['Float']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  averageTransaction?: Maybe<Scalars['Float']['output']>;
  bankAccounts?: Maybe<Array<UserBankAccount>>;
  birthday?: Maybe<Scalars['DateTime']['output']>;
  buildingName?: Maybe<Scalars['String']['output']>;
  buildingNumber?: Maybe<Scalars['String']['output']>;
  changePasswordRequired?: Maybe<Scalars['Boolean']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  companyName?: Maybe<Scalars['String']['output']>;
  companyRegisterNumber?: Maybe<Scalars['String']['output']>;
  companyType?: Maybe<Scalars['String']['output']>;
  contacts?: Maybe<Array<UserContact>>;
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  custodyFiatProvider?: Maybe<Scalars['String']['output']>;
  custodyProvider?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']['output']>;
  defaultFiatCurrency?: Maybe<Scalars['String']['output']>;
  deleted?: Maybe<Scalars['DateTime']['output']>;
  document_num?: Maybe<Scalars['String']['output']>;
  document_type?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  emailConfirmed?: Maybe<Scalars['DateTime']['output']>;
  fiatVaults?: Maybe<Array<FiatVault>>;
  firstName?: Maybe<Scalars['String']['output']>;
  flag?: Maybe<Scalars['Boolean']['output']>;
  flatNumber?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Gender>;
  hasEmailAuth?: Maybe<Scalars['Boolean']['output']>;
  is2faEnabled?: Maybe<Scalars['Boolean']['output']>;
  kycApplicantId?: Maybe<Scalars['String']['output']>;
  kycDocs?: Maybe<Array<Scalars['String']['output']>>;
  kycPrivateComment?: Maybe<Scalars['String']['output']>;
  kycProvider?: Maybe<Scalars['String']['output']>;
  kycReviewComment?: Maybe<Scalars['String']['output']>;
  kycReviewDate?: Maybe<Scalars['DateTime']['output']>;
  kycReviewRejectedLabels?: Maybe<Array<Scalars['String']['output']>>;
  kycReviewRejectedType?: Maybe<Scalars['String']['output']>;
  kycReviewResult?: Maybe<Scalars['String']['output']>;
  kycStatus?: Maybe<Scalars['String']['output']>;
  kycStatusDate?: Maybe<Scalars['DateTime']['output']>;
  kycStatusUpdateRequired?: Maybe<Scalars['Boolean']['output']>;
  kycTier?: Maybe<SettingsKycTierShort>;
  kycTierId?: Maybe<Scalars['String']['output']>;
  kycValid?: Maybe<Scalars['Boolean']['output']>;
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  manuallyEditedRisk?: Maybe<Scalars['Boolean']['output']>;
  merchantIds?: Maybe<Array<Scalars['String']['output']>>;
  mode?: Maybe<UserMode>;
  notificationSubscriptions?: Maybe<Array<UserNotificationSubscription>>;
  openpaydAccountHolderId?: Maybe<Scalars['String']['output']>;
  openpaydIds?: Maybe<Scalars['String']['output']>;
  payId?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<UserRolePermission>>;
  phone?: Maybe<Scalars['String']['output']>;
  postCode?: Maybe<Scalars['String']['output']>;
  primeTrustAccountId?: Maybe<Scalars['String']['output']>;
  primeTrustContactId?: Maybe<Scalars['String']['output']>;
  referralCode?: Maybe<Scalars['Int']['output']>;
  risk?: Maybe<RiskLevel>;
  riskAlertCount?: Maybe<Scalars['Int']['output']>;
  riskCodes?: Maybe<Array<Scalars['String']['output']>>;
  roles?: Maybe<Array<UserRole>>;
  stateName?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  subStreet?: Maybe<Scalars['String']['output']>;
  systemUser: Scalars['Boolean']['output'];
  termsOfUse?: Maybe<Scalars['Boolean']['output']>;
  totalBoughtCompleted?: Maybe<Scalars['Float']['output']>;
  totalBoughtCompletedCount?: Maybe<Scalars['Int']['output']>;
  totalBoughtInProcess?: Maybe<Scalars['Float']['output']>;
  totalBoughtInProcessCount?: Maybe<Scalars['Int']['output']>;
  totalDepositCompleted?: Maybe<Scalars['Float']['output']>;
  totalDepositCompletedCount?: Maybe<Scalars['Int']['output']>;
  totalDepositInProcess?: Maybe<Scalars['Float']['output']>;
  totalDepositInProcessCount?: Maybe<Scalars['Int']['output']>;
  totalReceivedCompleted?: Maybe<Scalars['Float']['output']>;
  totalReceivedCompletedCount?: Maybe<Scalars['Int']['output']>;
  totalReceivedInProcess?: Maybe<Scalars['Float']['output']>;
  totalReceivedInProcessCount?: Maybe<Scalars['Int']['output']>;
  totalSentCompleted?: Maybe<Scalars['Float']['output']>;
  totalSentCompletedCount?: Maybe<Scalars['Int']['output']>;
  totalSentInProcess?: Maybe<Scalars['Float']['output']>;
  totalSentInProcessCount?: Maybe<Scalars['Int']['output']>;
  totalSoldCompleted?: Maybe<Scalars['Float']['output']>;
  totalSoldCompletedCount?: Maybe<Scalars['Int']['output']>;
  totalSoldInProcess?: Maybe<Scalars['Float']['output']>;
  totalSoldInProcessCount?: Maybe<Scalars['Int']['output']>;
  totalTransactionCount?: Maybe<Scalars['Int']['output']>;
  totalWithdrawalCompleted?: Maybe<Scalars['Float']['output']>;
  totalWithdrawalCompletedCount?: Maybe<Scalars['Int']['output']>;
  totalWithdrawalInProcess?: Maybe<Scalars['Float']['output']>;
  totalWithdrawalInProcessCount?: Maybe<Scalars['Int']['output']>;
  town?: Maybe<Scalars['String']['output']>;
  type?: Maybe<UserType>;
  updated?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['ID']['output'];
  vaults?: Maybe<Array<UserVaultIdObj>>;
  widgetCode?: Maybe<Scalars['String']['output']>;
  widgetId?: Maybe<Scalars['String']['output']>;
  widgetName?: Maybe<Scalars['String']['output']>;
  widgetUserParamsId?: Maybe<Scalars['String']['output']>;
};

export type UserAction = {
  __typename?: 'UserAction';
  actionType?: Maybe<UserActionType>;
  currentUserEmail?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['DateTime']['output']>;
  info?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  linkedIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  objectId?: Maybe<Scalars['String']['output']>;
  result?: Maybe<UserActionResult>;
  status?: Maybe<Scalars['String']['output']>;
  userActionId: Scalars['ID']['output'];
  userEmail?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type UserActionListResult = {
  __typename?: 'UserActionListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserAction>>;
};

export enum UserActionResult {
  Canceled = 'canceled',
  Error = 'error',
  Failed = 'failed',
  NotVerified = 'notVerified',
  Succeeded = 'succeeded',
  Unknown = 'unknown'
}

export enum UserActionType {
  Deposit = 'Deposit',
  MerchantBuy = 'MerchantBuy',
  MerchantSell = 'MerchantSell',
  PrimeTrustCreateTrade = 'PrimeTrustCreateTrade',
  PrimeTrustCreateWebhookConfig = 'PrimeTrustCreateWebhookConfig',
  PrimeTrustGetAssetTransfers = 'PrimeTrustGetAssetTransfers',
  PrimeTrustGetCashTransfers = 'PrimeTrustGetCashTransfers',
  PrimeTrustGetFundsTransfers = 'PrimeTrustGetFundsTransfers',
  PrimeTrustGetTrade = 'PrimeTrustGetTrade',
  PrimeTrustGetWebhookConfig = 'PrimeTrustGetWebhookConfig',
  Withdrawal = 'Withdrawal',
  AbandonCryptoInvoice = 'abandonCryptoInvoice',
  AbandonTransaction = 'abandonTransaction',
  AddBlackCountry = 'addBlackCountry',
  AddCostSettings = 'addCostSettings',
  AddFeeSettings = 'addFeeSettings',
  AddKycLevelSettings = 'addKycLevelSettings',
  AddKycTierSettings = 'addKycTierSettings',
  AddWidgetUserParams = 'addWidgetUserParams',
  AddWireTransferBankAccount = 'addWireTransferBankAccount',
  AssignRole = 'assignRole',
  Buy = 'buy',
  CancelTransaction = 'cancelTransaction',
  ChangeRiskAlertSettings = 'changeRiskAlertSettings',
  ChangeUserKycTier = 'changeUserKycTier',
  CoriunderCallback = 'coriunderCallback',
  CreateApiKey = 'createApiKey',
  CreateCryptoInvoice = 'createCryptoInvoice',
  CreateUser = 'createUser',
  DeleteApiKey = 'deleteApiKey',
  DeleteCostSettings = 'deleteCostSettings',
  DeleteFeeSettings = 'deleteFeeSettings',
  DeleteKycLevelSettings = 'deleteKycLevelSettings',
  DeleteKycTierSettings = 'deleteKycTierSettings',
  DeleteUser = 'deleteUser',
  DeleteWireTransferBankAccount = 'deleteWireTransferBankAccount',
  Exchange = 'exchange',
  FlashfxApproved = 'flashfxApproved',
  FlashfxAutoReject = 'flashfxAutoReject',
  FlashfxCallback = 'flashfxCallback',
  FlashfxDeclined = 'flashfxDeclined',
  GenerateKycToken = 'generateKycToken',
  GenerateShareToken = 'generateShareToken',
  GetCoinsCallback = 'getCoinsCallback',
  KycCallback = 'kycCallback',
  LiquidityDeposit = 'liquidityDeposit',
  Login = 'login',
  Logout = 'logout',
  MonoovaApproved = 'monoovaApproved',
  MonoovaAutoReject = 'monoovaAutoReject',
  MonoovaCallback = 'monoovaCallback',
  MonoovaCreateAccount = 'monoovaCreateAccount',
  MonoovaDeclined = 'monoovaDeclined',
  MonoovaGetAccount = 'monoovaGetAccount',
  MonoovaGetPayId = 'monoovaGetPayId',
  MonoovaPayout = 'monoovaPayout',
  MonoovaRegisterPayId = 'monoovaRegisterPayId',
  OpenpaydApproved = 'openpaydApproved',
  OpenpaydAutoReject = 'openpaydAutoReject',
  OpenpaydCallback = 'openpaydCallback',
  OpenpaydDeclined = 'openpaydDeclined',
  PaidTransaction = 'paidTransaction',
  PrimeTrustCallback = 'primeTrustCallback',
  PrimeTrustCreateAccount = 'primeTrustCreateAccount',
  PrimeTrustCreateAssetDisbursment = 'primeTrustCreateAssetDisbursment',
  PrimeTrustCreateAssetTransferInternal = 'primeTrustCreateAssetTransferInternal',
  PrimeTrustCreateAssetTransferMethod = 'primeTrustCreateAssetTransferMethod',
  PrimeTrustCreateDepositFundsViaWire = 'primeTrustCreateDepositFundsViaWire',
  PrimeTrustCreateWithdrawalFunds = 'primeTrustCreateWithdrawalFunds',
  PrimeTrustGetAccount = 'primeTrustGetAccount',
  PrimeTrustGetAssetByCurrency = 'primeTrustGetAssetByCurrency',
  PrimeTrustGetAssetTotalById = 'primeTrustGetAssetTotalById',
  PrimeTrustGetAssetTotals = 'primeTrustGetAssetTotals',
  PrimeTrustGetAssetTransferInternal = 'primeTrustGetAssetTransferInternal',
  PrimeTrustGetAssetTransferMethod = 'primeTrustGetAssetTransferMethod',
  Receive = 'receive',
  RemoveBlackCountry = 'removeBlackCountry',
  RemoveRole = 'removeRole',
  RestoreUser = 'restoreUser',
  Sell = 'sell',
  Send = 'send',
  SettleTransaction = 'settleTransaction',
  Signup = 'signup',
  System = 'system',
  Transfer = 'transfer',
  UnbenchmarkInsufficient = 'unbenchmarkInsufficient',
  UnbenchmarkTransaction = 'unbenchmarkTransaction',
  UpdateCostSettings = 'updateCostSettings',
  UpdateFeeSettings = 'updateFeeSettings',
  UpdateKycLevelSettings = 'updateKycLevelSettings',
  UpdateKycTierSettings = 'updateKycTierSettings',
  UpdateSettings = 'updateSettings',
  UpdateTransaction = 'updateTransaction',
  UpdateUser = 'updateUser',
  UpdateWireTransferBankAccount = 'updateWireTransferBankAccount'
}

export type UserAddress = {
  __typename?: 'UserAddress';
  address?: Maybe<Scalars['ID']['output']>;
  addressFormat?: Maybe<Scalars['String']['output']>;
  asset?: Maybe<Scalars['String']['output']>;
  assetOriginalId?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  interim?: Maybe<Scalars['Boolean']['output']>;
  legacyAddress?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  vaultId?: Maybe<Scalars['String']['output']>;
};

export type UserAddressListResult = {
  __typename?: 'UserAddressListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserAddress>>;
};

export enum UserBalanceHistoryPeriod {
  All = 'All',
  LastMonth = 'LastMonth',
  LastWeek = 'LastWeek',
  LastYear = 'LastYear'
}

export type UserBalanceHistoryRecord = {
  __typename?: 'UserBalanceHistoryRecord';
  asset: Scalars['String']['output'];
  balance?: Maybe<Scalars['Float']['output']>;
  balanceEur?: Maybe<Scalars['Float']['output']>;
  balanceFiat?: Maybe<Scalars['Float']['output']>;
  date: Scalars['DateTime']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
  userBalanceId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserBalanceHistoryRecordListResult = {
  __typename?: 'UserBalanceHistoryRecordListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Maybe<UserBalanceHistoryRecord>>>;
};

export type UserBankAccount = {
  __typename?: 'UserBankAccount';
  bankAddress?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  beneficiaryAddress?: Maybe<Scalars['String']['output']>;
  beneficiaryName?: Maybe<Scalars['String']['output']>;
  created: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  iban?: Maybe<Scalars['String']['output']>;
  swiftBic?: Maybe<Scalars['String']['output']>;
  userBankAccountId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserBankAccountInput = {
  bankAddress?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  beneficiaryAddress?: InputMaybe<Scalars['String']['input']>;
  beneficiaryName?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  iban?: InputMaybe<Scalars['String']['input']>;
  swiftBic?: InputMaybe<Scalars['String']['input']>;
};

export type UserContact = {
  __typename?: 'UserContact';
  address?: Maybe<Scalars['String']['output']>;
  assetId?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  userContactId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type UserContactInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  assetId?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type UserContactListResult = {
  __typename?: 'UserContactListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserContact>>;
};

export type UserCurrencyProfit = {
  __typename?: 'UserCurrencyProfit';
  currencyFrom?: Maybe<Scalars['String']['output']>;
  profit?: Maybe<Scalars['Float']['output']>;
  profitEur?: Maybe<Scalars['Float']['output']>;
  profitFiat?: Maybe<Scalars['Float']['output']>;
  profitPercent?: Maybe<Scalars['Float']['output']>;
  userBalanceHistory?: Maybe<UserBalanceHistoryRecordListResult>;
};

export type UserDevice = {
  __typename?: 'UserDevice';
  area?: Maybe<Scalars['Int']['output']>;
  browser?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  device?: Maybe<Scalars['String']['output']>;
  deviceConfirmed?: Maybe<Scalars['DateTime']['output']>;
  eu?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  metro?: Maybe<Scalars['Int']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  userDeviceId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type UserDeviceListResult = {
  __typename?: 'UserDeviceListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Maybe<UserDevice>>>;
};

export type UserInput = {
  accountStatus?: InputMaybe<AccountStatus>;
  addressEndDate?: InputMaybe<Scalars['DateTime']['input']>;
  addressStartDate?: InputMaybe<Scalars['DateTime']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  birthday?: InputMaybe<Scalars['DateTime']['input']>;
  buildingName?: InputMaybe<Scalars['String']['input']>;
  buildingNumber?: InputMaybe<Scalars['String']['input']>;
  changePasswordRequired?: InputMaybe<Scalars['Boolean']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  companyRegisterNumber?: InputMaybe<Scalars['String']['input']>;
  companyType?: InputMaybe<Scalars['String']['input']>;
  countryCode2?: InputMaybe<Scalars['String']['input']>;
  countryCode3?: InputMaybe<Scalars['String']['input']>;
  defaultCryptoCurrency?: InputMaybe<Scalars['String']['input']>;
  defaultFiatCurrency?: InputMaybe<Scalars['String']['input']>;
  deleted?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  flag?: InputMaybe<Scalars['Boolean']['input']>;
  flatNumber?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  kycProvider?: InputMaybe<KycProvider>;
  kycTierId?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<UserMode>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postCode?: InputMaybe<Scalars['String']['input']>;
  risk?: InputMaybe<RiskLevel>;
  riskCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  stateName?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  subStreet?: InputMaybe<Scalars['String']['input']>;
  termsOfUse?: InputMaybe<Scalars['Boolean']['input']>;
  town?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<UserType>;
  widgetId?: InputMaybe<Scalars['String']['input']>;
};

export type UserKycHistory = {
  __typename?: 'UserKycHistory';
  kycApplicantId?: Maybe<Scalars['String']['output']>;
  kycDocs?: Maybe<Array<Scalars['String']['output']>>;
  kycLevelName?: Maybe<Scalars['String']['output']>;
  kycPrivateComment?: Maybe<Scalars['String']['output']>;
  kycProvider?: Maybe<Scalars['String']['output']>;
  kycReviewComment?: Maybe<Scalars['String']['output']>;
  kycReviewDate?: Maybe<Scalars['DateTime']['output']>;
  kycReviewRejectedLabels?: Maybe<Array<Scalars['String']['output']>>;
  kycReviewRejectedType?: Maybe<Scalars['String']['output']>;
  kycReviewResult?: Maybe<Scalars['String']['output']>;
  kycStatus?: Maybe<Scalars['String']['output']>;
  kycStatusDate?: Maybe<Scalars['DateTime']['output']>;
  kycStatusUpdateRequired?: Maybe<Scalars['Boolean']['output']>;
  kycTierId?: Maybe<Scalars['String']['output']>;
  kycValid?: Maybe<Scalars['Boolean']['output']>;
  kycValidationTierId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userKycHistoryId?: Maybe<Scalars['String']['output']>;
};

export type UserListResult = {
  __typename?: 'UserListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<User>>;
};

export type UserLogin = {
  __typename?: 'UserLogin';
  date: Scalars['DateTime']['output'];
  ip?: Maybe<Scalars['String']['output']>;
  result: Scalars['Int']['output'];
  resultTokenAction?: Maybe<Scalars['String']['output']>;
  userDeviceId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userLoginId?: Maybe<Scalars['String']['output']>;
};

export enum UserMode {
  ExternalWallet = 'ExternalWallet',
  InternalWallet = 'InternalWallet',
  OneTimeWallet = 'OneTimeWallet'
}

export type UserNotification = {
  __typename?: 'UserNotification';
  created?: Maybe<Scalars['DateTime']['output']>;
  linkedId?: Maybe<Scalars['String']['output']>;
  linkedTable?: Maybe<Scalars['String']['output']>;
  params?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  transactionStatus?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
  userNotificationId: Scalars['ID']['output'];
  userNotificationLevel?: Maybe<UserNotificationLevel>;
  userNotificationTypeCode: Scalars['String']['output'];
  viewed?: Maybe<Scalars['DateTime']['output']>;
};

export enum UserNotificationCodes {
  AdminToUserNotification = 'ADMIN_TO_USER_NOTIFICATION',
  AskTransactionRedo = 'ASK_TRANSACTION_REDO',
  KycStatusChanged = 'KYC_STATUS_CHANGED',
  TestNotification = 'TEST_NOTIFICATION',
  TransactionConfirmation = 'TRANSACTION_CONFIRMATION',
  TransactionDeclinedAdminNotification = 'TRANSACTION_DECLINED_ADMIN_NOTIFICATION',
  TransactionStatusChanged = 'TRANSACTION_STATUS_CHANGED'
}

export enum UserNotificationLevel {
  Debug = 'Debug',
  Error = 'Error',
  Info = 'Info',
  Request = 'Request',
  Warning = 'Warning'
}

export type UserNotificationListResult = {
  __typename?: 'UserNotificationListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserNotification>>;
};

export type UserNotificationSubscription = {
  __typename?: 'UserNotificationSubscription';
  emailNotification?: Maybe<Scalars['Boolean']['output']>;
  siteNotification?: Maybe<Scalars['Boolean']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userNotificationSubscriptionId?: Maybe<Scalars['ID']['output']>;
  userNotificationTypeCode: Scalars['String']['output'];
};

export type UserNotificationSubscriptionInput = {
  emailNotification?: InputMaybe<Scalars['Boolean']['input']>;
  siteNotification?: InputMaybe<Scalars['Boolean']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  userNotificationTypeCode: Scalars['String']['input'];
};

export type UserNotificationSubscriptionListResult = {
  __typename?: 'UserNotificationSubscriptionListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserNotificationSubscription>>;
};

export type UserNotificationType = {
  __typename?: 'UserNotificationType';
  description?: Maybe<Scalars['String']['output']>;
  emailNotificationDefault?: Maybe<Scalars['Boolean']['output']>;
  emailNotificationImmutable?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  siteNotificationDefault?: Maybe<Scalars['Boolean']['output']>;
  siteNotificationImmutable?: Maybe<Scalars['Boolean']['output']>;
  userNotificationTypeCode: Scalars['ID']['output'];
};

export type UserNotificationTypeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  emailNotificationDefault?: InputMaybe<Scalars['Boolean']['input']>;
  emailNotificationImmutable?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  siteNotificationDefault?: InputMaybe<Scalars['Boolean']['input']>;
  siteNotificationImmutable?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserNotificationTypeListResult = {
  __typename?: 'UserNotificationTypeListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserNotificationType>>;
};

export type UserProfit = {
  __typename?: 'UserProfit';
  currencyTo?: Maybe<Scalars['String']['output']>;
  period: UserBalanceHistoryPeriod;
  profits?: Maybe<Array<UserCurrencyProfit>>;
  userId: Scalars['String']['output'];
};

export type UserProfitInput = {
  currencyTo?: InputMaybe<Scalars['String']['input']>;
  period: UserBalanceHistoryPeriod;
};

export type UserRole = {
  __typename?: 'UserRole';
  code: Scalars['String']['output'];
  immutable?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  userRoleId?: Maybe<Scalars['String']['output']>;
};

export enum UserRoleObjectCode {
  AccountBalanceTracker = 'ACCOUNT_BALANCE_TRACKER',
  Affiliates = 'AFFILIATES',
  BankAccounts = 'BANK_ACCOUNTS',
  ChargebackRate = 'CHARGEBACK_RATE',
  Contacts = 'CONTACTS',
  Costs = 'COSTS',
  CountryBlackList = 'COUNTRY_BLACK_LIST',
  CreateNewTransaction = 'CREATE_NEW_TRANSACTION',
  Customers = 'CUSTOMERS',
  Dashboard = 'DASHBOARD',
  DashboardMerchant = 'DASHBOARD_MERCHANT',
  DashboardWalletBalances = 'DASHBOARD_WALLET_BALANCES',
  Exchanger = 'EXCHANGER',
  Fees = 'FEES',
  Kyc = 'KYC',
  MerchantWidget = 'MERCHANT_WIDGET',
  Messages = 'MESSAGES',
  Notifications = 'NOTIFICATIONS',
  QuickCheckout = 'QUICK_CHECKOUT',
  Reconciliation = 'RECONCILIATION',
  Risks = 'RISKS',
  Roles = 'ROLES',
  RollingReserves = 'ROLLING_RESERVES',
  Settings = 'SETTINGS',
  SystemUsers = 'SYSTEM_USERS',
  Transactions = 'TRANSACTIONS',
  TransactionHistoryLog = 'TRANSACTION_HISTORY_LOG',
  UsersEmails = 'USERS_EMAILS',
  UsersPhones = 'USERS_PHONES',
  UserActions = 'USER_ACTIONS',
  Wallets = 'WALLETS',
  Widgets = 'WIDGETS'
}

export type UserRolePermission = {
  __typename?: 'UserRolePermission';
  fullAccess: Scalars['Boolean']['output'];
  objectCode: Scalars['String']['output'];
  objectDescription: Scalars['String']['output'];
  objectName: Scalars['String']['output'];
  roleCode: Scalars['String']['output'];
  roleName: Scalars['String']['output'];
};

export type UserShort = {
  __typename?: 'UserShort';
  accountStatus?: Maybe<AccountStatus>;
  avatar?: Maybe<Scalars['String']['output']>;
  birthday?: Maybe<Scalars['DateTime']['output']>;
  countryCode2?: Maybe<Scalars['String']['output']>;
  countryCode3?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  defaultCryptoCurrency?: Maybe<Scalars['String']['output']>;
  defaultFiatCurrency?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  kycDocs?: Maybe<Array<Scalars['String']['output']>>;
  kycReviewComment?: Maybe<Scalars['String']['output']>;
  kycStatus?: Maybe<Scalars['String']['output']>;
  kycTier?: Maybe<SettingsKycTierShort>;
  kycTierId?: Maybe<Scalars['String']['output']>;
  kycValid?: Maybe<Scalars['Boolean']['output']>;
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  risk?: Maybe<RiskLevel>;
  riskAlertCount?: Maybe<Scalars['Int']['output']>;
  riskCodes?: Maybe<Array<Scalars['String']['output']>>;
  totalTransactionCount?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<UserType>;
};

export type UserState = {
  __typename?: 'UserState';
  date?: Maybe<Scalars['DateTime']['output']>;
  externalWallets?: Maybe<Array<ExternalWallet>>;
  fiatVaults?: Maybe<Array<FiatVault>>;
  kycProviderLink?: Maybe<Scalars['String']['output']>;
  notifications?: Maybe<UserNotificationListResult>;
  totalAmountEur?: Maybe<Scalars['Float']['output']>;
  transactionSummary?: Maybe<Array<UserTransactionSummary>>;
  vaults?: Maybe<Array<VaultAccountEx>>;
};


export type UserStateExternalWalletsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type UserStateNotificationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserStateInput = {
  currencySearch?: InputMaybe<Scalars['String']['input']>;
  currencyTo?: InputMaybe<Scalars['String']['input']>;
};

export type UserTransactionStats = {
  __typename?: 'UserTransactionStats';
  amount?: Maybe<Scalars['Float']['output']>;
  amountEur?: Maybe<Scalars['Float']['output']>;
  amountFiat?: Maybe<Scalars['Float']['output']>;
  transactionCount?: Maybe<Scalars['Int']['output']>;
};

export enum UserTransactionStatus {
  Canceled = 'Canceled',
  Completed = 'Completed',
  Confirming = 'Confirming',
  Declined = 'Declined',
  New = 'New',
  Processing = 'Processing',
  Refund = 'Refund',
  SendingError = 'SendingError',
  UnderReview = 'UnderReview'
}

export type UserTransactionSummary = {
  __typename?: 'UserTransactionSummary';
  assetId?: Maybe<Scalars['String']['output']>;
  in?: Maybe<UserTransactionStats>;
  out?: Maybe<UserTransactionStats>;
};

export enum UserType {
  Merchant = 'Merchant',
  Personal = 'Personal'
}

export type UserVaultIdObj = {
  __typename?: 'UserVaultIdObj';
  additionalSettings?: Maybe<Scalars['String']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  custodyProvider?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  disabled?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  originalId?: Maybe<Scalars['String']['output']>;
  subWallets?: Maybe<Array<Scalars['String']['output']>>;
  userId?: Maybe<Scalars['String']['output']>;
  userVaultId?: Maybe<Scalars['ID']['output']>;
};

export type UserVaultIdObjListResult = {
  __typename?: 'UserVaultIdObjListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<UserVaultIdObj>>;
};

export type VaultAccount = {
  __typename?: 'VaultAccount';
  assets?: Maybe<Array<VaultAccountAsset>>;
  custodyProviderLink?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rawData?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type VaultAccountAsset = {
  __typename?: 'VaultAccountAsset';
  addresses?: Maybe<Array<VaultAccountAssetAddress>>;
  available?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  lockedAmount?: Maybe<Scalars['Float']['output']>;
  originalId?: Maybe<Scalars['String']['output']>;
  pending?: Maybe<Scalars['Float']['output']>;
  pendingRefundCPU?: Maybe<Scalars['String']['output']>;
  pendingRefundNetwork?: Maybe<Scalars['String']['output']>;
  selfStakedCPU?: Maybe<Scalars['String']['output']>;
  selfStakedNetwork?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  totalStakedCPU?: Maybe<Scalars['String']['output']>;
  totalStakedNetwork?: Maybe<Scalars['String']['output']>;
};

export type VaultAccountAssetAddress = {
  __typename?: 'VaultAccountAssetAddress';
  address?: Maybe<Scalars['String']['output']>;
  addressFormat?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  legacyAddress?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type VaultAccountEx = {
  __typename?: 'VaultAccountEx';
  assets?: Maybe<Array<VaultAccountAsset>>;
  availableBalanceEur?: Maybe<Scalars['Float']['output']>;
  availableBalanceFiat?: Maybe<Scalars['Float']['output']>;
  balancesPerAsset?: Maybe<Array<BalancePerAsset>>;
  custodyProviderLink?: Maybe<Scalars['String']['output']>;
  default?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rawData?: Maybe<Scalars['String']['output']>;
  totalBalanceEur?: Maybe<Scalars['Float']['output']>;
  totalBalanceFiat?: Maybe<Scalars['Float']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};


export type VaultAccountExAssetsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderBy>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum WalletAssetStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Rejected = 'REJECTED',
  WaitingForApproval = 'WAITING_FOR_APPROVAL'
}

export type Widget = {
  __typename?: 'Widget';
  additionalSettings?: Maybe<Scalars['String']['output']>;
  allowToPayIfKycFailed?: Maybe<Scalars['Boolean']['output']>;
  code: Scalars['String']['output'];
  countriesCode2?: Maybe<Array<Scalars['String']['output']>>;
  created: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByUser?: Maybe<User>;
  currenciesCrypto?: Maybe<Array<Scalars['String']['output']>>;
  currenciesFiat?: Maybe<Array<Scalars['String']['output']>>;
  currentUserEmail?: Maybe<Scalars['String']['output']>;
  currentUserParams?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  destinationAddress?: Maybe<Array<WidgetDestination>>;
  fee?: Maybe<Scalars['Float']['output']>;
  getcoinsPaymentWidgetId?: Maybe<Scalars['String']['output']>;
  hasFixedAddress: Scalars['Boolean']['output'];
  instruments?: Maybe<Array<PaymentInstrument>>;
  liquidityProvider?: Maybe<LiquidityProvider>;
  masked: Scalars['Boolean']['output'];
  merchantFeeAddress?: Maybe<Array<WidgetDestination>>;
  merchantFeeMinAmount?: Maybe<Scalars['Float']['output']>;
  merchantFeePercent?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  newVaultPerTransaction?: Maybe<Scalars['Boolean']['output']>;
  paymentProviders?: Maybe<Array<Scalars['String']['output']>>;
  secret?: Maybe<Scalars['String']['output']>;
  transactionTypes?: Maybe<Array<TransactionType>>;
  userCode?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  widgetId: Scalars['ID']['output'];
};

export type WidgetDestination = {
  __typename?: 'WidgetDestination';
  currency: Scalars['String']['output'];
  destination: Scalars['String']['output'];
};

export type WidgetDestinationInput = {
  currency: Scalars['String']['input'];
  destination: Scalars['String']['input'];
};

export type WidgetInput = {
  additionalSettings?: InputMaybe<Scalars['String']['input']>;
  allowToPayIfKycFailed?: InputMaybe<Scalars['Boolean']['input']>;
  countriesCode2?: InputMaybe<Array<Scalars['String']['input']>>;
  currenciesCrypto?: InputMaybe<Array<Scalars['String']['input']>>;
  currenciesFiat?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  destinationAddress?: InputMaybe<Array<InputMaybe<WidgetDestinationInput>>>;
  fee?: InputMaybe<Scalars['Float']['input']>;
  instruments?: InputMaybe<Array<PaymentInstrument>>;
  liquidityProvider?: InputMaybe<LiquidityProvider>;
  masked?: InputMaybe<Scalars['Boolean']['input']>;
  merchantFeeAddress?: InputMaybe<Array<WidgetDestinationInput>>;
  merchantFeeMinAmount?: InputMaybe<Scalars['Float']['input']>;
  merchantFeePercent?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  newVaultPerTransaction?: InputMaybe<Scalars['Boolean']['input']>;
  paymentProviders?: InputMaybe<Array<Scalars['String']['input']>>;
  secret?: InputMaybe<Scalars['String']['input']>;
  transactionTypes?: InputMaybe<Array<TransactionType>>;
};

export type WidgetListResult = {
  __typename?: 'WidgetListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<Widget>>;
};

export type WidgetShort = {
  __typename?: 'WidgetShort';
  additionalSettings?: Maybe<Scalars['String']['output']>;
  allowToPayIfKycFailed?: Maybe<Scalars['Boolean']['output']>;
  code: Scalars['String']['output'];
  currenciesCrypto?: Maybe<Array<Scalars['String']['output']>>;
  currenciesFiat?: Maybe<Array<Scalars['String']['output']>>;
  currentUserEmail?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hasFixedAddress: Scalars['Boolean']['output'];
  instruments?: Maybe<Array<PaymentInstrument>>;
  masked: Scalars['Boolean']['output'];
  merchantFeeAddress?: Maybe<Array<WidgetDestination>>;
  merchantFeeMinAmount?: Maybe<Scalars['Float']['output']>;
  merchantFeePercent?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  newVaultPerTransaction?: Maybe<Scalars['Boolean']['output']>;
  paymentProviders?: Maybe<Array<Scalars['String']['output']>>;
  transactionTypes?: Maybe<Array<TransactionType>>;
  widgetId: Scalars['ID']['output'];
};

export type WidgetUpdateInput = {
  additionalSettings?: InputMaybe<Scalars['String']['input']>;
  allowToPayIfKycFailed?: InputMaybe<Scalars['Boolean']['input']>;
  countriesCode2?: InputMaybe<Array<Scalars['String']['input']>>;
  currenciesCrypto?: InputMaybe<Array<Scalars['String']['input']>>;
  currenciesFiat?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  destinationAddress?: InputMaybe<Array<InputMaybe<WidgetDestinationInput>>>;
  fee?: InputMaybe<Scalars['Float']['input']>;
  instruments?: InputMaybe<Array<PaymentInstrument>>;
  liquidityProvider?: InputMaybe<LiquidityProvider>;
  masked?: InputMaybe<Scalars['Boolean']['input']>;
  merchantFeeAddress?: InputMaybe<Array<WidgetDestinationInput>>;
  merchantFeeMinAmount?: InputMaybe<Scalars['Float']['input']>;
  merchantFeePercent?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  newVaultPerTransaction?: InputMaybe<Scalars['Boolean']['input']>;
  paymentProviders?: InputMaybe<Array<Scalars['String']['input']>>;
  secret?: InputMaybe<Scalars['String']['input']>;
  transactionTypes?: InputMaybe<Array<TransactionType>>;
  userId: Scalars['String']['input'];
};

export type WidgetUserParams = {
  __typename?: 'WidgetUserParams';
  created?: Maybe<Scalars['DateTime']['output']>;
  executed?: Maybe<Scalars['DateTime']['output']>;
  merchantFeeAddress?: Maybe<Scalars['String']['output']>;
  merchantFeeMinAmount?: Maybe<Scalars['Float']['output']>;
  merchantFeePercent?: Maybe<Scalars['Float']['output']>;
  params?: Maybe<Scalars['String']['output']>;
  userAddress?: Maybe<Scalars['String']['output']>;
  userBirthday?: Maybe<Scalars['DateTime']['output']>;
  userEmail: Scalars['String']['output'];
  userFirstName?: Maybe<Scalars['String']['output']>;
  userGender?: Maybe<Gender>;
  userId?: Maybe<Scalars['String']['output']>;
  userLastName?: Maybe<Scalars['String']['output']>;
  userPhone?: Maybe<Scalars['String']['output']>;
  widgetId?: Maybe<Scalars['String']['output']>;
  widgetUserParamsId?: Maybe<Scalars['ID']['output']>;
};

export type WidgetUserParamsChanges = {
  merchantFeePercent?: InputMaybe<Scalars['Float']['input']>;
};

export type WidgetUserParamsInput = {
  merchantFeeAddress?: InputMaybe<Scalars['String']['input']>;
  merchantFeeMinAmount?: InputMaybe<Scalars['Float']['input']>;
  merchantFeePercent?: InputMaybe<Scalars['Float']['input']>;
  params?: InputMaybe<Scalars['String']['input']>;
  userAddress?: InputMaybe<Scalars['String']['input']>;
  userBirthday?: InputMaybe<Scalars['DateTime']['input']>;
  userEmail: Scalars['String']['input'];
  userFirstName?: InputMaybe<Scalars['String']['input']>;
  userGender?: InputMaybe<Gender>;
  userLastName?: InputMaybe<Scalars['String']['input']>;
  userPhone?: InputMaybe<Scalars['String']['input']>;
  widgetId: Scalars['String']['input'];
};

export type WireTransferBankAccount = {
  __typename?: 'WireTransferBankAccount';
  au?: Maybe<Scalars['String']['output']>;
  bankAccountId: Scalars['ID']['output'];
  created: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deleted?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  eu?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  objectsDetails?: Maybe<Array<Maybe<BankDetailsObject>>>;
  paymentProviders?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  uk?: Maybe<Scalars['String']['output']>;
};

export type WireTransferBankAccountInput = {
  au?: InputMaybe<Scalars['String']['input']>;
  deleted?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eu?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  paymentProviders?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  uk?: InputMaybe<Scalars['String']['input']>;
};

export type WireTransferBankAccountListResult = {
  __typename?: 'WireTransferBankAccountListResult';
  count?: Maybe<Scalars['Int']['output']>;
  list?: Maybe<Array<WireTransferBankAccount>>;
};

export type WireTransferBankAccountShort = {
  __typename?: 'WireTransferBankAccountShort';
  au?: Maybe<Scalars['String']['output']>;
  bankAccountId: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eu?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  objectsDetails?: Maybe<Array<Maybe<BankDetailsObject>>>;
  paymentProviders?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  uk?: Maybe<Scalars['String']['output']>;
};

export enum WireTransferPaymentCategory {
  Au = 'AU',
  Eu = 'EU',
  Uk = 'UK'
}

export enum YapilyAuthorizationRequestStatus {
  Ailed = 'AILED',
  Authorized = 'AUTHORIZED',
  AwaitingAuthorization = 'AWAITING_AUTHORIZATION',
  AwaitingDecoupledAuthorization = 'AWAITING_DECOUPLED_AUTHORIZATION',
  AwaitingDecoupledPreAuthorization = 'AWAITING_DECOUPLED_PRE_AUTHORIZATION',
  AwaitingFurtherAuthorization = 'AWAITING_FURTHER_AUTHORIZATION',
  AwaitingPreAuthorization = 'AWAITING_PRE_AUTHORIZATION',
  AwaitingReAuthorization = 'AWAITING_RE_AUTHORIZATION',
  AwaitingScaCode = 'AWAITING_SCA_CODE',
  AwaitingScaMethod = 'AWAITING_SCA_METHOD',
  Consumed = 'CONSUMED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Invalid = 'INVALID',
  PreAuthorized = 'PRE_AUTHORIZED',
  Rejected = 'REJECTED',
  Revoked = 'REVOKED',
  Unknown = 'UNKNOWN'
}

export type YapilyOpenBankingDetails = {
  __typename?: 'YapilyOpenBankingDetails';
  banks?: Maybe<Array<Maybe<PaymentBank>>>;
  countries?: Maybe<Array<Maybe<InstitutionCountry>>>;
};

export type YapilyPreauthObject = {
  __typename?: 'YapilyPreauthObject';
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type LiquidityProviderBalance = {
  __typename?: 'liquidityProviderBalance';
  balance?: Maybe<Scalars['Float']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
};

export type TransactionTypeSetting = {
  __typename?: 'transactionTypeSetting';
  allowChange?: Maybe<Scalars['Boolean']['output']>;
  transactionType?: Maybe<TransactionType>;
};
