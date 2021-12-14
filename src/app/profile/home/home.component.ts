import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { SettingsCurrency, SettingsCurrencyWithDefaults, User } from 'src/app/model/generated-models';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { PersonalTransactionListComponent } from '../transactions/data/transaction-list.component';
import { PersonalBalanceListComponent } from './data/balance-list.component';

@Component({
    selector: 'app-personal-home',
    templateUrl: './home.component.html',
    styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss', '../../../assets/profile.scss']
})
export class PersonalHomeComponent implements OnInit, OnDestroy {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onShowError = new EventEmitter<string>();
    private transactionsPanel!: PersonalTransactionListComponent;
    private balanceListPanel!: PersonalBalanceListComponent;
    @ViewChild('transactions') set recentTransactions(panel: PersonalTransactionListComponent) {
        if (panel) {
            this.transactionsPanel = panel;
            this.transactionsPanel.load(new TransactionsFilter());
        }
    }
    @ViewChild('balancelist') set balanceList(panel: PersonalBalanceListComponent) {
        if (panel) {
            this.balanceListPanel = panel;
            this.balanceListPanel.load(this.currencies, this.selectedFiat);
        }
    }

    loading = false;
    inProgressChart = false;
    inProgressBalance = false;
    inProgressTransactions = false;
    errorMessage = '';
    selectedFiat = '';
    currencies: SettingsCurrency[] = [];
    fiatCurrencies: SettingsCurrency[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private auth: AuthService,
        private commonService: CommonDataService,
        private profile: ProfileDataService,
        private errorHandler: ErrorService,
        private router: Router) { }

    ngOnInit(): void {
        this.loadCurrencyData(true);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadCurrencyData(startLoading: boolean): void {
        this.currencies = [];
        this.fiatCurrencies = [];
        this.inProgressChart = true;
        const currencyData = this.commonService.getSettingsCurrency();
        if (currencyData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
            this.onShowError.emit(this.errorMessage);
        } else {
            this.subscriptions.add(
                currencyData.valueChanges.subscribe(({ data }) => {
                    this.inProgressChart = false;
                    const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
                    if (startLoading) {
                        this.selectedFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
                    }
                    let itemCount = 0;
                    if (currencySettings.settingsCurrency) {
                        itemCount = currencySettings.settingsCurrency.count as number;
                        if (itemCount > 0) {
                            if (currencySettings.settingsCurrency.list) {
                                currencySettings.settingsCurrency.list.forEach(x => this.currencies.push(x));
                                let validFiat = false;
                                this.currencies.filter(x => x.fiat === true).forEach(x => {
                                    if (x.symbol === this.selectedFiat) {
                                        validFiat = true;
                                    }
                                    this.fiatCurrencies.push(x);
                                });
                                if (startLoading && !validFiat) {
                                    this.selectedFiat = 'EUR';
                                }
                                if (this.balanceListPanel) {
                                    this.balanceListPanel.load(this.currencies, this.selectedFiat);
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
}
