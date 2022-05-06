import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FiatWalletItem } from 'src/app/admin_old/model/wallet.model';

@Component({
  selector: 'app-admin-fiat-wallet-details',
  templateUrl: 'fiat-wallet-details.component.html',
  styleUrls: ['fiat-wallet-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminFiatWalletDetailsComponent {
  @Input() permission = 0;
  @Input() set wallet(val: FiatWalletItem | undefined) {
    this.setFormData(val);
  }
  @Output() close = new EventEmitter();

  settingsId = '';
  userId = '';
  walletData: FiatWalletItem | undefined = undefined;

  constructor() { }

  private setFormData(data: FiatWalletItem | undefined): void {
    if (data) {
      this.walletData = data;
      this.userId = data.userId ?? '';
      this.settingsId = data.id ?? '';
    } else {
      this.walletData = undefined;
      this.userId = '';
      this.settingsId = '';
    }
  }
}
