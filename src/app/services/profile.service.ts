import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { EmptyObject } from 'apollo-angular/types';
import { TransactionSource, TransactionType, UserBalanceHistoryPeriod } from '../model/generated-models';

const GET_MY_TRANSACTIONS = gql`
  query MyTransactions(
    $sourcesOnly: [TransactionSource!]
    $transactionDateOnly: DateTime
    $transactionTypesOnly: [TransactionType!]
    $transactionIdsOnly: [String!]
    $sendersOrReceiversOnly: [String!]
    $paymentProvidersOnly: [String!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    myTransactions(
      sourcesOnly: $sourcesOnly
      transactionDateOnly: $transactionDateOnly
      transactionTypesOnly: $transactionTypesOnly
      transactionIdsOnly: $transactionIdsOnly
      sendersOrReceiversOnly: $sendersOrReceiversOnly
      paymentProvidersOnly: $paymentProvidersOnly
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        transactionId
        code
        userId
        userIp
        created
        executed
        type
        source
        status
        feeFiat
        feeMinFiat
        feePercent
        feeDetails
        currencyToSpend
        amountToSpend
        amountToSpendWithoutFee
        currencyToReceive
        amountToReceive
        amountToReceiveWithoutFee
        rate
        liquidityProvider
        instrument
        paymentProvider
        paymentOrder {
          orderId
          amount
          currency
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
          originalOrderId
          preauthOperationSn
          captureOperationSn
          refundOperationSn
          paymentInfo
        }
        data
        destination
      }
    }
  }
`;

const GET_TRANSACTION_STATUSES = gql`
query GetTransactionStatuses {
  getTransactionStatuses{
    key
    value {
      notifyUser
      canBeCancelled
      description
      userStatus
      level
    }
  }    
}
`;

const GET_MY_WALLETS = gql`
  query MyWallets(
    $orderBy: [OrderBy!],
    $assetIdsOnly: [String!]
  ) {
    myWallets(
      orderBy: $orderBy
      assetIdsOnly: $assetIdsOnly
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
        totalEur
        totalFiat
        available
        availableEur
        availableFiat
        pending
        lockedAmount
        vaultId
        vaultName
      }
    }
  }
`;

const GET_MY_PROFIT = gql`
query MyProfit($currencyTo: String, $period: UserBalanceHistoryPeriod!) {
  myProfit(
    options: {
      currencyTo: $currencyTo
      period: $period
    }
  ) {
    userId
    currencyTo
    period
    profits {
      currencyFrom
      profitFiat
      profitPercent
      userBalanceHistory {
        count
        list {
          userBalanceId
          userId
          date
          asset
          balanceFiat
          transactionId
        }
      }
    }
  }
}
`;

const GET_MY_NOTIFICATIONS = gql`
  query MyNotifications(
    $unreadOnly: Boolean
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    myNotifications(
      unreadOnly: $unreadOnly
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
    ) {
      count
      list {
        userNotificationId
        created
        viewed
        userId
        text
        title
        userNotificationTypeCode
        userNotificationLevel
        params
      }
    }
  }
`;

const GET_PROFILE_ME = gql`
  query MeHome {
    me {
      userId
      defaultFiatCurrency
      defaultCryptoCurrency
      referralCode
      kycProvider
      kycValid
      kycStatus
      kycReviewComment
      kycReviewRejectedType
      kycReviewRejectedLabels
      kycStatusUpdateRequired
      kycTierId
      kycTier {
        name
        description
        amount
        requireUserFullName
        requireUserPhone
        requireUserBirthday
        requireUserAddress
        requireUserFlatNumber
      }
      custodyProvider
      email
      type
      mode
      merchantIds
      firstName
      lastName
      avatar
      birthday
      countryCode2
      countryCode3
      phone
      postCode
      town
      street
      subStreet
      stateName
      buildingName
      buildingNumber
      flatNumber
      termsOfUse
      created
      updated
      is2faEnabled
      hasEmailAuth
      changePasswordRequired
    }
  }
`;

const GET_MY_CONTACTS = gql`
  query MyContacts(
    $assetIds: [String!]
    $contactEmails: [String!]
    $contactDisplayNames: [String!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    myContacts(
      filter: $filter
      skip: $skip
      first: $first
      orderBy: $orderBy
      assetIds: $assetIds
      contactEmails: $contactEmails
      contactDisplayNames: $contactDisplayNames
    ) {
      count
      list {
        userContactId
        userId
        contactEmail
        displayName
        created
        address
        assetId
      }
    }
  }
`;

