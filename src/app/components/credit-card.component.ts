import { Component } from "@angular/core";
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
