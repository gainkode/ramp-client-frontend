import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef, WatchQueryOptions } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { CostScheme } from '../model/cost-scheme.model';
import { FeeScheme } from '../model/fee-scheme.model';
import {
	ApiKeyListResult,
	AssetAddress,
	AssetAddressListResult,
	CountryCodeType,
	DashboardStats,
	FiatVaultUserListResult,
	KycInfo,
	QueryGetApiKeysArgs,
	QueryGetDashboardStatsArgs,
	QueryGetFiatVaultsArgs,
	QueryGetNotificationsArgs, QueryGetRiskAlertsArgs,
	QueryGetSettingsFeeArgs,
	QueryGetSettingsKycArgs,
	QueryGetSettingsKycLevelsArgs,
	QueryGetSettingsKycTiersArgs,
	QueryGetTransactionsArgs,
	QueryGetUserActionsArgs,
	QueryGetUserKycInfoArgs,
	QueryGetUsersArgs,
	QueryGetUserStateArgs,
	QueryGetWalletsArgs,
	QueryGetTransactionLifelinesArgs,
	QueryGetWidgetsArgs, RiskAlertResultList,
	SettingsCommon,
	SettingsFeeListResult, SettingsKycLevelListResult,
	SettingsKycListResult,
	SettingsKycTier,
	SettingsKycTierListResult,
	TransactionListResult,
	UserActionListResult,
	UserDeviceListResult,
	UserInput,
	UserListResult,
	UserMode,
	UserNotificationLevel,
	UserNotificationListResult,
	UserState,
	UserType,
	WidgetListResult,
	WireTransferBankAccount,
	TransactionStatusHistoryListResult,
	TransactionHistory,
	QueryGetTransactionStatusHistoryArgs,
	PaymentProviderPayoutType,
	TransactionInput,
	CurrencyPairLiquidityProvidersListResult,
	QueryGetCurrencyPairLiquidityProviderArgs,
	MessageListResult,
	QueryGetMessagesArgs,
	TransactionLifelineStatusItem,
	TransactionUpdateInput,
	LiquidityProviderEntity,
	DashboardMerchantStats,
	QueryGetDashboardMerchantStatsArgs,
	SettingsFeeSimilarResult,
  SettingsCostSimilarResult,
  TransactionSimulatorResult,
  UserFilterInput
} from '../model/generated-models';
import { KycLevel, KycScheme, KycTier } from '../model/identification.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionItemFull, TransactionStatusHistoryItem } from '../model/transaction.model';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { ApolloQueryResult, FetchResult, MutationOptions } from '@apollo/client/core';
import { ErrorService } from './error.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Filter } from '../admin/model/filter.model';
import { DeviceItem, UserActionItem, UserItem } from '../model/user.model';
import { FiatWalletItem, WalletItem } from '../admin/model/wallet.model';
import { NotificationItem } from '../model/notification.model';
import { WidgetItem } from '../admin/model/widget.model';
import { RiskAlertItem } from '../admin/model/risk-alert.model';
import { ApiKeyItem } from 'model/apikey.model';
import { CurrencyPairItem } from 'model/currencyPairs.model';
import { LiquidityProviderEntityItem } from 'model/liquidity-provider.model';
import { MessageItem } from 'model/message.model';

