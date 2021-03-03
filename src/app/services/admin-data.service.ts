import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

const GET_FEE_SETTINGS_POST = gql`
  query GetSettingsFee {
    getSettingsFee(filter: "") {
      count,
      list {
        name,
        default,
        description,
        terms,
        wireDetails,
        targetInstruments,
        targetPaymentProviders,
        targetTransactionTypes,
        targetFilterType,
        targetFilterValues
      }
    }
  }
`;

@Injectable()
export class AdminDataService {
    constructor(private apollo: Apollo) { }

    getFeeSettings(): Observable<any> {
        return this.apollo.watchQuery<Response>({
            query: GET_FEE_SETTINGS_POST
        }).valueChanges;
    }
}