const DELETE_MY_NOTIFICATIONS = gql`
  mutation DeleteMyNotifications(
    $notificationIds: [ID!]
  ) {
    deleteMyNotifications(
      notificationIds: $notificationIds
    ) {
      userNotificationId
    }
  }
`;

const MAKE_NOTIFICATIONS_VIEWED = gql`
  mutation MakeNotificationsViewed(
    $notificationIds: [ID!]
  ) {
    makeNotificationsViewed(
      notificationIds: $notificationIds
    ) {
      userNotificationId
      viewed
    }
  }
`;

const ADD_MY_VAULT = gql`
  mutation AddMyVault(
    $vaultName: String!,
    $assetId: String!
  ) {
    addMyVault(
      vaultName: $vaultName
      assetId: $assetId
    ) {
      id
      assets {
        addresses {
          address
          addressFormat
          legacyAddress
          description
          type
        }
      }
    }
  }
`;

const UPDATE_MY_VAULT = gql`
  mutation UpdateMyVault(
    $vaultId: String,
    $vaultName: String!
  ) {
    updateMyVault(
      vaultId: $vaultId
      vaultName: $vaultName
    ) {
      name
    }
  }
`;

const DELETE_MY_VAULT = gql`
  mutation DeleteMyVault(
    $vaultId: String
  ) {
    deleteMyVault(
      vaultId: $vaultId
    ) {
      name
    }
  }
`;

const UPDATE_ME_INFO = gql`
  mutation UpdateMe(
    $firstName: String
    $lastName: String
    $countryCode2: String
    $countryCode3: String
    $birthday: DateTime
    $phone: String
    $postCode: String
    $town: String
    $street: String
    $subStreet: String
    $stateName: String
    $buildingName: String
    $buildingNumber: String
    $flatNumber: String
    $avatar: String
    $defaultFiatCurrency: String
    $defaultCryptoCurrency: String
  ) {
    updateMe(
      user: {
        firstName: $firstName
        lastName: $lastName
        countryCode2: $countryCode2
        countryCode3: $countryCode3
        birthday: $birthday
        phone: $phone
        postCode: $postCode
        town: $town
        street: $street
        subStreet: $subStreet
        stateName: $stateName
        buildingName: $buildingName
        buildingNumber: $buildingNumber
        flatNumber: $flatNumber
        avatar: $avatar
        defaultFiatCurrency: $defaultFiatCurrency
        defaultCryptoCurrency: $defaultCryptoCurrency
      }
    ) {
      email
      firstName
      lastName
      countryCode2
      countryCode3
      birthday
      phone
      postCode
      town
      street
      subStreet
      stateName
      buildingName
      buildingNumber
      flatNumber
      avatar
      defaultFiatCurrency
      defaultCryptoCurrency
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword(
    $code2fa: String
    $oldPassword: String!
    $newPassword: String!
  ) {
    changePassword(
      code2fa: $code2fa
      oldPassword: $oldPassword
      newPassword: $newPassword
    )
  }
`;

const ADD_MY_CONTACT = gql`
  mutation AddMyContact(
    $contactEmail: String!
    $displayName: String!
    $assetId: String!
    $address: String!
  ) {
    addMyContact(
      contact: {
        contactEmail: $contactEmail
        displayName: $displayName
        assetId: $assetId
        address: $address
      }
    ) {
      userId
    }
  }
`;

const UPDATE_MY_CONTACT = gql`
  mutation UpdateMyContact(
    $contactId: String!
    $contactEmail: String!
    $displayName: String!
  ) {
    updateMyContact(
      contactId: $contactId
      contact: {
        contactEmail: $contactEmail
        displayName: $displayName
      }
    ) {
      userId
    }
  }
`;

const DELETE_MY_CONTACT = gql`
  mutation DeleteMyContact(
    $contactId: ID!
  ) {
    deleteMyContact(
      contactId: $contactId
    ) {
      userId
    }
  }
`;

@Injectable()
export class ProfileDataService {
  constructor(private apollo: Apollo) { }

