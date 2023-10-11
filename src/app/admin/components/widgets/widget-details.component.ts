import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { LiquidityProviderList } from 'admin/model/lists.model';
import { WidgetItem } from 'admin/model/widget.model';
import { AdminDataService } from 'services/admin-data.service';
import { Countries } from 'model/country-code.model';
import { PaymentInstrument, PaymentProvider, SettingsCurrencyWithDefaults, UserType, WidgetDestination } from 'model/generated-models';
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
  @Input() permission = 0;
  @Input()
  set widget(widget: WidgetItem | undefined) {
  	if (widget) {
  		this.setFormData(widget);
  		this.createNew = ((widget?.id ?? '') === '');
  		this.widgetId = widget?.id ?? '';
  		this.widgetLink = widget?.link ?? '';
  		this.widgetMaskLink = widget?.maskLink ?? '';
  	}
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private subscriptions: Subscription = new Subscription();
  
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
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  currencyOptionsCrypto: CurrencyView[] = [];
	currencyOptions: CurrencyView[] = [];
  currenciesTable: any = [];
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
  widgetMaskLink = '';
  widgetLink = '';
  widgetId = '';
  isUsersLoading = false;
  usersSearchInput$ = new Subject<string>();
  usersOptions$: Observable<UserItem[]> = of([]);
  minUsersLengthTerm = 1;
  widgetDestinationAddress: WidgetDestination[] = [];
  widgetAdditionalSettings: Record<string, any> = {};
  selectAll = false;
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
  });

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
  	this.subscriptions.add(
  		this.form.get('instruments')?.valueChanges.subscribe(val => {
  			this.filterPaymentProviders(val);
  		})
  	);
  	this.loadPaymentProviders();
  	this.loadCurrencies();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private loadCommonSettings(): void{
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if(settingsCommon){
  		this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
  		this.transactionTypeOptions = this.transactionTypeOptions.filter(item => this.adminAdditionalSettings.transactionType[item.id] == true);
  		this.liquidityProviderOptions = this.liquidityProviderOptions.filter(item => this.adminAdditionalSettings.liquidityProvider[item.id] == true);
  		this.instrumentOptions = this.instrumentOptions.filter(item => this.adminAdditionalSettings.paymentMethods[item.id] == true);
  		this.userTypeOptions = this.userTypeOptions.filter(item => this.adminAdditionalSettings.userType[item.id] == true);
  	}
  }
  private initUserSearch(): void {
  	this.usersOptions$ = concat(
  		of([]),
  		this.usersSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minUsersLengthTerm;
  			}),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => {
  				this.isUsersLoading = true;
  			}),
  			switchMap(searchString => {
  				this.isUsersLoading = false;
  				return this.adminService.findUsers(new Filter({
  					search: searchString,
  					accountTypes: [UserType.Merchant]
  				})).pipe(map(result => result.list));
  			})
  		));
  }

  private setFormData(widget: WidgetItem): void {
  	if (widget) {
  		let sellecteduserType = UserType.Personal;
  		this.widgetDestinationAddress = widget.destinationAddress;
  		if(widget.additionalSettings){
  			this.widgetAdditionalSettings = JSON.parse(widget.additionalSettings);
  			if(this.widgetAdditionalSettings.userType && this.userTypeOptions.some(userType => userType.id == this.widgetAdditionalSettings.userType)){
  				sellecteduserType = this.widgetAdditionalSettings.userType;
  			}
  		}
      
  		const user$ = widget.userId ?
  			this.getUserFilteredOptions(widget.userId).pipe(take(1), map(users => {
  				return users.find(u => u.id === widget.userId);
  			})) :
  			of(undefined);
  		this.subscriptions.add(
  			user$.subscribe(userItem => {
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
  					fee: widget?.fee ?? 0
  				});
  			})
  		);
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
  				if(cryptoCurrency.destination && cryptoCurrency.destination != ''){
  					this.destinationRequired = true;
  					widget.destinationAddress.push({
  						currency: cryptoCurrency.currency,
  						destination: cryptoCurrency.destination
  					});
  				}else if(this.destinationRequired){
  					return undefined;
  				}
  			}
  		}
  		// widget.currenciesCrypto = formValue.currenciesCrypto;
  	}
    
		widget.additionalSettings = JSON.stringify(this.widgetAdditionalSettings);
  	widget.currenciesFiat = formValue.currenciesFiat;
  	// widget.destinationAddress = formValue.destinationAddress;
  	widget.instruments = formValue.instruments;
  	widget.liquidityProvider = formValue.liquidityProvider;
  	widget.paymentProviders = formValue.paymentProviders;
  	widget.transactionTypes = formValue.transactionTypes;
  	widget.secret = formValue.secret;
  	widget.allowToPayIfKycFailed = formValue.allowToPayIfKycFailed;
  	widget.fee = formValue.fee;
  	widget.newVaultPerTransaction = formValue.newVaultPerTransaction;
  	widget.masked = formValue.masked;
  	// widget.destinationAddress = this.widgetDestinationAddress;

  	return widget;
  }

  private loadPaymentProviders(): void {
  	this.paymentProviderOptions = [];
  	this.subscriptions.add(
  		this.adminService.getProviders()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
  			const providers = data.getPaymentProviders as PaymentProvider[];
  			this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
  			this.filterPaymentProviders(this.form.get('instruments')?.value ?? []);
  		}, (error) => {
  			this.errorMessage = error;
  		})
  	);
  }

  private loadCurrencies(): void {
  	this.subscriptions.add(
  		this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
  			const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
  			if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
  				// this.currencyOptionsFiat = currencySettings.settingsCurrency.list?.
  				//   filter(x => x.fiat === true).
  				//   map((val) => new CurrencyView(val)) as CurrencyView[];

  				if(currencySettings.settingsCurrency.list && currencySettings.settingsCurrency.list?.length != 0){
  					const currenciesCrypto: CurrencyView[] = [];
  					const currenciesFiat: CurrencyView[] = [];
  					const formValue = this.form.value;

  					for(const currency of currencySettings.settingsCurrency.list){
  						if(currency.fiat === false){
  							const widgetDestination = this.widgetDestinationAddress.find(wallet => wallet.currency == currency.symbol);
  							const currencySelectedWithoutDestination = formValue.currenciesCrypto.find(item=> item == currency.symbol);
  							// let currencyTable = this.currenciesTable.find(item => item.currency == currency.symbol);
                
  							currenciesCrypto.push(new CurrencyView(currency));
								
  							if(widgetDestination){
  								this.currenciesTable.push(
  									{ currency: currency.symbol, destination: widgetDestination.destination, selected: true }
  								);
  								// currencyTable.currency = widgetDestination.currency;
  								// currencyTable.selected = true;
  							}else if(currencySelectedWithoutDestination){
  								this.currenciesTable.push(
  									{ currency: currency.symbol, destination: '', selected: true }
  								);
  							}

  							// if(!currencyTable){
  							//   this.currenciesTable.push(
  							//     {currency: currency.symbol, destination: '', selected: false}
  							//   )
  							// }
  						}else if(currency.fiat === true){
  							currenciesFiat.push(new CurrencyView(currency));
  						}

							const widgetAmount = this.widgetAdditionalSettings?.amounts?.find(item => item.currency == currency.symbol);
							if(widgetAmount){
								this.currencyAmountsTable.push(
									{currency: currency.symbol, minAmount: widgetAmount.minAmount, maxAmount: widgetAmount.maxAmount}
								)
							}
  					}
  					this.currencyOptionsCrypto = currenciesCrypto;
  					this.currencyOptionsFiat = currenciesFiat;
						this.currencyOptions = this.currencyOptions.concat(currenciesCrypto, currenciesFiat);
  					this.currenciesTable = new MatTableDataSource(this.currenciesTable);
						this.currencyAmountsTable = new MatTableDataSource(this.currencyAmountsTable);
  				}
  				// this.currencyOptionsCrypto = currencySettings.settingsCurrency.list?.
  				//   filter(x => x.fiat === false).
  				//   map((val) => new CurrencyView(val)) as CurrencyView[];
          
  				// this.currenciesTable = currencySettings.settingsCurrency.list?.
  				//   filter(x => x.fiat === false).
  				//   map((item) => {
  				//     return {currency: item.symbol, destination: '', selected: false}
  				//   })
  			} else {
					this.currencyAmountsTable = [];
  				this.currenciesTable = [];
  				this.currencyOptionsCrypto = [];
  				this.currencyOptionsFiat = [];
  			}
  		}, (error) => {
  			this.errorMessage = error;
  		})
  	);
  }

  private getUserFilteredOptions(searchString: string): Observable<UserItem[]> {
  	if (searchString) {
  		return this.adminService.findUsers(new Filter({ search: searchString })).pipe(
  			map(result => { return result.list; })
  		);
  	} else {
  		return of([]);
  	}
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
  	this.subscriptions.add(
  		dialog.closed.subscribe(data => {
  			this.deleteWidget(this.form.value.id);
  		})
  	);
  }

  addWidgetDestinationAddress(): void{
  	this.currenciesTable._data._value.push({ currency: '', destination: '', selected: true });
  	this.currenciesTable = new MatTableDataSource(this.currenciesTable._data._value);
  }

  delWidgetDestinationAddress(element: any): void{
  	const currenciesTableDel: Record<string, any>[] = [];
  	for(const item of this.currenciesTable._data._value){
  		if(item.currency != element.currency){
  			currenciesTableDel.push(item);
  		}
  	}
  	this.currenciesTable = new MatTableDataSource(currenciesTableDel);
  }

	addWidgetAmounts(): void{
  	this.currencyAmountsTable._data._value.push({ currency: '', minAmount: '', maxAmount: '', selected: true });
  	this.currencyAmountsTable = new MatTableDataSource(this.currencyAmountsTable._data._value);
  }

	delWidgetAmounts(element: any): void{
  	const currencyAmountsTableDel: Record<string, any>[] = [];
  	for(const item of this.currencyAmountsTable._data._value){
  		if(item.currency != element.currency){
  			currencyAmountsTableDel.push(item);
  		}
  	}
  	this.currencyAmountsTable = new MatTableDataSource(currencyAmountsTableDel);
  }

  private onSave(): void {
  	this.saveInProgress = true;
  	const widgetItem = this.getWidgetItem();
  	if(widgetItem){
  		const requestData$ = this.adminService.saveWidget(widgetItem);
  		this.subscriptions.add(
  			requestData$.subscribe(({ data }) => {
  				this.saveInProgress = false;
  				this.save.emit();
  			}, (error) => {
  				this.saveInProgress = false;
  				this.errorMessage = error;
  				if (this.auth.token === '') {
  					void this.router.navigateByUrl('/');
  				}
  			})
  		);
  	}else{
  		this.saveInProgress = false;
  	}
    
  }

  private deleteWidget(id: string): void {
  	this.deleteInProgress = true;
  	const requestData$ = this.adminService.deleteWidget(id);
  	this.subscriptions.add(
  		requestData$.subscribe(({ data }) => {
  			this.deleteInProgress = false;
  			this.save.emit();
  		}, (error) => {
  			this.deleteInProgress = false;
  			this.errorMessage = error;
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }
}
