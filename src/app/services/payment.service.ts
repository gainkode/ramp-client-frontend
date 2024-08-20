import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { map, Observable } from 'rxjs';
import { KycProvider, OpenBankingDetails, PaymentBankInput, PaymentInstrument, PaymentMethod, PaymentProvider, PaymentProviderByInstrument, TransactionInput, TransactionSource, TransactionType } from '../model/generated-models';
import { CardView } from '../model/payment.model';

const GET_RATES = gql`
query GetRates($currenciesFrom: [String!]!, $currencyTo: String!, $reverse: Boolean) {
  getRates(
    currenciesFrom: $currenciesFrom,
    currencyTo: $currencyTo
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
  $paymentMethodId: String
) {
  getAppropriatePaymentProviders(
    fiatCurrency: $fiatCurrency
    widgetId: $widgetId
    source: $source
    amount: $amount
    transactionType: $transactionType
    paymentMethodId: $paymentMethodId
  ) {
    paymentProviderId
    name
    displayName
    currencies
    countriesCode2
    instruments
    default
    external
    wrBankAccount {
      au
      uk
      eu
      name
      bankAccountId
    }
  }
}
`;

const GET_METHODS = gql`
query GetAppropriatePaymentMethods(
  $widgetId: String
  $source: TransactionSource
  $transactionType: TransactionType
) {
  getAppropriatePaymentMethods(
    widgetId: $widgetId
    source: $source
    transactionType: $transactionType
  ) {
      paymentMethodId
      name
      displayName
  }
}
`;

const GET_OPENBANKING_DETAILS = gql`
query GetOpenBankingDetails(
  $paymentProvider: String!
) {
  getOpenBankingDetails(
    paymentProvider: $paymentProvider
  ) {
    yapily {
      banks {
        icon
        name
        id
        countries {
          displayName
          countryCode2
        }
      }
      countries {
        displayName
        countryCode2
      }
    }
  }
}
`;

const MY_SETTINGS_COST = gql`
query MySettingsCost(
  $transactionType: TransactionType!
  $instrument: PaymentInstrument!
  $paymentProvider: String
  $widgetId: String
) {
  mySettingsCost(
    transactionType: $transactionType
    instrument: $instrument
    paymentProvider: $paymentProvider
    widgetId: $widgetId
  ) {
    terms
  }
}
`;

const MY_BANK_CATEGORIES = gql`
query MyBankCategories(
  $transactionType: TransactionType!
  $transactionSource: TransactionSource!
  $instrument: PaymentInstrument!
) {
  myBankCategories(
    transactionType: $transactionType
    transactionSource: $transactionSource
    instrument: $instrument
  ) {
    id
    title
    transactionType
    transactionSource
    instrument
    countryCode
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
  $sourceAddress: String,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument,
  $instrumentDetails: String,
  $paymentProvider: String,
  $widgetUserParamsId: String,
  $destination: String,
  $verifyWhenPaid: Boolean,
  $treatAsGrossAmount: Boolean
  $wireTransferBankAccountId: String
  $wireTransferPaymentCategory: String
) {
  createTransaction(transaction: {
    type: $transactionType
    source: $source
    sourceAddress: $sourceAddress
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
    treatAsGrossAmount: $treatAsGrossAmount
    wireTransferBankAccountId: $wireTransferBankAccountId
    wireTransferPaymentCategory: $wireTransferPaymentCategory
  }) {
    transactionId,
    code,
    feeFiat,
    feePercent,
    feeMinFiat,
    approxNetworkFee,
    data,
    instrumentDetails
    sourceAddress
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
    requiredFields
  }
}
`;

const PRE_AUTH = gql`
mutation PreAuth(
  $transactionId: String!,
  $instrument: PaymentInstrument!,
  $paymentProvider: String!
  $bank: PaymentBankInput
) {
  preauth(
    orderParams: {
      transactionId: $transactionId
      instrument: $instrument
      provider: $paymentProvider
      bank: $bank
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
    openBankingObject {
      yapily {
        url
        qrCodeUrl
      }
    }
    details
  }
}
`;

