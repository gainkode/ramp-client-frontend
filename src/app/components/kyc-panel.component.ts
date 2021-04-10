import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { CommonDialogBox } from './common-box.dialog';

const snsWebSdk = require('@sumsub/websdk');

@Component({
    selector: 'kyc-panel',
    templateUrl: 'kyc-panel.component.html',
    styleUrls: ['kyc-panel.component.scss']
})
export class KycPanelComponent implements OnInit, OnDestroy {
    @Input() flow: string | null | undefined = '';
    @Input() url: string | null | undefined = '';
    private _tokenSubscription!: any;
    inProgress = false;
    errorMessage = '';

    constructor(private router: Router, public dialog: MatDialog,
        private auth: AuthService, private errorHandler: ErrorService) {

    }

    ngOnInit(): void {
        this.loadSumSub();
    }

    ngOnDestroy(): void {
        const t: Subscription = this._tokenSubscription;
        if (t !== undefined) {
            (this._tokenSubscription as Subscription).unsubscribe();
        }
    }

    showSuccessDialog(): void {
        const dialogRef = this.dialog.open(CommonDialogBox, {
            width: '550px',
            data: {
                title: 'Success',
                message: 'Process of identification sucessfully finished.'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            
        });
    }

    loadSumSub(): void {
        // load sumsub widget
        this.inProgress = true;
        this._tokenSubscription = this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
            this.inProgress = false;
            this.launchSumSubWidget(
                this.url as string,
                this.flow as string,
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
                    if (type === 'idCheck.onApplicantSubmitted') {
                        this.showSuccessDialog();
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