/* region queries */

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats(
    $createdDateInterval: DateTimeInterval
    $completedDateInterval: DateTimeInterval
    $updateDateInterval: DateTimeInterval
    $userIdsOnly: [String!]
    $widgetIdsOnly: [String!]
    $sourcesOnly: [TransactionSource!]
    $countriesOnly: [String!]
    $countryCodeType: CountryCodeType
    $accountTypesOnly: [UserType!]
    $fiatCurrency: String
  ) {
    getDashboardStats(
      createdDateInterval: $createdDateInterval
      completedDateInterval: $completedDateInterval
      updateDateInterval: $updateDateInterval
      userIdsOnly: $userIdsOnly
      widgetIdsOnly: $widgetIdsOnly
      sourcesOnly: $sourcesOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      accountTypesOnly: $accountTypesOnly
      fiatCurrency: $fiatCurrency
    ) {
      buys {
        approved {count, volume},
        declined {count, volume},
        failed {count, volume},
        chargedBack {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        byInstruments {
          instrument,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume},
          ratio
        }
      }
			paids {
				buys {
					count
					volume
				}
				sells {
					count
					volume
				}
			}
      deposits {
        approved {count, volume},
        declined {count, volume},
        failed {count, volume},
        chargedBack {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        byInstruments {
          instrument,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume},
          ratio
        }
      }
      transfers {
        approved {count, volume},
        declined {count, volume},
        failed {count, volume},
        chargedBack {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        toMerchant {
          instrument,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
          ratio
        },
        toCustomer {
          instrument,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume},
          ratio
        }
      }
      receives {
        approved {count, volume},
        declined {count, volume},
        failed {count, volume},
        chargedBack {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        toMerchant {
          instrument,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
          ratio
        },
        toCustomer {
          instrument,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume},
          ratio
        }
      }
      withdrawals {
        approved {count, volume},
        declined {count, volume},
        failed {count, volume},
        chargedBack {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        byInstruments {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        }
      }
      sells {
        approved {count, volume},
        declined {count, volume},
        failed {count, volume},
        chargedBack {count, volume},
        abandoned {count, volume},
        inProcess {count, volume},
        fee {count, volume},
        ratio,
        byInstruments {
          instrument,
          ratio,
          approved {count, volume},
          declined {count, volume},
          failed {count, volume},
          chargedBack {count, volume},
          abandoned {count, volume},
          inProcess {count, volume},
          fee {count, volume}
        }
      }
      balances {
        currency,
        volume {count, volume}
      }
      openpaydBalances {
        currency, balance
      }
      monoovaBalances {
        currency, balance
      }
      liquidityProviderBalances {
        currency, balance
      }
    }
  }
`;

const GET_DASHBOARD_MERCHANT_STATS = gql`
  query etDashboardMerchantStats(
    $createdDateInterval: DateTimeInterval
    $completedDateInterval: DateTimeInterval
    $updateDateInterval: DateTimeInterval
    $userIdsOnly: [String!]
    $widgetIdsOnly: [String!]
    $sourcesOnly: [TransactionSource!]
    $countriesOnly: [String!]
    $countryCodeType: CountryCodeType
    $accountTypesOnly: [UserType!]
    $fiatCurrency: String
  ) {
    getDashboardMerchantStats(
      createdDateInterval: $createdDateInterval
      completedDateInterval: $completedDateInterval
      updateDateInterval: $updateDateInterval
      userIdsOnly: $userIdsOnly
      widgetIdsOnly: $widgetIdsOnly
      sourcesOnly: $sourcesOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      accountTypesOnly: $accountTypesOnly
      fiatCurrency: $fiatCurrency
    ) {
      transactionsAmount,
      transactionsTotal,
      usersTotal,
      usersKycWaitingTotal,
      currency
    }
  }
`;

const GET_FEE_SETTINGS = gql`
  query GetSettingsFee {
    getSettingsFee(
      filter: ""
      orderBy: [
        { orderBy: "default", desc: true }
        { orderBy: "name", desc: false }
      ]
    ) {
      count
      list {
        settingsFeeId
        name
        default
        description
        terms
        wireDetails
        targetInstruments
        targetUserTypes
        targetUserModes
        targetPaymentProviders
        targetTransactionTypes
        targetFilterType
        targetFilterValues
        currency
        rateToEur
        targetCurrenciesFrom
        targetCurrenciesTo
        deleted
        widgetIds
      }
    }
  }
`;

const GET_COST_SETTINGS = gql`
  query GetSettingsCost {
    getSettingsCost(
      filter: ""
      orderBy: [
        { orderBy: "default", desc: true }
        { orderBy: "name", desc: false }
      ]
    ) {
      count
      list {
        settingsCostId
        name
        default
        description
        bankAccounts { bankAccountId, name }
        terms
        targetFilterType
        targetFilterValues
        targetInstruments
        targetTransactionTypes
        targetPaymentProviders
        widgetIds
      }
    }
  }
`;

const GET_WIRE_TRANSFER_SETTINGS = gql`
query GetWireTransferBankAccounts {
  getWireTransferBankAccounts {
    count
    list {
      bankAccountId
      name
      description
      au
      uk
      eu
      paymentProviders
    }
  }
}
`;

const GET_SETTINGS_KYC_TIERS_SHORT = gql`
query GetSettingsKycTiers($userId: String) {
  getSettingsKycTiers(
    userId: $userId
    orderBy: [
      { orderBy: "amount", desc: false }
    ]
  ) {
      count
      list {
        settingsKycTierId
        name
      }
    }
  }
`;

const GET_SETTINGS_KYC_TIERS = gql`
query GetSettingsKycTiers {
  getSettingsKycTiers(
    orderBy: [
      { orderBy: "name", desc: false }
    ]
  ) {
      count
      list {
        settingsKycTierId
        name
        description
        amount
        targetKycProviders
        targetUserType
        targetUserModes
        targetFilterType
        targetFilterValues
        level {
          settingsKycLevelId
          name
          data
          description
          order
        }
        requireUserFullName
        requireUserPhone
        requireUserBirthday
        requireUserAddress
        requireUserFlatNumber
        created
        createdBy
        default
      }
    }
  }
`;

const GET_KYC_SETTINGS = gql`
  query GetSettingsKyc {
    getSettingsKyc(
      filter: ""
      orderBy: [
        { orderBy: "default", desc: true }
        { orderBy: "name", desc: false }
      ]
    ) {
      count
      list {
        default
        settingsKycId
        name
        description
        targetKycProviders
        targetUserType
        targetUserModes
        targetFilterType
        targetFilterValues
        requireUserFullName
        requireUserPhone
        requireUserBirthday
        requireUserAddress
        requireUserFlatNumber
        levels {
          settingsKycLevelId
          name
          data
          description
          order
        }
      }
    }
  }
`;

const GET_KYC_LEVELS = gql`
  query GetSettingsKycLevels($filter: String) {
    getSettingsKycLevels(
      filter: $filter
      orderBy: [{ orderBy: "name", desc: false }]
    ) {
      count
      list {
        settingsKycLevelId
        name
        description
        userType
        data
        order
        created
        createdBy
      }
    }
  }
`;

const GET_NOTIFICATIONS = gql`
  query GetNotifications(
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
    $filter: String
    $userNotificationTypeCode: String
  ) {
    getNotifications(
      skip: $skip
      first: $first
      orderBy: $orderBy
      filter: $filter
      userNotificationTypeCode: $userNotificationTypeCode
    ) {
      count
      list {
        created
        linkedId
        linkedTable
        params
        text
        title
        user {
          email
        }
        userId
        userNotificationId
        userNotificationLevel
        userNotificationTypeCode
        viewed
      }
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages(
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
    $filter: String
  ) {
    getMessages(
      skip: $skip
      first: $first
      orderBy: $orderBy
      filter: $filter
    ) {
      count
      list {
        messageId
        userNotificationId
        userId
        objectId
        messageType
        created
        params
        messageEmailId
        messageStatus
        user {
          email
        }
      }
    }
  }
`;

const GET_USER_ACTIONS = gql`
query GetUserActions(
  $skip: Int
  $first: Int
  $orderBy: [OrderBy!]
  $filter: String
  $userId: String
  $resultsOnly: [UserActionResult!]
  $statusesOnly: [String!]
  $actionTypesOnly: [UserActionType!]
  $createdDateInterval: DateTimeInterval
) {
  getUserActions(
    skip: $skip
    first: $first
    orderBy: $orderBy
    filter: $filter
    userId: $userId
    resultsOnly: $resultsOnly
    statusesOnly: $statusesOnly
    actionTypesOnly: $actionTypesOnly
    createdDateInterval: $createdDateInterval
  ) {
    count
    list {
      userActionId
      userId
      userEmail
      currentUserEmail
      ip
      objectId
      actionType
      linkedIds
      info
      result
      status
      date
    }
  }
}
`;

const GET_COUNTRY_BLACK_LIST = gql`
query GetCountryBlackList {
  getCountryBlackList {
    count
    list {
      countryCode2
    }
  }
}
`;

const GET_RISK_ALERTS = gql`
  query GetRiskAlerts(
    $userId: String
    $code: RiskAlertCodes
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getRiskAlerts(
      userId: $userId
      code: $code
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        created
        details
        riskAlertId
        riskAlertTypeCode
        userId
        user { firstName, lastName, email, mode, type }
      }
    }
  }
`;

const GET_DEVICES = gql`
query GetDevices {
  getDevices {
    count
    list {
      userDeviceId
      userId
      created
      countryCode2
      countryCode3
      city
      region
      eu
      metro
      area
      location
      browser
      device
      deviceConfirmed
      ip
    }
  }
}
`;

const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $transactionIdsOnly: [String!]
    $userIdsOnly: [String!]
    $sourcesOnly: [TransactionSource!]
    $from: String
    $widgetIdsOnly: [String!]
    $countriesOnly: [String!]
    $countryCodeType: CountryCodeType
    $accountTypesOnly: [UserType!]
    $accountModesOnly: [UserMode]
    $transactionTypesOnly: [TransactionType!]
    $transactionStatusesOnly: [String!]
    $userTierLevelsOnly: [String!]
    $riskLevelsOnly: [String!]
    $paymentInstrumentsOnly: [PaymentInstrument!]
    $kycStatusesOnly: [TransactionKycStatus!]
    $createdDateInterval: DateTimeInterval
    $completedDateInterval: DateTimeInterval
    $updateDateInterval: DateTimeInterval
    $walletAddressOnly: String
    $verifyWhenPaid: Boolean
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
    $flag: Boolean
    $transactionWasEverCompleted: Boolean
    $preauth: Boolean
    $fiatCurrency: String
    $recallNumber: String
    $hasRecallNumber: Boolean
    $reversalProcessedDateInterval: DateTimeInterval
    $recallRegisteredDateInterval: DateTimeInterval
  ) {
    getTransactions(
      transactionIdsOnly: $transactionIdsOnly
      userIdsOnly: $userIdsOnly
      sourcesOnly: $sourcesOnly
      from: $from,
      widgetIdsOnly: $widgetIdsOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      accountTypesOnly: $accountTypesOnly
      accountModesOnly: $accountModesOnly
      transactionTypesOnly: $transactionTypesOnly
      transactionStatusesOnly: $transactionStatusesOnly
      userTierLevelsOnly: $userTierLevelsOnly
      riskLevelsOnly: $riskLevelsOnly
      paymentInstrumentsOnly: $paymentInstrumentsOnly
      kycStatusesOnly: $kycStatusesOnly
      createdDateInterval: $createdDateInterval
      completedDateInterval: $completedDateInterval
      updateDateInterval: $updateDateInterval
      walletAddressOnly: $walletAddressOnly
      verifyWhenPaid: $verifyWhenPaid
      filter: $filter
      flag: $flag
      transactionWasEverCompleted: $transactionWasEverCompleted
      recallNumber: $recallNumber
      hasRecallNumber: $hasRecallNumber
      reversalProcessedDateInterval: $reversalProcessedDateInterval
      recallRegisteredDateInterval: $recallRegisteredDateInterval
      preauth: $preauth
      fiatCurrency: $fiatCurrency
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        accountStatus
        amountToReceive
        amountToReceiveWithoutFee
        amountToSpend
        approxNetworkFeeFiat
        benchmarkTransferOrder {
          orderId
          transferDetails
          transferHash
          originalOrderId
          status
          subStatus
        }
        benchmarkTransferOrderBlockchainLink
        merchantFeeTransferOrderBlockchainLink
        code
        comment
        flag
        created
        currencyToReceive
        currencyToSpend
        data
        destination
        destVault
        destVaultId
        executed
        feeDetails
        feeFiat
        feeMinFiat
        feePercent
        initialAmountToReceive
        initialAmountToReceiveWithoutFee
        initialRate
        instrument
        instrumentDetails
        kycStatus
        liquidityOrder { 
          statusReason
          status
          state
          executingResult
          orderId
          originalOrderId
        }
        liquidityOrderId
        liquidityProvider
        paymentOrderId
        paymentOrder {
          amount
          captureOperationSn
          currency
          preauth
          provider
          operations {
            operationId
            created
            type
            sn
            status
            details
            callbackDetails
            errorCode
            errorMessage
          }
          orderId
          originalOrderId
          paymentInfo
          preauthOperationSn
          refundOperationSn
          statusReason
          status
        }
        paymentProvider
        rate
        source
        sourceVault
        sourceVaultId
        sourceAddress
        status
        subStatus
        updated
        user {
          buildingName
          buildingNumber
          countryCode2
          email
          firstName
          flatNumber
          kycStatus
          mode
          lastName
          postCode
          referralCode
          stateName
          street
          subStreet
          town
          type
          userId
          companyName
        }
        userId
        userIp
        userTier { name }
        transactionId
        transferOrder {
          amount
          executingResult
          feeCurrency
          orderId
          originalOrderId
          publishingResult
          status
          subStatus
          transferDetails
          transferHash
          screeningAnswer
          screeningRiskscore
          screeningStatus
          screeningData
          sourceVaultId
        }
        merchantTransferOrder {
          amount
          executingResult
          feeCurrency
          orderId
          originalOrderId
          publishingResult
          status
          subStatus
          transferDetails
          transferHash
          screeningAnswer
          screeningRiskscore
          screeningStatus
          screeningData
        }
        widgetUserParams {
          merchantFeePercent
        }
        transferOrderBlockchainLink
        type        
        verifyWhenPaid        
        widget
        widgetId
        screeningAnswer
        risk
        riskCodes
        screeningRiskscore
        screeningStatus
        screeningData
        canBeCancelled
        hasToBeRefunded
        canBeReviewed
        merchantFeePercent
        recallNumber
        reversalProcessed
        recallRegistered
        paymentOrderRecallNumberLink
        senderName
        recipientName
      }
    }
  }
`;

const GET_TRANSACTION_STATUS_HISTORY = gql`
  query getTransactionStatusHistory(
    $transactionIds: [String!]
    $userIds: [String!]
    $statusesOnly: [String!]
    $createdDateInterval: DateTimeInterval
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getTransactionStatusHistory(
      transactionIds: $transactionIds
      userIds: $userIds
      statusesOnly: $statusesOnly
      createdDateInterval: $createdDateInterval
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        transactionStatusHistoryId, 
        transactionId, 
        userId, 
        transaction{
          code,email
        }, 
        userEmail, 
        created, 
        oldStatus, 
        newStatus, 
        newStatusReason
      }
    }
  }
`;

const GET_USERS = gql`
  query GetUsers(
    $userIdsOnly: [String!]
    $roleIdsOnly: [String!]
    $accountTypesOnly: [UserType!]
    $accountModesOnly: [UserMode!]
    $accountStatusesOnly: [AccountStatus!]
    $userTierLevelsOnly: [String!]
    $riskLevelsOnly: [RiskLevel!]
    $countriesOnly: [String!]
    $countryCodeType: CountryCodeType!
    $kycStatusesOnly: [KycStatus!]
    $registrationDateInterval: DateTimeInterval
    $widgetIdsOnly: [String!]
    $totalBuyVolumeOver: Int
    $transactionCountOver: Int
    $verifyWhenPaid: Boolean
    $flag: Boolean
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getUsers(
      userIdsOnly: $userIdsOnly
      roleIdsOnly: $roleIdsOnly
      accountTypesOnly: $accountTypesOnly
      accountModesOnly: $accountModesOnly
      accountStatusesOnly: $accountStatusesOnly
      userTierLevelsOnly: $userTierLevelsOnly
      riskLevelsOnly: $riskLevelsOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      kycStatusesOnly: $kycStatusesOnly
      registrationDateInterval: $registrationDateInterval
      widgetIdsOnly: $widgetIdsOnly
      totalBuyVolumeOver: $totalBuyVolumeOver
      transactionCountOver: $transactionCountOver
      verifyWhenPaid: $verifyWhenPaid
      flag: $flag
      filter: $filter,
      skip: $skip,
      first: $first,
      orderBy: $orderBy
      ) {
      count
      list {
        userId
        email
        emailConfirmed
        firstName
        lastName
        type
        mode
        birthday
        gender
        countryCode2
        countryCode3
        created
        updated
        deleted
        defaultFiatCurrency
        defaultCryptoCurrency
        accountStatus
        kycProvider
        kycStatus
        kycTier { name }
        kycReviewDate
        kycStatusDate
        kycReviewComment
        kycPrivateComment
        kycReviewRejectedType
        kycReviewRejectedLabels
        kycReviewResult
        kycStatusUpdateRequired
        kycValid
        phone
        postCode
        town
        street
        subStreet
        stateName
        buildingName
        buildingNumber
        flatNumber
        addressLine
        referralCode
        widgetId
        widgetName
        widgetCode
        affiliateId
        affiliateCode
        risk
        riskCodes
        totalTransactionCount
        averageTransaction
        totalDepositCompleted
        totalDepositCompletedCount
        totalDepositInProcess
        totalDepositInProcessCount
        totalWithdrawalCompleted
        totalWithdrawalCompletedCount
        totalWithdrawalInProcess
        totalWithdrawalInProcessCount
        totalBoughtCompleted
        totalBoughtCompletedCount
        totalBoughtInProcess
        totalBoughtInProcessCount
        totalSoldCompleted
        totalSoldCompletedCount
        totalSoldInProcess
        totalSoldInProcessCount
        totalSentCompleted
        totalSentCompletedCount
        totalSentInProcess
        totalSentInProcessCount
        totalReceivedCompleted
        totalReceivedCompletedCount
        totalReceivedInProcess
        totalReceivedInProcessCount
        comment
        flag
        companyName
      }
    }
  }
`;

const GET_USERS_EX = gql`
  query GetUsers(
    $userIdsOnly: [String!]
    $roleIdsOnly: [String!]
    $accountTypesOnly: [UserType!]
    $accountModesOnly: [UserMode!]
    $accountStatusesOnly: [AccountStatus!]
    $countriesOnly: [String!]
    $countryCodeType: CountryCodeType!
    $registrationDateInterval: DateTimeInterval
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getUsers(
      userIdsOnly: $userIdsOnly
      roleIdsOnly: $roleIdsOnly
      accountTypesOnly: $accountTypesOnly
      accountModesOnly: $accountModesOnly
      accountStatusesOnly: $accountStatusesOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      registrationDateInterval: $registrationDateInterval
      filter: $filter,
      skip: $skip,
      first: $first,
      orderBy: $orderBy) {
      count
      list {
        userId
        email
        emailConfirmed
        firstName
        lastName
        gender
        type
        mode
        birthday
        countryCode2
        countryCode3
        created
        updated
        deleted
        lastLogin
        accountStatus
        phone
        postCode
        town
        street
        subStreet
        stateName
        buildingName
        buildingNumber
        flatNumber
        addressLine
        kycProvider
        referralCode
        comment
        roles {
          userRoleId
          name
          code
        }
      }
    }
  }
`;

const FIND_USERS = gql`
  query GetUsers(
    $userIdsOnly: [String!]
    $accountTypesOnly: [UserType!]
    $accountModesOnly: [UserMode!]
    $accountStatusesOnly: [AccountStatus!]
    $userTierLevelsOnly: [String!]
    $riskLevelsOnly: [RiskLevel!]
    $countriesOnly: [String!]
    $countryCodeType: CountryCodeType!
    $kycStatusesOnly: [KycStatus!]
    $registrationDateInterval: DateTimeInterval
    $widgetIdsOnly: [String!]
    $totalBuyVolumeOver: Int
    $transactionCountOver: Int
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getUsers(
      userIdsOnly: $userIdsOnly
      accountTypesOnly: $accountTypesOnly
      accountModesOnly: $accountModesOnly
      accountStatusesOnly: $accountStatusesOnly
      userTierLevelsOnly: $userTierLevelsOnly
      riskLevelsOnly: $riskLevelsOnly
      countriesOnly: $countriesOnly
      countryCodeType: $countryCodeType
      kycStatusesOnly: $kycStatusesOnly
      registrationDateInterval: $registrationDateInterval
      widgetIdsOnly: $widgetIdsOnly
      totalBuyVolumeOver: $totalBuyVolumeOver
      transactionCountOver: $transactionCountOver
      filter: $filter,
      skip: $skip,
      first: $first,
      orderBy: $orderBy) {
      count
      list {
        userId
        email
        firstName
        lastName
        type
        mode
        countryCode2
        countryCode3
        roles {
          userRoleId
          name
          code
        }
      }
    }
  }
`;

const GET_USER_KYC_INFO = gql`
  query GetUserKycInfo(
    $userId: String
  ) {
    getUserKycInfo(
      userId: $userId
    ) {
      appliedDocuments {
        code
        firstName
        lastName
        issuedDate
        validUntil
        number
        countryCode2
        countryCode3
        
      }
    }
  }
`;

const GET_USER_STATE = gql`
  query GetUserState(
    $userId: String
  ) {
    getUserState(
      userId: $userId
    ) {
      kycProviderLink
      vaults {
        totalBalanceEur
      }
    }
  }
`;

const GET_TRANSACTION_LIFELINE = gql`
  query GetTransactionLifelines($transactionId: String){
    getTransactionLifelines(transactionId: $transactionId){
      lifeline
      {
        list{
          lifelineId
          lifelineStatus{
            created
            resultStatusParams
            resultFailureParams
            resultSuccessParams
            transactionLifelineStatusId
            transactionStatus
            transactionStatusResult
            lifelineStatusDescriptor{
              newNode
              seqNo
              statusDescription
              statusName
            }
          }
        }
      }
    }
  }
`;

const GET_VERIFICATION_LINK = gql`
query GetVerificationLink(
  $userId: String
) {
  getVerificationLink(
    userId: $userId
  )
}
`;

const GET_WALLETS = gql`
  query GetWallets(
    $userIdsOnly: [String!]
    $assetIdsOnly: [String!]
    $zeroBalance: Boolean
    $walletIdsOnly: [String!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWallets(
      userIdsOnly: $userIdsOnly
      assetIdsOnly: $assetIdsOnly
      zeroBalance: $zeroBalance
      walletIdsOnly: $walletIdsOnly
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        address
        legacyAddress
        description
        type
        addressFormat
        assetId
        originalId
        total
        available
        pending
        lockedAmount
        vaultId
        vaultName
        userId
        userEmail
        custodyProvider
        custodyProviderLink
      }
    }
  }
`;

const GET_FIAT_VAULTS = gql`
  query GetFiatVaults(
    $userIdsOnly: [String]
    $assetsOnly: [String]
    $vaultIdsOnly: [String]
    $zeroBalance: Boolean
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getFiatVaults(
      userIdsOnly: $userIdsOnly
      assetsOnly: $assetsOnly
      vaultIdsOnly: $vaultIdsOnly
      zeroBalance: $zeroBalance
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        vault {
          fiatVaultId
          balance
          created
          currency
        }
        user {
          mode
          userId
          email
          type
          firstName
          lastName
        }
      }
    }
  }
`;

const GET_WIDGET_IDS = gql`
  query GetWidgetIds(
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWidgets(filter: $filter, skip: $skip, first: $first, orderBy: $orderBy) {
      count
      list {
        widgetId
        code
        name
      }
    }
  }
`;

const GET_WIDGETS = gql`
  query GetWidgets(
    $widgetIdsOnly: [String!]
    $userIdsOnly: [String!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getWidgets(
      widgetIdsOnly: $widgetIdsOnly,
      userIdsOnly: $userIdsOnly,
      filter: $filter,
      skip: $skip,
      first: $first,
      orderBy: $orderBy) {
      count
      list {
        additionalSettings
        widgetId
        userId
        code
        name
        description
        created
        createdByUser {
          userId
          email
          firstName
          lastName
        }
        transactionTypes
        currenciesCrypto
        currenciesFiat
        destinationAddress{
          currency
          destination
        }
        countriesCode2
        instruments
        paymentProviders
        liquidityProvider
        secret
        allowToPayIfKycFailed
        newVaultPerTransaction
        fee
        masked
        merchantFeeAddress{
          currency
          destination
        }
        merchantFeeMinAmount
        merchantFeePercent
      }
    }
  }
`;

const GET_PROVIDERS = gql`
query GetProviders {
  getPaymentProviders {
    paymentProviderId
    name
    displayName
    currencies
    countriesCode2
    instruments
    virtual
  }
}
`;

const GET_SETTINGS_COMMON = gql`
query {
    getSettingsCommon {
      settingsCommonId,
      liquidityProvider,
      custodyProvider,
      kycProvider,
      adminEmails,
      stoppedForServicing,
      additionalSettings,
      adminAdditionalSettings,
      userAdditionalSettings,
      transactionTypeSettings{
        transactionType
        allowChange
      }
    }
  }
`;

const GET_IS_PAYMENT_ORDER_COMPLETED = gql`
query IsPaymentOrderCompleted(
  $transactionId: String!
) {
  isPaymentOrderCompleted(
    transactionId: $transactionId
  )
}
`;

const GET_CURRENCY_PAIR_LIQUIDITY_PROVIDERS = gql`
  query GetCurrencyPairLiquidityProviders{
    getCurrencyPairLiquidityProviders{
      count
      list {
        currencyPairLiquidityProviderId
        fromCurrency
        toCurrency
        liquidityProviderId
        liquidityProviderName
        fixedRate
        deleted
      }
    }
  }
`;

const GET_LIQUIDITY_PROVIDERS = gql`
  query GetLiquidityProviders{
    getLiquidityProviders{
      liquidityProviderId
      name
      order
    }
  }
`;

const GET_USER_API_KEYS = gql`
  query GetApiKeys(
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    getApiKeys(
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        apiKeyId
        user {
          userId
          email
          type
          firstName
          lastName
        }
        created
        disabled
      }
    }
  }
`;

const UPDATE_SETTINGS_COMMON = gql`
  mutation UpdateSettingsCommon(
    $settingsId: ID!
    $liquidityProvider: String!
    $custodyProvider: String!
    $kycProvider: String!
    $adminEmails: [String!]
    $stoppedForServicing: Boolean!
    $additionalSettings: String
  ) {
    updateSettingsCommon(
      settingsId: $settingsId,
      settings: {
        liquidityProvider: $liquidityProvider
        custodyProvider: $custodyProvider
        kycProvider: $kycProvider
        adminEmails: $adminEmails
        stoppedForServicing: $stoppedForServicing
        additionalSettings: $additionalSettings
      }
    ) {
      settingsCommonId
    }
  }
`;

const CREATE_PAYMENT_PROVIDER_PAYOUT = gql`
  mutation CreatePaymentProviderPayout(
    $paymentProvider: String!, $type: PaymentProviderPayoutType
  ) {
    createPaymentProviderPayout(
      paymentProvider: $paymentProvider,
      type: $type,
    )
  }
`;

const CREATE_PAYMENT_PROVIDER_REFUND = gql`
  mutation CreatePaymentProviderRefund(
    $paymentProvider: String!, 
    $amount: Float, 
    $transactionId: String
  ) {
    createPaymentProviderRefund(
      paymentProvider: $paymentProvider,
      options: {
        amount: $amount, 
        transactionId: $transactionId
      }
    )
  }
`;


const ADD_SETTINGS_FEE = gql`
  mutation AddSettingsFee(
    $name: String!
    $description: String
    $targetFilterType: SettingsFeeTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetUserTypes: [UserType!]
    $targetUserModes: [UserMode!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $targetCurrenciesFrom: [String!]
    $targetCurrenciesTo: [String!]
    $terms: String!
    $wireDetails: String!
    $widgetIds: [String]
  ) {
    addSettingsFee(
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetUserTypes: $targetUserTypes
        targetUserModes: $targetUserModes
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        targetCurrenciesFrom: $targetCurrenciesFrom
        targetCurrenciesTo: $targetCurrenciesTo
        terms: $terms
        wireDetails: $wireDetails
        widgetIds: $widgetIds
      }
    ) {
      settingsFeeId
    }
  }
`;

const SETTINGS_FEE_SIMILARS = gql`
  fragment FeeObjectDetails on SettingsFeeSimilarObject {
    title
    feeData {
      schema {
        name
        settingsFeeId
      }
      similarValues
    }
  }

  mutation SettingsFeeSimilars(
    $name: String!
    $description: String
    $targetFilterType: SettingsFeeTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetUserTypes: [UserType!]
    $targetUserModes: [UserMode!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $targetCurrenciesFrom: [String!]
    $targetCurrenciesTo: [String!]
    $terms: String!
    $wireDetails: String!
    $widgetIds: [String]
  ) {
    settingsFeeSimilars(
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetUserTypes: $targetUserTypes
        targetUserModes: $targetUserModes
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        targetCurrenciesFrom: $targetCurrenciesFrom
        targetCurrenciesTo: $targetCurrenciesTo
        terms: $terms
        wireDetails: $wireDetails
        widgetIds: $widgetIds
      }
    ) {
      targetCurrenciesFrom {
        ...FeeObjectDetails
      }
      targetCurrenciesTo {
        ...FeeObjectDetails
      }
      targetFilterValues {
        ...FeeObjectDetails
      }
      targetTransactionTypes {
        ...FeeObjectDetails
      }
      targetInstruments {
        ...FeeObjectDetails
      }
      targetPaymentProviders {
        ...FeeObjectDetails
      }
      targetUserTypes {
        ...FeeObjectDetails
      }
      targetUserModes {
        ...FeeObjectDetails
      }
      widgetIds {
        ...FeeObjectDetails
      }
    }
  }
`;

const ADD_SETTINGS_COST = gql`
  mutation AddSettingsCost(
    $name: String!
    $description: String
    $bankAccountIds: [String!]
    $targetFilterType: SettingsCostTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
    $widgetIds: [String]
  ) {
    addSettingsCost(
      settings: {
        name: $name
        description: $description
        bankAccountIds: $bankAccountIds
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
        widgetIds: $widgetIds
      }
    ) {
      settingsCostId
    }
  }
`;

const SETTINGS_COST_SIMILARS = gql`
  fragment CostObjectDetails on SettingsCostSimilarObject {
    title
    costData {
      schema {
        name
        settingsCostId
      }
      similarValues
    }
  }

  mutation SettingsCostSimilars(
    $name: String!
    $description: String
    $bankAccountIds: [String!]
    $targetFilterType: SettingsCostTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
    $widgetIds: [String]
  ) {
    settingsCostSimilars(
      settings: {
        name: $name
        description: $description
        bankAccountIds: $bankAccountIds
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
        widgetIds: $widgetIds
      }
    ) {
      targetFilterValues {
        ...CostObjectDetails
      }
      targetTransactionTypes {
        ...CostObjectDetails
      }
      targetInstruments {
        ...CostObjectDetails
      }
      targetPaymentProviders {
        ...CostObjectDetails
      }
      widgetIds {
        ...CostObjectDetails
      }
      bankAccounts {
        ...CostObjectDetails
      }
    }
  }
`;

const ADD_WIRE_TRANSFER_SETTINGS = gql`
mutation AddWireTransferBankAccount(
  $name: String!
  $description: String
  $au: String
  $uk: String
  $eu: String,
  $paymentProviders: [String]
) {
  addWireTransferBankAccount(
    bankAccount: {
      name: $name
      description: $description
      au: $au
      uk: $uk
      eu: $eu
      paymentProviders: $paymentProviders
    }
  ) {
    bankAccountId
  }
}
`;

const ADD_SETTINGS_KYC = gql`
  mutation AddSettingsKyc(
    $name: String!
    $description: String
    $targetKycProviders: [KycProvider!]
    $targetUserType: UserType!
    $targetUserModes: [UserMode!]
    $targetFilterType: SettingsKycTargetFilterType!
    $targetFilterValues: [String!]
    $levelIds: [String!]
    $requireUserFullName: Boolean
    $requireUserPhone: Boolean
    $requireUserBirthday: Boolean
    $requireUserAddress: Boolean
    $requireUserFlatNumber: Boolean
  ) {
    addSettingsKyc(
      settings: {
        name: $name
        description: $description
        targetKycProviders: $targetKycProviders
        targetUserType: $targetUserType
        targetUserModes: $targetUserModes
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        requireUserFullName: $requireUserFullName
        requireUserPhone: $requireUserPhone
        requireUserBirthday: $requireUserBirthday
        requireUserAddress: $requireUserAddress
        requireUserFlatNumber: $requireUserFlatNumber
        levelIds: $levelIds
      }
    ) {
      settingsKycId
    }
  }
`;

const ADD_SETTINGS_KYC_TIER = gql`
  mutation AddSettingsKycTier(
    $name: String!
    $description: String
    $amount: Float
    $default: Boolean
    $targetKycProviders: [KycProvider!]
    $targetUserType: UserType!
    $targetUserModes: [UserMode!]
    $targetFilterType: SettingsKycTargetFilterType!
    $targetFilterValues: [String!]
    $levelId: String!
    $requireUserFullName: Boolean
    $requireUserPhone: Boolean
    $requireUserBirthday: Boolean
    $requireUserAddress: Boolean
    $requireUserFlatNumber: Boolean
  ) {
    addSettingsKycTier(
      settings: {
        name: $name
        description: $description
        amount: $amount
        default: $default
        targetKycProviders: $targetKycProviders
        targetUserType: $targetUserType
        targetUserModes: $targetUserModes
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        requireUserFullName: $requireUserFullName
        requireUserPhone: $requireUserPhone
        requireUserBirthday: $requireUserBirthday
        requireUserAddress: $requireUserAddress
        requireUserFlatNumber: $requireUserFlatNumber
        levelId: $levelId
      }
    )
  }
`;

const ADD_KYC_LEVEL_SETTINGS = gql`
  mutation AddSettingsKycLevel(
    $name: String!
    $description: String
    $userType: UserType!
    $originalLevelName: String!
    $originalFlowName: String!
    $data: String!
  ) {
    addSettingsKycLevel(
      settingsLevel: {
        name: $name
        description: $description
        userType: $userType
        data: $data
        originalLevelName: $originalLevelName
        originalFlowName: $originalFlowName
      }
    ) {
      settingsKycLevelId
    }
  }
`;

const ADD_BLACK_COUNTRY = gql`
mutation AddBlackCountry(
  $countryCode2: String!
) {
  addBlackCountry(
    countryCode2: $countryCode2
  ) {
    countryCode2
  }
}
`;

const CREATE_WIDGET = gql`
  mutation CreateWidget(
    $userId: String!
    $name: String!
    $description: String
    $countriesCode2: [String!]
    $currenciesCrypto: [String!]
    $currenciesFiat: [String!]
    $destinationAddress: [WidgetDestinationInput]
    $instruments: [PaymentInstrument!]
    $liquidityProvider: LiquidityProvider
    $paymentProviders: [String!]
    $transactionTypes: [TransactionType!]
    $additionalSettings: String,
    $secret: String, 
    $allowToPayIfKycFailed: Boolean
    $newVaultPerTransaction: Boolean
    $fee: Float
    $masked: Boolean
    $merchantFeeDestinationAddress: [WidgetDestinationInput!]
    $merchantFeeMinAmount: Float
    $merchantFeePercent: Float
  ) {
    createWidget(
      userId: $userId
      widget: {
        name: $name
        description: $description
        additionalSettings: $additionalSettings
        transactionTypes: $transactionTypes
        currenciesCrypto: $currenciesCrypto
        currenciesFiat: $currenciesFiat
        destinationAddress: $destinationAddress
        countriesCode2: $countriesCode2
        instruments: $instruments
        paymentProviders: $paymentProviders
        liquidityProvider: $liquidityProvider
        secret: $secret,
        allowToPayIfKycFailed: $allowToPayIfKycFailed
        newVaultPerTransaction: $newVaultPerTransaction
        fee: $fee
        masked: $masked
        merchantFeeAddress: $merchantFeeDestinationAddress
        merchantFeeMinAmount: $merchantFeeMinAmount
        merchantFeePercent: $merchantFeePercent
      }
    ) {
      widgetId
    }
  }
`;

const UPDATE_WIDGET = gql`
  mutation UpdateWidget(
    $widgetId: String
    $userId: String!
    $name: String!
    $description: String
    $countriesCode2: [String!]
    $currenciesCrypto: [String!]
    $currenciesFiat: [String!]
    $destinationAddress: [WidgetDestinationInput]
    $instruments: [PaymentInstrument!]
    $liquidityProvider: LiquidityProvider
    $paymentProviders: [String!]
    $transactionTypes: [TransactionType!]
    $additionalSettings: String
    $secret: String,
    $allowToPayIfKycFailed: Boolean
    $newVaultPerTransaction: Boolean
    $fee: Float
    $masked: Boolean
    $merchantFeeDestinationAddress: [WidgetDestinationInput!]
    $merchantFeeMinAmount: Float
    $merchantFeePercent: Float
  ) {
    updateWidget(
      widgetId: $widgetId,
      widget: {
        userId: $userId
        name: $name
        description: $description
        additionalSettings: $additionalSettings
        transactionTypes: $transactionTypes
        currenciesCrypto: $currenciesCrypto
        currenciesFiat: $currenciesFiat
        destinationAddress: $destinationAddress
        countriesCode2: $countriesCode2
        instruments: $instruments
        paymentProviders: $paymentProviders
        liquidityProvider: $liquidityProvider
        secret: $secret,
        allowToPayIfKycFailed: $allowToPayIfKycFailed
        newVaultPerTransaction: $newVaultPerTransaction
        fee: $fee
        masked: $masked
        merchantFeeAddress: $merchantFeeDestinationAddress
        merchantFeeMinAmount: $merchantFeeMinAmount
        merchantFeePercent: $merchantFeePercent
      }
    ) {
      widgetId
    }
  }
`;

const DELETE_BLACK_COUNTRY = gql`
  mutation DeleteBlackCountry(
    $countryCode2: String!
  ) {
    deleteBlackCountry(
      countryCode2: $countryCode2
    ) {
      countryCode2
    }
  }
`;

const DELETE_WIDGET = gql`
  mutation DeleteWidget(
    $widgetId: String
  ) {
    deleteWidget(
      widgetId: $widgetId
    ) {
      widgetId
    }
  }
`;


const UPDATE_USER_VAULT = gql`
mutation UpdateUserVault(
  $userId: ID!
  $vaultId: String!
  $vaultName: String!
) {
  updateUserVault(
    userId: $userId
    vaultId: $vaultId
    vaultName: $vaultName
  ) {
    id
  }
}
`;

const UPDATE_USER_FILTER = gql`
mutation UpdateUserFilters(
  $filters: UserFilterInput
) {
  updateUserFilters(
    filters: $filters
  ) {
    actions
    cryptoWallets
    customers
    dashboard
    fiatWallets
    risks
    transactions
    transactionsHistory
    users
    widgets
    notifications
    messages
  }
}
`;

const UPDATE_USER = gql`
mutation UpdateUser(
  $userId: ID!
  $email: String!,
  $changePasswordRequired: Boolean,
  $firstName: String
  $lastName: String
  $birthday: DateTime
  $gender: Gender
  $countryCode2: String
  $countryCode3: String
  $postCode: String
  $town: String
  $street: String
  $subStreet: String
  $stateName: String
  $buildingName: String
  $buildingNumber: String
  $flatNumber: String
  $phone: String
  $risk: RiskLevel
  $accountStatus: AccountStatus
  $kycTierId: String
  $defaultFiatCurrency: String
  $defaultCryptoCurrency: String
  $kycProvider: KycProvider
  $comment: String
  $flag: Boolean
  $companyName: String
  $widgetId: String
  $affiliateId: String
) {
  updateUser(
    userId: $userId
    user: {
      email: $email
      changePasswordRequired: $changePasswordRequired
      firstName: $firstName
      lastName: $lastName
      birthday: $birthday
      gender: $gender
      countryCode2: $countryCode2
      countryCode3: $countryCode3
      postCode: $postCode
      town: $town
      street: $street
      subStreet: $subStreet
      stateName: $stateName
      buildingName: $buildingName
      buildingNumber: $buildingNumber
      flatNumber: $flatNumber
      phone: $phone
      risk: $risk
      accountStatus: $accountStatus
      kycTierId: $kycTierId
      defaultFiatCurrency: $defaultFiatCurrency
      defaultCryptoCurrency: $defaultCryptoCurrency
      kycProvider: $kycProvider
      comment: $comment
      flag: $flag
      companyName: $companyName
      widgetId: $widgetId
      affiliateId: $affiliateId
    }
  ) {
    userId
  }
}
`;

const CREATE_USER = gql`
mutation CreateUser(
  $roles: [String!]
  $email: String!
  $type: UserType!
  $mode: UserMode!
  $changePasswordRequired: Boolean
  $firstName: String
  $lastName: String
  $birthday: DateTime
  $gender: Gender
  $countryCode2: String
  $countryCode3: String
  $postCode: String
  $town: String
  $street: String
  $subStreet: String
  $stateName: String
  $buildingName: String
  $buildingNumber: String
  $flatNumber: String
  $phone: String
  $risk: RiskLevel
  $accountStatus: AccountStatus
  $kycTierId: String
  $defaultFiatCurrency: String
  $defaultCryptoCurrency: String
  $kycProvider: KycProvider
  $comment: String
  $companyName: String
) {
  createUser(
    user: {
      email: $email
      type: $type
      mode: $mode
      changePasswordRequired: $changePasswordRequired
      firstName: $firstName
      lastName: $lastName
      birthday: $birthday
      gender: $gender
      countryCode2: $countryCode2
      countryCode3: $countryCode3
      postCode: $postCode
      town: $town
      street: $street
      subStreet: $subStreet
      stateName: $stateName
      buildingName: $buildingName
      buildingNumber: $buildingNumber
      flatNumber: $flatNumber
      phone: $phone
      risk: $risk
      accountStatus: $accountStatus
      kycTierId: $kycTierId
      defaultFiatCurrency: $defaultFiatCurrency
      defaultCryptoCurrency: $defaultCryptoCurrency
      kycProvider: $kycProvider
      comment: $comment
      companyName: $companyName
    }
    roles: $roles
  ) {
    userId
  }
}
`;

const DELETE_CUSTOMER = gql`
mutation DeleteUser(
  $customerId: ID!
) {
  deleteUser(
    userId: $customerId
  ) {
    userId
  }
}
`;

const RESTORE_CUSTOMER = gql`
mutation RestoreUser(
  $customerId: ID!
) {
  restoreUser(
    userId: $customerId
  ) {
    userId
  }
}
`;

const CONFIRM_EMAIL = gql`
mutation ConfirmUserEmail(
  $user_id: String!
) {
  confirmUserEmail(
    user_id: $user_id
  )
}
`;

const CONFIRM_DEVICE = gql`
mutation ConfirmUserDevice(
  $device_id: String!
) {
  confirmUserDevice(
    device_id: $device_id
  )
}
`;

const CREATE_USER_TRANSACTION = gql`
mutation CreateUserTransaction(
  $transactionType: TransactionType!,
  $source: TransactionSource!,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument,
  $paymentProvider: String,
  $userId: String,
  $rate: Float
) {
  createUserTransaction(
    transaction: {
      type: $transactionType
      source: $source
      currencyToSpend: $currencyToSpend
      currencyToReceive: $currencyToReceive
      amountToSpend: $amountToSpend
      instrument: $instrument
      paymentProvider: $paymentProvider
    }
    userId: $userId
    rate: $rate
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

const SIMULATE_TRANSACTION = gql`
mutation SimulateTransaction(
  $transactionType: TransactionType!,
  $source: TransactionSource!,
  $currencyToSpend: String!,
  $currencyToReceive: String!,
  $amountToSpend: Float!,
  $instrument: PaymentInstrument,
  $paymentProvider: String,
  $rate: Float,
  $userId: String
) {
  simulateTransaction(
    transaction: {
      type: $transactionType
      source: $source
      currencyToSpend: $currencyToSpend
      currencyToReceive: $currencyToReceive
      amountToSpend: $amountToSpend
      instrument: $instrument
      paymentProvider: $paymentProvider
    }
    rate: $rate
    userId: $userId
  ) {
    costSchema {
      name
      settingsCostId
    }

    feeSchema {
      name
      settingsFeeId
    }
  }
}
`;

const CANCEL_TRANSACTION = gql`
mutation CancelTransaction(
  $transactionId: String!
) {
  cancelTransaction(
    transactionId: $transactionId
  ) {
    userId
  }
}
`;

const UNBENCHMARK_TRANSACTIONS = gql`
mutation UnbenchmarkTransactions(
  $transactionIds: [String!]
) {
  unbenchmarkTransactions(
    transactionIds: $transactionIds
  ) {
    transactionId
  }
}
`;

const UPDATE_TRANSACTIONS = gql`
mutation UpdateTransaction(
  $transactionId: String!
  $currencyToSpend: String
  $currencyToReceive: String
  $amountToSpend: Float
  $amountToReceive: Float
  $rate: Float
  $feeFiat: Float
  $destination: String
  $status: TransactionStatus
  $kycStatus: TransactionKycStatus
  $accountStatus: AccountStatus
  $launchAfterUpdate: Boolean
  $recalculate: Boolean
  $transferOrder: TransactionUpdateTransferOrderChanges
  $benchmarkTransferOrder: TransactionUpdateTransferOrderChanges
  $refundTransferOrderChanges: TransactionUpdateRefundTransferOrderChanges
  $widgetUserParamsChanges: WidgetUserParamsChanges
  $comment: String
  $widgetId: String
  $flag: Boolean
  $merchantFeePercent: Float
  $feePercent: Float
  $type: TransactionType
  $paymentOrderChanges: TransactionUpdatePaymentOrderChanges
) {
  updateTransaction(
    transactionId: $transactionId
    recalculate: $recalculate
    transaction: {
      currencyToSpend: $currencyToSpend
      currencyToReceive: $currencyToReceive
      amountToSpend: $amountToSpend
      amountToReceive: $amountToReceive
      rate: $rate
      feeFiat: $feeFiat
      destination: $destination
      status: $status
      widgetId: $widgetId
      kycStatus: $kycStatus
      accountStatus: $accountStatus
      launchAfterUpdate: $launchAfterUpdate
      transferOrderChanges: $transferOrder
      benchmarkTransferOrderChanges: $benchmarkTransferOrder
      refundTransferOrderChanges: $refundTransferOrderChanges
      widgetUserParamsChanges: $widgetUserParamsChanges
      comment: $comment
      flag: $flag
      merchantFeePercent: $merchantFeePercent
      feePercent: $feePercent
      type: $type
      paymentOrderChanges: $paymentOrderChanges
    }
  ) {
    transactionId
  }
}
`;

const UPDATE_TRANSACTION_FLAG = gql`
mutation UpdateTransactionFlag(
  $transactionId: String!
  $flag: Boolean!
) {
  updateTransactionFlag(
    transactionId: $transactionId
    flag: $flag
  ) {
    transactionId
  }
}
`;

const UPDATE_USER_FLAG = gql`
mutation UpdateUserFlag(
  $userId: ID!
  $flag: Boolean!
) {
  updateUserFlag(
    userId: $userId
    flag: $flag
  ) {
    userId
  }
}
`;

const SEND_ADMIN_NOTIFICATION = gql`
mutation SendAdminNotification(
  $notifiedUserIds: [String!]
  $title: String
  $text: String
  $level: UserNotificationLevel
) {
  sendAdminNotification(
    notifiedUserIds: $notifiedUserIds
    title: $title
    text: $text
    level: $level
  ) {
    userNotificationId
  }
}
`;

const RESEND_NOTIFICATION = gql`
mutation ResendNotification(
  $notificationId: String
) {
  resendNotification(
    notificationId: $notificationId
  ) {
    userNotificationId
  }
}
`;

const ASSIGN_ROLE = gql`
mutation AssignRole(
  $userId: ID!
  $roleCodes: [String!]
) {
  assignRole(
    userId: $userId
    roleCodes: $roleCodes
  ) {
    userId
  }
}
`;

const REMOVE_ROLE = gql`
mutation RemoveRole(
  $userId: ID!
  $roleCodes: [String!]
) {
  removeRole(
    userId: $userId
    roleCodes: $roleCodes
  ) {
    userId
  }
}
`;

const CREATE_USER_API_KEY = gql`
  mutation CreateUserApiKey(
    $userId: String!
  ) {
    createUserApiKey(
      userId: $userId
    ) {
      apiKeyId
      secret
    }
  }
`;

const CREATE_CURRENCY_PAIR = gql`
  mutation SetCurrencyPairLiquidityProvider(
    $fromCurrency: String!,
    $toCurrency: String!,
    $liquidityProviderId: String!
    $fixedRate: Float
  ) {
    setCurrencyPairLiquidityProvider(
      fromCurrency: $fromCurrency
      toCurrency: $toCurrency
      liquidityProviderId: $liquidityProviderId
      fixedRate: $fixedRate
    ) {
      currencyPairLiquidityProviderId
      fromCurrency
      toCurrency
      liquidityProviderId
      liquidityProviderName
      fixedRate
      deleted
    }
  }
`;

const DELETE_CURRENCY_PAIR = gql`
  mutation DeleteCurrencyPair(
    $currencyPairLiquidityProviderId: String!
  ) {
    delCurrencyPairLiquidityProvider(
      currencyPairLiquidityProviderId: $currencyPairLiquidityProviderId
    ) {
      currencyPairLiquidityProviderId
    }
  }
`;

const DELETE_USER_API_KEY = gql`
  mutation DeleteUserApiKey(
    $apiKeyId: String!
  ) {
    deleteUserApiKey(
      apiKeyId: $apiKeyId
    ) {
      apiKeyId
    }
  }
`;

const DELETE_DEVICE = gql`
mutation DeleteDevice(
  $deviceIds: [String]
) {
  deleteDevice(
    deviceIds: $deviceIds
  ) {
    count
  }
}
`;

const EXPORT_TRANSACTIONS = gql`
mutation ExportTransactionsToCsv(
  $transactionIdsOnly: [String!]
  $userIdsOnly: [String!]
  $sourcesOnly: [TransactionSource!]
  $widgetIdsOnly: [String!]
  $countriesOnly: [String!]
  $countryCodeType: CountryCodeType
  $accountTypesOnly: [UserType!]
  $transactionTypesOnly: [TransactionType!]
  $transactionStatusesOnly: [String!]
  $userTierLevelsOnly: [String!]
  $riskLevelsOnly: [String!]
  $paymentInstrumentsOnly: [PaymentInstrument!]
  $createdDateInterval: DateTimeInterval
  $completedDateInterval: DateTimeInterval
  $walletAddressOnly: String
  $filter: String
  $orderBy: [OrderBy!]) {
  exportTransactionsToCsv (
    transactionIdsOnly: $transactionIdsOnly
    userIdsOnly: $userIdsOnly
    sourcesOnly: $sourcesOnly
    widgetIdsOnly: $widgetIdsOnly
    countriesOnly: $countriesOnly
    countryCodeType: $countryCodeType
    accountTypesOnly: $accountTypesOnly
    transactionTypesOnly: $transactionTypesOnly
    transactionStatusesOnly: $transactionStatusesOnly
    userTierLevelsOnly: $userTierLevelsOnly
    riskLevelsOnly: $riskLevelsOnly
    paymentInstrumentsOnly: $paymentInstrumentsOnly
    createdDateInterval: $createdDateInterval
    completedDateInterval: $completedDateInterval
    walletAddressOnly: $walletAddressOnly
    filter: $filter
    orderBy: $orderBy
  )
}
`;

const EXPORT_USERS = gql`
mutation ExportUsersToCsv(
  $userIdsOnly: [String!]
  $roleIdsOnly: [String!]
  $accountTypesOnly: [UserType!]
  $accountModesOnly: [UserMode!]
  $accountStatusesOnly: [AccountStatus!]
  $userTierLevelsOnly: [String!]
  $riskLevelsOnly: [RiskLevel!]
  $countriesOnly: [String!]
  $countryCodeType: CountryCodeType!
  $kycStatusesOnly: [KycStatus!]
  $registrationDateInterval: DateTimeInterval
  $widgetIdsOnly: [String!]
  $totalBuyVolumeOver: Int
  $transactionCountOver: Int
  $filter: String
  $orderBy: [OrderBy!]) {
  exportUsersToCsv (
    userIdsOnly: $userIdsOnly
    roleIdsOnly: $roleIdsOnly
    accountTypesOnly: $accountTypesOnly
    accountModesOnly: $accountModesOnly
    accountStatusesOnly: $accountStatusesOnly
    userTierLevelsOnly: $userTierLevelsOnly
    riskLevelsOnly: $riskLevelsOnly
    countriesOnly: $countriesOnly
    countryCodeType: $countryCodeType
    kycStatusesOnly: $kycStatusesOnly
    registrationDateInterval: $registrationDateInterval
    widgetIdsOnly: $widgetIdsOnly
    totalBuyVolumeOver: $totalBuyVolumeOver
    transactionCountOver: $transactionCountOver
    filter: $filter,
    orderBy: $orderBy
  )
}
`;


const EXPORT_WIDGETS = gql`
mutation ExportWidgetsToCsv(
  $widgetIdsOnly: [String!]
  $userIdsOnly: [String!]
  $filter: String
  $orderBy: [OrderBy!]) {
  exportWidgetsToCsv (
    widgetIdsOnly: $widgetIdsOnly,
      userIdsOnly: $userIdsOnly,
      filter: $filter,
      orderBy: $orderBy
  )
}
`;

const UPDATE_SETTINGS_FEE = gql`
  mutation UpdateSettingsFee(
    $settingsId: ID!
    $name: String!
    $description: String
    $targetFilterType: SettingsFeeTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetUserTypes: [UserType!]
    $targetUserModes: [UserMode!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
    $wireDetails: String!
    $targetCurrenciesFrom: [String!]
    $targetCurrenciesTo: [String!]
    $widgetIds: [String]
  ) {
    updateSettingsFee(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetUserTypes: $targetUserTypes
        targetUserModes: $targetUserModes
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
        wireDetails: $wireDetails
        targetCurrenciesFrom: $targetCurrenciesFrom
        targetCurrenciesTo: $targetCurrenciesTo
        widgetIds: $widgetIds
      }
    ) {
      settingsFeeId
    }
  }
`;
const ASSIGN_COST_TO_FEES = gql`
  mutation AssignCostToFees(
    $settingsIds: [ID!], 
    $costId: ID!
  ) {
    assignCostToFees(
      settingsIds: $settingsIds
      costId: $costId
    ) {
      settingsFeeId
    }
  }
`;

const UPDATE_SETTINGS_COST = gql`
  mutation UpdateSettingsCost(
    $settingsId: ID!
    $name: String!
    $description: String
    $bankAccountIds: [String!]
    $targetFilterType: SettingsCostTargetFilterType!
    $targetFilterValues: [String!]
    $targetInstruments: [PaymentInstrument!]
    $targetTransactionTypes: [TransactionType!]
    $targetPaymentProviders: [String!]
    $terms: String!
    $widgetIds: [String]
  ) {
    updateSettingsCost(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        bankAccountIds: $bankAccountIds
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        targetInstruments: $targetInstruments
        targetTransactionTypes: $targetTransactionTypes
        targetPaymentProviders: $targetPaymentProviders
        terms: $terms
        widgetIds: $widgetIds
      }
    ) {
      settingsCostId
    }
  }
`;

const UPDATE_WIRE_TRANSFER_SETTINGS = gql`
  mutation UpdateWireTransferBankAccount(
    $bankAccountId: ID!
    $name: String!
    $description: String
    $au: String
    $uk: String
    $eu: String
    $paymentProviders: [String]
  ) {
    updateWireTransferBankAccount(
      bankAccountId: $bankAccountId
      bankAccount: {
        name: $name
        description: $description
        au: $au
        uk: $uk
        eu: $eu
        paymentProviders: $paymentProviders
      }
    ) {
      bankAccountId
    }
  }
`;

const UPDATE_SETTINGS_KYC = gql`
  mutation UpdateSettingsKyc(
    $settingsId: ID!
    $name: String!
    $description: String
    $targetKycProviders: [KycProvider!]
    $targetUserType: UserType!
    $targetUserModes: [UserMode!]
    $targetFilterType: SettingsKycTargetFilterType!
    $targetFilterValues: [String!]
    $requireUserFullName: Boolean
    $requireUserPhone: Boolean
    $requireUserBirthday: Boolean
    $requireUserAddress: Boolean
    $requireUserFlatNumber: Boolean
    $levelIds: [String!]
  ) {
    updateSettingsKyc(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        targetKycProviders: $targetKycProviders
        targetUserType: $targetUserType
        targetUserModes: $targetUserModes
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        requireUserFullName: $requireUserFullName
        requireUserPhone: $requireUserPhone
        requireUserBirthday: $requireUserBirthday
        requireUserAddress: $requireUserAddress
        requireUserFlatNumber: $requireUserFlatNumber
        levelIds: $levelIds
      }
    ) {
      settingsKycId
    }
  }
