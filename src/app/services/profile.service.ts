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
}
