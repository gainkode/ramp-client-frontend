import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SocialUser } from 'angularx-social-login';
import { LoginResult, UserMode } from '../../model/generated-models';
import { SignupInfoPanelComponent } from './signup-info.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBox } from '../dialogs/common-box.dialog';

@Component({
    selector: 'app-login-panel',
    templateUrl: 'login-panel.component.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/auth.scss']
})
export class LoginPanelComponent implements OnInit, OnDestroy {
    @Input() set userName(val: string) {
        this.userMail = val;
        this.emailField?.setValue(this.userMail);
    }
    @Input() userTypeSection = 'personal';
    @Input() socialButtons: boolean = false;
    @Input() wizardButtons: boolean = false;
    @Input() errorMessage = '';
    @Input() widgetId = '';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() authenticated = new EventEmitter<LoginResult>();
    @Output() socialAuthenticated = new EventEmitter<LoginResult>();
    @Output() extraDataVisible = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();

    private signupInfoPanel!: SignupInfoPanelComponent;
    @ViewChild('signupInfo') set signupInfo(panel: SignupInfoPanelComponent) {
        if (panel) {
            this.signupInfoPanel = panel;
            panel.init();
        }
    }

    twoFa = false;
    extraData = false;
    private socialLogin = false;
    private userMail = '';
    private subscriptions: Subscription = new Subscription();

    loginForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        password: ['', { validators: [Validators.required, Validators.minLength(8)], updateOn: 'change' }]
    });
    twoFaForm = this.formBuilder.group({
        code: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    emailErrorMessages: { [key: string]: string; } = {
        ['pattern']: 'Email is not valid',
        ['required']: 'Email is required'
    };
    passwordErrorMessages: { [key: string]: string; } = {
        ['required']: 'Password is required',
        ['minlength']: 'Password must contain at least 8 symbols'
    };
    twoFaErrorMessages: { [key: string]: string; } = {
        ['required']: 'Please specify the code from Google Authenticator or similar app'
    };

    constructor(
        public dialog: MatDialog,
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.emailField?.setValue(this.userMail);
        this.loginForm.updateValueAndValidity();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get emailField(): AbstractControl | null {
        return this.loginForm.get('email');
    }

    get passwordField(): AbstractControl | null {
        return this.loginForm.get('password');
    }

    googleSignIn(): void {
        this.socialSignIn('Google');
    }

    facebookSignIn(): void {
        this.socialSignIn('Facebook');
    }

    showSignupPanel(userData: LoginResult): void {
        this.auth.setLoginUser(userData);
        const signupPanelReady = (this.signupInfoPanel) ? true : false;
        this.extraData = true;
        this.twoFa = false;
        this.extraDataVisible.emit(this.extraData);
        if (signupPanelReady) {
            this.signupInfoPanel.init();
        }
    }

    socialSignIn(providerName: string): void {
        this.progressChange.emit(true);
        this.registerError('');
        this.subscriptions.add(
            this.auth.socialSignIn(providerName).subscribe((data) => {
                if (data.user !== undefined) {
                    const user = data.user as SocialUser;
                    let token = '';
                    if (providerName === 'Google') {
                        token = user.idToken;
                    } else if (providerName === 'Facebook') {
                        token = user.authToken;
                    }
                    this.auth.socialSignOut();
                    try {
                        this.subscriptions.add(
                            this.auth.authenticateSocial(providerName.toLowerCase(), token).subscribe((loginData) => {
                                const userData = loginData.data.login as LoginResult;
                                this.progressChange.emit(false);
                                if (userData.user?.mode === UserMode.InternalWallet) {
                                    if (userData.authTokenAction === 'TwoFactorAuth') {
                                        this.auth.setLoginUser(userData);
                                        this.twoFa = true;
                                        this.socialLogin = true;
                                    } else if (userData.authTokenAction === 'UserInfoRequired') {
                                        this.showSignupPanel(userData);
                                    } else {
                                        this.socialAuthenticated.emit(userData);
                                    }
                                } else {
                                    this.registerError(`Unable to authorise with the login '${user.email}'. Please sign up`);
                                }
                            }, (error) => {
                                this.progressChange.emit(false);
                                this.registerError(this.errorHandler.getError(error.message, `Invalid authentication via ${providerName}`));
                            })
                        );
                    } catch (e) {
                        this.progressChange.emit(false);
                        this.registerError(e as string);
                    }
                } else {
                    this.progressChange.emit(false);
                }
            }, (error) => {
                this.progressChange.emit(false);
                this.registerError(this.errorHandler.getError(error.message, `Unable to authenticate using ${providerName}`));
            })
        );
    }

    onSubmit(): void {
        this.registerError('');
        if (this.loginForm.valid) {
            const login = this.emailField?.value;
            try {
                const loginData = this.auth.authenticate(this.widgetId !== '', login, this.passwordField?.value, false, (this.widgetId !== '') ? this.widgetId : undefined);
                this.progressChange.emit(true);
                this.subscriptions.add(
                    loginData.subscribe(({ data }) => {
                        const userData = data.login as LoginResult;
                        this.progressChange.emit(false);
                        if (userData.user?.mode === UserMode.InternalWallet) {
                            if (userData.authTokenAction === 'TwoFactorAuth') {
                                this.auth.setLoginUser(userData);
                                this.twoFa = true;
                                this.socialLogin = true;
                            } else if (userData.authTokenAction === 'UserInfoRequired') {
                                this.showSignupPanel(userData);
                            } else {
                                this.authenticated.emit(userData);
                            }
                        } else {
                            this.registerError(`Unable to authorise with the login '${login}'. Please sign up`);
                        }
                    }, (error) => {
                        this.progressChange.emit(false);
                        const errorMessage = this.errorHandler.getError(error.message, 'Incorrect login or password');
                        if (this.errorHandler.getCurrentError().toLowerCase() === 'auth.password_has_to_be_changed') {
                            this.dialog.open(CommonDialogBox, {
                                width: '400px',
                                data: {
                                    title: errorMessage,
                                    message: 'Your password has to be changed. Use the link we have sent to your email address to reset your password.'
                                }
                            });
                        }
                        this.registerError(errorMessage);
                    })
                );
            } catch (e) {
                this.registerError(e as string);
            }
        }
    }

    onTwoFaSubmit(): void {
        if (this.twoFaForm.valid) {
            this.progressChange.emit(true);
            this.registerError('');
            const code = this.twoFaForm.get('code')?.value;
            this.subscriptions.add(
                this.auth.verify2Fa(code).subscribe(({ data }) => {
                    const userData = data.verify2faCode as LoginResult;
                    if (userData.user?.mode === UserMode.InternalWallet) {
                        if (userData.authTokenAction === 'UserInfoRequired') {
                            this.showSignupPanel(userData);
                        } else {
                            this.progressChange.emit(false);
                            if (this.socialLogin) {
                                this.socialAuthenticated.emit(userData);
                            } else {
                                this.authenticated.emit(userData);
                            }
                        }
                    } else {
                        this.progressChange.emit(false);
                        this.error.emit('Unable to authorise. Please sign up');
                    }
                }, (error) => {
                    this.progressChange.emit(false);
                    this.registerError(this.errorHandler.getError(error.message, 'Incorrect login or password'));
                })
            );
        }
    }

    registerError(error: string): void {
        this.error.emit(error);
    }

    onSignupProgress(visible: boolean): void {
        this.progressChange.emit(visible);
    }

    onSignupDone(userData: LoginResult): void {
        if (!userData.authTokenAction ||
            userData.authTokenAction === 'Default' ||
            userData.authTokenAction === 'KycRequired') {
            if (this.socialLogin) {
                this.socialAuthenticated.emit(userData);
            } else {
                this.authenticated.emit(userData);
            }
        } else {
            console.error('onSignupDone. Wrong token action:', userData.authTokenAction);
            this.registerError('Unable to update personal data');
        }
    }
}
