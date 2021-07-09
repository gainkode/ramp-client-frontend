import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentInstrument, PaymentProvider, TransactionDestinationType, TransactionType } from '../model/generated-models';
import { CardView } from '../model/payment.model';

const GET_RATES = gql`
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

const MY_STATE = gql`
query MyState {
  myState {
    vault {
      assets {
        id, total, addresses { address }
      }
    },
    externalWallets {
        assets { id, address }
    }
  }
}
`;

const EXECUTE_TRANSACTION = gql`
mutation ExecuteTransaction(
  $transactionId: String!,
  $code: String!
) {
  executeTransaction(
    transactionId: $transactionId,
    code: $code
  ) {
    transactionId
  }
}
`;

const CREATE_TRANSACTION = gql`
mutation CreateTransaction(
  $transactionType: TransactionType!,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument!,
  $paymentProvider: PaymentProvider,
  $destinationType: TransactionDestinationType!,
  $destination: String
) {
  createTransaction(transaction: {
    type: $transactionType
    currencyToSpend: $currencyToSpend
    currencyToReceive: $currencyToReceive
    amountToSpend: $amountToSpend
    instrument: $instrument
    paymentProvider: $paymentProvider
    destinationType: $destinationType
    destination: $destination
  }) {
    transactionId,
    code,
    fee,
    feePercent,
    feeMinEuro
  }
}
`;

const PRE_AUTH = gql`
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

  getRates(fromValue: string, toValue: string): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_RATES,
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

  getState(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: MY_STATE,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  createQuickCheckout(transactionType: TransactionType, currencyToSpend: string,
    currencyToReceive: string, amount: number, instrument: PaymentInstrument, provider: PaymentProvider,
    destinationType: TransactionDestinationType, walletAddress: string): Observable<any> {
    const paymentPrvdr = (provider as string === '') ? undefined : provider;
    const wallet = (walletAddress === '') ? undefined : walletAddress;


    const vars = {
      transactionType,
      currencyToSpend,
      currencyToReceive,
      amountToSpend: amount,
      instrument,
      paymentProvider: paymentPrvdr,
      destinationType,
      destination: wallet
    };
    console.log(vars);

    return this.apollo.mutate({
      mutation: CREATE_TRANSACTION,
      variables: vars
    });
  }

  confirmQuickCheckout(id: string, code: string): Observable<any> {
    return this.apollo.mutate({
      mutation: EXECUTE_TRANSACTION,
      variables: {
        transactionId: id,
        code
      }
    });
  }

  preAuth(id: string, paymentInstrument: PaymentInstrument, paymentProvider: PaymentProvider, card: CardView): Observable<any> {
    return this.apollo.mutate({
      mutation: PRE_AUTH,
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
