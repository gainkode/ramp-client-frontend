import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, NgForm, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {
    KycStatus, LoginResult, PaymentInstrument, PaymentOrderShort, PaymentPreauthResultShort, PaymentProvider, Rate, SettingsCommon, SettingsCurrencyListResult,
    SettingsKycShort, TransactionShort, TransactionType, User, UserMode, UserType
} from '../model/generated-models';
import { KycLevelShort } from '../model/identification.model';
import {
    CardView,
    CheckoutSummary, CurrencyView, PaymentProviderList, QuickCheckoutPaymentInstrumentList,
    QuickCheckoutTransactionTypeList
} from '../model/payment.model';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { round } from '../utils/utils';
import { WalletValidator } from '../utils/wallet.validator';

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.component.scss']
})
export class QuickCheckoutComponent implements OnInit, OnDestroy {
    @ViewChild('checkoutStepper') private stepper: MatStepper | undefined = undefined;
    @ViewChild('details') private ngDetailsForm: NgForm | undefined = undefined;
    @ViewChild('paymentinfo') private ngPaymentInfoForm: NgForm | undefined = undefined;
    @ViewChild('confirmation') private ngConfirmationForm: NgForm | undefined = undefined;
    @ViewChild('payment') private ngPaymentForm: NgForm | undefined = undefined;
    @ViewChild('emailinput') emailElement: ElementRef | undefined = undefined;
    @ViewChild('paymentinfonext') paymentInfoNextElement: ElementRef | undefined = undefined;
    @ViewChild('paymentnext') paymentNextElement: ElementRef | undefined = undefined;
    @ViewChild('verificationreset') verificationResetElement: ElementRef | undefined = undefined;
    @ViewChild('codeinput') codeElement: ElementRef | undefined = undefined;
    @ViewChild('checkoutdone') checkoutDoneElement: ElementRef | undefined = undefined;
    user: User | null = null;
    errorMessage = '';
    inProgress = false;
    walletAddressName = '';
    needToLogin = false;
    defaultUserName = '';
    isApmSelected = false;
    flow = '';
    showKycStep = false;
    showKycValidator = false;
    showKycSubmit = false;
    showCodeConfirm = false;
    processDone = false;
    paymentTitle = '';
    paymentCreditCard = false;

    htmlTest = '';

    settingsCommon: SettingsCommon | null = null;
    sourceCurrencies: CurrencyView[] = [];
    destinationCurrencies: CurrencyView[] = [];
    userWallets: string[] = [];
    userWalletsFiltered: Observable<string[]> | undefined = undefined;
    transactionList = QuickCheckoutTransactionTypeList;
    paymentInstrumentList = QuickCheckoutPaymentInstrumentList;
    paymentProviderList = PaymentProviderList;
    currentSourceCurrency: CurrencyView | null = null;
    currentDestinationCurrency: CurrencyView | null = null;
    currentRate: Rate | null = null;
    currentTransaction = TransactionType.Deposit;
    currentCard: CardView = new CardView();
    summary!: CheckoutSummary;

