import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionType, Rate, UserState } from 'model/generated-models';
import { CurrencyView, CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { PaymentDataService } from 'services/payment.service';
import { NUMBER_PATTERN } from 'utils/constants';

@Component({
	selector: 'app-widget-deposit-details',
	templateUrl: 'deposit-details.component.html',
	styleUrls: [
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss',
		'../../../../assets/details.scss'
	]
})
export class WidgetDepositDetailsComponent implements OnInit, OnDestroy {
  @Input() currencies: CurrencyView[] = [];
  @Input() errorMessage = '';
  @Input() set summary(val: CheckoutSummary) {
  	this.defaultSummary = val;
  	if (val.currencyTo !== undefined) {
  		this.currencyTo?.setValue(val.currencyTo);
  		this.currencyFrom?.setValue(val.currencyFrom);
  	}
  	if (val.amountTo !== undefined) {
  		this.amountTo?.setValue(val.amountTo);
  		this.amountFrom?.setValue(val.amountFrom);
  	}
  	if (val.transactionType === TransactionType.Deposit) {
  		this.amountTitle = 'Fiat Received';
  	} else if (val.transactionType === TransactionType.Withdrawal) {
  		this.amountTitle = 'Fiat Sent';
  	}
  }
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private defaultSummary: CheckoutSummary | undefined = undefined;
  private pSubscriptions: Subscription = new Subscription();
  private transactionsTotalEur = 0;
  private currentQuoteEur = 0;

  currentTier = '';
  selectedCurrency: CurrencyView | undefined = undefined;
  currencyInit = false;
  amountTitle = '';
  done = false;
  quoteExceed = false;
  quoteUnlimit = false;

  dataForm = this.formBuilder.group({
  	amountTo: [undefined, { validators: [], updateOn: 'change' }],
  	currencyTo: [undefined, { validators: [], updateOn: 'change' }],
  	currencyFrom: [null, { validators: [], updateOn: 'change' }],
  	amountFrom: [undefined, { validators: [], updateOn: 'change' }],
  });

  amountErrorMessages: { [key: string]: string; } = {
  	['required']: 'Amount is required',
  	['pattern']: 'Amount must be a valid number',
  	['min']: 'Minimal amount'
  };

  get amountTo(): AbstractControl | null {
  	return this.dataForm.get('amountTo');
  }

  get currencyTo(): AbstractControl | null {
  	return this.dataForm.get('currencyTo');
  }

  get amountFrom(): AbstractControl | null {
  	return this.dataForm.get('amountFrom');
  }

  get currencyFrom(): AbstractControl | null {
  	return this.dataForm.get('currencyFrom');
  }

  constructor(
  	private router: Router,
  	private formBuilder: UntypedFormBuilder,
  	private auth: AuthService,
  	private commonService: CommonDataService,
  	private paymentService: PaymentDataService) { }

  ngOnInit(): void {
  	this.pSubscriptions.add(this.currencyTo?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
  	this.pSubscriptions.add(this.amountTo?.valueChanges.subscribe(val => this.loadRates(val)));
  	const defaultFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
  	let currency = defaultFiat;
  	if (this.defaultSummary) {
  		if (this.defaultSummary.currencyTo !== '') {
  			currency = this.defaultSummary.currencyTo;
  		}
  	}
  	if (this.auth.user?.kycTier) {
  		this.currentTier = this.auth.user?.kycTier.name;
  		if(this.auth.user?.kycValid){
  			this.quoteUnlimit = (this.auth.user?.kycTier.amount === null);
  		}
  	}
  	this.currencyTo?.setValue(currency);
  	this.currencyFrom?.setValue(currency);
  	this.currentQuoteEur = this.auth?.user?.kycTier?.amount ?? 0;
  }

  private loadRates(val: number): void {

  	this.amountFrom?.setValue(val);

  	const rateCurrencies = this.currencies.filter(x => x.fiat === true && x.symbol !== 'EUR').map((val) => val.symbol);
  	const rateData = this.paymentService.getRates(rateCurrencies, 'EUR', true);
  	this.pSubscriptions.add(
  		rateData.valueChanges.subscribe(
  			({ data }) => {
  				const rates = data.getRates as Rate[];
  				this.currencies.forEach(c => {
  					if (c.symbol === 'EUR') {
  						c.rateFactor = 1;
  					} else {
  						if (rates) {
  							const rate = rates.find(x => x.currencyTo === c.symbol);
  							if (rate) {
  								c.rateFactor = rate.depositRate;
  							}
  						}
  					}
  				});
  				this.loadTransactionsTotal();
  			}, () => {
  				this.onProgress.emit(false);
  			})
  	);
  }

  showPersonalVerification(): void {
  	void this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
  		window.location.reload();
  	});
  }

  private loadTransactionsTotal(): void {
  	this.transactionsTotalEur = 0;
  	const totalData = this.commonService.getMyTransactionsTotal();
  	this.pSubscriptions.add(
  		totalData.valueChanges.subscribe(({ data }) => {
  			if (data) {
  				const totalState = data.myState as UserState;
  				this.transactionsTotalEur = totalState.totalAmountEur ?? 0;
  			} else {
  				this.transactionsTotalEur = 0;
  			}
  			this.updateQuote();
  			this.onProgress.emit(false);
  		}, () => {
  			this.onProgress.emit(false);
  		})
  	);
  }

  private updateQuote(): void {
  	if (this.currentQuoteEur !== 0) {
  		const c = this.currencies.find(x => x.symbol === this.selectedCurrency?.symbol);

  		if (c) {
  			const quoteLimit = (this.currentQuoteEur - this.transactionsTotalEur) * c.rateFactor;
  			if(quoteLimit <= 0){
  				this.quoteExceed = true;
  			}else if(quoteLimit < this.amountTo?.value){
  				this.quoteExceed = true;
  			}else{
  				this.quoteExceed = false;
  			}
  		}
  	}
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  onSubmit(): void {
  	this.done = true;
  	const data = new CheckoutSummary();
  	data.amountTo = parseFloat(this.amountTo?.value ?? '0');
  	data.currencyTo = this.currencyTo?.value ?? 'EUR';
  	data.amountFrom = parseFloat(this.amountFrom?.value ?? '0');
  	data.currencyFrom = this.currencyFrom?.value ?? 'EUR';
  	this.onComplete.emit(data);
  }

  private onCurrencyUpdated(symbol: string): void {
  	this.currencyInit = true;
  	this.selectedCurrency = this.currencies.find(x => x.symbol === symbol);
  	this.currencyFrom?.setValue(symbol);
  	if (this.amountTo?.value === undefined || this.amountTo?.value === null) {
  		this.amountTo?.setValue(this.selectedCurrency?.minAmount ?? 0);
  	}

  	if (this.amountFrom?.value === undefined || this.amountFrom?.value === null) {
  		this.amountFrom?.setValue(this.selectedCurrency?.minAmount ?? 0);
  	}
  	this.amountErrorMessages['min'] = `Min. amount ${this.selectedCurrency?.minAmount ?? 0} ${this.selectedCurrency?.display}`;
  	const validators = [
  		Validators.required,
  		Validators.pattern(NUMBER_PATTERN),
  		Validators.min(this.selectedCurrency?.minAmount ?? 0),
  	];
  	this.amountTo?.setValidators(validators);
  	this.amountTo?.updateValueAndValidity();

  	this.amountFrom?.setValidators(validators);
  	this.amountFrom?.updateValueAndValidity();
  }
}