const CREATE_APM_PAYMENT = gql`
mutation CreateApmPayment(
  $transactionId: String!,
  $instrument: PaymentInstrument!,
) {
  createApmPayment(
    orderParams: {
      transactionId: $transactionId
      instrument: $instrument
    }
  ) {
    type
    referenceCode
    externalUrl
    payId
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

@Injectable()
export class PaymentDataService {
	constructor(private apollo: Apollo) { }

	getRates(currenciesFrom: string[], currencyTo: string, reverse?: boolean): QueryRef<any, EmptyObject> {
		const variables = {
			currenciesFrom,
			currencyTo,
      reverse
		};

		return this.apollo.watchQuery<any>({
			query: GET_RATES,
			variables,
			fetchPolicy: 'network-only'
		});
	}

	getOneToManyRates(currencyFrom: string, currenciesTo: string[], reverse: boolean): QueryRef<any, EmptyObject> {
		const variables = {
			reverse,
			currencyFrom,
			currenciesTo
		};

		return this.apollo.watchQuery<any>({
			query: GET_ONE_TO_MANY_RATES,
			variables,
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
		amount: number,
		currency: string,
		source: TransactionSource,
		targetKycProvider: KycProvider,
		widgetId: string): QueryRef<any, EmptyObject> {
		const widget = (widgetId !== '') ? widgetId : undefined;
    
		const vars = {
			amount,
			currency,
			targetKycProvider,
			source,
			widgetId: widget
		};
		return this.apollo.watchQuery<any>({
			query: GET_APPROPRIATE_SETTINGS_KYC_TIERS,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}

	createTransaction(transactionInput: TransactionInput): Observable<any> {
		const { type, ...otherParams } = transactionInput;

		return this.apollo.mutate({
			mutation: CREATE_TRANSACTION,
			variables: {
				transactionType: type,
				...otherParams
			}
		});
	}

	confirmQuickCheckout(transactionId: string, code: number): Observable<any> {
		return this.apollo.mutate({
			mutation: EXECUTE_TRANSACTION,
			variables: {
				transactionId,
				code
			}
		});
	}

	preAuthCard(transactionId: string, instrument: string, paymentProvider: string, card: CardView): Observable<any> {
		return this.apollo.mutate({
			mutation: PRE_AUTH_CARD,
			variables: {
				transactionId,
				instrument,
				paymentProvider,
				cardNumber: card.cardNumber,
				expiredMonth: card.monthExpired,
				expiredYear: card.yearExpired,
				cvv: card.cvv,
				holder: card.holderName
			}
		});
	}

	preAuth(transactionId: string, instrument: string, paymentProvider: string, bank?: PaymentBankInput): Observable<any> {
		return this.apollo.mutate({
			mutation: PRE_AUTH,
			variables: {
				transactionId,
				instrument,
				paymentProvider,
				bank
			}
		});
	}

	createApmPayment(id: string, paymentInstrument: string): Observable<any> {
		return this.apollo.mutate({
			mutation: CREATE_APM_PAYMENT,
			variables: {
				transactionId: id,
				instrument: paymentInstrument,
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

	abandonCryptoInvoice(cryptoInvoiceId: string): Observable<any> {
		const variables = { cryptoInvoiceId };

		return this.apollo.mutate({
			mutation: ABANDON_CRYPTO_INVOICE,
			variables
		});
	}
  
  getPaymentMethods(
    widgetId: string | undefined, 
    source: TransactionSource, 
    transactionType: TransactionType
  ): Observable<PaymentMethod[]> {
		return this.apollo.watchQuery<{ getAppropriatePaymentMethods: PaymentMethod[]; }>({
      query: GET_METHODS,
      variables: {
        widgetId,
        source,
        transactionType
      },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(map(result => result.data.getAppropriatePaymentMethods));
	}

	getProviders(
    fiatCurrency: string, 
    widgetId: string | undefined, 
    source: TransactionSource, 
    transactionType: TransactionType,
    paymentMethodId: string,
    amount?: number): Observable<PaymentProvider[]> {
    return this.apollo.watchQuery<{ getAppropriatePaymentProviders: PaymentProvider[]; }>({
			query: GET_PROVIDERS,
			variables: {
				fiatCurrency,
				widgetId,
        paymentMethodId,
				source,
				amount: parseFloat(<any>amount),
				transactionType
			},
			fetchPolicy: 'network-only'
    }).valueChanges.pipe(map(result => result.data.getAppropriatePaymentProviders));
	}

	mySettingsCost(transactionType: TransactionType, instrument: PaymentInstrument, paymentProvider: string, widgetId: string): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: MY_SETTINGS_COST,
			variables: {
				transactionType,
				instrument,
        paymentProvider,
        widgetId
			},
			fetchPolicy: 'network-only'
		});
	}

	getOpenBankgingDetails(paymentProvider: string): Observable< { getOpenBankingDetails: OpenBankingDetails; } > {
		return this.apollo.mutate<{ getOpenBankingDetails: OpenBankingDetails; }>({
			mutation: GET_OPENBANKING_DETAILS,
			variables: {
				paymentProvider
			}
		}).pipe(map(response => response.data));
	}


  myBankCategories(
		transactionType: TransactionType,
		transactionSource: TransactionSource,
		instrument: PaymentInstrument): QueryRef<any, EmptyObject> {
		const vars = {
			transactionType,
			transactionSource,
			instrument
		};
		return this.apollo.watchQuery<any>({
			query: MY_BANK_CATEGORIES,
			variables: vars,
			fetchPolicy: 'network-only'
		});
	}

	getWidget(id: string): QueryRef<any, EmptyObject> {
		const variables = { id };

		return this.apollo.watchQuery<any>({
			query: GET_WIDGET,
			variables,
			fetchPolicy: 'network-only'
		});
	}
}
