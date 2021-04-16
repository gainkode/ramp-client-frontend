import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { SocialUser } from 'angularx-social-login';
import { LoginResult } from '../model/generated-models';

@Component({
    selector: 'app-login-panel',
    templateUrl: 'login-panel.component.html',
    styleUrls: ['./login-panel.component.scss']
})
export class LoginPanelComponent {
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
        private formBuilder: FormBuilder, private router: Router) { }

    googleSignIn(): void {
        this.socialSignIn('Google');
    }

    facebookSignIn(): void {
        this.socialSignIn('Facebook');
    }

    socialSignIn(name: string): void {
        this.progressChange.emit(true);
        this.error.emit('');
        this.auth.socialSignIn(name).subscribe((data) => {
            if (data.user !== undefined) {
                const user = data.user as SocialUser;
                let token = '';
                if (name === 'Google') {
                    token = user.idToken;
                } else if (name === 'Facebook') {
                    token = user.authToken;
                }
                this.auth.socialSignOut();
                this.auth.authenticateSocial(name.toLowerCase(), token).subscribe((loginData) => {
                    const userData = loginData.data.login as LoginResult;
                    this.progressChange.emit(false);
                    this.socialAuthenticated.emit(userData);
                }, (error) => {
                    this.progressChange.emit(false);
                    this.error.emit(this.errorHandler.getError(error.message, `Invalid authentication via ${name}`));
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
            this.auth.authenticate(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value).subscribe(({ data }) => {
                const userData = data.login as LoginResult;
                this.progressChange.emit(false);
                this.authenticated.emit(userData);
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Incorrect login or password'));
            });
        }
    }
}
