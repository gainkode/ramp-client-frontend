import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { UserBalanceItem } from 'model/balance.model';
import { FiatVault, Rate, SettingsCurrency, UserState, VaultAccountEx } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';

@Component({
	selector: 'app-profile-balance-list',
	templateUrl: './balance-list.component.html',
	styleUrls: ['../../../../assets/button.scss', '../../../../assets/profile.scss', './balance-list.component.scss']
})
export class ProfileBalanceListComponent implements OnInit, OnDestroy {
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onUpdateTotal = new EventEmitter<number>();
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
    	const balanceData$ = this.commonService.getMyBalances().valueChanges.pipe(take(1));
    	this.balances = [];
    	this.subscriptions.add(
    		balanceData$.subscribe(({ data }) => {
    			const myState = data.myState as UserState;
    			this.balances = [];
    			this.handleTransactions(myState.vaults ?? [], myState.fiatVaults ?? []);
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

    private handleTransactions(vaults: VaultAccountEx[], fiats: FiatVault[]): void {
    	let available = 0;
    	if (vaults.length > 0) {
    		vaults.forEach(vault => {
    			vault.balancesPerAsset?.forEach(balance => {
    				available += balance.availableBalanceFiat ?? 0;
    				const balanceItem = this.balances.find(b => b.id === balance.assetId);
    				if (balanceItem) {
    					balanceItem.increaseCrypto(balance.availableBalance);
    					balanceItem.increaseFiat(balance.availableBalanceFiat);
    				} else {
    					const currency = this.currencies.find(c => c.symbol === balance.assetId);
    					if (currency) {
    						const cv = new CurrencyView(currency);
    						this.balances.push(new UserBalanceItem(
    							balance,
    							cv.code,
    							cv.display,
    							this.currentCurrency,
    							this.fiatPrecision,
    							currency.precision,
    							0, 0));
    					}
    				}
    			});
    		});
    	}
    	if (fiats.length > 0) {
    		fiats.forEach(vault => {
    			available += vault.generalBalance ?? 0;
    			const balanceItem = this.balances.find(b => b.id === vault.currency);
    			if (balanceItem) {
    				balanceItem.increaseCrypto(0);
    				balanceItem.increaseFiat(vault.generalBalance ?? 0);
    			} else {
    				const vaultCurrency = this.currencies.find(c => c.symbol === vault.currency);
    				const userCurrency = this.currencies.find(c => c.symbol === this.auth.user?.defaultFiatCurrency ?? 'EUR');
    				if (vaultCurrency) {
    					this.balances.push(new UserBalanceItem(
    						undefined,
    						vaultCurrency?.symbol ?? 'EUR',
    						vaultCurrency?.symbol ?? 'EUR',
    						userCurrency?.symbol ?? 'EUR',
    						userCurrency?.precision ?? 2,
    						vaultCurrency?.precision ?? 2,
    						vault.balance ?? 0,
    						vault.generalBalance ?? 0));
    				}
    			}
    		});
    	}
    	this.onUpdateTotal.emit(available);
    }
}
