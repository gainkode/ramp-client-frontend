import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CardView } from '../../model/payment.model';

const cardValid = require('card-validator');
const creditCardType = require('credit-card-type');

@Component({
    selector: 'app-credit-card',
    templateUrl: 'credit-card.component.html',
    styleUrls: ['credit-card.component.scss']
})
export class CreditCardComponent implements OnInit {
    @Output() cardDetails = new EventEmitter<CardView>();
    @ViewChild('cardnumber') cardNumberElement: ElementRef | undefined = undefined;
    codeName = 'CVV';
    cvvLength = 3;
    cardNumberLength = 16;
    cardNumberGaps: number[] = [];
    cardNumberLengths: number[] = [16];
    monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    yearList: number[] = [];
    cardForm = this.formBuilder.group({
        cardType: ['', { validators: [Validators.required], updateOn: 'change' }],
        card: ['', { validators: [Validators.required, Validators.minLength(16)], updateOn: 'change' }],
        holder: ['', { validators: [Validators.required], updateOn: 'change' }],
        validMonth: [0, { validators: [Validators.required, Validators.min(1)], updateOn: 'change' }],
        validYear: [0, { validators: [Validators.required, Validators.min(1)], updateOn: 'change' }],
        cvv: ['', { validators: [Validators.required, Validators.minLength(3)], updateOn: 'change' }]
    });
    cardTypeControl: AbstractControl | null = null;
    cardNumberControl: AbstractControl | null = null;
    cardHolderControl: AbstractControl | null = null;
    cardValidMonthControl: AbstractControl | null = null;
    cardValidYearControl: AbstractControl | null = null;
    cardCvvControl: AbstractControl | null = null;

    get cardLogo(): string {
        const cardType = this.cardTypeControl?.value;
        if (cardType !== '') {
            return `assets/svg-payment-systems/${cardType}.svg`;
        } else {
            return '';
        }
    }

    get cardNumberValue(): string {
        const val = this.cardNumberControl?.value;
        let result = '1111 **** **** 4444';
        if (val) {
            if (val !== '') {
                let s = '';
                const cardNum = val as string;
                const cardLen = cardNum.length;
                for (let v = 0; v < cardLen; v++) {
                    s += cardNum[v];
                    const gapLen = this.cardNumberGaps.length;
                    for (var i = 0; i < gapLen; i++) {
                        const g = this.cardNumberGaps[i];
                        if (v === g - 1) {
                            s += ' ';
                        }
                    }
                }
                result = s;
            }
        }
        return result;
    }

    get cardHolderValue(): string {
        const val = this.cardHolderControl?.value;
        let result = 'Mr. Cardholder';
        if (val) {
            if (val !== '') {
                result = val;
            }
        }
        return result.toUpperCase().slice(0, 20);
    }

    get cardValidMonthValue(): string {
        const val = this.cardValidMonthControl?.value;
        let result = '01';
        if (val) {
            if (val !== '') {
                result = val.toString();
                if (result.length < 2) {
                    result = '0' + result;
                }
            }
        }
        return result;
    }

    get cardValidYearValue(): string {
        const val = this.cardValidYearControl?.value;
        let year = new Date().getFullYear() + 1;
        if (val) {
            if (val !== '') {
                year = val;
            }
        }
        return year.toString().slice(2, 4);
    }

    get cardCvvValue(): string {
        const val = this.cardCvvControl?.value;
        let result = '***';
        if (val) {
            if (val !== '') {
                result = val.toString();
            }
        }
        return result;
    }

    constructor(private formBuilder: FormBuilder) {
        this.cardTypeControl = this.cardForm.get('cardType');
        this.cardNumberControl = this.cardForm.get('card');
        this.cardHolderControl = this.cardForm.get('holder');
        this.cardValidMonthControl = this.cardForm.get('validMonth');
        this.cardValidYearControl = this.cardForm.get('validYear');
        this.cardCvvControl = this.cardForm.get('cvv');
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 6; i++) {
            this.yearList.push(currentYear + i);
        }
    }

    ngOnInit(): void {
        this.cardForm.valueChanges.subscribe({
            next: (result: any) => {
                const card = new CardView();
                card.valid = this.cardForm.valid;
                if (this.cardForm.valid) {
                    card.cardNumber = this.cardNumberControl?.value;
                    card.holderName = this.cardHolderControl?.value;
                    card.monthExpired = this.cardValidMonthControl?.value;
                    card.yearExpired = this.cardValidYearControl?.value;
                    card.cvv = parseInt(this.cardCvvControl?.value, 10);
                }
                this.cardDetails.emit(card);
            }
        });
        this.cardNumberControl?.valueChanges.subscribe((val) => {
            const cardInfo = creditCardType(val);
            // If there is one card type found (no ambigous options)
            if (cardInfo.length === 1) {
                this.codeName = cardInfo[0].code.name;
                this.cvvLength = cardInfo[0].code.size;
                this.cardNumberGaps = cardInfo[0].gaps;
                this.cardTypeControl?.setValue(cardInfo[0].type);
                this.cardNumberLengths = cardInfo[0].lengths;
                if (this.cardNumberLengths.length > 0) {
                    this.cardNumberLength = this.cardNumberLengths[this.cardNumberLengths.length - 1];
                }
            } else {  // no card type or a few card types found
                this.cardNumberGaps = [];
                this.cardNumberLengths = [];
                this.cardTypeControl?.setValue('');
            }
        });
    }

    ngAfterViewInit(): void {
        const focusInput = this.cardNumberElement?.nativeElement as HTMLInputElement;
        setTimeout(() => {
            focusInput?.focus();
        }, 100);
    }
}
