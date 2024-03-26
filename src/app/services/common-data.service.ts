import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { Observable } from 'rxjs';

const GET_SETTINGS_CURRENCY = gql`
  query GetSettingsCurrency {
    getSettingsCurrency {
      settingsCurrency {
        count
        list {
          symbol
          name
          precision
          minAmount
          rateFactor
          validateAsSymbol
          fiat
          currencyBlockchain
          disabled
          displaySymbol
        }
      }
      defaultFiat
      defaultCrypto
    }
  }
`;

const GET_ROLES = gql`
query GetRoles {
  getRoles {
    userRoleId
    name
    code
    immutable
  }
}
`;

const MY_TRANSACTIONS_TOTAL = gql`
query MyStateTest {
  myState {
    totalAmountEur
  }
}
`;

const MY_BALANCES = gql`
query MyState {
  myState {
    date,
    vaults {
      totalBalanceFiat,
      balancesPerAsset {
        assetId,
        totalBalance,
        totalBalanceFiat,
        availableBalance,
        availableBalanceFiat
      }
    }
    fiatVaults {
      fiatVaultId
      balance
      generalBalance
      currency
    }
  }
}
`;

const MY_FIAT_VAULTS = gql`
query MyFiatVaults($assetsOnly: [String]){
  myFiatVaults(
    assetsOnly: $assetsOnly
  ){
    list {
      fiatVaultId
      balance
      generalBalance
      currency
    }
  }
}
`;

const GET_USERS = gql`
  query GetUsers {
    getUsers(
      skip: 0,
      first: 0,
      filter: "",
      orderBy:
      [
        {orderBy: "lastName", desc: false}
      ]) {
      count,
      list {
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
        defaultFiatCurrency,
        termsOfUse,
        created,
        updated,
        deleted,
        accessFailedCount,
        nameConfirmed,
        emailConfirmed,
        roles,
        permissions,
        is2faEnabled,
        hasEmailAuth,
        changePasswordRequired,
        referralCode,
        notificationSubscriptions,
        kycProvider,
        kycApplicantId,
        kycValid,
        kycReviewDate,
        kycStatus,
        kycStatusDate,
        kycReviewComment,
        kycPrivateComment,
        kycReviewRejectedType,
        kycReviewRejectedLabels,
        kycReviewResult,
        kycStatusUpdateRequired,
        state
      }
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById(
    $userId: String
  ) {
    userById(
      userId: $userId) {
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
        defaultFiatCurrency,
        termsOfUse,
        created,
        updated,
        deleted,
        accessFailedCount,
        nameConfirmed,
        emailConfirmed,
        is2faEnabled,
        hasEmailAuth,
        changePasswordRequired,
        referralCode,
        notificationSubscriptions {userNotificationTypeCode},
        kycProvider,
        kycApplicantId,
        kycValid,
        kycReviewDate,
        kycStatus,
        kycStatusDate,
        kycReviewComment,
        kycPrivateComment,
        kycReviewRejectedType,
        kycReviewRejectedLabels,
        kycReviewResult,
        kycStatusUpdateRequired,
        state {
          date,
          walletName,
          customerRefId,
          notifications
          {
            count,
            list {userNotificationTypeCode, viewed}
          }
        }
      }
    }
`;

const ADD_MY_WIDGET_PARAMS = gql`
mutation AddMyWidgetUserParams(
  $widgetId: String!,
  $userEmail: String!,
  $params: String!
) {
  addMyWidgetUserParams(
    widgetUserParams: {
      widgetId: $widgetId,
      userEmail: $userEmail,
      params: $params
    }
  ) {
    widgetUserParamsId
  }
}
`;

const GET_TEXT_PAGES = gql`
query($local: String!){
  getTextPages(
    local: $local
  ) {
    pageText, 
    local, 
    pageType
  }
}
`;

@Injectable()
export class CommonDataService {
	constructor(private apollo: Apollo) { }

	getSettingsCurrency(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_SETTINGS_CURRENCY,
			variables: {},
			fetchPolicy: 'network-only'
		});
	}

	getRoles(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_ROLES,
			fetchPolicy: 'network-only'
		});
	}

	getMyTransactionsTotal(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: MY_TRANSACTIONS_TOTAL,
			fetchPolicy: 'network-only'
		});
	}

	getMyBalances(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: MY_BALANCES,
			fetchPolicy: 'network-only'
		});
	}

	myFiatVaults(assetsOnly: string[]): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: MY_FIAT_VAULTS,
			variables: { assetsOnly },
			fetchPolicy: 'network-only'
		});
	}

	getUsers(): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_USERS,
			fetchPolicy: 'network-only'
		});
	}

	getUserById(userId: string): QueryRef<any, EmptyObject> {
		return this.apollo.watchQuery<any>({
			query: GET_USER_BY_ID,
			variables: { userId },
			fetchPolicy: 'network-only'
		});
	}

	addMyWidgetUserParams(widgetId: string, userEmail: string, params: string): Observable<any> {
		return this.apollo.mutate({
			mutation: ADD_MY_WIDGET_PARAMS,
			variables: { widgetId, userEmail, params }
		});
	}

	getCustomText(): QueryRef<any, EmptyObject> {
    const local = 'fr';

		return this.apollo.watchQuery<any>({
			query: GET_TEXT_PAGES,
			fetchPolicy: 'network-only',
      variables: { local }
		});
	}
}
