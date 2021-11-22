import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CurrencyView } from 'src/app/model/payment.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-widget-receive-details',
  templateUrl: 'receive-details.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss'
  ]
})
export class WidgetReceiveDetailsComponent implements OnInit, OnDestroy {
  @Input() wallets: WalletItem[] = [];
  @Input() currencies: CurrencyView[] = [];

  private pSubscriptions: Subscription = new Subscription();

  selectedCurrency: CurrencyView | undefined = undefined;
  selectedWallet: WalletItem | undefined = undefined;
  currencyInit = false;
  walletInit = false;
  qrCode = false;

  walletErrorMessages: { [key: string]: string; } = {
    ['required']: 'Wallet is required'
  };

  dataForm = this.formBuilder.group({
    currency: ['', { validators: [Validators.required], updateOn: 'change' }],
    wallet: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  get currencyField(): AbstractControl | null {
    return this.dataForm.get('currency');
  }

  get walletField(): AbstractControl | null {
    return this.dataForm.get('wallet');
  }

  constructor(
    private clipboard: Clipboard,
    private formBuilder: FormBuilder,
    private auth: AuthService) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.currencyField?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
    this.pSubscriptions.add(this.walletField?.valueChanges.subscribe(val => this.onWalletUpdated(val)));
    const defaultCrypto = this.auth.user?.defaultCryptoCurrency;
    this.currencyField?.setValue(defaultCrypto);
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  private onCurrencyUpdated(symbol: string): void {
    this.currencyInit = true;
    this.qrCode = false;
    this.selectedCurrency = this.currencies.find(x => x.id === symbol);
    if (this.selectedCurrency) {
      //load wallets here
    }
  }

  private onWalletUpdated(address: string): void {
    this.walletInit = true;
    this.selectedWallet = this.wallets.find(x => x.address === address);
    if (this.selectedWallet) {
      this.showQrCode(this.currencyField?.value, this.walletField?.value);
    }
  }

  private showQrCode(currency: any, address: any) {
    this.qrCode = true;
  }

  copyAddress(): void {
    this.clipboard.copy(this.selectedWallet?.address ?? '');
  }
}
