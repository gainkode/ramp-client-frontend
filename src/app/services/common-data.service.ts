import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { environment } from 'src/environments/environment';

const GET_SETTINGS_CURRENCY = gql`
  query GetSettingsCurrency($recaptcha: String!) {
    getSettingsCurrency(recaptcha: $recaptcha) {
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
        }
      }
      defaultFiat
      defaultCrypto
    }
  }
`;

const MY_TRANSACTIONS_TOTAL = gql`
query MyState {
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

@Injectable()
export class CommonDataService {
  constructor(private apollo: Apollo) { }

  getSettingsCurrency(): QueryRef<any, EmptyObject> {
    return this.apollo.watchQuery<any>({
      query: GET_SETTINGS_CURRENCY,
      variables: {
        recaptcha: environment.recaptchaId
      },
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

  getUsers(): QueryRef<any, EmptyObject> {
    return this.apollo.watchQuery<any>({
      query: GET_USERS,
      fetchPolicy: 'network-only'
    });
  }

  getUserById(id: string): QueryRef<any, EmptyObject> {
    return this.apollo.watchQuery<any>({
      query: GET_USER_BY_ID,
      variables: { userId: id },
      fetchPolicy: 'network-only'
    });
  }
}
