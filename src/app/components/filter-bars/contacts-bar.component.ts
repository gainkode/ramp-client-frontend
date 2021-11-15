import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContactsFilter, FilterChip, FilterChipType, ProfileBaseFilter, TransactionsFilter } from 'src/app/model/filter.model';

@Component({
    selector: 'app-contacts-filter',
    templateUrl: './contacts-bar.component.html',
    styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss']
})
export class ContactsFilterBarComponent implements OnInit, OnDestroy {
    @Input() data: ContactsFilter | undefined = undefined;
    @Output() update = new EventEmitter<ProfileBaseFilter>();

    private subscriptions: Subscription = new Subscription();

    chips: FilterChip[] = [];

    filterForm = this.formBuilder.group({
        email: ['', { validators: [Validators.email], updateOn: 'change' }],
        userName: ['']
    });

    get emailField(): AbstractControl | null {
        return this.filterForm.get('email');
    }

    get userNameField(): AbstractControl | null {
        return this.filterForm.get('userName');
    }

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        if (this.data && this.data.email) {
            this.emailField?.setValue(this.data.email);
        }
        if (this.data && this.data.userName) {
            this.userNameField?.setValue(this.data.userName);
        }
        this.updateChips(FilterChipType.Email);
        this.updateChips(FilterChipType.UserName);
        this.subscriptions.add(
            this.userNameField?.valueChanges.subscribe(val => {
                this.updateChips(FilterChipType.UserName);
            }));
        this.subscriptions.add(
            this.emailField?.valueChanges.subscribe(val => {
                this.updateChips(FilterChipType.Email);
            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    addContact(): void {

    }
    
    // get selectedTransactionTypes(): string {
    //     const selected = this.transactionTypesField?.value as TransactionType[];
    //     if (selected.length === this.transactionTypes.length) {
    //         return 'ALL';
    //     } else {
    //         if (selected.length === 0) {
    //             return '';
    //         } else {
    //             return '...';
    //         }
    //     }
    // }

    // get selectedWalletTypes(): string {
    //     const selected = this.walletTypesField?.value as TransactionSource[];
    //     if (selected.length === this.walletTypes.length) {
    //         return 'ALL';
    //     } else {
    //         if (selected.length === 0) {
    //             return '';
    //         } else {
    //             return '...';
    //         }
    //     }
    // }

    private updateChips(chipType: FilterChipType): void {
        // this.chips = this.chips.filter(x => x.filterType !== chipType);
        // if (chipType === TransactionsFilterType.Wallet) {
        //     const selectedWallets = this.walletTypesField?.value as TransactionSource[];
        //     if (selectedWallets.length < this.walletTypes.length) {
        //         selectedWallets.forEach(w => {
        //             this.chips.push({
        //                 filterType: chipType,
        //                 name: TransactionSourceList.find(x => x.id === w)?.name ?? w as string,
        //                 value: w
        //             } as TransactionsFilterChip);
        //         });
        //     }
        // } else if (chipType === TransactionsFilterType.Transaction) {
        //     const selectedTransactions = this.transactionTypesField?.value as TransactionType[];
        //     if (selectedTransactions.length < this.transactionTypes.length) {
        //         selectedTransactions.forEach(t => {
        //             this.chips.push({
        //                 filterType: chipType,
        //                 name: UserTransactionTypeList.find(x => x.id === t)?.name ?? t as string,
        //                 value: t
        //             } as TransactionsFilterChip);
        //         });
        //     }
        // } else if (chipType === TransactionsFilterType.Date) {
        //     const date = this.transactionDateField?.value;
        //     if (date !== '' && this.transactionDateField?.valid) {
        //         this.chips.push({
        //             filterType: chipType,
        //             name: date
        //         } as TransactionsFilterChip);
        //     }
        // } else if (chipType === TransactionsFilterType.Sender) {
        //     const sender = this.senderField?.value;
        //     if (sender !== '') {
        //         this.chips.push({
        //             filterType: chipType,
        //             name: sender
        //         } as TransactionsFilterChip);
        //     }
        // }
    }

    removeChip(chip: FilterChip): void {
        if (chip.filterType === FilterChipType.Email) {
            this.emailField?.setValue('');
        } else if (chip.filterType === FilterChipType.UserName) {
            this.userNameField?.setValue('');
        }
    }

    resetFilter(): void {
        this.userNameField?.setValue('');
        this.emailField?.setValue('');
        this.update.emit(new TransactionsFilter());
    }

    onSubmit(): void {
        if (this.emailField?.valid) {
            const filter = new ContactsFilter();
            filter.email = this.emailField?.value;
            filter.userName = this.userNameField?.value;
            this.update.emit(filter);
        }
    }
}
