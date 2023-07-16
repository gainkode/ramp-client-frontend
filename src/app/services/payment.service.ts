import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { KycProvider, PaymentInstrument, PaymentPreauthInput, TransactionSource, TransactionType } from '../model/generated-models';
import { CardView } from '../model/payment.model';

const GET_RATES = gql`
query GetRates($currenciesFrom: [String!]!, $currencyTo: String!) {
  getRates(
    currenciesFrom: $currenciesFrom,
    currencyTo: $currencyTo
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
  $source: TransactionSource
  $amount: Float
  $transactionType: TransactionType
) {
  getAppropriatePaymentProviders(
    fiatCurrency: $fiatCurrency
    widgetId: $widgetId
    source: $source
    amount: $amount
    transactionType: $transactionType
  ) {
    instrument
    provider {
      paymentProviderId
      name
      displayName
      currencies
      countriesCode2
      instruments
      default
    }
  }
}
`;

const MY_SETTINGS_COST = gql`
query MySettingsCost(
  $transactionType: TransactionType!
  $instrument: PaymentInstrument!
  $currency: String
) {
  mySettingsCost(
    transactionType: $transactionType
    instrument: $instrument
    currency: $currency
  ) {
    terms
    bankAccounts {
      bankAccountId
      au
      uk
      eu
    }
  }
}
`;

const MY_SETTINGS_FEE = gql`
query MySettingsFee(
  $transactionType: TransactionType!
  $transactionSource: TransactionSource!
  $instrument: PaymentInstrument!
  $paymentProvider: String
  $currencyTo: String
  $currencyFrom: String
  $widgetId: String
) {
  mySettingsFee(
    transactionType: $transactionType
    transactionSource: $transactionSource
    paymentProvider: $paymentProvider
    instrument: $instrument
    currencyTo: $currencyTo
    currencyFrom: $currencyFrom
    widgetId: $widgetId,
  ) {
    terms
    wireDetails
    currency
    rateToEur
    costs {
      terms
      bankAccounts {
        bankAccountId
        name
        description
        au
        uk
        eu
        openpayd
        openpaydObject
        flashfx
        flashfxObject
        monoova
        monoovaObject
        primeTrust
        primeTrustObject
      }
    },
    requiredFields
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
query MySettingsKycTiers(
  $widgetId: String
) {
  mySettingsKycTiers(
    widgetId: $widgetId
  ) {
    count
    list {
      currency
      settingsKycTierId
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
      showForm
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
      settingsKycTierId
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
      skipForWaiting
      showForm
    }
  }
}
`;

