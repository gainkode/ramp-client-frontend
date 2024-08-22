import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { KycProvider, LoginResult, PaymentInstrument, SettingsCostShort, SettingsKycTierShortExListResult, TransactionSource, User, WireTransferBankAccountShort } from '../model/generated-models';
import { WidgetSettings, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { CheckoutSummary } from '../model/payment.model';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { PaymentDataService } from './payment.service';
import { getCurrentTierLevelName, isKycRequired, KycTierResultData } from './widget.utils';

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
	private onPaymentMethodsLoaded: Function | undefined = undefined;  // (status: boolean)
	private onRecaptchaCallback: Function | undefined = undefined;  // (status: boolean)
	private onWireTranferListLoaded: Function | undefined = undefined;  // (wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string)
	private userInfoRequired: Function | undefined = undefined;
	private companyLevelVerification: Function | undefined = undefined;
	private onQuickcheckout: boolean | undefined = undefined;

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
		companyLevelVerificationHandler?: Function | undefined,
		recaptchaCallback?: Function | undefined,
		quickcheckout?: boolean | undefined): void {
		this.onProgressChanged = progressCallback;
		this.onError = errorCallback;
		this.onIdentificationRequired = identificationCallback;
		this.onAuthenticationRequired = authenticationCallback;
		this.onLoginRequired = loginRequiredCallback;
		this.onLoginSuccess = loginSuccessCallback;
		this.onConfirmEmailRequired = confirmEmailCallback;
		this.onKycStatusUpdate = kycStatusCallback;
		this.onPaymentProvidersLoaded = paymentProvidersCallback;
		this.onRecaptchaCallback = recaptchaCallback;
		this.onWireTranferListLoaded = wireTranferListLoadedCallback;
		this.userInfoRequired = userInfoRequired;
		this.companyLevelVerification = companyLevelVerificationHandler;
		this.onQuickcheckout = quickcheckout;
	}

	getSettingsCommon(summary: CheckoutSummary, widget: WidgetSettings, updatedUserData: boolean): void {
		if (this.auth.token === '') {
			this.handleExpiredSession(summary.email);
		} else {
			this.pSubscriptions.add(
				this.auth.getSettingsCommon().valueChanges.pipe(take(1)).subscribe(({ data }) => {
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

	authenticate(login: string, widgetId: string): void {
		const recaptcha = localStorage.getItem('recaptchaId');

		if (recaptcha || !this.onQuickcheckout) {
			this.authenticateInternal(login, widgetId);
		} else {
			if (this.onRecaptchaCallback) {
				this.onRecaptchaCallback();
			}
		}
	}

	authenticateInternal(login: string, widgetId: string): void {
		try {
			const authenticateData$ = this.onQuickcheckout 
				? this.auth.authenticate(
					widgetId !== '',
					login,
					'',
					true,
					(widgetId !== '') ? widgetId : undefined)
				: this.auth.authenticateWidget(
					widgetId !== '',
					login,
					'',
					true,
					(widgetId !== '') ? widgetId : undefined);
			authenticateData$.pipe(take(1));

			if (this.onProgressChanged) {
				this.onProgressChanged(true);
			}
			
			this.pSubscriptions.add(
				authenticateData$.subscribe(({ data }) => {
					const dataLogin = data?.login ?? data?.loginWidget;
					
					if (this.onProgressChanged) {
						this.onProgressChanged(false);
					}
					if (this.onLoginSuccess) {
						this.onLoginSuccess(dataLogin as LoginResult);
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
					} else if (this.errorHandler.getCurrentError() === 'auth.recaptcha_invalid') {
						// User has to confirm email verifying the code
						localStorage.removeItem('recaptchaId');
						if(this.onRecaptchaCallback){
							this.onRecaptchaCallback();
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
		if (this.onProgressChanged) {
			// this.onProgressChanged(true);
			// this.onProgressChanged(false);
		}

		// this.pSubscriptions.add(
		// 	this.paymentService.mySettingsCost(
		// 		summary.transactionType,
		// 		PaymentInstrument.WireTransfer,
		// 		'',
		// 		widget.widgetId
		// 	).valueChanges.pipe(take(1)).subscribe(({ data }) => {
		// 		if (this.onProgressChanged) {
		// 			this.onProgressChanged(false);
		// 		}

		// 		const wireTransferList: WireTransferPaymentCategoryItem[] = [];
		// 		const accountData: WireTransferBankAccountShort | undefined = undefined;
		// 		const costs = data.mySettingsCost as SettingsCostShort;

		// 		if (costs) {
		// 			if (accountData.objectsDetails?.length !== 0) {
		// 				for(const object of accountData.objectsDetails){
		// 					wireTransferList.push({
		// 						title: object.title,
		// 						id: object.id,
		// 						data: JSON.stringify(object),
		// 						bankAccountId: accountData.bankAccountId
		// 					});
		// 				}
		// 			}

		// 			if (this.onWireTranferListLoaded) {
		// 				this.onWireTranferListLoaded(wireTransferList, accountData?.bankAccountId);
		// 			}
		// 		} else {
		// 			if (this.onWireTranferListLoaded) {
		// 				this.onWireTranferListLoaded(wireTransferList, '');
		// 			}
		// 		}
		// 	}, (error) => {
		// 		if (this.onProgressChanged) {
		// 			this.onProgressChanged(false);
		// 		}
		// 		this.handleError(error, summary.email, 'Unable to get wire transfer settings');
		// 	})
		// );
	}

	sendWireTransferMessage(email: string, id: string, callback: Function): void {
		try {
			const messageData$ = this.paymentService.sendInvoice(id).pipe(take(1));
			if (this.onProgressChanged) {
				this.onProgressChanged(true);
			}
			this.pSubscriptions.add(
				messageData$.subscribe(() => {
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
		const currency = summary.currencyFrom ?? 'EUR';
		const amount = summary.amountFrom ?? 0;
		
		const tiersData$ = this.paymentService.getAppropriateSettingsKycTiers(
			amount,
			currency,
			TransactionSource.Widget,
			this.auth.user?.kycProvider as KycProvider ?? KycProvider.SumSub,
			widget.widgetId).valueChanges.pipe(take(1));

		this.pSubscriptions.add(
			tiersData$.subscribe(({ data }) => {
				const currentTierId = this.auth.user?.kycValid !== true ? '-' : this.auth.user?.kycTierId ?? '';
				const tierData = getCurrentTierLevelName(
					currentTierId, 
					data.getAppropriateSettingsKycTiers as SettingsKycTierShortExListResult,
					this.auth.user);
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
		if (this.onProgressChanged) {
			this.onProgressChanged(true);
		}

		this.pSubscriptions.add(
			this.auth.getMyKycData().valueChanges.pipe(take(1)).subscribe(({ data }) => {
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
						if (tierData.showForm && this.companyLevelVerification) {
							this.companyLevelVerification();
						}
						this.onKycStatusUpdate(kycData[0] === true, kycData[1]);
					}

					this.onPaymentProvidersLoaded();
				}
			}, (error) => {
				if (this.onProgressChanged) {
					this.onProgressChanged(false);
				}
				this.handleError(error, summary.email, 'Unable to load your identification status');
			})
		);
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
}
