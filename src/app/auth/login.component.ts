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
    hidePassword: boolean = true;

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

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }

    onLoginSubmit(): void {
        this.errorMessage = '';
        if (this.loginForm.valid) {
            this.inProgress = true;
            this.auth.authenticate(
                this.loginForm.get('email')?.value,
                this.loginForm.get('password')?.value)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    let userData = data.login as UserLogin;
                    this.auth.setLoginUser(userData);
                    if (userData.user?.userType == 'Merchant') {
                        this.router.navigateByUrl("/merchant/");
                    } else {
                        this.router.navigateByUrl("/customer/");
                    }
                },(error) => {
                    this.inProgress = false;
                    this.errorMessage = 'Incorrect login or password';
                });
        }
    }
}