`;

const UPDATE_SETTINGS_KYC_TIER = gql`
  mutation UpdateSettingsKycTier(
    $settingsId: ID!
    $name: String!
    $description: String
    $amount: Float
    $default: Boolean
    $targetKycProviders: [KycProvider!]
    $targetUserType: UserType!
    $targetUserModes: [UserMode!]
    $targetFilterType: SettingsKycTargetFilterType!
    $targetFilterValues: [String!]
    $requireUserFullName: Boolean
    $requireUserPhone: Boolean
    $requireUserBirthday: Boolean
    $requireUserAddress: Boolean
    $requireUserFlatNumber: Boolean
    $levelId: String
  ) {
    updateSettingsKycTier(
      settingsId: $settingsId
      settings: {
        name: $name
        description: $description
        amount: $amount
        default: $default
        targetKycProviders: $targetKycProviders
        targetUserType: $targetUserType
        targetUserModes: $targetUserModes
        targetFilterType: $targetFilterType
        targetFilterValues: $targetFilterValues
        requireUserFullName: $requireUserFullName
        requireUserPhone: $requireUserPhone
        requireUserBirthday: $requireUserBirthday
        requireUserAddress: $requireUserAddress
        requireUserFlatNumber: $requireUserFlatNumber
        levelId: $levelId
      }
    )
  }
