import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { CustodyProviderList, KycProviderList } from 'src/app/model/payment.model';
import { LiquidityProviderList } from '../../model/lists.model';
import { SettingsCommon } from 'src/app/model/generated-models';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';

@Component({
  templateUrl: 'common-settings.component.html',
  styleUrls: ['common-settings.component.scss']
})
export class CommonSettingsEditorComponent implements OnInit, OnDestroy {
  @ViewChild('emailSearchInput') emailSearchInput!: ElementRef<HTMLInputElement>;

  kycProviderOptions = KycProviderList;
  custodyProviderOptions = CustodyProviderList;
  liquidityProviderOptions = LiquidityProviderList;

  form = this.formBuilder.group({
    id: [null],
    liquidityProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    custodyProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    kycProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    adminEmails: [[]],
    stoppedForServicing: [false, { validators: [Validators.required], updateOn: 'change' }],

    // Auth
    emailCodeNumberLength: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Custody providers
    transferOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Custody providers - Fireblocks
    fireblocksCachedDepositAddressLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksCachedExternalWalletLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksCachedInternalWalletLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksCachedVaultAccountLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksDefaultUserVaultName: [''],
    fireblocksTrackWithdrawals: [false],
    fireblocksWithdrawalFromLiquidityProviderDestinationAddress: [''],
    fireblocksWithdrawalToEndUserSourceVaultAccountId: [''],
    fireblocksWithdrawalToEndUserSpeed: ['', { validators: [Validators.required], updateOn: 'change' }],
    // Custody providers - Trustology
    trustologyCachedDepositAddressLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    trustologyCachedExternalWalletLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    trustologyCachedInternalWalletLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    trustologyCachedVaultAccountLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    trustologyDefaultHostWalletId: [''],
    trustologyNetworkFeeEstimationVaultAccountId: [''],
    trustologyNetworkFeeEstimationVaultAccountIdSubwallet: [''],
    trustologyTrackWithdrawals: [false],
    trustologyWithdrawalFromLiquidityProviderDestinationAddress: [''],
    trustologyWithdrawalToEndUserSourceVaultAccountId: [''],
    trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet: [''],
    trustologyWithdrawalToEndUserSpeed: ['', { validators: [Validators.required], updateOn: 'change' }],
    // KYC providers - Sumsub
    kycSumSubWebApiTokenLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Risk Center
    riskCenterLoginCountToCompareIpAddress: [0, { validators: [Validators.required], updateOn: 'change' }],
    riskCenterMaxFailedLoginAttempts: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Transactions
    transactionsPaymentCodeNumberLength: [0, { validators: [Validators.required], updateOn: 'change' }],
    transactionsQuickCheckoutTransactionConfirmationLifetime: [72000000, { validators: [Validators.required], updateOn: 'change' }],
    transactionsTransactionCodeNumberLength: [0, { validators: [Validators.required], updateOn: 'change' }],
    transactionsTransactionConfirmationMode: ['', { validators: [Validators.required], updateOn: 'change' }],
    // Liquidity Providers
    liquidityBenchmarkTrackingInterval: [0, { validators: [Validators.required], updateOn: 'change' }],
    liquidityCryptoRateLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    liquidityExchangeInfoLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    liquidityExchangeOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required], updateOn: 'change' }],
    liquidityExchangeTrackingInterval: [0, { validators: [Validators.required], updateOn: 'change' }],
    liquiditySettingsCurrencyLifetime: [0, { validators: [Validators.required], updateOn: 'change' }],
    liquidityTransferOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Liquidity Providers - Bitstamp
    bitstampRateLimit: [false, { validators: [Validators.required], updateOn: 'change' }],
    bitstampTimeout: [0, { validators: [Validators.required], updateOn: 'change' }],
    bitstampTrackOrders: [false, { validators: [Validators.required], updateOn: 'change' }],
    bitstampTrackWithdrawals: [false, { validators: [Validators.required], updateOn: 'change' }],
    bitstampWithdrawalBenchmark: [0, { validators: [Validators.required], updateOn: 'change' }],
    bitstampWithdrawalBenchmarkAmountToRemain: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Liquidity Providers - Kraken
    krakenTrackOrders: [false, { validators: [Validators.required], updateOn: 'change' }],
    krakenTrackWithdrawals: [false, { validators: [Validators.required], updateOn: 'change' }],
    krakenWithdrawalBenchmark: [0, { validators: [Validators.required], updateOn: 'change' }],
    krakenWithdrawalBenchmarkAmountToRemain: [0, { validators: [Validators.required], updateOn: 'change' }]
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private adminService: AdminDataService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(): void {
    this.subscriptions.add(
      this.adminService.getSettingsCommon()?.valueChanges.subscribe(settings => {
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
        // Core
        const coreData = additionalSettings.core;
        // Core - Custody providers
        this.form.get('transferOrdersTrackingTimedeltaDays')?.setValue(coreData.custodyProviders.transferOrdersTrackingTimedeltaDays ?? 7);
        // Core - Custody providers - Fireblocks
        this.form.get('fireblocksCachedDepositAddressLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedDepositAddressLifetime ?? 60000);
        this.form.get('fireblocksCachedExternalWalletLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedExternalWalletLifetime ?? 60000);
        this.form.get('fireblocksCachedInternalWalletLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedExternalWalletLifetime ?? 60000);
        this.form.get('fireblocksCachedVaultAccountLifetime')?.setValue(coreData.custodyProviders.Fireblocks.cachedVaultAccountLifetime ?? 60000);
        this.form.get('fireblocksDefaultUserVaultName')?.setValue(coreData.custodyProviders.Fireblocks.defaultUserVaultName ?? '');
        this.form.get('fireblocksTrackWithdrawals')?.setValue(coreData.custodyProviders.Fireblocks.trackWithdrawals ?? false);
        this.form.get('fireblocksWithdrawalFromLiquidityProviderDestinationAddress')?.setValue(coreData.custodyProviders.Fireblocks.withdrawalFromLiquidityProviderDestinationAddress ?? 'test_withdrawal');
        this.form.get('fireblocksWithdrawalToEndUserSourceVaultAccountId')?.setValue(coreData.custodyProviders.Fireblocks.withdrawalToEndUserSourceVaultAccountId.vaultId ?? '22');
        this.form.get('fireblocksWithdrawalToEndUserSpeed')?.setValue(coreData.custodyProviders.Fireblocks.withdrawalToEndUserSpeed ?? 'MEDIUM');
        // Core - Custody providers - Trustology
        this.form.get('trustologyCachedDepositAddressLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedDepositAddressLifetime ?? 60000);
        this.form.get('trustologyCachedExternalWalletLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedExternalWalletLifetime ?? 60000);
        this.form.get('trustologyCachedInternalWalletLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedInternalWalletLifetime ?? 60000);
        this.form.get('trustologyCachedVaultAccountLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedVaultAccountLifetime ?? 60000);
        this.form.get('trustologyDefaultHostWalletId')?.setValue(coreData.custodyProviders.Trustology.defaultHostWalletId ?? '');
        this.form.get('trustologyNetworkFeeEstimationVaultAccountId')?.setValue(coreData.custodyProviders.Trustology.networkFeeEstimationVaultAccountId.walletId ?? '');
        this.form.get('trustologyNetworkFeeEstimationVaultAccountIdSubwallet')?.setValue(coreData.custodyProviders.Trustology.networkFeeEstimationVaultAccountId.subWalletName ?? 'Bitcoin');
        this.form.get('trustologyTrackWithdrawals')?.setValue(coreData.custodyProviders.Trustology.trackWithdrawals ?? false);
        this.form.get('trustologyWithdrawalFromLiquidityProviderDestinationAddress')?.setValue(coreData.custodyProviders.Trustology.withdrawalFromLiquidityProviderDestinationAddress ?? 'test_withdrawal');
        this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountId')?.setValue(coreData.custodyProviders.Trustology.withdrawalToEndUserSourceVaultAccountId.walletId ?? '');
        this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet')?.setValue(coreData.custodyProviders.Trustology.withdrawalToEndUserSourceVaultAccountId.subWalletName ?? 'Bitcoin');
        this.form.get('trustologyWithdrawalToEndUserSpeed')?.setValue(coreData.custodyProviders.Trustology.withdrawalToEndUserSpeed ?? "MEDIUM");
        // Core - KYC providers - Sumsub
        this.form.get('kycSumSubWebApiTokenLifetime')?.setValue(coreData.kycProviders.SumSub.webApiTokenLifetime ?? 600000);
        // Core - Risk Center
        this.form.get('riskCenterLoginCountToCompareIpAddress')?.setValue(coreData.riskCenter.loginCountToCompareIpAddress ?? 10);
        this.form.get('riskCenterMaxFailedLoginAttempts')?.setValue(coreData.riskCenter.maxFailedLoginAttempts ?? 10);
        // Core - Transactions
        this.form.get('transactionsPaymentCodeNumberLength')?.setValue(coreData.transactions.paymentCodeNumberLength ?? 5);
        this.form.get('transactionsQuickCheckoutTransactionConfirmationLifetime')?.setValue(coreData.transactions.quickCheckoutTransactionConfirmationLifetime ?? 72000000);
        this.form.get('transactionsTransactionCodeNumberLength')?.setValue(coreData.transactions.transactionCodeNumberLength ?? 5);
        this.form.get('transactionsTransactionConfirmationMode')?.setValue(coreData.transactions.transactionConfirmationMode ?? 'NEVER');
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

      })
    );
  }

  handleEmailOptionAdded(event: MatChipInputEvent): void {
    if (event.value) {
      this.form.controls.adminEmails.setValue([...this.form.controls.adminEmails.value, event.value]);
      event.input.value = '';
    }
  }

  removeAdminEmailOption(email: string): void {
    this.form.controls.adminEmails?.setValue(
      this.form.controls.adminEmails?.value.filter(v => v !== email)
    );
  }

  private showSuccessDialog(): void {
    this.dialog.open(CommonDialogBox, {
      width: '350px',
      data: {
        title: '',
        message: 'Common settings have been saved successfully'
      }
    });
  }

  private getDataObject(): SettingsCommon {
    let emailList = this.form.get('adminEmails')?.value as string[];
    if (emailList.length === 0) {
      const val = this.emailSearchInput.nativeElement.value as string;
      if (val && val !== '') {
        this.handleEmailOptionAdded({
          input: this.emailSearchInput.nativeElement,
          value: val
        });
        emailList = this.form.get('adminEmails')?.value as string[];
      }
    }
    // Auth
    const authEmailCodeNumberLength = parseInt(this.form.get('emailCodeNumberLength')?.value ?? '5');
    const authData = {
      emailCodeNumberLength: authEmailCodeNumberLength
    }
    // Core
    const coreTransferOrdersTrackingTimedeltaDays = parseInt(this.form.get('transferOrdersTrackingTimedeltaDays')?.value ?? '7');
    // Fireblocks
    const coreFireblocksCachedDepositAddressLifetime = parseInt(this.form.get('fireblocksCachedDepositAddressLifetime')?.value ?? '60000');
    const coreFireblocksCachedExternalWalletLifetime = parseInt(this.form.get('fireblocksCachedExternalWalletLifetime')?.value ?? '60000');
    const coreFireblocksCachedInternalWalletLifetime = parseInt(this.form.get('fireblocksCachedExternalWalletLifetime')?.value ?? '60000');
    const coreFireblocksCachedVaultAccountLifetime = parseInt(this.form.get('fireblocksCachedVaultAccountLifetime')?.value ?? '60000');
    const coreFireblocksDefaultUserVaultName = this.form.get('fireblocksDefaultUserVaultName')?.value ?? '';
    const coreFireblocksTrackWithdrawals = this.form.get('fireblocksTrackWithdrawals')?.value ?? false;
    const coreFireblocksWithdrawalFromLiquidityProviderDestinationAddress = this.form.get('fireblocksWithdrawalFromLiquidityProviderDestinationAddress')?.value ?? 'test_withdrawal';
    const coreFireblocksWithdrawalToEndUserSourceVaultAccountId = this.form.get('fireblocksWithdrawalToEndUserSourceVaultAccountId')?.value ?? '2';
    const coreFireblocksWithdrawalToEndUserSpeed = this.form.get('fireblocksWithdrawalToEndUserSpeed')?.value ?? 'MEDIUM';
    // Trustology
    const coreTrustologyCachedDepositAddressLifetime = parseInt(this.form.get('trustologyCachedDepositAddressLifetime')?.value ?? '60000');
    const coreTrustologyCachedExternalWalletLifetime = parseInt(this.form.get('trustologyCachedExternalWalletLifetime')?.value ?? '60000');
    const coreTrustologyCachedInternalWalletLifetime = parseInt(this.form.get('trustologyCachedInternalWalletLifetime')?.value ?? '60000');
    const coreTrustologyCachedVaultAccountLifetime = parseInt(this.form.get('trustologyCachedVaultAccountLifetime')?.value ?? '60000');
    const coreTrustologyDefaultHostWalletId = this.form.get('trustologyDefaultHostWalletId')?.value ?? '';
    const coreTrustologyNetworkFeeEstimationVaultAccountId = this.form.get('trustologyNetworkFeeEstimationVaultAccountId')?.value ?? '';
    const coreTrustologyNetworkFeeEstimationVaultAccountIdSubwallet = this.form.get('trustologyNetworkFeeEstimationVaultAccountIdSubwallet')?.value ?? '';
    const coreTrustologyTrackWithdrawals = this.form.get('trustologyTrackWithdrawals')?.value ?? false;
    const coreTrustologyWithdrawalFromLiquidityProviderDestinationAddress = this.form.get('trustologyWithdrawalFromLiquidityProviderDestinationAddress')?.value ?? '';
    const coreTrustologyWithdrawalToEndUserSourceVaultAccountId = this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountId')?.value ?? '';
    const coreTrustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet = this.form.get('trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet')?.value ?? '';
    const coreTrustologyWithdrawalToEndUserSpeed = this.form.get('trustologyWithdrawalToEndUserSpeed')?.value ?? '';
    // KYC - SumSub
    const coreSumSubWebApiTokenLifetime = parseInt(this.form.get('kycSumSubWebApiTokenLifetime')?.value ?? '600000');
    // Risk Center
    const coreRiskCenterLoginCountToCompareIpAddress = parseInt(this.form.get('riskCenterLoginCountToCompareIpAddress')?.value ?? '600000');
    const coreRiskCenterMaxFailedLoginAttempts = parseInt(this.form.get('riskCenterMaxFailedLoginAttempts')?.value ?? '600000');
    // Transactions
    const coreTransactionsPaymentCodeNumberLength = parseInt(this.form.get('transactionsPaymentCodeNumberLength')?.value ?? '5');
    const coreTransactionsQuickCheckoutTransactionConfirmationLifetime = parseInt(this.form.get('transactionsQuickCheckoutTransactionConfirmationLifetime')?.value ?? '72000000');
    const coreTransactionsTransactionCodeNumberLength = parseInt(this.form.get('transactionsTransactionCodeNumberLength')?.value ?? '5');
    const coreTransactionsTransactionConfirmationMode = this.form.get('transactionsTransactionConfirmationMode')?.value ?? 'NEVER';
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

    const coreData = {
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
          defaultHostWalletId: coreTrustologyDefaultHostWalletId,
          networkFeeEstimationVaultAccountId: {
            walletId: coreTrustologyNetworkFeeEstimationVaultAccountId,
            subWalletName: coreTrustologyNetworkFeeEstimationVaultAccountIdSubwallet
          },
          trackWithdrawals: coreTrustologyTrackWithdrawals,
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
        maxFailedLoginAttempts: coreRiskCenterMaxFailedLoginAttempts
      }
    };
    // Result
    const additionalSettings = {
      auth: authData,
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

  onSubmit(): void {
    const data = this.getDataObject();
    this.subscriptions.add(
      this.adminService.updateSettingsCommon(data).subscribe(({ data }) => {
        this.showSuccessDialog();
      })
    );
  }
}
