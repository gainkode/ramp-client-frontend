import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserBalanceItem } from 'src/app/model/balance.model';
import { Rate, SettingsCurrency, UserState, VaultAccountEx } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
    selector: 'app-personal-balance-list',
    templateUrl: './balance-list.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/profile.scss', './balance-list.component.scss']
})
export class PersonalBalanceListComponent implements OnInit, OnDestroy {
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    currencies: SettingsCurrency[] = [];
    currentCurrency = '';
    balances: UserBalanceItem[] = [];
    rates: Rate[] = [];
    private subscriptions: Subscription = new Subscription();
    private fiatPrecision = 0;

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private commonService: CommonDataService,
        private router: Router) {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    load(currencyList: SettingsCurrency[], fiatCurrency: string): void {
        this.onError.emit('');
        this.currencies = [];
        this.balances = [];
        this.currentCurrency = fiatCurrency;
        if (currencyList.length > 0 && this.currentCurrency !== '') {
            currencyList.forEach(x => this.currencies.push(x));
            this.fiatPrecision = 0;
            const currentFiat = this.currencies.find(x => x.symbol === this.currentCurrency);
            if (currentFiat) {
                this.fiatPrecision = currentFiat.precision;
            }
            this.loadBalanceData();
        }
    }

    clear(): void {
        this.currencies = [];
    }

    showWallets(id: string): void {
        this.router.navigateByUrl(`${this.auth.getUserMainPage()}/wallets;balance=true;currencies=${id.toLowerCase()}`);
    }

    private loadBalanceData(): void {
        this.onProgress.emit(true);
        const balanceData = this.commonService.getMyBalances();
        if (balanceData === null) {
            this.onProgress.emit(false);
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.balances = [];
            this.subscriptions.add(
                balanceData.valueChanges.subscribe(({ data }) => {
                    const myState = data.myState as UserState;
                    this.balances = [];
                    this.handleTransactions(myState.vaults ?? []);
                    this.onProgress.emit(false);
                }, (error) => {
                    this.onProgress.emit(false);
                    if (this.auth.token !== '') {
                        this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load balance data'));
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private handleTransactions(vaults: VaultAccountEx[]): void {
        if (vaults.length > 0) {
            vaults.forEach(vault => {
                vault.balancesPerAsset?.forEach(balance => {
                    const balanceItem = this.balances.find(b => b.id === balance.assetId);
                    if (balanceItem) {
                        balanceItem.increaseCrypto(balance.totalBalance);
                        balanceItem.increaseFiat(balance.totalBalanceFiat);
                    } else {
                        const currency = this.currencies.find(c => c.symbol === balance.assetId);
                        if (currency) {
                            this.balances.push(new UserBalanceItem(balance, currency.name, this.currentCurrency, this.fiatPrecision));
                        }
                    }
                });
            });
        }
    }
}
