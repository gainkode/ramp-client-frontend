import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

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

    constructor(private auth: AuthService, private router: Router) { }
    
    isAuthenticated(): boolean {
        return this.auth.authenticated;
    }

    checkAgreement() {
        this.agreementChecked = !this.agreementChecked;
        console.log(`Checked: ${this.agreementChecked}`);
    }
}
