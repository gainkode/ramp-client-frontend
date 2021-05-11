import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { SocialUser } from 'angularx-social-login';
import { LoginResult, UserMode } from '../model/generated-models';

@Component({
    selector: 'app-login-panel',
    templateUrl: 'login-panel.component.html',
    styleUrls: ['./login-panel.component.scss']
})
export class LoginPanelComponent implements OnInit {
    @Input() userName: string | undefined = '';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() authenticated = new EventEmitter<LoginResult>();
    @Output() socialAuthenticated = new EventEmitter<LoginResult>();
    hidePassword = true;

    loginForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        password: ['',
            {
                validators: [Validators.required, Validators.minLength(8)], updateOn: 'change'
            }
        ]
    });

    constructor(private auth: AuthService, private errorHandler: ErrorService,
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
                    this.progressChange.emit(false);
                    console.log(userData.user?.mode);
                    if (userData.user?.mode === UserMode.InternalWallet) {
                        this.socialAuthenticated.emit(userData);
                    } else {
                        this.error.emit(`Unable to authorise with the login "${user.email}". Please sign up`);
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
        if (this.loginForm.valid) {
            this.progressChange.emit(true);
            this.error.emit('');
            const login = this.loginForm.get('email')?.value;
            this.auth.authenticate(login, this.loginForm.get('password')?.value).subscribe(({ data }) => {
                const userData = data.login as LoginResult;
                this.progressChange.emit(false);
                if (userData.user?.mode === UserMode.InternalWallet) {
                    this.authenticated.emit(userData);
                } else {
                    this.error.emit(`Unable to authorise with the login "${login}". Please sign up`);
                }
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Incorrect login or password'));
            });
        }
    }
}
