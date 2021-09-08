import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { CostScheme } from '../model/cost-scheme.model';
import { DashboardFilter } from '../model/dashboard.model';
import { FeeScheme } from '../model/fee-scheme.model';
import { CountryCodeType, TransactionSource, UserType } from '../model/generated-models';
import { KycLevel, KycScheme } from '../model/identification.model';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats(
    $userIdOnly: [String!],
    $affiliateIdOnly: [String!],
    $sourcesOnly: [TransactionSource!],
    $countriesOnly: [String!],
    $countryCodeType: CountryCodeType,
    $accountTypesOnly: [UserType!]
  ) {
    getDashboardStats(
      userIdOnly: $userIdOnly
      affiliateIdOnly: $affiliateIdOnly
      sourcesOnly: $sourcesOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      accountTypesOnly: $accountTypesOnly
    ) {
      deposits {
        ratio,
        approved {count, volume},
        declined {count, volume},
        abounded {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        byInstruments {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abounded {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        }
      }
      withdrawals {
        ratio,
        approved {count, volume},
        declined {count, volume},
        abounded {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        byInstruments {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abounded {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        }
      }
      transfers {
        ratio,
        approved {count, volume},
        declined {count, volume},
        abounded {count, volume},
        inProcess {count, volume},
        toMerchant {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abounded {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        },
        toCustomer {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abounded {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        },
        fee {count, volume}
      }
      exchanges {
        ratio,
        approved {count, volume},
        declined {count, volume},
        abounded {count, volume},
        inProcess {count, volume},
        toMerchant {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abounded {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        },
        toCustomer {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          abounded {count, volume},
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
        targetPaymentProviders
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

const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $userId: String
    $sourcesOnly: [TransactionSource!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getTransactions(
      userId: $userId
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
        affiliateId
        created
        executed
        type
        source
        status
        fee
        feePercent
        feeMinEur
        feeDetails
        currencyToSpend
        amountToSpend
        amountToSpendInEur
        currencyToReceive
        amountToReceive
        amountToReceiveInEur
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
        destinationType
        destination
      }
    }
  }
`;

const GET_CUSTOMERS = gql`
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

const GET_WIDGETS = gql`
  query GetWidgets(
    $userId: String
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWidgets(userId: $userId, filter: $filter, skip: $skip, first: $first, orderBy: $orderBy) {
      count
      list {
        widgetId
        userId
        created
        transactionType
        currenciesFrom
        currenciesTo
        destinationAddress
        minAmountFrom
        maxAmountFrom
        fixAmountFrom
        countriesCode2
        instruments
        paymentProviders
        liquidityProvider
        data
      }
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
    $targetPaymentProviders: [PaymentProvider!]
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
    $targetPaymentProviders: [PaymentProvider!]
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
    $data: String!
  ) {
    addSettingsKycLevel(
      settingsLevel: {
        name: $name
        description: $description
        userType: $userType
        data: $data
      }
    ) {
      settingsKycLevelId
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
    $targetPaymentProviders: [PaymentProvider!]
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
    $targetPaymentProviders: [PaymentProvider!]
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
    $data: String!
  ) {
    updateSettingsKycLevel(
      settingsLevelId: $settingsId
      settingsLevel: {
        name: $name
        description: $description
        userType: $userType
        data: $data
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

@Injectable()
export class AdminDataService {
  constructor(private apollo: Apollo) { }

  getDashboardStats(filter: DashboardFilter): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const vars = {
        userIdOnly: filter.userIdOnly,
        affiliateIdOnly: filter.affiliateIdOnly,
        sourcesOnly: filter.sourcesOnly,
        countriesOnly: filter.countriesOnly,
        countryCodeType: CountryCodeType.Code3,
        accountTypesOnly: filter.accountTypesOnly
      };
      return this.apollo.watchQuery<any>({
        query: GET_DASHBOARD_STATS,
        variables: vars,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getFeeSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_FEE_SETTINGS,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getCostSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_COST_SETTINGS,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getKycSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_KYC_SETTINGS,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getKycLevels(userType: UserType | null): QueryRef<any, EmptyObject> | null {
    const userTypeFilter = userType === null ? '' : userType?.toString();
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_KYC_LEVELS,
        variables: { filter: userTypeFilter },
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getTransactions(
    pageIndex: number,
    takeItems: number,
    sources: TransactionSource[],
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      return this.apollo.watchQuery<any>({
        query: GET_TRANSACTIONS,
        variables: {
          userId: '',
          sourcesOnly: sources,
          filter: '',
          skip: pageIndex * takeItems,
          first: takeItems,
          orderBy: orderFields,
        },
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getCustomers(
    userFilter: string,
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      const customerFilter = userFilter === null ? '' : userFilter?.toString();
      const vars = {
        filter: customerFilter,
        skip: pageIndex * takeItems,
        first: takeItems,
        orderBy: orderFields,
      };
      return this.apollo.watchQuery<any>({
        query: GET_CUSTOMERS,
        variables: vars,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getWidgets(
    userFilter: string,
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      const customerFilter = userFilter === null ? '' : userFilter?.toString();
      const vars = {
        userId: null,
        filter: customerFilter,
        skip: pageIndex * takeItems,
        first: takeItems,
        orderBy: orderFields
      };
      return this.apollo.watchQuery<any>({
        query: GET_WIDGETS,
        variables: vars,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  saveFeeSettings(settings: FeeScheme, create: boolean): Observable<any> {
    return create
      ? this.apollo.mutate({
        mutation: ADD_SETTINGS_FEE,
        variables: {
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetInstruments: settings.instrument,
          targetUserTypes: settings.userType,
          targetUserModes: settings.userMode,
          targetTransactionTypes: settings.trxType,
          targetPaymentProviders: settings.provider,
          terms: settings.terms.getObject(),
          wireDetails: settings.details.getObject(),
        },
      })
      : this.apollo.mutate({
        mutation: UPDATE_SETTINGS_FEE,
        variables: {
          settingsId: settings.id,
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetInstruments: settings.instrument,
          targetUserTypes: settings.userType,
          targetUserModes: settings.userMode,
          targetTransactionTypes: settings.trxType,
          targetPaymentProviders: settings.provider,
          terms: settings.terms.getObject(),
          wireDetails: settings.details.getObject(),
        },
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
          terms: settings.terms.getObject(),
        },
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
          terms: settings.terms.getObject(),
        },
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
          levelIds: [settings.levelId],
        },
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
          levelIds: [settings.levelId],
        },
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
          data: level.getDataObject(),
        },
      })
      : this.apollo.mutate({
        mutation: UPDATE_KYC_LEVEL_SETTINGS,
        variables: {
          settingsId: level.id,
          name: level.name,
          description: level.description,
          userType: level.userType,
          data: level.getDataObject(),
        },
      });
  }

  deleteFeeSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_FEE,
        variables: {
          settingsId,
        },
      });
    } else {
      return null;
    }
  }

  deleteCostSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_COST,
        variables: {
          settingsId,
        },
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
          settingsId,
        },
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
          settingsId,
        },
      });
    } else {
      return null;
    }
  }
}
