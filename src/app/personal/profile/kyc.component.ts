import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsKyc, User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

const snsWebSdk = require('@sumsub/websdk');

@Component({
  templateUrl: './kyc.component.html',
  styleUrls: ['./profile.scss']
})
export class KycPersonalComponent implements OnInit {
  user: User | null = null;
  inProgress = false;
  errorMessage = '';

  constructor(private router: Router, private auth: AuthService, private errorHandler: ErrorService) {
    this.user = auth.user;
  }

  ngOnInit(): void {
    this.inProgress = true;
    this.auth.getKycSettings().valueChanges.subscribe(kyc => {
      const settingsKyc: SettingsKyc = kyc.data.getSettingsKyc;
      this.inProgress = false;
      this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
        this.launchSumSubWidget(
          settingsKyc.kycBaseAddress as string,
          settingsKyc.kycPersonalFlow as string,
          data.generateWebApiToken,
          this.user?.email as string,
          this.user?.phone as string,
          []);
      });
    });
  }

  // @param apiUrl - 'https://test-api.sumsub.com' (sandbox) or 'https://api.sumsub.com' (production)
  // @param flowName - the flow name chosen at Step 1 (e.g. 'basic-kyc')
  // @param accessToken - access token that you generated on the backend in Step 2
  // @param applicantEmail - applicant email (not required)
  // @param applicantPhone - applicant phone, if available (not required)
  // @param customI18nMessages - customized locale messages for current session (not required)
  launchSumSubWidget(apiUrl: string, flowName: string, accessToken: string, applicantEmail: string,
    applicantPhone: string, customI18nMessages: string[]) {
    const snsWebSdkInstance = snsWebSdk.default.Builder(apiUrl, flowName)
      .withAccessToken(accessToken,
        (newAccessTokenCallback: (newToken: string) => void) => {
          // Access token expired
          // get a new one and pass it to the callback to re-initiate the WebSDK
          console.log('update token');
          this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
            newAccessTokenCallback(data.generateWebApiToken);
          });
        }
      )
      .withConf({
        lang: 'en',
        applicantEmail,
        applicantPhone,
        i18n: customI18nMessages,
        onMessage: (type: any, payload: any) => {
          // see below what kind of messages the WebSDK generates
          console.log('WebSDK onMessage', type, payload);
        },
        // uiConf: {
        //   customCss: "https://url.com/styles.css"
        //   // URL to css file in case you need change it dynamically from the code
        //   // the similar setting at Applicant flow will rewrite customCss
        //   // you may also use to pass string with plain styles `customCssStr:`
        // },
        onError: (error: any) => {
          this.errorMessage = error;
          console.error('WebSDK onError', error);
        },
      })
      .build();
    // you are ready to go:
    // just launch the WebSDK by providing the container element for it
    snsWebSdkInstance.launch('#sumsub-websdk-container');
  }
}
