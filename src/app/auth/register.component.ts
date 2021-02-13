import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { CountryCode, CountryCodes } from '../model/country-code.model';

export interface Book {
    id: number;
    name: string;
    writer: string
} 

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['./login.component.scss']
})
export class RegisterComponent implements OnInit {
    inProgress: boolean = false;
    errorMessage: string = '';
    hidePassword1: boolean = true;
    hidePassword2: boolean = true;
    agreementChecked: boolean = false;
    selectedUserType: string = 'Personal';
    countries: CountryCode[] = CountryCodes;
    filteredCountries: Observable<CountryCode[]> | undefined;

    signupForm = this.formBuilder.group({
        email: [, 
            { validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
            ], updateOn: "change" }
        ],
        username: [, 
            { validators: [Validators.required], updateOn: "change" }
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
            ], updateOn: "change" }
        ],
        phoneNumber: ['', 
            { validators: [
                Validators.required, 
                Validators.pattern('^(?:[0-9]?){6,9}[0-9]$')
            ], updateOn: "change" }
        ],
        password1: [, 
            { validators: [
                Validators.required, 
                Validators.minLength(8),
                Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$#!%_*?&])[A-Za-z\d$@$#!%_*?&].{7,30}')
            ], updateOn: "change" }
        ],
        password2: [, 
            { validators: [
                Validators.required, 
                Validators.minLength(8)
            ], updateOn: "change" }
        ]
    });

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }
    
    ngOnInit() {
        this.filteredCountries = this.countryField?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCountries(value)));
        this.countryField?.valueChanges.subscribe(val => {
            let code = this.getCountryPhoneCode(val);
            if (code != '') {
                this.phoneCodeField?.setValue(code);
            }
        });
        this.setUserCategoryValidators();
    }

    setUserCategoryValidators() {
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

    resetValidator(control: AbstractControl | null) {
        control?.clearValidators();
        control?.reset();
        control?.markAsUntouched();
    }

    get countryField() {
        return this.signupForm.get('country');
    }

    get phoneCodeField() {
        return this.signupForm.get('phoneCode');
    }

    get phoneNumberField() {
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
        if(!searchText) return '';
        searchText = searchText.toLowerCase();
        let found = this.countries.filter(code => code.name.toLowerCase() == searchText);
        if (found.length == 1) {
            return found[0].dial_code;
        }
        return '';
    }

    getCountryCode(searchText: string): string {
        if(!searchText) return '';
        searchText = searchText.toLowerCase();
        let found = this.countries.filter(code => code.name.toLowerCase() == searchText);
        if (found.length == 1) {
            return found[0].code;
        }
        return '';
    }

    checkAgreement() {
        this.agreementChecked = !this.agreementChecked;
    }

    passwordsEqual(): boolean {
        let p1 = this.signupForm.get('password1')?.value;
        let p2 = this.signupForm.get('password2')?.value;
        return (p1 == p2);
    }

    getPasswordValidation(): string {
        if (this.signupForm.get('password1')?.hasError('required')) {
            return 'Please specify your password';
        } else if (this.signupForm.get('password1')?.hasError('minlength')) {
            return 'Password must contain at least 8 symbols';
        } else if (this.signupForm.get('password1')?.hasError('pattern')) {
            return 'Password must contain lowercase and uppercase symbols, digits, and special symbols';
        }
        return '';
    }

    onSubmit() {
        this.errorMessage = '';
        if (this.signupForm.valid) {
            let countryCode = this.getCountryCode(this.countryField?.value);
            if (countryCode == '') {
                this.errorMessage = `Unable to recognize country: ${this.countryField?.value}`;
                return;
            }
            if (!this.passwordsEqual()) {
                this.errorMessage = 'Passwords are not equal';
                return;
            }
            this.inProgress = true;
            let firstName = '';
            let lastName = '';
            if (this.selectedUserType == 'Merchant') {
                firstName = this.signupForm.get('companyName')?.value;
            } else if (this.selectedUserType == 'Personal') {
                firstName = this.signupForm.get('firstName')?.value;
                lastName = this.signupForm.get('lastName')?.value;
            }
            let phone = this.phoneCodeField?.value + ' ' + this.phoneNumberField?.value;
            this.auth.register(
                this.signupForm.get('username')?.value,
                this.signupForm.get('email')?.value,
                this.signupForm.get('password1')?.value,
                this.signupForm.get('userType')?.value,
                firstName,
                lastName,
                countryCode,
                phone)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    this.router.navigateByUrl("/auth/success/signup");
                },(error) => {
                    this.inProgress = false;
                    this.errorMessage = 'Unable to register new account';
                });
        }
    }
}
