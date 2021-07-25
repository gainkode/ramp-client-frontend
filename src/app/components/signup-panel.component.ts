import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Observable } from 'rxjs';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { CountryCodes, getCountry, getCountryDialCode, ICountryCode } from '../model/country-code.model';
import { map, startWith } from 'rxjs/operators';
import { LoginResult, UserMode, UserType } from '../model/generated-models';

@Component({
    selector: 'app-signup-panel',
    templateUrl: 'signup-panel.component.html',
    styleUrls: ['signup-panel.component.scss']
})
export class SignUpPanelComponent implements OnInit {
    @Input() set userName(val: string) {
        this.emailField?.setValue(val);
    }
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() registered = new EventEmitter<string>();
    hidePassword1 = true;
    hidePassword2 = true;
    agreementChecked = false;

    signupForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        password1: [,
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
                ], updateOn: 'change'
            }
        ],
        password2: [,
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8)
                ], updateOn: 'change'
            }
        ]
    });

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder) { }

    ngOnInit(): void {

    }

    get emailField(): AbstractControl | null {
        return this.signupForm.get('email');
    }

    checkAgreement(): void {
        this.agreementChecked = !this.agreementChecked;
    }

    passwordsEqual(): boolean {
        const p1 = this.signupForm.get('password1')?.value;
        const p2 = this.signupForm.get('password2')?.value;
        return (p1 === p2);
    }

    getPasswordValidation(): string {
        if (this.signupForm.get('password1')?.hasError('required')) {
            return 'Please specify your password';
        } else if (this.signupForm.get('password1')?.hasError('minlength')) {
            return 'Password must contain at least 8 symbols';
        } else if (this.signupForm.get('password1')?.hasError('pattern')) {
            return 'Invalid password format';
        }
        return '';
    }

    onSubmit(): void {
        this.error.emit('');
        if (this.signupForm.valid) {
            if (!this.passwordsEqual()) {
                this.error.emit('Passwords are not equal');
                return;
            }
            this.progressChange.emit(true);
            this.registerAccount(this.emailField?.value, this.signupForm.get('password1')?.value);
        }
    }

    registerAccount(email: string, password: string): void {
        this.auth.register(email, password, UserType.Personal).subscribe((signupData) => {
            const userData = signupData.data.signup as LoginResult;
            this.progressChange.emit(false);
            if (!userData.authTokenAction) {
                this.registered.emit(email);
            } else if (userData.authTokenAction === 'UserInfoRequired') {
                this.auth.setLoginUser(userData);
            } else {
                this.error.emit('Unable to recognize the registration action');
                console.log('Unable to recognize the registration action', userData.authTokenAction);
            }
        }, (error) => {
            this.progressChange.emit(false);
            this.error.emit(this.errorHandler.getError(error.message, 'Unable to register new account'));
        });
    }
}