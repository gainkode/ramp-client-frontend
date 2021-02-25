import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { LoginResult } from '../model/generated-models';
import { CountryCode, CountryCodes } from '../model/country-code.model';

@Component({
    templateUrl: 'signup.component.html',
    styleUrls: ['./login.component.scss']
})
export class SignupComponent implements OnInit {
    token = '';
    inProgress = false;
    errorMessage = '';
    agreementChecked = false;
    countries: CountryCode[] = CountryCodes;
    filteredCountries: Observable<CountryCode[]> | undefined;

    signupForm = this.formBuilder.group({
        username: ['', { validators: [Validators.required], updateOn: 'change' } ],
        firstName: ['', { validators: [Validators.required], updateOn: 'change' } ],
        lastName: ['', { validators: [Validators.required], updateOn: 'change' } ],
        country: ['', Validators.required],
        phoneCode: ['',
            { validators: [
                Validators.required,
                Validators.pattern('^[\+](?:[0-9]?){0,3}[0-9]$')
            ], updateOn: 'change' }
        ],
        phoneNumber: ['',
            { validators: [
                Validators.required,
                Validators.pattern('^(?:[0-9]?){6,9}[0-9]$')
            ], updateOn: 'change' }
        ]
    });

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder, private router: Router, activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params['token'];
    }

    ngOnInit(): void {
        this.filteredCountries = this.countryField?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCountries(value)));
        this.countryField?.valueChanges.subscribe(val => {
            const code = this.getCountryPhoneCode(val);
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

    getCountryPhoneCode(searchText: string): string {
        if (!searchText) {
            return '';
        }
        searchText = searchText.toLowerCase();
        const found = this.countries.filter(code => code.name.toLowerCase() === searchText);
        if (found.length === 1) {
            return found[0].dial_code;
        }
        return '';
    }

    getCountryCode(searchText: string): string {
        if (!searchText) {
            return '';
        }
        searchText = searchText.toLowerCase();
        const found = this.countries.filter(code => code.name.toLowerCase() === searchText);
        if (found.length === 1) {
            return found[0].code;
        }
        return '';
    }

    checkAgreement(): void {
        this.agreementChecked = !this.agreementChecked;
    }

    onSubmit(): void {
        this.errorMessage = '';
        if (this.signupForm.valid) {
            const countryCode = this.getCountryCode(this.countryField?.value);
            if (countryCode === '') {
                this.errorMessage = `Unable to recognize country: ${this.countryField?.value}`;
                return;
            }
            this.inProgress = true;
            const phone = this.phoneCodeField?.value + ' ' + this.phoneNumberField?.value;
            this.auth.confirmName(
                this.token,
                this.signupForm.get('username')?.value,
                'Personal',
                this.signupForm.get('firstName')?.value,
                this.signupForm.get('lastName')?.value,
                countryCode,
                phone)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    const userData = data.confirmName as LoginResult;
                    if (userData.authTokenAction === 'ConfirmName' ||
                    userData.authTokenAction === 'Default') {
                        const typeCheck = userData.user?.type === 'Personal';
                        if (typeCheck) {
                            this.auth.setLoginUser(userData);
                            this.router.navigateByUrl('/personal/');
                        } else {
                            this.signupForm.reset();
                            this.errorMessage = 'Wrong account type. Try to sign in as a merchant';
                        }
                    } else {
                        this.errorMessage = 'Unable to sign in';
                    }
                }, (error) => {
                    this.inProgress = false;
                    this.errorMessage = this.errorHandler.getError(
                        error.message, 
                        'Unable to register new account');
                });
        }
    }
}
