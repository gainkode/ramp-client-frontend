import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonDialogBoxComponent } from 'components/dialogs/common-box.dialog';
import { TwoFaDialogBox } from 'components/dialogs/two-fa-box.dialog';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';
import { PasswordValidator } from 'utils/password.validator';

@Component({
	selector: 'app-profile-change-password',
	templateUrl: './password.component.html',
	styleUrls: [
		'../../../../assets/menu.scss',
		
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss'
	]
})
export class ProfileChangePasswordComponent implements OnDestroy {
    @Input() twoFaRequired = false;
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    private subscriptions: Subscription = new Subscription();

    passwordForm = this.formBuilder.group({
    	currentPassword: [
    		'',
    		{ validators: [Validators.required], updateOn: 'change' },
    	],
    	newPassword: [
    		'',
    		{
    			validators: [
    				Validators.required,
    				Validators.minLength(8),
    				Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
    			], updateOn: 'change'
    		},
    	],
    	confirmPassword: [
    		'',
    		{
    			validators: [
    				Validators.required,
    				Validators.minLength(8),
    				Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
    			], updateOn: 'change'
    		},
    	]
    }, {
    	validators: [
    		PasswordValidator.equalityValidator('newPassword', 'confirmPassword'),
    	],
    	updateOn: 'change',
    });

    get currentPasswordField(): AbstractControl | null {
    	return this.passwordForm.get('currentPassword');
    }

    get newPasswordField(): AbstractControl | null {
    	return this.passwordForm.get('newPassword');
    }

    get confirmPasswordField(): AbstractControl | null {
    	return this.passwordForm.get('confirmPassword');
    }

    passwordErrorMessages: { [key: string]: string; } = {
    	['required']: 'Password is required',
    	['minlength']: 'Password must contain at least 8 symbols',
    	['pattern']: 'Password is not hard enough'
    };

    constructor(
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private profileService: ProfileDataService,
    	private formBuilder: UntypedFormBuilder,
    	private router: Router,
    	public dialog: MatDialog) {
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    private showSuccessMessageDialog(): void {
    	const dialogRef = this.dialog.open(CommonDialogBoxComponent, {
    		width: '400px',
    		data: {
    			title: 'Password change',
    			message: 'Your password has been successfully changed. Please, authenticate using your new password.'
    		}
    	});
    	this.subscriptions.add(
    		dialogRef.afterClosed().subscribe(() => {
    			this.auth.logout();
    			void this.router.navigateByUrl('/personal/auth/login');
    		})
    	);
    }

    private showCodeRequestDialog(): void {
    	const dialogRef = this.dialog.open(TwoFaDialogBox, {
    		width: '414px',
    		data: {
    			title: '',
    			message: 'In order to change you password please enter the 2FA code'
    		}
    	});
    	this.subscriptions.add(
    		dialogRef.afterClosed().subscribe(result => {
    			if (result && result !== '') {
    				this.changePassword(result);
    			}
    		})
    	);
    }

    private changePassword(twoFaCode: string): void {
    	if (this.passwordForm.valid) {
    		this.error.emit('');
    		this.progressChange.emit(true);
    		this.subscriptions.add(
    			this.profileService.changePassword(
    				twoFaCode,
    				this.currentPasswordField?.value,
    				this.newPasswordField?.value
    			).subscribe(({ data }) => {
    				this.progressChange.emit(false);
    				const resultData = data.changePassword as boolean;
    				if (resultData) {
    					this.showSuccessMessageDialog();
    				} else {
    					this.error.emit('Password is not changed');
    				}
    			}, (error) => {
    				this.progressChange.emit(false);
    				this.error.emit(this.errorHandler.getError(error.message, 'Unable to change a password'));
    			})
    		);
    	}
    }

    onSubmit(): void {
    	if (this.twoFaRequired) {
    		this.showCodeRequestDialog();
    	} else {
    		this.changePassword('');
    	}
    }
}
