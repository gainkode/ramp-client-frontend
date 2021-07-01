import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { LoginResult, TwoFactorAuthenticationResult } from '../model/generated-models';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

@Component({
    selector: 'app-two-fa-code',
    templateUrl: 'two-fa-code.component.html',
    styleUrls: ['two-fa-code.component.scss']
})
export class TwoFaCodeComponent {
    @Input() set activated(val: boolean) {
        console.log('activated', val);
        this.twoFaEnabled = val;
        this.setButtonTitle();
        if (!this.twoFaEnabled) {
            this.generateCode();
        }
    }
    @Output() twoFaUpdated = new EventEmitter<void>();
    @ViewChild("codeform") private ngCodeForm: NgForm | undefined = undefined;

    GA_APP_STORE_URL = 'https://apps.apple.com/us/app/google-authenticator/id388497605';
    GA_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en';
    inProgress = false;
    errorMessage = '';
    buttonTitle = '';
    twoFaEnabled = false;
    qr = '';
    symbols = '';

    codeForm = this.formBuilder.group({
        code: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder) {
    }

    private generateCode() {
        this.errorMessage = '';
        this.inProgress = true;
        this.auth.generate2FaCode().subscribe(({ data }) => {
            this.inProgress = false;
            const resultData = data.generate2faCode as TwoFactorAuthenticationResult;
            this.symbols = resultData.code;
            this.qr = resultData.otpauthUrl;
            this.setButtonTitle();
        }, (error) => {
            this.inProgress = false;
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to generate a code');
        });
    }

    private setButtonTitle(): void {
        this.buttonTitle = (this.twoFaEnabled) ? 'DISABLE' : 'ENABLE';
    }

    private resetForm(): void {
        this.codeForm.reset();
        this.ngCodeForm?.resetForm();
    }

    private enable2Fa(code: string): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.auth.enable2Fa(code).subscribe(({ data }) => {
            this.inProgress = false;
            const resultData = data.enable2fa as LoginResult;
            console.log(resultData);
            console.log(resultData.user);
            if (resultData.user?.is2faEnabled) {
                this.resetForm();
                this.activated = true;
                // inform a parent
                this.twoFaUpdated.emit();
            }
        }, (error) => {
            this.inProgress = false;
            const err = this.errorHandler.getCurrentError();
            if (err === 'auth.access_denied') {
                this.errorMessage = 'Incorrect confirmation code';
            } else {
                this.errorMessage = this.errorHandler.getError(
                    error.message,
                    'Unable to activate Two Factor Authentication'
                );
            }
        });
    }

    private disable2Fa(code: string): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.auth.disable2Fa(code).subscribe(({ data }) => {
            this.inProgress = false;
            const resultData = data.disable2fa as LoginResult;
            if (resultData.user?.is2faEnabled === false) {
                this.resetForm();
                this.activated = false;
                this.qr = '';
                // inform a parent
                this.twoFaUpdated.emit();
            }
        }, (error) => {
            this.inProgress = false;
            const err = this.errorHandler.getCurrentError();
            if (err === 'auth.access_denied') {
                this.errorMessage = 'Incorrect confirmation code';
            } else {
                this.errorMessage = this.errorHandler.getError(
                    error.message,
                    'Unable to deactivate Two Factor Authentication'
                );
            }
        });
    }

    onSubmit() {
        if (this.codeForm.valid) {
            if (this.twoFaEnabled) {
                this.disable2Fa(this.codeForm.get('code')?.value);
            } else {
                this.enable2Fa(this.codeForm.get('code')?.value);
            }
        }
    }
}
