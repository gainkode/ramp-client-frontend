import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileBaseFilter, WalletsFilter, WalletsFilterChip, WalletsFilterType } from 'src/app/model/filter.model';

@Component({
    selector: 'app-wallets-filter',
    templateUrl: './wallets-bar.component.html',
    styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss']
})
export class WalletsFilterBarComponent implements OnInit, OnDestroy {
    @Input() data: WalletsFilter | undefined = undefined;
    @Output() update = new EventEmitter<ProfileBaseFilter>();

    private subscriptions: Subscription = new Subscription();

    chips: WalletsFilterChip[] = [];

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
        if (this.data && this.data.currencies.length > 0) {
            this.currenciesField?.setValue(this.data.currencies.map(x => x));
        } else {
            this.currenciesField?.setValue([]);
        }
        if (this.data && this.data.zeroBalance) {
            this.currenciesField?.setValue(this.data.zeroBalance);
        }
        this.updateChips(WalletsFilterType.Currency);
        this.updateChips(WalletsFilterType.ZeroBalance);
        this.subscriptions.add(
            this.currenciesField?.valueChanges.subscribe(val => {
                if ((val as []).length < 1) {
                    this.currenciesField?.setValue(val);
                }
                this.updateChips(WalletsFilterType.Currency);
                this.onSubmit();
            }));
        this.subscriptions.add(
            this.zeroBalanceField?.valueChanges.subscribe(val => {
                this.updateChips(WalletsFilterType.ZeroBalance);
                this.onSubmit();
            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get selectedCurrency(): string {
        // const selected = this.transactionTypesField?.value as TransactionType[];
        // if (selected.length === this.transactionTypes.length) {
        //     return 'ALL';
        // } else {
        //     if (selected.length === 0) {
        //         return '';
        //     } else {
        //         return '...';
        //     }
        // }
        return 'Debug';
    }

    private updateChips(chipType: WalletsFilterType): void {
        this.chips = this.chips.filter(x => x.filterType !== chipType);
        if (chipType === WalletsFilterType.Currency) {
            const selectedCurrencies = this.currenciesField?.value as string[];
            // if (selectedCurrencies.length < this.walletTypes.length) {
            //     selectedCurrencies.forEach(w => {
            //         this.chips.push({
            //             filterType: chipType,
            //             name: w
            //         } as WalletsFilterChip);
            //     });
            // }
        } else if (chipType === WalletsFilterType.ZeroBalance) {
            const zeroBalanceSelected = this.zeroBalanceField?.value;
            if (zeroBalanceSelected !== '') {
                this.chips.push({
                    filterType: chipType,
                    name: 'Zero balance'
                } as WalletsFilterChip);
            }
        }
    }

    removeChip(chip: WalletsFilterChip): void {
        if (chip.filterType === WalletsFilterType.Currency) {
            // const selectedWallets = this.walletTypesField?.value as TransactionSource[];
            // this.walletTypesField?.setValue(selectedWallets.filter(x => x !== chip.value));
            this.updateChips(chip.filterType);
        } else if (chip.filterType === WalletsFilterType.ZeroBalance) {
            this.zeroBalanceField?.setValue(false);
        }
        this.onSubmit();
    }

    resetFilter(): void {
        this.currenciesField?.setValue([]);
        this.zeroBalanceField?.setValue(false);
        this.update.emit(new WalletsFilter());
    }

    onSubmit(): void {
        const filter = new WalletsFilter();
        filter.currencies = this.currenciesField?.value;
        filter.zeroBalance = this.zeroBalanceField?.value;
        this.update.emit(filter);
    }
}
