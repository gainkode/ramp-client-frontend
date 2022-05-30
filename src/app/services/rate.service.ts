import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { Rate, TransactionType } from '../model/generated-models';
import { ErrorService } from './error.service';
import { PaymentDataService } from './payment.service';

@Injectable()
export class ExchangeRateService {
    private updateCallback: Function | undefined = undefined;
    private pSubscriptions: Subscription = new Subscription();
    private pRateSubscription: Subscription | undefined = undefined;
    private currentExchangeRate: Rate | undefined;
    private updateTimer = timer(0, 1000);
    private counterLimit = 30;
    private countDownInit = false;
    private countDown = 0;
    private lastChanceError = false;
    private errorMessage = '';
    private currencyFrom = '';
    private currencyTo = '';
    private transaction: TransactionType = TransactionType.Buy;
    private active = false;

    constructor(private dataService: PaymentDataService, private errorHandler: ErrorService) {
        this.startTimer();
    }

    setCurrency(fromCurrency: string, toCurrency: string, transactionType: TransactionType) {
        this.active = true;
        this.currencyFrom = fromCurrency;
        this.currencyTo = toCurrency;
        this.transaction = transactionType;
    }

    register(command: Function) {
        this.active = true;
        this.updateCallback = command;
    }

    stop() {
        this.active = false;
        // service shouldn't be stopped as it is a single-ton service

        // this.pSubscriptions.unsubscribe();
        // if (this.pRateSubscription) {
        //     this.pRateSubscription.unsubscribe();
        //     this.pRateSubscription = undefined;
        // }
    }

    update(): void {
        this.loadData();
    }

    private startTimer(): void {
        this.pSubscriptions.add(
            this.updateTimer.subscribe(val => {
                if (this.countDownInit) {
                    if (this.countDown > 0) {
                        this.countDown -= 1;
                        this.lastChanceError = false;
                        this.updateCountDown(undefined);
                    } else {
                        const success = this.loadData();
                        if (!success) {
                            if (!this.lastChanceError) {
                                this.countDown = 1;
                                this.updateCountDown(undefined);
                            }
                            this.lastChanceError = true;
                        } else {
                            this.lastChanceError = false;
                        }
                    }
                } else {
                    this.countDownInit = true;
                }
            })
        );
    }

    private loadData(): boolean {
        if (!this.active) {
            return true;
        }
        let result = true;
        this.errorMessage = '';
        if (this.countDownInit) {
            let currencyFrom = '';
            let currencyTo = '';
            if (this.transaction === TransactionType.Sell) {
                currencyTo = this.currencyTo as string;
                currencyFrom = this.currencyFrom as string;
            } else if (this.transaction === TransactionType.Buy) {
                currencyFrom = this.currencyTo as string;
                currencyTo = this.currencyFrom as string;
            }
            if (currencyFrom && currencyTo) {
                const ratesData$ = this.dataService.getRates([currencyFrom], currencyTo);
                if (this.pRateSubscription) {
                    this.pRateSubscription.unsubscribe();
                    this.pRateSubscription = undefined;
                }
                this.pRateSubscription = ratesData$.valueChanges.subscribe(({ data }) => {
                    const rates = data.getRates as Rate[];
                    if (rates.length > 0) {
                        this.updateCountDown(rates[0]);
                    } else {
                        this.updateCountDown(this.defaultRate);
                    }
                    this.restartCountDown();
                }, (error) => {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load exchange rate');
                    this.updateCountDown(this.defaultRate);
                    this.restartCountDown();
                });
            } else {
                result = false;
            }
        }
        return result;
    }

    private updateCountDown(rate: Rate | undefined): void {
        const title = (this.countDown > 0 && this.countDown < this.counterLimit) ?
            'The price will be updated in' :
            'The price is';
        const sec = this.countDown === 1 ? 'second' : 'seconds';
        const val = (this.countDown > 0 && this.countDown < this.counterLimit) ? `${this.countDown} ${sec}` : 'updating';
        if (rate) {
            this.currentExchangeRate = rate;
        }
        if (this.updateCallback) {
            this.updateCallback(rate, title, val, this.errorMessage);
        }
    }

    private get defaultRate(): Rate {
        return {
            currencyFrom: '',
            currencyTo: '',
            originalRate: 0,
            depositRate: 0,
            withdrawRate: 0
        } as Rate;
    }

    get currentRate(): Rate | undefined {
        return this.currentExchangeRate;
    }

    private restartCountDown(): void {
        this.countDown = this.counterLimit;
        this.lastChanceError = false;
        this.updateCountDown(undefined);
    }
}
