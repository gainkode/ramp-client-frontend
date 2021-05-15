import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { CostScheme } from '../model/cost-scheme.model';
import { FeeScheme } from '../model/fee-scheme.model';
import { UserType } from '../model/generated-models';
import { KycLevel, KycScheme } from '../model/identification.model';

const GET_FEE_SETTINGS_POST = gql`
  query GetSettingsFee {
    getSettingsFee(
      filter: "",
      orderBy:
      [
        {orderBy: "default", desc: true},
        {orderBy: "name", desc: false}
      ]) {
      count,
      list {
        settingsFeeId,
        name,
        default,
        description,
        terms,
        wireDetails,
        targetInstruments,
        targetUserTypes,
        targetUserModes,
        targetPaymentProviders,
        targetTransactionTypes,
        targetFilterType,
        targetFilterValues
      }
    }
  }
`;

const GET_COST_SETTINGS_POST = gql`
  query GetSettingsCost {
    getSettingsCost(
      filter: "",
      orderBy:
      [
        {orderBy: "default", desc: true},
        {orderBy: "name", desc: false}
      ]) {
      count,
      list {
        targetPaymentProviders,
        settingsCostId,
        name,
        default,
        description,
        terms,
        targetFilterType,
        targetFilterValues,
        targetInstruments,
        targetTransactionTypes,
        targetPaymentProviders
      }
    }
  }
`;

const GET_KYC_SETTINGS_POST = gql`
  query GetSettingsKyc {
    getSettingsKyc(
      filter: "",
      orderBy:
      [
        {orderBy: "default", desc: true},
        {orderBy: "name", desc: false}
      ]) {
      count,
      list {
        default,
        settingsKycId,
        name,
        description,
        targetKycProviders,
        targetUserType,
        targetUserModes,
        targetFilterType,
        targetFilterValues,
        levels {settingsKycLevelId, name, data, description, order}
      }
    }
  }
`;

const GET_KYC_LEVELS_POST = gql`
  query GetSettingsKycLevels(
    $filter: String
  ) {
    getSettingsKycLevels(
      filter: $filter,
      orderBy:
      [
        {orderBy: "name", desc: false}
      ]) {
      count,
      list {
        settingsKycLevelId,
        name,
        description,
        userType,
        data,
        order,
        created,
        createdBy
      }
    }
  }
`;

const GET_TRANSACTIONS_POST = gql`
  query GetTransactions(
    $userId: String,
    $quickCheckoutOnly: Boolean,
    $filter: String,
    $skip: Int,
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getTransactions(
      userId: $userId,
      quickCheckoutOnly: $quickCheckoutOnly,
      filter: $filter,
      skip: $skip,
      first: $first,
      orderBy: $orderBy
    ) {
      count,
      list {
        transactionId,
        code,
        userId,
        userIp,
        user {userId, email, firstName, lastName, countryCode2, kycStatus},
        affiliateId,
        created,
        executed,
        type,
        source,
        status,
        fee,
        feePercent,
        feeMinEuro,
        feeDetails,
        currencyToSpend,
        amountToSpend,
        amountToSpendWithoutFee,
        currencyToReceive,
        amountToReceive,
        amountToReceiveWithoutFee,
        rate,
        liquidityProvider,
        instrument,
        paymentProvider,
        data
      }
    }
  }
`;

const ADD_SETTINGS_FEE_POST = gql`
mutation AddSettingsFee(
  $name: String!,
  $description: String,
  $targetFilterType: SettingsFeeTargetFilterType!,
  $targetFilterValues: [String!],
  $targetInstruments: [PaymentInstrument!],
  $targetUserTypes: [UserType!],
  $targetUserModes: [UserMode!],
  $targetTransactionTypes: [TransactionType!],
  $targetPaymentProviders: [PaymentProvider!],
  $terms: String!,
  $wireDetails: String!
) {
  addSettingsFee(settings: {
    name: $name,
    description: $description,
    targetFilterType: $targetFilterType,
    targetFilterValues: $targetFilterValues,
    targetInstruments: $targetInstruments,
    targetUserTypes: $targetUserTypes,
    targetUserModes: $targetUserModes,
    targetTransactionTypes: $targetTransactionTypes,
    targetPaymentProviders: $targetPaymentProviders,
    terms: $terms,
    wireDetails: $wireDetails
  }) {
    settingsFeeId
  }
}
`;