  getMyTransactions(
    pageIndex: number,
    takeItems: number,
    sources: TransactionSource[],
    transactionDate: Date | undefined,
    transactionTypes: TransactionType[],
    sendersOrReceivers: String,
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [
        { orderBy: orderField, desc: orderDesc },
        { orderBy: 'created', desc: orderDesc }
      ];
      return this.apollo.watchQuery<any>({
        query: GET_MY_TRANSACTIONS,
        variables: {
          sourcesOnly: sources,
          transactionDateOnly: transactionDate,
          transactionTypesOnly: transactionTypes,
          sendersOrReceiversOnly: (sendersOrReceivers === '') ? undefined : [sendersOrReceivers],
          filter: undefined,
          skip: pageIndex * takeItems,
          first: takeItems,
          orderBy: orderFields,
        },
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getTransactionStatuses(): QueryRef<any, EmptyObject> {
    return this.apollo.watchQuery<any>({
      query: GET_TRANSACTION_STATUSES,
      fetchPolicy: 'network-only',
    });
  }

  getMyWallets(assets: string[]): QueryRef<any, EmptyObject> {
    const orderFields = [
      { orderBy: 'total', desc: true }
    ];
    const assetIds = (assets.length > 0) ? assets : undefined;
    return this.apollo.watchQuery<any>({
      query: GET_MY_WALLETS,
      variables: {
        assetIdsOnly: assetIds,
        orderBy: orderFields,
      },
      fetchPolicy: 'network-only',
    });
  }

  getProfileData(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_PROFILE_ME,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getMyContacts(
    assets: string[],
    emails: string[],
    displayNames: string[],
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      return this.apollo.watchQuery<any>({
        query: GET_MY_CONTACTS,
        variables: {
          filter: '',
          skip: pageIndex * takeItems,
          first: takeItems,
          orderBy: orderFields,
          assetIds: assets,
          contactEmails: (emails.length > 0) ? emails : undefined,
          contactDisplayNames: (displayNames.length > 0) ? displayNames : undefined
        },
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getMyProfit(fiatCurrency: string, selectPeriod: UserBalanceHistoryPeriod): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: 'date', desc: true }];
      return this.apollo.watchQuery<any>({
        query: GET_MY_PROFIT,
        variables: {
          currencyTo: fiatCurrency,
          period: selectPeriod
        },
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  getMyNotifications(
    unreadOnlyFilter: boolean,
    search: string,
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      return this.apollo.watchQuery<any>({
        query: GET_MY_NOTIFICATIONS,
        variables: {
          unreadOnly: unreadOnlyFilter,
          filter: search,
          skip: pageIndex * takeItems,
          first: takeItems,
          orderBy: orderFields,
        },
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
  }

  deleteMyNotifications(idList: string[]): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_MY_NOTIFICATIONS,
      variables: {
        notificationIds: idList,
      },
    });
  }

  makeNotificationsViewed(idList: string[]): Observable<any> {
    return this.apollo.mutate({
      mutation: MAKE_NOTIFICATIONS_VIEWED,
      variables: {
        notificationIds: idList,
      },
    });
  }

  addMyVault(asset: string, name: String): Observable<any> {
    return this.apollo.mutate({
      mutation: ADD_MY_VAULT,
      variables: {
        assetId: asset,
        vaultName: name
      },
    });
  }

  updateMyVault(vault: string, name: string): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_MY_VAULT,
      variables: {
        vaultId: vault,
        vaultName: name
      },
    });
  }

  deleteMyVault(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_MY_VAULT,
      variables: {
        vaultId: id
      },
    });
  }

  saveUserInfo(vars: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_ME_INFO,
      variables: vars
    });
  }

  changePassword(
    code2fa: string,
    oldPassword: string,
    newPassword: string
  ): Observable<any> {
    let code: string | undefined;
    if (code2fa) {
      code = (code2fa !== '') ? code2fa : undefined;
    }
    return this.apollo.mutate({
      mutation: CHANGE_PASSWORD,
      variables: {
        code2fa: code,
        oldPassword,
        newPassword
      },
    });
  }

  saveMyContact(id: string, name: string, email: string, currency: string, contactAddress: string): Observable<any> {
    if (id === '') {
      return this.apollo.mutate({
        mutation: ADD_MY_CONTACT,
        variables: {
          contactEmail: email,
          displayName: name,
          assetId: currency,
          address: contactAddress
        },
      });
    } else {
      return this.apollo.mutate({
        mutation: UPDATE_MY_CONTACT,
        variables: {
          contactId: id,
          contactEmail: email,
          displayName: name
        },
      });
    }
  }

  deleteMyContact(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_MY_CONTACT,
      variables: {
        contactId: id
      },
    });
  }
}
