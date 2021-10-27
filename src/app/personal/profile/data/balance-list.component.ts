import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserBalanceItem } from 'src/app/model/balance.model';
import { Rate, SettingsCurrency, UserState, UserTransactionSummary } from 'src/app/model/generated-models';
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
        private paymentService: PaymentDataService,
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
            this.loadRates();
        }
    }

    clear(): void {
        this.currencies = [];
    }

    private loadRates(): void {
        const listCrypto: string[] = [];
        this.currencies.filter(x => x.fiat === false).forEach(x => listCrypto.push(x.symbol));
        const ratesData = this.paymentService.getRates(listCrypto, this.currentCurrency);
        if (ratesData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.onProgress.emit(true);
            this.rates = [];
            this.subscriptions.add(
                ratesData.valueChanges.subscribe(({ data }) => {
                    (data.getRates as Rate[]).forEach(x => this.rates.push(x));
                    this.loadBalanceData();
                }, (error) => {
                    this.onProgress.emit(false);
                    if (this.auth.token !== '') {
                        this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load exchange reates'));
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
            this.onProgress.emit(false);
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.balances = [];
            this.subscriptions.add(
                balanceData.valueChanges.subscribe(({ data }) => {
                    const myState = data.myState as UserState;
                    this.balances = [];
                    this.handleTransactions(myState.transactionSummary as UserTransactionSummary[] | undefined);
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
