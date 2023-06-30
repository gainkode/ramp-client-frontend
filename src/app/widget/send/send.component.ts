import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionType, Rate, SettingsCurrencyWithDefaults, TransactionSource, TransactionShort } from 'model/generated-models';
import { PaymentCompleteDetails, PaymentErrorDetails, PaymentWidgetType } from 'model/payment-base.model';
import { CheckoutSummary, CurrencyView } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';
import { ExchangeRateService } from 'services/rate.service';
import { WidgetPagerService } from 'services/widget-pager.service';

@Component({
	selector: 'app-send-widget',
	templateUrl: 'send.component.html',
	styleUrls: [],
})
export class SendWidgetComponent implements OnInit, OnDestroy {
  @Input() presetContactId = '';
  @Input() presetWalletId = '';
  @Input() presetCurrency = '';
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  errorMessage = '';
  rateErrorMessage = '';
  inProgress = false;
  initMessage = 'Loading...';
  summary = new CheckoutSummary();
  cryptoList: CurrencyView[] = [];

  private pSubscriptions: Subscription = new Subscription();

  constructor(
  	private changeDetector: ChangeDetectorRef,
  	private exhangeRate: ExchangeRateService,
  	public pager: WidgetPagerService,
  	private router: Router,
  	private authService: AuthService,
  	private commonService: CommonDataService,
  	private dataService: PaymentDataService,
  	private errorHandler: ErrorService) { }

  ngOnInit(): void {
  	this.initMessage = 'Loading...';
  	this.pager.init('initialization', 'Initialization');
  	this.initData();
  	this.loadCurrencyData();
  	this.startExchangeRate();
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  	this.exhangeRate.stop();
  }

  private initData(): void {
  	this.initMessage = 'Loading...';
  	this.summary.agreementChecked = true;
  	this.summary.email = '';
  	this.summary.transactionType = TransactionType.Transfer;
  	this.summary.address = '';
  	this.summary.currencyFrom = this.authService.user?.defaultCryptoCurrency ?? 'BTC';
  	this.summary.currencyTo = this.authService.user?.defaultFiatCurrency ?? 'EUR';
  }

  private startExchangeRate(): void {
  	this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, TransactionType.Sell);
  	this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
  	this.rateErrorMessage = error;
  	if (rate) {
  		this.summary.exchangeRate = rate;
  	}
  }

  resetWizard(): void {
  	this.summary.reset();
  	this.initData();
  	this.pager.init('', '');
  	this.nextStage('send_details', 'Send details', 1);
  }

  handleError(message: string): void {
  	this.errorMessage = message;
  	this.changeDetector.detectChanges();
  }

  handleAuthError(): void {
  	void this.router.navigateByUrl('/');
  }

  progressChanged(visible: boolean): void {
  	this.inProgress = visible;
  	this.changeDetector.detectChanges();
  }

  private nextStage(id: string, name: string, stepId: number): void {
  	setTimeout(() => {
  		this.errorMessage = '';
  		this.pager.nextStage(id, name, stepId, false);
  	}, 50);
  }

  removeStage(stage: string): void {
  	this.pager.removeStage(stage);
  }

  private loadCurrencyData(): void {
  	this.cryptoList = [];
  	this.inProgress = true;
  	const currencyData = this.commonService.getSettingsCurrency().valueChanges.pipe(take(1));
  	this.pSubscriptions.add(
  		currencyData.subscribe(({ data }) => {
  			this.inProgress = false;
  			const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
  			if (currencySettings.settingsCurrency) {
  				if (currencySettings.settingsCurrency.count ?? 0 > 0) {
  					this.cryptoList = currencySettings.settingsCurrency.list?.
  						filter(x => x.fiat === false).
  						map((val) => new CurrencyView(val)) as CurrencyView[];
  				}
  			}
  			this.nextStage('send_details', 'Send details', 1);
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

  // == Order details page ==
  orderDetailsChanged(data: CheckoutSummary): void {
  	this.summary.initialized = true;
  	this.summary.fee = 0;
  	const amountFromTemp = (data.amountFrom) ? data.amountFrom?.toFixed(8) : undefined;
  	const amountFromValue = (amountFromTemp) ? parseFloat(amountFromTemp) : undefined;
  	const amountChanged = (amountFromValue !== this.summary.amountFrom);
  	this.summary.amountFrom = amountFromValue;
  	this.summary.amountFromPrecision = data.amountFromPrecision;
  	this.summary.amountToPrecision = data.amountToPrecision;
  	const currencyFromChanged = (this.summary.currencyFrom !== data.currencyFrom);
  	this.summary.currencyFrom = data.currencyFrom;
  	if (currencyFromChanged || amountChanged) {
  		this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, TransactionType.Sell);
  		this.exhangeRate.update();
  	}
  }

  orderDetailsComplete(data: CheckoutSummary): void {
  	this.summary.amountFrom = data.amountFrom;
  	this.summary.vaultId = data.vaultId;
  	this.summary.address = data.address;
  	this.createTransaction();
  }
  // =======================

  private createTransaction(): void {
  	this.errorMessage = '';
  	this.inProgress = true;
  	const tempStageId = this.pager.swapStage('initialization');
  	this.initMessage = 'Processing...';
  	if (this.summary) {
  		this.pSubscriptions.add(
  			this.dataService.createTransaction(
  				TransactionType.Transfer,
  				TransactionSource.Wallet,
  				this.summary.vaultId,
  				this.summary.currencyFrom,
  				this.summary.currencyFrom,
  				this.summary.amountFrom ?? 0,
  				undefined,
  				'',
  				'',
  				'',
  				this.summary.address,
  				false
  			).subscribe(({ data }) => {
  				const order = data.createTransaction as TransactionShort;
  				this.inProgress = false;
  				if (order.code) {
  					const details = new PaymentCompleteDetails();
  					details.paymentType = PaymentWidgetType.Send;
  					details.amount = parseFloat(this.summary.amountFrom?.toFixed(this.summary.amountFromPrecision) ?? '0');
  					details.currency = this.summary.currencyFrom;
  					this.onComplete.emit(details);
  				} else {
  					this.errorMessage = 'Order code is invalid';
  					this.onError.emit({
  						errorMessage: this.errorMessage,
  						paymentType: PaymentWidgetType.Send
  					} as PaymentErrorDetails);
  				}
  			}, (error) => {
  				this.inProgress = false;
  				this.pager.swapStage(tempStageId);
  				if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
  					this.handleAuthError();
  				} else {
  					this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
  					this.onError.emit({
  						errorMessage: this.errorMessage,
  						paymentType: PaymentWidgetType.Send
  					} as PaymentErrorDetails);
  				}
  			})
  		);
  	}
  }
}
