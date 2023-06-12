import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { LoginResult, PostAddress, SettingsKyc, UserType } from '../../model/generated-models';
import { Subscription } from 'rxjs';
import { getCountryByCode3 } from '../../model/country-code.model';
import { take } from 'rxjs/operators';
import { getFormattedUtcDate } from 'utils/utils';

@Component({
	selector: 'app-widget-wire-transfer-info-required',
	templateUrl: 'wire-transfer-info-required.component.html',
	styleUrls: [
		'../../../assets/button.scss',
		'../../../assets/text-control.scss',
		'../../../assets/auth.scss'
	]
})
export class WidgetWireTransferInfoRequiredComponent implements OnDestroy{
    @Input() buttonTitle = 'OK';
    @Input() requiredFields: string[] = [];
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() done = new EventEmitter<LoginResult>();

    requireUserFirstName = false;
    requireUserCompanyName = false;
    requireUserPhone = false;
    requireUserBirthday = false;
    requireUserAddress = false;
    requireUserFlatNumber = false;
    isMerchant = false;

    startBirthday = new Date(1980, 0, 1);

    firstNameControl: AbstractControl | null = null;
    lastNameControl: AbstractControl | null = null;
    birthdayControl: AbstractControl | null = null;
    townControl: AbstractControl | null = null;
    streetControl: AbstractControl | null = null;
    companyNameControl: AbstractControl | null = null;
    phoneControl: AbstractControl | null = null;

    private subscriptions: Subscription = new Subscription();

    infoForm = this.formBuilder.group({
    	firstName: ['', { validators: [], updateOn: 'change' }],
    	lastName: ['', { validators: [], updateOn: 'change' }],
    	birthday: [undefined, { validators: [], updateOn: 'change' }],
    	town: ['', { validators: [], updateOn: 'change' }],
    	street: ['', { validators: [], updateOn: 'change' }],
    	companyName: ['', { validators: [], updateOn: 'change' }],
    	phone: ['', { validators: [], updateOn: 'change' }]
    });

    firstNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify your first name'
    };
    lastNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify your last name'
    };
    birthdayErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify your birthday'
    };
    townErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify the city name'
    };
    streetErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify the street'
    };
    companyNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify the companyName'
    };
    phoneErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify the phone'
    };

    constructor(
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private formBuilder: UntypedFormBuilder) {
    	this.firstNameControl = this.infoForm.get('firstName');
    	this.lastNameControl = this.infoForm.get('lastName');
    	this.birthdayControl = this.infoForm.get('birthday');
    	this.townControl = this.infoForm.get('town');
    	this.streetControl = this.infoForm.get('street');
    	this.companyNameControl = this.infoForm.get('companyName');
    	this.phoneControl = this.infoForm.get('phone');
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
    	// const fieldsData = this.auth.getSignupRequiredFields().valueChanges.pipe(take(1));
    	for(const field of this.requiredFields){
    		switch(field){
    			case 'lastName':
    			case 'firstName':
    				this.requireUserFirstName = true;
    				break;
    			case 'birthday':
    				this.requireUserBirthday= true;
    				break;
    			case 'companyName':
    				this.requireUserCompanyName = true;
    				break;
    			case 'phone':
    				this.requireUserPhone = true;
    				break;
    			case 'street':
    			case 'town':
    				this.requireUserAddress = true;
    				break; 
    		}
    	}
    	this.progressChange.emit(false);
    	this.setFields();
    }

    private setFields(): void {
    	const user = this.auth.user;
    	this.isMerchant = (user?.type === UserType.Merchant);
    	if(this.requireUserCompanyName && user){
    		this.companyNameControl?.setValue(user.companyName);
    		this.companyNameControl?.setValidators([Validators.required]);
    	}else{
    		this.companyNameControl?.setValue('');
    		this.companyNameControl?.setValidators([]);
    	}

    	if(this.requireUserPhone && user){
    		this.phoneControl?.setValue(user.companyName);
    		this.phoneControl?.setValidators([Validators.required]);
    	}else{
    		this.phoneControl?.setValue('');
    		this.phoneControl?.setValidators([]);
    	}

    	if (this.requireUserFirstName && user) {
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
    	if (this.requireUserAddress && user) {
    		this.townControl?.setValue(user.town);
    		this.streetControl?.setValue(user.street);
    		this.townControl?.setValidators([Validators.required]);
    		this.streetControl?.setValidators([Validators.required]);
    	} else {
    		this.townControl?.setValue('');
    		this.streetControl?.setValue('');
    		this.townControl?.setValidators([]);
    		this.streetControl?.setValidators([]);
    	}
    	if (this.requireUserBirthday && user) {
    		const birthday = new Date(user.birthday);
    		console.log(birthday);
    		if (birthday && birthday !== null) {
    			const d = `${birthday.getDate()}/${birthday.getMonth() + 1}/${birthday.getFullYear()}`;
    			this.birthdayControl?.setValue(d);
    		}
    		this.birthdayControl?.setValidators([Validators.required]);
    	} else {
    		this.birthdayControl?.setValue('');
    		this.birthdayControl?.setValidators([]);
    	}
    	this.firstNameControl?.updateValueAndValidity();
    	this.lastNameControl?.updateValueAndValidity();
    	this.birthdayControl?.updateValueAndValidity();
    	this.townControl?.updateValueAndValidity();
    	this.streetControl?.updateValueAndValidity();
    }

    onSubmit(): void {
    	if (this.infoForm.valid) {
    		this.progressChange.emit(true);
    		let address: PostAddress | undefined;

    		const birthday = getFormattedUtcDate(this.birthdayControl?.value ?? '');
    		if (this.requireUserAddress || this.requireUserFlatNumber) {
    			address = {} as PostAddress;
    			if (this.requireUserAddress) {
    				address.town = this.townControl?.value;
    				address.street = this.streetControl?.value;
    			}
    		}
    		this.subscriptions.add(
    			this.auth.setMyInfo(
    				this.firstNameControl?.value as string,
    				this.lastNameControl?.value as string,
    				this.companyNameControl?.value as string,
    				this.phoneControl?.value as string,
    				address,
    				birthday
    			).subscribe(({ data }) => {
    				this.progressChange.emit(false);
    				this.done.emit(data.setMyInfo as LoginResult);
    			}, (error) => {
    				this.progressChange.emit(false);
    				this.error.emit(this.errorHandler.getError(error.message, 'Incorrect personal data'));
    			})
    		);
    	}
    }
}
