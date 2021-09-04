import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-transactions-filter',
    templateUrl: './transactions-bar.component.html',
    styleUrls: ['../../menu.scss', '../../button.scss']
})
export class TransactionsFilterBarComponent {
    @Output() update = new EventEmitter<TransactionsFilter>();

    filterForm = this.formBuilder.group({
        walletTypes: [[]],
        transactionTypes: [[]],
        transactionDate: ['', {
            validators: [Validators.pattern('^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$')
            ], updateOn: 'change'
        }],
        sender: ['']
    });

    get walletTypesField(): AbstractControl | null {
        return this.filterForm.get('walletTypes');
    }
    get transactionTypesField(): AbstractControl | null {
        return this.filterForm.get('transactionTypes');
    }
    get transactionDateField(): AbstractControl | null {
        return this.filterForm.get('transactionDate');
    }
    get senderField(): AbstractControl | null {
        return this.filterForm.get('sender');
    }

    constructor(private formBuilder: FormBuilder, private profileService: ProfileDataService) {

    }

    resetFilter(): void {
        this.walletTypesField?.setValue([]);
        this.transactionTypesField?.setValue([]);
        this.transactionDateField?.setValue('');
        this.senderField?.setValue('');
        this.update.emit(new TransactionsFilter());
    }

    onSubmit(): void {
        const filter = new TransactionsFilter();

        if (this.transactionDateField?.valid) {
            console.log(this.transactionDateField?.value, 'valid');
        } else {
            console.log(this.transactionDateField?.value, 'invalid');
        }
        // form filter here

        this.update.emit(filter);
    }
}
