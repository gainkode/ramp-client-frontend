import { Injectable } from "@angular/core";
import { Apollo, gql, QueryRef } from "apollo-angular";
import { Observable } from "rxjs";
import { EmptyObject } from "apollo-angular/types";
import { TransactionSource } from "../model/generated-models";

const GET_MY_TRANSACTIONS_POST = gql`
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
        affiliateId
        created
        executed
        type
        source
        status
        fee
        feePercent
        feeMinEuro
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
        destinationType
        destination
      }
    }
  }
`;

const GET_ME_POST = gql`
  query Me {
    me {
      userId
      email
      name
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
      defaultFiatCurrency
      termsOfUse
      created
      updated
      contacts {
        userContactId
        userId
        contactId
        displayName
        created
      }
      is2faEnabled
      hasEmailAuth
      changePasswordRequired
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
      state {
        date
        assets {
          id
          total
          available
          pending
          lockedAmount
          totalStakedCPU
          totalStakedNetwork
          selfStakedCPU
          selfStakedNetwork
          pendingRefundCPU
          pendingRefundNetwork
        }
        externalWallets {
          id
          name
          customerRefId
          assets {
            id
            status
            activationTime
            address
            tag
          }
        }
      }
    }
  }
`;

const GET_PROFILE_HOME_POST = gql`
  query Me {
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
      state {
        date
        assets {
          id
          total
          available
          pending
          lockedAmount
          totalStakedCPU
          totalStakedNetwork
          selfStakedCPU
          selfStakedNetwork
          pendingRefundCPU
          pendingRefundNetwork
        }
        externalWallets {
          id
          name
          customerRefId
          assets {
            id
            status
            activationTime
            address
            tag
          }
        }
      }
    }
  }
`;

const GET_PROFILE_ACCOUNT_POST = gql`
  query Me {
    me {
      userId
      email
      name
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
      defaultFiatCurrency
      termsOfUse
      created
      updated
      contacts {
        userContactId
        userId
        contactId
        displayName
        created
      }
      is2faEnabled
      hasEmailAuth
      changePasswordRequired
      referralCode
      kycProvider
      kycValid
      kycStatus
      kycReviewComment
      kycReviewRejectedType
      kycReviewRejectedLabels
    }
  }
`;

const UPDATE_ME_INFO_POST = gql`
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

const CHANGE_PASSWORD_POST = gql`
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

@Injectable()
export class ProfileDataService {
  constructor(private apollo: Apollo) {}

  getMyTransactions(
    pageIndex: number,
    takeItems: number,
    sources: TransactionSource[],
    orderField: string,
    orderDesc: boolean
  ): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      const orderFields = [{ orderBy: orderField, desc: orderDesc }];
      return this.apollo.watchQuery<any>({
        query: GET_MY_TRANSACTIONS_POST,
        variables: {
          sourcesOnly: sources,
          filter: "",
          skip: pageIndex * takeItems,
          first: takeItems,
          orderBy: orderFields,
        },
        pollInterval: 30000,
        fetchPolicy: "network-only",
      });
    } else {
      return null;
    }
  }

  getMe(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_ME_POST,
        fetchPolicy: "network-only",
      });
    } else {
      return null;
    }
  }

  getProfileHomeData(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_PROFILE_HOME_POST,
        fetchPolicy: "network-only",
      });
    } else {
      return null;
    }
  }

  getProfileAccountData(): QueryRef<any, EmptyObject> | null {
    if (this.apollo.client !== undefined) {
      return this.apollo.watchQuery<any>({
        query: GET_PROFILE_ACCOUNT_POST,
        fetchPolicy: "network-only",
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
      mutation: UPDATE_ME_INFO_POST,
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
    let code: string | undefined = undefined;
    if (code2fa) {
      code = (code2fa !== '') ? code2fa : undefined;
    }
    return this.apollo.mutate({
      mutation: CHANGE_PASSWORD_POST,
      variables: {
        code2fa: code,
        oldPassword,
        newPassword
      },
    });
  }
}
