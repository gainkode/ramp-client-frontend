import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, forkJoin, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { LiquidityProviderList } from 'admin/model/lists.model';
import { WidgetItem } from 'admin/model/widget.model';
import { AdminDataService } from 'services/admin-data.service';
import { Countries } from 'model/country-code.model';
import { PaymentInstrument, PaymentProvider, SettingsCurrencyWithDefaults, UserType } from 'model/generated-models';
import { CurrencyView, PaymentInstrumentList, PaymentProviderView, TransactionTypeList, UserTypeList } from 'model/payment.model';
import { UserItem } from 'model/user.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { getCheckedProviderList, getProviderList } from 'utils/utils';
import { MatTableDataSource } from '@angular/material/table';

@Component({
	selector: 'app-admin-widget-details',
	templateUrl: 'widget-details.component.html',
	styleUrls: ['widget-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminWidgetDetailsComponent implements OnInit, OnDestroy {
	widgetDetails!: WidgetItem;
  @Input() permission = 0;
  @Input()
  set widget(widget: WidgetItem | undefined) {
  	if (widget) {
  		this.setFormData(widget);
			this.widgetDetails = widget;
  	}
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  
  displayedColumns: string[] = [
  	'details',
  	'currency',
  	'destination'
  ];

	displayedAmountColumns: string[] = [
  	'details',
  	'currency',
  	'minAmount',
		'maxAmount'
  ];
  submitted = false;
  isLoading = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  currencyOptionsCrypto: CurrencyView[] = [];
	currencyOptions: CurrencyView[] = [];
  currenciesTable: any = [];
	merchantFeeDestinationCurrencies: any = [];
	currencyAmountsTable: any = [];
  currencyOptionsFiat: CurrencyView[] = [];
  paymentProviderOptions: PaymentProviderView[] = [];
  filteredProviders: PaymentProviderView[] = [];
  showPaymentProviders = true;
  countryOptions = Countries;
  instrumentOptions = PaymentInstrumentList;
  liquidityProviderOptions = LiquidityProviderList;
  userTypeOptions = UserTypeList;
  transactionTypeOptions = TransactionTypeList;
  isUsersLoading = false;
  usersSearchInput$ = new Subject<string>();
  usersOptions$: Observable<UserItem[]> = of([]);
  minUsersLengthTerm = 1;
  widgetAdditionalSettings: Record<string, any> = {};
  adminAdditionalSettings: Record<string, any> = {};
  destinationRequired = false;

  form = this.formBuilder.group({
  	id: [null],
  	countries: [[]],
  	currenciesCrypto: [[]],
  	currenciesFiat: [[]],
  	destinationAddress: [''],
  	instruments: [[]],
  	liquidityProvider: ['', { validators: [Validators.required], updateOn: 'change' }],
  	paymentProviders: [[]],
  	transactionTypes: [[]],
  	user: [null, { validators: [Validators.required], updateOn: 'change' }],
  	name: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	description: [''],
  	secret: [''],
  	userType: [UserType.Personal, { validators: [Validators.required], updateOn: 'change' }],
  	allowToPayIfKycFailed: true,
  	newVaultPerTransaction: false,
  	kycBeforePayment: false,
  	disclaimer: false,
  	twoFA: false,
  	showRate: true,
		masked: false,
  	minAmountFrom: [0, { validators: [Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	maxAmountFrom: [0, { validators: [Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	fee: [0, { validators: [Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
		merchantFeeMinAmount: [0, { validators: [Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
		merchantFeePercent: [0, { validators: [Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  });

	private readonly destroy$ = new Subject<void>();
  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private auth: AuthService,
  	private modalService: NgbModal,
  	private commonService: CommonDataService,
  	private adminService: AdminDataService) {

  }

  ngOnInit(): void {
  	this.loadCommonSettings();
  	this.initUserSearch();

		this.form.get('instruments')?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(val => this.filterPaymentProviders(val));

		this.loadPaymentProvidersAndCurrencies();
  }

  ngOnDestroy(): void {
		this.destroy$.next();
  }

  private loadCommonSettings(): void{
  	const settingsCommon = this.auth.getLocalSettingsCommon();

  	if (settingsCommon) {
  		this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
  		this.transactionTypeOptions = this.transactionTypeOptions.filter(item => this.adminAdditionalSettings?.transactionType[item.id] !== false);
  		this.liquidityProviderOptions = this.liquidityProviderOptions.filter(item => this.adminAdditionalSettings?.liquidityProvider[item.id] !== false);
  		this.instrumentOptions = this.instrumentOptions.filter(item => this.adminAdditionalSettings?.paymentMethods[item.id] !== false);
  		this.userTypeOptions = this.userTypeOptions.filter(item => this.adminAdditionalSettings?.userType[item.id] !== false);
  	}
  }
  private initUserSearch(): void {
  	this.usersOptions$ = concat(
  		of([]),
  		this.usersSearchInput$.pipe(
  			filter(res => res !== null && res.length >= this.minUsersLengthTerm),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => this.isUsersLoading = true),
  			switchMap(search => {
  				this.isUsersLoading = false;

  				return this.adminService.findUsers(new Filter({
  					search,
  					accountTypes: [UserType.Merchant]
  				})).pipe(map(result => result.list));
  			})
  		));
  }

  private setFormData(widget: WidgetItem): void {
  	if (widget) {
  		let sellecteduserType = UserType.Personal;

  		if(widget.additionalSettings){
  			this.widgetAdditionalSettings = JSON.parse(widget.additionalSettings);

  			if(this.widgetAdditionalSettings.userType && this.userTypeOptions.some(userType => userType.id === this.widgetAdditionalSettings.userType)){
  				sellecteduserType = this.widgetAdditionalSettings.userType;
  			}
  		}

  		const user$ = widget.userId ?
  			this.getUserFilteredOptions(widget.userId).pipe(take(1),map(users => users.find(u => u.id === widget.userId))) : of(undefined);
  		
  			user$.pipe(takeUntil(this.destroy$)).subscribe(userItem => {
  				this.form.setValue({
  					id: widget.id,
  					countries: widget.countriesCode2?.map(code2 => {
  						return this.countryOptions.find(c => c.code2 === code2);
  					}) ?? [],
  					currenciesCrypto: widget.currenciesCrypto ?? [],
  					currenciesFiat: widget.currenciesFiat ?? [],
  					destinationAddress: widget.destinationAddress ?? '',
  					instruments: widget.instruments ?? [],
  					liquidityProvider: widget.liquidityProvider ?? null,
  					paymentProviders: widget.paymentProviders ?? [],
  					transactionTypes: widget.transactionTypes ?? [],
  					user: userItem ?? null,
  					name: widget.name ?? 'Widget',
  					description: widget.description,
  					secret: widget.secret,
  					allowToPayIfKycFailed: widget.allowToPayIfKycFailed,
  					newVaultPerTransaction: widget.newVaultPerTransaction,
  					userType: sellecteduserType,
  					kycBeforePayment: this.widgetAdditionalSettings?.kycBeforePayment ?? false,
  					showRate: this.widgetAdditionalSettings?.showRate ?? true,
						masked: widget.masked ?? false,
  					twoFA: this.widgetAdditionalSettings?.twoFA ?? false,
  					disclaimer: this.widgetAdditionalSettings?.disclaimer ?? false,
  					minAmountFrom: this.widgetAdditionalSettings?.minAmountFrom ?? 0,
  					maxAmountFrom: this.widgetAdditionalSettings?.maxAmountFrom ?? 0,
  					fee: widget?.fee ?? 0,
						merchantFeePercent: widget.merchantFeePercent ?? 0,
						merchantFeeMinAmount: widget.merchantFeeMinAmount
  				});
  			});
  	}
  }

  private getWidgetItem(): WidgetItem | undefined {
  	const widget = new WidgetItem(null);
  	const formValue = this.form.value;
  	this.destinationRequired = false;

  	widget.id = formValue.id;
  	widget.name = formValue.name;
  	widget.description = formValue.description;
  	widget.userId = formValue.user.id;
  	widget.countriesCode2 = formValue.countries.map(c => c.code2);

  	this.widgetAdditionalSettings.userType = formValue.userType;
  	this.widgetAdditionalSettings.kycBeforePayment = formValue.kycBeforePayment;
  	this.widgetAdditionalSettings.twoFA = formValue.twoFA;
  	this.widgetAdditionalSettings.showRate = formValue.showRate;
  	this.widgetAdditionalSettings.maxAmountFrom = formValue.maxAmountFrom;
  	this.widgetAdditionalSettings.minAmountFrom = formValue.minAmountFrom;
  	this.widgetAdditionalSettings.disclaimer = formValue.disclaimer;
		
		if(this.currencyAmountsTable._data._value && this.currencyAmountsTable._data._value.length > 0){
			this.widgetAdditionalSettings.amounts = [];

			for(const currency of this.currencyAmountsTable._data._value){
				if(currency.currency && (currency.minAmount || currency.maxAmount)){
					this.widgetAdditionalSettings.amounts.push({
						currency: currency.currency,
						minAmount: currency.minAmount,
						maxAmount: currency.maxAmount
					});
				}
			}
		}

  	if(this.currenciesTable._data._value && this.currenciesTable._data._value.length > 0){

  		for(const cryptoCurrency of this.currenciesTable._data._value){
  			if(cryptoCurrency.selected){
  				widget.currenciesCrypto.push(cryptoCurrency.currency);
  				
					if(cryptoCurrency.destination && cryptoCurrency.destination !== ''){
  					this.destinationRequired = true;
  					widget.destinationAddress.push({
  						currency: cryptoCurrency.currency,
  						destination: cryptoCurrency.destination
  					});
  				} else if (this.destinationRequired) {
  					return undefined;
  				}
  			}
  		}
  	}

		if(this.merchantFeeDestinationCurrencies._data._value && this.merchantFeeDestinationCurrencies._data._value.length > 0){
  		for(const cryptoCurrency of this.merchantFeeDestinationCurrencies._data._value){
  			if(cryptoCurrency.selected){
  				if(cryptoCurrency.destination && cryptoCurrency.destination !== ''){
  					widget.merchantFeeDestinationAddress.push({
  						currency: cryptoCurrency.currency,
  						destination: cryptoCurrency.destination
  					});
  				}
  			}
  		}
  	}
    
		widget.additionalSettings = JSON.stringify(this.widgetAdditionalSettings);
  	widget.currenciesFiat = formValue.currenciesFiat;
  	widget.instruments = formValue.instruments;
  	widget.liquidityProvider = formValue.liquidityProvider;
  	widget.paymentProviders = formValue.paymentProviders;
  	widget.transactionTypes = formValue.transactionTypes;
  	widget.secret = formValue.secret;
  	widget.allowToPayIfKycFailed = formValue.allowToPayIfKycFailed;
  	widget.fee = formValue.fee;
		widget.merchantFeeMinAmount = formValue.merchantFeeMinAmount;
		widget.merchantFeePercent = formValue.merchantFeePercent;
  	widget.newVaultPerTransaction = formValue.newVaultPerTransaction;
  	widget.masked = formValue.masked;

  	return widget;
  }

  private loadPaymentProvidersAndCurrencies(): void {
		const providers$ = this.adminService.getProviders()?.valueChanges.pipe(take(1));
		const currencies$ = this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1));

		this.isLoading = true;

		forkJoin([providers$, currencies$])
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res) => {
					const providers = res[0].data.getPaymentProviders as PaymentProvider[];
					const currencySettings = res[1].data.getSettingsCurrency as SettingsCurrencyWithDefaults;
					
					this.paymentProviderOptions = [];
					this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];

					this.filterPaymentProviders(this.form.get('instruments')?.value ?? []);

					if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
						if (currencySettings.settingsCurrency.list && currencySettings.settingsCurrency.list?.length !== 0){
							const currenciesCrypto: CurrencyView[] = [];
							const currenciesFiat: CurrencyView[] = [];
							const formValue = this.form.value;
	
							for(const currency of currencySettings.settingsCurrency.list){
								if(currency.fiat === false){
									const widgetDestination = this.widgetDetails?.destinationAddress?.find(wallet => wallet.currency === currency.symbol);
									const merchantFeeDestination = this.widgetDetails?.merchantFeeDestinationAddress?.find(wallet => wallet.currency === currency.symbol);
									const currencySelectedWithoutDestination = formValue.currenciesCrypto.find(item=> item === currency.symbol);
									
									currenciesCrypto.push(new CurrencyView(currency));
									
									if (widgetDestination) {
										this.currenciesTable.push(
											{ currency: currency.symbol, destination: widgetDestination.destination, selected: true }
										);
									} else if(currencySelectedWithoutDestination) {
										this.currenciesTable.push(
											{ currency: currency.symbol, destination: '', selected: true }
										);
									}
	
									if (merchantFeeDestination) {
										this.merchantFeeDestinationCurrencies.push(
											{ currency: currency.symbol, destination: merchantFeeDestination.destination, selected: true }
										);
									}
								} else if (currency.fiat === true) {
									currenciesFiat.push(new CurrencyView(currency));
								}
	
								const widgetAmount = this.widgetAdditionalSettings?.amounts?.find(item => item.currency === currency.symbol);
								if(widgetAmount){
									this.currencyAmountsTable.push(
										{ currency: currency.symbol, minAmount: widgetAmount.minAmount, maxAmount: widgetAmount.maxAmount }
									);
								}
	
							}
							this.currencyOptionsCrypto = currenciesCrypto;
							this.currencyOptionsFiat = currenciesFiat;
							this.currencyOptions = this.currencyOptions.concat(currenciesCrypto, currenciesFiat);
							this.currenciesTable = new MatTableDataSource(this.currenciesTable);
							this.currencyAmountsTable = new MatTableDataSource(this.currencyAmountsTable);
							this.merchantFeeDestinationCurrencies = new MatTableDataSource(this.merchantFeeDestinationCurrencies);
						}
					} else {
						this.currencyAmountsTable = [];
						this.currenciesTable = [];
						this.currencyOptionsCrypto = [];
						this.currencyOptionsFiat = [];
					}
					this.isLoading = false;
				},
				error: (error) => {
					this.errorMessage = error;
					this.isLoading = false;
				},
			}
		);
  }

  private getUserFilteredOptions(search: string): Observable<UserItem[]> {
		return search ? 
			this.adminService.findUsers(new Filter({ search, accountTypes: [UserType.Merchant] })).pipe(map(result => result.list)) 
			: of([]);
  }

  private filterPaymentProviders(instruments: PaymentInstrument[]): void {
  	this.filteredProviders = getProviderList(instruments, this.paymentProviderOptions);
  	this.showPaymentProviders = this.filteredProviders.length > 0;

  	if (this.paymentProviderOptions.length > 0) {
  		this.form.get('paymentProviders')?.setValue(getCheckedProviderList(
  			this.form.get('paymentProviders')?.value ?? [],
  			this.filteredProviders));
  	}
  }

  getCountryFlag(code: string): string {
  	return `${code.toLowerCase()}.svg`;
  }

  onSubmit(): void {
  	this.submitted = true;

  	if (this.form.valid) {
  		this.onSave();
  	}
  }

  onDeleteWidget(content: any): void {
  	const dialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  	
		dialog.closed
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.deleteWidget(this.form.value.id));
  }

  addWidgetDestinationAddress(): void{
  	this.currenciesTable._data._value.push({ currency: '', destination: '', selected: true });
  	this.currenciesTable = new MatTableDataSource(this.currenciesTable._data._value);
  }

  delWidgetDestinationAddress(element: any): void{
  	const currenciesTableDel: Record<string, any>[] = [];

  	for(const item of this.currenciesTable._data._value){
  		if(item.currency !== element.currency){
  			currenciesTableDel.push(item);
  		}
  	}

  	this.currenciesTable = new MatTableDataSource(currenciesTableDel);
  }

	addMerchantFeeDestinationAddress(): void{
  	this.merchantFeeDestinationCurrencies._data._value.push({ currency: '', destination: '', selected: true });
  	this.merchantFeeDestinationCurrencies = new MatTableDataSource(this.merchantFeeDestinationCurrencies._data._value);
  }

  delMerchantFeeDestinationAddress(element: any): void{
  	const merchantFeeDestinationCurrenciesDel: Record<string, any>[] = [];

  	for(const item of this.merchantFeeDestinationCurrencies._data._value){
  		if(item.currency !== element.currency){
  			merchantFeeDestinationCurrenciesDel.push(item);
  		}
  	}

  	this.merchantFeeDestinationCurrencies = new MatTableDataSource(merchantFeeDestinationCurrenciesDel);
  }

  private onSave(): void {
  	this.saveInProgress = true;
  	const widgetItem = this.getWidgetItem();

  	if (widgetItem) {
			this.adminService.saveWidget(widgetItem)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: () => {
						this.saveInProgress = false;
						this.save.emit();
					},
					error: (error) => {
						this.saveInProgress = false;
						this.errorMessage = error;
						if (this.auth.token === '') {
							void this.router.navigateByUrl('/');
						}
					} 
				});
  	} else {
  		this.saveInProgress = false;
  	}
  }

  private deleteWidget(id: string): void {
  	this.deleteInProgress = true;

		this.adminService.deleteWidget(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.deleteInProgress = false;
					this.save.emit();
				},
				error: (error) => {
					this.deleteInProgress = false;
					this.errorMessage = error;
					if (this.auth.token === '') {
						void this.router.navigateByUrl('/');
					}
				} 
			});
  }
}