`;

const UPDATE_KYC_LEVEL_SETTINGS = gql`
  mutation UpdateSettingsKycLevel(
    $settingsId: ID!
    $name: String!
    $description: String
    $userType: UserType!
    $originalLevelName: String!
    $originalFlowName: String!
    $data: String!
  ) {
    updateSettingsKycLevel(
      settingsLevelId: $settingsId
      settingsLevel: {
        name: $name
        description: $description
        userType: $userType
        data: $data
        originalLevelName: $originalLevelName
        originalFlowName: $originalFlowName
      }
    ) {
      settingsKycLevelId
    }
  }
`;

const DELETE_SETTINGS_FEE = gql`
  mutation DeleteSettingsFee($settingsId: ID!) {
    deleteSettingsFee(settingsId: $settingsId) {
      settingsFeeId
    }
  }
`;

const DISABLE_SETTINGS_FEE = gql`
  mutation DisableSettingsFee($settingsId: ID!) {
    disableSettingsFee(settingsId: $settingsId) {
      settingsFeeId
    }
  }
`;

const ENABLE_SETTINGS_FEE = gql`
  mutation EnableSettingsFee($settingsId: ID!) {
   enableSettingsFee(settingsId: $settingsId) {
      settingsFeeId
    }
  }
`;

const DELETE_SETTINGS_COST = gql`
  mutation DeleteSettingsCost($settingsId: ID!) {
    deleteSettingsCost(settingsId: $settingsId) {
      settingsCostId
    }
  }
