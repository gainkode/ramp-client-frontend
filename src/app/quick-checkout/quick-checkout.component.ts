import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SettingsCurrencyListResult, TransactionType, User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletValidator } from '../utils/wallet.validator';
import { ErrorService } from '../services/error.service';
import { CurrencyView, QuickCheckoutTransactionTypeList } from '../model/payment.model';
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

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private errorHandler: ErrorService, private formBuilder: FormBuilder, private router: Router) {
        this.user = auth.user;
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
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load fee settings');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
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

    private loadCurrencies(settings: SettingsCurrencyListResult) {
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
