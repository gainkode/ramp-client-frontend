import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rate, SettingsCurrencyListResult, TransactionType, User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletValidator } from '../utils/wallet.validator';
import { ErrorService } from '../services/error.service';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList } from '../model/payment.model';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.scss']
})
export class QuuckCheckoutComponent implements OnInit, OnDestroy {
    user: User | null = null;
    errorMessage = '';
    inProgress = false;
    walletAddressName = '';
    sourceCurrencies: CurrencyView[] = [];
    destinationCurrencies: CurrencyView[] = [];
    transactionList = QuickCheckoutTransactionTypeList;
    currentSourceCurrency: CurrencyView | null = null;
    currentDestinationCurrency: CurrencyView | null = null;
    currentRate: Rate | null = null;
    summary!: CheckoutSummary;

    private currencies: CurrencyView[] = [];
    private numberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
    private _settingsSubscription!: any;
    private _rateSubscription!: any;

    secondFormGroup!: FormGroup;
    detailsForm = this.formBuilder.group({
        orderId: ['', { validators: [Validators.required], updateOn: 'change' }],
        email: ['', {
            validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
            ], updateOn: 'change'
        }],
        amountFrom: ['200', {
            validators: [
                Validators.required,
                Validators.pattern(this.numberPattern)
            ], updateOn: 'change'
        }],
        currencyFrom: ['', { validators: [Validators.required], updateOn: 'change' }],
        amountTo: ['0', {
            validators: [
                Validators.required,
                Validators.pattern(this.numberPattern)
            ], updateOn: 'change'
        }],
        currencyTo: ['', { validators: [Validators.required], updateOn: 'change' }],
        address: ['', { validators: [Validators.required], updateOn: 'change' }],
        transaction: [TransactionType.Deposit, { validators: [Validators.required], updateOn: 'change' }]
    }, {
        validators: [WalletValidator.addressValidator('address', 'currencyTo')], updateOn: 'change'
    });

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private errorHandler: ErrorService, private formBuilder: FormBuilder, private router: Router) {
        this.user = auth.user;
        this.summary = new CheckoutSummary();

        // temp
        // this.summary.orderId = 'order-id';
        // this.summary.email = 'mail@mail.mail';
        // this.summary.currencyFrom = 'EUR';
        // this.summary.currencyTo = 'BTC';
        // this.summary.amountFrom = 10;
        // this.summary.amountTo = 0.21515;
        // this.summary.address = '1KFzzGtDdnq5hrwxXGjwVnKzRbvf8WVxck';
        // this.summary.fees = 1.5;
        // temp
    }

    ngOnInit(): void {
        this.detailsForm.get('currencyFrom')?.valueChanges.subscribe((val) => {
            this.currentSourceCurrency = this.getCurrency(val);
            if (this.currentSourceCurrency !== null) {
                const c = this.detailsForm.get('amountFrom');
                c?.setValidators([
                    Validators.required,
                    Validators.pattern(this.numberPattern),
                    Validators.min(this.currentSourceCurrency.minAmount)
                ]);
                c?.updateValueAndValidity();
            }
        });
        this.detailsForm.get('currencyTo')?.valueChanges.subscribe((val) => {
            this.currentDestinationCurrency = this.getCurrency(val);
            if (this.currentDestinationCurrency !== null) {
                this.walletAddressName = `${this.currentDestinationCurrency.name} wallet address`;
                const c = this.detailsForm.get('amountTo');
                c?.setValidators([
                    Validators.required,
                    Validators.pattern(this.numberPattern),
                    Validators.min(this.currentDestinationCurrency.minAmount)
                ]);
                c?.updateValueAndValidity();
            } else {
                this.walletAddressName = 'Wallet address';
            }
        });
        this.loadDetailsForm();
        this.secondFormGroup = this.formBuilder.group({
            secondCtrl: ['', Validators.required]
        });
    }

    ngOnDestroy(): void {
        const s = this._settingsSubscription as Subscription;
        if (s) {
            s.unsubscribe();
        }
    }

    getDestinationAmountMinError(): string {
        return this.getAmountMinError(this.currentDestinationCurrency);
    }

    getSourceAmountMinError(): string {
        return this.getAmountMinError(this.currentSourceCurrency);
    }

    private loadDetailsForm(): void {
        const currencyData = this.dataService.getSettingsCurrency();
        if (currencyData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();;
        } else {
            this.inProgress = true;
            this._settingsSubscription = currencyData.valueChanges.subscribe(({ data }) => {
                const currencySettings = data.getSettingsCurrency as SettingsCurrencyListResult;
                let itemCount = 0;
                if (currencySettings !== null) {
                    itemCount = currencySettings.count as number;
                    if (itemCount > 0) {
                        this.loadCurrencies(currencySettings);
                        this.loadRates();
                    }
                }
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load settings');
            });
        }
    }

    private loadCurrencies(settings: SettingsCurrencyListResult): void {
        this.currencies = settings.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
        this.sourceCurrencies = this.currencies.filter(c => c.id !== 'BTC' && c.id !== 'USDC');
        this.destinationCurrencies = this.currencies.filter(c => c.id !== 'EUR' && c.id !== 'USDC');
        if (this.sourceCurrencies.length > 0) {
            this.detailsForm.get('currencyFrom')?.setValue(this.sourceCurrencies[0].id);
            if (this.currentSourceCurrency) {
                this.detailsForm.get('amountFrom')?.setValue(this.currentSourceCurrency.minAmount);
            }
        }
        if (this.destinationCurrencies.length > 0) {
            this.detailsForm.get('currencyTo')?.setValue(this.destinationCurrencies[0].id);
        }
    }

    private loadRates(): void {
        const currencyFrom = this.currentSourceCurrency?.id as string;
        const currencyTo = this.currentDestinationCurrency?.id as string;
        const ratesData = this.dataService.getRates(currencyFrom, currencyTo);
        if (ratesData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();;
        } else {
            this.inProgress = true;
            this._rateSubscription = ratesData.valueChanges.subscribe(({ data }) => {
                const rates = data.getRates as Rate[];
                if (rates.length > 0) {
                    this.currentRate = rates[0];
                    this.updateAmounts();
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load exchange rate');
            });
        }
    }

    private updateAmounts() {
        const transaction = this.detailsForm.get('transaction')?.value as TransactionType;
        if (this.currentRate) {
            let rate = 0;
            if (transaction === TransactionType.Deposit) {
                rate = this.currentRate.depositRate;
            } else if (transaction === TransactionType.Withdrawal) {
                rate = this.currentRate.withdrawRate;
            }
            if (rate > 0) {
                const fieldFrom = this.detailsForm.get('amountFrom');
                const fieldTo = this.detailsForm.get('amountTo');
                const valueFrom = parseFloat(fieldFrom?.value);
                const valueTo = valueFrom / rate;
                fieldTo?.setValue(valueTo);
            }
        }
    }

    detailsCompleted(): void {
        if (this.detailsForm.valid) {
            console.log('detailsCompleted');
        }
    }

    private getCurrency(id: string): CurrencyView | null {
        const c = this.currencies.find(x => x.id === id);
        return (c === undefined) ? null : c;
    }

    private getAmountMinError(c: CurrencyView | null): string {
        let error = 'Invalid value of amount';
        if (c) {
            error = `Value must be greater than ${c.minAmount}`;
        }
        return error;
    }
}
