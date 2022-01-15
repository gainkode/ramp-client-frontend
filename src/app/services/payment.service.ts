import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { KycProvider, PaymentInstrument, PaymentProvider, TransactionSource, TransactionType } from '../model/generated-models';
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

const GET_ONE_TO_MANY_RATES = gql`
query GetOneToManyRates(
  $currencyFrom: String!
  $currenciesTo: [String!]!
  $reverse: Boolean!) {
  getOneToManyRates(
    currencyFrom: $currencyFrom,
    currenciesTo: $currenciesTo,
    reverse: $reverse
  ) {
    currencyFrom
    currencyTo
    originalRate
    depositRate
    withdrawRate
  }
}
`;

const GET_PROVIDERS = gql`
query GetAppropriatePaymentProviders(
  $fiatCurrency: String
  $widgetId: String
) {
  getAppropriatePaymentProviders(
    fiatCurrency: $fiatCurrency
    widgetId: $widgetId
  ) {
    instrument
    provider {
      paymentProviderId
      name
      currencies
      countries_code2
      instruments
      default
    }
  }
}
`;

const GET_SETTINGS_KYC_TIERS = gql`
query GetSettingsKycTiers {
  getSettingsKycTiers {
    count
    list {
      settingsKycTierId
      name
      description
      amount
      levelId
      level {
        settingsKycLevelId
        name
        original_level_name
        original_flow_name
        description
        data
      }
      default
      requireUserFullName
      requireUserPhone
      requireUserBirthday
      requireUserAddress
      requireUserFlatNumber
    }
  }
}
`;

const MY_SETTINGS_KYC_TIERS = gql`
query MySettingsKycTiers {
  mySettingsKycTiers {
    count
    list {
      name
      description
      amount
      levelName
      levelDescription
      originalLevelName
      originalFlowName
      requireUserFullName
      requireUserPhone
      requireUserBirthday
      requireUserAddress
      requireUserFlatNumber
    }
  }
}
`;

const GET_APPROPRIATE_SETTINGS_KYC_TIERS = gql`
query GetAppropriateSettingsKycTiers(
  $amount: Float
  $currency: String
  $targetKycProvider: KycProvider!
  $source: TransactionSource
  $widgetId: String
) {
  getAppropriateSettingsKycTiers(
    amount: $amount,
    currency: $currency,
    targetKycProvider: $targetKycProvider
    source: $source
    widgetId: $widgetId
  ) {
    count
    list {
      name
      description
      amount
      requireUserFullName
      requireUserPhone
      requireUserBirthday
      requireUserAddress
      requireUserFlatNumber
      levelName
      levelDescription
      originalLevelName
      originalFlowName
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
  $source: TransactionSource!,
  $sourceVaultId: String,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument!,
  $paymentProvider: String!,
  $widgetUserParamsId: String,
  $destination: String
) {
  createTransaction(transaction: {
    type: $transactionType
    source: $source
    sourceVaultId: $sourceVaultId
    currencyToSpend: $currencyToSpend
    currencyToReceive: $currencyToReceive
    amountToSpend: $amountToSpend
    instrument: $instrument
    paymentProvider: $paymentProvider
    widgetUserParamsId: $widgetUserParamsId
    destination: $destination
  }) {
    transactionId,
    code,
    feeFiat,
    feePercent,
    feeMinFiat,
    approxNetworkFee,
    data,
    userTier {
      name
      amount
      originalLevelName
      originalFlowName
    },
    requiredUserTier {
      name
      amount
      originalLevelName
      originalFlowName
    }
  }
}
`;

const PRE_AUTH = gql`
mutation PreAuth(
  $transactionId: String!,
  $instrument: PaymentInstrument!,
  $paymentProvider: String!
) {
  preauth(
    orderParams: {
      transactionId: $transactionId
      instrument: $instrument
      provider: $paymentProvider
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
    details
  }
}
`;