const EXECUTE_TRANSACTION = gql`
mutation ExecuteTransaction(
  $transactionId: String,
  $code: Int
) {
  executeTransaction(
    transactionId: $transactionId,
    code: $code
  ) {
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

const CREATE_TRANSACTION = gql`
mutation CreateTransaction(
  $transactionType: TransactionType!,
  $source: TransactionSource!,
  $sourceVaultId: String,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument,
  $instrumentDetails: String,
  $paymentProvider: String,
  $widgetUserParamsId: String,
  $destination: String
  $verifyWhenPaid: Boolean
) {
  createTransaction(transaction: {
    type: $transactionType
    source: $source
    sourceVaultId: $sourceVaultId
    currencyToSpend: $currencyToSpend
    currencyToReceive: $currencyToReceive
    amountToSpend: $amountToSpend
    instrument: $instrument
    instrumentDetails: $instrumentDetails
    paymentProvider: $paymentProvider
    widgetUserParamsId: $widgetUserParamsId
    destination: $destination
    verifyWhenPaid: $verifyWhenPaid
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

const CREATE_TRANSACTION_WITH_WIDGET_USER_PARAMS = gql`
mutation CreateTransactionWithWidgetUserParams(
  $transactionType: TransactionType!,
  $source: TransactionSource!,
  $sourceVaultId: String,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument,
  $instrumentDetails: String,
  $paymentProvider: String,
  $widgetUserParamsId: String,
  $destination: String
  $verifyWhenPaid: Boolean
  $widgetId: String
) {
  createTransactionWithWidgetUserParams(
    transactionInput: {
      type: $transactionType
      source: $source
      sourceVaultId: $sourceVaultId
      currencyToSpend: $currencyToSpend
      currencyToReceive: $currencyToReceive
      amountToSpend: $amountToSpend
      instrument: $instrument
      instrumentDetails: $instrumentDetails
      paymentProvider: $paymentProvider
      widgetUserParamsId: $widgetUserParamsId
      destination: $destination
      verifyWhenPaid: $verifyWhenPaid
    }
    widgetId: $widgetId
  )
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

const SEND_INVOICE = gql`
mutation SendInvoice(
  $transactionId: String
) {
  sendInvoice(transactionId: $transactionId)
}
`;

const GET_WIDGET = gql`
query GetWidget($id: String!) {
  getWidget(
    id: $id,
  ) {
    widgetId
    name
    transactionTypes
    currenciesCrypto
    currenciesFiat
    hasFixedAddress
    destinationAddress{
      currency
      destination
    }
    instruments
    paymentProviders
    additionalSettings
    currentUserEmail
    currentUserParams
    allowToPayIfKycFailed
    fee
    masked
  }
}
`;

const CREATE_INVOICE = gql`
mutation CreateInvoice(
  $currencyToSend: String,
  $widgetId: String,
  $amountToSend: Float
) {
	createInvoice(
		currencyToSend: $currencyToSend,
    widgetId: $widgetId,
    amountToSend: $amountToSend
	) {
    invoice {
      cryptoInvoiceId,
      name
      destination
      vaultId
      currencyToSend
      amountToSend
      currencyToReceive
    }
    convertedAmount
    convertedCurrency
	}
}
`;

const CALCULATE_INVOICE = gql`
mutation CalculateInvoice(
  $invoiceId: String
) {
	calculateInvoice(
		invoiceId: $invoiceId
	) {
    invoice {
      cryptoInvoiceId,
      name
      destination
      vaultId
      currencyToSend
      amountToSend
      currencyToReceive
    }
    convertedAmount
    convertedCurrency
	}
}
`;

const ABANDON_TRANSACTION = gql`
mutation AbandonTransaction(
  $transactionId: String!
) {
  abandonTransaction(
    transactionId: $transactionId
  ) {
    transactionId
  }
}
`;

const ABANDON_CRYPTO_INVOICE = gql`
mutation AbandonCryptoInvoice(
  $cryptoInvoiceId: String!
) {
  abandonCryptoInvoice(
    cryptoInvoiceId: $cryptoInvoiceId
  ) {
    cryptoInvoiceId
  }
}
`;

const GET_CORIUNDER_TOKEN = gql`
query CoriunderWebAuthParams(
 $transactionId: String!
 $instrument: PaymentInstrument!
  $provider: String!
  $card: PaymentCard
  $transactionId: String
) {
    getCoriunderWebAuthParams(
        params: {
            transactionId: $transactionId
            instrument: $instrument
            provider: $provider
            card: $card
        }
        transactionId: $transactionId
    )
}
`;

@Injectable()
export class PaymentDataService {
	constructor(private apollo: Apollo) { }

	getRates(listCrypto: string[], fiat: string): QueryRef<any, EmptyObject> {
		const vars = {
			currenciesFrom: listCrypto,
			currencyTo: fiat
		};
		return this.apollo.watchQuery<any>({
			query: GET_RATES,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}

	getOneToManyRates(from: string, to: string[], reverseRate: boolean): QueryRef<any, EmptyObject> {
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
	}

	getSettingsKycTiers(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_SETTINGS_KYC_TIERS,
			fetchPolicy: 'network-only'
		});
	}

	mySettingsKycTiers(widgetId: string | undefined): QueryRef<any, EmptyObject> {
		const vars = {
			widgetId: (widgetId === '') ? undefined : widgetId
		};
		return this.apollo.watchQuery<any>({
			query: MY_SETTINGS_KYC_TIERS,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}

	getAppropriateSettingsKycTiers(
		amountVal: number,
		currencyVal: string,
		sourceVal: TransactionSource,
		kycProvider: KycProvider,
		widgetId: string): QueryRef<any, EmptyObject> {
		const widget = (widgetId !== '') ? widgetId : undefined;
		const vars = {
			amount: amountVal,
			currency: currencyVal,
			targetKycProvider: kycProvider,
			source: sourceVal,
			widgetId: widget
		};
		return this.apollo.watchQuery<any>({
			query: GET_APPROPRIATE_SETTINGS_KYC_TIERS,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}

	createTransaction(
		transactionType: TransactionType,
		transactionSource: TransactionSource,
		sourceVault: string,
		currencyToSpend: string,
		currencyToReceive: string,
		amount: number,
		instrument: PaymentInstrument | undefined,
		instrumentDetails: string,
		providerName: string,
		userParamsId: string,
		walletAddress: string,
		verifyWhenPaid: boolean): Observable<any> {
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
			instrumentDetails: (instrumentDetails !== '') ? instrumentDetails : undefined,
			paymentProvider: (providerName !== '') ? providerName : undefined,
			widgetUserParamsId: (userParamsId !== '') ? userParamsId : undefined,
			destination: wallet,
			verifyWhenPaid
		};
		return this.apollo.mutate({
			mutation: CREATE_TRANSACTION,
			variables: vars
		});
	}

	createTransactionWithWidgetUserParams(
		transactionType: TransactionType,
		transactionSource: TransactionSource,
		sourceVault: string,
		currencyToSpend: string,
		currencyToReceive: string,
		amount: number,
		instrument: PaymentInstrument | undefined,
		instrumentDetails: string,
		providerName: string,
		userParamsId: string,
		walletAddress: string,
		verifyWhenPaid: boolean,
		widgetId: string): Observable<any> {
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
			instrumentDetails: (instrumentDetails !== '') ? instrumentDetails : undefined,
			paymentProvider: (providerName !== '') ? providerName : undefined,
			widgetUserParamsId: (userParamsId !== '') ? userParamsId : undefined,
			destination: wallet,
			verifyWhenPaid,
			widgetId
		};
		return this.apollo.mutate({
			mutation: CREATE_TRANSACTION_WITH_WIDGET_USER_PARAMS,
			variables: vars
		});
	}

	confirmQuickCheckout(id: string, code: number): Observable<any> {
		return this.apollo.mutate({
			mutation: EXECUTE_TRANSACTION,
			variables: {
				transactionId: id,
				code
			}
		});
	}

  getCoriunderWebAuthParams(params: PaymentPreauthInput): Observable<any> {
		return this.apollo.mutate({
			mutation: GET_CORIUNDER_TOKEN,
			variables: {
        params,
        transactionId: params.transactionId
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

	sendInvoice(transactionId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: SEND_INVOICE,
			variables: {
				transactionId
			}
		});
	}

	createInvoice(widgetId: string, currency: string, amount: number): Observable<any> {
		return this.apollo.mutate({
			mutation: CREATE_INVOICE,
			variables: {
				currencyToSend: currency,
				widgetId: widgetId,
				amountToSend: amount
			}
		});
	}


	calculateInvoice(id: string): Observable<any> {
		return this.apollo.mutate({
			mutation: CALCULATE_INVOICE,
			variables: {
				invoiceId: id
			}
		});
	}

	abandonTransaction(id: string): Observable<any> {
		const vars = {
			transactionId: id
		};
		return this.apollo.mutate({
			mutation: ABANDON_TRANSACTION,
			variables: vars
		});
	}
  
	abandonCryptoInvoice(id: string): Observable<any> {
		const vars = {
			cryptoInvoiceId: id
		};
		return this.apollo.mutate({
			mutation: ABANDON_CRYPTO_INVOICE,
			variables: vars
		});
	}
  
	getProviders(fiatCurrency: string, widgetId: string | undefined, source: TransactionSource, transactionType: TransactionType, amount?: Number): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_PROVIDERS,
			variables: {
				fiatCurrency,
				widgetId,
				source,
				amount: parseFloat(<any>amount),
				transactionType
			},
			fetchPolicy: 'network-only'
		});
	}

	mySettingsCost(transactionType: TransactionType, instrument: PaymentInstrument, currency: string): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: MY_SETTINGS_COST,
			variables: {
				transactionType,
				instrument,
				currency
			},
			fetchPolicy: 'network-only'
		});
	}

	mySettingsFee(
		transactionType: TransactionType,
		source: TransactionSource,
		instrument: PaymentInstrument,
		paymentProvider: string,
		currencyTo: string,
		currencyFrom: string,
		widgetId: string): QueryRef<any, EmptyObject> {
		const vars = {
			transactionType,
			transactionSource: source,
			instrument,
			paymentProvider: (paymentProvider === '') ? undefined : paymentProvider,
			currencyTo,
			currencyFrom,
			widgetId
		};
		return this.apollo.watchQuery<any>({
			query: MY_SETTINGS_FEE,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}

	getWidget(paramsId: string): QueryRef<any, EmptyObject> {
		const vars = {
			id: paramsId,
		};
		return this.apollo.watchQuery<any>({
			query: GET_WIDGET,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}
}
