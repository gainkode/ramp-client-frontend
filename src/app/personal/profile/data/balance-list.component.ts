import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserBalanceItem } from 'src/app/model/balance.model';
import { Rate, SettingsCurrency, SettingsCurrencyWithDefaults, UserState, UserTransactionSummary } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';

@Component({
    selector: 'app-personal-balance-list',
    templateUrl: './balance-list.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/profile.scss', './balance-list.component.scss']
})
export class PersonalBalanceListComponent implements OnInit, OnDestroy {
    @Input() currentCurrency = 'USD';
    errorMessage = '';
    inProgress = false;
    currencies: SettingsCurrency[] = [];
    balances: UserBalanceItem[] = [];
    rates: Rate[] = [];
    private defaultCrypto = '';
    private defaultFiat = '';
    private subscriptions: Subscription = new Subscription();
    private fiatPrecision = 0;

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private paymentService: PaymentDataService,
        private commonService: CommonDataService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.loadCurrencyData();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadCurrencyData(): void {
        this.currencies = [];
        this.balances = [];
        this.rates = [];
        this.fiatPrecision = 0;
        this.inProgress = true;
        const currencyData = this.commonService.getSettingsCurrency();
        if (currencyData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.subscriptions.add(
                currencyData.valueChanges.subscribe(({ data }) => {
                    const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
                    this.defaultCrypto = currencySettings.defaultCrypto ?? '';
                    this.defaultFiat = currencySettings.defaultFiat ?? '';
                    let itemCount = 0;
                    if (currencySettings.settingsCurrency) {
                        itemCount = currencySettings.settingsCurrency.count as number;
                        if (itemCount > 0) {
                            if (currencySettings.settingsCurrency.list) {
                                currencySettings.settingsCurrency.list.forEach(x => this.currencies.push(x));
                                const currentFiat = this.currencies.find(x => x.symbol === this.currentCurrency);
                                if (currentFiat) {
                                    this.fiatPrecision = currentFiat.precision;
                                }
                                this.loadRates();
                            }
                        }
                    }
                }, (error) => {
                    this.inProgress = false;
                    if (this.auth.token !== '') {
                        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currency data');
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private loadRates(): void {
        const listCrypto: string[] = [];
        this.currencies.filter(x => x.fiat === false).forEach(x => listCrypto.push(x.symbol));
        const ratesData = this.paymentService.getRates(listCrypto, this.currentCurrency);
        if (ratesData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.subscriptions.add(
                ratesData.valueChanges.subscribe(({ data }) => {
                    (data.getRates as Rate[]).forEach(x => this.rates.push(x));
                    this.loadBalanceData();
                }, (error) => {
                    this.inProgress = false;
                    if (this.auth.token !== '') {
                        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load exchange reates');
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private loadBalanceData(): void {
        const balanceData = this.commonService.getMyState();
        if (balanceData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.subscriptions.add(
                balanceData.valueChanges.subscribe(({ data }) => {
                    const myState = data.myState as UserState;
                    this.handleTransactions(myState.transactionSummary as UserTransactionSummary[] | undefined);
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    if (this.auth.token !== '') {
                        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load balance data');
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private handleTransactions(summary: UserTransactionSummary[] | undefined): void {
        if (summary) {
            summary.forEach(x => {
                if (x.assetId) {
                    const currency = this.currencies.find(c => c.symbol === x.assetId);
                    const rate = this.rates.find(r => r.currencyFrom === x.assetId);
                    if (currency && rate) {
                        this.balances.push(new UserBalanceItem(x, currency.name, this.currentCurrency, this.fiatPrecision, rate.originalRate));
                    }
                }
            });
        }
    }
}
