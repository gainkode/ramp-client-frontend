import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Subscription, timer } from 'rxjs';
import { Rate } from '../model/generated-models';
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
                    this.loadRates();
                }
            } else {
                this.countDownInit = true;
            }
        });
    }

    private loadRates(): void {
        this.errorMessage = '';
        if (this.countDownInit) {
            const currencyFrom = this.summary?.currencyFrom as string;
            const currencyTo = this.summary?.currencyTo as string;
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
                        this.temp();
                        this.errorMessage = this.errorHandler.getError(
                            error.message,
                            'Unable to load exchange rate');
                        this.restartCountDown();
                    });
                }
            } else {
                console.log(this.summary);
                this.errorMessage = 'Currency is not specified';
                this.restartCountDown();
            }
        }
    }

    private temp(): void {
        const rate = {
            currencyFrom: 'EUR',
            currencyTo: 'BTC',
            originalRate: 2,
            depositRate: 2,
            withdrawRate: 2
        };
        this.update.emit(rate);
    }

    private restartCountDown(): void {
        this.spinnerMode = 'determinate';
        this.countDown = 60;
        this.spinnerValue = 0;
    }

    getCountDownValue(): string {
        const sec = this.countDown === 1 ? 'second' : 'seconds';
        return `${this.countDown} ${sec}`;
    }

    getSpinnerColor(): string {
        return (this.errorMessage === '') ? 'primary' : 'warn';
    }
}
