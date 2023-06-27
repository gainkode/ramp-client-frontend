import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetAddressShortListResult } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { WalletItem } from 'model/wallet.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'services/auth.service';
import { EnvService } from 'services/env.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-widget-receive-details',
	templateUrl: 'receive-details.component.html',
	styleUrls: [
		'../../../../assets/payment.scss',
		'../../../../assets/button.scss',
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss',
		'../../../../assets/details.scss'
	]
})
export class WidgetReceiveDetailsComponent implements OnInit, OnDestroy {
  @Input() currencies: CurrencyView[] = [];
  @Input() presetCurrency = '';
  @Input() presetWalletId = '';
  @Output() onProgress = new EventEmitter<boolean>();

  private pSubscriptions: Subscription = new Subscription();

  errorMessage = '';
  inProgress = false;
  selectedCurrency: CurrencyView | undefined = undefined;
  selectedWallet: WalletItem | undefined = undefined;
  wallets: WalletItem[] = [];
  currencyInit = false;
  walletInit = false;
  qrCode = '';
  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;

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
  	private formBuilder: UntypedFormBuilder,
  	private auth: AuthService,
  	private profileService: ProfileDataService,
  	private errorHandler: ErrorService,
  	private router: Router) { }

  ngOnInit(): void {
  	this.pSubscriptions.add(this.currencyField?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
  	this.pSubscriptions.add(this.walletField?.valueChanges.subscribe(val => this.onWalletUpdated(val)));
  	const defaultCrypto = (this.presetCurrency === '') ? this.auth.user?.defaultCryptoCurrency : this.presetCurrency;
  	this.currencyField?.setValue(defaultCrypto);
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  private loadUserWallets(symbol: string): void {
  	this.errorMessage = '';
  	this.inProgress = true;
  	this.onProgress.emit(this.inProgress);
  	this.wallets = [];
  	const walletData = this.profileService.getMyReceiveWallets(symbol);
  	this.pSubscriptions.add(
  		walletData.valueChanges.pipe(take(1)).subscribe(({ data }) => {
  			this.inProgress = false;
  			this.onProgress.emit(this.inProgress);
  			const dataList = data.myReceiveWallets as AssetAddressShortListResult;
  			if (dataList !== null) {
  				const walletCount = dataList?.count ?? 0;
  				if (walletCount > 0) {
  					this.wallets = dataList?.list?.map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
  					this.walletInit = false;
  					if (this.presetWalletId === '') {
  						if (this.wallets.length === 1) {
  							this.walletField?.setValue(this.wallets[0].address);
  						}
  					} else {
  						const w = this.wallets.find(x => x.id === this.presetWalletId);
  						this.walletField?.setValue(w?.address);
  					}
  				} else {
  					this.errorMessage = `No wallets found for ${symbol}`;
  				}
  			}
  		}, (error) => {
  			this.inProgress = false;
  			this.onProgress.emit(this.inProgress);
  			if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  				void this.router.navigateByUrl('/');
  			} else {
  				this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load wallets');
  			}
  		})
  	);
  }

  private onCurrencyUpdated(symbol: string): void {
  	this.currencyInit = true;
  	this.qrCode = '';
  	this.selectedCurrency = this.currencies.find(x => x.symbol === symbol);
  	if (this.selectedCurrency) {
  		this.selectedWallet = undefined;
  		this.walletField?.setValue('');
  		this.loadUserWallets(symbol);
  	}
  }

  private onWalletUpdated(address: string): void {
  	this.walletInit = true;
  	this.selectedWallet = this.wallets.find(x => x.address === address);
  	if (this.selectedWallet) {
  		this.showQrCode(this.currencyField?.value, this.walletField?.value);
  	}
  }

  private showQrCode(currency: any, address: any): void {
  	this.qrCode = address;
  }

  copyAddress(): void {
  	this.clipboard.copy(this.selectedWallet?.address ?? '');
  }
}
