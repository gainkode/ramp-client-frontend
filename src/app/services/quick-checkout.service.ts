import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { environment } from 'src/environments/environment';

const GET_SETTINGS_CURRENCY_POST = gql`
  query GetSettingsCurrency($recaptcha: String!) {
    getSettingsCurrency(recaptcha: $recaptcha) {
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

const GET_RATES_POST = gql`
query GetRates($recaptcha: String!, $currenciesFrom: [String!]!, $currencyTo: String!) {
  getRates(
    currenciesFrom: $currenciesFrom,
    currencyTo: $currencyTo,
    recaptcha: $recaptcha
  ) {
    currencyFrom
    currencyTo
    originalRate
    depositRate
    withdrawRate
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
        variables: {
          recaptcha: environment.recaptchaId
        },
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getRates(fromValue: string, toValue: string): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_RATES_POST,
        variables: {
          recaptcha: environment.recaptchaId,
          currenciesFrom: [fromValue],
          currencyTo: toValue
        },
        pollInterval: 60000,
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
