import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { LoginResult, PostAddress, SettingsKyc, UserMode, UserType } from '../model/generated-models';
import { Subscription } from 'rxjs';
import { getCountryByCode3 } from '../model/country-code.model';

@Component({
    selector: 'app-signup-info-panel',
    templateUrl: 'signup-info.component.html',
    styleUrls: ['signup-panel.component.scss']
})
export class SignupInfoPanelComponent implements OnDestroy {
    @Input() buttonTitle = 'OK';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() done = new EventEmitter<LoginResult>();

    requireUserFullName = false;
    requireUserPhone = false;
    requireUserBirthday = false;
    requireUserAddress = false;
    requireUserFlatNumber = false;
    isMerchant = false;

    startBirthday = new Date(1980, 0, 1);

    firstNameControl: AbstractControl | null = null;
    lastNameControl: AbstractControl | null = null;
    phoneCodeControl: AbstractControl | null = null;
    phoneNumberControl: AbstractControl | null = null;
    birthdayControl: AbstractControl | null = null;
    postCodeControl: AbstractControl | null = null;
    townControl: AbstractControl | null = null;
    streetControl: AbstractControl | null = null;
    subStreetControl: AbstractControl | null = null;
    stateNameControl: AbstractControl | null = null;
    buildingNameControl: AbstractControl | null = null;
    buildingNumberControl: AbstractControl | null = null;
    flatNumberControl: AbstractControl | null = null;

    private pSettingsSubscription!: any;

