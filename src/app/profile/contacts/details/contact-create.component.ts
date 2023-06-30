import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionType } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { ContactItem } from 'model/user.model';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';
import { WalletValidator } from 'utils/wallet.validator';

@Component({
	selector: 'app-profile-contact-create',
	templateUrl: './contact-create.component.html',
	styleUrls: ['../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class ProfileContactCreateComponent implements OnInit, OnDestroy {
    @Input() cryptoList: CurrencyView[] = [];
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    errorMessage = '';
    inProgress = false;
    contact: ContactItem | undefined = undefined;
    selectedCurrency: CurrencyView | undefined = undefined;
    currencyInit = false;
    createForm = this.formBuilder.group({
    	displayName: ['', { validators: [Validators.required], updateOn: 'change' }],
    	email: [
    		'',
    		{
    			validators: [
    				Validators.required,
    				Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    			],
    			updateOn: 'change',
    		}
    	],
    	currency: ['', { validators: [Validators.required], updateOn: 'change' }],
    	address: ['', { validators: [Validators.required], updateOn: 'change' }],
    	transaction: [TransactionType.Buy, { validators: [], updateOn: 'change' }],
    }, {
    	validators: [
    		WalletValidator.addressValidator(
    			'address',
    			'currency',
    			'transaction'
    		),
    	],
    	updateOn: 'change',
    });
    emailErrorMessages: { [key: string]: string; } = {
    	['required']: 'Email is required',
    	['pattern']: 'Email format is invalid'
    };
    displayNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Contact name is required'
    };
    addressErrorMessages: { [key: string]: string; } = {
    	['required']: 'Address is required'
    };

    private subscriptions: Subscription = new Subscription();

    constructor(
    	private formBuilder: UntypedFormBuilder,
    	private errorHandler: ErrorService,
    	private profileService: ProfileDataService) { }

    ngOnInit(): void {
    	this.subscriptions.add(
    		this.currencyField?.valueChanges.subscribe(val => {
    			this.currencyInit = true;
    			this.selectedCurrency = this.cryptoList.find(x => x.symbol === val);
    		}));
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    get displayNameField(): AbstractControl | null {
    	return this.createForm.get('displayName');
    }

    get emailField(): AbstractControl | null {
    	return this.createForm.get('email');
    }

    get addressField(): AbstractControl | null {
    	return this.createForm.get('address');
    }

    get currencyField(): AbstractControl | null {
    	return this.createForm.get('currency');
    }

    private createContact(email: string, userName: string, crypto: string, address: string): void {
    	this.errorMessage = '';
    	this.inProgress = true;
    	this.subscriptions.add(
    		this.profileService.saveMyContact('', userName, email, crypto, address).subscribe(({ data }) => {
    			this.inProgress = false;
    			const item = new ProfileItemContainer();
    			item.container = ProfileItemContainerType.Contact;
    			item.action = ProfileItemActionType.Create;
    			this.onComplete.emit(item);
    		}, (error) => {
    			this.inProgress = false;
    			this.errorMessage = this.errorHandler.getError(error.message, `Unable to create a new contact`);
    		})
    	);
    }

    submit(): void {
    	if (this.createForm.valid) {
    		this.createContact(
    			this.emailField?.value,
    			this.displayNameField?.value,
    			this.selectedCurrency?.symbol ?? '',
    			this.addressField?.value);
    	}
    }
}