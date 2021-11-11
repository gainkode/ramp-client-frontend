import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileBaseFilter, WalletsFilter, WalletsFilterChip, WalletsFilterType } from 'src/app/model/filter.model';
import { CurrencyView } from 'src/app/model/payment.model';

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

    chips: WalletsFilterChip[] = [];
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

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.currenciesField?.valueChanges.subscribe(val => {
                if ((val as []).length < 1) {
                    this.currenciesField?.setValue(this.cryptoList.map(x => x.id));
                }
                this.updateChips(WalletsFilterType.Currency);
            }));
        this.subscriptions.add(
            this.zeroBalanceField?.valueChanges.subscribe(val => {
                this.updateChips(WalletsFilterType.ZeroBalance);
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
            this.currenciesField?.setValue(this.cryptoList.map(x => x.id));
        }
        if (this.data && this.data.zeroBalance) {
            this.zeroBalanceField?.setValue(this.data.zeroBalance);
        }
        this.updateChips(WalletsFilterType.Currency);
        this.updateChips(WalletsFilterType.ZeroBalance);
        this.internalLoading = false;
    }

    private updateChips(chipType: WalletsFilterType): void {
        this.chips = this.chips.filter(x => x.filterType !== chipType);
        if (chipType === WalletsFilterType.Currency) {
            const selectedCurrencies = this.currenciesField?.value as string[];
            if (selectedCurrencies.length < this.cryptoList.length) {
                selectedCurrencies.forEach(w => {
                    this.chips.push({
                        filterType: chipType,
                        name: w
                    } as WalletsFilterChip);
                });
            }
        } else if (chipType === WalletsFilterType.ZeroBalance) {
            const zeroBalanceSelected = this.zeroBalanceField?.value;
            if (zeroBalanceSelected === true) {
                this.chips.push({
                    filterType: chipType,
                    name: 'Zero balance'
                } as WalletsFilterChip);
            }
        }
    }

    removeChip(chip: WalletsFilterChip): void {
        if (chip.filterType === WalletsFilterType.Currency) {
            const selectedCurrencies = this.currenciesField?.value as string[];
            this.currenciesField?.setValue(selectedCurrencies.filter(x => x !== chip.name));
            this.updateChips(chip.filterType);
        } else if (chip.filterType === WalletsFilterType.ZeroBalance) {
            this.internalLoading = true;
            this.zeroBalanceField?.setValue(false);
            this.internalLoading = false;
        }
        this.onSubmit();
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
