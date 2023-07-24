import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBox } from 'components/dialogs/common-box.dialog';
import { KycProvider } from 'model/generated-models';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';

@Component({
	selector: 'app-kyc-panel',
	templateUrl: 'kyc-panel.component.html',
	styleUrls: ['kyc-panel.component.scss']
})
export class KycPanelComponent implements OnInit, OnDestroy {
    @Input() flow = '';
    @Input() notifyCompleted: boolean | undefined = false;
    @Input() completedWhenVerified = false;
    @Input() widgetId: string | undefined = undefined;
    @Output() completed = new EventEmitter();
    @Output() onError = new EventEmitter<string>();
    @Output() onReject = new EventEmitter();
    @Output() onAuthError = new EventEmitter();
    @Output() onProgress = new EventEmitter<boolean>();

    private pTokenSubscription: Subscription | undefined = undefined;

    showSumsub = false;
    showShufti = false;
    showAutentix = false;
    token = '';
    url = '';

    constructor(
    	public dialog: MatDialog,
    	private auth: AuthService,
    	private errorHandler: ErrorService) {
    }

    ngOnInit(): void {
    	this.loadKycWidget();
    }

    ngOnDestroy(): void {
    	this.pTokenSubscription?.unsubscribe();
    }

    private showSuccessDialog(): void {
    	this.dialog.open(CommonDialogBox, {
    		width: '550px',
    		data: {
    			title: 'Success',
    			message: 'Process of identification sucessfully finished.'
    		}
    	});
    }

    loadKycWidget(): void {
    	// load sumsub widget
    	this.onProgress.emit(true);
    	this.pTokenSubscription = this.auth.getKycToken(this.flow ?? '', this.widgetId).valueChanges.subscribe(({ data }) => {
    		this.onProgress.emit(false);
    		if (this.auth.user?.kycProvider === KycProvider.SumSub) {
    			this.showSumsub = true;
    			this.token = data.generateWebApiToken;
    		} else if (this.auth.user?.kycProvider === KycProvider.Shufti) {
    			this.showShufti = true;
    			this.url = data.generateWebApiToken;
    		}  else if (this.auth.user?.kycProvider === KycProvider.Au10tix) {
    			this.showAutentix = true;
    			this.url = data.generateWebApiToken;
    		}
    	}, (error) => {
    		this.onProgress.emit(false);
    		if (this.auth.token !== '') {
    			this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load settings'));
    		} else {
    			this.onAuthError.emit();
    		}
    	});
    }

    completeVerification(): void {
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
