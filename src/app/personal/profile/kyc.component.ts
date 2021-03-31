import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsCommon, SettingsKycShort, User } from 'src/app/model/generated-models';
import { KycLevelShort } from 'src/app/model/identification.model';
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
  levels: KycLevelShort[] = [];
  settingsCommon: SettingsCommon | null = null;

  constructor(private router: Router, private auth: AuthService, private errorHandler: ErrorService) {
    this.user = auth.user;
    this.settingsCommon = this.auth.getLocalSettingsCommon();
  }

  private launchKycWidget(kycUrl: string, kycFlowName: string): void {
    this.inProgress = true;
    this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
      this.inProgress = false;
      this.launchSumSubWidget(
        kycUrl,
        kycFlowName,
        data.generateWebApiToken,
        this.user?.email as string,
        this.user?.phone as string,
        []);
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnInit(): void {
    const kycData = this.auth.getMyKycSettings();
    if (kycData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else if (this.settingsCommon === null) {
      this.errorMessage = 'Unable to load common settings';
    } else {
      this.inProgress = true;
      kycData.valueChanges.subscribe(({ data }) => {
        const settingsKyc: SettingsKycShort | null = data.getMySettingsKyc;
        if (settingsKyc === null) {
          this.errorMessage = 'Unable to load user identification settings';
        } else {
          this.levels = settingsKyc.levels?.map((val) => new KycLevelShort(val)) as KycLevelShort[];
          this.inProgress = false;
          // const levels = JSON.parse(settingsKyc.levels);
          // if (levels === null) {
          //   this.errorMessage = 'Unable to load user settings';
          // } else {
          //   let flowName = '';
          //   levels.every((x: { levelName: string; flowName: string }) => {
          //     if (x.levelName === 'ewallet-kyc-level') {
          //       flowName = x.flowName;
          //       return;
          //     }
          //   });
          //   if (flowName === '') {
          //     this.errorMessage = 'Unable to load KYC identifier';
          //   } else {
          //       this.launchKycWidget(
          //         this.settingsCommon?.kycBaseAddress as string,
          //         flowName);
          //   }
          // }
        }
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load settings');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  private setKycCompleted(): void {
    const requestData = this.auth.setKycCompleted(this.auth.token);
    if (requestData !== null) {
      requestData.subscribe(({ data }) => {
        // do nothing
      }, (error) => {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to complete validation');
      });
    }
  }

  // @param apiUrl - 'https://test-api.sumsub.com' (sandbox) or 'https://api.sumsub.com' (production)
  // @param flowName - the flow name chosen at Step 1 (e.g. 'basic-kyc')
  // @param accessToken - access token that you generated on the backend in Step 2
  // @param applicantEmail - applicant email (not required)
  // @param applicantPhone - applicant phone, if available (not required)
  // @param customI18nMessages - customized locale messages for current session (not required)
  launchSumSubWidget(apiUrl: string, flowName: string, accessToken: string, applicantEmail: string,
    applicantPhone: string, customI18nMessages: string[]): void {
    const snsWebSdkInstance = snsWebSdk.default.Builder(apiUrl, flowName)
      .withAccessToken(accessToken,
        (newAccessTokenCallback: (newToken: string) => void) => {
          // Access token expired
          // get a new one and pass it to the callback to re-initiate the WebSDK
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
          if (type === 'idCheck.onApplicantSubmitted') {
            this.setKycCompleted();
          }
        },
        // uiConf: {
        //   customCss: "https://url.com/styles.css"
        //   // URL to css file in case you need change it dynamically from the code
        //   // the similar setting at Applicant flow will rewrite customCss
        //   // you may also use to pass string with plain styles `customCssStr:`
        // },
        onError: (error: any) => {
          this.errorMessage = error;
        },
      })
      .build();
    // you are ready to go:
    // just launch the WebSDK by providing the container element for it
    snsWebSdkInstance.launch('#sumsub-websdk-container');
  }
}
