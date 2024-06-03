import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { PaymentInstrument, PaymentProvider, Rate, SettingsCurrencyWithDefaults, TransactionInput, TransactionSimulatorResult, TransactionSource, TransactionType } from 'model/generated-models';
import { CurrencyView, PaymentInstrumentList, PaymentProviderView, TransactionSourceList, TransactionTypeList } from 'model/payment.model';
import { EMPTY, Observable, Subject, Subscription, debounceTime, distinctUntilChanged, filter, finalize, map, of, switchMap, take } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { CommonDataService } from 'services/common-data.service';
import { EnvService } from 'services/env.service';
import { PaymentDataService } from 'services/payment.service';
import { NUMBER_PATTERN } from 'utils/constants';
import { getProviderList } from 'utils/utils';

const requiredTransactionTypes = [
	TransactionType.Buy,
	TransactionType.Sell,
	// TransactionType.Deposit,
	// TransactionType.Withdrawal,
];

@Component({
  selector: 'app-transaction-simulation',
  templateUrl: './transaction-simulation.component.html',
  styleUrls: ['./transaction-simulation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionSimulationComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  transactionTypes = TransactionTypeList.filter((item) => requiredTransactionTypes.includes(item.id));
  instrumentTypes = PaymentInstrumentList;
  isProgress = false;
  transactionSources = TransactionSourceList;
  transactionType: TransactionType = TransactionType.System;
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];
  currentRate = 0;
  amountToSpendTitle = `Amount To ${TransactionType.Buy}`;
  currencyOptions: CurrencyView[] = [];
  usersOptions$: Observable<CommonTargetValue[]> = of([]);
  usersSearchInput$ = new Subject<string>();
  isUsersLoading = false;
  minUsersLengthTerm = 1;
  pSpendAutoUpdated = false;
  pReceiveAutoUpdated = false;
  pAmountToSpend = 0;
  pAmountToReceive = 0;
  filteredProviders: PaymentProviderView[] = [];
  providers: PaymentProviderView[] = [];
  form = this.fb.group({
	type: this.fb.control<TransactionType>(TransactionType.Buy, Validators.required),
	source: this.fb.control<TransactionSource>(TransactionSource.Wallet, Validators.required),
	currencyToSpend: this.fb.control<string>(undefined, Validators.required),
	currencyToReceive: this.fb.control<string>(undefined, Validators.required),
	amountToSpend: this.fb.control<number>(undefined, [Validators.required, Validators.pattern(NUMBER_PATTERN)]),
	amountToReceive: this.fb.control<number>(undefined, [Validators.required, Validators.pattern(NUMBER_PATTERN)]),
	rate: this.fb.control<number>(undefined, [Validators.required, Validators.pattern(NUMBER_PATTERN)]),
	users: this.fb.control<CommonTargetValue>(undefined, Validators.required),
	instrument: this.fb.control<PaymentInstrument>(PaymentInstrument.FiatVault, Validators.required),
	paymentProvider: this.fb.control<string>(undefined),
	widgetUserParamsId: this.fb.control<string>(undefined)
  });
  transactionSimulation$: Observable<TransactionSimulatorResult>;
  widgetOptions$ = this.adminService.getWidgets(0, 200, 'name', false, <Filter>{}).pipe(
		map(result => result.list.map(widget => ({
			id: widget.id,
			title: widget.name
		} as CommonTargetValue))));
	
  get transactionTypeField(): AbstractControl {
  	return this.form.controls.type;
  }
  get rateField(): AbstractControl {
  	return  this.form.controls.rate;
  }
  get amountToSpendField(): AbstractControl {
  	return this.form.controls.amountToSpend;
  }
  get amountToReceiveField(): AbstractControl {
  	return this.form.controls.amountToReceive;
  }
  get instrumentTypeField(): AbstractControl {
  	return  this.form.controls.instrument;
  }

  getAmountToSpendMessage(): string {
    if (this.amountToSpendField.hasError('required')) {
      return `${this.amountToSpendTitle} is required`;
    }

    return this.amountToSpendField.hasError('pattern') ? ' Incorrect number value' : '';
  }

  getAmountToRecievedMessage(): string {
    if (this.amountToReceiveField.hasError('required')) {
      return `Field is required`;
    }
    return this.amountToReceiveField.hasError('pattern') ? ' Incorrect number value' : '';
  }

  getRateMessage(): string {
    if (this.rateField.hasError('required')) {
      return `Rate is required`;
    }
    return this.rateField.hasError('pattern') ? ' Incorrect number value' : '';
  }

  showSetCurrentRate = EnvService.create_transaction_update_rate;

  constructor(
  	private fb: FormBuilder,
  	private cdr: ChangeDetectorRef,
	private readonly paymentDataService: PaymentDataService,
  	private commonService: CommonDataService,
  	private adminService: AdminDataService) { }

  ngOnInit(): void {
  	this.loadCurrencies();
  	this.usersSearch();
  	this.getPaymentProviders();

	this.subscriptions.add(
		this.form.controls.source.valueChanges
			.subscribe(source => {
				const widgetIdControl = this.form.controls.widgetUserParamsId;

				if (source === TransactionSource.QuickCheckout || source === TransactionSource.Widget) {
					widgetIdControl.setValidators(Validators.required);
				} else {
					widgetIdControl.clearValidators();
					widgetIdControl.patchValue(null);
				}

				widgetIdControl.updateValueAndValidity();
			})
	);

  	this.subscriptions.add(this.transactionTypeField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onTransactionTypeUpdate(val)));

  	this.subscriptions.add(this.amountToSpendField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onAmountToSpendUpdate(val)));

  	this.subscriptions.add(this.rateField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onAmountToSpendUpdate(val)));

  	this.subscriptions.add(this.amountToReceiveField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onAmountToReceiveUpdate(val)));
      
  	this.subscriptions.add(this.instrumentTypeField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe(val => this.onFilterPaymentProviders(val)));
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private getPaymentProviders(): void {	
  	this.subscriptions.add(
		this.adminService.getProviders()?.valueChanges.subscribe(({ data }) => {
  			const providers = data.getPaymentProviders as PaymentProvider[];
  			this.providers = providers?.map((val) => new PaymentProviderView(val));
  			this.onFilterPaymentProviders(this.instrumentTypeField.value);
  		})
  	);
  }

  private loadCurrencies(): void {
  	this.subscriptions.add(
  		this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe({
  			next: ({ data }) =>  {
  				const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
  				this.currencyOptions = currencySettings.settingsCurrency?.list?.map((val) => new CurrencyView(val)) || [];
				this.transactionTypeField.patchValue(TransactionType.Buy);
  			}
  		})
  	);
  }
  
  private onFilterPaymentProviders(instrument: PaymentInstrument): void {
  	if (instrument?.length > 0) {
  		this.filteredProviders = getProviderList([instrument], this.providers);

		this.form.controls.paymentProvider.patchValue(
			this.filteredProviders.length > 0
  				? this.filteredProviders[0].id
  				: null
  		);
  	} else {
		this.instrumentTypeField.patchValue(undefined);
		this.form.controls.paymentProvider.patchValue(undefined);
  	}
  }

  private onTransactionTypeUpdate(transactionType: TransactionType): void {
  	this.transactionType = transactionType;

  	if (transactionType === TransactionType.Buy || transactionType === TransactionType.Sell) {
  		this.onCurrenciesUpdate(transactionType);
  		this.setAmountToSpend(this.pAmountToSpend);
  	} else {
  		this.filteredProviders = this.filteredProviders.filter(item => item.id === 'FiatVault');
  		this.currenciesToSpend = this.currencyOptions.filter(item => item.fiat === true);
  	}

  	this.amountToSpendTitle = `Amount To ${transactionType}`;
  }

  private onCurrenciesUpdate(type: TransactionType): void {
  	if (type === TransactionType.Buy) {
  		this.currenciesToReceive = this.currencyOptions.filter(item => !item.fiat);
  		this.currenciesToSpend = this.currencyOptions.filter(item => item.fiat);
	  } else if (type === TransactionType.Sell) {
  		this.currenciesToReceive = this.currencyOptions.filter(item => item.fiat);
  		this.currenciesToSpend = this.currencyOptions.filter(item => !item.fiat);
  	}

	this.form.controls.currencyToSpend.patchValue(this.currenciesToSpend[0]?.symbol);
	this.form.controls.currencyToReceive.patchValue(this.currenciesToReceive[0]?.symbol);
  }

  private setAmountToSpend(newAmount: number): void {
  	let receiveAmount = 0;
  	const rate = this.rateField?.value;
  	const amount = this.amountToSpendField?.value;

  	if (rate && amount) {
  		if (this.transactionTypeField?.value === TransactionType.Buy) {
  			receiveAmount = amount / rate;
  		} else if (this.transactionTypeField?.value === TransactionType.Sell) {
  			receiveAmount = amount * rate;
  		}
  	}

  	this.pReceiveAutoUpdated = true;
  	this.pAmountToSpend = newAmount;
  	this.amountToReceiveField?.patchValue(receiveAmount);
  }

  private onAmountToSpendUpdate(val: number): void {
  	if (!this.pSpendAutoUpdated && this.pAmountToSpend !== val) {
  		this.setAmountToSpend(val);
  	}

  	this.pSpendAutoUpdated = false;
  }

  private onAmountToReceiveUpdate(val: number): void {
  	if (!this.pReceiveAutoUpdated && this.pAmountToReceive !== val) {
  		let receiveAmount = 0;
  		const rate = this.rateField?.value;
  		const amount = this.amountToReceiveField?.value;
      
  		if (rate && amount) {
  			if (this.transactionTypeField?.value === TransactionType.Buy) {
  				receiveAmount = amount * rate;
  			} else if (this.transactionTypeField?.value === TransactionType.Sell) {
  				receiveAmount = amount / rate;
  			}
  		}

  		this.pSpendAutoUpdated = true;
  		this.pAmountToReceive = val;
  		this.amountToSpendField?.patchValue(receiveAmount);
  	}

  	this.pReceiveAutoUpdated = false;
  }

  private usersSearch(): void {
	this.usersOptions$ = this.form.controls.users.valueChanges.pipe(
		distinctUntilChanged(),
		filter(value => {
			const name = typeof value === 'string' ? value : value?.title;
			return name.length >= this.minUsersLengthTerm;
		}),
		debounceTime(300),
		switchMap(search => {
			if (typeof search !== 'string') {
				return EMPTY;
			}
			
			this.isUsersLoading = false;

			return this.adminService.getUsers([], 0, 100, 'email', false, new Filter({ search })).pipe(
				map(result => result.list.map(x => ({
				  id: x.id,
				  title: x.fullName ? `${x.fullName} (${x.email})` : x.email
				}) as CommonTargetValue)),
				finalize(() => this.isUsersLoading = false)
			);
		})
	);
  }

  displayUserTitleFn(user: CommonTargetValue): string {
    return user?.title;
  }

  getTransactionToCreate(): TransactionInput{
	const formValue = this.form.value;

	const amountToSpend = parseFloat(formValue.amountToSpend.toString());

	if (isNaN(amountToSpend)) {
	  formValue.amountToSpend = 0;
	}

  	return <TransactionInput>{
		...formValue,
		amountToSpend: isNaN(amountToSpend) ? 0 : amountToSpend,
	};
  }

  updateRate(): void {	
	let currencyFrom;
	let currencyTo;
	
	if (this.transactionTypeField.value === TransactionType.Buy) {
		currencyFrom = this.form.controls.currencyToReceive.value;
		currencyTo = this.form.controls.currencyToSpend.value;
	}
	
	this.isProgress = true;
	this.paymentDataService.getRates([currencyFrom], currencyTo)
		.valueChanges
		.subscribe({
			next: ({ data }) =>  {
				const rates = data.getRates as Rate[];
				if (rates.length > 0) {
					this.currentRate = rates[0].depositRate;
					if (this.currentRate) {
						this.rateField.patchValue(this.currentRate);
					}
				}

				this.isProgress = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.isProgress = false;
				this.cdr.markForCheck();
			}
		});
  }

  onSubmit(): void {
	this.isProgress = true;

	this.transactionSimulation$ = 
		this.adminService.simulateTransaction(
		 this.getTransactionToCreate(), 
		 this.form.controls.users.value.id, 
		 parseFloat(this.rateField?.value),
		 this.form.controls.widgetUserParamsId.value 
	 ) .pipe(finalize(() => {
		 this.isProgress = false;
		 this.cdr.markForCheck();
	 }));
  }
}