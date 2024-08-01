/* eslint-disable no-console */
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { EnvService } from 'services/env.service';
import { isSumsubVerificationComplete } from 'utils/utils';

const snsWebSdk = require('@sumsub/websdk');

@Component({
	selector: 'app-sumsub-panel',
	templateUrl: 'sumsub-panel.component.html',
	styleUrls: ['./sumsub-panel.component.scss'],
})
export class SumsubPanelComponent implements OnInit, OnDestroy {
    @Input() flow = '';
    @Input() token = '';
    @Input() completedWhenVerified = false;
    @Input() widgetId: string | undefined = undefined;
    @Output() completed = new EventEmitter();
    @Output() onReject = new EventEmitter();
    @Output() onError = new EventEmitter<string>();

    private pTokenSubscription: Subscription | undefined = undefined;

    constructor(
    	public dialog: MatDialog,
    	private auth: AuthService) {
    }

    ngOnInit(): void {
    	this.launchSumSubWidget(this.flow, this.token, '', '', []);
    }

    ngOnDestroy(): void {
    	this.pTokenSubscription?.unsubscribe();
    }

    // @param flowName - the flow name chosen at Step 1 (e.g. 'basic-kyc')
    // @param accessToken - access token that you generated on the backend in Step 2
    // @param applicantEmail - applicant email (not required)
    // @param applicantPhone - applicant phone, if available (not required)
    // @param customI18nMessages - customized locale messages for current session (not required)
    private launchSumSubWidget(
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
    			this.auth.getKycToken(flowName, this.widgetId).valueChanges.subscribe(({ data }) => {
    				newAccessTokenCallback(data.generateWebApiToken);
    			});
    		}
    	).withConf({
    		lang: 'en', //language of WebSDK texts and comments (ISO 639-1 format)
    		email: applicantEmail,
    		phone: applicantPhone,
    		i18n: customI18nMessages,
				theme: 'light',
    	}).withOptions({
    		addViewportTag: false,
    		adaptIframeHeight: true
    	}).on('idCheck.onApplicantSubmitted', (payload) => {
    		console.log('idCheck.onApplicantSubmitted', payload);
    		if (!this.completedWhenVerified) {
    			this.completed.emit();
    		}
    	}).on('idCheck.onApplicantResubmitted', (payload) => {
    		console.log('idCheck.onApplicantResubmitted', payload);
    		if (!this.completedWhenVerified) {
    			this.completed.emit();
    		}
    	}).on('idCheck.onApplicantStatusChanged', (payload) => {
    		console.log('idCheck.onApplicantStatusChanged', this.completedWhenVerified, payload);
    		const sumsubResult = isSumsubVerificationComplete(payload);

    		if (this.completedWhenVerified && sumsubResult.result) {
    			this.completed.emit();
    		} else {
    			if(sumsubResult.answer === 'red'){
    				this.onReject.emit();
    			}
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
}
