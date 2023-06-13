import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsCurrencyWithDefaults, WidgetUserParams } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ErrorService } from 'services/error.service';
import { CommonDataService } from '../services/common-data.service';
import { EnvService } from '../services/env.service';

@Component({
	selector: 'app-crypto-widget-wizard',
	templateUrl: 'crypto-wizard.component.html',
	styleUrls: ['../../assets/button.scss', '../../assets/payment.scss', '../../assets/text-control.scss'],
})
export class CryptoWizardComponent implements OnInit, OnDestroy {
	private pSubscriptions: Subscription = new Subscription();
	private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
	private pGuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	errorMessage = '';
	inProgress = false;
	logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
	logoAlt = EnvService.product;
	defaultCrypto = '';
	defaultFiat = '';
	currencyList: CurrencyView[] = [];
	sourceCurrencyList: CurrencyView[] = [];
	currencyConvertList: CurrencyView[] = [];
	selectedCurrencyConvert: CurrencyView | undefined = undefined;
	done = false;
	validData = false;
	widgetLink = '';

	widgetErrorMessages: { [key: string]: string; } = {
		['required']: 'Widget identifier is required to identify your settings',
		['pattern']: 'Identifier must be a valid UUID',
	};
	emailErrorMessages: { [key: string]: string; } = {
		['required']: 'Email is required',
		['pattern']: 'Email is not valid'
	};
	amountErrorMessages: { [key: string]: string; } = {
		['pattern']: 'Amount must be a valid number',
		['min']: 'Minimal amount'
	};

	dataForm = this.formBuilder.group({
		widget: [undefined, {
			validators: [
				Validators.required,
				Validators.pattern(this.pGuidPattern)
			], updateOn: 'change'
		}],
		email: [undefined,
			{
				validators: [
					Validators.required,
					Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
				], updateOn: 'change'
			}
		],
		direction: ['crypto_amount'],
		amount: [undefined, {
			validators: [
				Validators.pattern(this.pNumberPattern)
			], updateOn: 'change'
		}],
		currency: [undefined, { validators: [], updateOn: 'change' }],
		currencyConvert: [undefined, { validators: [], updateOn: 'change' }],
		transactionWebHook: [undefined, { validators: [], updateOn: 'change' }]
	});

	get widgetField(): AbstractControl | null {
		return this.dataForm.get('widget');
	}

	get emailField(): AbstractControl | null {
		return this.dataForm.get('email');
	}

	get directionField(): AbstractControl | null {
		return this.dataForm.get('direction');
	}

	get amountField(): AbstractControl | null {
		return this.dataForm.get('amount');
	}

	get currencyField(): AbstractControl | null {
		return this.dataForm.get('currency');
	}

	get currencyConvertField(): AbstractControl | null {
		return this.dataForm.get('currencyConvert');
	}

	get transactionWebHookField(): AbstractControl | null {
		return this.dataForm.get('transactionWebHook');
	}
  
	constructor(
		public router: Router,
		private formBuilder: UntypedFormBuilder,
		private changeDetector: ChangeDetectorRef,
		private commonService: CommonDataService,
		private errorHandler: ErrorService) { }

