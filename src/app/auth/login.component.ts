import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';
import { SocialUser } from "angularx-social-login";
import { LoginResult } from '../model/generated-models';

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
                    Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
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

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }

    googleSignIn(): void {
        this.socialSignIn('Google');
    }

    facebookSignIn(): void {
        this.socialSignIn('Facebook');
    }

    socialSignIn(name: string): void {
        this.inProgress = true;
        this.auth.socialSignIn(name).subscribe((data) => {
            if (data.user !== undefined) {
                const user = data.user as SocialUser;
                this.auth.authenticateSocial(
                    name.toLowerCase(),
                    user.authToken)
                    .subscribe(({ data }) => {
                        this.inProgress = false;
                        const userData = data.login as LoginResult;
                        this.auth.setLoginUser(userData);
                        this.loginForm.reset();
                        if (userData.user?.type === 'Merchant') {
                            this.router.navigateByUrl('/merchant/');
                        } else {
                            this.router.navigateByUrl('/personal/');
                        }
                    }, (error) => {
                        this.inProgress = false;
                        this.errorMessage = `Invalid authentication via ${name}`;
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
                    this.inProgress = false;
                    const userData = data.login as LoginResult;
                    this.auth.setLoginUser(userData);
                    this.loginForm.reset();
                    if (userData.user?.type === 'Merchant') {
                        this.router.navigateByUrl('/merchant/');
                    } else {
                        this.router.navigateByUrl('/personal/');
                    }
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = 'Incorrect login or password';
                });
        }
    }
}
