import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { TransactionSourceList, UserTransactionTypeList } from 'src/app/model/payment.model';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
    selector: 'app-transactions-filter',
    templateUrl: './transactions-bar.component.html',
    styleUrls: ['../../menu.scss', '../../button.scss']
})
export class TransactionsFilterBarComponent implements OnInit {
    @Input() data: TransactionsFilter | undefined = undefined;
    @Output() update = new EventEmitter<TransactionsFilter>();

    transactionTypes = UserTransactionTypeList;
    walletTypes = TransactionSourceList;

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

    constructor(private formBuilder: FormBuilder) {

    }

    ngOnInit(): void {
        if (this.data && this.data.transactionTypes.length > 0) {
            this.transactionTypesField?.setValue(this.data.transactionTypes.map(x => x));
        } else {
            this.transactionTypesField?.setValue(this.transactionTypes.map(x => x.id));
        }
        if (this.data && this.data.transactionTypes.length > 0) {
            this.walletTypesField?.setValue(this.data.walletTypes.map(x => x));
        } else {
            this.walletTypesField?.setValue(this.walletTypes.map(x => x.id));
        }
        if (this.data && this.data.transactionDate) {
            const d = `${this.data.transactionDate.getDate()}/${this.data.transactionDate.getMonth() + 1}/${this.data.transactionDate.getFullYear()}`;
            this.transactionDateField?.setValue(d);
        }
        if (this.data && this.data.sender) {
            this.senderField?.setValue(this.data.sender);
        }
        this.transactionTypesField?.valueChanges.subscribe(val => {
            if ((val as []).length < 1) {
                this.transactionTypesField?.setValue(this.transactionTypes.map(x => x.id));
            }
        });
        this.walletTypesField?.valueChanges.subscribe(val => {
            if ((val as []).length < 1) {
                this.walletTypesField?.setValue(this.walletTypes.map(x => x.id));
            }
        });
    }

    get selectedTransactionTypes(): string {
        const selected = this.transactionTypesField?.value as TransactionType[];
        if (selected.length === this.transactionTypes.length) {
            return 'ALL';
        } else {
            if (selected.length === 0) {
                return '';
            } else {
                const firstItem = selected[0];
                const index = this.transactionTypes.findIndex(x => x.id === firstItem);
                let result =  this.transactionTypes[index].name;
                return result;
            }
        }
    }

    get selectedTransactionTypesExtra(): string {
        const selected = this.transactionTypesField?.value as TransactionType[];
        if (selected.length > 1 && selected.length < this.transactionTypes.length) {
            return ' +';
        } else {
            return '';
        }
    }

    get selectedWalletTypes(): string {
        const selected = this.walletTypesField?.value as TransactionSource[];
        if (selected.length === this.walletTypes.length) {
            return 'ALL';
        } else {
            if (selected.length === 0) {
                return '';
            } else {
                const firstItem = selected[0];
                const index = this.walletTypes.findIndex(x => x.id === firstItem);
                let result =  this.walletTypes[index].name;
                return result;
            }
        }
    }

    get selectedWalletTypesExtra(): string {
        const selected = this.walletTypesField?.value as TransactionSource[];
        if (selected.length > 1 && selected.length < this.walletTypes.length) {
            return ' +';
        } else {
            return '';
        }
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
            filter.transactionDate = getFormattedUtcDate(this.transactionDateField?.value ?? '');
            filter.walletTypes = this.walletTypesField?.value;
            filter.transactionTypes = this.transactionTypesField?.value;
            this.update.emit(filter);
        }
    }
}
