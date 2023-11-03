import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CurrencyView } from 'model/payment.model';
import { CommonDataService } from 'services/common-data.service';
import { WalletItem } from 'model/wallet.model';
import { Subscription } from 'rxjs';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-sell-widget-complete',
	templateUrl: 'sell-widget-complete.component.html',
	styleUrls: [
		'../../../../../assets/text-control.scss',
		'../../../../../assets/profile.scss',
		'../../../../../assets/details.scss'
	]
})
export class WidgetSellCompleteComponent implements OnInit, OnDestroy {
  @Input() address: string = '';
  @Input() amount: number = 0;
	@Input() currency: string | undefined = undefined;
  @Output() onProgress = new EventEmitter<boolean>();
	@Output() onFinish = new EventEmitter();

  private pSubscriptions: Subscription = new Subscription();

  errorMessage = '';
  inProgress = false;
	sellectedCurrency: CurrencyView = undefined;
  wallets: WalletItem[] = [];
  qrCode = '';
  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;

  walletErrorMessages: { [key: string]: string; } = {
  	['required']: 'Wallet is required'
  };

  constructor(
		private commonService: CommonDataService,
  	private clipboard: Clipboard) { }

  ngOnInit(): void {
  	this.showQrCode(this.address);
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  private showQrCode(address: string): void {
  	this.qrCode = address;
		this.loadCurrencies();
  }

	private loadCurrencies(){
		const currencyData = this.commonService.getSettingsCurrency();
  	this.onProgress.emit(true);
  	this.pSubscriptions.add(
  		currencyData.valueChanges.subscribe(
  			({ data }) => {
  				const currencyList = data.getSettingsCurrency.settingsCurrency.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
					this.sellectedCurrency = currencyList.find((x) => x.symbol === this.currency);
					this.onProgress.emit(false);
  			},
  			(error) => {
  				this.onProgress.emit(false);
  			})
  	);
	}
  copyAddress(): void {
  	this.clipboard.copy(this.address ?? '');
  }

	copyAmount(): void {
  	this.clipboard.copy(this.amount.toString() ?? '');
  }
}
