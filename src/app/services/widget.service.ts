import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { KycProvider, LoginResult, PaymentInstrument, PaymentProviderByInstrument, SettingsCurrencyWithDefaults, SettingsFeeShort, SettingsKycTierShortEx, SettingsKycTierShortExListResult, TransactionSource, TransactionType, User, WireTransferBankAccountShort } from "../model/generated-models";
import { WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from "../model/payment-base.model";
import { CheckoutSummary, PaymentProviderInstrumentView, WireTransferPaymentCategoryList } from "../model/payment.model";
import { AuthService } from "./auth.service";
import { ErrorService } from "./error.service";
import { PaymentDataService } from "./payment.service";
import { getCurrentTierLevelName, isKycRequired, KycTierResultData } from "./widget.utils";

@Injectable()
export class WidgetService {
    private onProgressChanged: Function | undefined = undefined;  // (status: boolean)
    private onError: Function | undefined = undefined;  // (msg: string)
    private onIdentificationRequired: Function | undefined = undefined;
    private onAuthenticationRequired: Function | undefined = undefined;  // (email: string)
    private onLoginRequired: Function | undefined = undefined;  // (email: string)
    private onLoginSuccess: Function | undefined = undefined;  // (result: LoginResult)
    private onConfirmEmailRequired: Function | undefined = undefined;  // (email: string)
    private onKycStatusUpdate: Function | undefined = undefined;  // (status: boolean)
    private onPaymentProvidersLoaded: Function | undefined = undefined;  // (status: boolean)
    private onWireTranferListLoaded: Function | undefined = undefined;  // (wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string)
    private userInfoRequired: Function | undefined = undefined;
    private companyLevelVerification: Function | undefined = undefined;

    private pSubscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private paymentService: PaymentDataService,
        private errorHandler: ErrorService) { }

    register(
        progressCallback: Function | undefined,
        errorCallback: Function | undefined,
        identificationCallback: Function | undefined,
        authenticationCallback: Function | undefined,
        loginRequiredCallback: Function | undefined,
        loginSuccessCallback: Function | undefined,
        confirmEmailCallback: Function | undefined,
        kycStatusCallback: Function | undefined,
        paymentProvidersCallback: Function | undefined,
        wireTranferListLoadedCallback: Function | undefined,
        userInfoRequired?: Function | undefined,
        companyLevelVerificationHandler?: Function | undefined) {
        this.onProgressChanged = progressCallback;
        this.onError = errorCallback;
        this.onIdentificationRequired = identificationCallback;
        this.onAuthenticationRequired = authenticationCallback;
        this.onLoginRequired = loginRequiredCallback;
        this.onLoginSuccess = loginSuccessCallback;
        this.onConfirmEmailRequired = confirmEmailCallback;
        this.onKycStatusUpdate = kycStatusCallback;
        this.onPaymentProvidersLoaded = paymentProvidersCallback;
        this.onWireTranferListLoaded = wireTranferListLoadedCallback;
        this.userInfoRequired = userInfoRequired;
        this.companyLevelVerification = companyLevelVerificationHandler;
    }

    getSettingsCommon(summary: CheckoutSummary, widget: WidgetSettings, updatedUserData: boolean): void {
        if (this.onError) {
            this.onError('');
        }
        if (this.auth.token === '') {
            this.handleExpiredSession(summary.email);
        } else {
            const dataGetter$ = this.auth.getSettingsCommon().valueChanges.pipe(take(1));
            this.pSubscriptions.add(
                dataGetter$.subscribe(({ data }) => {
                    if (this.auth.user) {
                        this.auth.setLocalSettingsCommon(data.getSettingsCommon);
                        this.getTiers(summary, widget);
                    } else {
                        if (updatedUserData) {
                            this.authenticate(summary.email, widget.widgetId);
                        } else {
                            if (this.onLoginRequired) {
                                this.onLoginRequired(summary.email);
                            }
                        }
                    }
                    if (this.onProgressChanged) {
                        this.onProgressChanged(false);
                    }
                }, (error) => {
                    if (this.onProgressChanged) {
                        this.onProgressChanged(false);
                    }
                    this.handleError(error, summary.email, 'Unable to read settings');
                })
            );
        }
    }

    authenticate(login: string, widgetId: string) {
        if (this.onError) {
            this.onError('');
        }
        // Consider that the user is one-time wallet user rather than internal one
        try {
            const authenticateData$ = this.auth.authenticate(
                widgetId !== '',
                login,
                '',
                true,
                (widgetId !== '') ? widgetId : undefined).pipe(take(1));
            if (this.onProgressChanged) {
                this.onProgressChanged(true);
            }
            this.pSubscriptions.add(
                authenticateData$.subscribe(({ data }) => {
                    if (this.onProgressChanged) {
                        this.onProgressChanged(false);
                    }
                    if (this.onLoginSuccess) {
                        this.onLoginSuccess(data.login as LoginResult);
                    }
                }, (error) => {
                    if (this.onProgressChanged) {
                        this.onProgressChanged(false);
                    }
                    if (this.errorHandler.getCurrentError() === 'auth.password_null_or_empty') {
                        // Internal user cannot be authorised without a password, so need to
                        //  show the authorisation form to fill
                        if (this.onLoginRequired) {
                            this.onLoginRequired(login);
                        }
                    } else if (this.errorHandler.getCurrentError() === 'auth.unconfirmed_email') {
                        // User has to confirm email verifying the code
                        if (this.onConfirmEmailRequired) {
                            this.onConfirmEmailRequired(login);
                        }
                    } else {
                        if (this.onError) {
                            this.onError(this.errorHandler.getError(error.message, 'Unable to authenticate user'));
                        }
                    }
                })
            );
        } catch (e) {
            if (this.onError) {
                this.onError(e as string);
            }
        }
    }

    getWireTransferSettings(summary: CheckoutSummary, widget: WidgetSettings): void {
        if (this.onError) {
            this.onError('');
        }
        if (this.onProgressChanged) {
            this.onProgressChanged(true);
        }
        let currency = summary.currencyTo;
        if ((summary.providerView?.id ?? '') === 'Openpayd') {
            currency = summary.currencyFrom;
        }
        const settingsData$ = this.paymentService.mySettingsFee(
            summary.transactionType,
            this.getSource(widget),
            PaymentInstrument.WireTransfer,
            summary.providerView?.id ?? '',
            summary.currencyTo,
            summary.currencyFrom,
            widget.widgetId).valueChanges.pipe(take(1));
        this.pSubscriptions.add(
            settingsData$.subscribe(({ data }) => {
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                let wireTransferList: WireTransferPaymentCategoryItem[] = [];
                let accountData: WireTransferBankAccountShort | undefined = undefined;
                const settingsResult = data.mySettingsFee as SettingsFeeShort;
                if(settingsResult.requiredFields && settingsResult.requiredFields.length > 0 && this.userInfoRequired){
                    this.userInfoRequired(settingsResult.requiredFields);
                }else if (settingsResult.costs) {
                    if (settingsResult.costs.length > 0) {
                        const costs = settingsResult.costs[0];
                        if (costs.bankAccounts && (costs.bankAccounts?.length ?? 0 > 0)) {
                            accountData = costs.bankAccounts[0];
                            wireTransferList = WireTransferPaymentCategoryList.map(val => val);
                            let pos = wireTransferList.findIndex(x => x.id === WireTransferPaymentCategory.AU);
                            if (pos >= 0) {
                                if (accountData.au === null || accountData.au === undefined || accountData.au === 'null') {
                                    wireTransferList.splice(pos, 1);
                                } else {
                                    wireTransferList[pos].data = accountData.au;
                                    wireTransferList[pos].bankAccountId = accountData.bankAccountId;
                                }
                            }

                            pos = wireTransferList.findIndex(x => x.id === WireTransferPaymentCategory.UK);
                            if (pos >= 0) {
                                if (accountData.uk === null || accountData.uk === undefined || accountData.uk === 'null') {
                                    wireTransferList.splice(pos, 1);
                                } else {
                                    wireTransferList[pos].data = accountData.uk;
                                    wireTransferList[pos].bankAccountId = accountData.bankAccountId;
                                }
                            }

                            pos = wireTransferList.findIndex(x => x.id === WireTransferPaymentCategory.EU);
                            if (pos >= 0) {
                                if (accountData.eu === null || accountData.eu === undefined || accountData.eu === 'null') {
                                    wireTransferList.splice(pos, 1);
                                } else {
                                    wireTransferList[pos].data = accountData.eu;
                                    wireTransferList[pos].bankAccountId = accountData.bankAccountId;
                                }
                            }

                            pos = wireTransferList.findIndex(x => x.id === WireTransferPaymentCategory.OPENPAYD);
                            if (pos >= 0) {
                                if (accountData.openpaydObject === null || accountData.openpaydObject === undefined || accountData.openpaydObject === 'null') {
                                    wireTransferList.splice(pos, 1);
                                } else {
                                    wireTransferList[pos].data = accountData.openpaydObject;
                                    wireTransferList[pos].bankAccountId = accountData.bankAccountId;
                                }
                            }

                            pos = wireTransferList.findIndex(x => x.id === WireTransferPaymentCategory.FLASHFX);
                            if (pos >= 0) {
                                if (accountData.flashfxObject === null || accountData.flashfxObject === undefined || accountData.flashfxObject === 'null') {
                                    wireTransferList.splice(pos, 1);
                                } else {
                                    wireTransferList[pos].data = accountData.flashfxObject;
                                    wireTransferList[pos].bankAccountId = accountData.bankAccountId;
                                }
                            }
                        }
                        if (this.onWireTranferListLoaded) {
                            this.onWireTranferListLoaded(wireTransferList, accountData?.bankAccountId);
                        }
                    } else {
                        if (this.onWireTranferListLoaded) {
                            this.onWireTranferListLoaded(wireTransferList, '');
                        }
                    }
                } else {
                    if (this.onWireTranferListLoaded) {
                        this.onWireTranferListLoaded(wireTransferList, '');
                    }
                }

            }, (error) => {
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                this.handleError(error, summary.email, 'Unable to get wire transfer settings');
            })
        );
    }

    sendWireTransferMessage(email: string, id: string, callback: Function): void {
        if (this.onError) {
            this.onError('');
        }
        try {
            const messageData$ = this.paymentService.sendInvoice(id).pipe(take(1));
            if (this.onProgressChanged) {
                this.onProgressChanged(true);
            }
            this.pSubscriptions.add(
                messageData$.subscribe(({ data }) => {
                    if (this.onProgressChanged) {
                        this.onProgressChanged(false);
                    }
                    if (callback) {
                        callback();
                    }
                }, (error) => {
                    if (this.onProgressChanged) {
                        this.onProgressChanged(false);
                    }
                    this.handleError(error, email, 'Unable to send a message');
                })
            );
        } catch (e) {
            if (this.onError) {
                this.onError(e as string);
            }
        }
    }

    private getTiers(summary: CheckoutSummary, widget: WidgetSettings): void {
        if (this.onError) {
            this.onError('');
        }
        const currency = summary.currencyFrom ?? 'EUR';
        const amount = summary.amountFrom ?? 0;
        const limit = summary.quoteLimit ?? 0;
        const overLimit = amount - limit;
        const tiersData$ = this.paymentService.getAppropriateSettingsKycTiers(
            overLimit,
            currency,
            TransactionSource.Widget,
            this.auth.user?.kycProvider as KycProvider ?? KycProvider.SumSub,
            widget.widgetId).valueChanges.pipe(take(1));
        this.pSubscriptions.add(
            tiersData$.subscribe(({ data }) => {
                const currentTierId = this.auth.user?.kycValid != true ? '-' : this.auth.user?.kycTierId ?? '';
                const tierData = getCurrentTierLevelName(
                    currentTierId, 
                    data.getAppropriateSettingsKycTiers as SettingsKycTierShortExListResult, this.auth.user);
                this.getKycStatus(summary, widget, tierData);
            }, (error) => {
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                this.handleError(error, summary.email, 'Unable to get verification levels');
            })
        );
    }

    private getKycStatus(summary: CheckoutSummary, widget: WidgetSettings, tierData: KycTierResultData): void {
        if (this.onError) {
            this.onError('');
        }
        
        const kycStatusData$ = this.auth.getMyKycData().valueChanges.pipe(take(1));
        if (this.onProgressChanged) {
            this.onProgressChanged(true);
        }
        this.pSubscriptions.add(
            kycStatusData$.subscribe(({ data }) => {
                const userKyc = data.me as User;
                const kycData = isKycRequired(userKyc, tierData);
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                if (kycData[0] === null) {
                    if (this.onError) {
                        this.onError('Unable proceed your payment, because your identity is rejected');
                    }
                } else {
                    if (this.onKycStatusUpdate) {
                        if(tierData.showForm){
                            if(this.companyLevelVerification){
                                this.companyLevelVerification();
                            }
                        }
                        this.onKycStatusUpdate(kycData[0] === true, kycData[1]);
                    }
                    if (summary.transactionType === TransactionType.Buy) {
                        this.loadPaymentProviders(summary, widget);
                    } else {
                        if (this.onError) {
                            this.onError(`Transaction type "${summary.transactionType}" is currently not supported`);
                        }
                    }
                }
            }, (error) => {
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                this.handleError(error, summary.email, 'Unable to load your identification status');
            })
        );
    }

    private loadPaymentProviders(summary: CheckoutSummary, widget: WidgetSettings): void {
        let fiatCurrency = '';
        if (summary.transactionType === TransactionType.Buy) {
            fiatCurrency = summary.currencyFrom;
        } else if (summary.transactionType === TransactionType.Sell) {
            fiatCurrency = summary.currencyTo;
        }
        const widgetId = widget.widgetId;
        const providersData$ = this.paymentService.getProviders(
            fiatCurrency, (widgetId !== '') ? widgetId : undefined, this.getSource(widget)
        ).valueChanges.pipe(take(1));
        if (this.onProgressChanged) {
            this.onProgressChanged(true);
        }
        this.pSubscriptions.add(
            providersData$.subscribe(({ data }) => {
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                if (this.onPaymentProvidersLoaded) {
                    this.onPaymentProvidersLoaded(this.getPaymentProviderList(
                        summary,
                        data.getAppropriatePaymentProviders as PaymentProviderByInstrument[]));
                }
            }, (error) => {
                if (this.onProgressChanged) {
                    this.onProgressChanged(false);
                }
                this.handleError(error, summary.email, 'Unable to load payment instruments');
            })
        );
    }

    private getPaymentProviderList(summary: CheckoutSummary, list: PaymentProviderByInstrument[]): PaymentProviderInstrumentView[] {
        let currency = '';
        if (summary.transactionType === TransactionType.Buy) {
            currency = summary.currencyFrom ?? '';
        } else if (summary.transactionType === TransactionType.Sell) {
            currency = summary.currencyTo ?? '';
        }
        const dataList = list
            .filter(x => x.provider?.currencies?.includes(currency, 0) || x.provider?.currencies?.length == 0 || x.instrument === PaymentInstrument.WireTransfer)
            .map(val => new PaymentProviderInstrumentView(val));
        // if (!dataList.find(x => x.instrument === PaymentInstrument.WireTransfer)) {
        //     dataList.push(new PaymentProviderInstrumentView({
        //         instrument: PaymentInstrument.WireTransfer,
        //         provider: {
        //             name: 'WireTransferPayment'
        //         }
        //     }));
        // }
        return dataList;
    }

    private handleError(error: any, email: string, defaultMessage: string): void {
        if (error.message === 'Access denied' || this.errorHandler.getCurrentError() === 'auth.token_invalid') {
            this.handleExpiredSession(email);
        } else {
            if (this.onError) {
                this.onError(this.errorHandler.getError(error.message, defaultMessage));
            }
        }
    }

    private handleExpiredSession(email: string): void {
        if (email) {
            if (this.onAuthenticationRequired) {
                this.onAuthenticationRequired(email);
            }
        } else {
            if (this.onIdentificationRequired) {
                this.onIdentificationRequired();
            }
        }
    }

    private getSource(widget: WidgetSettings): TransactionSource {
        let source = TransactionSource.Wallet;
        if (widget.embedded === false) {
            if (widget.widgetId === '') {
                source = TransactionSource.QuickCheckout;
            } else {
                source = TransactionSource.Widget;
            }
        }
        return source;
    }
}
