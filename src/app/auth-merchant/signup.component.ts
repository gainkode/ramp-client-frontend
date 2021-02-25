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
    selectedUserType = 'Personal';
    countries: CountryCode[] = CountryCodes;
    filteredCountries: Observable<CountryCode[]> | undefined;

    signupForm = this.formBuilder.group({
        username: [,
            { validators: [Validators.required], updateOn: 'change' }
        ],
        userType: ['Personal'],
        firstName: [''],
        lastName: [''],
        companyName: [''],
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
        this.setUserCategoryValidators();
    }

    setUserCategoryValidators(): void {
        const userTypeField = this.signupForm.get('userType');
        const firstNameField = this.signupForm.get('firstName');
        const lastNameField = this.signupForm.get('lastName');
        const companyNameField = this.signupForm.get('companyName');

        userTypeField?.valueChanges.subscribe(userType => {
            this.selectedUserType = userType;
            this.resetValidator(firstNameField);
            this.resetValidator(lastNameField);
            this.resetValidator(companyNameField);
            if (userType === 'Merchant') {
                firstNameField?.setValidators(null);
                lastNameField?.setValidators(null);
                companyNameField?.setValidators([Validators.required]);
            } else if (userType === 'Personal') {
                firstNameField?.setValidators([Validators.required]);
                lastNameField?.setValidators([Validators.required]);
                companyNameField?.setValidators(null);
            }
        });
    }

    resetValidator(control: AbstractControl | null): void {
        control?.clearValidators();
        control?.reset();
        control?.markAsUntouched();
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
            let firstName = '';
            let lastName = '';
            if (this.selectedUserType === 'Merchant') {
                firstName = this.signupForm.get('companyName')?.value;
            } else if (this.selectedUserType === 'Personal') {
                firstName = this.signupForm.get('firstName')?.value;
                lastName = this.signupForm.get('lastName')?.value;
            }
            const phone = this.phoneCodeField?.value + ' ' + this.phoneNumberField?.value;
            this.auth.confirmName(
                this.token,
                this.signupForm.get('username')?.value,
                this.signupForm.get('userType')?.value,
                firstName,
                lastName,
                countryCode,
                phone)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    const userData = data.confirmName as LoginResult;
                    if (userData.authTokenAction === 'ConfirmName' ||
                    userData.authTokenAction === 'Default') {
                        this.auth.setLoginUser(userData);
                        if (userData.user?.type === 'Merchant') {
                            this.router.navigateByUrl('/merchant/');
                        } else {
                            this.router.navigateByUrl('/personal/');
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
