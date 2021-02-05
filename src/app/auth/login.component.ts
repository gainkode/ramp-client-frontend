import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent {
    login: string | null = null;
    password: string | null = null;
    hideSignInPassword: boolean = true;
    hideSignUp1Password: boolean = true;
    hideSignUp2Password: boolean = true;
    agreementChecked: boolean = false;
    wrongPasswordCounter: number = 0;

    loginControl = new FormControl('', [Validators.required, Validators.maxLength(30)]);

    constructor(private auth: AuthService, private router: Router) {
        this.login = "abcd";
    }
    
    isAuthenticated(): boolean {
        return this.auth.authenticated;
    }

    getErrorMessage() {
        if (this.loginControl.hasError('required')) {
            return 'Please specify your login';
        }
        return '';
      }

    checkAgreement() {
        this.agreementChecked = !this.agreementChecked;
    }

    // loginAction(form: NgForm) {
    //     //this.router.navigateByUrl("/admin/alloys");
    // }
}
