import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentInstrument, PaymentProvider, TransactionDestinationType, TransactionType } from '../model/generated-models';
import { CardView } from '../model/payment.model';

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

const EXECUTE_TRANSACTION_POST = gql`
mutation ExecuteTransaction(
  $transactionId: String!,
  $code: String!,
  $recaptcha: String!
) {
  executeTransaction(
    transactionId: $transactionId,
    code: $code,
    recaptcha: $recaptcha
  ) {
    transactionId
  }
}
`;

const CREATE_TRANSACTION_POST = gql`
mutation CreateTransaction(
  $transactionType: TransactionType!,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountFiat: Float!,
  $instrument: PaymentInstrument!,
  $paymentProvider: PaymentProvider,
  $destinationType: TransactionDestinationType!,
  $destination: String,
  $rate: Float!,
  $recaptcha: String!
) {
  createTransaction(transaction: {
    type: $transactionType
    currencyToSpend: $currencyToSpend
    currencyToReceive: $currencyToReceive
    amountFiat: $amountFiat
    instrument: $instrument
    paymentProvider: $paymentProvider
    destinationType: $destinationType
    destination: $destination
    rate: $rate
  }, recaptcha: $recaptcha) {
    transactionId,
    code,
    fee,
    feePercent,
    feeMinEuro
  }
}
`;

const PRE_AUTH_POST = gql`
mutation PreAuth(
  $transactionId: String!,
  $instrument: PaymentInstrument!,
  $paymentProvider: PaymentProvider!,
  $cardNumber: String!,
  $expiredMonth: Int!,
  $expiredYear: Int!,
  $cvv: Int!,
  $holder: String!
) {
  preauth(
    orderParams: {
      transactionId: $transactionId
      instrument: $instrument
      provider: $paymentProvider
      amount: 5
      currency: "EUR"
      card: {
        number: $cardNumber
        expireMonth: $expiredMonth
        expireYear: $expiredYear
        cvv2: $cvv
        holder: $holder
      }
    }
  ) {
    order {
      transactionId
      orderId
      userId
      provider
      created
      amount
      currency
      paymentInfo
    }
    html
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
    rate: number, destinationType: TransactionDestinationType, walletAddress: string): Observable<any> {
    const paymentPrvdr = (provider as string === '') ? undefined : provider;
    const wallet = (walletAddress === '') ? undefined : walletAddress;
    return this.apollo.mutate({
      mutation: CREATE_TRANSACTION_POST,
      variables: {
        recaptcha: environment.recaptchaId,
        transactionType,
        currencyToSpend,
        currencyToReceive,
        amountFiat,
        instrument,
        paymentProvider: paymentPrvdr,
        rate,
        destinationType,
        destination: wallet
      }
    });
  }

  confirmQuickCheckout(id: string, code: string): Observable<any> {
    return this.apollo.mutate({
      mutation: EXECUTE_TRANSACTION_POST,
      variables: {
        recaptcha: environment.recaptchaId,
        transactionId: id,
        code
      }
    });
  }

  preAuth(id: string, paymentInstrument: PaymentInstrument, paymentProvider: PaymentProvider, card: CardView): Observable<any> {
    return this.apollo.mutate({
      mutation: PRE_AUTH_POST,
      variables: {
        transactionId: id,
        instrument: paymentInstrument,
        paymentProvider,
        cardNumber: card.cardNumber,
        expiredMonth: card.monthExpired,
        expiredYear: card.yearExpired,
        cvv: card.cvv,
        holder: card.holderName
      }
    });
  }
}
