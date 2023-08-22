import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { CurrencyView, CustodyProviderList, KycProviderList } from 'model/payment.model';
import { LiquidityProviderList } from 'admin/model/lists.model';
import { TransactionConfirmationModeList } from 'admin/model/settings.model';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PaymentProviderPayoutType, SettingsCommon, SettingsCurrencyWithDefaults, TransactionConfirmationMode, UserRoleObjectCode } from 'model/generated-models';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';

interface FrameBlock {
	X: number;
	Y: number;
}

@Component({
	selector: 'app-admin-common-settings',
	templateUrl: 'common.component.html',
	styleUrls: ['common.component.scss']
})
export class AdminCommonSettingsComponent implements OnInit, OnDestroy {
	inProgress = false;
	submitted = false;
	saveInProgress = false;
	errorMessage = '';
	permission = 0;
	kycProviderOptions = KycProviderList;
	custodyProviderOptions = CustodyProviderList;
	liquidityProviderOptions = LiquidityProviderList;
	transactionConfirmationModeOptions = TransactionConfirmationModeList;
	paymentProviderPayoutType = PaymentProviderPayoutType;
	paymentProviderPayoutInProgress = false;
	paymentProviderRefundInProgress = false;
	emails: string[] = [];
	refundAmount = 0;
	refundTransactionId = '';
	emailLoading = false;
	adminAdditionalSettings: Record<string, any> = {};
	defaultCustodyWithdrawalKeys: { [key: string]: string; } = {};
	defaultLiquidityWithdrawalKeys: { [key: string]: string; } = {};
	additionalSettings: Record<string, any> = {};
	cryptoList: CurrencyView[] = [];
	riskFrames: FrameBlock[] = [
		{ X: 1, Y: 1 },
		{ X: 2, Y: 2 },
		{ X: 3, Y: 3 },
		{ X: 4, Y: 4 },
		{ X: 5, Y: 5 }
	];

	form = this.formBuilder.group({
		id: [null],
		liquidityProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
		custodyProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
		kycProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
		adminEmails: [[]],
		stoppedForServicing: [false, { validators: [Validators.required], updateOn: 'change' }],

		// Auth
		emailCodeNumberLength: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		// Admin
		editTransactionDestination: [false, { validators: [Validators.required], updateOn: 'change' }],
		// Crypto widget
		cryptoWidgetPaymentTimeout: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		// Verify When Paid
		verifyWhenPaid: [false],
		// Wire Transfer
		wireTransferWallet: [false],
		wireTransferExchange: [false],
		// Custody providers
		transferOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		// Custody providers - Fireblocks
		fireblocksCachedDepositAddressLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		fireblocksCachedExternalWalletLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		fireblocksCachedInternalWalletLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		fireblocksCachedVaultAccountLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		fireblocksDefaultUserVaultName: [''],
		fireblocksTrackWithdrawals: [false],
		fireblocksTrackWithdrawalsOneByOne: [false],
		fireblocksWithdrawalFromCustodyProviderDestinationAddress: [this.defaultCustodyWithdrawalKeys],
		fireblocksWithdrawalFromLiquidityProviderDestinationAddress: [this.defaultLiquidityWithdrawalKeys],
		fireblocksWithdrawalToEndUserSourceVaultAccountId: [''],
		fireblocksWithdrawalToEndUserSpeed: ['', { validators: [Validators.required], updateOn: 'change' }],
		// Custody providers - Trustology
		trustologyCachedDepositAddressLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		trustologyCachedExternalWalletLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		trustologyCachedInternalWalletLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		trustologyCachedVaultAccountLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		trustologyDefaultUserVaultName: [''],
		trustologyDefaultHostWalletId: [''],
		trustologyNetworkFeeEstimationVaultAccountId: [''],
		trustologyNetworkFeeEstimationVaultAccountIdSubwallet: [''],
		trustologyTrackWithdrawals: [false],
		trustologyTrackWithdrawalsOneByOne: [false],
		trustologyWithdrawalFromCustodyProviderDestinationAddress: [''],
		trustologyWithdrawalFromLiquidityProviderDestinationAddress: [''],
		trustologyWithdrawalToEndUserSourceVaultAccountId: [''],
		trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet: [''],
    
		trustologyWithdrawalToEndUserSpeed: ['', { validators: [Validators.required], updateOn: 'change' }],
		// KYC providers - Sumsub
		kycSumSubWebApiTokenLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		// Risk Center
		riskCenterLoginCountToCompareIpAddress: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		riskCenterMaxFailedLoginAttempts: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		riskCenterHighRiskUserYears: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		riskCenterDepositPercentUp: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],

		// Transactions
		transactionsPaymentCodeNumberLength: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		transactionsQuickCheckoutTransactionConfirmationLifetime: [72000000, { validators: [Validators.required], updateOn: 'change' }],
		transactionsTransactionCodeNumberLength: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		transactionsTransactionConfirmationMode: [undefined, { validators: [Validators.required], updateOn: 'change' }],
		// Liquidity Providers
		liquidityBenchmarkTrackingInterval: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		liquidityCryptoRateLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		liquidityExchangeInfoLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		liquidityExchangeOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		liquidityExchangeTrackingInterval: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		liquiditySettingsCurrencyLifetime: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		liquidityTransferOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		// Liquidity Providers - Bitstamp
		bitstampRateLimit: [false, { validators: [Validators.required], updateOn: 'change' }],
		bitstampTimeout: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		bitstampTrackOrders: [false, { validators: [Validators.required], updateOn: 'change' }],
		bitstampTrackWithdrawals: [false, { validators: [Validators.required], updateOn: 'change' }],
		bitstampWithdrawalBenchmark: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		bitstampWithdrawalBenchmarkAmountToRemain: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		// Liquidity Providers - Kraken
		krakenTrackOrders: [false, { validators: [Validators.required], updateOn: 'change' }],
		krakenTrackWithdrawals: [false, { validators: [Validators.required], updateOn: 'change' }],
		krakenWithdrawalBenchmark: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		krakenWithdrawalBenchmarkAmountToRemain: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],

