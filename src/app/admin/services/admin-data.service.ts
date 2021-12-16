import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef, WatchQueryOptions } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { CostScheme } from '../../model/cost-scheme.model';
import { FeeScheme } from '../../model/fee-scheme.model';
import {
  AssetAddress,
  AssetAddressListResult,
  CountryCodeType,
  DashboardStats,
  QueryGetDashboardStatsArgs,
  QueryGetNotificationsArgs, QueryGetRiskAlertsArgs,
  QueryGetSettingsFeeArgs,
  QueryGetSettingsKycArgs,
  QueryGetSettingsKycLevelsArgs,
  QueryGetTransactionsArgs,
  QueryGetUsersArgs,
  QueryGetWalletsArgs,
  QueryGetWidgetsArgs, RiskAlertResultList,
  SettingsCommon,
  SettingsFeeListResult, SettingsKycLevelListResult,
  SettingsKycListResult,
  Transaction,
  TransactionListResult,
  User,
  UserListResult,
  UserNotificationLevel,
  UserNotificationListResult,
  UserType,
  Widget,
  WidgetListResult
} from '../../model/generated-models';
import { KycLevel, KycScheme } from '../../model/identification.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionItemDeprecated } from '../../model/transaction.model';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { ApolloQueryResult, FetchResult, MutationOptions } from '@apollo/client/core';
import { ErrorService } from '../../services/error.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Filter } from '../model/filter.model';
import { UserItem } from '../../model/user.model';
import { WalletItem } from '../model/wallet.model';
import { NotificationItem } from '../../model/notification.model';
import { WidgetItem } from '../model/widget.model';
import { RiskAlertItem } from '../model/risk-alert.model';

