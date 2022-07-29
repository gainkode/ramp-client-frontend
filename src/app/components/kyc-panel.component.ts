import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EnvService } from '../services/env.service';
import { ErrorService } from '../services/error.service';
import { isSumsubVerificationComplete } from '../utils/utils';
import { CommonDialogBox } from './dialogs/common-box.dialog';

const snsWebSdk = require('@sumsub/websdk');

@Component({
    selector: 'app-kyc-panel',
    templateUrl: 'kyc-panel.component.html'
})
export class KycPanelComponent implements OnInit, OnDestroy {
    @Input() flow: string | null | undefined = '';
    @Input() url: string | null | undefined = '';
    @Input() notifyCompleted: boolean | undefined = false;
    @Input() completedWhenVerified: boolean = false;
    @Output() completed = new EventEmitter();
    @Output() onError = new EventEmitter<string>();
    @Output() onAuthError = new EventEmitter();
    @Output() onProgress = new EventEmitter<boolean>();

    private pTokenSubscription: Subscription | undefined = undefined;

    constructor(
        public dialog: MatDialog,
        private auth: AuthService,
        private errorHandler: ErrorService) {

    }

    ngOnInit(): void {
        this.loadSumSub();
    }

    ngOnDestroy(): void {
        this.pTokenSubscription?.unsubscribe();
    }

    showSuccessDialog(): void {
        this.dialog.open(CommonDialogBox, {
            width: '550px',
            data: {
                title: 'Success',
                message: 'Process of identification sucessfully finished.'
            }
        });
    }

    loadSumSub(): void {
        // load sumsub widget
        this.onProgress.emit(true);
        this.pTokenSubscription = this.auth.getKycToken(this.flow ?? '').valueChanges.subscribe(({ data }) => {
            this.onProgress.emit(false);
            this.launchSumSubWidget(
                this.url as string,
                this.flow as string,
                data.generateWebApiToken,
                '',
                '',
                []);
        }, (error) => {
            this.onProgress.emit(false);
            if (this.auth.token !== '') {
                this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load settings'));
            } else {
                this.onAuthError.emit();
            }
        });
    }

    // @param apiUrl - 'https://test-api.sumsub.com' (sandbox) or 'https://api.sumsub.com' (production)
    // @param flowName - the flow name chosen at Step 1 (e.g. 'basic-kyc')
    // @param accessToken - access token that you generated on the backend in Step 2
    // @param applicantEmail - applicant email (not required)
    // @param applicantPhone - applicant phone, if available (not required)
    // @param customI18nMessages - customized locale messages for current session (not required)
    private launchSumSubWidget(
        apiUrl: string,
        flowName: string,
        accessToken: string,
        applicantEmail: string,
        applicantPhone: string,
        customI18nMessages: string[]): void {
        let snsWebSdkBuilder = snsWebSdk.default.init(
            accessToken,
            // token update callback, must return Promise
            // Access token expired
            // get a new one and pass it to the callback to re-initiate the WebSDK
            (newAccessTokenCallback: (newToken: string) => void) => {
                // Access token expired
                // get a new one and pass it to the callback to re-initiate the WebSDK
                this.auth.getKycToken(flowName).valueChanges.subscribe(({ data }) => {
                    newAccessTokenCallback(data.generateWebApiToken);
                });
            }
        ).withConf({
            lang: 'en', //language of WebSDK texts and comments (ISO 639-1 format)
            email: applicantEmail,
            phone: applicantPhone,
            i18n: customI18nMessages,
            uiConf: {
                customCss: `${EnvService.client_host}/assets/sumsub.css`
                // URL to css file in case you need change it dynamically from the code
                // the similar setting at Customizations tab will rewrite customCss
                // you may also use to pass string with plain styles `customCssStr:`
            },
        }).withOptions({
            addViewportTag: false,
            adaptIframeHeight: true
        }).on('idCheck.onApplicantSubmitted', (payload) => {
            console.log('idCheck.onApplicantSubmitted', payload);
            if (!this.completedWhenVerified) {
                this.completeVerification();
            }
        }).on('idCheck.onApplicantResubmitted', (payload) => {
            console.log('idCheck.onApplicantResubmitted', payload);
            if (!this.completedWhenVerified) {
                this.completeVerification();
            }
        }).on('idCheck.applicantStatus', (payload) => {
            console.log('idCheck.applicantStatus', payload);
            if (this.completedWhenVerified && isSumsubVerificationComplete(payload)) {
                this.completeVerification();
            }
        }).on('idCheck.onError', (error) => {
            console.log('idCheck.applicantStatus');
            this.onError.emit(error.error);
        });

        if (EnvService.test_kyc) {
            snsWebSdkBuilder = snsWebSdkBuilder.onTestEnv();
        }
        const snsWebSdkInstance = snsWebSdkBuilder.build();

        snsWebSdkInstance.launch('#sumsub-websdk-container');
    }

    // {
    //     "reviewId": "CbJqo",
    //     "attemptId": "hHMMr",
    //     "attemptCnt": 7,
    //     "elapsedSincePendingMs": 14980,
    //     "elapsedSinceQueuedMs": 44389,
    //     "reprocessing": true,
    //     "levelName": "Identity-verification",
    //     "createDate": "2022-07-29 11:45:51+0000",
    //     "reviewDate": "2022-07-29 11:46:06+0000",
    //     "reviewResult": {
    //         "reviewAnswer": "GREEN"
    //     },
    //     "reviewStatus": "completed",
    //     "priority": 0,
    //     "moderatorNames": null,
    //     "autoChecked": false
    // }

    private completeVerification(): void {
        if (this.notifyCompleted) {
            this.completed.emit();
        } else {
            this.showSuccessDialog();
        }
    }

    testButton(): void {
        this.completeVerification();
    }
}
