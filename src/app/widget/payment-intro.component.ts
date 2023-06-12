import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Rate, SettingsCurrencyWithDefaults, TransactionType } from '../model/generated-models';
import { CheckoutSummary, CurrencyView } from '../model/payment.model';
import { CommonDataService } from '../services/common-data.service';
import { ErrorService } from '../services/error.service';
import { ExchangeRateService } from '../services/rate.service';

@Component({
	selector: 'app-payment-intro',
	templateUrl: 'payment-intro.component.html',
	styleUrls: ['../../assets/payment.scss', '../../assets/button.scss']
})
export class PaymentIntroComponent implements OnInit, OnDestroy {
  @Output() onComplete = new EventEmitter<CheckoutSummary>();
  @Output() onError = new EventEmitter<string>();

  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];
  private pSpendChanged = false;
  private pReceiveChanged = false;
  private pSpendAutoUpdated = false;
  private pReceiveAutoUpdated = false;
  private pExchangeRateStarted = false;
  private pDepositRate: number | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  validData = false;
  currentCurrencySpend: CurrencyView | undefined = undefined;
  currentCurrencyReceive: CurrencyView | undefined = undefined;
  spendCurrencyList: CurrencyView[] = [];
  receiveCurrencyList: CurrencyView[] = [];

  amountSpendErrorMessages: { [key: string]: string; } = {
  	['required']: 'Amount is required',
  	['pattern']: 'Amount must be a valid number',
  	['min']: 'Minimal amount'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
  	['required']: 'Amount is required',
  	['pattern']: 'Amount must be a valid number',
  	['min']: 'Minimal amount'
  };

  dataForm = this.formBuilder.group({
  	amountSpend: [undefined, { validators: [], updateOn: 'change' }],
  	currencySpend: [null, { validators: [], updateOn: 'change' }],
  	amountReceive: [undefined, { validators: [], updateOn: 'change' }],
  	currencyReceive: [null, { validators: [], updateOn: 'change' }]
  });

  get amountSpendField(): AbstractControl | null {
  	return this.dataForm.get('amountSpend');
  }

  get currencySpendField(): AbstractControl | null {
  	return this.dataForm.get('currencySpend');
  }

  get amountReceiveField(): AbstractControl | null {
  	return this.dataForm.get('amountReceive');
  }

  get currencyReceiveField(): AbstractControl | null {
  	return this.dataForm.get('currencyReceive');
  }

  constructor(
  	private commonService: CommonDataService,
  	private exchangeRate: ExchangeRateService,
  	private errorHandler: ErrorService,
  	private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
  	this.loadDetailsForm();
  	this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
  	this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));
  	this.pSubscriptions.add(this.amountSpendField?.valueChanges.subscribe(val => this.onAmountSpendUpdated(val)));
  	this.pSubscriptions.add(this.amountReceiveField?.valueChanges.subscribe(val => this.onAmountReceiveUpdated(val)));
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  	this.exchangeRate.stop();
  }

  private startExchangeRate(): void {
  	if (this.pExchangeRateStarted === false) {
  		this.exchangeRate.setCurrency(
  			this.currentCurrencySpend?.symbol ?? '',
  			this.currentCurrencyReceive?.symbol ?? '',
  			TransactionType.Buy);
  		this.exchangeRate.register(this.onExchangeRateUpdated.bind(this));
  	}
  	this.pExchangeRateStarted = true;
  }

  private onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
  	if (error !== '') {
  		this.onError.emit(error);
  	}
  	if (rate) {
  		this.pSpendChanged = true;
  		this.pDepositRate = rate.depositRate;
  		this.updateCurrentAmounts();
  	}
  	if (!this.pDepositRate) {
  		const currentRate = this.exchangeRate.currentRate;
  		if (currentRate) {
  			this.pSpendChanged = true;
  			this.pDepositRate = currentRate.depositRate;
  			this.updateCurrentAmounts();
  		}
  	}
  }

  private loadDetailsForm(): void {
  	const currencyData$ = this.commonService.getSettingsCurrency().valueChanges;
  	if (currencyData$ === null) {
  		this.onError.emit(this.errorHandler.getRejectedCookieMessage());
  	} else {
  		this.pSubscriptions.add(
  			currencyData$.subscribe(
  				({ data }) => {
  					this.loadCurrencyList(data.getSettingsCurrency as SettingsCurrencyWithDefaults);
  				},
  				(error) => {
  					this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load available list of currency types'));
  				})
  		);
  	}
  }

  private loadCurrencyList(currencySettings: SettingsCurrencyWithDefaults) {
  	let itemCount = 0;
  	this.pCurrencies = [];
  	if (currencySettings !== null) {
  		const currencyList = currencySettings.settingsCurrency;
  		let defaultFiatCurrency = currencySettings.defaultFiat ?? '';
  		if (defaultFiatCurrency === '') {
  			defaultFiatCurrency = 'EUR';
  		}
  		let defaultCryptoCurrency = currencySettings.defaultCrypto ?? '';
  		if (defaultCryptoCurrency === '') {
  			defaultCryptoCurrency = 'BTC';
  		}
  		itemCount = currencyList?.count as number;
  		if (itemCount > 0) {
  			const defaultFiat = currencyList?.list?.find(x => x.symbol === defaultFiatCurrency && x.fiat === true);
  			if (!defaultFiat) {
  				defaultFiatCurrency = 'EUR';
  			}
  			this.pCurrencies = currencyList?.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
  			this.setCurrencyValues(
  				defaultFiatCurrency,
  				defaultCryptoCurrency,
  				undefined,
  				undefined);
  		}
  		this.startExchangeRate();
  	}
  }

  private setCurrencyValues(
  	defaultSpendCurrency: string = '',
  	defaultReceiveCurrency: string = '',
  	defaultSpendAmount: number | undefined = undefined,
  	defaultReceiveAmount: number | undefined = undefined): void {
  	this.setCurrencyLists();
  	if (this.spendCurrencyList.length > 0) {
  		if (defaultSpendCurrency === '') {
  			defaultSpendCurrency = this.spendCurrencyList[0].symbol;
  		} else {
  			const presented = this.spendCurrencyList.find(x => x.symbol === defaultSpendCurrency);
  			if (!presented) {
  				defaultSpendCurrency = this.spendCurrencyList[0].symbol;
  			}
  		}
  		this.currencySpendField?.setValue(defaultSpendCurrency);
  		this.pSpendAutoUpdated = true;
  		this.amountSpendField?.setValue(defaultSpendAmount);
  	}
  	if (this.receiveCurrencyList.length > 0) {
  		if (defaultReceiveCurrency === '') {
  			defaultReceiveCurrency = this.receiveCurrencyList[0].symbol;
  		} else {
  			const presented = this.receiveCurrencyList.find(x => x.symbol === defaultReceiveCurrency);
  			if (!presented) {
  				defaultReceiveCurrency = this.receiveCurrencyList[0].symbol;
  			}
  		}
  		this.currencyReceiveField?.setValue(defaultReceiveCurrency);
  		this.pReceiveAutoUpdated = true;
  		this.amountReceiveField?.setValue(defaultReceiveAmount);
  	}
  	if (this.pSpendChanged || this.pReceiveChanged) {
  		this.updateCurrentAmounts();
  	}
  }

  private setCurrencyLists(): void {
  	this.spendCurrencyList = this.pCurrencies.filter(c => c.fiat === true);
  	this.receiveCurrencyList = this.pCurrencies.filter(c => c.fiat === false);
  }

  private setSpendValidators(): void {
  	this.amountSpendErrorMessages['min'] = `Min. amount ${this.currentCurrencySpend?.minAmount} ${this.currentCurrencySpend?.display}`;
  	this.amountSpendField?.setValidators([
  		Validators.required,
  		Validators.pattern(this.pNumberPattern),
  		Validators.min(this.currentCurrencySpend?.minAmount ?? 0),
  	]);
  	this.amountSpendField?.updateValueAndValidity();
  }

  private setReceiveValidators(): void {
  	this.amountReceiveErrorMessages['min'] = `Min. amount ${this.currentCurrencyReceive?.minAmount} ${this.currentCurrencyReceive?.display}`;
  	this.amountReceiveField?.setValidators([
  		Validators.required,
  		Validators.pattern(this.pNumberPattern),
  		Validators.min(this.currentCurrencyReceive?.minAmount ?? 0),
  	]);
  	this.amountReceiveField?.updateValueAndValidity();
  }

  private onCurrencySpendUpdated(currency: string): void {
  	this.currentCurrencySpend = this.pCurrencies.find((x) => x.symbol === currency);
  	if (this.currentCurrencySpend && this.amountSpendField?.value) {
  		this.setSpendValidators();
  	}
  	this.pReceiveChanged = true;
  	this.updateCurrentAmounts();
  	this.exchangeRate.setCurrency(
  		this.currentCurrencySpend?.symbol ?? '',
  		this.currentCurrencyReceive?.symbol ?? '',
  		TransactionType.Buy);
  	this.exchangeRate.update();
  }

  private onCurrencyReceiveUpdated(currency: string): void {
  	this.currentCurrencyReceive = this.pCurrencies.find((x) => x.symbol === currency);
  	if (this.currentCurrencyReceive && this.amountReceiveField?.value) {
  		this.setReceiveValidators();
  	}
  	this.pSpendChanged = true;
  	this.updateCurrentAmounts();
  }

  private onAmountSpendUpdated(val: any) {
  	if (val && !this.pSpendAutoUpdated) {
  		this.pSpendAutoUpdated = false;
  		if (this.hasValidators(this.amountSpendField as AbstractControl) === false && this.currentCurrencySpend) {
  			this.setSpendValidators();
  		}
  		this.pSpendChanged = true;
  		this.updateCurrentAmounts();
  	}
  	this.pSpendAutoUpdated = false;
  }

  private onAmountReceiveUpdated(val: any) {
  	if (val && !this.pReceiveAutoUpdated) {
  		this.pReceiveAutoUpdated = false;
  		if (this.hasValidators(this.amountReceiveField as AbstractControl) === false && this.currentCurrencyReceive) {
  			this.setReceiveValidators();
  		}
  		this.pReceiveChanged = true;
  		this.updateCurrentAmounts();
  	}
  	this.pReceiveAutoUpdated = false;
  }

  private hasValidators(control: AbstractControl) {
  	if (!control) {
  		return false;
  	}
  	if (control.validator) {
  		const validator = control.validator({} as AbstractControl);
  		if (validator && validator.required) {
  			return true;
  		}
  	}
  	return false;
  }

  private updateCurrentAmounts(): void {
  	let spend: number | undefined = undefined;
  	let receive: number | undefined = undefined;
  	if (this.amountSpendField?.value && this.amountSpendField?.valid) {
  		spend = parseFloat(this.amountSpendField?.value);
  	}
  	if (this.amountReceiveField?.value && this.amountReceiveField?.valid) {
  		receive = parseFloat(this.amountReceiveField?.value);
  	}
  	this.updateAmounts(spend, receive);
  }

  private updateAmounts(spend: number | undefined, receive: number | undefined): void {
  	this.validData = false;
  	let dst = 0;
  	if (this.pReceiveChanged) {
  		if (receive && this.pDepositRate) {
  			dst = receive * this.pDepositRate;
  			this.validData = true;
  		}
  		if (this.validData === true) {
  			spend = dst;
  			const val = dst.toFixed(this.currentCurrencySpend?.precision);
  			this.pSpendAutoUpdated = true;
  			this.amountSpendField?.setValue(val);
  		}
  	}
  	if (this.pSpendChanged) {
  		if (spend && this.pDepositRate) {
  			const rate = this.pDepositRate;
  			if (rate === 0) {
  				dst = 0;
  			} else {
  				dst = spend / rate;
  			}
  			this.validData = true;
  		}
  		if (this.validData === true) {
  			receive = dst;
  			const val = dst.toFixed(this.currentCurrencyReceive?.precision);
  			this.pReceiveAutoUpdated = true;
  			this.amountReceiveField?.setValue(val);
  		}
  	}
  	this.pSpendChanged = false;
  	this.pReceiveChanged = false;
  }

  onSubmit(): void {
  	if (this.dataForm.valid) {
  		const data = new CheckoutSummary();
  		data.amountFrom = this.amountSpendField?.value;
  		data.amountTo = this.amountReceiveField?.value;
  		if (this.currencySpendField?.valid) {
  			data.currencyFrom = this.currencySpendField?.value;
  			data.amountFromPrecision = this.currentCurrencySpend?.precision ?? 2;
  		}
  		if (this.currencyReceiveField?.valid) {
  			data.currencyTo = this.currencyReceiveField?.value;
  			data.amountToPrecision = this.currentCurrencyReceive?.precision ?? 2;
  		}
  		this.onComplete.emit(data);
  	}
  }
}
