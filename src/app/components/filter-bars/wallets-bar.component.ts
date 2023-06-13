import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileBaseFilter, WalletsFilter, FilterChip, FilterChipType } from 'model/filter.model';
import { CurrencyView } from 'model/payment.model';

@Component({
	selector: 'app-wallets-filter',
	templateUrl: './wallets-bar.component.html',
	styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss']
})
export class WalletsFilterBarComponent implements OnInit, OnDestroy {
    @Input() data: WalletsFilter | undefined = undefined;
    @Input() set cryptoCurrencies(val: CurrencyView[]) {
    	this.cryptoList = val;
    	this.initData();
    }
    @Output() update = new EventEmitter<ProfileBaseFilter>();

    private subscriptions: Subscription = new Subscription();
    private internalLoading = false;

    chips: FilterChip[] = [];
    cryptoList: CurrencyView[] = [];

    filterForm = this.formBuilder.group({
    	currencies: [[]],
    	zeroBalance: [false]
    });

    get currenciesField(): AbstractControl | null {
    	return this.filterForm.get('currencies');
    }

    get zeroBalanceField(): AbstractControl | null {
    	return this.filterForm.get('zeroBalance');
    }

    constructor(private formBuilder: UntypedFormBuilder) { }

    ngOnInit(): void {
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
    	if (this.data && this.data.currencies.length > 0) {
    		this.currenciesField?.setValue(this.data.currencies.map(x => x));
    	} else {
    		this.currenciesField?.setValue(this.cryptoList.map(x => x.symbol));
    	}
    	if (this.data?.zeroBalance) {
    		this.zeroBalanceField?.setValue(this.data.zeroBalance);
    	}
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
    	}
    }

    removeChip(chip: FilterChip): void {
    	if (chip.filterType === FilterChipType.Currency) {
    		const selectedCurrencies = this.currenciesField?.value as string[];
    		this.currenciesField?.setValue(selectedCurrencies.filter(x => x !== chip.name));
    		this.updateChips(chip.filterType);
    	}
    }

    resetFilter(): void {
    	this.internalLoading = true;
    	this.currenciesField?.setValue([]);
    	this.zeroBalanceField?.setValue(false);
    	this.internalLoading = false;
    	this.update.emit(new WalletsFilter());
    }

    onSubmit(): void {
    	const filter = new WalletsFilter();
    	filter.currenciesSize = this.cryptoList.length;
    	filter.currencies = this.currenciesField?.value;
    	filter.zeroBalance = this.zeroBalanceField?.value;
    	this.update.emit(filter);
    }
}
