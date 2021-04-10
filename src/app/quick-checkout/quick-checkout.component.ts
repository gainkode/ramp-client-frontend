import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rate, SettingsCurrencyListResult, TransactionType, User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletValidator } from '../utils/wallet.validator';
import { ErrorService } from '../services/error.service';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList } from '../model/payment.model';
import { Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';

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

    secondFormGroup!: FormGroup;
    detailsForm = this.formBuilder.group({
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
    detailsEmailControl: AbstractControl | null = null;
    detailsAmountFromControl: AbstractControl | null = null;
    detailsCurrencyFromControl: AbstractControl | null = null;
    detailsAmountToControl: AbstractControl | null = null;
    detailsCurrencyToControl: AbstractControl | null = null;
    detailsAddressControl: AbstractControl | null = null;
    detailsTransactionControl: AbstractControl | null = null;

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private errorHandler: ErrorService, private formBuilder: FormBuilder, private router: Router) {
        this.user = auth.user;
        this.summary = new CheckoutSummary();
        this.detailsEmailControl = this.detailsForm.get('email');
        this.detailsAmountFromControl = this.detailsForm.get('amountFrom');
        this.detailsCurrencyFromControl = this.detailsForm.get('currencyFrom');
        this.detailsAmountToControl = this.detailsForm.get('amountTo');
        this.detailsCurrencyToControl = this.detailsForm.get('currencyTo');
        this.detailsAddressControl = this.detailsForm.get('address');
        this.detailsTransactionControl = this.detailsForm.get('transaction');
    }

    ngOnInit(): void {
        this.detailsCurrencyFromControl?.valueChanges.subscribe((val) => {
            this.currentSourceCurrency = this.getCurrency(val);
            if (this.currentSourceCurrency !== null) {
                this.detailsAmountFromControl?.setValidators([
                    Validators.required,
                    Validators.pattern(this.numberPattern),
                    Validators.min(this.currentSourceCurrency.minAmount)
                ]);
                this.detailsAmountFromControl?.updateValueAndValidity();
                this.summary.currencyFrom = this.currentSourceCurrency.id;
            }
        });
        this.detailsCurrencyToControl?.valueChanges.subscribe((val) => {
            this.currentDestinationCurrency = this.getCurrency(val);
            if (this.currentDestinationCurrency !== null) {
                this.walletAddressName = `${this.currentDestinationCurrency.name} wallet address`;
                this.detailsAmountToControl?.setValidators([
                    Validators.required,
                    Validators.pattern(this.numberPattern),
                    Validators.min(this.currentDestinationCurrency.minAmount)
                ]);
                this.detailsAmountToControl?.updateValueAndValidity();
                this.summary.currencyTo = this.currentDestinationCurrency.id;
            } else {
                this.walletAddressName = 'Wallet address';
            }
        });
        this.detailsAmountFromControl?.valueChanges.subscribe((val) => {
            this.setSummuryAmountFrom(val);
        });
        this.detailsAmountToControl?.valueChanges.subscribe((val) => {
            this.setSummuryAmountTo(val);
        });
        this.detailsEmailControl?.valueChanges.subscribe((val) => {
            this.setSummuryEmail(val);
        });
        this.detailsAddressControl?.valueChanges.subscribe((val) => {
            this.setSummuryAddress(val);
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

    onUpdateRate(rate: Rate): void {
        this.currentRate = rate;
        this.updateAmounts();
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
                    }
                }
                this.inProgress = false;
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
            this.detailsCurrencyFromControl?.setValue(this.sourceCurrencies[0].id);
            if (this.currentSourceCurrency) {
                this.detailsAmountFromControl?.setValue(this.currentSourceCurrency.minAmount);
            }
        }
        if (this.destinationCurrencies.length > 0) {
            this.detailsCurrencyToControl?.setValue(this.destinationCurrencies[0].id);
        }
    }

    private updateAmounts() {
        const transaction = this.detailsTransactionControl?.value as TransactionType;
        if (this.currentRate) {
            let rate = 0;
            if (transaction === TransactionType.Deposit) {
                rate = this.currentRate.depositRate;
            } else if (transaction === TransactionType.Withdrawal) {
                rate = this.currentRate.withdrawRate;
            }
            if (rate > 0) {
                const valueFrom = parseFloat(this.detailsAmountFromControl?.value);
                this.detailsAmountToControl?.setValue(valueFrom / rate);
            }
        }
    }

    private setSummuryAmountFrom(val: any) {
        if (this.detailsAmountFromControl?.valid) {
            this.summary.amountFrom = val;
            this.updateAmounts();
        }
    }

    private setSummuryAmountTo(val: any) {
        if (this.detailsAmountToControl?.valid) {
            this.summary.amountTo = val;
        }
    }

    private setSummuryEmail(val: any) {
        if (this.detailsEmailControl?.valid) {
            this.summary.email = val;
        }
    }

    private setSummuryAddress(val: any) {
        if (this.detailsAddressControl?.valid) {
            this.summary.address = val;
        }
    }

    detailsCompleted(stepper: MatStepper): void {
        console.log('login');
        if (this.detailsForm.valid) {
            console.log('detailsCompleted');
            stepper.next();
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
