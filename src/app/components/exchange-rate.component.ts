import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Subscription, timer } from 'rxjs';
import { Rate, TransactionType } from '../model/generated-models';
import { CheckoutSummary } from '../model/payment.model';
import { ErrorService } from '../services/error.service';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';

@Component({
    selector: 'app-exchange-rate',
    templateUrl: 'exchange-rate.component.html',
    styleUrls: ['exchange-rate.component.scss']
})
export class ExchangeRateComponent implements OnInit, OnDestroy {
    @Input() summary: CheckoutSummary | null | undefined = null;
    @Output() update = new EventEmitter<Rate>();

    spinnerMode: ProgressSpinnerMode = 'determinate';
    spinnerValue = 0;
    countDown = 0;
    countDownInit = false;
    errorMessage = '';
    private pRateSubscription!: any;
    private pTimerSubscription!: any;
    updatingTimer = timer(0, 1000);

    constructor(private dataService: QuickCheckoutDataService, private errorHandler: ErrorService) { }

    ngOnInit(): void {
        this.subscribeTimer();
    }

    ngOnDestroy(): void {
        const s = this.pRateSubscription as Subscription;
        const t = this.pTimerSubscription as Subscription;
        if (s) {
            s.unsubscribe();
        }
        if (t) {
            t.unsubscribe();
        }
    }

    private subscribeTimer(): void {
        this.pTimerSubscription = this.updatingTimer.subscribe(val => {
            if (this.countDownInit) {
                if (this.countDown > 0) {
                    this.countDown -= 1;
                    this.spinnerValue = (60 - this.countDown) / 60 * 100;
                } else {
                    const success = this.loadRates();
                    if (!success) {
                        this.countDown = 1;
                    }
                }
            } else {
                this.countDownInit = true;
            }
        });
    }

    private loadRates(): boolean {
        let result = true;
        this.errorMessage = '';
        if (this.countDownInit) {
            let currencyFrom = '';
            let currencyTo = '';
            if (this.summary?.transactionType === TransactionType.Withdrawal) {
                currencyTo = this.summary?.currencyTo as string;
                currencyFrom = this.summary?.currencyFrom as string;
            } else if (this.summary?.transactionType === TransactionType.Deposit) {
                currencyFrom = this.summary?.currencyTo as string;
                currencyTo = this.summary?.currencyFrom as string;
            }
            if (currencyFrom && currencyTo) {
                const ratesData = this.dataService.getRates(currencyFrom, currencyTo);
                if (ratesData === null) {
                    this.errorMessage = this.errorHandler.getRejectedCookieMessage();
                } else {
                    this.spinnerMode = 'indeterminate';
                    if (this.pRateSubscription) {
                        const s = this.pRateSubscription as Subscription;
                        s.unsubscribe();
                    }
                    this.pRateSubscription = ratesData.valueChanges.subscribe(({ data }) => {
                        const rates = data.getRates as Rate[];
                        if (rates.length > 0) {
                            this.update.emit(rates[0]);
                        }
                        this.restartCountDown();
                    }, (error) => {
                        this.setDefaultRate();
                        this.errorMessage = this.errorHandler.getError(
                            error.message,
                            'Unable to load exchange rate');
                        this.restartCountDown();
                    });
                }
            } else {
                result = false;
            }
        }
        return result;
    }

    private setDefaultRate(): void {
        const rate = {
            currencyFrom: 'BTC',
            currencyTo: 'EUR',
            originalRate: 1,
            depositRate: 1,
            withdrawRate: 1
        };
        this.update.emit(rate);
    }

    private restartCountDown(): void {
        this.spinnerMode = 'determinate';
        this.countDown = 60;
        this.spinnerValue = 0;
    }

    updateRate() {
        this.loadRates();
        this.restartCountDown();
    }

    getCountDownValue(): string {
        const sec = this.countDown === 1 ? 'second' : 'seconds';
        return `${this.countDown} ${sec}`;
    }

    getSpinnerColor(): string {
        return (this.errorMessage === '') ? 'primary' : 'warn';
    }
}
