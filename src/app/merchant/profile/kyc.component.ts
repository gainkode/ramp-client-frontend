import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { LoginResult } from '../../model/generated-models';
import { SocialUser } from 'angularx-social-login';

@Component({
    templateUrl: 'kyc.component.html',
    styleUrls: ['profile.scss']
})
export class KycMerchantComponent {
    inProgress = false;
    errorMessage = '';

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder, private router: Router) { }

    // temp
    logout(): void {
        this.auth.logout();
    }
    // temp

    onSubmit(): void {

    }
}
