import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';
import { UserLogin } from '../model/user.model';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['./login.component.scss']
})
export class RegisterComponent {
    inProgress: boolean = false;
    errorMessage: string = '';
    hidePassword1: boolean = true;
    hidePassword2: boolean = true;
    agreementChecked: boolean = false;

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
        userType: ['User'],
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
    
    checkAgreement() {
        this.agreementChecked = !this.agreementChecked;
    }

    passwordsEqual(): boolean {
        let p1 = this.signupForm.get('password1')?.value;
        let p2 = this.signupForm.get('password2')?.value;
        return (p1 == p2);
    }

    onSignupSubmit() {
        this.errorMessage = '';
        if (this.signupForm.valid) {
            if (!this.passwordsEqual()) {
                this.errorMessage = 'Passwords are not equal';
                return;
            }
            this.inProgress = true;
        }
    }
}