/* region queries */

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats(
    $userIdOnly: [String!],
    $widgetIdOnly: [String!],
    $sourcesOnly: [TransactionSource!],
    $countriesOnly: [String!],
    $countryCodeType: CountryCodeType,
    $accountTypesOnly: [UserType!]
  ) {
    getDashboardStats(
      userIdOnly: $userIdOnly
      widgetIdOnly: $widgetIdOnly
      sourcesOnly: $sourcesOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      accountTypesOnly: $accountTypesOnly
    ) {
      deposits {
        approved {count, volume},
        declined {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        byInstruments {
          instrument,
          approved {count, volume},
          declined {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume},
          ratio
        }
      }
      transfers {
        approved {count, volume},
        declined {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        toMerchant {
          instrument,
          approved {count, volume},
          declined {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
          ratio
        },
        toCustomer {
          instrument,
          approved {count, volume},
          declined {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume},
          ratio
        }
      }
      withdrawals {
        approved {count, volume},
        declined {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        byInstruments {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        }
      }
      exchanges {
        approved {count, volume},
        declined {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        ratio,
        toMerchant {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        },
        toCustomer {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        },
        fee {count, volume}
      }
      balances {
        currency,
        volume {count, volume}
      }
    }
  }
`;

const GET_FEE_SETTINGS = gql`
  query GetSettingsFee {
    getSettingsFee(
      filter: ""
      orderBy: [
        { orderBy: "default", desc: true }
        { orderBy: "name", desc: false }
      ]
    ) {
      count
      list {
        settingsFeeId
        name
        default
        description
        terms
        wireDetails
        targetInstruments
        targetUserTypes
        targetUserModes
        targetPaymentProviders
        targetTransactionTypes
        targetFilterType
        targetFilterValues
        currency
        rateToEur
      }
    }
  }
`;

const GET_COST_SETTINGS = gql`
  query GetSettingsCost {
    getSettingsCost(
      filter: ""
      orderBy: [
        { orderBy: "default", desc: true }
        { orderBy: "name", desc: false }
      ]
    ) {
      count
      list {
        settingsCostId
        name
        default
        description
        terms
        targetFilterType
        targetFilterValues
        targetInstruments
        targetTransactionTypes
        targetPaymentProviders
      }
    }
  }
`;

const GET_KYC_SETTINGS = gql`
  query GetSettingsKyc {
    getSettingsKyc(
      filter: ""
      orderBy: [
        { orderBy: "default", desc: true }
        { orderBy: "name", desc: false }
      ]
    ) {
      count
      list {
        default
        settingsKycId
        name
        description
        targetKycProviders
        targetUserType
        targetUserModes
        targetFilterType
        targetFilterValues
        requireUserFullName
        requireUserPhone
        requireUserBirthday
        requireUserAddress
        requireUserFlatNumber
        levels {
          settingsKycLevelId
          name
          data
          description
          order
        }
      }
    }
  }
`;

const GET_KYC_LEVELS = gql`
  query GetSettingsKycLevels($filter: String) {
    getSettingsKycLevels(
      filter: $filter
      orderBy: [{ orderBy: "name", desc: false }]
    ) {
      count
      list {
        settingsKycLevelId
        name
        description
        userType
        data
        order
        created
        createdBy
      }
    }
  }
`;

const GET_NOTIFICATIONS = gql`
  query GetNotifications(
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
    $filter: String
  ) {
    getNotifications(
      skip: $skip
      first: $first
      orderBy: $orderBy
      filter: $filter
    ) {
      count
      list {
        created
        linkedId
        linkedTable
        params
        text
        title
        user {
          email
        }
        userId
        userNotificationId
        userNotificationLevel
        userNotificationTypeCode
        viewed
      }
    }
  }
`;

const GET_RISK_ALERTS = gql`
  query GetRiskAlerts(
    $userId: String
    $code: RiskAlertCodes
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getRiskAlerts(
      userId: $userId
      code: $code
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        created
        details
        riskAlertId
        riskAlertTypeCode
        userId
      }
    }
  }
`;

const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $transactionIdsOnly: [String!]
    $userIdsOnly: [String!]
    $sourcesOnly: [TransactionSource!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getTransactions(
      transactionIdsOnly: $transactionIdsOnly
      userIdsOnly: $userIdsOnly
      sourcesOnly: $sourcesOnly
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        transactionId
        code
        userId
        userIp
        user {
          userId
          email
          firstName
          lastName
          postCode
          town
          street
          subStreet
          stateName
          buildingName
          buildingNumber
          flatNumber
          countryCode2
          type
          mode
          kycStatus
        }
        created
        executed
        type
        source
        status
        feeFiat
        feeMinFiat
        feePercent
        feeDetails
        currencyToSpend
        amountToSpend
        currencyToReceive
        amountToReceive
        rate
        liquidityProvider
        instrument
        paymentProvider
        paymentOrder {
          orderId
          amount
          currency
          operations {
            operationId
            created
            type
            sn
            status
            details
            callbackDetails
            errorCode
            errorMessage
          }
          originalOrderId
          preauthOperationSn
          captureOperationSn
          refundOperationSn
          paymentInfo
        }
        data
        destination
        kycStatus
      }
    }
  }
`;

const GET_USERS = gql`
  query GetUsers(
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getUsers(filter: $filter, skip: $skip, first: $first, orderBy: $orderBy) {
      count
      list {
        userId
        email
        firstName
        lastName
        type
        mode
        countryCode2
        countryCode3
        created
        defaultFiatCurrency
        defaultCryptoCurrency
        kycStatus
        phone
        postCode
        town
        street
        subStreet
        stateName
        buildingName
        buildingNumber
        flatNumber
        referralCode
      }
    }
  }
`;

const GET_WALLETS = gql`
  query GetWallets(
    $userIdsOnly: [String!]
    $assetIdsOnly: [String!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWallets(
      userIdsOnly: $userIdsOnly
      assetIdsOnly: $assetIdsOnly
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        address
        legacyAddress
        description
        type
        addressFormat
        assetId
        originalId
        total
        available
        pending
        lockedAmount
        vaultId
        vaultName
        userId
        userEmail
        custodyProvider
      }
    }
  }
`;

const GET_WIDGET_IDS = gql`
  query GetWidgetIds(
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWidgets(filter: $filter, skip: $skip, first: $first, orderBy: $orderBy) {
      count
      list {
        widgetId
      }
    }
  }
`;

const GET_WIDGETS = gql`
  query GetWidgets(
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWidgets(filter: $filter, skip: $skip, first: $first, orderBy: $orderBy) {
      count
      list {
        widgetId
        userId
        created
        transactionTypes
        currenciesFrom
        currenciesTo
        destinationAddress
        countriesCode2
        instruments
        paymentProviders
        liquidityProvider
      }
    }
  }
`;

const GET_SETTINGS_COMMON = gql`
query {
    getSettingsCommon {
      settingsCommonId,
      liquidityProvider,
      custodyProvider,
      kycProvider,
      adminEmails,
      stoppedForServicing,
      additionalSettings
    }
  }
`;

const UPDATE_SETTINGS_COMMON = gql`
  mutation UpdateSettingsCommon(
    $settingsId: ID!
    $liquidityProvider: String!
    $custodyProvider: String!
    $kycProvider: String!
    $adminEmails: [String!]
    $stoppedForServicing: Boolean!
    $additionalSettings: String
  ) {
    updateSettingsCommon(
      settingsId: $settingsId,
      settings: {
        liquidityProvider: $liquidityProvider
        custodyProvider: $custodyProvider
        kycProvider: $kycProvider
        adminEmails: $adminEmails
        stoppedForServicing: $stoppedForServicing
        additionalSettings: $additionalSettings
      }
    ) {
      settingsCommonId
    }
  }
`;


const ADD_SETTINGS_FEE = gql`
  mutation AddSettingsFee(
    $name: String!
    $description: String
    $targetFilterType: SettingsFeeTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetUserTypes: [UserType!]
    $targetUserModes: [UserMode!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
    $wireDetails: String!
  ) {
    addSettingsFee(
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetUserTypes: $targetUserTypes
        targetUserModes: $targetUserModes
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
        wireDetails: $wireDetails
      }
    ) {
      settingsFeeId
    }
  }
`;

const ADD_SETTINGS_COST = gql`
  mutation AddSettingsCost(
    $name: String!
    $description: String
    $targetFilterType: SettingsCostTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
  ) {
    addSettingsCost(
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
      }
    ) {
      settingsCostId
    }
  }
`;

const ADD_SETTINGS_KYC = gql`
  mutation AddSettingsKyc(
    $name: String!
    $description: String
    $targetKycProviders: [KycProvider!]
    $targetUserType: UserType!
    $targetUserModes: [UserMode!]
    $targetFilterType: SettingsKycTargetFilterType!
    $targetFilterValues: [String!]
    $levelIds: [String!]
    $requireUserFullName: Boolean
    $requireUserPhone: Boolean
    $requireUserBirthday: Boolean
    $requireUserAddress: Boolean
    $requireUserFlatNumber: Boolean
  ) {
    addSettingsKyc(
      settings: {
        name: $name
        description: $description
        targetKycProviders: $targetKycProviders
        targetUserType: $targetUserType
        targetUserModes: $targetUserModes
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        requireUserFullName: $requireUserFullName
        requireUserPhone: $requireUserPhone
        requireUserBirthday: $requireUserBirthday
        requireUserAddress: $requireUserAddress
        requireUserFlatNumber: $requireUserFlatNumber
        levelIds: $levelIds
      }
    ) {
      settingsKycId
    }
  }
`;

const ADD_KYC_LEVEL_SETTINGS = gql`
  mutation AddSettingsKycLevel(
    $name: String!
    $description: String
    $userType: UserType!
    $original_level_name: String!
    $original_flow_name: String!
    $data: String!
  ) {
    addSettingsKycLevel(
      settingsLevel: {
        name: $name
        description: $description
        userType: $userType
        data: $data
        original_level_name: $original_level_name
        original_flow_name: $original_flow_name
      }
    ) {
      settingsKycLevelId
    }
  }
`;

const CREATE_WIDGET = gql`
  mutation CreateWidget(
    $userId: String
    $countriesCode2: [String!]
    $currenciesFrom: [String!]
    $currenciesTo: [String!]
    $destinationAddress: String!
    $instruments: [PaymentInstrument!]
    $liquidityProvider: LiquidityProvider
    $paymentProviders: [String!]
    $transactionTypes: [TransactionType!]
    $additionalSettings: String
  ) {
    createWidget(
      userId: $userId
      widget: {
        additionalSettings: $additionalSettings
        transactionTypes: $transactionTypes
        currenciesFrom: $currenciesFrom
        currenciesTo: $currenciesTo
        destinationAddress: $destinationAddress
        countriesCode2: $countriesCode2
        instruments: $instruments
        paymentProviders: $paymentProviders
        liquidityProvider: $liquidityProvider
      }
    ) {
      widgetId
    }
  }
`;

const UPDATE_WIDGET = gql`
  mutation UpdateWidget(
    $widgetId: String
    $countriesCode2: [String!]
    $currenciesFrom: [String!]
    $currenciesTo: [String!]
    $destinationAddress: String!
    $instruments: [PaymentInstrument!]
    $liquidityProvider: LiquidityProvider
    $paymentProviders: [String!]
    $transactionTypes: [TransactionType!]
    $additionalSettings: String
  ) {
    updateWidget(
      widgetId: $widgetId,
      widget: {
        additionalSettings: $additionalSettings
        transactionTypes: $transactionTypes
        currenciesFrom: $currenciesFrom
        currenciesTo: $currenciesTo
        destinationAddress: $destinationAddress
        countriesCode2: $countriesCode2
        instruments: $instruments
        paymentProviders: $paymentProviders
        liquidityProvider: $liquidityProvider
      }
    ) {
      widgetId
    }
  }
`;

const DELETE_WIDGET = gql`
  mutation DeleteWidget(
    $widgetId: String
  ) {
    deleteWidget(
      widgetId: $widgetId
    ) {
      widgetId
    }
  }
`;

const DELETE_USER_VAULT = gql`
mutation DeleteUserVault(
  $userId: ID!
  $vaultId: String
) {
  deleteUserVault(
    userId: $userId
    vaultId: $vaultId
  ) {
    userVaultId
  }
}
`;

const UPDATE_USER_VAULT = gql`
mutation UpdateUserVault(
  $userId: ID!
  $vaultId: String!
  $vaultName: String!
) {
  updateUserVault(
    userId: $userId
    vaultId: $vaultId
    vaultName: $vaultName
  ) {
    id
  }
}
`;

const UPDATE_USER = gql`
mutation UpdateUser(
  $userId: ID!
  $email: String!,
  $firstName: String
  $lastName: String
  $countryCode2: String
  $countryCode3: String
  $phone: String
  $defaultFiatCurrency: String
  $defaultCryptoCurrency: String
) {
  updateUser(
    userId: $userId
    user: {
      email: $email
      firstName: $firstName
      lastName: $lastName
      countryCode2: $countryCode2
      countryCode3: $countryCode3
      phone: $phone
      defaultFiatCurrency: $defaultFiatCurrency
      defaultCryptoCurrency: $defaultCryptoCurrency
    }
  ) {
    userId
  }
}
`;

const DELETE_CUSTOMER = gql`
mutation DeleteUser(
  $customerId: ID!
) {
  deleteUser(
    userId: $customerId
  ) {
    userId
  }
}
`;

const CANCEL_TRANSACTION = gql`
mutation CancelTransaction(
  $transactionId: String!
) {
  cancelTransaction(
    transactionId: $transactionId
  ) {
    userId
  }
}
`;

const UNBENCHMARK_TRANSACTIONS = gql`
mutation UnbenchmarkTransactions(
  $transactionIds: [String!]
) {
  unbenchmarkTransactions(
    transactionIds: $transactionIds
  ) {
    transactionId
  }
}
`;

const UPDATE_TRANSACTIONS = gql`
mutation UpdateTransaction(
  $transactionId: String!
  $currencyToSpend: String
  $currencyToReceive: String
  $amountToSpend: Float
  $amountToReceive: Float
  $rate: Float
  $destination: String
) {
  updateTransaction(
    transactionId: $transactionId
    transaction: {
      currencyToSpend: $currencyToSpend
      currencyToReceive: $currencyToReceive
      amountToSpend: $amountToSpend
      amountToReceive: $amountToReceive
      rate: $rate
      destination: $destination
    }
  ) {
    transactionId
  }
}
`;

const SEND_ADMIN_NOTIFICATION = gql`
mutation SendAdminNotification(
  $notifiedUserIds: [String!]
  $title: String
  $text: String
  $level: UserNotificationLevel
) {
  sendAdminNotification(
    notifiedUserIds: $notifiedUserIds
    title: $title
    text: $text
    level: $level
  ) {
    userNotificationId
  }
}
`;

const RESEND_NOTIFICATION = gql`
mutation ResendNotification(
  $notificationId: String
) {
  resendNotification(
    notificationId: $notificationId
  ) {
    userNotificationId
  }
}
`;

const UPDATE_SETTINGS_FEE = gql`
  mutation UpdateSettingsFee(
    $settingsId: ID!
    $name: String!
    $description: String
    $targetFilterType: SettingsFeeTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetUserTypes: [UserType!]
    $targetUserModes: [UserMode!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
    $wireDetails: String!
  ) {
    updateSettingsFee(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetUserTypes: $targetUserTypes
        targetUserModes: $targetUserModes
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
        wireDetails: $wireDetails
      }
    ) {
      settingsFeeId
    }
  }
`;

const UPDATE_SETTINGS_COST = gql`
  mutation UpdateSettingsCost(
    $settingsId: ID!
    $name: String!
    $description: String
    $targetFilterType: SettingsCostTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
  ) {
    updateSettingsCost(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
      }
    ) {
      settingsCostId
    }
  }
`;

const UPDATE_SETTINGS_KYC = gql`
  mutation UpdateSettingsKyc(
    $settingsId: ID!
    $name: String!
    $description: String
    $targetKycProviders: [KycProvider!]
    $targetUserType: UserType!
    $targetUserModes: [UserMode!]
    $targetFilterType: SettingsKycTargetFilterType!
    $targetFilterValues: [String!]
    $requireUserFullName: Boolean
    $requireUserPhone: Boolean
    $requireUserBirthday: Boolean
    $requireUserAddress: Boolean
    $requireUserFlatNumber: Boolean
    $levelIds: [String!]
  ) {
    updateSettingsKyc(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        targetKycProviders: $targetKycProviders
        targetUserType: $targetUserType
        targetUserModes: $targetUserModes
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        requireUserFullName: $requireUserFullName
        requireUserPhone: $requireUserPhone
        requireUserBirthday: $requireUserBirthday
        requireUserAddress: $requireUserAddress
        requireUserFlatNumber: $requireUserFlatNumber
        levelIds: $levelIds
      }
    ) {
      settingsKycId
    }
  }
`;

const UPDATE_KYC_LEVEL_SETTINGS = gql`
  mutation UpdateSettingsKycLevel(
    $settingsId: ID!
    $name: String!
    $description: String
    $userType: UserType!
    $original_level_name: String!
    $original_flow_name: String!
    $data: String!
  ) {
    updateSettingsKycLevel(
      settingsLevelId: $settingsId
      settingsLevel: {
        name: $name
        description: $description
        userType: $userType
        data: $data
        original_level_name: $original_level_name
        original_flow_name: $original_flow_name
      }
    ) {
      settingsKycLevelId
    }
  }
`;

const DELETE_SETTINGS_FEE = gql`
  mutation DeleteSettingsFee($settingsId: ID!) {
    deleteSettingsFee(settingsId: $settingsId) {
      settingsFeeId
    }
  }
`;

const DELETE_SETTINGS_COST = gql`
  mutation DeleteSettingsCost($settingsId: ID!) {
    deleteSettingsCost(settingsId: $settingsId) {
      settingsCostId
    }
  }
`;

const DELETE_SETTINGS_KYC = gql`
  mutation DeleteSettingsKyc($settingsId: ID!) {
    deleteSettingsKyc(settingsId: $settingsId) {
      settingsKycId
    }
  }
`;

const DELETE_KYC_LEVEL_SETTINGS = gql`
  mutation DeleteSettingsKycLevel($settingsId: ID!) {
    deleteSettingsKycLevel(settingsId: $settingsId) {
      settingsKycLevelId
    }
  }
`;

/* endregion */

@Injectable()
export class AdminDataService {
  constructor(
    private router: Router,
    private apollo: Apollo,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private snackBar: MatSnackBar
  ) {
  }

  private activeQueryCounter = 0;
  private isBusySubject = new BehaviorSubject(false);

  public get isBusy(): Observable<boolean> {
    return this.isBusySubject.asObservable();
  }

  getDashboardStats(filter: Filter): Observable<DashboardStats> {
    const vars: QueryGetDashboardStatsArgs = {
      userIdOnly: filter.users,
      widgetIdOnly: filter.widgets,
      sourcesOnly: filter.sources,
      countriesOnly: filter.countries,
      countryCodeType: CountryCodeType.Code3,
      accountTypesOnly: filter.accountTypes
    };
    return this.watchQuery<{ getDashboardStats: DashboardStats }, QueryGetDashboardStatsArgs>({
      query: GET_DASHBOARD_STATS,
      variables: vars,
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          return result.data.getDashboardStats;
        })
      );
  }

  getFeeSettings(): Observable<{ list: Array<FeeScheme>; count: number; }> {
    return this.watchQuery<{ getSettingsFee: SettingsFeeListResult }, QueryGetSettingsFeeArgs>({
      query: GET_FEE_SETTINGS,
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          if (result.data?.getSettingsFee?.list && result.data?.getSettingsFee?.count) {
            return {
              list: result.data.getSettingsFee.list.map(item => new FeeScheme(item)),
              count: result.data.getSettingsFee.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getCostSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_COST_SETTINGS,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getKycSettings(): Observable<{ list: Array<KycScheme>; count: number; }> {
    return this.watchQuery<{ getSettingsKyc: SettingsKycListResult }, QueryGetSettingsKycArgs>({
      query: GET_KYC_SETTINGS,
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          if (result.data?.getSettingsKyc?.list && result.data?.getSettingsKyc?.count) {
            return {
              list: result.data.getSettingsKyc.list.map(item => new KycScheme(item)),
              count: result.data.getSettingsKyc.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getKycLevels(userType: UserType | null): Observable<{ list: Array<KycLevel>; count: number; }> {
    const userTypeFilter = userType === null ? '' : userType?.toString();

    return this.watchQuery<{ getSettingsKycLevels: SettingsKycLevelListResult }, QueryGetSettingsKycLevelsArgs>({
      query: GET_KYC_LEVELS,
      variables: { filter: userTypeFilter },
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          if (result.data?.getSettingsKycLevels?.list && result.data?.getSettingsKycLevels?.count) {
            return {
              list: result.data.getSettingsKycLevels.list.map(item => new KycLevel(item)),
              count: result.data.getSettingsKycLevels.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getNotifications(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean,
    filter?: Filter
  ): Observable<{ list: Array<NotificationItem>; count: number; }> {

    const vars: QueryGetNotificationsArgs = {
      filter: filter?.search,
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: [{ orderBy: orderField, desc: orderDesc }]
    };

    return this.watchQuery<{ getNotifications: UserNotificationListResult }, QueryGetTransactionsArgs>(
      {
        query: GET_NOTIFICATIONS,
        variables: vars,
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          if (result.data?.getNotifications?.list && result.data?.getNotifications?.count) {
            return {
              list: result.data.getNotifications.list.map(val => new NotificationItem(val)),
              count: result.data.getNotifications.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getRiskAlerts(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean,
    filter?: Filter
  ): Observable<{ list: Array<RiskAlertItem>; count: number; }> {

    const vars: QueryGetRiskAlertsArgs = {
      userId: filter?.user ?? null,
      code: filter?.riskAlertCode,
      filter: filter?.search,
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: [{ orderBy: orderField, desc: orderDesc }]
    };

    return this.watchQuery<{ getRiskAlerts: RiskAlertResultList }, QueryGetRiskAlertsArgs>(
      {
        query: GET_RISK_ALERTS,
        variables: vars,
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          if (result.data?.getRiskAlerts?.list && result.data?.getRiskAlerts?.count) {
            return {
              list: result.data.getRiskAlerts.list.map(val => new RiskAlertItem(val)),
              count: result.data.getRiskAlerts.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getTransaction(transactionId: string): Observable<TransactionItemDeprecated | undefined> {
    return this.watchQuery<{ getTransactions: TransactionListResult }, QueryGetTransactionsArgs>({
      query: GET_TRANSACTIONS,
      variables: {
        transactionIdsOnly: [transactionId],
        filter: undefined,
        skip: 0,
        first: 1
      },
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(res => {
          const listResult = res?.data?.getTransactions.list;

          if (listResult && listResult.length === 1) {
            return new TransactionItemDeprecated(listResult[0]);
          }

          return undefined;
        })
      );
  }

  getTransactions(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean,
    filter?: Filter
  ): Observable<{ list: Array<TransactionItemDeprecated>; count: number; }> {

    const vars: QueryGetTransactionsArgs = {
      accountTypesOnly: filter?.accountTypes,
      countriesOnly: filter?.countries,
      countryCodeType: CountryCodeType.Code3,
      sourcesOnly: filter?.sources,
      userIdsOnly: filter?.users,
      widgetIdsOnly: filter?.widgets,
      filter: filter?.search,
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: [{ orderBy: orderField, desc: orderDesc }]
    };

    return this.watchQuery<{ getTransactions: TransactionListResult }, QueryGetTransactionsArgs>(
      {
        query: GET_TRANSACTIONS,
        variables: vars,
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          if (result.data?.getTransactions?.list && result.data?.getTransactions?.count) {
            return {
              list: result.data.getTransactions.list.map(val => new TransactionItemDeprecated(val)),
              count: result.data.getTransactions.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getUsers(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean,
    filter: Filter
  ): Observable<{ list: UserItem[], count: number }> {
    const vars = {
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: [{ orderBy: orderField, desc: orderDesc }],
      filter: filter?.search
    };

    return this.watchQuery<{ getUsers: UserListResult }, QueryGetUsersArgs>({
      query: GET_USERS,
      variables: vars,
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          if (result.data?.getUsers?.list && result.data?.getUsers?.count) {
            return {
              list: result.data.getUsers.list.map(u => new UserItem(u)),
              count: result.data.getUsers.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getWallets(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean,
    filter?: Filter
  ): Observable<{ list: Array<WalletItem>; count: number; }> {
    const vars: QueryGetWalletsArgs = {
      userIdsOnly: filter?.users,
      assetIdsOnly: filter?.assets,
      filter: filter?.search,
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: [{ orderBy: orderField, desc: orderDesc }]
    };

    return this.watchQuery<{ getWallets: AssetAddressListResult }, QueryGetWalletsArgs>(
      {
        query: GET_WALLETS,
        variables: vars,
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          if (result.data?.getWallets?.list && result.data?.getWallets?.count) {
            return {
              list: result.data.getWallets.list.map(item => new WalletItem(item)),
              count: result.data.getWallets.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );
  }

  getWidgetIds(
    userFilter: string,
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean
  ): Observable<{ list: string[], count: number }> {
    const orderFields = [{ orderBy: orderField, desc: orderDesc }];
    const customerFilter = userFilter === null ? '' : userFilter?.toString();
    const vars = {
      filter: customerFilter,
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: orderFields
    };
    return this.watchQuery<{ getWidgets: WidgetListResult }, QueryGetWidgetsArgs>({
      query: GET_WIDGET_IDS,
      variables: vars,
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          if (result.data?.getWidgets?.list && result.data?.getWidgets?.count) {
            return {
              list: result.data.getWidgets.list.map(w => w.widgetId),
              count: result.data.getWidgets.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );

  }

  getWidgets(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean,
    filter: Filter
  ): Observable<{ list: WidgetItem[], count: number }> {
    const orderFields = [{ orderBy: orderField, desc: orderDesc }];
    const vars = {
      filter: filter.search,
      skip: pageIndex * takeItems,
      first: takeItems,
      orderBy: orderFields
    };
    return this.watchQuery<{ getWidgets: WidgetListResult }, QueryGetWidgetsArgs>({
      query: GET_WIDGETS,
      variables: vars,
      fetchPolicy: 'network-only'
    })
      .pipe(
        map(result => {
          if (result.data?.getWidgets?.list && result.data?.getWidgets?.count) {
            return {
              list: result.data.getWidgets.list.map(w => {
                return new WidgetItem(w);
              }),
              count: result.data.getWidgets.count
            };
          } else {
            return {
              list: [],
              count: 0
            };
          }
        })
      );

  }

  getSettingsCommon(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_SETTINGS_COMMON,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  updateSettingsCommon(data: SettingsCommon): Observable<any> {
    return this.mutate({
      mutation: UPDATE_SETTINGS_COMMON,
      variables: {
        settingsId: data.settingsCommonId,
        liquidityProvider: data.liquidityProvider,
        custodyProvider: data.custodyProvider,
        kycProvider: data.kycProvider,
        adminEmails: data.adminEmails,
        stoppedForServicing: data.stoppedForServicing,
        additionalSettings: data.additionalSettings
      }
    });
  }

  saveFeeSettings(feeScheme: FeeScheme): Observable<any> {
    return !feeScheme.id
      ? this.mutate({
        mutation: ADD_SETTINGS_FEE,
        variables: {
          name: feeScheme.name,
          description: feeScheme.description,
          targetFilterType: feeScheme.target,
          targetFilterValues: feeScheme.targetValues,
          targetInstruments: feeScheme.instrument,
          targetUserTypes: feeScheme.userType,
          targetUserModes: feeScheme.userMode,
          targetTransactionTypes: feeScheme.trxType,
          targetPaymentProviders: feeScheme.provider,
          terms: feeScheme.terms.getObject(),
          wireDetails: feeScheme.details.getObject()
        }
      })
      : this.mutate({
        mutation: UPDATE_SETTINGS_FEE,
        variables: {
          settingsId: feeScheme.id,
          name: feeScheme.name,
          description: feeScheme.description,
          targetFilterType: feeScheme.target,
          targetFilterValues: feeScheme.targetValues,
          targetInstruments: feeScheme.instrument,
          targetUserTypes: feeScheme.userType,
          targetUserModes: feeScheme.userMode,
          targetTransactionTypes: feeScheme.trxType,
          targetPaymentProviders: feeScheme.provider,
          terms: feeScheme.terms.getObject(),
          wireDetails: feeScheme.details.getObject()
        }
      });
  }

  saveCostSettings(settings: CostScheme, create: boolean): Observable<any> {
    return create
      ? this.apollo.mutate({
        mutation: ADD_SETTINGS_COST,
        variables: {
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetInstruments: settings.instrument,
          targetTransactionTypes: settings.trxType,
          targetPaymentProviders: settings.provider,
          terms: settings.terms.getObject()
        }
      })
      : this.apollo.mutate({
        mutation: UPDATE_SETTINGS_COST,
        variables: {
          settingsId: settings.id,
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetInstruments: settings.instrument,
          targetTransactionTypes: settings.trxType,
          targetPaymentProviders: settings.provider,
          terms: settings.terms.getObject()
        }
      });
  }

  saveKycSettings(settings: KycScheme, create: boolean): Observable<any> {
    return create
      ? this.apollo.mutate({
        mutation: ADD_SETTINGS_KYC,
        variables: {
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetKycProviders: settings.kycProviders,
          targetUserType: settings.userType,
          targetUserModes: settings.userModes,
          requireUserFullName: settings.requireUserFullName,
          requireUserPhone: settings.requireUserPhone,
          requireUserBirthday: settings.requireUserBirthday,
          requireUserAddress: settings.requireUserAddress,
          requireUserFlatNumber: settings.requireUserFlatNumber,
          levelIds: [settings.levelId]
        }
      })
      : this.apollo.mutate({
        mutation: UPDATE_SETTINGS_KYC,
        variables: {
          settingsId: settings.id,
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetKycProviders: settings.kycProviders,
          targetUserType: settings.userType,
          targetUserModes: settings.userModes,
          requireUserFullName: settings.requireUserFullName,
          requireUserPhone: settings.requireUserPhone,
          requireUserBirthday: settings.requireUserBirthday,
          requireUserAddress: settings.requireUserAddress,
          requireUserFlatNumber: settings.requireUserFlatNumber,
          levelIds: [settings.levelId]
        }
      });
  }

  saveKycLevelSettings(level: KycLevel, create: boolean): Observable<any> {
    return create
      ? this.apollo.mutate({
        mutation: ADD_KYC_LEVEL_SETTINGS,
        variables: {
          name: level.name,
          description: level.description,
          userType: level.userType,
          original_level_name: level.levelData.value,
          original_flow_name: level.flowData.value,
          data: level.getDataObject()
        }
      })
      : this.apollo.mutate({
        mutation: UPDATE_KYC_LEVEL_SETTINGS,
        variables: {
          settingsId: level.id,
          name: level.name,
          description: level.description,
          userType: level.userType,
          original_level_name: level.levelData.value,
          original_flow_name: level.flowData.value,
          data: level.getDataObject()
        }
      });
  }

  saveWidget(widget: WidgetItem): Observable<any> {
    return !widget.id
      ? this.apollo.mutate({
        mutation: CREATE_WIDGET,
        variables: {
          userId: widget.userId,
          transactionTypes: widget.transactionTypes,
          currenciesFrom: widget.currenciesFrom,
          currenciesTo: widget.currenciesTo,
          destinationAddress: widget.destinationAddress,
          countriesCode2: widget.countriesCode2,
          instruments: widget.instruments,
          paymentProviders: widget.paymentProviders,
          liquidityProvider: widget.liquidityProvider,
          additionalSettings: widget.additionalSettings
        }
      })
        .pipe(tap(() => {
          this.snackBar.open(
            `Widget was created`,
            undefined, { duration: 5000 }
          );
        }))
      : this.apollo.mutate({
        mutation: UPDATE_WIDGET,
        variables: {
          widgetId: widget.id,
          transactionTypes: widget.transactionTypes,
          currenciesFrom: widget.currenciesFrom,
          currenciesTo: widget.currenciesTo,
          destinationAddress: widget.destinationAddress,
          countriesCode2: widget.countriesCode2,
          instruments: widget.instruments,
          paymentProviders: widget.paymentProviders,
          liquidityProvider: widget.liquidityProvider,
          additionalSettings: widget.additionalSettings
        }
      })
        .pipe(tap(() => {
          this.snackBar.open(
            `Widget was updated`,
            undefined, { duration: 5000 }
          );
        }));
  }

  saveCustomer(customer: User): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_USER,
      variables: {
        userId: customer.userId,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        countryCode2: customer.countryCode2,
        countryCode3: customer.countryCode3,
        phone: customer.phone,
        defaultFiatCurrency: customer.defaultFiatCurrency,
        defaultCryptoCurrency: customer.defaultCryptoCurrency
      }
    }).pipe(tap(() => {
      this.snackBar.open(
        `Customer was updated`,
        undefined, { duration: 5000 }
      );
    }));
  }

  updateUserVault(wallet: AssetAddress): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_USER_VAULT,
      variables: {
        userId: wallet.userId,
        vaultId: wallet.vaultId,
        vaultName: wallet.vaultName
      }
    }).pipe(tap(() => {
      this.snackBar.open(
        `Wallet was updated`,
        undefined, { duration: 5000 }
      );
    }));
  }

  deleteFeeSettings(settingsId: string): Observable<any> {
    return this.mutate({
      mutation: DELETE_SETTINGS_FEE,
      variables: {
        settingsId
      }
    });
  }

  deleteCostSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_COST,
        variables: {
          settingsId
        }
      });
    } else {
      return null;
    }
  }

  deleteKycSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_KYC,
        variables: {
          settingsId
        }
      });
    } else {
      return null;
    }
  }

  deleteKycLevelSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_KYC_LEVEL_SETTINGS,
        variables: {
          settingsId
        }
      });
    } else {
      return null;
    }
  }

  deleteWidget(widgetId: string): Observable<any> {
    return this.mutate({
      mutation: DELETE_WIDGET,
      variables: {
        widgetId
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Widget was deleted`,
        undefined, { duration: 5000 }
      );
    }));
  }

  deleteWallet(vaultId: string, userId: string): Observable<any> {
    return this.mutate({
      mutation: DELETE_USER_VAULT,
      variables: {
        vaultId,
        userId
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Wallet was deleted`,
        undefined, { duration: 5000 }
      );
    }));
  }

  deleteCustomer(customerId: string): Observable<any> | null {
    return this.mutate({
      mutation: DELETE_CUSTOMER,
      variables: {
        customerId
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Customer was deleted`,
        undefined, { duration: 5000 }
      );
    }));
  }

  deleteTransaction(transactionId: string): Observable<any> {
    return this.mutate({
      mutation: CANCEL_TRANSACTION,
      variables: {
        transactionId
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Transaction was cancelled`,
        undefined, { duration: 5000 }
      );
    }));
  }

  unbenchmarkTransaction(ids: string[]): Observable<any> {
    return this.mutate({
      mutation: UNBENCHMARK_TRANSACTIONS,
      variables: {
        transactionIds: ids
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Transactions were changed`,
        undefined, { duration: 5000 }
      );
    }));
  }

  updateTransaction(data: Transaction): Observable<any> {
    return this.mutate({
      mutation: UPDATE_TRANSACTIONS,
      variables: {
        transactionId: data.transactionId,
        currencyToSpend: data.currencyToSpend,
        currencyToReceive: data.currencyToReceive,
        amountToSpend: data.amountToSpend,
        amountToReceive: data.amountToReceive,
        rate: data.rate,
        destination: data.destination
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Transaction was updated`,
        undefined, { duration: 5000 }
      );
    }));
  }

  sendAdminNotification(ids: string[], level: UserNotificationLevel, title: string, text: string): Observable<any> {
    return this.mutate({
      mutation: SEND_ADMIN_NOTIFICATION,
      variables: {
        notifiedUserIds: ids,
        title,
        text,
        level
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Message was sent`,
        undefined, { duration: 5000 }
      );
    }));
  }

  resendAdminNotification(notificationId: string): Observable<any> {
    return this.mutate({
      mutation: RESEND_NOTIFICATION,
      variables: {
        notificationId: notificationId
      }
    }).pipe(tap((res) => {
      this.snackBar.open(
        `Message was resent`,
        undefined, { duration: 5000 }
      );
    }));
  }

  // TODO: move somewhere closer to HTTP, this approach can give false negatives (normally observable doesn't finish,
  //       so tap can be triggered more than once per subscription)
  private updateIsBusy(action: 'on' | 'off'): void {
    if (action === 'on') {
      console.log('on', this.activeQueryCounter);

      this.activeQueryCounter++;

      if (!this.isBusySubject.value) {
        setTimeout(() => {
          this.isBusySubject.next(true);
        }, 0);
      }
    } else {
      console.log('off', this.activeQueryCounter);

      this.activeQueryCounter--;
      this.activeQueryCounter = this.activeQueryCounter < 0 ? 0 : this.activeQueryCounter;
      if (this.activeQueryCounter === 0) {
        setTimeout(() => {
          this.isBusySubject.next(false);
        }, 0);
      }
    }
  }

  private watchQuery<TData, TVariables>(options: WatchQueryOptions<TVariables, TData>): Observable<ApolloQueryResult<TData>> {
    this.updateIsBusy('on');

    if (this.apollo.client !== undefined) {

      return this.apollo.watchQuery<TData, TVariables>(options)
        .valueChanges
        .pipe(
          tap(() => {
            this.updateIsBusy('off');
          }),
          finalize(() => {
            this.updateIsBusy('off');
          }),
          catchError(error => {
            if (this.auth.token !== '') {
              this.snackBar.open(
                this.errorHandler.getError(error.message, 'Unable to load dashboard data'),
                undefined,
                { duration: 5000 }
              );
            } else {
              this.router.navigateByUrl('/')
                .then();
            }

            return throwError(null);
          })
        );
    }

    this.snackBar.open('Apollo not ready', undefined, { duration: 5000 });
    return throwError(null);
  }

  private mutate<TData, TVariables>(options: MutationOptions<TData, TVariables>): Observable<FetchResult<TData>> {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate<TData, TVariables>(options)
        .pipe(
          catchError(error => {
            if (this.auth.token !== '') {
              this.snackBar.open(
                this.errorHandler.getError(error.message, 'Unable to perform action'),
                undefined,
                { duration: 5000 }
              );
            } else {
              this.router.navigateByUrl('/')
                .then();
            }

            return throwError(null);
          })
        );
    }

    this.snackBar.open('Apollo not ready', undefined, { duration: 5000 });
    return throwError(null);
  }
}

