import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { CountryCode, CountryCodes, getCountry, getCountryDialCode } from '../model/country-code.model';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['./login.component.scss']
})
export class RegisterComponent implements OnInit {
    inProgress = false;
    errorMessage = '';
    hidePassword1 = true;
    hidePassword2 = true;
    agreementChecked = false;
    countries: CountryCode[] = CountryCodes;
    filteredCountries: Observable<CountryCode[]> | undefined;

    signupForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        username: ['', { validators: [Validators.required], updateOn: 'change' } ],
        firstName: ['', { validators: [Validators.required], updateOn: 'change' } ],
        lastName: ['', { validators: [Validators.required], updateOn: 'change' } ],
        country: ['', { validators: [Validators.required], updateOn: 'change' } ],
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
        private formBuilder: FormBuilder, private router: Router) { }

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

    private filterCountries(value: string | CountryCode): CountryCode[] {
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
        this.errorMessage = '';
        if (this.signupForm.valid) {
            const countryCode = getCountry(this.countryField?.value);
            if (countryCode === null) {
                this.errorMessage = `Unable to recognize country: ${this.countryField?.value}`;
                return;
            }
            if (!this.passwordsEqual()) {
                this.errorMessage = 'Passwords are not equal';
                return;
            }
            this.inProgress = true;
            const phone = this.phoneCodeField?.value + ' ' + this.phoneNumberField?.value;
            this.auth.register(
                this.signupForm.get('username')?.value,
                this.signupForm.get('email')?.value,
                this.signupForm.get('password1')?.value,
                'Personal',
                this.signupForm.get('firstName')?.value,
                this.signupForm.get('lastName')?.value,
                countryCode.code2,
                countryCode.code3,
                phone)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    this.router.navigateByUrl('/auth/personal/success/signup');
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message,
                        'Unable to register new account');
                });
        }
    }
}
