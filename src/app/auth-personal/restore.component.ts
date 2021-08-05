import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
    templateUrl: 'restore.component.html',
    styleUrls: ['./login.component.scss']
})
export class RestoreComponent {
    inProgress = false;
    errorMessage = '';

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

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder,
        private router: Router) { }

    onSubmit(): void {
        if (this.restoreForm.valid) {
            this.inProgress = true;
            this.auth.forgotPassword(
                this.restoreForm.get('email')?.value)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    this.router.navigateByUrl('/auth/personal/success/restore');
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message,
                        'Unable to restore password');
                });
        }
    }
}
