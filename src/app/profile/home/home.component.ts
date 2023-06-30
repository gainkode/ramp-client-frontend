import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { TransactionsFilter } from 'model/filter.model';
import { SettingsCurrency, SettingsCurrencyWithDefaults, User, UserType } from 'model/generated-models';
import { ProfileItemContainer } from 'model/profile-item.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';
import { getCurrencySign } from 'utils/utils';
import { ProfileTransactionListComponent } from '../transactions/data/transaction-list.component';
import { ProfileBalanceListComponent } from './data/balance-list.component';

@Component({
	selector: 'app-profile-home',
	templateUrl: './home.component.html',
	styleUrls: ['../../../assets/menu.scss', '../../../assets/profile.scss']
})
export class ProfileHomeComponent implements OnInit, OnDestroy {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onShowError = new EventEmitter<string>();
    private transactionsPanel!: ProfileTransactionListComponent;
    private balanceListPanel!: ProfileBalanceListComponent;
    @ViewChild('transactions') set recentTransactions(panel: ProfileTransactionListComponent) {
    	if (panel) {
    		this.transactionsPanel = panel;
    		this.transactionsPanel.load(new TransactionsFilter(this.auth.user?.type ?? UserType.Personal));
    	}
    }
    @ViewChild('balancelist') set balanceList(panel: ProfileBalanceListComponent) {
    	if (panel) {
    		this.balanceListPanel = panel;
    		this.balanceListPanel.load(this.currencies, this.defaultFiat);
    	}
    }

    loading = false;
    inProgressChart = false;
    inProgressBalance = false;
    inProgressTransactions = false;
    errorMessage = '';
    selectedFiat = '';
    defaultFiat = '';
    totalFiat = '';
    totalFiatValue = 0;
    totalFiatInit = false;
    currencies: SettingsCurrency[] = [];
    fiatCurrencies: SettingsCurrency[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(
    	private changeDetector: ChangeDetectorRef,
    	private auth: AuthService,
    	private commonService: CommonDataService,
    	private errorHandler: ErrorService,
    	private router: Router) { }

    ngOnInit(): void {
    	this.defaultFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
    	this.totalFiat = `${getCurrencySign(this.defaultFiat)}0`;
    	this.totalFiatInit = false;
    	this.totalFiatValue = 0;
    	this.loadCurrencyData(true);
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    private loadCurrencyData(startLoading: boolean): void {
    	this.currencies = [];
    	this.fiatCurrencies = [];
    	this.inProgressChart = true;
    	const currencyData$ = this.commonService.getSettingsCurrency().valueChanges.pipe(take(1));
    	this.subscriptions.add(
    		currencyData$.subscribe(({ data }) => {
    			this.inProgressChart = false;
    			const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
    			if (startLoading) {
    				this.selectedFiat = this.defaultFiat;
    			}
    			let itemCount = 0;
    			if (currencySettings.settingsCurrency) {
    				itemCount = currencySettings.settingsCurrency.count as number;
    				if (itemCount > 0) {
    					if (currencySettings.settingsCurrency.list) {
    						currencySettings.settingsCurrency.list.forEach(x => this.currencies.push(x));
    						let validFiat = false;
    						this.currencies.filter(x => x.fiat === true && x.symbol === this.defaultFiat).forEach(x => {
    							if (x.symbol === this.selectedFiat) {
    								validFiat = true;
    							}
    							this.fiatCurrencies.push(x);
    						});
    						if (startLoading && !validFiat) {
    							this.selectedFiat = 'EUR';
    						}
    						if (this.balanceListPanel) {
    							this.balanceListPanel.load(this.currencies, this.defaultFiat);
    						}
    					}
    				}
    			}
    		}, (error) => {
    			this.inProgressChart = false;
    			if (this.balanceListPanel) {
    				this.balanceListPanel.clear();
    			}
    			if (this.auth.token !== '') {
    				this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currency data');
    				this.onShowError.emit(this.errorMessage);
    			} else {
    				this.router.navigateByUrl('/');
    			}
    		})
    	);
    }

    currencyChanged(val: string): void {
    	if (this.selectedFiat !== val) {
    		this.selectedFiat = val;
    		if (this.balanceListPanel) {
    			this.balanceListPanel.load(this.currencies, this.selectedFiat);
    		}
    	}
    }

    handleError(val: string): void {
    	this.errorMessage = val;
    	this.onShowError.emit(this.errorMessage);
    	this.changeDetector.detectChanges();
    }

    chartProgressChanged(visible: boolean): void {
    	this.inProgressChart = visible;
    	this.loading = this.inProgressChart || this.inProgressBalance || this.inProgressTransactions;
    	this.changeDetector.detectChanges();
    }

    totalBalanceUpdate(total: number): void {
    	this.totalFiatInit = false;
    	this.totalFiatValue = -1;
    	this.changeDetector.detectChanges();
    	this.totalFiatInit = true;
    	this.changeDetector.detectChanges();
    	const c = this.currencies.find(x => x.symbol === this.defaultFiat);
    	this.totalFiat = `${getCurrencySign(this.defaultFiat)}${total.toFixed(c?.precision ?? 2)}`;
    	this.totalFiatValue = total;
    	this.changeDetector.detectChanges();
    }

    balanceProgressChanged(visible: boolean): void {
    	this.inProgressBalance = visible;
    	this.loading = this.inProgressChart || this.inProgressBalance || this.inProgressTransactions;
    	this.changeDetector.detectChanges();
    }

    transactionProgressChanged(visible: boolean): void {
    	this.inProgressTransactions = visible;
    	this.loading = this.inProgressChart || this.inProgressBalance || this.inProgressTransactions;
    	this.changeDetector.detectChanges();
    }

    showTransactionDetails(details: ProfileItemContainer): void {
    	this.onShowDetails.emit(details);
    }

    updateHomeData(): void {
    	if (this.balanceListPanel) {
    		this.balanceListPanel.load(this.currencies, this.defaultFiat);
    	}
    	this.transactionsPanel.load(new TransactionsFilter(this.auth.user?.type ?? UserType.Personal));
    }

    updateTransactionStatus(transactionId: string): void {
    	this.transactionsPanel.updateTransactionStatus(transactionId);
    }
}
