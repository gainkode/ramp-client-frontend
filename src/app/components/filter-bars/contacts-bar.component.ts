import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContactsFilter, FilterChip, FilterChipType, ProfileBaseFilter, TransactionsFilter } from 'model/filter.model';
import { CurrencyView } from 'model/payment.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';

@Component({
	selector: 'app-contacts-filter',
	templateUrl: './contacts-bar.component.html',
	styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss']
})
export class ContactsFilterBarComponent implements OnInit, OnDestroy {
    @Input() showCreateButton = false;
    @Input() data: ContactsFilter | undefined = undefined;
    @Input() set cryptoCurrencies(val: CurrencyView[]) {
    	this.cryptoList = val;
    	this.initData();
    }
    @Output() update = new EventEmitter<ProfileBaseFilter>();
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();

    private subscriptions: Subscription = new Subscription();
    private internalLoading = false;

    chips: FilterChip[] = [];
    cryptoList: CurrencyView[] = [];

    filterForm = this.formBuilder.group({
    	currencies: [[]],
    	email: ['', { validators: [Validators.email], updateOn: 'change' }],
    	userName: [''],
    	zeroBalance: [false]
    });

    get currenciesField(): AbstractControl | null {
    	return this.filterForm.get('currencies');
    }

    get emailField(): AbstractControl | null {
    	return this.filterForm.get('email');
    }

    get userNameField(): AbstractControl | null {
    	return this.filterForm.get('userName');
    }

    get zeroBalanceField(): AbstractControl | null {
    	return this.filterForm.get('zeroBalance');
    }

    constructor(private formBuilder: UntypedFormBuilder) { }

    ngOnInit(): void {
    	this.subscriptions.add(
    		this.userNameField?.valueChanges.subscribe(val => {
    			this.updateChips(FilterChipType.UserName);
    		}));
    	this.subscriptions.add(
    		this.emailField?.valueChanges.subscribe(val => {
    			if (this.emailField?.valid) {
    				this.updateChips(FilterChipType.Email);
    			}
    		}));
    	this.subscriptions.add(
    		this.currenciesField?.valueChanges.subscribe(val => {
    			if ((val as []).length < 1) {
    				this.currenciesField?.setValue(this.cryptoList.map(x => x.symbol));
    			}
    			this.updateChips(FilterChipType.Currency);
    		}));
    	this.subscriptions.add(
    		this.zeroBalanceField?.valueChanges.subscribe(val => {
    			this.updateChips(FilterChipType.ZeroBalance);
    			if (!this.internalLoading) {
    				this.onSubmit();
    			}
    		}));
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    addContact(): void {
    	const c = new ProfileItemContainer();
    	c.container = ProfileItemContainerType.Contact;
    	c.contact = undefined;
    	this.onShowDetails.emit(c);
    }

    get selectedCurrency(): string {
    	const selected = this.currenciesField?.value as CurrencyView[];
    	if (selected.length === this.cryptoList.length) {
    		return 'ALL';
    	} else {
    		if (selected.length === 0) {
    			return '';
    		} else {
    			return '...';
    		}
    	}
    }

    private initData(): void {
    	this.internalLoading = true;
    	if (this.data && this.data.email) {
    		this.emailField?.setValue(this.data.email);
    	}
    	if (this.data && this.data.userName) {
    		this.userNameField?.setValue(this.data.userName);
    	}
    	if (this.data && this.data.currencies.length > 0) {
    		this.currenciesField?.setValue(this.data.currencies.map(x => x));
    	} else {
    		this.currenciesField?.setValue(this.cryptoList.map(x => x.symbol));
    	}
    	if (this.data && this.data.zeroBalance) {
    		this.zeroBalanceField?.setValue(this.data.zeroBalance);
    	}
    	this.updateChips(FilterChipType.Email);
    	this.updateChips(FilterChipType.UserName);
    	this.updateChips(FilterChipType.Currency);
    	this.updateChips(FilterChipType.ZeroBalance);
    	this.internalLoading = false;
    }

    private updateChips(chipType: FilterChipType): void {
    	this.chips = this.chips.filter(x => x.filterType !== chipType);
    	if (chipType === FilterChipType.Currency) {
    		const selectedCurrencies = this.currenciesField?.value as string[];
    		if (selectedCurrencies.length < this.cryptoList.length) {
    			selectedCurrencies.forEach(w => {
    				this.chips.push({
    					filterType: chipType,
    					name: w
    				} as FilterChip);
    			});
    		}
    	} else if (chipType === FilterChipType.ZeroBalance) {
    		const zeroBalanceSelected = this.zeroBalanceField?.value;
    		if (zeroBalanceSelected === true) {
    			this.chips.push({
    				filterType: chipType,
    				name: 'Zero balance'
    			} as FilterChip);
    		}
    	} else if (chipType === FilterChipType.Email) {
    		const email = this.emailField?.value;
    		if (email !== '') {
    			this.chips.push({
    				filterType: chipType,
    				name: email
    			} as FilterChip);
    		}
    	} else if (chipType === FilterChipType.UserName) {
    		const userName = this.userNameField?.value;
    		if (userName !== '') {
    			this.chips.push({
    				filterType: chipType,
    				name: userName
    			} as FilterChip);
    		}
    	}
    }

    removeChip(chip: FilterChip): void {
    	if (chip.filterType === FilterChipType.Currency) {
    		const selectedCurrencies = this.currenciesField?.value as string[];
    		this.currenciesField?.setValue(selectedCurrencies.filter(x => x !== chip.name));
    		this.updateChips(chip.filterType);
    	} else if (chip.filterType === FilterChipType.ZeroBalance) {
    		this.internalLoading = true;
    		this.zeroBalanceField?.setValue(false);
    		this.internalLoading = false;
    		this.onSubmit();
    	} else if (chip.filterType === FilterChipType.Email) {
    		this.emailField?.setValue('');
    	} else if (chip.filterType === FilterChipType.UserName) {
    		this.userNameField?.setValue('');
    	}
    }

    resetFilter(): void {
    	this.internalLoading = true;
    	this.userNameField?.setValue('');
    	this.emailField?.setValue('');
    	this.currenciesField?.setValue([]);
    	this.zeroBalanceField?.setValue(false);
    	this.internalLoading = false;
    	this.update.emit(new ContactsFilter());
    }

    onSubmit(): void {
    	if (this.emailField?.valid) {
    		const filter = new ContactsFilter();
    		filter.email = this.emailField?.value;
    		filter.userName = this.userNameField?.value;
    		filter.currenciesSize = this.cryptoList.length;
    		filter.currencies = this.currenciesField?.value;
    		filter.zeroBalance = this.zeroBalanceField?.value;
    		this.update.emit(filter);
    	}
    }
}
