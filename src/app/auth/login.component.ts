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
    errorMessage: string = '';
    hideSignInPassword: boolean = true;
    hideSignUp1Password: boolean = true;
    hideSignUp2Password: boolean = true;
    agreementChecked: boolean = false;

    loginForm = this.formBuilder.group({
        login: [, 
            { validators: [Validators.required], updateOn: "change" }
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
            { validators: [Validators.required], updateOn: "change" }
        ],
        login: [, 
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

    onLoginSubmit(): void {
        this.inProgress = true;
        this.errorMessage = '';
        if (this.loginForm.valid) {
            console.log("Valid login data");
            this.auth.authenticate(
                this.loginForm.get('login')?.value,
                this.loginForm.get('password')?.value)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    this.auth.setLoginUser(data.login as UserLogin);
                    console.log('Success login');
                },(error) => {
                    this.inProgress = false;
                    this.errorMessage = 'Incorrect login or password';
                    if (!this.auth.registerLoginError()) {
                        this.router.navigateByUrl("/");
                    }
                });
        }
    }
}
