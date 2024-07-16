import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { PlatformInfo } from 'model/generated-models';
import { firstValueFrom, map } from 'rxjs';

const GET_PLATFORM_INFO = gql`
query GetPlatformInfo {
   getPlatformInfo {
    product
    productFull
    showExpressTransfer
    showDepositWithdrawal
    showBuySell
    showCreateTransactionUpdateRate
    apiTimeout
    recaptchaId
    recaptchaSiteKey
    recaptchaProvider
    googleId
    supportEmail
    baseColor
    mainFont
    adminFont
    cookieLink
    termsLink
    privacyLink
    showCookie
    showTerms
    showPrivacy
    cryptoWidgetFinishLink
    cryptoWidgetBgMask
    cryptoWidgetBgName
  }
}
`;

@Injectable()
export class AppInitService {
	constructor(private apollo: Apollo) { }

  async getPlatformInfo(): Promise<PlatformInfo> {
    return firstValueFrom(this.apollo.watchQuery<{ getPlatformInfo: PlatformInfo; }>({
      query: GET_PLATFORM_INFO,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(map(result => result.data.getPlatformInfo)));
  }
}