`;

const DELETE_WIRE_TRANSFER_SETTINGS = gql`
  mutation DeleteWireTransferBankAccount($bankAccountId: ID!) {
    deleteWireTransferBankAccount(bankAccountId: $bankAccountId) {
      bankAccountId
    }
  }
`;

const DELETE_SETTINGS_KYC = gql`
  mutation DeleteSettingsKyc($settingsId: ID!) {
    deleteSettingsKyc(settingsId: $settingsId) {
      settingsKycId
    }
  }
`;

const DELETE_SETTINGS_KYC_TIER = gql`
  mutation DeleteSettingsKycTier($settingsId: ID!) {
    deleteSettingsKycTier(settingsId: $settingsId) {
      settingsKycTierId
    }
  }
`;

const DELETE_KYC_LEVEL_SETTINGS = gql`
  mutation DeleteSettingsKycLevel($settingsId: ID!) {
    deleteSettingsKycLevel(settingsId: $settingsId) {
      settingsKycLevelId
    }
  }
`;

/* endregion */

@Injectable()
export class AdminDataService {
	constructor(
		private router: Router,
		private apollo: Apollo,
		private auth: AuthService,
		private errorHandler: ErrorService,
		private snackBar: MatSnackBar
	) {
	}

	private activeQueryCounter = 0;
	private isBusySubject = new BehaviorSubject(false);

	public get isBusy(): Observable<boolean> {
		return this.isBusySubject.asObservable();
	}

	getDashboardStats(filter: Filter): Observable<DashboardStats> {
		const vars: QueryGetDashboardStatsArgs = {
			createdDateInterval: filter.createdDateInterval,
			completedDateInterval: filter.completedDateInterval,
			updateDateInterval: filter.updatedDateInterval,
			userIdsOnly: filter.user ? [filter.user] : [],
			widgetIdsOnly: filter.widgetNames,
			sourcesOnly: filter.sources,
			countriesOnly: filter.countries,
			countryCodeType: CountryCodeType.Code3,
			accountTypesOnly: filter.accountTypes,
			fiatCurrency: filter.fiatCurrency
		};
		return this.watchQuery<{ getDashboardStats: DashboardStats; }, QueryGetDashboardStatsArgs>({
			query: GET_DASHBOARD_STATS,
			variables: vars,
			fetchPolicy: 'network-only'
		}).pipe(map(result => {
			return result.data.getDashboardStats;
		}));
	}

	getDashboardMerchantStats(filter: Filter): Observable<DashboardMerchantStats> {
		const vars: QueryGetDashboardStatsArgs = {
			createdDateInterval: filter.createdDateInterval,
			completedDateInterval: filter.completedDateInterval,
			updateDateInterval: filter.updatedDateInterval,
			userIdsOnly: filter.user ? [filter.user] : [],
			widgetIdsOnly: filter.widgetNames,
			sourcesOnly: filter.sources,
			countriesOnly: filter.countries,
			countryCodeType: CountryCodeType.Code3,
			accountTypesOnly: filter.accountTypes,
			fiatCurrency: filter.fiatCurrency
		};
    
		return this.watchQuery<{ getDashboardMerchantStats: DashboardMerchantStats; }, QueryGetDashboardMerchantStatsArgs>({
			query: GET_DASHBOARD_MERCHANT_STATS,
			variables: vars,
			fetchPolicy: 'network-only'
		}).pipe(map(result => {
			return result.data.getDashboardMerchantStats;
		}));
	}
  

	getFeeSettings(): Observable<{ list: Array<FeeScheme>; count: number; }> {
		return this.watchQuery<{ getSettingsFee: SettingsFeeListResult; }, QueryGetSettingsFeeArgs>({
			query: GET_FEE_SETTINGS,
			fetchPolicy: 'network-only'
		}).pipe(
			map(result => {
				if (result.data?.getSettingsFee?.list && result.data?.getSettingsFee?.count) {
					return {
						list: result.data.getSettingsFee.list.map(item => new FeeScheme(item)),
						count: result.data.getSettingsFee.count
					};
				} else {
					return {
						list: [],
						count: 0
					};
				}
			})
		);
	}
  
	getCostSettings(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_COST_SETTINGS,
			fetchPolicy: 'network-only'
		});
	}

	getWireTransferBankAccounts(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_WIRE_TRANSFER_SETTINGS,
			fetchPolicy: 'network-only'
		});
	}

	getSettingsKycTiers(id: string): Observable<{ list: Array<SettingsKycTier>; count: number; }> {
		return this.watchQuery<{ getSettingsKycTiers: SettingsKycTierListResult; }, QueryGetSettingsKycTiersArgs>({
			query: GET_SETTINGS_KYC_TIERS_SHORT,
			variables: { userId: (id !== '') ? id : undefined },
			fetchPolicy: 'network-only'
		}).pipe(
			map(result => {
				if (result.data?.getSettingsKycTiers?.list && result.data?.getSettingsKycTiers?.count) {
					return {
						list: result.data.getSettingsKycTiers.list,
						count: result.data.getSettingsKycTiers.count
					};
				} else {
					return {
						list: [],
						count: 0
					};
				}
			})
		);
	}

	getKycTiers(): Observable<{ list: Array<KycTier>; count: number; }> {
		return this.watchQuery<{ getSettingsKycTiers: SettingsKycTierListResult; }, QueryGetSettingsKycTiersArgs>({
			query: GET_SETTINGS_KYC_TIERS,
			fetchPolicy: 'network-only'
		}).pipe(
			map(result => {
				if (result.data?.getSettingsKycTiers?.list && result.data?.getSettingsKycTiers?.count) {
					return {
						list: result.data.getSettingsKycTiers.list.map(item => new KycTier(item)),
						count: result.data.getSettingsKycTiers.count
					};
				} else {
					return {
						list: [],
						count: 0
					};
				}
			})
		);
	}

	getKycSettings(): Observable<{ list: Array<KycScheme>; count: number; }> {
		return this.watchQuery<{ getSettingsKyc: SettingsKycListResult; }, QueryGetSettingsKycArgs>({
			query: GET_KYC_SETTINGS,
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(result => {
					if (result.data?.getSettingsKyc?.list && result.data?.getSettingsKyc?.count) {
						return {
							list: result.data.getSettingsKyc.list.map(item => new KycScheme(item)),
							count: result.data.getSettingsKyc.count
						};
					} else {
						return {
							list: [],
							count: 0
						};
					}
				})
			);
	}

	getKycLevels(userType: UserType | null): Observable<{ list: Array<KycLevel>; count: number; }> {
		const userTypeFilter = userType === null ? '' : userType?.toString();

		return this.watchQuery<{ getSettingsKycLevels: SettingsKycLevelListResult; }, QueryGetSettingsKycLevelsArgs>({
			query: GET_KYC_LEVELS,
			variables: { filter: userTypeFilter },
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(result => {
					if (result.data?.getSettingsKycLevels?.list && result.data?.getSettingsKycLevels?.count) {
						return {
							list: result.data.getSettingsKycLevels.list.map(item => new KycLevel(item)),
							count: result.data.getSettingsKycLevels.count
						};
					} else {
						return {
							list: [],
							count: 0
						};
					}
				})
			);
	}

	getCountryBlackList(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_COUNTRY_BLACK_LIST,
			fetchPolicy: 'network-only'
		});
	}

	getMessages(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<MessageItem>; count: number; }> {

		const vars: QueryGetMessagesArgs = {
			filter: filter?.search,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};

		return this.watchQuery<{ getMessages: MessageListResult; }, QueryGetMessagesArgs>(
			{
				query: GET_MESSAGES,
				variables: vars,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getMessages?.list && result.data?.getMessages?.count) {
				return {
					list: result.data.getMessages.list.map(val => new MessageItem(val)),
					count: result.data.getMessages.count
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	getNotifications(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<NotificationItem>; count: number; }> {

		const vars: QueryGetNotificationsArgs = {
			filter: filter?.search,
			userNotificationTypeCode: filter?.notificationType,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};

		return this.watchQuery<{ getNotifications: UserNotificationListResult; }, QueryGetNotificationsArgs>(
			{
				query: GET_NOTIFICATIONS,
				variables: vars,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getNotifications?.list && result.data?.getNotifications?.count) {
				return {
					list: result.data.getNotifications.list.map(val => new NotificationItem(val)),
					count: result.data.getNotifications.count
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	getUserActions(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<UserActionItem>; count: number; }> {

		const vars: QueryGetUserActionsArgs = {
			filter: filter?.search,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }],
			userId: filter?.user,
			resultsOnly: filter?.resultsOnly,
			statusesOnly: filter?.statusesOnly,
			actionTypesOnly: filter?.userActionTypes,
			createdDateInterval: filter?.createdDateInterval
		};

		return this.watchQuery<{ getUserActions: UserActionListResult; }, QueryGetUserActionsArgs>(
			{
				query: GET_USER_ACTIONS,
				variables: vars,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getUserActions?.list && result.data?.getUserActions?.count) {
				return {
					list: result.data.getUserActions.list.map(val => new UserActionItem(val)),
					count: result.data.getUserActions.count
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	getRiskAlerts(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<RiskAlertItem>; count: number; }> {

		const vars: QueryGetRiskAlertsArgs = {
			userId: filter?.user ?? null,
			code: filter?.riskAlertCode,
			filter: filter?.search,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};

		return this.watchQuery<{ getRiskAlerts: RiskAlertResultList; }, QueryGetRiskAlertsArgs>(
			{
				query: GET_RISK_ALERTS,
				variables: vars,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getRiskAlerts?.list && result.data?.getRiskAlerts?.count) {
				return {
					list: result.data.getRiskAlerts.list.map(val => new RiskAlertItem(val)),
					count: result.data.getRiskAlerts.count
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	getDevices(userId: string): Observable<{ list: Array<DeviceItem>; count: number; }> {
		return this.watchQuery<{ getDevices: UserDeviceListResult; }, any>(
			{
				query: GET_DEVICES,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			return result.data?.getDevices?.list && result.data?.getDevices?.count ? {
				list: result.data.getDevices.list
					.filter(x => x?.userId === userId)
					.map(val => new DeviceItem(val)),
				count: result.data.getDevices.count
			} :  {
				list: [],
				count: 0
			};
		}));
	}

	getTransaction(transactionId: string): Observable<TransactionItemFull | undefined> {
		return this.watchQuery<{ getTransactions: TransactionListResult; }, QueryGetTransactionsArgs>({
			query: GET_TRANSACTIONS,
			variables: {
				transactionIdsOnly: [transactionId],
				filter: undefined,
				skip: 0,
				first: 1
			},
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(res => {
					const listResult = res?.data?.getTransactions.list;
					return listResult && listResult.length === 1 ? new TransactionItemFull(listResult[0]) : undefined;
				})
			);
	}

	getTransactions(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<TransactionItemFull>; count: number; }> {
		let widgetIds: string[] = [];
		if (filter?.widgets) {
			widgetIds = widgetIds.concat(filter.widgets);
		}
		if (filter?.widgetNames) {
			widgetIds = widgetIds.concat(filter.widgetNames);
		}
		const vars: QueryGetTransactionsArgs = {
			transactionIdsOnly: filter?.transactionIds,
			accountTypesOnly: filter?.accountTypes,
			accountModesOnly: filter?.accountModes,
			countriesOnly: filter?.countries,
			countryCodeType: CountryCodeType.Code3,
			sourcesOnly: filter?.sources,
			from: filter?.from,
			userIdsOnly: filter?.users,
			widgetIdsOnly: widgetIds,
			flag: filter?.transactionFlag,
      transactionWasEverCompleted: filter?.transactionWasEverCompleted,
      recallNumber: filter?.recallNumber,
      reversalProcessedDateInterval: filter?.reversalProcessedInterval,
      recallRegisteredDateInterval: filter?.recallRegisteredInterval,
      hasRecallNumber: filter?.hasRecallNumber,
			preauth: filter?.preauthFlag,
			fiatCurrency: filter?.fiatCurrency,
			kycStatusesOnly: filter?.transactionKycStatuses,
			transactionTypesOnly: filter?.transactionTypes,
			transactionStatusesOnly: filter?.transactionStatuses,
			userTierLevelsOnly: filter?.tiers,
			riskLevelsOnly: filter?.riskLevels,
			paymentInstrumentsOnly: filter?.paymentInstruments,
			createdDateInterval: filter?.createdDateInterval,
			completedDateInterval: filter?.completedDateInterval,
      updateDateInterval: filter?.updatedDateInterval,
			walletAddressOnly: filter?.walletAddress,
			filter: filter?.search,
			verifyWhenPaid: filter?.verifyWhenPaid,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};
    
		return this.watchQuery<{ getTransactions: TransactionListResult; }, QueryGetTransactionsArgs>({
      query: GET_TRANSACTIONS,
      variables: vars,
      fetchPolicy: 'network-only'
    }).pipe(map(result => {
      return result.data?.getTransactions?.list && result.data?.getTransactions?.count ? {
        list: result.data.getTransactions.list.map(val => new TransactionItemFull(val)),
        count: result.data.getTransactions.count
      } :  {
        list: [],
        count: 0
      };
    }));
	}

	getTransactionLifeline(transactionId: string): Observable<TransactionLifelineStatusItem[]> {
		return this.watchQuery<{ getTransactionLifelines: TransactionHistory; }, QueryGetTransactionLifelinesArgs>({
			query: GET_TRANSACTION_LIFELINE,
			variables: { transactionId },
			fetchPolicy: 'network-only',
		}).pipe(map(res => res?.data?.getTransactionLifelines?.lifeline.list || []));
	}

	getTransactionStatusHistory(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<TransactionStatusHistoryItem>; count: number; }> {

		const vars: QueryGetTransactionStatusHistoryArgs = {
			transactionIds: filter?.transactionIds,
			userIds: filter?.users,
			statusesOnly: filter?.transactionStatuses,
			createdDateInterval: filter?.createdDateInterval,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};
		return this.watchQuery<{ getTransactionStatusHistory: TransactionStatusHistoryListResult; }, QueryGetTransactionStatusHistoryArgs>({
			query: GET_TRANSACTION_STATUS_HISTORY,
			variables: vars,
			fetchPolicy: 'network-only'
		}).pipe(map(result => {
			return result.data?.getTransactionStatusHistory?.list && result.data?.getTransactionStatusHistory?.count ? {
				list: result.data.getTransactionStatusHistory.list.map(val => new TransactionStatusHistoryItem(val)),
				count: result.data.getTransactionStatusHistory.count
			} : {
				list: [],
				count: 0
			};
		}));
	}

	getUsers(
		roleIds: string[],
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter: Filter
	): Observable<{ list: UserItem[]; count: number; }> {
		const vars = {
			userIdsOnly: filter?.users,
			roleIdsOnly: (roleIds.length > 0) ? roleIds : undefined,
			accountTypesOnly: filter?.accountTypes,
			accountModesOnly: filter?.accountModes,
			accountStatusesOnly: filter?.accountStatuses,
			userTierLevelsOnly: filter?.tiers,
			riskLevelsOnly: filter?.riskLevels,
			countriesOnly: filter?.countries,
			countryCodeType: CountryCodeType.Code3,
			kycStatusesOnly: filter.kycStatuses,
			registrationDateInterval: filter?.registrationDateInterval,
			widgetIdsOnly: filter?.widgetNames,
			totalBuyVolumeOver: filter?.totalBuyVolumeOver,
			transactionCountOver: filter?.transactionCountOver,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }],
			filter: filter?.search,
			verifyWhenPaid: filter?.verifyWhenPaid,
			flag: filter?.transactionFlag
		};
		return this.watchQuery<{ getUsers: UserListResult; }, QueryGetUsersArgs>({
			query: GET_USERS,
			variables: vars,
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(result => {
					return result.data?.getUsers?.list && result.data?.getUsers?.count ? {
						list: result.data.getUsers.list.map(u => new UserItem(u)),
						count: result.data.getUsers.count
					} : {
						list: [],
						count: 0
					};
				})
			);
	}

	getSystemUsers(
		roleIds: string[],
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter: Filter
	): Observable<{ list: UserItem[]; count: number; }> {
		const vars = {
			userIdsOnly: filter?.users,
			roleIdsOnly: (roleIds.length > 0) ? roleIds : undefined,
			accountTypesOnly: filter?.accountTypes,
			accountStatusesOnly: filter?.accountStatuses,
			countriesOnly: filter?.countries,
			countryCodeType: CountryCodeType.Code3,
			registrationDateInterval: filter?.registrationDateInterval,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }],
			filter: filter?.search
		};
		return this.watchQuery<{ getUsers: UserListResult; }, QueryGetUsersArgs>({
			query: GET_USERS_EX,
			variables: vars,
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(result => {
					return result.data?.getUsers?.list && result.data?.getUsers?.count ?{
						list: result.data.getUsers.list.map(u => new UserItem(u)),
						count: result.data.getUsers.count
					} : {
						list: [],
						count: 0
					};
				})
			);
	}

	findUsers(filter: Filter): Observable<{ list: UserItem[]; count: number; }> {
		const vars = {
			userIdsOnly: filter?.users,
			accountTypesOnly: filter?.accountTypes,
			accountStatusesOnly: filter?.accountStatuses,
			riskLevelsOnly: filter?.riskLevels,
			countriesOnly: filter?.countries,
			countryCodeType: CountryCodeType.Code3,
			kycStatusesOnly: filter.kycStatuses,
			registrationDateInterval: filter?.registrationDateInterval,
			widgetIdsOnly: filter?.widgets,
			totalBuyVolumeOver: filter?.totalBuyVolumeOver,
			transactionCountOver: filter?.transactionCountOver,
			skip: 0,
			first: 1000,
			orderBy: [{ orderBy: 'email', desc: true }],
			filter: filter?.search
		};
		return this.watchQuery<{ getUsers: UserListResult; }, QueryGetUsersArgs>({
			query: FIND_USERS,
			variables: vars,
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(result => {
					return result.data?.getUsers?.list && result.data?.getUsers?.count ? {
						list: result.data.getUsers.list.map(u => new UserItem(u)),
						count: result.data.getUsers.count
					} : {
						list: [],
						count: 0
					};
				})
			);
	}

	getUser(userId: string): Observable<UserItem | undefined> {
		return this.watchQuery<{ getUsers: UserListResult; }, QueryGetUsersArgs>({
			query: GET_USERS,
			variables: {
				userIdsOnly: [userId],
				countryCodeType: CountryCodeType.Code3,
				skip: 0,
				first: 1
			},
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(res => {
					const listResult = res?.data?.getUsers.list;
					return listResult && listResult.length === 1 ? new UserItem(listResult[0]) : undefined;
				})
			);
	}

	getUserKycInfo(userId: string): Observable<KycInfo | undefined> {
		return this.watchQuery<{ getUserKycInfo: KycInfo; }, QueryGetUserKycInfoArgs>({
			query: GET_USER_KYC_INFO,
			variables: {
				userId
			},
			fetchPolicy: 'network-only'
		}).pipe(map(res => {
			const result = res?.data?.getUserKycInfo;
			return result ?? undefined;
		}));
	}

	getUserState(id: string): Observable<UserState | undefined> {
		return this.watchQuery<{ getUserState: UserState; }, QueryGetUserStateArgs>({
			query: GET_USER_STATE,
			variables: {
				userId: id
			},
			fetchPolicy: 'network-only'
		}).pipe(map(res => {
			const result = res?.data?.getUserState;
			return result ?? undefined;
		}));
	}

	getVerificationLink(id: string): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_VERIFICATION_LINK,
			variables: {
				userId: id
			},
			fetchPolicy: 'network-only'
		});
	}

	getWallets(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<WalletItem>; count: number; }> {
		const vars: QueryGetWalletsArgs = {
			userIdsOnly: filter?.users,
			assetIdsOnly: filter?.assets,
			zeroBalance: filter?.zeroBalance,
			walletIdsOnly: filter?.walletIds,
			filter: filter?.search,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};
		return this.watchQuery<{ getWallets: AssetAddressListResult; }, QueryGetWalletsArgs>(
			{
				query: GET_WALLETS,
				variables: vars,
				fetchPolicy: 'network-only'
			})
			.pipe(map(result => {
				return result.data?.getWallets?.list && result.data?.getWallets?.count ? {
					list: result.data.getWallets.list.map(item => new WalletItem(item)),
					count: result.data.getWallets.count
				} : {
					list: [],
					count: 0
				};
			}));
	}

	getFiatWallets(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter?: Filter
	): Observable<{ list: Array<FiatWalletItem>; count: number; }> {
		const vars: QueryGetFiatVaultsArgs = {
			userIdsOnly: filter?.users,
			assetsOnly: filter?.assets,
			vaultIdsOnly: filter?.walletIds,
			zeroBalance: filter?.zeroBalance,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};
		return this.watchQuery<{ getFiatVaults: FiatVaultUserListResult; }, QueryGetFiatVaultsArgs>(
			{
				query: GET_FIAT_VAULTS,
				variables: vars,
				fetchPolicy: 'network-only'
			})
			.pipe(
				map(result => {
					return result.data?.getFiatVaults?.list && result.data?.getFiatVaults?.count ? {
						list: result.data.getFiatVaults.list.map(item => new FiatWalletItem(item)),
						count: result.data.getFiatVaults.count
					} : {
						list: [],
						count: 0
					};
				})
			);
	}

	getWidgetIds(
		userFilter: string,
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean
	): Observable<{ list: WidgetItem[]; count: number; }> {
		const orderFields = [{ orderBy: orderField, desc: orderDesc }];
		const customerFilter = userFilter === null ? '' : userFilter?.toString();
		const vars = {
			filter: customerFilter,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: orderFields
		};
		return this.watchQuery<{ getWidgets: WidgetListResult; }, QueryGetWidgetsArgs>({
			query: GET_WIDGET_IDS,
			variables: vars,
			fetchPolicy: 'network-only'
		})
			.pipe(
				map(result => {
					if (result.data?.getWidgets?.list && result.data?.getWidgets?.count) {
						return {
							list: result.data.getWidgets.list.map(w => new WidgetItem(w)),
							count: result.data.getWidgets.count
						};
					} else {
						return {
							list: [],
							count: 0
						};
					}
				})
			);

	}

	getWidgets(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean,
		filter: Filter
	): Observable<{ list: WidgetItem[]; count: number; }> {
		const orderFields = [{ orderBy: orderField, desc: orderDesc }];
		const vars = {
			userIdsOnly: filter.users,
			widgetIdsOnly: filter.widgets,
			filter: filter.search,
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: orderFields
		};
		return this.watchQuery<{ getWidgets: WidgetListResult; }, QueryGetWidgetsArgs>({
			query: GET_WIDGETS,
			variables: vars,
			fetchPolicy: 'network-only'
		}).pipe(
			map(result => {
        return result.data?.getWidgets?.list && result.data?.getWidgets?.count ? 
          {
            list: result.data.getWidgets.list.map(w => new WidgetItem(w)),
            count: result.data.getWidgets.count
          } : {
						list: [],
						count: 0
					};
			})
		);
	}

	getProviders(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_PROVIDERS,
			fetchPolicy: 'network-only'
		});
	}

	getSettingsCommon(): QueryRef<any, EmptyObject> | null {
		if (this.apollo.client !== undefined) {
			return this.apollo.watchQuery<any>({
				query: GET_SETTINGS_COMMON,
				fetchPolicy: 'network-only'
			});
		} else {
			return null;
		}
	}

  isPaymentOrderCompleted(transactionId: string): Observable<boolean> {
    return this.watchQuery<{ isPaymentOrderCompleted: boolean; }, any>({
      query: GET_IS_PAYMENT_ORDER_COMPLETED,
      variables: { transactionId },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data.isPaymentOrderCompleted));
	}

	getCurrencyPairLiquidityProviders(): Observable<{ list: Array<CurrencyPairItem>; count: number; }>{
		return this.watchQuery<{ getCurrencyPairLiquidityProviders: CurrencyPairLiquidityProvidersListResult; }, QueryGetCurrencyPairLiquidityProviderArgs>(
			{
				query: GET_CURRENCY_PAIR_LIQUIDITY_PROVIDERS,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getCurrencyPairLiquidityProviders?.list && result.data?.getCurrencyPairLiquidityProviders?.count) {
				return {
					list: result.data.getCurrencyPairLiquidityProviders.list.map(val => new CurrencyPairItem(val)),
					count: result.data.getCurrencyPairLiquidityProviders.count
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	getLiquidityProviders(): Observable<{ list: Array<LiquidityProviderEntityItem>; count: number; }>{
		return this.watchQuery<{ getLiquidityProviders: Array<LiquidityProviderEntity> }, null>(
			{
				query: GET_LIQUIDITY_PROVIDERS,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getLiquidityProviders && result.data?.getLiquidityProviders?.length != 0) {
				return {
					list: result.data.getLiquidityProviders.map(item => new LiquidityProviderEntityItem(item)),
					count: result.data.getLiquidityProviders.length
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	getApiKeys(
		pageIndex: number,
		takeItems: number,
		orderField: string,
		orderDesc: boolean
	): Observable<{ list: Array<ApiKeyItem>; count: number; }> {

		const vars: QueryGetApiKeysArgs = {
			skip: pageIndex * takeItems,
			first: takeItems,
			orderBy: [{ orderBy: orderField, desc: orderDesc }]
		};

		return this.watchQuery<{ getApiKeys: ApiKeyListResult; }, QueryGetApiKeysArgs>(
			{
				query: GET_USER_API_KEYS,
				variables: vars,
				fetchPolicy: 'network-only'
			}).pipe(map(result => {
			if (result.data?.getApiKeys?.list && result.data?.getApiKeys?.count) {
				return {
					list: result.data.getApiKeys.list.map(val => new ApiKeyItem(val)),
					count: result.data.getApiKeys.count
				};
			} else {
				return {
					list: [],
					count: 0
				};
			}
		}));
	}

	updateSettingsCommon(data: SettingsCommon): Observable<any> {
		return this.mutate({
			mutation: UPDATE_SETTINGS_COMMON,
			variables: {
				settingsId: data.settingsCommonId,
				liquidityProvider: data.liquidityProvider,
				custodyProvider: data.custodyProvider,
				kycProvider: data.kycProvider,
				adminEmails: data.adminEmails,
				stoppedForServicing: data.stoppedForServicing,
				additionalSettings: data.additionalSettings
			}
		});
	}

	createPaymentProviderPayout(paymentProvider: String, type: PaymentProviderPayoutType): Observable<any> {
		return this.mutate({
			mutation: CREATE_PAYMENT_PROVIDER_PAYOUT,
			variables: {
				paymentProvider: paymentProvider,
				type: type
			}
		});
	}

	createPaymentProviderRefund(paymentProvider: String, amount: Number, transactionId: String): Observable<any> {
		return this.mutate({
			mutation: CREATE_PAYMENT_PROVIDER_REFUND,
			variables: {
				paymentProvider: paymentProvider,
				amount: amount,
				transactionId: transactionId
			}
		});
	}

	getFeeSettingsSimilar(feeScheme: FeeScheme): Observable<SettingsFeeSimilarResult> {
		return this.mutate({
			mutation: SETTINGS_FEE_SIMILARS,
			variables: {
				name: feeScheme.name,
				description: feeScheme.description,
				targetFilterType: feeScheme.target,
				targetFilterValues: feeScheme.targetValues,
				targetInstruments: feeScheme.instrument,
				targetUserTypes: feeScheme.userType,
				targetUserModes: feeScheme.userMode,
				targetTransactionTypes: feeScheme.trxType,
				targetPaymentProviders: feeScheme.provider,
				targetCurrenciesFrom: feeScheme.currenciesFrom,
				targetCurrenciesTo: feeScheme.currenciesTo,
				terms: feeScheme.terms.getObject(),
				wireDetails: feeScheme.details.getObject(),
        widgetIds: feeScheme.widgetIds
			}
		}).pipe(map(res => res.data['settingsFeeSimilars']));
	}

	saveFeeSettings(feeScheme: FeeScheme): Observable<any> {
		return !feeScheme.id
			? this.mutate({
				mutation: ADD_SETTINGS_FEE,
				variables: {
					name: feeScheme.name,
					description: feeScheme.description,
					targetFilterType: feeScheme.target,
					targetFilterValues: feeScheme.targetValues,
					targetInstruments: feeScheme.instrument,
					targetUserTypes: feeScheme.userType,
					targetUserModes: feeScheme.userMode,
					targetTransactionTypes: feeScheme.trxType,
					targetPaymentProviders: feeScheme.provider,
					targetCurrenciesFrom: feeScheme.currenciesFrom,
					targetCurrenciesTo: feeScheme.currenciesTo,
					terms: feeScheme.terms.getObject(),
					wireDetails: feeScheme.details.getObject(),
          widgetIds: feeScheme.widgetIds
				}
			})
			: this.mutate({
				mutation: UPDATE_SETTINGS_FEE,
				variables: {
					settingsId: feeScheme.id,
					name: feeScheme.name,
					description: feeScheme.description,
					targetFilterType: feeScheme.target,
					targetFilterValues: feeScheme.targetValues,
					targetInstruments: feeScheme.instrument,
					targetUserTypes: feeScheme.userType,
					targetUserModes: feeScheme.userMode,
					targetTransactionTypes: feeScheme.trxType,
					targetPaymentProviders: feeScheme.provider,
					terms: feeScheme.terms.getObject(),
					wireDetails: feeScheme.details.getObject(),
					targetCurrenciesFrom: feeScheme.currenciesFrom,
					targetCurrenciesTo: feeScheme.currenciesTo,
          widgetIds: feeScheme.widgetIds
				}
			});
	}

  getCostSettingsSimilar(settings: CostScheme): Observable<SettingsCostSimilarResult> {
		return this.mutate({
			mutation: SETTINGS_COST_SIMILARS,
			variables: {
				name: settings.name,
        description: settings.description,
        bankAccountIds: settings.bankAccountIds,
        targetFilterType: settings.target,
        targetFilterValues: settings.targetValues,
        targetInstruments: settings.instrument,
        targetTransactionTypes: settings.trxType,
        targetPaymentProviders: settings.provider,
        terms: settings.terms.getObject(),
        widgetIds: settings.widgetIds
			}
		}).pipe(map(res => res.data['settingsCostSimilars']));
	}

	saveCostSettings(settings: CostScheme, create: boolean): Observable<any> {
		return create
			? this.apollo.mutate({
				mutation: ADD_SETTINGS_COST,
				variables: {
					name: settings.name,
					description: settings.description,
					bankAccountIds: settings.bankAccountIds,
					targetFilterType: settings.target,
					targetFilterValues: settings.targetValues,
					targetInstruments: settings.instrument,
					targetTransactionTypes: settings.trxType,
					targetPaymentProviders: settings.provider,
					terms: settings.terms.getObject(),
          widgetIds: settings.widgetIds
				}
			})
			: this.apollo.mutate({
				mutation: UPDATE_SETTINGS_COST,
				variables: {
					settingsId: settings.id,
					name: settings.name,
					description: settings.description,
					bankAccountIds: settings.bankAccountIds,
					targetFilterType: settings.target,
					targetFilterValues: settings.targetValues,
					targetInstruments: settings.instrument,
					targetTransactionTypes: settings.trxType,
					targetPaymentProviders: settings.provider,
					terms: settings.terms.getObject(),
          widgetIds: settings.widgetIds
				}
			});
	}

	assignCostToFees(feeIds: string[], costId: string): Observable<any> {
		return this.mutate({
			mutation: ASSIGN_COST_TO_FEES,
			variables: {
				settingsIds: feeIds, 
				costId: costId
			}
		});
	}

	saveBankAccountSettings(account: WireTransferBankAccount, create: boolean): Observable<any> {
		const vars = {
			bankAccountId: account.bankAccountId,
			name: account.name,
			description: account.description,
			au: account.au,
			uk: account.uk,
			eu: account.eu
		};
		return create
			? this.apollo.mutate({
				mutation: ADD_WIRE_TRANSFER_SETTINGS,
				variables: {
					name: account.name,
					description: account.description,
					au: account.au,
					uk: account.uk,
					eu: account.eu,
					paymentProviders: account.paymentProviders
				}
			})
			: this.apollo.mutate({
				mutation: UPDATE_WIRE_TRANSFER_SETTINGS,
				variables: {
					bankAccountId: account.bankAccountId,
					name: account.name,
					description: account.description,
					au: account.au,
					uk: account.uk,
					eu: account.eu,
					paymentProviders: account.paymentProviders
				}
			});
	}

	saveKycSettings(settings: KycScheme, create: boolean): Observable<any> {
		return create
			? this.apollo.mutate({
				mutation: ADD_SETTINGS_KYC,
				variables: {
					name: settings.name,
					description: settings.description,
					targetFilterType: settings.target,
					targetFilterValues: settings.targetValues,
					targetKycProviders: settings.kycProviders,
					targetUserType: settings.userType,
					targetUserModes: settings.userModes,
					requireUserFullName: settings.requireUserFullName,
					requireUserPhone: settings.requireUserPhone,
					requireUserBirthday: settings.requireUserBirthday,
					requireUserAddress: settings.requireUserAddress,
					requireUserFlatNumber: settings.requireUserFlatNumber,
					levelIds: [settings.levelId]
				}
			})
			: this.apollo.mutate({
				mutation: UPDATE_SETTINGS_KYC,
				variables: {
					settingsId: settings.id,
					name: settings.name,
					description: settings.description,
					targetFilterType: settings.target,
					targetFilterValues: settings.targetValues,
					targetKycProviders: settings.kycProviders,
					targetUserType: settings.userType,
					targetUserModes: settings.userModes,
					requireUserFullName: settings.requireUserFullName,
					requireUserPhone: settings.requireUserPhone,
					requireUserBirthday: settings.requireUserBirthday,
					requireUserAddress: settings.requireUserAddress,
					requireUserFlatNumber: settings.requireUserFlatNumber,
					levelIds: [settings.levelId]
				}
			});
	}

	saveKycTierSettings(settings: KycTier, create: boolean): Observable<any> {
		return create
			? this.apollo.mutate({
				mutation: ADD_SETTINGS_KYC_TIER,
				variables: {
					name: settings.name,
					description: settings.description,
					amount: settings.amount,
					default: settings.isDefault,
					targetFilterType: settings.target,
					targetFilterValues: settings.targetValues,
					targetKycProviders: settings.kycProviders,
					targetUserType: settings.userType,
					targetUserModes: settings.userModes,
					requireUserFullName: settings.requireUserFullName,
					requireUserPhone: settings.requireUserPhone,
					requireUserBirthday: settings.requireUserBirthday,
					requireUserAddress: settings.requireUserAddress,
					requireUserFlatNumber: settings.requireUserFlatNumber,
					levelId: settings.levelId
				}
			})
			: this.apollo.mutate({
				mutation: UPDATE_SETTINGS_KYC_TIER,
				variables: {
					settingsId: settings.id,
					name: settings.name,
					description: settings.description,
					amount: settings.amount,
					default: settings.isDefault,
					targetFilterType: settings.target,
					targetFilterValues: settings.targetValues,
					targetKycProviders: settings.kycProviders,
					targetUserType: settings.userType,
					targetUserModes: settings.userModes,
					requireUserFullName: settings.requireUserFullName,
					requireUserPhone: settings.requireUserPhone,
					requireUserBirthday: settings.requireUserBirthday,
					requireUserAddress: settings.requireUserAddress,
					requireUserFlatNumber: settings.requireUserFlatNumber,
					levelId: settings.levelId
				}
			});
	}

	saveKycLevelSettings(level: KycLevel, create: boolean): Observable<any> {
		return create
			? this.apollo.mutate({
				mutation: ADD_KYC_LEVEL_SETTINGS,
				variables: {
					name: level.name,
					description: level.description,
					userType: level.userType,
					originalLevelName: level.levelData.value,
					originalFlowName: level.flowData.value,
					data: level.getDataObject()
				}
			})
			: this.apollo.mutate({
				mutation: UPDATE_KYC_LEVEL_SETTINGS,
				variables: {
					settingsId: level.id,
					name: level.name,
					description: level.description,
					userType: level.userType,
					originalLevelName: level.levelData.value,
					originalFlowName: level.flowData.value,
					data: level.getDataObject()
				}
			});
	}

	addBlackCountry(code: string): Observable<any> {
		return this.apollo.mutate({
			mutation: ADD_BLACK_COUNTRY,
			variables: {
				countryCode2: code
			}
		});
	}

	saveWidget(widget: WidgetItem): Observable<any> {
		return !widget.id
			? this.apollo.mutate({
				mutation: CREATE_WIDGET,
				variables: {
					userId: widget.userId,
					name: widget.name,
					description: widget.description,
					transactionTypes: widget.transactionTypes,
					currenciesCrypto: widget.currenciesCrypto,
					currenciesFiat: widget.currenciesFiat,
					destinationAddress: widget.destinationAddress,
					countriesCode2: widget.countriesCode2,
					instruments: widget.instruments,
					paymentProviders: widget.paymentProviders,
					liquidityProvider: widget.liquidityProvider,
					additionalSettings: widget.additionalSettings,
					secret: widget.secret,
					allowToPayIfKycFailed: widget.allowToPayIfKycFailed,
					newVaultPerTransaction: widget.newVaultPerTransaction,
					fee: widget.fee,
					masked: widget.masked,
					merchantFeeDestinationAddress: widget.merchantFeeDestinationAddress
				}
			}).pipe(tap(() => {
				this.snackBar.open(`Widget was created`, undefined, { duration: 5000 });
			}))
			: this.apollo.mutate({
				mutation: UPDATE_WIDGET,
				variables: {
					widgetId: widget.id,
					userId: widget.userId,
					name: widget.name,
					description: widget.description,
					transactionTypes: widget.transactionTypes,
					currenciesCrypto: widget.currenciesCrypto,
					currenciesFiat: widget.currenciesFiat,
					destinationAddress: widget.destinationAddress,
					countriesCode2: widget.countriesCode2,
					instruments: widget.instruments,
					paymentProviders: widget.paymentProviders,
					liquidityProvider: widget.liquidityProvider,
					additionalSettings: widget.additionalSettings,
					secret: widget.secret,
					allowToPayIfKycFailed: widget.allowToPayIfKycFailed,
					newVaultPerTransaction: widget.newVaultPerTransaction,
					fee: widget.fee,
					masked: widget.masked,
					merchantFeeDestinationAddress: widget.merchantFeeDestinationAddress,
					merchantFeeMinAmount: widget.merchantFeeMinAmount,
					merchantFeePercent: widget.merchantFeePercent
				}
			}).pipe(tap(() => {
				this.snackBar.open(`Widget was updated`, undefined, { duration: 5000 });
			}));
	}

	updateUserFlag(flag: boolean, userId: string): Observable<any> {
		const vars = {
			userId: userId,
			flag: flag
		};
		return this.apollo.mutate({
			mutation: UPDATE_USER_FLAG,
			variables: vars
		});
	}

	saveCustomer(id: string, customer: UserInput, customerRoles: string[] = ['USER']): Observable<any> {
		if (id === '') {
			return this.apollo.mutate({
				mutation: CREATE_USER,
				variables: {
					roles: customerRoles,
					type: customer.type,
					mode: UserMode.InternalWallet,
					email: customer.email,
					changePasswordRequired: customer.changePasswordRequired,
					firstName: customer.firstName,
					lastName: customer.lastName,
					gender: customer.gender,
					birthday: customer.birthday,
					countryCode2: customer.countryCode2,
					countryCode3: customer.countryCode3,
					postCode: customer.postCode,
					town: customer.town,
					street: customer.street,
					subStreet: customer.subStreet,
					stateName: customer.stateName,
					buildingName: customer.buildingName,
					buildingNumber: customer.buildingNumber,
					flatNumber: customer.flatNumber,
					phone: customer.phone,
					risk: customer.risk,
					accountStatus: customer.accountStatus,
					kycTierId: customer.kycTierId,
					defaultFiatCurrency: customer.defaultFiatCurrency,
					defaultCryptoCurrency: customer.defaultCryptoCurrency,
					kycProvider: customer.kycProvider,
					comment: customer.comment,
					flag: customer.flag,
					companyName: customer.companyName
				}
			}).pipe(tap(() => {
				this.snackBar.open(`User was created`, undefined, { duration: 5000 });
			}));
		} else {
			return this.apollo.mutate({
				mutation: UPDATE_USER,
				variables: {
					userId: id,
					email: customer.email,
					changePasswordRequired: customer.changePasswordRequired,
					firstName: customer.firstName,
					lastName: customer.lastName,
					gender: customer.gender,
					birthday: customer.birthday,
					countryCode2: customer.countryCode2,
					countryCode3: customer.countryCode3,
					postCode: customer.postCode,
					town: customer.town,
					street: customer.street,
					subStreet: customer.subStreet,
					stateName: customer.stateName,
					buildingName: customer.buildingName,
					buildingNumber: customer.buildingNumber,
					flatNumber: customer.flatNumber,
					phone: customer.phone,
					risk: customer.risk,
					accountStatus: customer.accountStatus,
					kycTierId: customer.kycTierId,
					defaultFiatCurrency: customer.defaultFiatCurrency,
					defaultCryptoCurrency: customer.defaultCryptoCurrency,
					kycProvider: customer.kycProvider,
					comment: customer.comment,
					flag: customer.flag,
					companyName: customer.companyName,
					widgetId: customer.widgetId,
          affiliateId: customer.affiliateId
				}
			}).pipe(tap(() => {
				this.snackBar.open(`User was updated`, undefined, { duration: 5000 });
			}));
		}
	}

	updateUserFilters(filters: UserFilterInput): Observable<any> {
    return this.apollo.mutate({
			mutation: UPDATE_USER_FILTER,
			variables: { filters }
		}).pipe(tap(() => {
			this.snackBar.open(`User filter was updated`, undefined, { duration: 5000 });
		}));
  }

	updateUserVault(wallet: AssetAddress): Observable<any> {
		return this.apollo.mutate({
			mutation: UPDATE_USER_VAULT,
			variables: {
				userId: wallet.userId,
				vaultId: wallet.vaultId,
				vaultName: wallet.vaultName
			}
		}).pipe(tap(() => {
			this.snackBar.open(
				`Wallet was updated`,
				undefined, { duration: 5000 }
			);
		}));
	}

	deleteFeeSettings(settingsId: string): Observable<any> {
		return this.mutate({
			mutation: DELETE_SETTINGS_FEE,
			variables: {
				settingsId
			}
		});
	}

	disableFeeSettings(settingsId: string): Observable<any> {
		return this.mutate({
			mutation: DISABLE_SETTINGS_FEE,
			variables: {
				settingsId
			}
		});
	}

	enableFeeSettings(settingsId: string): Observable<any> {
		return this.mutate({
			mutation: ENABLE_SETTINGS_FEE,
			variables: {
				settingsId
			}
		});
	}

	deleteCostSettings(settingsId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_SETTINGS_COST,
			variables: {
				settingsId
			}
		});
	}

	deleteBankAccountSettings(accountId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_WIRE_TRANSFER_SETTINGS,
			variables: {
				bankAccountId: accountId
			}
		});
	}

	deleteKycSettings(settingsId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_SETTINGS_KYC,
			variables: {
				settingsId
			}
		});
	}

	deleteKycTierSettings(settingsId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_SETTINGS_KYC_TIER,
			variables: {
				settingsId
			}
		});
	}

	deleteKycLevelSettings(settingsId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_KYC_LEVEL_SETTINGS,
			variables: {
				settingsId
			}
		});
	}

	deleteBlackCountry(code: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_BLACK_COUNTRY,
			variables: {
				countryCode2: code
			}
		});
	}

	deleteWidget(widgetId: string): Observable<any> {
		return this.mutate({
			mutation: DELETE_WIDGET,
			variables: {
				widgetId
			}
		}).pipe(tap((res) => {
			this.snackBar.open(
				`Widget was deleted`,
				undefined, { duration: 5000 }
			);
		}));
	}

	deleteCustomer(customerId: string): Observable<any> {
		return this.mutate({
			mutation: DELETE_CUSTOMER,
			variables: {
				customerId
			}
		}).pipe(tap((res) => {
			this.snackBar.open(
				`Customer was disabled`,
				undefined, { duration: 5000 }
			);
		}));
	}

	restoreCustomer(customerId: string): Observable<any> {
		return this.mutate({
			mutation: RESTORE_CUSTOMER,
			variables: {
				customerId
			}
		}).pipe(tap((res) => {
			this.snackBar.open(
				`Customer was restored`,
				undefined, { duration: 5000 }
			);
		}));
	}

	confirmEmail(userId: string): Observable<any> {
		return this.mutate({
			mutation: CONFIRM_EMAIL,
			variables: {
				user_id: userId
			}
		});
	}

	confirmDevice(deviceId: string): Observable<any> {
		return this.mutate({
			mutation: CONFIRM_DEVICE,
			variables: {
				device_id: deviceId
			}
		});
	}

	deleteTransaction(transactionId: string): Observable<any> {
		return this.mutate({
			mutation: CANCEL_TRANSACTION,
			variables: {
				transactionId
			}
		}).pipe(tap(() => {
			this.snackBar.open(
				`Transaction was cancelled`,
				undefined, { duration: 5000 }
			);
		}));
	}

	createUserTransaction(transaction: TransactionInput, userId: string, rate: number): Observable<any> {
		return this.mutate({
			mutation: CREATE_USER_TRANSACTION,
			variables: {
				transactionType: transaction.type,
				source: transaction.source,
				currencyToSpend: transaction.currencyToSpend,
				currencyToReceive: transaction.currencyToReceive,
				amountToSpend: transaction.amountToSpend,
				instrument: transaction.instrument,
				paymentProvider: transaction.paymentProvider,
				userId: userId,
				rate: rate
			}
		}).pipe(tap(() => {
			this.snackBar.open(
				`Transaction was created`,
				undefined, { duration: 5000 }
			);
		}));
	}

  simulateTransaction(transaction: TransactionInput, userId: string, rate: number, widgetUserParamsId: string = undefined): Observable<TransactionSimulatorResult> {
		return this.mutate<{ simulateTransaction: TransactionSimulatorResult; }, any>({
			mutation: SIMULATE_TRANSACTION,
			variables: {
				transactionType: transaction.type,
				source: transaction.source,
				currencyToSpend: transaction.currencyToSpend,
				currencyToReceive: transaction.currencyToReceive,
				amountToSpend: transaction.amountToSpend,
				instrument: transaction.instrument,
				paymentProvider: transaction.paymentProvider,
        widgetUserParamsId,
				rate,
        userId
			}
		}).pipe(map((result) => result.data.simulateTransaction));
	}

	unbenchmarkTransaction(ids: string[]): Observable<any> {
		return this.mutate({
			mutation: UNBENCHMARK_TRANSACTIONS,
			variables: {
				transactionIds: ids
			}
		}).pipe(tap(() => {
			this.snackBar.open(
				`Transactions were changed`,
				undefined, { duration: 5000 }
			);
		}));
	}

	updateTransaction(transactionId: string, data: TransactionUpdateInput, launchAfterUpdate: boolean, recalculate: boolean): Observable<any> {
		const vars = {
			transactionId,
			launchAfterUpdate,
			recalculate,
			...data
		};

		return this.mutate({
			mutation: UPDATE_TRANSACTIONS,
			variables: vars
		});
	}

	updateTransactionFlag(flag: boolean, transactionId: string): Observable<any> {
		const vars = { transactionId, flag };

		return this.mutate({
			mutation: UPDATE_TRANSACTION_FLAG,
			variables: vars
		});
	}

	sendAdminNotification(ids: string[], level: UserNotificationLevel, title: string, text: string): Observable<any> {
		return this.mutate({
			mutation: SEND_ADMIN_NOTIFICATION,
			variables: {
				notifiedUserIds: ids,
				title,
				text,
				level
			}
		}).pipe(tap((res) => {
			this.snackBar.open(
				`Message was sent`,
				undefined, { duration: 5000 }
			);
		}));
	}

	resendAdminNotification(notificationId: string): Observable<any> {
		return this.mutate({
			mutation: RESEND_NOTIFICATION,
			variables: { notificationId }
		}).pipe(tap(() => this.snackBar.open(`Message was resent`, undefined, { duration: 5000 })));
	}

	assignRole(userId: string, roleCodes: string[]): Observable<any> {
		return this.mutate({
			mutation: ASSIGN_ROLE,
			variables: {
				userId,
				roleCodes
			}
		}).pipe(tap(() => this.snackBar.open(`Roles are assigned`, undefined, { duration: 5000 })));
	}

	removeRole(userId: string, roleCodes: string[]): Observable<any> {
		return this.mutate({
			mutation: REMOVE_ROLE,
			variables: {
				userId,
				roleCodes
			}
    }).pipe(tap(() => this.snackBar.open(`Roles are removed`, undefined, { duration: 5000 })));
	}

	createApiKey(userId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: CREATE_USER_API_KEY,
			variables: { userId }
		});
	}

	createCurrencyPair(fromCurrency: string, toCurrency: string, liquidityProviderId: string, fixedRate: number): Observable<any> {
		return this.apollo.mutate({
			mutation: CREATE_CURRENCY_PAIR,
			variables: {
				fromCurrency,
				toCurrency,
				liquidityProviderId,
				fixedRate 
			}
		});
	}
  
	deleteCurrencyPair(currencyPairLiquidityProviderId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_CURRENCY_PAIR,
			variables: {
				currencyPairLiquidityProviderId
			},
		});
	}

	deleteApiKey(apiKeyId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_USER_API_KEY,
			variables: { apiKeyId },
		});
	}

	deleteDevice(deviceId: string): Observable<any> {
		return this.apollo.mutate({
			mutation: DELETE_DEVICE,
			variables: {
				deviceIds: [deviceId]
			},
		});
	}

	exportUsersToCsv(
		userIds: string[],
		roleIds: string[],
		orderField: string,
		orderDesc: boolean,
		filter: Filter
	): Observable<any> {
		let vars = {};
		if (userIds.length === 0) {
			vars = {
				userIdsOnly: filter?.users,
				roleIdsOnly: (roleIds.length > 0) ? roleIds : undefined,
				accountTypesOnly: filter?.accountTypes,
				accountStatusesOnly: filter?.accountStatuses,
				riskLevelsOnly: filter?.riskLevels,
				countriesOnly: filter?.countries,
				countryCodeType: CountryCodeType.Code3,
				kycStatusesOnly: filter.kycStatuses,
				registrationDateInterval: filter?.registrationDateInterval,
				widgetIdsOnly: filter?.widgets,
				totalBuyVolumeOver: filter?.totalBuyVolumeOver,
				transactionCountOver: filter?.transactionCountOver,
				orderBy: [{ orderBy: orderField, desc: orderDesc }],
				filter: filter?.search
			};
		} else {
			vars = {
				userIdsOnly: userIds,
				roleIdsOnly: (roleIds.length > 0) ? roleIds : undefined,
				countryCodeType: CountryCodeType.Code3,
				orderBy: [{ orderBy: orderField, desc: orderDesc }]
			};
		}
		return this.apollo.mutate({
			mutation: EXPORT_USERS,
			variables: vars
		});
	}

	exportTransactionsToCsv(
		transactionIds: string[],
		orderField: string,
		orderDesc: boolean,
		filter?: Filter): Observable<any> {
		let vars = {};
		if (transactionIds.length === 0) {
			vars = {
				transactionIdsOnly: filter?.transactionIds,
				accountTypesOnly: filter?.accountTypes,
				countriesOnly: filter?.countries,
				countryCodeType: CountryCodeType.Code3,
				sourcesOnly: filter?.sources,
				userIdsOnly: filter?.users,
				widgetIdsOnly: filter?.widgets,
				transactionTypesOnly: filter?.transactionTypes,
				transactionStatusesOnly: filter?.transactionStatuses,
				userTierLevelsOnly: filter?.tiers,
				riskLevelsOnly: filter?.riskLevels,
				paymentInstrumentsOnly: filter?.paymentInstruments,
				createdDateInterval: filter?.createdDateInterval,
				completedDateInterval: filter?.completedDateInterval,
				walletAddressOnly: filter?.walletAddress,
				filter: filter?.search,
				orderBy: [{ orderBy: orderField, desc: orderDesc }]
			};
		} else {
			vars = {
				transactionIdsOnly: transactionIds,
				countryCodeType: CountryCodeType.Code3,
				orderBy: [{ orderBy: orderField, desc: orderDesc }]
			};
		}
		return this.apollo.mutate({
			mutation: EXPORT_TRANSACTIONS,
			variables: vars
		});
	}

	exportWidgetsToCsv(
		widgetIds: string[],
		orderField: string,
		orderDesc: boolean,
		filter: Filter): Observable<any> {
		const orderFields = [{ orderBy: orderField, desc: orderDesc }];
    
		let vars = {};
		if (widgetIds.length === 0) {
			vars = {
				userIdsOnly: filter.users,
				widgetIdsOnly: filter.widgets,
				filter: filter.search,
				orderBy: orderFields
			};
		} else {
			vars = {
				widgetIdsOnly: widgetIds,
				orderBy: orderFields
			};
		}
		return this.apollo.mutate({
			mutation: EXPORT_WIDGETS,
			variables: vars
		});
	}

	// TODO: move somewhere closer to HTTP, this approach can give false negatives (normally observable doesn't finish,
	//       so tap can be triggered more than once per subscription)
	private updateIsBusy(action: 'on' | 'off'): void {
		if (action === 'on') {
			this.activeQueryCounter++;

			if (!this.isBusySubject.value) {
				setTimeout(() => {
					this.isBusySubject.next(true);
				}, 0);
			}
		} else {
			this.activeQueryCounter--;
			this.activeQueryCounter = this.activeQueryCounter < 0 ? 0 : this.activeQueryCounter;
			if (this.activeQueryCounter === 0) {
				setTimeout(() => {
					this.isBusySubject.next(false);
				}, 0);
			}
		}
	}

	private watchQuery<TData, TVariables>(options: WatchQueryOptions<TVariables, TData>): Observable<ApolloQueryResult<TData>> {
		this.updateIsBusy('on');

		if (this.apollo.client !== undefined) {
      const result = new Observable<ApolloQueryResult<TData>>((sub) => {
        this.apollo.watchQuery<TData, TVariables>(options)
				.valueChanges
				.pipe(
					tap(() => this.updateIsBusy('off')),
					finalize(() => this.updateIsBusy('off')),
					catchError(error => {
						if (this.auth.token !== '') {
							this.snackBar.open(
								this.errorHandler.getError(error.message, 'Unable to load data'),
								undefined,
								{ duration: 5000 }
							);
						} else {
							void this.router.navigateByUrl('/').then();
						}

						return throwError(null);
					})
				).subscribe((data) => {
          sub.next(data);
          sub.complete();
        });
      });
			return result;
		}

		this.snackBar.open('Apollo not ready', undefined, { duration: 5000 });
		return throwError(null);
	}

	private mutate<TData, TVariables>(options: MutationOptions<TData, TVariables>): Observable<FetchResult<TData>> {
		if (this.apollo.client !== undefined) {
			return this.apollo.mutate<TData, TVariables>(options)
				.pipe(
					catchError(error => {
						if (this.auth.token !== '') {
							this.snackBar.open(
								this.errorHandler.getError(error.message, 'Unable to perform action'),
								undefined,
								{ duration: 5000 }
							);
						} else {
							void this.router.navigateByUrl('/').then();
						}

						return throwError(null);
					})
				);
		}

		this.snackBar.open('Apollo not ready', undefined, { duration: 5000 });
		return throwError(null);
	}
}
