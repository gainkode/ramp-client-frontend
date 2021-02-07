import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';
import { UserLogin } from '../model/user.model';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    inProgress: boolean = false;
    loginErrorMessage: string = '';
    signupErrorMessage: string = '';
    hideSignInPassword: boolean = true;
    hideSignUp1Password: boolean = true;
    hideSignUp2Password: boolean = true;
    agreementChecked: boolean = false;

    loginForm = this.formBuilder.group({
        email: [, 
            { validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
            ], updateOn: "change" }
        ],
        password: [, 
            { validators: [
                Validators.required, 
                Validators.minLength(8)
            ], updateOn: "change" }
        ]
    });
    signupForm = this.formBuilder.group({
        email: [, 
            { validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
            ], updateOn: "change" }
        ],
        username: [, 
            { validators: [Validators.required], updateOn: "change" }
        ],
        password1: [, 
            { validators: [
                Validators.required, 
                Validators.minLength(8)
            ], updateOn: "change" }
        ],
        password2: [, 
            { validators: [
                Validators.required, 
                Validators.minLength(8)
            ], updateOn: "change" }
        ]
    });

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }
    
    isAuthenticated(): boolean {
        return this.auth.authenticated;
    }

    checkAgreement() {
        this.agreementChecked = !this.agreementChecked;
    }

    passwordsEqual(): boolean {
        let p1 = this.signupForm.get('password1')?.value;
        let p2 = this.signupForm.get('password2')?.value;
        return (p1 == p2);
    }

    onLoginSubmit(): void {
        this.loginErrorMessage = '';
        if (this.loginForm.valid) {
            this.inProgress = true;
            this.auth.authenticate(
                this.loginForm.get('email')?.value,
                this.loginForm.get('password')?.value)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    let userData = data.login as UserLogin;
                    this.auth.setLoginUser(userData);
                },(error) => {
                    this.inProgress = false;
                    this.loginErrorMessage = 'Incorrect login or password';
                    if (!this.auth.registerLoginError()) {
                        this.router.navigateByUrl("/");
                    }
                });
        }
    }

    onSignupSubmit() {
        this.signupErrorMessage = '';
        if (this.signupForm.valid) {
            if (!this.passwordsEqual()) {
                this.signupErrorMessage = 'Passwords are not equal';
                return;
            }
            this.inProgress = true;
        }
    }
}
