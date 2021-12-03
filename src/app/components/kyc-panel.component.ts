import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
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
        this.pTokenSubscription = this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
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
    launchSumSubWidget(
        apiUrl: string,
        flowName: string,
        accessToken: string,
        applicantEmail: string,
        applicantPhone: string,
        customI18nMessages: string[]): void {
        const snsWebSdkInstance = snsWebSdk.default.Builder(apiUrl, flowName).withAccessToken(
            accessToken,
            (newAccessTokenCallback: (newToken: string) => void) => {
                // Access token expired
                // get a new one and pass it to the callback to re-initiate the WebSDK
                this.auth.getKycToken().valueChanges.subscribe(({ data }) => {
                    newAccessTokenCallback(data.generateWebApiToken);
                });
            }
        ).withConf({
            lang: 'en',
            applicantEmail,
            applicantPhone,
            i18n: customI18nMessages,
            onMessage: (type: any, payload: any) => {
                if (type === 'idCheck.onApplicantSubmitted') {
                    if (this.notifyCompleted) {
                        this.completed.emit();
                    } else {
                        this.showSuccessDialog();
                    }
                }
            },
            uiConf: {
              customCss: `${environment.client_host}/assets/sumsub.css`
            },
            onError: (error: any) => {
                this.onError.emit(error.error);
            },
        }).build();
        environment.api_server
        // you are ready to go:
        // just launch the WebSDK by providing the container element for it
        snsWebSdkInstance.launch('#sumsub-websdk-container');
    }
}
