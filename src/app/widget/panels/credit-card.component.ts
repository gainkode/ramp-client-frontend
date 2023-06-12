import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '@environments/environment';
import { CardView } from '../../model/payment.model';

const creditCardType = require('credit-card-type');

class CardExpiredDate {
	month = -1;
	year = -1;
	valid = false;
}

@Component({
	selector: 'app-widget-credit-card',
	templateUrl: 'credit-card.component.html',
	styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetCreditCardComponent implements OnInit, OnDestroy {
    @Input() errorMessage = '';
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<CardView>();

    private pSubscriptions: Subscription = new Subscription();

    cardNumberLength = 16;
    cardNumberLengths: number[] = [16];
    currentCardType = '';
    expiredInit = false;
    expiredCard = false;
    codeInit = false;
    codeName = 'CVV';
    codeLength = 3;
    processing = false;

    cardForm = this.formBuilder.group({
    	card: ['', { validators: [Validators.required, Validators.minLength(16)], updateOn: 'change' }],
    	holder: ['', { validators: [Validators.required], updateOn: 'change' }],
    	expired: ['', {
    		validators: [
    			Validators.required,
    			Validators.pattern('^(1[0-2]|0?[1-9])/?[0-9]{2}$')
    		], updateOn: 'change'
    	}],
    	code: [undefined, { validators: [Validators.required, Validators.minLength(3)], updateOn: 'change' }]
    });

    cardNumberErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify your card number',
    	['minlength']: 'Card number length must be 16 symbols'
    };

    cardHolderErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify the card holder name'
    };

    cardExpiredErrorMessages: { [key: string]: string; } = {
    	['required']: 'Date is required',
    	['pattern']: 'Incorrect format'
    };

    get cardField(): AbstractControl | null {
    	return this.cardForm.get('card');
    }

    get holderField(): AbstractControl | null {
    	return this.cardForm.get('holder');
    }

    get expiredField(): AbstractControl | null {
    	return this.cardForm.get('expired');
    }

    get codeField(): AbstractControl | null {
    	return this.cardForm.get('code');
    }

    constructor(private formBuilder: UntypedFormBuilder) {
    }

    ngOnInit(): void {
    	if (!environment.production) {
    		this.cardField?.setValue('4111110000000211');
    		this.expiredField?.setValue('01/23');
    		this.codeField?.setValue('123');
    		this.holderField?.setValue('john doe');
    	}
    	this.pSubscriptions.add(this.cardField?.valueChanges.subscribe((val) => this.onCardNumberUpdated(val)));
    	this.pSubscriptions.add(this.expiredField?.valueChanges.subscribe((val) => this.onExpiredUpdated(val)));
    	this.pSubscriptions.add(this.codeField?.valueChanges.subscribe((val) => this.onCodeUpdated(val)));
    }

    ngOnDestroy(): void {
    	this.pSubscriptions.unsubscribe();
    }

    onSubmit(): void {
    	const card = new CardView();
    	card.valid = this.cardForm.valid && !this.expiredCard;
    	if (this.cardForm.valid) {
    		card.cardNumber = this.cardField?.value;
    		card.holderName = this.holderField?.value;
    		const expired = this.getCardExpiredDate(this.expiredField?.value);
    		if (expired.valid) {
    			card.monthExpired = expired.month;
    			card.yearExpired = expired.year;
    		}
    		card.cvv = parseInt(this.codeField?.value, 10);
    		this.processing = true;
    		this.onComplete.emit(card);
    	}
    }

    private onCardNumberUpdated(val: string): void {
    	const cardInfo = creditCardType(val);
    	// If there is one card type found (no ambigous options)
    	if (cardInfo.length === 1) {
    		this.codeName = cardInfo[0].code.name;
    		this.codeLength = cardInfo[0].code.size;
    		this.setCardType(cardInfo[0].type);
    		this.cardNumberLengths = cardInfo[0].lengths;
    		if (this.cardNumberLengths.length > 0) {
    			this.cardNumberLength = this.cardNumberLengths[this.cardNumberLengths.length - 1];
    		}
    	} else {  // no card type or a few card types found
    		this.codeName = 'CVV';
    		this.codeLength = 3;
    		this.cardNumberLengths = [];
    		this.cardNumberLength = 16;
    		this.setCardType('');
    	}
    }

    private onExpiredUpdated(val: string): void {
    	this.expiredInit = true;
    	this.expiredCard = (this.getCardExpiredDate(val).valid === false);
    }

    private onCodeUpdated(val: string): void {
    	this.codeInit = true;
    }

    private setCardType(typeName: string | undefined): void {
    	if (typeName) {
    		this.currentCardType = `assets/svg-payment-systems/${typeName.toLowerCase()}.svg`;
    	} else {
    		this.currentCardType = '';
    	}
    }

    private getCardExpiredDate(val: string): CardExpiredDate {
    	const result = new CardExpiredDate();
    	const dateParts = val.split('/');
    	if (dateParts.length === 2) {
    		const m = parseInt(dateParts[0], 10);
    		const y = parseInt('20' + dateParts[1], 10);
    		const dt = new Date();
    		const dtm = dt.getMonth() + 1;
    		const dty = dt.getFullYear();
    		if (dty < y) {
    			result.valid = true;
    		} else {
    			if (dty === y) {
    				if (dtm <= m) {
    					result.valid = true;
    				}
    			}
    		}
    		if (result.valid) {
    			result.year = y;
    			result.month = m;
    		}
    	}
    	return result;
    }
}
