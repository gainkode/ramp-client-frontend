import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { timer } from 'rxjs';
import { Rate, TransactionType } from 'src/app/model/generated-models';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { CheckoutSummary } from '../../model/payment.model';

@Component({
    selector: 'app-widget-rate',
    templateUrl: 'rate.component.html',
    styleUrls: ['../../../assets/payment.scss']
})
export class WidgetRateComponent implements OnInit, OnDestroy {
    @Input() summary: CheckoutSummary | null | undefined = null;
    @Output() update = new EventEmitter<Rate>();

    countDown = 0;
    countDownTitle = '';
    countDownValue = '';
    countDownInit = false;
    lastChanceError = false;
    errorMessage = '';
    private pRateSubscription: Subscription | undefined = undefined;
    private pTimerSubscription: Subscription | undefined = undefined;
    updatingTimer = timer(0, 1000);

    constructor(private dataService: PaymentDataService, private errorHandler: ErrorService) { }

    ngOnInit(): void {
        this.subscribeTimer();
    }

    ngOnDestroy(): void {
        if (this.pRateSubscription) {
            this.pRateSubscription.unsubscribe();
            this.pRateSubscription = undefined;
        }
        if (this.pTimerSubscription) {
            this.pTimerSubscription.unsubscribe();
            this.pTimerSubscription = undefined;
        }
    }

    private subscribeTimer(): void {
        this.pTimerSubscription = this.updatingTimer.subscribe(val => {
            if (this.countDownInit) {
                if (this.countDown > 0) {
                    this.countDown -= 1;
                    this.lastChanceError = false;
                    this.updateCountDown();
                } else {
                    const success = this.loadRates();
                    if (!success) {
                        if (!this.lastChanceError) {
                            this.countDown = 1;
                            this.updateCountDown();
                        }
                        this.lastChanceError = true;
                    } else {
                        this.lastChanceError = false;
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
            console.log(`Need to get rate from ${currencyFrom} to ${currencyTo}`);
            if (currencyFrom && currencyTo) {
                console.log(`Get rate from ${currencyFrom} to ${currencyTo}`);
                const ratesData = this.dataService.getRates(currencyFrom, currencyTo);
                if (ratesData === null) {
                    this.errorMessage = this.errorHandler.getRejectedCookieMessage();
                } else {
                    if (this.pRateSubscription) {
                        this.pRateSubscription.unsubscribe();
                        this.pRateSubscription = undefined;
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
            currencyFrom: '',
            currencyTo: '',
            originalRate: 0,
            depositRate: 0,
            withdrawRate: 0
        };
        this.update.emit(rate);
    }

    private restartCountDown(): void {
        this.countDown = 30;
        this.lastChanceError = false;
        this.updateCountDown();
    }

    updateRate(): void {
        this.loadRates();
        this.restartCountDown();
    }

    updateCountDown(): void {
        this.countDownTitle = (this.countDown > 0 && this.countDown < 30) ? 'The price will be updated in' : 'The price is';
        const sec = this.countDown === 1 ? 'second' : 'seconds';
        this.countDownValue = (this.countDown > 0 && this.countDown < 30) ? `${this.countDown} ${sec}` : 'updating';
    }
}
