import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Observable } from 'rxjs';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { CountryCodes, getCountry, getCountryDialCode, ICountryCode } from '../model/country-code.model';
import { map, startWith } from 'rxjs/operators';
import { LoginResult } from '../model/generated-models';

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
    countries: ICountryCode[] = CountryCodes;
    filteredCountries: Observable<ICountryCode[]> | undefined;

    signupForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        firstName: ['', { validators: [Validators.required], updateOn: 'change' }],
        lastName: ['', { validators: [Validators.required], updateOn: 'change' }],
        country: ['', { validators: [Validators.required], updateOn: 'change' }],
        phoneCode: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[\+](?:[0-9]?){0,3}[0-9]$')
                ], updateOn: 'change'
            }
        ],
        phoneNumber: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^(?:[0-9]?){6,9}[0-9]$')
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
        this.filteredCountries = this.countryField?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCountries(value)));
        this.countryField?.valueChanges.subscribe(val => {
            const code = getCountryDialCode(val);
            if (code !== '') {
                this.phoneCodeField?.setValue(code);
            }
        });
    }

    get emailField(): AbstractControl | null {
        return this.signupForm.get('email');
    }

    get countryField(): AbstractControl | null {
        return this.signupForm.get('country');
    }

    get phoneCodeField(): AbstractControl | null {
        return this.signupForm.get('phoneCode');
    }

    get phoneNumberField(): AbstractControl | null {
        return this.signupForm.get('phoneNumber');
    }

    getCountryFlag(code: string): string {
        return `${code.toLowerCase()}.svg`;
    }

    private filterCountries(value: string | ICountryCode): ICountryCode[] {
        let filterValue = '';
        if (value) {
            filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();
            return this.countries.filter(c => c.name.toLowerCase().includes(filterValue));
        } else {
            return this.countries;
        }
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
            const countryCode = getCountry(this.countryField?.value);
            if (countryCode === null) {
                this.error.emit(`Unable to recognize country: ${this.countryField?.value}`);
                return;
            }
            if (!this.passwordsEqual()) {
                this.error.emit('Passwords are not equal');
                return;
            }
            this.progressChange.emit(true);
            const phone = this.phoneCodeField?.value + ' ' + this.phoneNumberField?.value;
            this.registerAccount(
                this.emailField?.value,
                this.signupForm.get('password1')?.value,
                this.signupForm.get('firstName')?.value,
                this.signupForm.get('lastName')?.value,
                countryCode.code2,
                countryCode.code3,
                phone);
        }
    }

    registerAccount(email: string, password: string, firstName: string, lastName: string,
        code2: string, code3: string, phone: string): void {
        this.auth.register(
            email, password, 'Personal', firstName, lastName, code2, code3, phone).subscribe((signupData) => {
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