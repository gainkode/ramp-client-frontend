import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginResult, PaymentInstrument, PaymentProvider, Rate, SettingsCommon, SettingsCurrencyListResult, TransactionShort, TransactionType, User } from '../model/generated-models';
import { CheckoutSummary, CurrencyView, PaymentProviderList, QuickCheckoutPaymentInstrumentList, QuickCheckoutTransactionTypeList } from '../model/payment.model';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { round } from '../utils/utils';
import { WalletValidator } from '../utils/wallet.validator';

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.scss']
})
export class QuuckCheckoutComponent implements OnInit, OnDestroy {
    @ViewChild('checkoutStepper') private stepper: MatStepper | undefined = undefined;
    user: User | null = null;
    errorMessage = '';
    inProgress = false;
    walletAddressName = '';
    needToLogin = false;
    isApmSelected = false;
    sourceCurrencies: CurrencyView[] = [];
    destinationCurrencies: CurrencyView[] = [];
    transactionList = QuickCheckoutTransactionTypeList;
    paymentInstrumentList = QuickCheckoutPaymentInstrumentList;
    paymentProviderList = PaymentProviderList;
    currentSourceCurrency: CurrencyView | null = null;
    currentDestinationCurrency: CurrencyView | null = null;
    currentRate: Rate | null = null;
    summary!: CheckoutSummary;

    private currencies: CurrencyView[] = [];
    private numberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
    private _settingsSubscription!: any;

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
    paymentForm = this.formBuilder.group({
        instrument: [PaymentInstrument.CreditCard, { validators: [Validators.required], updateOn: 'change' }],
        provider: ['', { validators: [], updateOn: 'change' }]
    });
    paymentInstrumentControl: AbstractControl | null = null;
    paymentProviderControl: AbstractControl | null = null;

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
        this.paymentInstrumentControl = this.paymentForm.get('instrument');
        this.paymentProviderControl = this.paymentForm.get('provider');
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
        this.isApmSelected = false;
        this.paymentInstrumentControl?.valueChanges.subscribe((val) => {
            if (val === PaymentInstrument.Apm) {
                this.isApmSelected = true;
                this.paymentProviderControl?.setValidators([
                    Validators.required
                ]);
            } else {
                this.isApmSelected = false;
                this.paymentProviderControl?.setValidators([]);
            }
            this.paymentProviderControl?.updateValueAndValidity();
        });
        this.loadDetailsForm();
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

    onError(error: string): void {
        this.errorMessage = error;
    }

    onProgressChange(status: boolean): void {
        this.inProgress = status;
    }

    onAuthenticated(userData: LoginResult): void {
        if (userData.authTokenAction === 'Default' || userData.authTokenAction === 'KycRequired') {
            this.handleSuccessLogin(userData);
        } else if (userData.authTokenAction === 'ConfirmName') {
            this.auth.logout();
            this.router.navigateByUrl(`/auth/personal/signup/${userData.authToken}`);
        } else {
            this.auth.logout();
            this.errorMessage = `Invalid authentication via ${name}`;
        }
    }

    onSocialAuthenticated(userData: LoginResult): void {
        if (userData.authTokenAction === 'Default' || userData.authTokenAction === 'KycRequired') {
            this.handleSuccessLogin(userData);
        } else {
            this.auth.logout();
            this.errorMessage = 'Unable to sign in';
        }
    }

    getDestinationAmountMinError(): string {
        return this.getAmountMinError(this.currentDestinationCurrency);
    }

    getSourceAmountMinError(): string {
        return this.getAmountMinError(this.currentSourceCurrency);
    }

    private handleSuccessLogin(userData: LoginResult): void {
        this.auth.setLoginUser(userData);
        this.detailsEmailControl?.setValue(userData.user?.email);
        this.inProgress = true;
        this.auth.getSettingsCommon().valueChanges.subscribe(settings => {
            const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
            this.auth.setLocalSettingsCommon(settingsCommon);
            this.inProgress = false;
            this.needToLogin = false;
            this.stepper?.next();
        }, (error) => {
            this.inProgress = false;
            if (this.auth.token !== '') {
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load common settings');
            } else {
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
            }
        });
    }

    private registerOrder(): void {
        this.inProgress = true;
        let rate = this.currentRate?.originalRate;
        if (this.detailsTransactionControl?.value === TransactionType.Deposit) {
            rate = this.currentRate?.depositRate;
        } else if (this.detailsTransactionControl?.value === TransactionType.Withdrawal) {
            rate = this.currentRate?.withdrawRate;
        }
        this.dataService.createQuickCheckout(
            this.detailsTransactionControl?.value,
            this.detailsCurrencyFromControl?.value,
            this.detailsCurrencyToControl?.value,
            this.detailsAmountFromControl?.value,
            this.paymentInstrumentControl?.value,
            this.paymentProviderControl?.value,
            rate as number,
            this.detailsAddressControl?.value).subscribe(({ data }) => {
                const order = data.createQuickCheckout as TransactionShort;
                if (order.transactionId) {
                    this.summary.orderId = order.transactionId;
                }
                this.stepper?.next();
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new order');
            });
    }

    private loadDetailsForm(): void {
        if (this.auth.authenticated) {
            const user = this.auth.user;
            if (user) {
                this.detailsEmailControl?.setValue(user.email);
            }
        }
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
                const amount = valueFrom / rate;
                this.detailsAmountToControl?.setValue(
                    round(amount, this.currentDestinationCurrency?.precision));
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
        if (this.detailsForm.valid) {
            let authenticated = false;
            const user = this.auth.user;
            if (user) {
                if (user.email === this.detailsEmailControl?.value) {
                    authenticated = true;
                }
            }
            if (authenticated) {
                stepper.next();
            } else {
                this.inProgress = true;
                this.auth.authenticate(this.detailsEmailControl?.value, '', true).subscribe(({ data }) => {
                    const userData = data.login as LoginResult;
                    this.handleSuccessLogin(userData);
                    stepper.next();
                }, (error) => {
                    this.inProgress = false;
                    if (this.errorHandler.getCurrentError() == 'auth.password_null_or_empty') {
                        this.needToLogin = true;
                    }
                });
            }
        }
    }

    paymentCompleted(stepper: MatStepper): void {
        if (this.paymentForm.valid) {
            this.registerOrder();
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
