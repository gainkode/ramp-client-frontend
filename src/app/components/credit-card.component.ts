import { Component, HostListener } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";

@Component({
    selector: 'app-credit-card',
    templateUrl: 'credit-card.component.html',
    styleUrls: ['credit-card.component.scss']
})
export class CreditCardComponent {
    monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    yearList: number[] = [];
    cardForm = this.formBuilder.group({
        card: ['', { validators: [Validators.required], updateOn: 'change' }],
        holder: ['', { validators: [Validators.required], updateOn: 'change' }],
        validMonth: [0, { validators: [Validators.required], updateOn: 'change' }],
        validYear: [0, { validators: [Validators.required], updateOn: 'change' }],
        cvv: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    cardNumberControl: AbstractControl | null = null;
    cardHolderControl: AbstractControl | null = null;
    cardValidMonthControl: AbstractControl | null = null;
    cardValidYearControl: AbstractControl | null = null;
    cardCvvControl: AbstractControl | null = null;

    get cardNumberValue(): string {
        const val = this.cardNumberControl?.value;
        let result = '1111 2222 3333 4444';
        if (val) {
            if (val !== '') {
                let s = '';
                const cardNum = val as string;
                const len = cardNum.length;
                for (let i = 0; i < len; i++) {
                    s += cardNum[i];
                    if (i === 3 || i === 7 || i === 11) {
                        s += ' ';
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
        let result: string = '01';
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
        let year = new Date().getFullYear();
        if (val) {
            if (val !== '') {
                year = val;
            }
        }
        return year.toString().slice(2, 4);
    }

    get cardCvvValue(): string {
        const val = this.cardCvvControl?.value;
        let result = '985';
        if (val) {
            if (val !== '') {
                result = val.toString();
            }
        }
        return result;
    }

    constructor(private formBuilder: FormBuilder) {
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
}
