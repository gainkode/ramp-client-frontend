import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FiatWalletItem } from '../../../model/wallet.model';

@Component({
  selector: 'app-fiat-wallet-details',
  templateUrl: 'fiat-wallet-details.component.html',
  styleUrls: ['fiat-wallet-details.component.scss']
})
export class FiatWalletDetailsComponent {
  @Input() permission = 0;
  @Input() set wallet(val: FiatWalletItem | undefined) {
    this.setFormData(val);
  }
  @Output() cancel = new EventEmitter();

  settingsId = '';
  userId = '';
  walletData: FiatWalletItem | undefined = undefined;
  loadingData = false;
  errorMessage = '';

  constructor() {
  }

  setFormData(data: FiatWalletItem | undefined): void {
    this.errorMessage = '';
    if (data) {
      this.loadingData = true;
      this.walletData = data;
      this.userId = data.userId ?? '';
      this.settingsId = data.id ?? '';
      this.loadingData = false;
    } else {
      this.walletData = undefined;
      this.userId = '';
      this.settingsId = '';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