	ngOnInit(): void {
		this.pSubscriptions.add(this.currencyConvertField?.valueChanges.subscribe(val => this.onCurrencyFiatUpdated(val)));
		this.pSubscriptions.add(this.currencyField?.valueChanges.subscribe(val => this.onCurrencyCryptoUpdated(val)));
		this.pSubscriptions.add(this.directionField?.valueChanges.subscribe(val => this.onDirectionChanged()));
		this.loadCurrencies();
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

	private onCurrencyFiatUpdated(currency: string): void {
		this.selectedCurrencyConvert = this.currencyConvertList.find(x => x.symbol === currency);
	}

	private onCurrencyCryptoUpdated(currency: string): void {
		const selected = this.sourceCurrencyList.find(x => x.symbol === currency);
		let validators: ValidatorFn[] = [];
		if (selected) {
			this.amountErrorMessages['min'] = `Min. amount ${selected?.minAmount} ${selected?.display}`;
			validators = [
				Validators.pattern(this.pNumberPattern),
				Validators.min(selected?.minAmount ?? 0)
			];
		} else {
			validators = [
				Validators.pattern(this.pNumberPattern)
			];
		}
		this.amountField?.setValidators(validators);
		this.amountField?.updateValueAndValidity();
	}

	onDirectionChanged(): void {
		this.amountField?.setValue(undefined);
		this.currencyField?.setValue(undefined);
		this.loadCurrencyLists();
	}

	private loadCurrencyLists(): void {
		const direction = this.directionField?.value;
		this.sourceCurrencyList = this.currencyList.filter(x => x.fiat === (direction === 'fiat_amount'));
		this.currencyConvertList = this.currencyList.filter(x => x.fiat === (direction === 'crypto_amount'));
		let defaultCurrency = this.defaultFiat;
		if (direction === 'fiat_amount') {
			defaultCurrency = this.defaultCrypto;
		}
		if (this.currencyConvertList.length > 0) {
			if (this.currencyConvertList.find(x => x.symbol === defaultCurrency)) {
				this.currencyConvertField?.setValue(defaultCurrency);
			} else {
				this.currencyConvertField?.setValue(this.currencyConvertList[0].symbol);
			}
		}
		if (this.sourceCurrencyList.length > 0) {
			this.sourceCurrencyList.splice(0, 0, {
				symbol: '',
				name: ''
			} as CurrencyView);
		}
	}

	loadCurrencies(): void {
		this.handleError('');
		this.progressChanged(true);
		const currencyData$ = this.commonService.getSettingsCurrency();
		this.pSubscriptions.add(
			currencyData$.valueChanges.pipe(take(1)).subscribe(({ data }) => {
				this.progressChanged(false);
				const dataList = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
				this.defaultCrypto = dataList.defaultCrypto ?? 'BTC';
				this.defaultFiat = dataList.defaultFiat ?? 'EUR';
				this.currencyList = dataList?.settingsCurrency?.list?.
					map((val) => new CurrencyView(val)) as CurrencyView[];
				this.loadCurrencyLists();
			}, (error) => {
				this.progressChanged(false);
				this.handleError(this.errorHandler.getError(error.message, 'Unable to get currency data'));
			})
		);
	}

	save(): void {
		this.handleError('');
		this.progressChanged(true);
		let wh = undefined;
		let c = undefined;
		let a: number | undefined = undefined;
		if (this.transactionWebHookField?.value &&
      this.transactionWebHookField?.value !== null &&
      this.transactionWebHookField?.value !== '') {
			wh = this.transactionWebHookField?.value;
		}
		if (this.currencyField?.value &&
      this.currencyField?.value !== null &&
      this.currencyField?.value !== '') {
			c = this.currencyField?.value;
		}
		if (this.amountField?.value &&
      this.amountField?.value !== null &&
      this.amountField?.value !== '') {
			a = parseFloat(this.amountField?.value);
		}
		const paramsData = {
			convertedCurrency: (this.selectedCurrencyConvert) ? this.selectedCurrencyConvert.symbol : undefined,
			currency: c,
			amount: a,
			onTransactionStatusChanged: wh
		};
		const transactionData$ = this.commonService.addMyWidgetUserParams(
			this.widgetField?.value,
			this.emailField?.value,
			JSON.stringify(paramsData));
		this.pSubscriptions.add(
			transactionData$.subscribe(
				({ data }) => {
					this.progressChanged(false);
					const p = data.addMyWidgetUserParams as WidgetUserParams;
					this.done = true;
					this.widgetLink = `${EnvService.client_host}/payment/crypto/${p.widgetUserParamsId}`;
				}, (error) => {
					this.progressChanged(false);
					this.handleError(this.errorHandler.getError(error.message, 'Unable to save data'));
				}
			)
		);
	}
}
