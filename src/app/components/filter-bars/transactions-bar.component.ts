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
        if (this.transactionDateField?.valid) {
            const filter = new TransactionsFilter();
            filter.sender = this.senderField?.value;
            const dateFilter = this.transactionDateField?.value ?? '';
            if (dateFilter !== '') {
                const dateParts = dateFilter.split('/');
                const d = parseInt(dateParts[0]);
                const m = parseInt(dateParts[1]);
                let y = parseInt(dateParts[2]);
                if (y < 100) {
                    y += 2000;
                }
                filter.transactionDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
            }
            console.log(filter);
            this.update.emit(filter);
        }
    }
}
