import { stringify } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { empty, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentInstrument, PaymentProvider, TransactionType } from '../model/generated-models';

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

const CREATE_QUICK_CHECKOUT_POST = gql`
mutation CreateQuickCheckout(
  $transactionType: TransactionType!,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountFiat: Float!,
  $instrument: PaymentInstrument!,
  $paymentProvider: PaymentProvider,
  $rate: Float!,
  $data: String!,
  $recaptcha: String!
) {
  createQuickCheckout(transaction: {
    type: $transactionType
    currencyToSpend: $currencyToSpend
    currencyToReceive: $currencyToReceive
    amountFiat: $amountFiat
    instrument: $instrument
    paymentProvider: $paymentProvider
    rate: $rate
    data: $data
  }, recaptcha: $recaptcha) {
    code,
    fee,
    feePercent,
    feeMinEuro
  }
}
`;

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
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  createQuickCheckout(transactionType: TransactionType, currencyToSpend: string,
    currencyToReceive: string, amountFiat: number, instrument: PaymentInstrument, provider: PaymentProvider,
    rate: number, walletAddress: string): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_QUICK_CHECKOUT_POST,
      variables: {
        recaptcha: environment.recaptchaId,
        transactionType,
        currencyToSpend,
        currencyToReceive,
        amountFiat,
        instrument: instrument,
        paymentProvider: null,
        rate,
        data: JSON.stringify({ userAddress: walletAddress })
      }
    });
  }
}
