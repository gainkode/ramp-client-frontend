import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionsFilter, TransactionsFilterChip, TransactionsFilterType } from 'src/app/model/filter.model';
import { TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { TransactionSourceList, UserTransactionTypeList } from 'src/app/model/payment.model';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
    selector: 'app-transactions-filter',
    templateUrl: './transactions-bar.component.html',
    styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss']
})
export class TransactionsFilterBarComponent implements OnInit, OnDestroy {
    @Input() data: TransactionsFilter | undefined = undefined;
    @Output() update = new EventEmitter<TransactionsFilter>();

    private subscriptions: Subscription = new Subscription();

    transactionTypes = UserTransactionTypeList;
    walletTypes = TransactionSourceList;
    chips: TransactionsFilterChip[] = [];

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

    constructor(private formBuilder: FormBuilder) { }

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
        this.updateChips(TransactionsFilterType.Transaction);
        this.updateChips(TransactionsFilterType.Wallet);
        this.updateChips(TransactionsFilterType.Date);
        this.updateChips(TransactionsFilterType.Sender);
        this.subscriptions.add(
            this.transactionTypesField?.valueChanges.subscribe(val => {
                if ((val as []).length < 1) {
                    this.transactionTypesField?.setValue(this.transactionTypes.map(x => x.id));
                }
                this.updateChips(TransactionsFilterType.Transaction);
            }));
        this.subscriptions.add(
            this.walletTypesField?.valueChanges.subscribe(val => {
                if ((val as []).length < 1) {
                    this.walletTypesField?.setValue(this.walletTypes.map(x => x.id));
                }
                this.updateChips(TransactionsFilterType.Wallet);
            }));
        this.subscriptions.add(
            this.transactionDateField?.valueChanges.subscribe(val => {
                this.updateChips(TransactionsFilterType.Date);
            }));
        this.subscriptions.add(
            this.senderField?.valueChanges.subscribe(val => {
                this.updateChips(TransactionsFilterType.Sender);
            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get selectedTransactionTypes(): string {
        const selected = this.transactionTypesField?.value as TransactionType[];
        if (selected.length === this.transactionTypes.length) {
            return 'ALL';
        } else {
            if (selected.length === 0) {
                return '';
            } else {
                return '...';
            }
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
                return '...';
            }
        }
    }

    private updateChips(chipType: TransactionsFilterType): void {
        this.chips = this.chips.filter(x => x.filterType !== chipType);
        if (chipType === TransactionsFilterType.Wallet) {
            const selectedWallets = this.walletTypesField?.value as TransactionSource[];
            if (selectedWallets.length < this.walletTypes.length) {
                selectedWallets.forEach(w => {
                    this.chips.push({
                        filterType: chipType,
                        name: TransactionSourceList.find(x => x.id === w)?.name ?? w as string,
                        value: w
                    } as TransactionsFilterChip);
                });
            }
        } else if (chipType === TransactionsFilterType.Transaction) {
            const selectedTransactions = this.transactionTypesField?.value as TransactionType[];
            if (selectedTransactions.length < this.transactionTypes.length) {
                selectedTransactions.forEach(t => {
                    this.chips.push({
                        filterType: chipType,
                        name: UserTransactionTypeList.find(x => x.id === t)?.name ?? t as string,
                        value: t
                    } as TransactionsFilterChip);
                });
            }
        } else if (chipType === TransactionsFilterType.Date) {
            const date = this.transactionDateField?.value;
            if (date !== '' && this.transactionDateField?.valid) {
                this.chips.push({
                    filterType: chipType,
                    name: date
                } as TransactionsFilterChip);
            }
        } else if (chipType === TransactionsFilterType.Sender) {
            const sender = this.senderField?.value;
            if (sender !== '') {
                this.chips.push({
                    filterType: chipType,
                    name: sender
                } as TransactionsFilterChip);
            }
        }
    }

    removeChip(chip: TransactionsFilterChip): void {
        if (chip.filterType === TransactionsFilterType.Wallet) {
            const selectedWallets = this.walletTypesField?.value as TransactionSource[];
            this.walletTypesField?.setValue(selectedWallets.filter(x => x !== chip.value));
            this.updateChips(chip.filterType);
        } else if (chip.filterType === TransactionsFilterType.Transaction) {
            const selectedTransactions = this.transactionTypesField?.value as TransactionType[];
            this.transactionTypesField?.setValue(selectedTransactions.filter(x => x !== chip.value));
            this.updateChips(chip.filterType);
        } else if (chip.filterType === TransactionsFilterType.Date) {
            this.transactionDateField?.setValue('');
        } else if (chip.filterType === TransactionsFilterType.Sender) {
            this.senderField?.setValue('');
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
