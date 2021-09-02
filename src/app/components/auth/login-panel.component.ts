import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { SocialUser } from 'angularx-social-login';
import { LoginResult, UserMode } from '../../model/generated-models';
import { SignupInfoPanelComponent } from './signup-info.component';

@Component({
    selector: 'app-login-panel',
    templateUrl: 'login-panel.component.html'
})
export class LoginPanelComponent implements OnInit {
    @Input() userName: string | undefined = '';
    @Input() socialButtons: boolean = false;
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() authenticated = new EventEmitter<LoginResult>();
    @Output() socialAuthenticated = new EventEmitter<LoginResult>();
    @Output() extraDataVisible = new EventEmitter<boolean>();

    private signupInfoPanel!: SignupInfoPanelComponent;
    @ViewChild('signupInfo') set signupInfo(panel: SignupInfoPanelComponent) {
        if (panel) {
            this.signupInfoPanel = panel;
            panel.init();
        }
    }

    hidePassword = true;
    twoFa = false;
    extraData = false;
    private socialLogin = false;

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

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.loginForm.get('email')?.setValue((this.userName) ? this.userName : '');
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
        this.error.emit('');
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
                this.auth.authenticateSocial(providerName.toLowerCase(), token).subscribe((loginData) => {
                    const userData = loginData.data.login as LoginResult;
                    if (userData.user?.mode === UserMode.InternalWallet) {
                        if (userData.authTokenAction === 'TwoFactorAuth') {
                            this.auth.setLoginUser(userData);
                            this.twoFa = true;
                            this.socialLogin = true;
                            this.progressChange.emit(false);
                        } else if (userData.authTokenAction === 'UserInfoRequired') {
                            this.showSignupPanel(userData);
                        } else {
                            this.progressChange.emit(false);
                            this.socialAuthenticated.emit(userData);
                        }
                    } else {
                        this.error.emit(`Unable to authorise with the login '${user.email}'. Please sign up`);
                    }
                }, (error) => {
                    this.progressChange.emit(false);
                    this.error.emit(this.errorHandler.getError(error.message, `Invalid authentication via ${providerName}`));
                });
            } else {
                this.progressChange.emit(false);
            }
        });
    }

    onSubmit(): void {
        this.error.emit('');
        if (this.loginForm.valid) {
            this.progressChange.emit(true);
            const login = this.loginForm.get('email')?.value;
            this.auth.authenticate(login, this.loginForm.get('password')?.value).subscribe(({ data }) => {
                const userData = data.login as LoginResult;
                if (userData.user?.mode === UserMode.InternalWallet) {
                    if (userData.authTokenAction === 'TwoFactorAuth') {
                        this.auth.setLoginUser(userData);
                        this.twoFa = true;
                        this.socialLogin = true;
                        this.progressChange.emit(false);
                    } else if (userData.authTokenAction === 'UserInfoRequired') {
                        this.showSignupPanel(userData);
                    } else {
                        this.progressChange.emit(false);
                        this.authenticated.emit(userData);
                    }
                } else {
                    this.error.emit(`Unable to authorise with the login '${login}'. Please sign up`);
                }
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Incorrect login or password'));
            });
        }
    }

    onTwoFaSubmit(): void {
        if (this.twoFaForm.valid) {
            this.progressChange.emit(true);
            this.error.emit('');
            const code = this.twoFaForm.get('code')?.value;
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
                this.error.emit(this.errorHandler.getError(error.message, 'Incorrect login or password'));
            });
        }
    }

    onSignupError(error: string): void {
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
            console.log('onSignupDone. Wrong token action:', userData.authTokenAction);
            this.error.emit('Unable to update personal data');
        }
    }
}