		openpaydWithdrawalBenchmark: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		monoovaWithdrawalBenchmark: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		refundAmount: [0, {}],
		refundTransactionId: ['', {}],
		flashFxWithdrawalBenchmark: [0, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],

		frameX1: [undefined],
		frameY1: [undefined],
		frameX2: [undefined],
		frameY2: [undefined],
		frameX3: [undefined],
		frameY3: [undefined],
		frameX4: [undefined],
		frameY4: [undefined],
		frameX5: [undefined],
		frameY5: [undefined]
	});

	private subscriptions: Subscription = new Subscription();

	constructor(
		private formBuilder: UntypedFormBuilder,
		private auth: AuthService,
		private adminService: AdminDataService,
		private commonService: CommonDataService,
		private errorHandler: ErrorService,
		private modalService: NgbModal,
		private router: Router
	) {
		this.permission = this.auth.isPermittedObjectCode(UserRoleObjectCode.Settings);
	}

	ngOnInit(): void {
		this.loadCommonSettings();
		this.loadCurrencies();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private loadCommonSettings(): void{
		const settingsCommon = this.auth.getLocalSettingsCommon();
		if (settingsCommon) {
			this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
			this.kycProviderOptions = this.kycProviderOptions.filter(item => this.adminAdditionalSettings.kycProviders[item.id]);
			this.liquidityProviderOptions = this.liquidityProviderOptions.filter(item => this.adminAdditionalSettings.liquidityProvider[item.id]);
			this.custodyProviderOptions = this.custodyProviderOptions.filter(item => this.adminAdditionalSettings.custodyProvider[item.id]);
		}
	}

	private loadCurrencies(): void {
		this.inProgress = true;
		this.errorMessage = '';
		const currencyData$ = this.commonService.getSettingsCurrency();
		this.subscriptions.add(
			currencyData$.valueChanges.subscribe(
				({ data }) => {
					const currencyData = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
					if (currencyData?.settingsCurrency && (currencyData.settingsCurrency.count ?? 0 > 0)) {
						this.cryptoList = currencyData.settingsCurrency.list?.
							filter(x => x.fiat === false).
							map((val) => new CurrencyView(val)) as CurrencyView[];
					} else {
						this.cryptoList = [];
					}
					this.loadData();
				},
				(error) => {
					this.inProgress = false;
					if (error.message === 'Access denied' || this.errorHandler.getCurrentError() === 'auth.token_invalid') {
						void this.router.navigateByUrl('/');
					} else {
						this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load available list of currency types');
					}
				}
			)
		);
	}

	private loadData(): void {
		this.inProgress = true;
		this.errorMessage = '';
		this.subscriptions.add(
			this.adminService.getSettingsCommon()?.valueChanges.subscribe(settings => {
				this.inProgress = false;
				const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
				this.additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
				
				// Common
				this.form.get('id')?.setValue(settingsCommon.settingsCommonId);
				this.form.get('liquidityProvider')?.setValue(settingsCommon.liquidityProvider);
				this.form.get('custodyProvider')?.setValue(settingsCommon.custodyProvider);
				this.form.get('kycProvider')?.setValue(settingsCommon.kycProvider);
				this.form.get('adminEmails')?.setValue(settingsCommon.adminEmails);
				this.form.get('stoppedForServicing')?.setValue(settingsCommon.stoppedForServicing);

				// Auth
				let {emailCodeNumberLength} = this.additionalSettings.auth;
				
				this.form.get('emailCodeNumberLength')?.setValue(emailCodeNumberLength ?? 5);

				// Admin
				let {editTransactionDestination} = this.additionalSettings.admin;

				this.form.get('editTransactionDestination')?.setValue(editTransactionDestination ?? false);

				// Crypto widget
				const paymentTimeout = this.additionalSettings.cryptoWidget?.paymentTimeout ?? 600000;
				this.form.get('cryptoWidgetPaymentTimeout')?.setValue(paymentTimeout / 1000);

				// Core
				const {coreData} = this.additionalSettings.core;
				let {
					custodyProviders: {
						Fireblocks: fireblocks,
						Trustology: trustology
					},
					liquidityProviders: {
						Bitstamp: bitstamp,
						Kraken: kraken
					},
					paymentProviders: {
						Openpayd: openpayd,
						Monoova: monoova,
						FlashFx: flashFx
					},
					kycProviders: {
						SumSub: sumSub
					}
				} = coreData;

				this.form.get('verifyWhenPaid')?.setValue((coreData.verifyWhenPaid ?? true) === true);
				this.form.get('wireTransferWallet')?.setValue((coreData.wireTransferWallet ?? false) === true);
				this.form.get('wireTransferExchange')?.setValue((coreData.wireTransferExchange ?? false) === true);
				
				// Core - Custody providers
				this.form.get('transferOrdersTrackingTimedeltaDays')?.setValue(coreData.custodyProviders.transferOrdersTrackingTimedeltaDays ?? 7);
				
				// Fireblocks
				let custodyAddresses = fireblocks.withdrawalFromCustodyProviderDestinationAddress;
				let liquidityAddresses = fireblocks.withdrawalFromLiquidityProviderDestinationAddress;
				if (custodyAddresses) {
					if (typeof custodyAddresses === 'string') {
						custodyAddresses = this.defaultCustodyWithdrawalKeys;
					}
				} else {
					custodyAddresses = this.defaultCustodyWithdrawalKeys;
				}
				if (liquidityAddresses) {
					if (typeof liquidityAddresses === 'string') {
						liquidityAddresses = this.defaultLiquidityWithdrawalKeys;
					}
				} else {
					liquidityAddresses = this.defaultLiquidityWithdrawalKeys;
				}

				this.form.get('fireblocksCachedDepositAddressLifetime')?.setValue(fireblocks.cachedDepositAddressLifetime ?? 60000);
				this.form.get('fireblocksCachedExternalWalletLifetime')?.setValue(fireblocks.cachedExternalWalletLifetime ?? 60000);
				this.form.get('fireblocksCachedInternalWalletLifetime')?.setValue(fireblocks.cachedExternalWalletLifetime ?? 60000);
				this.form.get('fireblocksCachedVaultAccountLifetime')?.setValue(fireblocks.cachedVaultAccountLifetime ?? 60000);
				this.form.get('fireblocksDefaultUserVaultName')?.setValue(fireblocks.defaultUserVaultName ?? '');
				this.form.get('fireblocksTrackWithdrawals')?.setValue(fireblocks.trackWithdrawals ?? false);
				this.form.get('fireblocksTrackWithdrawalsOneByOne')?.setValue(fireblocks.trackWithdrawalsOneByOne ?? false);
				this.form.get('fireblocksWithdrawalFromCustodyProviderDestinationAddress')?.setValue(custodyAddresses);
				this.form.get('fireblocksWithdrawalFromLiquidityProviderDestinationAddress')?.setValue(liquidityAddresses);
				this.form.get('fireblocksWithdrawalToEndUserSourceVaultAccountId')?.setValue(fireblocks.withdrawalToEndUserSourceVaultAccountId.vaultId ?? '22');
				this.form.get('fireblocksWithdrawalToEndUserSpeed')?.setValue(fireblocks.withdrawalToEndUserSpeed ?? 'MEDIUM');
				
				// Trustology
				this.form.get('trustologyCachedDepositAddressLifetime')?.setValue(trustology.cachedDepositAddressLifetime ?? 60000);
				this.form.get('trustologyCachedExternalWalletLifetime')?.setValue(trustology.cachedExternalWalletLifetime ?? 60000);
				this.form.get('trustologyCachedInternalWalletLifetime')?.setValue(trustology.cachedInternalWalletLifetime ?? 60000);
				this.form.get('trustologyCachedVaultAccountLifetime')?.setValue(trustology.cachedVaultAccountLifetime ?? 60000);
				this.form.get('trustologyDefaultUserVaultName')?.setValue(trustology.defaultUserVaultName ?? '');
				this.form.get('trustologyDefaultHostWalletId')?.setValue(trustology.defaultHostWalletId ?? '');
				this.form.get('trustologyNetworkFeeEstimationVaultAccountId')?.setValue(trustology.networkFeeEstimationVaultAccountId.walletId ?? '');
				this.form.get('trustologyNetworkFeeEstimationVaultAccountIdSubwallet')?.setValue(trustology.networkFeeEstimationVaultAccountId.subWalletName ?? 'Bitcoin');
				this.form.get('trustologyTrackWithdrawals')?.setValue(trustology.trackWithdrawals ?? false);
				this.form.get('trustologyTrackWithdrawalsOneByOne')?.setValue(trustology.trackWithdrawalsOneByOne ?? false);
				this.form.get('trustologyWithdrawalFromCustodyProviderDestinationAddress')?.setValue(trustology.withdrawalFromCustodyProviderDestinationAddress ?? 'test_withdrawal');
				this.form.get('trustologyWithdrawalFromLiquidityProviderDestinationAddress')?.setValue(trustology.withdrawalFromLiquidityProviderDestinationAddress ?? 'test_withdrawal');
				this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountId')?.setValue(trustology.withdrawalToEndUserSourceVaultAccountId.walletId ?? '');
				this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet')?.setValue(trustology.withdrawalToEndUserSourceVaultAccountId.subWalletName ?? 'Bitcoin');
				this.form.get('trustologyWithdrawalToEndUserSpeed')?.setValue(trustology.withdrawalToEndUserSpeed ?? 'MEDIUM');
				
				// Core - KYC providers - Sumsub
				this.form.get('kycSumSubWebApiTokenLifetime')?.setValue(sumSub.webApiTokenLifetime ?? 600000);
				
				// Core - Risk Center
				this.form.get('riskCenterLoginCountToCompareIpAddress')?.setValue(coreData.riskCenter.loginCountToCompareIpAddress ?? 10);
				this.form.get('riskCenterMaxFailedLoginAttempts')?.setValue(coreData.riskCenter.maxFailedLoginAttempts ?? 10);
				this.form.get('riskCenterHighRiskUserYears')?.setValue(coreData.riskCenter.highRiskUserYears ?? 70);
				this.form.get('riskCenterDepositPercentUp')?.setValue(coreData.riskCenter.depositPercentUp ?? 200);

				const frames = coreData.riskCenter.depositAboveXinYtimeFrameMins as FrameBlock[];
				let index = 0;
				frames.forEach(f => {
					index++;
					this.form.get(`frameX${index}`)?.setValue(f.X);
					this.form.get(`frameY${index}`)?.setValue(f.Y);
				});

				// Core - Transactions
				this.form.get('transactionsPaymentCodeNumberLength')?.setValue(coreData.transactions.paymentCodeNumberLength ?? 5);
				this.form.get('transactionsQuickCheckoutTransactionConfirmationLifetime')?.setValue(coreData.transactions.quickCheckoutTransactionConfirmationLifetime ?? 72000000);
				this.form.get('transactionsTransactionCodeNumberLength')?.setValue(coreData.transactions.transactionCodeNumberLength ?? 5);
				this.form.get('transactionsTransactionConfirmationMode')?.setValue(coreData.transactions.transactionConfirmationMode ?? TransactionConfirmationMode.Never);
				
				// Core - Liquidity Providers
				this.form.get('liquidityBenchmarkTrackingInterval')?.setValue(coreData.liquidityProviders.benchmarkTrackingInterval ?? 60000);
				this.form.get('liquidityCryptoRateLifetime')?.setValue(coreData.liquidityProviders.cryptoRateLifetime ?? 60000);
				this.form.get('liquidityExchangeInfoLifetime')?.setValue(coreData.liquidityProviders.exchangeInfoLifetime ?? 3600000);
				this.form.get('liquidityExchangeOrdersTrackingTimedeltaDays')?.setValue(coreData.liquidityProviders.exchangeOrdersTrackingTimedeltaDays ?? 7);
				this.form.get('liquidityExchangeTrackingInterval')?.setValue(coreData.liquidityProviders.exchangeTrackingInterval ?? 60000);
				this.form.get('liquiditySettingsCurrencyLifetime')?.setValue(coreData.liquidityProviders.settingsCurrencyLifetime ?? 600000);
				this.form.get('liquidityTransferOrdersTrackingTimedeltaDays')?.setValue(coreData.liquidityProviders.transferOrdersTrackingTimedeltaDays ?? 7);
				
				// Bitstamp
				this.form.get('bitstampRateLimit')?.setValue(bitstamp.rateLimit ?? false);
				this.form.get('bitstampTimeout')?.setValue(bitstamp.timeout ?? 5000);
				this.form.get('bitstampTrackOrders')?.setValue(bitstamp.trackOrders ?? false);
				this.form.get('bitstampTrackWithdrawals')?.setValue(bitstamp.trackWithdrawals ?? false);
				this.form.get('bitstampWithdrawalBenchmark')?.setValue(bitstamp.withdrawalBenchmark ?? 10000);
				this.form.get('bitstampWithdrawalBenchmarkAmountToRemain')?.setValue(bitstamp.withdrawalBenchmarkAmountToRemain ?? 0);
				
				// Kraken
				this.form.get('krakenTrackOrders')?.setValue(kraken.trackOrders ?? false);
				this.form.get('krakenTrackWithdrawals')?.setValue(kraken.trackWithdrawals ?? false);
				this.form.get('krakenWithdrawalBenchmark')?.setValue(kraken.withdrawalBenchmark ?? 10000);
				this.form.get('krakenWithdrawalBenchmarkAmountToRemain')?.setValue(kraken.withdrawalBenchmarkAmountToRemain ?? 0);

				// Core - Payment Providers
				this.form.get('openpaydWithdrawalBenchmark')?.setValue(openpayd?.benchmarkAmount ?? 10000);
				this.form.get('monoovaWithdrawalBenchmark')?.setValue(monoova?.benchmarkAmount ?? 10000);
				this.form.get('flashFxWithdrawalBenchmark')?.setValue(flashFx?.benchmarkAmount ?? 10000);
			}, (error) => {
				this.inProgress = false;
				this.errorMessage = error;
				if (this.auth.token === '') {
					this.router.navigateByUrl('/');
				}
			})
		);
	}

	private getDataObject(): SettingsCommon {
		const emailList = this.form.get('adminEmails')?.value as string[];
		const frames: FrameBlock[] = [];
		for (let index = 0; index < 5; index++) {
			const fieldX = `frameX${index + 1}`;
			const fieldY = `frameY${index + 1}`;
			const frameX = parseInt(this.form.get(fieldX)?.value);
			const frameY = parseInt(this.form.get(fieldY)?.value);
			if (frameX && frameY) {
				frames.push({
					X: frameX,
					Y: frameY
				});
			}
		}

		let {
			custodyProviders: {
				Fireblocks: fireblocks,
				Trustology: trustology
			},
			liquidityProviders: {
				Bitstamp: bitstamp,
				Kraken: kraken
			},
			paymentProviders: {
				Openpayd: openpayd,
				Monoova: monoova,
				FlashFx: flashFx
			},
			kycProviders: {
				SumSub: sumSub
			}
		} = this.additionalSettings.core;

		// Core
		this.additionalSettings.core.verifyWhenPaid = this.form.get('verifyWhenPaid')?.value ?? false;
		this.additionalSettings.core.wireTransferWallet = this.form.get('wireTransferWallet')?.value ?? false;
		this.additionalSettings.core.wireTransferExchange = this.form.get('wireTransferExchange')?.value ?? false;
		// LiquidityProviders
		this.additionalSettings.core.liquidityProviders.benchmarkTrackingInterval = parseInt(this.form.get('liquidityBenchmarkTrackingInterval')?.value ?? '60000');
		this.additionalSettings.core.liquidityProviders.cryptoRateLifetime = parseInt(this.form.get('liquidityCryptoRateLifetime')?.value ?? '60000');
		this.additionalSettings.core.liquidityProviders.exchangeInfoLifetime = parseInt(this.form.get('liquidityExchangeInfoLifetime')?.value ?? '3600000');
		this.additionalSettings.core.liquidityProviders.exchangeOrdersTrackingTimedeltaDays = parseInt(this.form.get('liquidityExchangeOrdersTrackingTimedeltaDays')?.value ?? '7');
		this.additionalSettings.core.liquidityProviders.exchangeTrackingInterval = parseInt(this.form.get('liquidityExchangeTrackingInterval')?.value ?? '60000');
		this.additionalSettings.core.liquidityProviders.settingsCurrencyLifetime = parseInt(this.form.get('liquiditySettingsCurrencyLifetime')?.value ?? '600000');
		this.additionalSettings.core.liquidityProviders.transferOrdersTrackingTimedeltaDays = parseInt(this.form.get('liquidityTransferOrdersTrackingTimedeltaDays')?.value ?? '7');
		
		// Bitstamp
		bitstamp.rateLimit = this.form.get('bitstampRateLimit')?.value ?? false;
		bitstamp.timeout = parseInt(this.form.get('bitstampTimeout')?.value ?? '5000');
		bitstamp.trackOrders = this.form.get('bitstampTrackOrders')?.value ?? false;
		bitstamp.trackWithdrawals = this.form.get('bitstampTrackWithdrawals')?.value ?? false;
		bitstamp.withdrawalBenchmarkAmountToRemain = parseInt(this.form.get('bitstampWithdrawalBenchmark')?.value ?? '10000');
		
		// Kraken
		kraken.trackOrders = this.form.get('krakenTrackOrders')?.value ?? false;
		kraken.trackWithdrawals = this.form.get('krakenTrackWithdrawals')?.value ?? false;
		kraken.withdrawalBenchmark = parseInt(this.form.get('krakenWithdrawalBenchmark')?.value ?? '10000');
		kraken.withdrawalBenchmarkAmountToRemain = parseInt(this.form.get('krakenWithdrawalBenchmarkAmountToRemain')?.value ?? '0');
		// -------------------------------------------------------------------------------------------

		// PaymentProviders
		openpayd.benchmarkAmount = parseInt(this.form.get('openpaydWithdrawalBenchmark')?.value ?? '10000');
		monoova.benchmarkAmount = parseInt(this.form.get('monoovaWithdrawalBenchmark')?.value ?? '10000');
		flashFx.benchmarkAmount = parseInt(this.form.get('flashFxWithdrawalBenchmark')?.value ?? '10000');
		// this.additionalSettings.core.paymentProviders.PrimeTrust.benchmarkAmount = parseInt(this.form.get('monoovaWithdrawalBenchmark')?.value ?? '10000');
		// -------------------------------------------------------------------------------------------
		
		// CustodyProviders
		this.additionalSettings.core.custodyProviders.transferOrdersTrackingTimedeltaDays = parseInt(this.form.get('transferOrdersTrackingTimedeltaDays')?.value ?? '7');

		// Fireblocks
		fireblocks.cachedDepositAddressLifetime = parseInt(this.form.get('fireblocksCachedDepositAddressLifetime')?.value ?? '60000');
		fireblocks.cachedExternalWalletLifetime = parseInt(this.form.get('fireblocksCachedExternalWalletLifetime')?.value ?? '60000');
		fireblocks.cachedInternalWalletLifetime = parseInt(this.form.get('fireblocksCachedExternalWalletLifetime')?.value ?? '60000');
		fireblocks.cachedVaultAccountLifetime =  parseInt(this.form.get('fireblocksCachedVaultAccountLifetime')?.value ?? '60000');
		fireblocks.defaultUserVaultName = this.form.get('fireblocksDefaultUserVaultName')?.value ?? '';
		fireblocks.trackWithdrawals = this.form.get('fireblocksTrackWithdrawals')?.value ?? false;
		fireblocks.trackWithdrawalsOneByOne = this.form.get('fireblocksTrackWithdrawalsOneByOne')?.value ?? false;
		fireblocks.withdrawalFromCustodyProviderDestinationAddress = this.form.get('fireblocksWithdrawalFromCustodyProviderDestinationAddress')?.value ?? this.defaultCustodyWithdrawalKeys;
		fireblocks.withdrawalFromLiquidityProviderDestinationAddress = this.form.get('fireblocksWithdrawalFromLiquidityProviderDestinationAddress')?.value ?? this.defaultLiquidityWithdrawalKeys;
		fireblocks.withdrawalToEndUserSourceVaultAccountId.vaultId = this.form.get('fireblocksWithdrawalToEndUserSourceVaultAccountId')?.value ?? '2';
		fireblocks.withdrawalToEndUserSpeed = this.form.get('fireblocksWithdrawalToEndUserSpeed')?.value ?? 'MEDIUM';

		// Trustology
		trustology.cachedDepositAddressLifetime = parseInt(this.form.get('trustologyCachedDepositAddressLifetime')?.value ?? '60000');
		trustology.cachedExternalWalletLifetime = parseInt(this.form.get('trustologyCachedExternalWalletLifetime')?.value ?? '60000');
		trustology.cachedInternalWalletLifetime = parseInt(this.form.get('trustologyCachedInternalWalletLifetime')?.value ?? '60000');
		trustology.cachedVaultAccountLifetime = parseInt(this.form.get('trustologyCachedVaultAccountLifetime')?.value ?? '60000');
		trustology.defaultUserVaultName = this.form.get('trustologyDefaultUserVaultName')?.value ?? '';
		trustology.defaultHostWalletId = this.form.get('trustologyDefaultHostWalletId')?.value ?? '';
		trustology.networkFeeEstimationVaultAccountId.walletId = this.form.get('trustologyNetworkFeeEstimationVaultAccountId')?.value ?? '';
		trustology.networkFeeEstimationVaultAccountId.subWalletName = this.form.get('trustologyNetworkFeeEstimationVaultAccountIdSubwallet')?.value ?? '';
		trustology.trackWithdrawals = this.form.get('trustologyTrackWithdrawals')?.value ?? false;
		trustology.trackWithdrawalsOneByOne = this.form.get('trustologyTrackWithdrawalsOneByOne')?.value ?? false;
		trustology.withdrawalFromCustodyProviderDestinationAddress = this.form.get('trustologyWithdrawalFromCustodyProviderDestinationAddress')?.value ?? '';
		trustology.withdrawalFromLiquidityProviderDestinationAddress = this.form.get('trustologyWithdrawalFromLiquidityProviderDestinationAddress')?.value ?? '';
		trustology.withdrawalToEndUserSourceVaultAccountId.walletId = this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountId')?.value ?? '';
		trustology.withdrawalToEndUserSourceVaultAccountId.subWalletName = this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet')?.value ?? '';
		trustology.withdrawalToEndUserSpeed = this.form.get('trustologyWithdrawalToEndUserSpeed')?.value ?? '';
		// -------------------------------------------------------------------------------------------

		// KYC providers
		sumSub.webApiTokenLifetime = parseInt(this.form.get('kycSumSubWebApiTokenLifetime')?.value ?? '600000');
		// -------------------------------------------------------------------------------------------

		// Transactions
		this.additionalSettings.core.transactions.paymentCodeNumberLength = parseInt(this.form.get('transactionsPaymentCodeNumberLength')?.value ?? '5');
		this.additionalSettings.core.transactions.quickCheckoutTransactionConfirmationLifetime = parseInt(this.form.get('transactionsQuickCheckoutTransactionConfirmationLifetime')?.value ?? '72000000');
		this.additionalSettings.core.transactions.transactionCodeNumberLength = parseInt(this.form.get('transactionsTransactionCodeNumberLength')?.value ?? '5');
		this.additionalSettings.core.transactions.transactionConfirmationMode = this.form.get('transactionsTransactionConfirmationMode')?.value ?? TransactionConfirmationMode.Never;
		// -------------------------------------------------------------------------------------------

		// Risk center
		this.additionalSettings.core.riskCenter.loginCountToCompareIpAddress = parseInt(this.form.get('riskCenterLoginCountToCompareIpAddress')?.value ?? '600000');
		this.additionalSettings.core.riskCenter.maxFailedLoginAttempts = parseInt(this.form.get('riskCenterMaxFailedLoginAttempts')?.value ?? '600000');
		this.additionalSettings.core.riskCenter.highRiskUserYears = parseInt(this.form.get('riskCenterHighRiskUserYears')?.value ?? '70');
		this.additionalSettings.core.riskCenter.depositPercentUp = parseInt(this.form.get('riskCenterDepositPercentUp')?.value ?? '200');
		this.additionalSettings.core.riskCenter.depositAboveXinYtimeFrameMins = frames;
		// -------------------------------------------------------------------------------------------

		// Auth
		this.additionalSettings.auth.emailCodeNumberLength = parseInt(this.form.get('emailCodeNumberLength')?.value ?? '5');
		// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		
		// Admin
		this.additionalSettings.admin.editTransactionDestination = this.form.get('editTransactionDestination')?.value === true;
		// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		
		// CryptoWidget
		this.additionalSettings.cryptoWidget.paymentTimeout = parseInt(this.form.get('cryptoWidgetPaymentTimeout')?.value ?? '600000') * 1000;
		// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

		return {
			settingsCommonId: this.form.get('id')?.value,
			liquidityProvider: this.form.get('liquidityProvider')?.value,
			custodyProvider: this.form.get('custodyProvider')?.value,
			kycProvider: this.form.get('kycProvider')?.value,
			adminEmails: emailList,
			additionalSettings: JSON.stringify(this.additionalSettings),
			stoppedForServicing: this.form.get('stoppedForServicing')?.value,
		} as SettingsCommon;
	}

	addTagPromise(tagValue: any) {
		return new Promise((resolve, reject) => {
			this.emailLoading = true;
			const exp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			this.emailLoading = true;
			if (exp.test(tagValue)) {
				resolve(tagValue);
			} else {
				reject('Incorrect email');
			}
		});
	}

	addFireblocksCustodyProviderDestinationAddress(val: { key: string; value: string; }): void {
		const data = this.form.controls.fireblocksWithdrawalFromCustodyProviderDestinationAddress?.value;
		if (data) {
			data[val.key] = val.value;
		}
	}

	addFireblocksLiquidityProviderDestinationAddress(val: { key: string; value: string; }): void {
		const data = this.form.controls.fireblocksWithdrawalFromLiquidityProviderDestinationAddress?.value;
		if (data) {
			data[val.key] = val.value;
		}
	}

	removeFireblocksCustodyProviderDestinationAddress(key: string): void {
		const data = this.form.controls.fireblocksWithdrawalFromCustodyProviderDestinationAddress?.value;
		if (data) {
			delete data[key];
		}
	}

	removeFireblocksLiquidityProviderDestinationAddress(key: string): void {
		const data = this.form.controls.fireblocksWithdrawalFromLiquidityProviderDestinationAddress?.value;
		if (data) {
			delete data[key];
		}
	}

	paymentProviderPayout(provider: string, type:PaymentProviderPayoutType, content: any): void{
		this.paymentProviderPayoutInProgress = true;
		this.subscriptions.add(
			this.adminService.createPaymentProviderPayout(provider, type).subscribe(({ data }) => {
				if(data.createPaymentProviderPayout){
					this.modalService.open(content, {
						backdrop: 'static',
						windowClass: 'modalCusSty',
					});
				}
				this.paymentProviderPayoutInProgress = false;
			}, (error) => {
				this.paymentProviderPayoutInProgress = false;
				this.errorMessage = error;
				if (this.auth.token === '') {
					void this.router.navigateByUrl('/');
				}
			})
		);
	}

	paymentProviderRefund(provider: string, content: any): void{
		this.paymentProviderRefundInProgress = true;
		this.subscriptions.add(
			this.adminService.createPaymentProviderRefund(provider, this.form.get('refundAmount')?.value, this.form.get('refundTransactionId')?.value).subscribe(({ data }) => {
				if(data.createPaymentProviderPayout){
					this.modalService.open(content, {
						backdrop: 'static',
						windowClass: 'modalCusSty',
					});
				}
				this.paymentProviderRefundInProgress = false;
			}, (error) => {
				this.paymentProviderRefundInProgress = false;
				this.errorMessage = error;
				if (this.auth.token === '') {
					void this.router.navigateByUrl('/');
				}
			})
		);
	}

	onSubmit(content: any): void {
		this.submitted = true;
		const data = this.getDataObject();
		this.saveInProgress = true;
		this.errorMessage = '';
		this.subscriptions.add(
			this.adminService.updateSettingsCommon(data).subscribe(() => {
				this.saveInProgress = false;
				this.modalService.open(content, {
					backdrop: 'static',
					windowClass: 'modalCusSty',
				});
			}, (error) => {
				this.saveInProgress = false;
				this.errorMessage = error;
				if (this.auth.token === '') {
					void this.router.navigateByUrl('/');
				}
			})
		);
	}
}
