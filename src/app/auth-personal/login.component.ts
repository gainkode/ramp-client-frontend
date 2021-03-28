import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { SocialUser } from 'angularx-social-login';
import { LoginResult, SettingsCommon } from '../model/generated-models';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    inProgress = false;
    errorMessage = '';
    hidePassword = true;

    loginForm = this.formBuilder.group({
        email: [,
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        password: [,
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8)
                ], updateOn: 'change'
            }
        ]
    });

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder, private router: Router) { }

    googleSignIn(): void {
        this.socialSignIn('Google');
    }

    facebookSignIn(): void {
        this.socialSignIn('Facebook');
    }

    handleSuccessLogin(userData: LoginResult): void {
        const typeCheck = userData.user?.type === 'Personal';
        if (typeCheck) {
            this.auth.setLoginUser(userData);
            this.inProgress = true;
            this.auth.getSettingsCommon().valueChanges.subscribe(settings => {
                const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
                this.auth.setLocalSettingsCommon(settingsCommon);
                this.inProgress = false;
                this.router.navigateByUrl('/personal/');
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load common settings');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        } else {
            this.loginForm.reset();
            this.errorMessage = 'Wrong account type. Try to sign in as a merchant';
        }
    }

    socialSignIn(name: string): void {
        this.inProgress = true;
        this.auth.socialSignIn(name).subscribe((data) => {
            if (data.user !== undefined) {
                const user = data.user as SocialUser;
                let token = '';
                if (name === 'Google') {
                    token = user.idToken;
                } else if (name === 'Facebook') {
                    token = user.authToken;
                }
                this.auth.authenticateSocial(name.toLowerCase(), token).subscribe((loginData) => {
                    const userData = loginData.data.login as LoginResult;
                    this.auth.socialSignOut();
                    this.inProgress = false;
                    if (userData.authTokenAction === 'Default') {
                        this.handleSuccessLogin(userData);
                    } else if (userData.authTokenAction === 'ConfirmName') {
                        this.router.navigateByUrl(`/auth/personal/signup/${userData.authToken}`);
                    } else {
                        this.errorMessage = `Invalid authentication via ${name}`;
                    }
                }, (error) => {
                    this.auth.socialSignOut();
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message,
                        `Invalid authentication via ${name}`);
                });
            } else {
                this.inProgress = false;
            }
        });
    }

    onSubmit(): void {
        this.errorMessage = '';
        if (this.loginForm.valid) {
            this.inProgress = true;
            this.auth.authenticate(
                this.loginForm.get('email')?.value,
                this.loginForm.get('password')?.value)
                .subscribe(({ data }) => {
                    const userData = data.login as LoginResult;
                    if (userData.authTokenAction === 'Default') {
                        this.handleSuccessLogin(userData);
                    } else {
                        this.errorMessage = 'Unable to sign in';
                    }
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message,
                        'Incorrect login or password');
                });
        }
    }
}
