import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonDialogBoxComponent } from 'components/dialogs/common-box.dialog';
import { TwoFaDialogBox } from 'components/dialogs/two-fa-box.dialog';
import { TwoFaDialogWizard } from 'components/dialogs/two-fa-wizard.dialog';
import { LoginResult, TwoFactorAuthenticationResult, User } from 'model/generated-models';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-profile-security-settings',
	templateUrl: './security.component.html',
	styleUrls: [
		'../../../../assets/menu.scss',
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss'
	]
})
export class ProfileSecuriySettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    twoFaActive = false;
    passwordCanBeChanged = false;
    user!: User;

    private subscriptions: Subscription = new Subscription();
    private autoLoading = false;

    twoFaForm = this.formBuilder.group({
    	switch: [false]
    });

    get twoFaField(): AbstractControl | null {
    	return this.twoFaForm.get('switch');
    }

    constructor(
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private profileService: ProfileDataService,
    	private formBuilder: UntypedFormBuilder,
    	private router: Router,
    	public dialog: MatDialog) {
    }

    ngOnInit(): void {
    	this.subscriptions.add(
    		this.twoFaField?.valueChanges.subscribe(() => {
    			if (!this.autoLoading) {
    				if (this.twoFaActive) {
    					// swtich off
    					this.showCodeRequestDialog();
    				} else {
    					// switch on
    					this.generateCode();
    				}
    			}
    			this.autoLoading = false;
    		}));
    	this.loadAccountData();
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    private show2FaWizard(qr: string, symbols: string): void {
    	const dialogRef = this.dialog.open(TwoFaDialogWizard, {
    		width: '900px',
    		data: {
    			title: symbols,
    			message: qr
    		}
    	});
    	this.subscriptions.add(
    		dialogRef.afterClosed().subscribe(code => {
    			if (code && code !== '') {
    				this.enable2Fa(code);
    			} else {
    				this.autoLoading = true;
    				this.twoFaField?.setValue(this.twoFaActive);
    			}
    		})
    	);
    }

    private showSuccess(): void {
    	this.dialog.open(CommonDialogBoxComponent, {
    		width: '900px',
    		data: {
    			title: '',
    			message: 'Congratulations. You have successfully set Google Authenticator.',
    			button: 'Close'
    		}
    	});
    }

    private showCodeRequestDialog(): void {
    	const dialogRef = this.dialog.open(TwoFaDialogBox, {
    		width: '414px',
    		data: {
    			message: 'In order to switch off 2FA please type the code'
    		}
    	});
    	this.subscriptions.add(
    		dialogRef.afterClosed().subscribe(code => {
    			if (code && code !== '') {
    				this.disable2Fa(code);
    			} else {
    				this.autoLoading = true;
    				this.twoFaField?.setValue(this.twoFaActive);
    			}
    		})
    	);
    }

    private generateCode(): void {
    	this.error.emit('');
    	this.progressChange.emit(true);
    	this.subscriptions.add(
    		this.auth.generate2FaCode().subscribe(({ data }) => {
    			this.progressChange.emit(false);
    			const resultData = data.generate2faCode as TwoFactorAuthenticationResult;
    			this.show2FaWizard(resultData.otpauthUrl, resultData.code);
    		}, (error) => {
    			this.progressChange.emit(false);
    			this.error.emit(this.errorHandler.getError(error.message, 'Unable to generate a code'));
    		})
    	);
    }

    private loadAccountData(): void {
    	this.error.emit('');
    	this.progressChange.emit(true);
    	const meQuery$ = this.profileService.getProfileData().valueChanges.pipe(take(1));
    	this.subscriptions.add(
    		meQuery$.subscribe(({ data }) => {
    			if (data) {
    				const userData = data.me as User;
    				if (userData) {
    					this.user = userData;
    					this.passwordCanBeChanged = this.user.hasEmailAuth as boolean;
    					this.twoFaActive = this.user.is2faEnabled as boolean;
    					this.autoLoading = true;
    					this.twoFaField?.setValue(this.twoFaActive);
    				}
    			} else {
    				this.router.navigateByUrl('/');
    			}
    			this.progressChange.emit(false);
    		}, (error) => {
    			this.progressChange.emit(false);
    			if (this.auth.token !== '') {
    				this.error.emit(this.errorHandler.getError(error.message, 'Unable to load user data'));
    			} else {
    				this.router.navigateByUrl('/');
    			}
    		})
    	);
    }

    private enable2Fa(code: string): void {
    	this.error.emit('');
    	this.progressChange.emit(true);
    	this.subscriptions.add(
    		this.auth.enable2Fa(code).subscribe(({ data }) => {
    			this.progressChange.emit(false);
    			const resultData = data.enable2fa as LoginResult;
    			const success = resultData.user?.is2faEnabled ?? false;
    			this.twoFaActive = success;
    			this.autoLoading = true;
    			this.twoFaField?.setValue(success);
    			this.showSuccess();
    		}, (error) => {
    			this.progressChange.emit(false);
    			this.autoLoading = true;
    			this.twoFaField?.setValue(false);
    			const err = this.errorHandler.getCurrentError();
    			if (err === 'auth.access_denied') {
    				this.error.emit('Incorrect confirmation code');
    			} else {
    				this.error.emit(this.errorHandler.getError(error.message, 'Unable to activate Two Factor Authentication'));
    			}
    		})
    	);
    }

    private disable2Fa(code: string): void {
    	this.error.emit('');
    	this.progressChange.emit(true);
    	this.subscriptions.add(
    		this.auth.disable2Fa(code).subscribe(({ data }) => {
    			this.progressChange.emit(false);
    			const resultData = data.disable2fa as LoginResult;
    			const failed = resultData.user?.is2faEnabled ?? true;
    			this.twoFaActive = failed;
    			this.autoLoading = true;
    			this.twoFaField?.setValue(failed);
    		}, (error) => {
    			this.progressChange.emit(false);
    			this.autoLoading = true;
    			this.twoFaField?.setValue(true);
    			const err = this.errorHandler.getCurrentError();
    			if (err === 'auth.access_denied') {
    				this.error.emit('Incorrect confirmation code');
    			} else {
    				this.error.emit(this.errorHandler.getError(error.message, 'Unable to deactivate Two Factor Authentication'));
    			}
    		})
    	);
    }
}