const ADD_SETTINGS_COST_POST = gql`
mutation AddSettingsCost(
  $name: String!,
  $description: String,
  $targetFilterType: SettingsCostTargetFilterType!,
  $targetFilterValues: [String!],
  $targetInstruments: [PaymentInstrument!],
  $targetTransactionTypes: [TransactionType!],
  $targetPaymentProviders: [PaymentProvider!],
  $terms: String!
) {
  addSettingsCost(settings: {
    name: $name,
    description: $description,
    targetFilterType: $targetFilterType,
    targetFilterValues: $targetFilterValues,
    targetInstruments: $targetInstruments,
    targetTransactionTypes: $targetTransactionTypes,
    targetPaymentProviders: $targetPaymentProviders,
    terms: $terms
  }) {
    settingsCostId
  }
}
`;

const ADD_SETTINGS_KYC_POST = gql`
mutation AddSettingsKyc(
  $name: String!,
  $description: String,
  $targetKycProviders: [KycProvider!],
  $targetUserType: UserType!,
  $targetUserModes: [UserMode!],
  $targetFilterType: SettingsKycTargetFilterType!,
  $targetFilterValues: [String!],
  $levelIds: [String!]
) {
  addSettingsKyc(settings: {
    name: $name,
    description: $description,
    targetKycProviders: $targetKycProviders,
    targetUserType: $targetUserType,
    targetUserModes: $targetUserModes,
    targetFilterType: $targetFilterType,
    targetFilterValues: $targetFilterValues,
    levelIds: $levelIds
  }) {
    settingsKycId
  }
}
`;

const ADD_KYC_LEVEL_SETTINGS_POST = gql`
mutation AddSettingsKycLevel(
  $name: String!,
  $description: String,
  $userType: UserType!,
  $data: String!
) {
  addSettingsKycLevel(settingsLevel: {
    name: $name,
    description: $description,
    userType: $userType,
    data: $data
  }) {
    settingsKycLevelId
  }
}
`;

const UPDATE_SETTINGS_FEE_POST = gql`
mutation UpdateSettingsFee(
  $settingsId: ID!,
  $name: String!,
  $description: String,
  $targetFilterType: SettingsFeeTargetFilterType!,
  $targetFilterValues: [String!],
  $targetInstruments: [PaymentInstrument!],
  $targetUserTypes: [UserType!],
  $targetUserModes: [UserMode!],
  $targetTransactionTypes: [TransactionType!],
  $targetPaymentProviders: [PaymentProvider!],
  $terms: String!,
  $wireDetails: String!
) {
  updateSettingsFee(
    settingsId: $settingsId,
    settings: {
      name: $name,
      description: $description,
      targetFilterType: $targetFilterType,
      targetFilterValues: $targetFilterValues,
      targetInstruments: $targetInstruments,
      targetUserTypes: $targetUserTypes,
      targetUserModes: $targetUserModes,
      targetTransactionTypes: $targetTransactionTypes,
      targetPaymentProviders: $targetPaymentProviders,
      terms: $terms,
      wireDetails: $wireDetails
    }
  ) {
    settingsFeeId
  }
}
`;

const UPDATE_SETTINGS_COST_POST = gql`
mutation UpdateSettingsCost(
  $settingsId: ID!,
  $name: String!,
  $description: String,
  $targetFilterType: SettingsCostTargetFilterType!,
  $targetFilterValues: [String!],
  $targetInstruments: [PaymentInstrument!],
  $targetTransactionTypes: [TransactionType!],
  $targetPaymentProviders: [PaymentProvider!],
  $terms: String!
) {
  updateSettingsCost(
    settingsId: $settingsId,
    settings: {
      name: $name,
      description: $description,
      targetFilterType: $targetFilterType,
      targetFilterValues: $targetFilterValues,
      targetInstruments: $targetInstruments,
      targetTransactionTypes: $targetTransactionTypes,
      targetPaymentProviders: $targetPaymentProviders,
      terms: $terms
    }
  ) {
    settingsCostId
  }
}
`;

const UPDATE_SETTINGS_KYC_POST = gql`
mutation UpdateSettingsKyc(
  $settingsId: ID!,
  $name: String!,
  $description: String,
  $targetKycProviders: [KycProvider!],
  $targetUserType: UserType!,
  $targetUserModes: [UserMode!],
  $targetFilterType: SettingsKycTargetFilterType!,
  $targetFilterValues: [String!],
  $levelIds: [String!]
) {
  updateSettingsKyc(
    settingsId: $settingsId,
    settings: {
      name: $name,
      description: $description,
      targetKycProviders: $targetKycProviders,
      targetUserType: $targetUserType,
      targetUserModes: $targetUserModes,
      targetFilterType: $targetFilterType,
      targetFilterValues: $targetFilterValues,
      levelIds: $levelIds
    }
  ) {
    settingsKycId
  }
}
`;

const UPDATE_KYC_LEVEL_SETTINGS_POST = gql`
mutation UpdateSettingsKycLevel(
  $settingsId: ID!,
  $name: String!,
  $description: String,
  $userType: UserType!,
  $data: String!
) {
  updateSettingsKycLevel(
    settingsLevelId: $settingsId,
    settingsLevel: {
      name: $name,
      description: $description,
      userType: $userType,
      data: $data
    }
  ) {
    settingsKycLevelId
  }
}
`;