    infoForm = this.formBuilder.group({
        firstName: ['', { validators: [], updateOn: 'change' }],
        lastName: ['', { validators: [], updateOn: 'change' }],
        phoneCode: ['', { validators: [], updateOn: 'change' }],
        phoneNumber: ['', { validators: [], updateOn: 'change' }],
        birthday: [new Date(), { validators: [], updateOn: 'change' }],
        postCode: ['', { validators: [], updateOn: 'change' }],
        town: ['', { validators: [], updateOn: 'change' }],
        street: ['', { validators: [], updateOn: 'change' }],
        subStreet: ['', { validators: [], updateOn: 'change' }],
        stateName: ['', { validators: [], updateOn: 'change' }],
        buildingName: ['', { validators: [], updateOn: 'change' }],
        buildingNumber: ['', { validators: [], updateOn: 'change' }],
        flatNumber: ['', { validators: [], updateOn: 'change' }]
    });

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder) {
        this.firstNameControl = this.infoForm.get('firstName');
        this.lastNameControl = this.infoForm.get('lastName');
        this.phoneCodeControl = this.infoForm.get('phoneCode');
        this.phoneNumberControl = this.infoForm.get('phoneNumber');
        this.birthdayControl = this.infoForm.get('birthday');
        this.postCodeControl = this.infoForm.get('postCode');
        this.townControl = this.infoForm.get('town');
        this.streetControl = this.infoForm.get('street');
        this.subStreetControl = this.infoForm.get('subStreet');
        this.stateNameControl = this.infoForm.get('stateName');
        this.buildingNameControl = this.infoForm.get('buildingName');
        this.buildingNumberControl = this.infoForm.get('buildingNumber');
        this.flatNumberControl = this.infoForm.get('flatNumber');
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pSettingsSubscription;
        if (s !== undefined) {
            (this.pSettingsSubscription as Subscription).unsubscribe();
        }
    }

    init(): void {
        const fieldsData = this.auth.getSignupRequiredFields();
        if (fieldsData === null) {
            this.error.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.progressChange.emit(true);
            this.pSettingsSubscription = fieldsData.valueChanges.subscribe(({ data }) => {
                const fields: SettingsKyc = data.mySettingsKyc;
                this.requireUserFullName = fields.requireUserFullName as boolean;
                this.requireUserPhone = fields.requireUserPhone as boolean;
                this.requireUserBirthday = fields.requireUserBirthday as boolean;
                this.requireUserAddress = fields.requireUserAddress as boolean;
                this.requireUserFlatNumber = fields.requireUserFlatNumber as boolean;
                this.setFields();
                this.progressChange.emit(false);
            }, (error) => {
                this.error.emit(this.errorHandler.getError('error', 'Unable to specify required data'));
                this.progressChange.emit(false);
            });
        }
    }

    private setFields(): void {
        const user = this.auth.user;
        console.log('User type:', user?.type);
        this.isMerchant = (user?.type === UserType.Merchant);
        if (this.requireUserFullName && user) {
            this.firstNameControl?.setValue(user.firstName);
            this.lastNameControl?.setValue(user.lastName);
            this.firstNameControl?.setValidators([Validators.required]);
            if (this.isMerchant) {
                this.lastNameControl?.setValidators([]);
            } else {
                this.lastNameControl?.setValidators([Validators.required]);
            }
        } else {
            this.firstNameControl?.setValue('');
            this.lastNameControl?.setValue('');
            this.firstNameControl?.setValidators([]);
            this.lastNameControl?.setValidators([]);
        }
        if (this.requireUserPhone && user) {
            let phoneCode = '';
            let phoneNumber = '';
            let phone = user.phone ?? '';
            if (phone === '') {
                if (user.countryCode3) {
                    const c = getCountryByCode3(user.countryCode3);
                    if (c) {
                        phone = c.dial_code;
                    }
                }
            }
            const phoneData = phone.split(' ');
            if (phoneData.length > 0) {
                phoneCode = phoneData[0];
            }
            if (phoneData.length > 1) {
                phoneNumber = phoneData[1];
            }
            this.phoneCodeControl?.setValue(phoneCode);
            this.phoneNumberControl?.setValue(phoneNumber);
            this.phoneCodeControl?.setValidators([
                Validators.required,
                Validators.pattern('^[\+](?:[0-9]?){0,3}[0-9]$')
            ]);
            this.phoneNumberControl?.setValidators([
                Validators.required,
                Validators.pattern('^(?:[0-9]?){6,9}[0-9]$')
            ]);
        } else {
            this.phoneCodeControl?.setValue('');
            this.phoneNumberControl?.setValue('');
            this.phoneCodeControl?.setValidators([]);
            this.phoneNumberControl?.setValidators([]);
        }
        if (this.requireUserAddress && user) {
            this.postCodeControl?.setValue(user.postCode);
            this.townControl?.setValue(user.town);
            this.streetControl?.setValue(user.street);
            this.subStreetControl?.setValue(user.subStreet);
            this.stateNameControl?.setValue(user.stateName);
            this.buildingNameControl?.setValue(user.buildingName);
            this.buildingNumberControl?.setValue(user.buildingNumber);
            this.postCodeControl?.setValidators([Validators.required]);
            this.townControl?.setValidators([Validators.required]);
            this.streetControl?.setValidators([Validators.required]);
            this.flatNumberControl?.setValue(user.flatNumber);
        } else {
            this.postCodeControl?.setValue('');
            this.townControl?.setValue('');
            this.streetControl?.setValue('');
            this.subStreetControl?.setValue('');
            this.stateNameControl?.setValue('');
            this.buildingNameControl?.setValue('');
            this.buildingNumberControl?.setValue('');
            this.flatNumberControl?.setValue('');
            this.postCodeControl?.setValidators([]);
            this.townControl?.setValidators([]);
            this.streetControl?.setValidators([]);
            this.flatNumberControl?.setValidators([]);
        }
        if (this.requireUserFlatNumber && user) {
            this.flatNumberControl?.setValue(user.flatNumber);
            this.flatNumberControl?.setValidators([Validators.required]);
        } else {
            this.flatNumberControl?.setValue('');
            this.flatNumberControl?.setValidators([]);
        }
        if (this.requireUserBirthday && user) {
            this.birthdayControl?.setValue(user.birthday ?? this.startBirthday);
            this.birthdayControl?.setValidators([Validators.required]);
        } else {
            this.birthdayControl?.setValue('');
            this.birthdayControl?.setValidators([]);
        }
        this.firstNameControl?.updateValueAndValidity();
        this.lastNameControl?.updateValueAndValidity();
        this.phoneCodeControl?.updateValueAndValidity();
        this.phoneNumberControl?.updateValueAndValidity();
        this.birthdayControl?.updateValueAndValidity();
        this.postCodeControl?.updateValueAndValidity();
        this.townControl?.updateValueAndValidity();
        this.streetControl?.updateValueAndValidity();
        this.subStreetControl?.updateValueAndValidity();
        this.stateNameControl?.updateValueAndValidity();
        this.buildingNameControl?.updateValueAndValidity();
        this.buildingNumberControl?.updateValueAndValidity();
        this.flatNumberControl?.updateValueAndValidity();
    }

    onSubmit(): void {
        this.error.emit('');
        if (this.infoForm.valid) {
            this.progressChange.emit(true);
            let address: PostAddress | undefined;
            let phone = '';
            if (this.requireUserPhone) {
                phone = `${this.phoneCodeControl?.value} ${this.phoneNumberControl?.value}`;
            }
            const rawBirthday = (this.birthdayControl?.value) ? this.birthdayControl?.value as Date : undefined;
            const birthday = (rawBirthday) ?
                new Date(Date.UTC(
                    rawBirthday.getFullYear(),
                    rawBirthday.getMonth(),
                    rawBirthday.getDate(),
                    0, 0, 0, 0)) : undefined;
            if (this.requireUserAddress || this.requireUserFlatNumber) {
                address = {} as PostAddress;
                if (this.requireUserAddress) {
                    address.postCode = this.postCodeControl?.value;
                    address.town = this.townControl?.value;
                    address.street = this.streetControl?.value;
                    address.subStreet = this.subStreetControl?.value;
                    address.stateName = this.stateNameControl?.value;
                    address.buildingName = this.buildingNameControl?.value;
                    address.buildingNumber = this.buildingNumberControl?.value;
                    address.flatNumber = this.flatNumberControl?.value;
                }
                if (this.requireUserFlatNumber) {
                    address.flatNumber = this.flatNumberControl?.value;
                }
            }
            this.auth.setMyInfo(
                this.firstNameControl?.value as string,
                this.lastNameControl?.value as string,
                phone,
                address,
                birthday
            ).subscribe(({ data }) => {
                this.progressChange.emit(false);
                this.done.emit(data.setMyInfo as LoginResult);
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Incorrect personal data'));
            });
        }
    }
}
