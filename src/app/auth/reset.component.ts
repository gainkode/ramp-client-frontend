import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

@Component({
    templateUrl: 'reset.component.html',
    styleUrls: ['./login.component.scss']
})
export class ResetComponent {
    token = '';
    inProgress = false;
    errorMessage = '';
    hidePassword1 = true;
    hidePassword2 = true;

    passwordForm = this.formBuilder.group({
        password1: [,
            { validators: [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
            ], updateOn: 'change' }
        ],
        password2: [,
            { validators: [
                Validators.required,
                Validators.minLength(8)
            ], updateOn: 'change' }
        ]
    });

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder, private router: Router, activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params['token'];
    }

    passwordsEqual(): boolean {
        const p1 = this.passwordForm.get('password1')?.value;
        const p2 = this.passwordForm.get('password2')?.value;
        return (p1 === p2);
    }

    getPasswordValidation(): string {
        if (this.passwordForm.get('password1')?.hasError('required')) {
            return 'Please specify your password';
        } else if (this.passwordForm.get('password1')?.hasError('minlength')) {
            return 'Password must contain at least 8 symbols';
        } else if (this.passwordForm.get('password1')?.hasError('pattern')) {
            return 'Password must contain latin lowercase and uppercase symbols, digits, and special symbols';
        }
        return '';
    }

    onSubmit(): void {
        this.errorMessage = '';
        if (this.passwordForm.valid) {
            if (!this.passwordsEqual()) {
                this.errorMessage = 'Passwords are not equal';
                return;
            }
            this.inProgress = true;
            this.auth.setPassword(
                this.token,
                this.passwordForm.get('password1')?.value)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    this.router.navigateByUrl('/auth/success/reset');
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message, 
                        'Unable to reset password');
                });
        }
    }
}
