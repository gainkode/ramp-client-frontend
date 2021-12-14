import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: 'restore.component.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/auth.scss']
})
export class MerchantRestoreComponent implements OnDestroy {
    inProgress = false;
    errorMessage = '';

    emailErrorMessages: { [key: string]: string; } = {
        ['pattern']: 'Email is not valid',
        ['required']: 'Email is required'
    };

    restoreForm = this.formBuilder.group({
        email: [,
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder,
        private router: Router) { }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit(): void {
        if (this.restoreForm.valid) {
            this.inProgress = true;
            this.subscriptions.add(
                this.auth.forgotPassword(this.restoreForm.get('email')?.value).subscribe(({ data }) => {
                    this.inProgress = false;
                    this.router.navigateByUrl('/merchant/auth/success/restore');
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message,
                        'Unable to restore password');
                })
            );
        }
    }
}