    private pCurrencies: CurrencyView[] = [];
    private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
    private pSettingsSubscription!: any;
    private pKycSettingsSubscription!: any;

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
                Validators.pattern(this.pNumberPattern)
            ], updateOn: 'change'
        }],
        currencyFrom: ['', { validators: [Validators.required], updateOn: 'change' }],
        amountTo: [0, {
            validators: [
                Validators.required,
                Validators.pattern(this.pNumberPattern)
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
    paymentInfoForm = this.formBuilder.group({
        instrument: [PaymentInstrument.CreditCard, { validators: [Validators.required], updateOn: 'change' }],
        provider: ['', { validators: [Validators.required], updateOn: 'change' }],
        transactionId: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    paymentInfoInstrumentControl: AbstractControl | null = null;
    paymentInfoProviderControl: AbstractControl | null = null;
    paymentInfoTransactionIdControl: AbstractControl | null = null;
    confirmationForm = this.formBuilder.group({
        code: ['', { validators: [Validators.required], updateOn: 'change' }],
        complete: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    confirmationCodeControl: AbstractControl | null = null;
    confirmationCompleteControl: AbstractControl | null = null;
    paymentForm = this.formBuilder.group({
        complete: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
    paymentCompleteControl: AbstractControl | null = null;

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
        this.paymentInfoInstrumentControl = this.paymentInfoForm.get('instrument');
        this.paymentInfoProviderControl = this.paymentInfoForm.get('provider');
        this.paymentInfoTransactionIdControl = this.paymentInfoForm.get('transactionId');
        this.confirmationCodeControl = this.confirmationForm.get('code');
        this.confirmationCompleteControl = this.confirmationForm.get('complete');
        this.paymentCompleteControl = this.paymentForm.get('complete');
        this.currentTransaction = TransactionType.Deposit;
    }

    ngOnInit(): void {
        this.detailsCurrencyFromControl?.valueChanges.subscribe((val) => {
            this.currentSourceCurrency = this.getCurrency(val);
            if (this.currentSourceCurrency !== null) {
                this.detailsAmountFromControl?.setValidators([
                    Validators.required,
                    Validators.pattern(this.pNumberPattern),
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
                    Validators.pattern(this.pNumberPattern),
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
        this.userWalletsFiltered = this.detailsAddressControl?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterUserWallets(value))
        );
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
        this.paymentInfoInstrumentControl?.valueChanges.subscribe((val) => {
            this.paymentInfoProviderControl?.setValue('');
            if (val === PaymentInstrument.Apm) {
                this.isApmSelected = true;
            } else {
                this.isApmSelected = false;
                this.paymentInfoProviderControl?.setValue(PaymentProvider.Fibonatix);
            }
        });
        this.confirmationCodeControl?.valueChanges.subscribe((val) => {
            this.errorMessage = '';
        });
        this.loadDetailsForm();
    }

    ngOnDestroy(): void {
        const s = this.pSettingsSubscription as Subscription;
        const k = this.pKycSettingsSubscription as Subscription;
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
        } else {
            this.auth.logout();
            this.errorMessage = 'Unable to sign in';
        }
    }

    onSocialAuthenticated(userData: LoginResult): void {
        if (userData.authTokenAction === 'Default' || userData.authTokenAction === 'KycRequired') {
            this.handleSuccessLogin(userData);
        } else if (userData.authTokenAction === 'ConfirmName') {
            this.auth.logout();
            this.router.navigateByUrl(`/auth/personal/signup/${userData.authToken}`);
        } else {
            this.auth.logout();
            this.errorMessage = `Invalid authentication via social media`;
        }
    }

    getDestinationAmountMinError(): string {
        return this.getAmountMinError(this.currentDestinationCurrency);
    }

    getSourceAmountMinError(): string {
        return this.getAmountMinError(this.currentSourceCurrency);
    }

    private filterUserWallets(value: string): string[] {
        if (value !== null) {
            const walletFilter = value.toLowerCase();
            return this.userWallets.filter(option => option.toLowerCase().indexOf(walletFilter) === 0);
        } else {
            return [];
        }
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
            this.paymentInfoInstrumentControl?.value,
            this.paymentInfoProviderControl?.value,
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
                    this.paymentInfoTransactionIdControl?.setValue(order.transactionId as string);
                    if (this.stepper) {
                        this.stepper?.next();
                    }
                } else {
                    this.errorMessage = 'Order code is invalid';
                    this.paymentInfoTransactionIdControl?.reset();
                }
            }, (error) => {
                this.inProgress = false;
                if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
                    this.resetStepper();
                } else {
                    this.paymentInfoTransactionIdControl?.reset();
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new order');
                }
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
            this.pKycSettingsSubscription = kycData.valueChanges.subscribe(({ data }) => {
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
        this.userWallets = [];
        if (this.auth.authenticated) {
            const user = this.auth.user;
            if (user) {
                this.detailsEmailControl?.setValue(user.email);
                user.state?.externalWallets?.forEach(x => this.userWallets.push(x.name as string));
                //this.userWallets.push('1KFzzGtDdnq5hrwxXGjwVnKzRbvf8WVxck');
            }
        }
        const currencyData = this.dataService.getSettingsCurrency();
        if (currencyData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pSettingsSubscription = currencyData.valueChanges.subscribe(({ data }) => {
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
        this.pCurrencies = settings.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
        this.setCurrencyValues();
    }

    private setCurrencyValues(): void {
        if (this.currentTransaction === TransactionType.Deposit) {
            this.sourceCurrencies = this.pCurrencies.filter(c => c.id !== 'BTC' && c.id !== 'USDC');
            this.destinationCurrencies = this.pCurrencies.filter(c => c.id !== 'EUR' && c.id !== 'USDC');
        } else if (this.currentTransaction === TransactionType.Withdrawal) {
            this.destinationCurrencies = this.pCurrencies.filter(c => c.id !== 'BTC' && c.id !== 'USDC');
            this.sourceCurrencies = this.pCurrencies.filter(c => c.id !== 'EUR' && c.id !== 'USDC');
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

    private updateAmounts(): void {
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

    private setSummuryAmountFrom(val: any): void {
        if (this.detailsAmountFromControl?.valid) {
            this.summary.amountFrom = val;
            this.updateAmounts();
        }
    }

    private setSummuryAmountTo(val: any): void {
        if (this.detailsAmountToControl?.valid) {
            this.summary.amountTo = val;
        }
    }

    private setSummuryEmail(val: any): void {
        if (this.detailsEmailControl?.valid) {
            this.summary.email = val;
        }
    }

    private setSummuryAddress(val: any): void {
        if (this.detailsAddressControl?.valid) {
            this.summary.address = val;
        }
    }

    private needToShowCodeConfirmation(): boolean {
        let isInternalUser = false;
        if (this.auth.user) {
            isInternalUser = (this.auth.user.mode === UserMode.InternalWallet);
        }
        return !isInternalUser;
    }

    stepChanged(step: StepperSelectionEvent): void {
        if (this.errorMessage === '') {
            let focusInput: HTMLInputElement | undefined;
            if (step.selectedStep.label === 'details') {
                focusInput = this.emailElement?.nativeElement as HTMLInputElement;
            } else if (step.selectedStep.label === 'paymentInfo') {
                focusInput = this.paymentInfoNextElement?.nativeElement as HTMLInputElement;
                this.paymentInfoProviderControl?.setValue(PaymentProvider.Fibonatix);
                const kycStatusData = this.auth.getMyKycStatus();
                if (kycStatusData === null) {
                    this.errorMessage = this.errorHandler.getRejectedCookieMessage();
                } else {
                    this.inProgress = true;
                    kycStatusData.valueChanges.subscribe(({ data }) => {
                        const kycStatus = data.myKycStatus as KycStatus;
                        this.showKycStep = (kycStatus === KycStatus.Init || kycStatus === KycStatus.NotFound);
                        this.showCodeConfirm = this.needToShowCodeConfirmation();
                        this.inProgress = false;
                    }, (error) => {
                        this.inProgress = false;
                        if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
                            this.resetStepper();
                        } else {
                            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load your identification status');
                        }
                    });
                }
            } else if (step.selectedStep.label === 'verification') {
                focusInput = this.verificationResetElement?.nativeElement as HTMLInputElement;
                this.getKycSettings();
            } else if (step.selectedStep.label === 'confirmation') {
                focusInput = this.codeElement?.nativeElement as HTMLInputElement;
            } else if (step.selectedStep.label === 'payment') {
                const instrument = this.paymentInfoInstrumentControl?.value;
                if (instrument === PaymentInstrument.CreditCard) {
                    this.paymentTitle = 'Payment by credit card';
                    this.paymentCreditCard = true;
                    this.paymentCompleteControl?.setValue('creditcard');
                } else {
                    this.paymentTitle = 'Payment is not implemented';
                }
                focusInput = this.paymentNextElement?.nativeElement as HTMLInputElement;
            } else if (step.selectedStep.label === 'complete') {
                // we can't set focus to the button as it causes scroll to this button.
                // So, the step header box stays here after last page appearing as the objective evil
                // If there will be introdused some other element closer to the top of the page to be able to get focus, we can set focus there
                // focusInput = this.checkoutDoneElement?.nativeElement as HTMLInputElement;
                this.processDone = true;
            }
            // Element cannot be focused at once, we need to wait for a moment
            if (focusInput !== undefined) {
                setTimeout(() => {
                    focusInput?.focus();
                }, 100);
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
        this.showCodeConfirm = this.showCodeConfirm = this.needToShowCodeConfirmation();
        this.processDone = false;
        this.paymentCreditCard = false;
        this.summary.reset();
        if (this.stepper) {
            this.stepper.reset();
            this.stepper.steps.forEach(x => x.completed = false);
        }
        this.currentCard = new CardView();
        this.ngDetailsForm?.resetForm();
        this.ngPaymentInfoForm?.resetForm();
        this.ngConfirmationForm?.resetForm();
        this.ngPaymentForm?.resetForm();
        if (this.auth.authenticated) {
            const user = this.auth.user;
            if (user) {
                this.detailsEmailControl?.setValue(user.email);
            }
        }
        this.detailsTransactionControl?.setValue(TransactionType.Deposit);
        this.paymentInfoInstrumentControl?.setValue(PaymentInstrument.CreditCard);
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
                // user is already authorised
                if (this.stepper) {
                    this.stepper?.next();
                }
            } else {
                this.inProgress = true;
                // try to authorised a user
                this.auth.authenticate(userEmail, '', true).subscribe(({ data }) => {
                    const userData = data.login as LoginResult;
                    this.handleSuccessLogin(userData);
                }, (error) => {
                    this.inProgress = false;
                    if (this.errorHandler.getCurrentError() === 'auth.password_null_or_empty') {
                        // Internal user cannot be authorised without a password, so need to 
                        //  show the authorisation form to fill
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

    paymentInfoCompleted(): void {
        this.paymentInfoTransactionIdControl?.setValue('ready');
        if (this.paymentInfoForm.valid) {
            this.registerOrder();
        }
    }

    confirmPayment(): void {
        this.confirmationCompleteControl?.setValue('ready');
        if (this.confirmationForm.valid) {
            this.inProgress = true;
            const code = this.confirmationCodeControl?.value;
            const transaction = this.paymentInfoTransactionIdControl?.value;
            this.dataService.confirmQuickCheckout(transaction, code).subscribe(({ data }) => {
                this.inProgress = false;
                if (this.stepper) {
                    this.stepper?.next();
                }
            }, (error) => {
                this.inProgress = false;
                if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
                    this.resetStepper();
                } else {
                    this.confirmationCompleteControl?.reset();
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
                }
            });
        }
    }

    cardDetails(card: CardView) {
        this.currentCard = card;
    }

    paymentCompleted(): void {
        this.paymentCompleteControl?.setValue('ready');
        if (this.paymentForm.valid && this.currentCard.valid) {
            const transaction = this.paymentInfoTransactionIdControl?.value;
            const instrument = this.paymentInfoInstrumentControl?.value;
            const payment = this.paymentInfoProviderControl?.value;
            this.dataService.preAuth(transaction, instrument, payment, this.currentCard).subscribe(({ data }) => {
                const preAuthResult = data.preauth as PaymentPreauthResultShort;
                const order = preAuthResult as PaymentOrderShort;
                console.log(preAuthResult.html);
                this.htmlTest = preAuthResult.html as string;
                this.inProgress = false;
                if (this.stepper) {
                    this.stepper?.next();
                }
            }, (error) => {
                this.inProgress = false;
                if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
                    this.resetStepper();
                } else {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
                }
            });
        }
    }

    /*
    This method is invoked when a user presses the NEXT button
    */
    kycProcessCompleted(): void {
        if (this.stepper) {
            this.stepper?.next();
        }
    }

    /*
    This method is invoked by the KYC widget when a user finishes KYC process
     */
    kycCompleted(): void {
        this.showKycSubmit = true;
        this.showKycValidator = false;
    }

    done(): void {
        this.router.navigateByUrl(this.auth.getUserMainPage());
    }

    private getCurrency(id: string): CurrencyView | null {
        const c = this.pCurrencies.find(x => x.id === id);
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








// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta http-equiv="content-type" content="text/html; charset=UTF-8" >     
//     <meta http-equiv="refresh" content="10;URL='https://channel.paragon.online/payment-form/logs/e8M9iKQA'" />    

//     <title>Redirecting ...</title>
// </head>
// <body>
//     Redirecting...
//     <form name="returnform" action="https://channel.paragon.online/payment-redirect/e8M9iKQA" method="get">
        
//         <noscript>
//                 <input type="submit" name="submit" value="Press this button to continue"/>
//         </noscript>
//     </form>

//     <script>
        
//     function run(){
//             try {

//             var a = window.screen.height,
//             r = window.screen.width,
//             s = window.screen.colorDepth,
//             i = navigator.javaEnabled(),
//             o = navigator.userAgent,
//             c = new Date().getTimezoneOffset(),
//             d = (navigator.browserLanguage !== undefined) ? navigator.browserLanguage : navigator.language;
//             var fingerprintUrl = "".concat("https://channel.paragon.online/", "fingerprint/").concat("e8M9iKQA");

//             var fingerprintClient = new XMLHttpRequest();
//             fingerprintClient.open("POST", fingerprintUrl, true);

//             fingerprintClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

//             fingerprintClient.onreadystatechange = function() { 
//                 if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
//                     console.log("submit form");
//                     document.returnform.submit();
//                 }
//             };

//         fingerprintClient.send("time_zone_offset=" + c + "&screen_height=" + a + "&screen_width=" + r + "&color_depth=" + s + "&java_enabled=" + i + "&user_agent=" + o + "&language=" + d);
//     } catch (ex) {
//         console.log("There was an error in code");
//         var xhr = new XMLHttpRequest();
//         xhr.open("POST", "https://channel.paragon.online/" + "payment-form/logs");
//         xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//         xhr.send("Error=" + ex.message + "&SerialNumber=".concat("e8M9iKQA")); 
//     }
// }
// run();
//     </script>
// </body>
// </html>
