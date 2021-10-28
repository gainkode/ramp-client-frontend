import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { EmptyObject } from 'apollo-angular/types';
import { TransactionSource, UserBalanceHistoryPeriod } from '../model/generated-models';

const GET_MY_TRANSACTIONS = gql`
  query MyTransactions(
    $sourcesOnly: [TransactionSource!]
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    myTransactions(
      sourcesOnly: $sourcesOnly
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
          balance
          balanceEur
          transactionId
        }
      }
    }
  }
}
`;

const GET_MY_NOTIFICATIONS = gql`
  query MyNotifications(
    $filter: String
    $skip: Int
    $first: Int
    $orderBy: [OrderBy!]
  ) {
    myNotifications(
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
        userNotificationTypeCode
      }
    }
  }
`;

const GET_PROFILE_ME = gql`
  query MeHome {
    me {
      userId
      defaultFiatCurrency
      referralCode
      kycProvider
      kycValid
      kycStatus
      kycReviewComment
      kycReviewRejectedType
      kycReviewRejectedLabels
      kycStatusUpdateRequired
      custodyProvider
      vaultAccountId
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

const GET_PROFILE_CONTACTS = gql`
  query MyContacts(
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
    ) {
      count
      list {
        userContactId
        userId
        contactEmail
        displayName
        created
      }
    }
  }
`;

const UPDATE_ME_INFO = gql`
  mutation UpdateMe(
    $firstName: String!
    $lastName: String!
    $countryCode3: String!
    $phone: String!
    $defaultFiatCurrency: String!
  ) {
    updateMe(
      user: {
        firstName: $firstName
        lastName: $lastName
        countryCode3: $countryCode3
        phone: $phone
        defaultFiatCurrency: $defaultFiatCurrency
      }
    ) {
      email
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
  ) {
    addMyContact(
      contactEmail: $contactEmail
      displayName: $displayName
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
      contactEmail: $contactEmail
      displayName: $displayName
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
          filter: '',
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

  getTransactionStatuses(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_TRANSACTION_STATUSES,
        fetchPolicy: 'network-only',
      });
    } else {
      return null;
    }
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

  getProfileContacts(
    pageIndex: number,
    takeItems: number,
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      return this.apollo.watchQuery<any>({
        query: GET_PROFILE_CONTACTS,
        variables: {
          filter: '',
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
          filter: '',
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

  saveUserInfo(
    firstName: string,
    lastName: string,
    country: string,
    phone: string,
    currency: string
  ): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_ME_INFO,
      variables: {
        firstName,
        lastName,
        countryCode3: country,
        phone,
        defaultFiatCurrency: currency,
      },
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

  saveContact(id: string, name: string, email: string): Observable<any> {
    if (id === '') {
      return this.apollo.mutate({
        mutation: ADD_MY_CONTACT,
        variables: {
          contactEmail: email,
          displayName: name
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

  deleteContact(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_MY_CONTACT,
      variables: {
        contactId: id
      },
    });
  }
}