const DELETE_SETTINGS_FEE_POST = gql`
mutation DeleteSettingsFee($settingsId: ID!) {
  deleteSettingsFee(settingsId: $settingsId) {
    settingsFeeId
  }
}
`;

const DELETE_SETTINGS_COST_POST = gql`
mutation DeleteSettingsCost($settingsId: ID!) {
  deleteSettingsCost(settingsId: $settingsId) {
    settingsCostId
  }
}
`;

const DELETE_SETTINGS_KYC_POST = gql`
mutation DeleteSettingsKyc($settingsId: ID!) {
  deleteSettingsKyc(settingsId: $settingsId) {
    settingsKycId
  }
}
`;

const DELETE_KYC_LEVEL_SETTINGS_POST = gql`
mutation DeleteSettingsKycLevel($settingsId: ID!) {
  deleteSettingsKycLevel(settingsId: $settingsId) {
    settingsKycLevelId
  }
}
`;

@Injectable()
export class AdminDataService {
  constructor(private apollo: Apollo) { }

  getFeeSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_FEE_SETTINGS_POST,
        pollInterval: 30000,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getCostSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_COST_SETTINGS_POST,
        pollInterval: 30000,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getKycSettings(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_KYC_SETTINGS_POST,
        pollInterval: 30000,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getKycLevels(userType: UserType | null): QueryRef<any, EmptyObject> | null {
    const userTypeFilter = (userType === null) ? '' : userType?.toString();
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_KYC_LEVELS_POST,
        variables: { filter: userTypeFilter },
        pollInterval: 30000,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getTransactions(pageIndex: number, takeItems: number, orderField: string, orderDesc: boolean): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [
        { orderBy: orderField, desc: orderDesc }
      ];
      return this.apollo.watchQuery<any>({
        query: GET_TRANSACTIONS_POST,
        variables: {
          userId: '',
          quickCheckoutOnly: false,
          filter: '',
          skip: pageIndex * takeItems,
          first: takeItems,
          orderBy: orderFields
        },
        pollInterval: 30000,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  saveFeeSettings(settings: FeeScheme, create: boolean): Observable<any> {
    return create ?
      this.apollo.mutate({
        mutation: ADD_SETTINGS_FEE_POST,
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
          wireDetails: settings.details.getObject()
        }
      })
      :
      this.apollo.mutate({
        mutation: UPDATE_SETTINGS_FEE_POST,
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
          wireDetails: settings.details.getObject()
        }
      });
  }

  saveCostSettings(settings: CostScheme, create: boolean): Observable<any> {
    return create ?
      this.apollo.mutate({
        mutation: ADD_SETTINGS_COST_POST,
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
      :
      this.apollo.mutate({
        mutation: UPDATE_SETTINGS_COST_POST,
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
    return create ?
      this.apollo.mutate({
        mutation: ADD_SETTINGS_KYC_POST,
        variables: {
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetKycProviders: settings.kycProviders,
          targetUserType: settings.userType,
          targetUserModes: settings.userModes,
          levelIds: [settings.levelId]
        }
      })
      :
      this.apollo.mutate({
        mutation: UPDATE_SETTINGS_KYC_POST,
        variables: {
          settingsId: settings.id,
          name: settings.name,
          description: settings.description,
          targetFilterType: settings.target,
          targetFilterValues: settings.targetValues,
          targetKycProviders: settings.kycProviders,
          targetUserType: settings.userType,
          targetUserModes: settings.userModes,
          levelIds: [settings.levelId]
        }
      });
  }

  saveKycLevelSettings(level: KycLevel, create: boolean): Observable<any> {
    return create ?
      this.apollo.mutate({
        mutation: ADD_KYC_LEVEL_SETTINGS_POST,
        variables: {
          name: level.name,
          description: level.description,
          userType: level.userType,
          data: level.getDataObject()
        }
      })
      :
      this.apollo.mutate({
        mutation: UPDATE_KYC_LEVEL_SETTINGS_POST,
        variables: {
          settingsId: level.id,
          name: level.name,
          description: level.description,
          userType: level.userType,
          data: level.getDataObject()
        }
      });
  }

  deleteFeeSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_FEE_POST,
        variables: {
          settingsId
        }
      });
    } else {
      return null;
    }
  }

  deleteCostSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_COST_POST,
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
        mutation: DELETE_SETTINGS_KYC_POST,
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
        mutation: DELETE_KYC_LEVEL_SETTINGS_POST,
        variables: {
          settingsId
        }
      });
    } else {
      return null;
    }
  }
}
