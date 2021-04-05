import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';

const GET_SETTINGS_CURRENCY_POST = gql`
  query GetSettingsCurrency {
    getSettingsCurrency {
      count
      list {
        symbol
        name
        precision
        minAmount
        rateFactor
        validateAsSymbol
      }
    }
  }
`;

// const ADD_SETTINGS_COST_POST = gql`
// mutation AddSettingsCost(
//   $name: String!,
//   $description: String,
//   $targetFilterType: SettingsCostTargetFilterType!,
//   $targetFilterValues: [String!],
//   $targetInstruments: [PaymentInstrument!],
//   $targetTransactionTypes: [TransactionType!],
//   $targetPaymentProviders: [PaymentProvider!],
//   $terms: String!
// ) {
//   addSettingsCost(settings: {
//     name: $name,
//     description: $description,
//     targetFilterType: $targetFilterType,
//     targetFilterValues: $targetFilterValues,
//     targetInstruments: $targetInstruments,
//     targetTransactionTypes: $targetTransactionTypes,
//     targetPaymentProviders: $targetPaymentProviders,
//     terms: $terms
//   }) {
//     settingsCostId
//   }
// }
// `;

@Injectable()
export class QuickCheckoutDataService {
  constructor(private apollo: Apollo) { }

  getSettingsCurrency(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_SETTINGS_CURRENCY_POST,
        pollInterval: 30000,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

//   saveFeeSettings(settings: FeeScheme, create: boolean): Observable<any> {
//     return create ?
//       this.apollo.mutate({
//         mutation: ADD_SETTINGS_FEE_POST,
//         variables: {
//           name: settings.name,
//           description: settings.description,
//           targetFilterType: settings.target,
//           targetFilterValues: settings.targetValues,
//           targetInstruments: settings.instrument,
//           targetTransactionTypes: settings.trxType,
//           targetPaymentProviders: settings.provider,
//           terms: settings.terms.getObject(),
//           wireDetails: settings.details.getObject()
//         }
//       })
//       :
//       this.apollo.mutate({
//         mutation: UPDATE_SETTINGS_FEE_POST,
//         variables: {
//           settingsId: settings.id,
//           name: settings.name,
//           description: settings.description,
//           targetFilterType: settings.target,
//           targetFilterValues: settings.targetValues,
//           targetInstruments: settings.instrument,
//           targetTransactionTypes: settings.trxType,
//           targetPaymentProviders: settings.provider,
//           terms: settings.terms.getObject(),
//           wireDetails: settings.details.getObject()
//         }
//       });
//   }
}
