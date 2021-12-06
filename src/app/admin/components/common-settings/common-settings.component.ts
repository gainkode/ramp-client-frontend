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

    emailCodeNumberLength: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Custody providers
    transferOrdersTrackingTimedeltaDays: [0, { validators: [Validators.required], updateOn: 'change' }],
    // Custody providers - Fireblocks
    fireblocksCachedDepositAddressLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksCachedExternalWalletLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksCachedInternalWalletLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksCachedVaultAccountLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksDefaultUserVaultName: ['', { validators: [Validators.required], updateOn: 'change' }],
    fireblocksTrackWithdrawals: [false, { validators: [Validators.required], updateOn: 'change' }],
    fireblocksWithdrawalFromLiquidityProviderDestinationAddress: ['test_withdrawal', { validators: [Validators.required], updateOn: 'change' }],
    fireblocksWithdrawalToEndUserSourceVaultAccountId: ['2', { validators: [Validators.required], updateOn: 'change' }],
    fireblocksWithdrawalToEndUserSpeed: ['MEDIUM', { validators: [Validators.required], updateOn: 'change' }],
    // Custody providers - Trustology

    trustologyCachedDepositAddressLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    trustologyCachedExternalWalletLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    trustologyCachedInternalWalletLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    trustologyCachedVaultAccountLifetime: [60000, { validators: [Validators.required], updateOn: 'change' }],
    trustologyDefaultHostWalletId: ['', { validators: [Validators.required], updateOn: 'change' }],
    trustologyNetworkFeeEstimationVaultAccountId: ['', { validators: [Validators.required], updateOn: 'change' }],
    trustologyNetworkFeeEstimationVaultAccountIdSubwallet: ['', { validators: [Validators.required], updateOn: 'change' }],
    trustologyTrackWithdrawals: [false, { validators: [Validators.required], updateOn: 'change' }],
    trustologyWithdrawalFromLiquidityProviderDestinationAddress: ['', { validators: [Validators.required], updateOn: 'change' }],
    trustologyWithdrawalToEndUserSourceVaultAccountId: ['', { validators: [Validators.required], updateOn: 'change' }],
    trustologyWithdrawalToEndUserSourceVaultAccountIdSubwallet: ['', { validators: [Validators.required], updateOn: 'change' }],
    trustologyWithdrawalToEndUserSpeed: ['MEDIUM', { validators: [Validators.required], updateOn: 'change' }],


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
        this.form.get('trustologyCachedDepositAddressLifetime')?.setValue(coreData.custodyProviders.Trustology.cachedDepositAddressLifetime ?? 50000);
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



        console.log(additionalSettings);
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





    const coreData = {
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
      }
    };
    // Result
    const additionalSettings = {
      auth: authData,
      core: coreData
    }
    console.log(additionalSettings);
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
    console.log(data);
    this.showSuccessDialog();
  }
}
