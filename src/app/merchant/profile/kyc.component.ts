import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { Subscription } from 'rxjs';
import { Validators, FormBuilder } from '@angular/forms';
import { KycInfo } from '../../model/generated-models';

@Component({
    templateUrl: 'kyc.component.html',
    styleUrls: ['profile.scss']
})
export class KycMerchantComponent implements OnInit, OnDestroy {
    inProgress = false;
    errorMessage = '';
    private _kycSubscription!: any;

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder, private router: Router) { }

    ngOnInit(): void {
        this.inProgress = true;
        this._kycSubscription = this.auth.getMyKycInfo().valueChanges.subscribe(({ data }) => {
            console.log(data);
            const settings = data.myKycInfo as KycInfo;
            this.inProgress = false;
        }, (error) => {
            this.inProgress = false;
            if (this.auth.token !== '') {
                this.errorMessage = this.errorHandler.getError(
                    error.message, 
                    'Unable to load approval process data');
            } else {
                this.router.navigateByUrl('/');
            }
        });
    }

    ngOnDestroy() {
        (this._kycSubscription as Subscription).unsubscribe();
    }

    // temp
    logout(): void {
        this.auth.logout();
    }
    // temp

    onSubmit(): void {

    }
}
