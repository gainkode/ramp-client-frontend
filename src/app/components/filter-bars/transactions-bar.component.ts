import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FilterChip, FilterChipType, ProfileBaseFilter, TransactionsFilter } from 'model/filter.model';
import { TransactionSource, TransactionType, UserType } from 'model/generated-models';
import { MerchantTransactionTypeList, TransactionSourceList, UserTransactionTypeList } from 'model/payment.model';
import { AuthService } from 'services/auth.service';
import { getFormattedUtcDate } from 'utils/utils';

@Component({
	selector: 'app-transactions-filter',
	templateUrl: './transactions-bar.component.html',
	styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss']
})
export class TransactionsFilterBarComponent implements OnInit, OnDestroy {
    @Input() data: TransactionsFilter | undefined = undefined;
    @Output() update = new EventEmitter<ProfileBaseFilter>();

    private subscriptions: Subscription = new Subscription();

    transactionTypes = UserTransactionTypeList;
    walletTypes = TransactionSourceList;
    chips: FilterChip[] = [];

    filterForm = this.formBuilder.group({
    	walletTypes: [[]],
    	transactionTypes: [[]],
    	transactionDate: ['', {
    		validators: [
    			Validators.pattern('^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$')
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

    constructor(private formBuilder: UntypedFormBuilder, private auth: AuthService) {
    	if (this.auth.user?.type === UserType.Merchant) {
    		this.transactionTypes = MerchantTransactionTypeList;
    	}
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
    	this.updateChips(FilterChipType.Transaction);
    	this.updateChips(FilterChipType.Wallet);
    	this.updateChips(FilterChipType.Date);
    	this.updateChips(FilterChipType.Sender);
    	this.subscriptions.add(
    		this.transactionTypesField?.valueChanges.subscribe(val => {
    			if ((val as []).length < 1) {
    				this.transactionTypesField?.setValue(this.transactionTypes.map(x => x.id));
    			}
    			this.updateChips(FilterChipType.Transaction);
    		}));
    	this.subscriptions.add(
    		this.walletTypesField?.valueChanges.subscribe(val => {
    			if ((val as []).length < 1) {
    				this.walletTypesField?.setValue(this.walletTypes.map(x => x.id));
    			}
    			this.updateChips(FilterChipType.Wallet);
    		}));
    	this.subscriptions.add(
    		this.transactionDateField?.valueChanges.subscribe(val => {
    			this.updateChips(FilterChipType.Date);
    		}));
    	this.subscriptions.add(
    		this.senderField?.valueChanges.subscribe(val => {
    			this.updateChips(FilterChipType.Sender);
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

    private updateChips(chipType: FilterChipType): void {
    	this.chips = this.chips.filter(x => x.filterType !== chipType);
    	if (chipType === FilterChipType.Wallet) {
    		const selectedWallets = this.walletTypesField?.value as TransactionSource[];
    		if (selectedWallets.length < this.walletTypes.length) {
    			selectedWallets.forEach(w => {
    				this.chips.push({
    					filterType: chipType,
    					name: TransactionSourceList.find(x => x.id === w)?.name ?? w as string,
    					value: w
    				} as FilterChip);
    			});
    		}
    	} else if (chipType === FilterChipType.Transaction) {
    		const selectedTransactions = this.transactionTypesField?.value as TransactionType[];
    		if (selectedTransactions.length < this.transactionTypes.length) {
    			selectedTransactions.forEach(t => {
    				this.chips.push({
    					filterType: chipType,
    					name: MerchantTransactionTypeList.find(x => x.id === t)?.name ?? t as string,
    					value: t
    				} as FilterChip);
    			});
    		}
    	} else if (chipType === FilterChipType.Date) {
    		const date = this.transactionDateField?.value;
    		if (date !== '' && this.transactionDateField?.valid) {
    			this.chips.push({
    				filterType: chipType,
    				name: date
    			} as FilterChip);
    		}
    	} else if (chipType === FilterChipType.Sender) {
    		const sender = this.senderField?.value;
    		if (sender !== '') {
    			this.chips.push({
    				filterType: chipType,
    				name: sender
    			} as FilterChip);
    		}
    	}
    }

    removeChip(chip: FilterChip): void {
    	if (chip.filterType === FilterChipType.Wallet) {
    		const selectedWallets = this.walletTypesField?.value as TransactionSource[];
    		this.walletTypesField?.setValue(selectedWallets.filter(x => x !== chip.value));
    		this.updateChips(chip.filterType);
    	} else if (chip.filterType === FilterChipType.Transaction) {
    		const selectedTransactions = this.transactionTypesField?.value as TransactionType[];
    		this.transactionTypesField?.setValue(selectedTransactions.filter(x => x !== chip.value));
    		this.updateChips(chip.filterType);
    	} else if (chip.filterType === FilterChipType.Date) {
    		this.transactionDateField?.setValue('');
    	} else if (chip.filterType === FilterChipType.Sender) {
    		this.senderField?.setValue('');
    	}
    }

    resetFilter(): void {
    	this.walletTypesField?.setValue([]);
    	this.transactionTypesField?.setValue([]);
    	this.transactionDateField?.setValue('');
    	this.senderField?.setValue('');
    	this.update.emit(new TransactionsFilter(this.auth.user?.type ?? UserType.Personal));
    }

    onSubmit(): void {
    	if (this.transactionDateField?.valid) {
    		const filter = new TransactionsFilter(this.auth.user?.type ?? UserType.Personal);
    		filter.sender = this.senderField?.value;
    		filter.transactionDate = getFormattedUtcDate(this.transactionDateField?.value ?? '');
    		filter.walletTypes = this.walletTypesField?.value;
    		filter.transactionTypes = this.transactionTypesField?.value;
    		this.update.emit(filter);
    	}
    }
}
