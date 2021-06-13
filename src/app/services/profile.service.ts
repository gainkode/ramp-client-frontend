import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { TransactionSource } from '../model/generated-models';

const GET_MY_TRANSACTIONS_POST = gql`
  query GetMyTransactions(
    $sourcesOnly: [TransactionSource!],
    $filter: String,
    $skip: Int,
    $first: Int,
    $orderBy: [OrderBy!]) {
      getMyTransactions(
        sourcesOnly: $sourcesOnly,
        filter: $filter,
        skip: $skip,
        first: $first,
        orderBy: $orderBy
    ) {
      count,
      list {
        transactionId,
        code,
        userId,
        affiliateId,
        created,
        executed,
        type,
        source,
        status,
        fee,
        feePercent,
        feeMinEuro,
        feeDetails,
        currencyToSpend,
        amountToSpend,
        amountToSpendWithoutFee,
        currencyToReceive,
        amountToReceive,
        amountToReceiveWithoutFee,
        rate,
        liquidityProvider,
        instrument,
        paymentProvider,
        data,
        destinationType,
        destination
      }
    }
  }
`;

const GET_ME_POST = gql`
  query Me {
    me {
      userId,
      email,
      name,
      type,
      mode,
      merchantIds,
      firstName,
      lastName,
      avatar,
      birthday,
      countryCode2,
      countryCode3,
      phone,
      defaultCurrency,
      termsOfUse,
      created,
      updated,
      contacts {userContactId, userId, contactId, displayName, created},
      is2faEnabled,
      hasEmailAuth,
      changePasswordRequired,
      referralCode,
      kycProvider,
      kycValid,
      kycStatus,
      kycReviewComment,
      kycReviewRejectedType,
      kycReviewRejectedLabels,
      kycStatusUpdateRequired,
      custodyProvider,
      vaultAccountId,
      state {
        date,
        assets {id, total, available, pending, lockedAmount, totalStakedCPU, totalStakedNetwork, selfStakedCPU, selfStakedNetwork, pendingRefundCPU, pendingRefundNetwork},
        externalWallets {
          id,
          name,
          customerRefId,
          assets {
            id, status, activationTime, address, tag}
          },
        notifications {
          count,
          list {
            userNotificationId, userId, userNotificationTypeCode, created, viewed, text, linkedId, linkedTable, params
          }
        }
      }
    }
  }
`;

@Injectable()
export class ProfileDataService {
    constructor(private apollo: Apollo) { }

    getMyTransactions(pageIndex: number, takeItems: number, sources: TransactionSource[],
        orderField: string, orderDesc: boolean): QueryRef<any, EmptyObject> | null {
        if (this.apollo.client !== undefined) {
            const orderFields = [
                { orderBy: orderField, desc: orderDesc }
            ];
            return this.apollo.watchQuery<any>({
                query: GET_MY_TRANSACTIONS_POST,
                variables: {
                    sourcesOnly: sources,
                    filter: '',
                    skip: pageIndex * takeItems,
                    first: takeItems,
                    orderBy: orderFields
                },
                pollInterval: 30000,
                fetchPolicy: 'network-only'
            });
        } else {
            return null;
        }
    }

    getMe(): QueryRef<any, EmptyObject> | null {
      if (this.apollo.client !== undefined) {
          return this.apollo.watchQuery<any>({
              query: GET_ME_POST,
              fetchPolicy: 'network-only'
          });
      } else {
          return null;
      }
  }
}
