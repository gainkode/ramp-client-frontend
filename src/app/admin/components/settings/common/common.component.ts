import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { CurrencyView, CustodyProviderList, KycProviderList } from 'src/app/model/payment.model';
import { LiquidityProviderList } from 'src/app/admin/model/lists.model';
import { TransactionConfirmationModeList } from 'src/app/admin/model/settings.model';
import { FormBuilder, Validators } from '@angular/forms';
import { SettingsCommon, SettingsCurrencyWithDefaults, TransactionConfirmationMode } from 'src/app/model/generated-models';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';

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
  emails: string[] = [];
  emailLoading: boolean = false;
  defaultCustodyWithdrawalKeys: { [key: string]: string } = {};
  defaultLiquidityWithdrawalKeys: { [key: string]: string } = {};
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
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private adminService: AdminDataService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('SETTINGS');
  }

  ngOnInit(): void {
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
            this.router.navigateByUrl('/');
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
        const additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
        // Common
        this.form.get('id')?.setValue(settingsCommon.settingsCommonId);
        this.form.get('liquidityProvider')?.setValue(settingsCommon.liquidityProvider);
        this.form.get('custodyProvider')?.setValue(settingsCommon.custodyProvider);
        this.form.get('kycProvider')?.setValue(settingsCommon.kycProvider);
        this.form.get('adminEmails')?.setValue(settingsCommon.adminEmails);
        this.form.get('stoppedForServicing')?.setValue(settingsCommon.stoppedForServicing);
        // Auth
        this.form.get('emailCodeNumberLength')?.setValue(additionalSettings.auth.emailCodeNumberLength ?? 5);
        // Admin
        this.form.get('editTransactionDestination')?.setValue(additionalSettings.admin.editTransactionDestination ?? false);
        // Crypto widget
        const paymentTimeout = additionalSettings.cryptoWidget?.paymentTimeout ?? 600000;
        this.form.get('cryptoWidgetPaymentTimeout')?.setValue(paymentTimeout / 1000);

        console.log('-->', paymentTimeout);

        // Core
        const coreData = additionalSettings.core;
        // Core - Verify When Paid
        this.form.get('verifyWhenPaid')?.setValue((coreData.verifyWhenPaid ?? true) === true);
        this.form.get('wireTransferWallet')?.setValue((coreData.wireTransferWallet ?? false) === true);
        this.form.get('wireTransferExchange')?.setValue((coreData.wireTransferExchange ?? false) === true);
        // Core - Custody providers
        this.form.get('transferOrdersTrackingTimedeltaDays')?.setValue(coreData.custodyProviders.transferOrdersTrackingTimedeltaDays ?? 7);
        // Core - Custody providers - Fireblocks
        this.form.get('fireblocksCachedDepositAddressLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedDepositAddressLifetime ?? 60000);
        this.form.get('fireblocksCachedExternalWalletLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedExternalWalletLifetime ?? 60000);
        this.form.get('fireblocksCachedInternalWalletLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedExternalWalletLifetime ?? 60000);
        this.form.get('fireblocksCachedVaultAccountLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedVaultAccountLifetime ?? 60000);
        this.form.get('fireblocksDefaultUserVaultName')?.setValue(coreData.custodyProviders.Fireblocks.defaultUserVaultName ?? '');
        this.form.get('fireblocksTrackWithdrawals')?.setValue(coreData.custodyProviders.Fireblocks.trackWithdrawals ?? false);
        this.form.get('fireblocksTrackWithdrawalsOneByOne')?.setValue(coreData.custodyProviders.Fireblocks.trackWithdrawalsOneByOne ?? false);
        let custodyAddresses = coreData.custodyProviders.Fireblocks.withdrawalFromCustodyProviderDestinationAddress;
        let liquidityAddresses = coreData.custodyProviders.Fireblocks.withdrawalFromLiquidityProviderDestinationAddress;
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
        this.form.get('fireblocksWithdrawalFromCustodyProviderDestinationAddress')?.setValue(custodyAddresses);
        this.form.get('fireblocksWithdrawalFromLiquidityProviderDestinationAddress')?.setValue(liquidityAddresses);
        this.form.get('fireblocksWithdrawalToEndUserSourceVaultAccountId')?.setValue(coreData.custodyProviders.Fireblocks.withdrawalToEndUserSourceVaultAccountId.vaultId ?? '22');
        this.form.get('fireblocksWithdrawalToEndUserSpeed')?.setValue(coreData.custodyProviders.Fireblocks.withdrawalToEndUserSpeed ?? 'MEDIUM');
        // Core - Custody providers - Trustology
        this.form.get('trustologyCachedDepositAddressLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedDepositAddressLifetime ?? 60000);
        this.form.get('trustologyCachedExternalWalletLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedExternalWalletLifetime ?? 60000);
        this.form.get('trustologyCachedInternalWalletLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedInternalWalletLifetime ?? 60000);
        this.form.get('trustologyCachedVaultAccountLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedVaultAccountLifetime ?? 60000);
        this.form.get('trustologyDefaultUserVaultName')?.setValue(coreData.custodyProviders.Trustology.defaultUserVaultName ?? '');
        this.form.get('trustologyDefaultHostWalletId')?.setValue(coreData.custodyProviders.Trustology.defaultHostWalletId ?? '');
        this.form.get('trustologyNetworkFeeEstimationVaultAccountId')?.setValue(coreData.custodyProviders.Trustology.networkFeeEstimationVaultAccountId.walletId ?? '');
        this.form.get('trustologyNetworkFeeEstimationVaultAccountIdSubwallet')?.setValue(coreData.custodyProviders.Trustology.networkFeeEstimationVaultAccountId.subWalletName ?? 'Bitcoin');
        this.form.get('trustologyTrackWithdrawals')?.setValue(coreData.custodyProviders.Trustology.trackWithdrawals ?? false);
        this.form.get('trustologyTrackWithdrawalsOneByOne')?.setValue(coreData.custodyProviders.Trustology.trackWithdrawalsOneByOne ?? false);
        this.form.get('trustologyWithdrawalFromCustodyProviderDestinationAddress')?.setValue(coreData.custodyProviders.Trustology.withdrawalFromCustodyProviderDestinationAddress ?? 'test_withdrawal');
        this.form.get('trustologyWithdrawalFromLiquidityProviderDestinationAddress')?.setValue(coreData.custodyProviders.Trustology.withdrawalFromLiquidityProviderDestinationAddress ?? 'test_withdrawal');
        this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountId')?.setValue(coreData.custodyProviders.Trustology.withdrawalToEndUserSourceVaultAccountId.walletId ?? '');
        this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet')?.setValue(coreData.custodyProviders.Trustology.withdrawalToEndUserSourceVaultAccountId.subWalletName ?? 'Bitcoin');
        this.form.get('trustologyWithdrawalToEndUserSpeed')?.setValue(coreData.custodyProviders.Trustology.withdrawalToEndUserSpeed ?? "MEDIUM");
        // Core - KYC providers - Sumsub
        this.form.get('kycSumSubWebApiTokenLifetime')?.setValue(coreData.kycProviders.SumSub.webApiTokenLifetime ?? 600000);
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
        // Core - Liquidity Providers - Bitstamp
        this.form.get('bitstampRateLimit')?.setValue(coreData.liquidityProviders.Bitstamp.rateLimit ?? false);
        this.form.get('bitstampTimeout')?.setValue(coreData.liquidityProviders.Bitstamp.timeout ?? 5000);
        this.form.get('bitstampTrackOrders')?.setValue(coreData.liquidityProviders.Bitstamp.trackOrders ?? false);
        this.form.get('bitstampTrackWithdrawals')?.setValue(coreData.liquidityProviders.Bitstamp.trackWithdrawals ?? false);
        this.form.get('bitstampWithdrawalBenchmark')?.setValue(coreData.liquidityProviders.Bitstamp.withdrawalBenchmark ?? 10000);
        this.form.get('bitstampWithdrawalBenchmarkAmountToRemain')?.setValue(coreData.liquidityProviders.Bitstamp.withdrawalBenchmarkAmountToRemain ?? 0);
        // Core - Liquidity Providers - Kraken
        this.form.get('krakenTrackOrders')?.setValue(coreData.liquidityProviders.Kraken.trackOrders ?? false);
        this.form.get('krakenTrackWithdrawals')?.setValue(coreData.liquidityProviders.Kraken.trackWithdrawals ?? false);
        this.form.get('krakenWithdrawalBenchmark')?.setValue(coreData.liquidityProviders.Kraken.withdrawalBenchmark ?? 10000);
        this.form.get('krakenWithdrawalBenchmarkAmountToRemain')?.setValue(coreData.liquidityProviders.Kraken.withdrawalBenchmarkAmountToRemain ?? 0);
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
    let emailList = this.form.get('adminEmails')?.value as string[];
    // Auth
    const authEmailCodeNumberLength = parseInt(this.form.get('emailCodeNumberLength')?.value ?? '5');
    const authData = {
      emailCodeNumberLength: authEmailCodeNumberLength
    };

    // Admin
    const adminEditTransactionDestination = this.form.get('editTransactionDestination')?.value === true;
    const adminData = {
      editTransactionDestination: adminEditTransactionDestination
    };

    // Crypto widget
    const cryptoWidgetPaymentTimeout = parseInt(this.form.get('cryptoWidgetPaymentTimeout')?.value ?? '600000');
    const cryptoWidgetData = {
      paymentTimeout: cryptoWidgetPaymentTimeout * 1000
    };

    // Core
    const coreVerifyWhenPaid = this.form.get('verifyWhenPaid')?.value ?? false;
    const coreWireTransferWallet = this.form.get('wireTransferWallet')?.value ?? false;
    const coreWireTransferExchange = this.form.get('wireTransferExchange')?.value ?? false;
    const coreTransferOrdersTrackingTimedeltaDays = parseInt(this.form.get('transferOrdersTrackingTimedeltaDays')?.value ?? '7');
    // Fireblocks
    const coreFireblocksCachedDepositAddressLifetime = parseInt(this.form.get('fireblocksCachedDepositAddressLifetime')?.value ?? '60000');
    const coreFireblocksCachedExternalWalletLifetime = parseInt(this.form.get('fireblocksCachedExternalWalletLifetime')?.value ?? '60000');
    const coreFireblocksCachedInternalWalletLifetime = parseInt(this.form.get('fireblocksCachedExternalWalletLifetime')?.value ?? '60000');
    const coreFireblocksCachedVaultAccountLifetime = parseInt(this.form.get('fireblocksCachedVaultAccountLifetime')?.value ?? '60000');
    const coreFireblocksDefaultUserVaultName = this.form.get('fireblocksDefaultUserVaultName')?.value ?? '';
    const coreFireblocksTrackWithdrawals = this.form.get('fireblocksTrackWithdrawals')?.value ?? false;
    const coreFireblocksTrackWithdrawalsOneByOne = this.form.get('fireblocksTrackWithdrawalsOneByOne')?.value ?? false;
    const coreFireblocksWithdrawalFromCustodyProviderDestinationAddress = this.form.get('fireblocksWithdrawalFromCustodyProviderDestinationAddress')?.value ?? this.defaultCustodyWithdrawalKeys;
    const coreFireblocksWithdrawalFromLiquidityProviderDestinationAddress = this.form.get('fireblocksWithdrawalFromLiquidityProviderDestinationAddress')?.value ?? this.defaultLiquidityWithdrawalKeys;
    const coreFireblocksWithdrawalToEndUserSourceVaultAccountId = this.form.get('fireblocksWithdrawalToEndUserSourceVaultAccountId')?.value ?? '2';
    const coreFireblocksWithdrawalToEndUserSpeed = this.form.get('fireblocksWithdrawalToEndUserSpeed')?.value ?? 'MEDIUM';
    // Trustology
    const coreTrustologyCachedDepositAddressLifetime = parseInt(this.form.get('trustologyCachedDepositAddressLifetime')?.value ?? '60000');
    const coreTrustologyCachedExternalWalletLifetime = parseInt(this.form.get('trustologyCachedExternalWalletLifetime')?.value ?? '60000');
    const coreTrustologyCachedInternalWalletLifetime = parseInt(this.form.get('trustologyCachedInternalWalletLifetime')?.value ?? '60000');
    const coreTrustologyCachedVaultAccountLifetime = parseInt(this.form.get('trustologyCachedVaultAccountLifetime')?.value ?? '60000');
    const coreTrustologyDefaultUserVaultName = this.form.get('trustologyDefaultUserVaultName')?.value ?? '';
    const coreTrustologyDefaultHostWalletId = this.form.get('trustologyDefaultHostWalletId')?.value ?? '';
    const coreTrustologyNetworkFeeEstimationVaultAccountId = this.form.get('trustologyNetworkFeeEstimationVaultAccountId')?.value ?? '';
    const coreTrustologyNetworkFeeEstimationVaultAccountIdSubwallet = this.form.get('trustologyNetworkFeeEstimationVaultAccountIdSubwallet')?.value ?? '';
    const coreTrustologyTrackWithdrawals = this.form.get('trustologyTrackWithdrawals')?.value ?? false;
    const coreTrustologyTrackWithdrawalsOneByOne = this.form.get('trustologyTrackWithdrawalsOneByOne')?.value ?? false;
    const coreTrustologyWithdrawalFromCustodyProviderDestinationAddress = this.form.get('trustologyWithdrawalFromCustodyProviderDestinationAddress')?.value ?? '';
    const coreTrustologyWithdrawalFromLiquidityProviderDestinationAddress = this.form.get('trustologyWithdrawalFromLiquidityProviderDestinationAddress')?.value ?? '';
    const coreTrustologyWithdrawalToEndUserSourceVaultAccountId = this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountId')?.value ?? '';
    const coreTrustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet = this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet')?.value ?? '';
    const coreTrustologyWithdrawalToEndUserSpeed = this.form.get('trustologyWithdrawalToEndUserSpeed')?.value ?? '';
    // KYC - SumSub
    const coreSumSubWebApiTokenLifetime = parseInt(this.form.get('kycSumSubWebApiTokenLifetime')?.value ?? '600000');
    // Risk Center
    const coreRiskCenterLoginCountToCompareIpAddress = parseInt(this.form.get('riskCenterLoginCountToCompareIpAddress')?.value ?? '600000');
    const coreRiskCenterMaxFailedLoginAttempts = parseInt(this.form.get('riskCenterMaxFailedLoginAttempts')?.value ?? '600000');
    const coreRiskCenterHighRiskUserYears = parseInt(this.form.get('riskCenterHighRiskUserYears')?.value ?? '70');
    const coreRiskCenterDepositPercentUp = parseInt(this.form.get('riskCenterDepositPercentUp')?.value ?? '200');
    // Transactions
    const coreTransactionsPaymentCodeNumberLength = parseInt(this.form.get('transactionsPaymentCodeNumberLength')?.value ?? '5');
    const coreTransactionsQuickCheckoutTransactionConfirmationLifetime = parseInt(this.form.get('transactionsQuickCheckoutTransactionConfirmationLifetime')?.value ?? '72000000');
    const coreTransactionsTransactionCodeNumberLength = parseInt(this.form.get('transactionsTransactionCodeNumberLength')?.value ?? '5');
    const coreTransactionsTransactionConfirmationMode = this.form.get('transactionsTransactionConfirmationMode')?.value ?? TransactionConfirmationMode.Never;
    // Liquidity Providers
    const coreLiquidityBenchmarkTrackingInterval = parseInt(this.form.get('liquidityBenchmarkTrackingInterval')?.value ?? '60000');
    const coreLiquidityCryptoRateLifetime = parseInt(this.form.get('liquidityCryptoRateLifetime')?.value ?? '60000');
    const coreLiquidityExchangeInfoLifetime = parseInt(this.form.get('liquidityExchangeInfoLifetime')?.value ?? '3600000');
    const coreLiquidityExchangeOrdersTrackingTimedeltaDays = parseInt(this.form.get('liquidityExchangeOrdersTrackingTimedeltaDays')?.value ?? '7');
    const coreLiquidityExchangeTrackingInterval = parseInt(this.form.get('liquidityExchangeTrackingInterval')?.value ?? '60000');
    const coreLiquiditySettingsCurrencyLifetime = parseInt(this.form.get('liquiditySettingsCurrencyLifetime')?.value ?? '600000');
    const coreLiquidityTransferOrdersTrackingTimedeltaDays = parseInt(this.form.get('liquidityTransferOrdersTrackingTimedeltaDays')?.value ?? '7');
    // Liquidity Providers - Bitstamp
    const coreBitstampRateLimit = this.form.get('bitstampRateLimit')?.value ?? false;
    const coreBitstampTimeout = parseInt(this.form.get('bitstampTimeout')?.value ?? '5000');
    const coreBitstampTrackOrders = this.form.get('bitstampTrackOrders')?.value ?? false;
    const coreBitstampTrackWithdrawals = this.form.get('bitstampTrackWithdrawals')?.value ?? false;
    const coreBitstampWithdrawalBenchmark = parseInt(this.form.get('bitstampWithdrawalBenchmark')?.value ?? '10000');
    const coreBitstampWithdrawalBenchmarkAmountToRemain = parseInt(this.form.get('bitstampWithdrawalBenchmarkAmountToRemain')?.value ?? '0');
    // Liquidity Providers - Kraken
    const coreKrakenTrackOrders = this.form.get('krakenTrackOrders')?.value ?? false;
    const coreKrakenTrackWithdrawals = this.form.get('krakenTrackWithdrawals')?.value ?? false;
    const coreKrakenWithdrawalBenchmark = parseInt(this.form.get('krakenWithdrawalBenchmark')?.value ?? '10000');
    const coreKrakenWithdrawalBenchmarkAmountToRemain = parseInt(this.form.get('krakenWithdrawalBenchmarkAmountToRemain')?.value ?? '0');

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

    const coreData = {
      banks: {},
      verifyWhenPaid: coreVerifyWhenPaid,
      wireTransferWallet: coreWireTransferWallet,
      wireTransferExchange: coreWireTransferExchange,
      liquidityProviders: {
        benchmarkTrackingInterval: coreLiquidityBenchmarkTrackingInterval,
        cryptoRateLifetime: coreLiquidityCryptoRateLifetime,
        exchangeInfoLifetime: coreLiquidityExchangeInfoLifetime,
        exchangeOrdersTrackingTimedeltaDays: coreLiquidityExchangeOrdersTrackingTimedeltaDays,
        exchangeTrackingInterval: coreLiquidityExchangeTrackingInterval,
        settingsCurrencyLifetime: coreLiquiditySettingsCurrencyLifetime,
        transferOrdersTrackingTimedeltaDays: coreLiquidityTransferOrdersTrackingTimedeltaDays,
        Binance: {},
        Bitstamp: {
          rateLimit: coreBitstampRateLimit,
          timeout: coreBitstampTimeout,
          trackOrders: coreBitstampTrackOrders,
          trackWithdrawals: coreBitstampTrackWithdrawals,
          withdrawalBenchmark: coreBitstampWithdrawalBenchmark,
          withdrawalBenchmarkAmountToRemain: coreBitstampWithdrawalBenchmarkAmountToRemain
        },
        Kraken: {
          trackOrders: coreKrakenTrackOrders,
          trackWithdrawals: coreKrakenTrackWithdrawals,
          withdrawalBenchmark: coreKrakenWithdrawalBenchmark,
          withdrawalBenchmarkAmountToRemain: coreKrakenWithdrawalBenchmarkAmountToRemain
        }
      },
      custodyProviders: {
        transferOrdersTrackingTimedeltaDays: coreTransferOrdersTrackingTimedeltaDays,
        Fireblocks: {
          cachedDepositAddressLifetime: coreFireblocksCachedDepositAddressLifetime,
          cachedExternalWalletLifetime: coreFireblocksCachedExternalWalletLifetime,
          cachedInternalWalletLifetime: coreFireblocksCachedInternalWalletLifetime,
          cachedVaultAccountLifetime: coreFireblocksCachedVaultAccountLifetime,
          defaultUserVaultName: coreFireblocksDefaultUserVaultName,
          trackWithdrawals: coreFireblocksTrackWithdrawals,
          trackWithdrawalsOneByOne: coreFireblocksTrackWithdrawalsOneByOne,
          withdrawalFromCustodyProviderDestinationAddress: coreFireblocksWithdrawalFromCustodyProviderDestinationAddress,
          withdrawalFromLiquidityProviderDestinationAddress: coreFireblocksWithdrawalFromLiquidityProviderDestinationAddress,
          withdrawalToEndUserSourceVaultAccountId: {
            vaultId: coreFireblocksWithdrawalToEndUserSourceVaultAccountId
          },
          withdrawalToEndUserSpeed: coreFireblocksWithdrawalToEndUserSpeed
        },
        Trustology: {
          cachedDepositAddressLifetime: coreTrustologyCachedDepositAddressLifetime,
          cachedExternalWalletLifetime: coreTrustologyCachedExternalWalletLifetime,
          cachedInternalWalletLifetime: coreTrustologyCachedInternalWalletLifetime,
          cachedVaultAccountLifetime: coreTrustologyCachedVaultAccountLifetime,
          defaultUserVaultName: coreTrustologyDefaultUserVaultName,
          defaultHostWalletId: coreTrustologyDefaultHostWalletId,
          networkFeeEstimationVaultAccountId: {
            walletId: coreTrustologyNetworkFeeEstimationVaultAccountId,
            subWalletName: coreTrustologyNetworkFeeEstimationVaultAccountIdSubwallet
          },
          trackWithdrawals: coreTrustologyTrackWithdrawals,
          trackWithdrawalsOneByOne: coreTrustologyTrackWithdrawalsOneByOne,
          withdrawalFromCustodyProviderDestinationAddress: coreTrustologyWithdrawalFromCustodyProviderDestinationAddress,
          withdrawalFromLiquidityProviderDestinationAddress: coreTrustologyWithdrawalFromLiquidityProviderDestinationAddress,
          withdrawalToEndUserSourceVaultAccountId: {
            walletId: coreTrustologyWithdrawalToEndUserSourceVaultAccountId,
            subWalletName: coreTrustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet
          },
          withdrawalToEndUserSpeed: coreTrustologyWithdrawalToEndUserSpeed
        }
      },
      kycProviders: {
        SumSub: {
          webApiTokenLifetime: coreSumSubWebApiTokenLifetime
        }
      },
      transactions: {
        paymentCodeNumberLength: coreTransactionsPaymentCodeNumberLength,
        quickCheckoutTransactionConfirmationLifetime: coreTransactionsQuickCheckoutTransactionConfirmationLifetime,
        transactionCodeNumberLength: coreTransactionsTransactionCodeNumberLength,
        transactionConfirmationMode: coreTransactionsTransactionConfirmationMode
      },
      riskCenter: {
        loginCountToCompareIpAddress: coreRiskCenterLoginCountToCompareIpAddress,
        maxFailedLoginAttempts: coreRiskCenterMaxFailedLoginAttempts,
        highRiskUserYears: coreRiskCenterHighRiskUserYears,
        depositPercentUp: coreRiskCenterDepositPercentUp,
        depositAboveXinYtimeFrameMins: frames
      }
    };
    // Result
    const additionalSettings = {
      auth: authData,
      admin: adminData,
      cryptoWidget: cryptoWidgetData,
      core: coreData
    }
    return {
      settingsCommonId: this.form.get('id')?.value,
      liquidityProvider: this.form.get('liquidityProvider')?.value,
      custodyProvider: this.form.get('custodyProvider')?.value,
      kycProvider: this.form.get('kycProvider')?.value,
      adminEmails: emailList,
      stoppedForServicing: this.form.get('stoppedForServicing')?.value,
      additionalSettings: JSON.stringify(additionalSettings)
    } as SettingsCommon;
  }

  addTagPromise(tagValue: any) {
    return new Promise((resolve, reject) => {
      this.emailLoading = true;
      const exp: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      this.emailLoading = true;
      if (exp.test(tagValue)) {
        resolve(tagValue);
      } else {
        reject('Incorrect email');
      }
    })
  }

  addFireblocksCustodyProviderDestinationAddress(val: { key: string, value: string }): void {
    const data = this.form.controls.fireblocksWithdrawalFromCustodyProviderDestinationAddress?.value;
    if (data) {
      data[val.key] = val.value;
    }
  }

  addFireblocksLiquidityProviderDestinationAddress(val: { key: string, value: string }): void {
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

  onSubmit(content: any): void {
    this.submitted = true;
    const data = this.getDataObject();
    this.saveInProgress = true;
    this.errorMessage = '';
    this.subscriptions.add(
      this.adminService.updateSettingsCommon(data).subscribe(({ data }) => {
        this.saveInProgress = false;
        this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
