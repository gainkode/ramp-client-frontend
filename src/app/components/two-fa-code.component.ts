import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
        this.twoFaEnabled = val;
        this.setButtonTitle();
        if (!this.twoFaEnabled) {
            this.generateCode();
        }
    }

    GA_APP_STORE_URL = 'https://apps.apple.com/us/app/google-authenticator/id388497605';
    GA_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en';
    inProgress = false;
    errorMessage = '';
    buttonTitle = '';
    twoFaEnabled = false;
    qr = '';

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
            this.qr = resultData.code;
            this.setButtonTitle();
        },
            (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(
                    error.message,
                    'Unable to generate a code'
                );
            }
        );
    }

    private setButtonTitle(): void {
        this.buttonTitle = (this.twoFaEnabled) ? 'DISABLE' : 'ENABLE';
    }

    private enable2Fa(code: string): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.auth.enable2Fa(code).subscribe(({ data }) => {
            this.inProgress = false;
            const resultData = data.enable2Fa as LoginResult;
            if (resultData.user?.is2faEnabled) {
                // inform a parent
            }
        }, (error) => {
            this.inProgress = false;
            this.errorMessage = this.errorHandler.getError(
                error.message,
                'Unable to enable Two Factor Authentication'
            );
        });
    }

    private disable2Fa(code: string): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.auth.disable2Fa(code).subscribe(({ data }) => {
            this.inProgress = false;
            const resultData = data.enable2Fa as LoginResult;
            if (resultData.user?.is2faEnabled === false) {
                // inform a parent
            }
        }, (error) => {
            this.inProgress = false;
            this.errorMessage = this.errorHandler.getError(
                error.message,
                'Unable to disable Two Factor Authentication'
            );
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