const PRE_AUTH_CARD = gql`
mutation PreAuth(
  $transactionId: String!,
  $instrument: PaymentInstrument!,
  $paymentProvider: String!,
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

const GET_WIDGET = gql`
query GetWidget($id: String!, $recaptcha: String!) {
  getWidget(
    id: $id,
    recaptcha: $recaptcha
  ) {
    widgetId
    name
    transactionTypes
    currenciesCrypto
    currenciesFiat
    hasFixedAddress
    instruments
    paymentProviders
    additionalSettings
    currentUserEmail
  }
}
`;

@Injectable()
export class PaymentDataService {
  constructor(private apollo: Apollo) { }

  getRates(listCrypto: string[], fiat: string): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const vars = {
        recaptcha: environment.recaptchaId,
        currenciesFrom: listCrypto,
        currencyTo: fiat
      };
      return this.apollo.watchQuery<any>({
        query: GET_RATES,
        variables: vars,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getOneToManyRates(from: string, to: string[], reverseRate: boolean): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const vars = {
        reverse: reverseRate,
        currencyFrom: from,
        currenciesTo: to
      };
      return this.apollo.watchQuery<any>({
        query: GET_ONE_TO_MANY_RATES,
        variables: vars,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getSettingsKycTiers(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_SETTINGS_KYC_TIERS,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  mySettingsKycTiers(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: MY_SETTINGS_KYC_TIERS,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  getAppropriateSettingsKycTiers(
    amountVal: number,
    currencyVal: string,
    sourceVal: TransactionSource,
    widgetId: string): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const widget = (widgetId !== '') ? widgetId : undefined;
      const vars = {
        amount: amountVal,
        currency: currencyVal,
        targetKycProvider: KycProvider.SumSub,
        source: sourceVal,
        widgetId: widget
      };
      return this.apollo.watchQuery<any>({
        query: GET_APPROPRIATE_SETTINGS_KYC_TIERS,
        variables: vars,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }

  createTransaction(
    transactionType: TransactionType,
    transactionSource: TransactionSource,
    sourceVault: string,
    currencyToSpend: string,
    currencyToReceive: string,
    amount: number,
    instrument: PaymentInstrument | undefined,
    providerName: string,
    userParamsId: string,
    walletAddress: string): Observable<any> {
    const wallet = (walletAddress === '') ? undefined : walletAddress;
    const transactionSourceVaultId = (sourceVault === '') ? undefined : sourceVault;
    const vars = {
      transactionType,
      source: transactionSource,
      sourceVaultId: transactionSourceVaultId,
      currencyToSpend,
      currencyToReceive: (currencyToReceive !== '') ? currencyToReceive : undefined,
      amountToSpend: amount,
      instrument,
      paymentProvider: (providerName !== '') ? providerName : undefined,
      widgetUserParamsId: (userParamsId !== '') ? userParamsId : undefined,
      destination: wallet
    };
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

  preAuthCard(id: string, paymentInstrument: string, paymentProvider: string, card: CardView): Observable<any> {
    return this.apollo.mutate({
      mutation: PRE_AUTH_CARD,
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

  preAuth(id: string, paymentInstrument: string, paymentProvider: string): Observable<any> {
    return this.apollo.mutate({
      mutation: PRE_AUTH,
      variables: {
        transactionId: id,
        instrument: paymentInstrument,
        paymentProvider
      }
    });
  }

  getProviders(fiatCurrency: string, widgetId: string | undefined): QueryRef<any, EmptyObject> {
      return this.apollo.watchQuery<any>({
        query: GET_PROVIDERS,
        variables: {
          fiatCurrency,
          widgetId
        },
        fetchPolicy: 'network-only'
      });
  }

  getWidget(paramsId: string): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const vars = {
        id: paramsId,
        recaptcha: environment.recaptchaId,
      };
      return this.apollo.watchQuery<any>({
        query: GET_WIDGET,
        variables: vars,
        fetchPolicy: 'network-only'
      });
    } else {
      return null;
    }
  }
}
