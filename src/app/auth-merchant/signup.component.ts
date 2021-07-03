import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { LoginResult } from '../model/generated-models';
import { ICountryCode, CountryCodes, getCountry, getCountryDialCode } from '../model/country-code.model';

@Component({
    templateUrl: 'signup.component.html',
    styleUrls: ['./login.component.scss']
})
export class SignupComponent implements OnInit {
    token = '';
    inProgress = false;
    errorMessage = '';
    agreementChecked = false;
    countries: ICountryCode[] = CountryCodes;
    filteredCountries: Observable<ICountryCode[]> | undefined;

    signupForm = this.formBuilder.group({
        companyName: ['', { validators: [Validators.required], updateOn: 'change' } ],
        country: ['', { validators: [Validators.required], updateOn: 'change' } ],
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

    onSubmit(): void {
        this.errorMessage = '';
        if (this.signupForm.valid) {
            const countryCode = getCountry(this.countryField?.value);
            if (countryCode === null) {
                this.errorMessage = `Unable to recognize country: ${this.countryField?.value}`;
                return;
            }
            this.inProgress = true;
            const phone = this.phoneCodeField?.value + ' ' + this.phoneNumberField?.value;
            this.auth.confirmName(
                this.token,
                'Merchant',
                this.signupForm.get('companyName')?.value,
                '',
                countryCode.code2,
                countryCode.code3,
                phone)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    const userData = data.confirmName as LoginResult;
                    if (userData.authTokenAction === 'ConfirmName' ||
                    userData.authTokenAction === 'Default' ||
                    userData.authTokenAction === 'KycRequired') {
                        const typeCheck = userData.user?.type === 'Merchant';
                        if (typeCheck) {
                            this.auth.setLoginUser(userData);
                            this.router.navigateByUrl('/merchant/');
                        } else {
                            this.signupForm.reset();
                            this.errorMessage = 'Wrong account type. Try to sign in as a personal';
                        }
                    } else {
                        this.errorMessage = 'Unable to sign up' + ' ' + userData.authTokenAction;
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
