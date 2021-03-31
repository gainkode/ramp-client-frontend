import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KycLevelShort } from '../model/identification.model';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

const snsWebSdk = require('@sumsub/websdk');

@Component({
    selector: 'kyc-panel',
    templateUrl: 'kyc-panel.component.html',
    styleUrls: ['kyc-panel.component.scss']
})
export class KycPanelComponent implements OnInit {
    @Input() level: KycLevelShort | null = null;
    @Input() url: string | null | undefined = '';
    inProgress = false;
    errorMessage = '';
    description = '';

    constructor(private router: Router, private auth: AuthService, private errorHandler: ErrorService) {

    }

    ngOnInit(): void {
        // load description value here because html cannot apply linebreak pipe to the type string | undefined
        this.description = this.level?.description as string;
        // load sumsub widget
        this.inProgress = true;
        this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
            this.inProgress = false;
            this.launchSumSubWidget(
                this.url as string,
                this.level?.flowData?.value as string,
                data.generateWebApiToken,
                '',
                '',
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
                        //this.setKycCompleted();
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
