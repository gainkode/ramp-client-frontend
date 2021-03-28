import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { CostScheme } from '../model/cost-scheme.model';
import { FeeScheme } from '../model/fee-scheme.model';

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
        targetPaymentProviders,
        targetTransactionTypes,
        targetFilterType,
        targetFilterValues
      }
    }
  }
`;

const ADD_SETTINGS_FEE_POST = gql`
mutation AddSettingsFee(
  $name: String!,
  $description: String,
  $targetFilterType: FeeSettingsTargetFilterType!,
  $targetFilterValues: [String!],
  $targetInstruments: [PaymentInstrument!],
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
    targetTransactionTypes: $targetTransactionTypes,
    targetPaymentProviders: $targetPaymentProviders,
    terms: $terms,
    wireDetails: $wireDetails
  }) {
    settingsFeeId
  }
}
`;

const UPDATE_SETTINGS_FEE_POST = gql`
mutation UpdateSettingsFee(
  $settingsId: ID!,
  $name: String!,
  $description: String,
  $targetFilterType: FeeSettingsTargetFilterType!,
  $targetFilterValues: [String!],
  $targetInstruments: [PaymentInstrument!],
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

const DELETE_SETTINGS_FEE_POST = gql`
mutation DeleteSettingsFee($settingsId: ID!) {
  deleteSettingsFee(settingsId: $settingsId) {
    settingsFeeId
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
        settingsKycId,
        name,
        description,
        targetKycProviders,
        targetUserTypes,
        targetUserModes,
        targetFilterType,
        targetFilterValues,
        levels {settingsKycLevelId, name, data}
      }
    }
  }
`;

const GET_KYC_LEVELS_POST = gql`
  query GetSettingsKycLevels {
    getSettingsKycLevels(
      filter: "",
      orderBy:
      [
        {orderBy: "name", desc: false}
      ]) {
      count,
      list {
        settingsKycLevelId,
        name,
        data,
        created,
        createdBy
      }
    }
  }
`;

const ADD_SETTINGS_COST_POST = gql`
mutation AddSettingsCost(
  $name: String!,
  $description: String,
  $targetFilterType: CostSettingsFilterType!,
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

const UPDATE_SETTINGS_COST_POST = gql`
mutation UpdateSettingsCost(
  $settingsId: ID!,
  $name: String!,
  $description: String,
  $targetFilterType: CostSettingsFilterType!,
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

const DELETE_SETTINGS_COST_POST = gql`
mutation DeleteSettingsCost($settingsId: ID!) {
  deleteSettingsCost(settingsId: $settingsId) {
    settingsCostId
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

  getKycLevels(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_KYC_LEVELS_POST,
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

  deleteFeeSettings(settingsId: string): Observable<any> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.mutate({
        mutation: DELETE_SETTINGS_FEE_POST,
        variables: {
          settingsId: settingsId
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
          settingsId: settingsId
        }
      });
    } else {
      return null;
    }
  }
}
