import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { EmptyObject } from 'apollo-angular/types';
import { environment } from 'src/environments/environment';

const GET_SETTINGS_CURRENCY_POST = gql`
  query GetSettingsCurrency($recaptcha: String!) {
    getSettingsCurrency(recaptcha: $recaptcha) {
      count
      list {
        symbol
        name
        precision
        minAmount
        rateFactor
        validateAsSymbol
      }
    }
  }
`;

const GET_USERS_POST = gql`
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

const GET_USER_BY_ID_POST = gql`
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

    getSettingsCurrency(): QueryRef<any, EmptyObject> | null {
      if (this.apollo.client !== undefined) {
        return this.apollo.watchQuery<any>({
          query: GET_SETTINGS_CURRENCY_POST,
          variables: {
            recaptcha: environment.recaptchaId
          },
          fetchPolicy: 'network-only'
        });
      } else {
        return null;
      }
    }

    getUsers(): QueryRef<any, EmptyObject> | null {
        if (this.apollo.client !== undefined) {
            return this.apollo.watchQuery<any>({
                query: GET_USERS_POST,
                pollInterval: 30000,
                fetchPolicy: 'network-only'
            });
        } else {
            return null;
        }
    }

    getUserById(id: string): QueryRef<any, EmptyObject> | null {
        if (this.apollo.client !== undefined) {
            return this.apollo.watchQuery<any>({
                query: GET_USER_BY_ID_POST,
                variables: { userId: id },
                // pollInterval: 30000,
                fetchPolicy: 'network-only'
            });
        } else {
            return null;
        }
    }
}
