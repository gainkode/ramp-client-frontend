import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { from, Observable } from 'rxjs';
import { LoginResult, User } from '../model/generated-models';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

const GET_FEE_SETTINGS_POST = gql`
  query GetSettingsFee {
    getSettingsFee(filter: "") {
      count
    }
  }
`;

@Injectable()
export class AdminDataService {
    constructor(private apollo: Apollo) { }

    getFeeSettings(): Observable<any> {
        return this.apollo.watchQuery<Response>({
            query: GET_FEE_SETTINGS_POST//,
            //variables: { episode: 'JEDI' }
        }).valueChanges;
    }
}
