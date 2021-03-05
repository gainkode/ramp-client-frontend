import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { FeeScheme } from '../model/fee-scheme.model';

const GET_FEE_SETTINGS_POST = gql`
  query GetSettingsFee {
    getSettingsFee(filter: "") {
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
  $description: String!, 
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
  $description: String!, 
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

@Injectable()
export class AdminDataService {
  constructor(private apollo: Apollo) { }

  // getFeeSettings(): Observable<any> {
  //   return this.apollo.watchQuery<Response>({
  //     query: GET_FEE_SETTINGS_POST
  //   }).valueChanges;
  // }

  getFeeSettings(): QueryRef<any, EmptyObject> {
    return this.apollo.watchQuery<any>({
      query: GET_FEE_SETTINGS_POST,
      pollInterval: 500
    });
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
}
