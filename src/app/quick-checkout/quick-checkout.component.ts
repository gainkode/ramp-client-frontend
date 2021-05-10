import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild, ɵɵtrustConstantResourceUrl } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { KycStatus, LoginResult, PaymentInstrument, Rate, SettingsCommon, SettingsCurrencyListResult, SettingsKycShort, TransactionShort, TransactionType, User } from '../model/generated-models';
import { KycLevelShort } from '../model/identification.model';
import { CheckoutSummary, CurrencyView, PaymentProviderList, QuickCheckoutPaymentInstrumentList, QuickCheckoutTransactionTypeList } from '../model/payment.model';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { round } from '../utils/utils';
import { WalletValidator } from '../utils/wallet.validator';

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.component.scss']
})
export class QuuckCheckoutComponent implements OnInit, OnDestroy {
    @ViewChild('checkoutStepper') private stepper: MatStepper | undefined = undefined;
    @ViewChild('details') private _detailsForm: NgForm | undefined = undefined;
    @ViewChild('payment') private _paymentForm: NgForm | undefined = undefined;
    @ViewChild('confirmation') private _confirmationForm: NgForm | undefined = undefined;
    user: User | null = null;
    errorMessage = '';
    inProgress = false;
    walletAddressName = '';
    needToLogin = false;
    defaultUserName = '';
    isApmSelected = false;
    flow: string = '';
    showKycStep = false;
    showKycValidator = false;
    showKycSubmit = false;
    processDone = false;
    settingsCommon: SettingsCommon | null = null;
    sourceCurrencies: CurrencyView[] = [];
    destinationCurrencies: CurrencyView[] = [];
    transactionList = QuickCheckoutTransactionTypeList;
    paymentInstrumentList = QuickCheckoutPaymentInstrumentList;
    paymentProviderList = PaymentProviderList;
    currentSourceCurrency: CurrencyView | null = null;
    currentDestinationCurrency: CurrencyView | null = null;
    currentRate: Rate | null = null;
    currentTransaction = TransactionType.Deposit;
    summary!: CheckoutSummary;

    private currencies: CurrencyView[] = [];
    private numberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
    private _settingsSubscription!: any;
    private _kycSettingsSubscription!: any;

