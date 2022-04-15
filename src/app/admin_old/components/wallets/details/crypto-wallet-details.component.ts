import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AssetAddress } from 'src/app/model/generated-models';
import { WalletItem } from '../../../model/wallet.model';

@Component({
  selector: 'app-crypto-wallet-details',
  templateUrl: 'crypto-wallet-details.component.html',
  styleUrls: ['crypto-wallet-details.component.scss']
})
export class CryptoWalletDetailsComponent {
  @Input() permission = 0;
  @Input() set wallet(val: WalletItem | undefined) {
    this.setFormData(val);
  }
  @Output() save = new EventEmitter<AssetAddress>();
  @Output() delete = new EventEmitter<AssetAddress>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();

  settingsId = '';
  userId = '';
  walletData: WalletItem | undefined = undefined;
  loadingData = false;
  errorMessage = '';

  dataForm = this.formBuilder.group({
    vaultName: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: FormBuilder) {
  }

  setFormData(data: WalletItem | undefined): void {
    this.errorMessage = '';
    this.dataForm.reset();
    if (data) {
      this.loadingData = true;
      this.walletData = data;
      this.dataForm.get('vaultName')?.setValue(data?.vaultName);
      this.userId = data.userId ?? '';
      this.settingsId = data.vaultId ?? '';
      this.loadingData = false;
    } else {
      this.walletData = undefined;
      this.dataForm.get('vaultName')?.setValue('');
      this.userId = '';
      this.settingsId = '';
    }
    this.formChanged.emit(false);
  }

  setWalletData(): AssetAddress {
    const data = {
      userId: this.userId,
      vaultId: this.settingsId,
      vaultName: this.dataForm.get('vaultName')?.value
    } as AssetAddress;
    return data;
  }

  onDeleteWallet(): void {
    this.delete.emit(this.setWalletData());
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.save.emit(this.setWalletData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
