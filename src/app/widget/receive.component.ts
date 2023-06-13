import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsCurrencyWithDefaults } from 'model/generated-models';
import { Subscription } from 'rxjs';
import { ErrorService } from 'services/error.service';
import { CurrencyView } from '../model/payment.model';
import { WalletItem } from '../model/wallet.model';
import { CommonDataService } from '../services/common-data.service';

@Component({
	selector: 'app-receive-widget',
	templateUrl: 'receive.component.html',
	styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class ReceiveWidgetComponent implements OnInit, OnDestroy {
  @Input() presetWalletId = '';
  @Input() presetCurrency = '';

  errorMessage = '';
  inProgress = false;
  initState = true;
  stageId = 'order_details';
  title = 'Order details';
  step = 1;
  initMessage = 'Loading...';
  userWallets: WalletItem[] = [];
  cryptoList: CurrencyView[] = [];
  readCommonSettings = false;

  private pSubscriptions: Subscription = new Subscription();

  constructor(
  	private changeDetector: ChangeDetectorRef,
  	private commonService: CommonDataService,
  	private errorHandler: ErrorService,
  	private router: Router) { }

  ngOnInit(): void {
  	this.initMessage = 'Loading...';
  	this.stageId = 'initialization';
  	this.title = 'Initialization';
  	this.loadCurrencyData();
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  handleError(message: string): void {
  	this.errorMessage = message;
  	this.changeDetector.detectChanges();
  }

  progressChanged(visible: boolean): void {
  	this.inProgress = visible;
  	this.changeDetector.detectChanges();
  }

  private loadCurrencyData(): void {
  	this.cryptoList = [];
  	this.inProgress = true;
  	const currencyData = this.commonService.getSettingsCurrency();
  	this.pSubscriptions.add(
  		currencyData.valueChanges.subscribe(({ data }) => {
  			this.inProgress = false;
  			const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
  			if (currencySettings.settingsCurrency) {
  				if (currencySettings.settingsCurrency.count ?? 0 > 0) {
  					this.cryptoList = currencySettings.settingsCurrency.list?.
  						filter(x => x.fiat === false).
  						map((val) => new CurrencyView(val)) as CurrencyView[];
  				}
  			}
  			this.stageId = 'receive_details';
  			this.title = 'Receive details';
  		}, (error) => {
  			this.inProgress = false;
  			if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  				void this.router.navigateByUrl('/');
  			} else {
  				this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currencies');
  			}
  		})
  	);
  }
}