    detailsForm = this.formBuilder.group({
        email: ['', {
            validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
            ], updateOn: 'change'
        }],
        amountFrom: [200, {
            validators: [
                Validators.required,
                Validators.pattern(this.numberPattern)
            ], updateOn: 'change'
        }],
        currencyFrom: ['', { validators: [Validators.required], updateOn: 'change' }],
        amountTo: [0, {
            validators: [
                Validators.required,
                Validators.pattern(this.numberPattern)
            ], updateOn: 'change'
        }],
        currencyTo: ['', { validators: [Validators.required], updateOn: 'change' }],
        address: ['', { validators: [Validators.required], updateOn: 'change' }],
        transaction: [TransactionType.Deposit, { validators: [Validators.required], updateOn: 'change' }]
    }, {
        validators: [WalletValidator.addressValidator('address', 'currencyTo', 'transaction')], updateOn: 'change'
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
        provider: ['', { validators: [], updateOn: 'change' }],
        transactionId: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    paymentInstrumentControl: AbstractControl | null = null;
    paymentProviderControl: AbstractControl | null = null;
    paymentTransactionIdControl: AbstractControl | null = null;
    confirmationForm = this.formBuilder.group({
        code: ['', { validators: [Validators.required], updateOn: 'change' }],
        complete: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    confirmationCodeControl: AbstractControl | null = null;
    confirmationCompleteControl: AbstractControl | null = null;

    get isDeposit(): boolean {
        return this.currentTransaction === TransactionType.Deposit;
    }

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
        this.paymentTransactionIdControl = this.paymentForm.get('transactionId');
        this.confirmationCodeControl = this.confirmationForm.get('code');
        this.confirmationCompleteControl = this.confirmationForm.get('complete');
        this.currentTransaction = TransactionType.Deposit;
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
        this.detailsTransactionControl?.valueChanges.subscribe((val) => {
            this.currentTransaction = val as TransactionType;
            this.setCurrencyValues();
            this.updateAmounts();
            if (this.currentTransaction === TransactionType.Deposit) {
                this.detailsAddressControl?.setValidators([Validators.required]);
            } else {
                this.detailsAddressControl?.setValue('');
                this.detailsAddressControl?.setValidators([]);
            }
            this.detailsAddressControl?.updateValueAndValidity();
        });
        this.isApmSelected = false;
        this.paymentInstrumentControl?.valueChanges.subscribe((val) => {
            this.paymentProviderControl?.setValue('');
            if (val === PaymentInstrument.Apm) {
                this.isApmSelected = true;
                this.paymentProviderControl?.setValidators([Validators.required]);
            } else {
                this.isApmSelected = false;
                this.paymentProviderControl?.setValidators([]);
            }
            this.paymentProviderControl?.updateValueAndValidity();
        });
        this.confirmationCodeControl?.valueChanges.subscribe((val) => {
            this.errorMessage = '';
        });
        this.loadDetailsForm();
    }

    ngOnDestroy(): void {
        const s = this._settingsSubscription as Subscription;
        const k = this._kycSettingsSubscription as Subscription;
        if (s) {
            s.unsubscribe();
        }
        if (k) {
            k.unsubscribe();
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
            this.inProgress = false;
            if (this.auth.user !== null) {
                const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
                this.auth.setLocalSettingsCommon(settingsCommon);
                this.needToLogin = false;
                if (this.stepper) {
                    this.stepper?.next();
                }
            }
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
        const amountVal = this.detailsAmountFromControl?.value;
        const amount = parseFloat(amountVal);
        this.dataService.createQuickCheckout(
            this.detailsTransactionControl?.value,
            this.detailsCurrencyFromControl?.value,
            this.detailsCurrencyToControl?.value,
            amount,
            this.paymentInstrumentControl?.value,
            this.paymentProviderControl?.value,
            rate as number,
            this.detailsAddressControl?.value).subscribe(({ data }) => {
                const order = data.createQuickCheckout as TransactionShort;
                this.inProgress = false;
                if (order.code) {
                    this.summary.orderId = order.code as string;
                    this.summary.fee = order.fee;
                    this.summary.feeMinEuro = order.feeMinEuro;
                    this.summary.feePercent = order.feePercent;
                    this.summary.exchangeRate = this.currentRate;
                    this.summary.transactionDate = new Date().toLocaleString();
                    this.summary.transactionType = this.currentTransaction;
                    this.paymentTransactionIdControl?.setValue(order.transactionId as string);
                    if (this.stepper) {
                        this.stepper?.next();
                    }
                } else {
                    this.errorMessage = 'Order code is invalid';
                }
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new order');
            });
    }

    private getKycSettings(): void {
        this.inProgress = true;
        this.settingsCommon = this.auth.getLocalSettingsCommon();
        const kycData = this.auth.getMyKycSettings();
        if (kycData === null) {
            this.inProgress = false;
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else if (this.settingsCommon === null) {
            this.inProgress = false;
            this.errorMessage = 'Unable to load common settings';
        } else {
            this._kycSettingsSubscription = kycData.valueChanges.subscribe(({ data }) => {
                const settingsKyc: SettingsKycShort | null = data.getMySettingsKyc;
                if (settingsKyc === null) {
                    this.errorMessage = 'Unable to load user identification settings';
                } else {
                    const levels = settingsKyc.levels?.map((val) => new KycLevelShort(val)) as KycLevelShort[];
                    if (levels.length > 0) {
                        const level = levels[0];
                        this.flow = level.flowData.value;
                    }
                    this.inProgress = false;
                    this.showKycValidator = true;
                }
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load settings');
                }
            });
        }
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
        this.setCurrencyValues();
    }

    private setCurrencyValues(): void {
        if (this.currentTransaction === TransactionType.Deposit) {
            this.sourceCurrencies = this.currencies.filter(c => c.id !== 'BTC' && c.id !== 'USDC');
            this.destinationCurrencies = this.currencies.filter(c => c.id !== 'EUR' && c.id !== 'USDC');
        } else if (this.currentTransaction === TransactionType.Withdrawal) {
            this.destinationCurrencies = this.currencies.filter(c => c.id !== 'BTC' && c.id !== 'USDC');
            this.sourceCurrencies = this.currencies.filter(c => c.id !== 'EUR' && c.id !== 'USDC');
        }
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
        if (this.currentRate) {
            let rate = 0;
            if (this.currentTransaction === TransactionType.Deposit) {
                rate = this.currentRate.depositRate;
            } else if (this.currentTransaction === TransactionType.Withdrawal) {
                rate = this.currentRate.withdrawRate;
            }
            let amount = 0;
            if (rate > 0) {
                const valueFrom = parseFloat(this.detailsAmountFromControl?.value);
                if (this.currentTransaction === TransactionType.Deposit) {
                    amount = valueFrom / rate;
                } else if (this.currentTransaction === TransactionType.Withdrawal) {
                    amount = valueFrom * rate;
                }
            }
            this.detailsAmountToControl?.setValue(round(amount, this.currentDestinationCurrency?.precision));
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

    stepChanged(step: StepperSelectionEvent): void {
        // if (this.errorMessage !== '') {
        //     setTimeout(() => {
        //         if (this.stepper !== undefined) {
        //             step.previouslySelectedStep.editable = true;
        //             this.stepper.previous();
        //             step.previouslySelectedStep.editable = false;
        //         }
        //     }, 500);
        // }
        if (this.errorMessage === '') {
            if (step.selectedStep.label === 'payment') {
                const kycStatusData = this.auth.getMyKycStatus();
                if (kycStatusData === null) {
                    this.errorMessage = this.errorHandler.getRejectedCookieMessage();;
                } else {
                    this.inProgress = true;
                    kycStatusData.valueChanges.subscribe(({ data }) => {
                        const kycStatus = data.myKycStatus as KycStatus;
                        this.showKycStep = (kycStatus === KycStatus.Init || kycStatus === KycStatus.NotFound);
                        this.inProgress = false;
                    }, (error) => {
                        this.inProgress = false;
                        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load your identification status');
                    });
                }
            } else if (step.selectedStep.label === 'verification') {
                this.getKycSettings();
            } else if (step.selectedStep.label === 'complete') {
                this.processDone = true;
            }
        }
    }

    resetStepper(): void {
        this.inProgress = false;
        this.errorMessage = '';
        this.walletAddressName = '';
        this.needToLogin = false;
        this.isApmSelected = false;
        this.flow = '';
        this.showKycStep = false;
        this.showKycValidator = false;
        this.showKycSubmit = false;
        this.processDone = false;
        this.summary.reset();
        if (this.stepper) {
            this.stepper.reset();
            this.stepper.steps.forEach(x => x.completed = false);
        }
        this._detailsForm?.resetForm();
        this._paymentForm?.resetForm();
        this._confirmationForm?.resetForm();
        if (this.auth.authenticated) {
            const user = this.auth.user;
            if (user) {
                this.detailsEmailControl?.setValue(user.email);
            }
        }
        this.detailsTransactionControl?.setValue(TransactionType.Deposit);
        this.paymentInstrumentControl?.setValue(PaymentInstrument.CreditCard);
    }

    detailsCompleted(): void {
        if (this.detailsForm.valid) {
            const userEmail = this.detailsEmailControl?.value;
            let authenticated = false;
            const user = this.auth.user;
            if (user) {
                if (user.email === userEmail) {
                    authenticated = true;
                }
            }
            if (authenticated) {
                if (this.stepper) {
                    this.stepper?.next();
                }
            } else {
                this.inProgress = true;
                this.auth.authenticate(userEmail, '', true).subscribe(({ data }) => {
                    const userData = data.login as LoginResult;
                    this.handleSuccessLogin(userData);
                }, (error) => {
                    this.inProgress = false;
                    if (this.errorHandler.getCurrentError() == 'auth.password_null_or_empty') {
                        this.auth.logout();
                        this.needToLogin = true;
                        this.defaultUserName = this.detailsEmailControl?.value;
                    } else {
                        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to authenticate user');
                    }
                });
            }
        }
    }

    paymentCompleted(): void {
        this.paymentTransactionIdControl?.setValue('ready');
        if (this.paymentForm.valid) {
            this.registerOrder();
        }
    }

    executePayment(): void {
        this.confirmationCompleteControl?.setValue('ready');
        if (this.confirmationForm.valid) {
            this.inProgress = true;
            const code = this.confirmationCodeControl?.value;
            const transaction = this.paymentTransactionIdControl?.value;
            this.dataService.executeQuickCheckout(transaction, code).subscribe(({ data }) => {
                this.inProgress = false;
                if (this.stepper) {
                    this.stepper?.next();
                }
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, 'Unable to execute your order');
            });
        }
    }

    kycProcessCompleted(): void {
        this.showKycSubmit = true;
        if (this.stepper) {
            this.stepper?.next();
        }
    }

    kycCompleted(): void {
        this.showKycValidator = false;
    }

    done(): void {
        this.router.navigateByUrl(this.auth.getUserMainPage());
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
