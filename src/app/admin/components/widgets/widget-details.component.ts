import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { PaymentInstrument, PaymentProvider, SettingsCurrencyWithDefaults, TransactionType, UserType } from 'model/generated-models';
import { CurrencyView, PaymentInstrumentList, PaymentProviderView, TransactionTypeList, UserTypeList } from 'model/payment.model';
import { UserItem } from 'model/user.model';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { getCheckedProviderList, getProviderList } from 'utils/utils';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NUMBER_PATTERN } from 'utils/constants';
import { AddressValidatorDirective } from 'shared/directives';

interface AmountItem {
	currency: string;
	minAmount: number;
	maxAmount: number;
	selected?: boolean;
}

@Component({
	selector: 'app-admin-widget-details',
	templateUrl: 'widget-details.component.html',
	styleUrls: ['widget-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminWidgetDetailsComponent implements OnInit, OnDestroy {
	@ViewChildren(AddressValidatorDirective) inputElements!: QueryList<AddressValidatorDirective>;
	@ViewChild('amountsTable') amountsTable: MatTable<AmountItem[]>;
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
  displayedColumns: string[] = [
  	'details',
  	'currency',
  	'destination'
  ];

	displayedAmountsColumns: string[] = [
  	'details',
		'currency',
  	'minAmount',
  	'maxAmount'
  ];

  isLoading = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
	currencyDestinationOptions: CurrencyView[] = [];
	currencyMerchantDestinationOptions: CurrencyView[] = [];
  currenciesTable: any = [];
	merchantFeeDestinationTable: any = [];
	amountsSettingsTable: MatTableDataSource<AmountItem> = new MatTableDataSource();
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

  form = this.formBuilder.group({
  	id: [null],
  	countries: [[]],
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
		ignoreMaxSellAmount: false,
  	minAmountFrom: [0, { validators: [Validators.pattern(NUMBER_PATTERN)], updateOn: 'change' }],
  	maxAmountFrom: [0, { validators: [Validators.pattern(NUMBER_PATTERN)], updateOn: 'change' }],
  	fee: [0, { validators: [Validators.pattern(NUMBER_PATTERN)], updateOn: 'change' }],
		merchantFeeMinAmount: [0, { validators: [Validators.pattern(NUMBER_PATTERN)], updateOn: 'change' }],
		merchantFeePercent: [0, { validators: [Validators.pattern(NUMBER_PATTERN)], updateOn: 'change' }],
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

	get isMaxSellAmountDisabled(): boolean {
		const transactionTypes = this.form.get('transactionTypes')?.value;

		return transactionTypes?.length === 0 || transactionTypes.includes(TransactionType.Sell);
	}
	
  ngOnInit(): void {
  	this.loadAdminSettings();
  	this.initUserSearch();

		this.form.get('instruments')?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(val => this.filterPaymentProviders(val));

		this.loadPaymentProvidersAndCurrencies();

		const updatedCurrencyAmounts = this.widgetAdditionalSettings?.amounts?.map(item => ({
			currency: item.currency,
			minAmount: item.minAmount,
			maxAmount: item.maxAmount,
			selected: true
		})) || [];
		
		this.amountsSettingsTable = new MatTableDataSource(updatedCurrencyAmounts);
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
  }

  private loadAdminSettings(): void{
		this.adminAdditionalSettings = this.auth.getAdminAdditionalSettings();

		if(this.adminAdditionalSettings){
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
						ignoreMaxSellAmount: this.widgetAdditionalSettings?.ignoreMaxSellAmount ?? false,
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

  	widget.id = formValue.id;
  	widget.name = formValue.name;
  	widget.description = formValue.description;
  	widget.userId = formValue.user.id;
  	widget.countriesCode2 = formValue.countries.map(c => c.code2);

  	this.widgetAdditionalSettings.userType = formValue.userType;
  	this.widgetAdditionalSettings.kycBeforePayment = formValue.kycBeforePayment;
  	this.widgetAdditionalSettings.twoFA = formValue.twoFA;
		this.widgetAdditionalSettings.ignoreMaxSellAmount = formValue.ignoreMaxSellAmount;
  	this.widgetAdditionalSettings.showRate = formValue.showRate;
  	this.widgetAdditionalSettings.maxAmountFrom = formValue.maxAmountFrom;
  	this.widgetAdditionalSettings.minAmountFrom = formValue.minAmountFrom;
  	this.widgetAdditionalSettings.disclaimer = formValue.disclaimer;
		this.widgetAdditionalSettings.amounts = this.mapAmountSettings();

		if (this.currenciesTable._data._value?.length > 0) {

			// allow save with atlease one item with currency
			if (this.currenciesTable._data._value[0].currency) {

				// if atleast one with destination - set all rows required
				if (this.currenciesTable._data._value?.some(e => e.destination)) {
					this.currenciesTable._data._value.forEach(c => c.destinationRequired = true);
		
					// if all items with destination allow SAVE
					if (this.currenciesTable._data._value.every(e => e.currency && e.destination !== ' ' && e.destination)) {
						for (const cryptoCurrency of this.currenciesTable._data._value) {
							if (cryptoCurrency.selected) {
								widget.currenciesCrypto.push(cryptoCurrency.currency);
			
								widget.destinationAddress.push({
									currency: cryptoCurrency.currency,
									destination: cryptoCurrency.destination
								});
							}
						}
					} else {
						return undefined;
					}
				}
				
				// if all items without destination allow SAVE
				if (this.currenciesTable._data._value.every(e => e.currency && !e.destination)) {
					this.currenciesTable._data._value.forEach(c => c.destinationRequired = false);
		
					for (const cryptoCurrency of this.currenciesTable._data._value) {
						if(cryptoCurrency.selected){
							widget.currenciesCrypto.push(cryptoCurrency.currency);
						}
					}
				} 
			}

		}

		if (this.merchantFeeDestinationTable._data._value?.length > 0){
  		for (const cryptoCurrency of this.merchantFeeDestinationTable._data._value) {
  			if (cryptoCurrency.selected) {
					widget.merchantFeeDestinationAddress.push({
						currency: cryptoCurrency.currency,
						destination: cryptoCurrency.destination
					});
  			}
  		}
  	}

		if (widget.merchantFeeDestinationAddress.some(widget => !widget.currency || !widget.destination || widget.destination === '')) {
			return undefined;
		} 

		if (this.inputElements.some((input: any) => input.el.nativeElement.hasAttribute('data-error'))) {
			return undefined;
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
					
					this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];

					this.filterPaymentProviders(this.form.get('instruments')?.value ?? []);

					if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
						if (currencySettings.settingsCurrency.list && currencySettings.settingsCurrency.list?.length !== 0){
							const currenciesCrypto: CurrencyView[] = [];
							const currenciesFiat: CurrencyView[] = [];

							for(const currency of currencySettings.settingsCurrency.list){
								if(currency.fiat === false){
									const widgetDestination = this.widgetDetails?.destinationAddress?.find(wallet => wallet.currency === currency.symbol);
									const merchantFeeDestination = this.widgetDetails?.merchantFeeDestinationAddress?.find(wallet => wallet.currency === currency.symbol);
									const currencySelectedWithoutDestination = this.widgetDetails?.currenciesCrypto.find(item => item === currency.symbol);

									currenciesCrypto.push(new CurrencyView(currency));
									
									if (widgetDestination) {
										this.currenciesTable.push(
											{ 
												currency: currency.symbol, 
												destination: widgetDestination.destination, 
												destinationRequired: true, 
												selected: true
											}
										);
									} else if (currencySelectedWithoutDestination) {
										this.currenciesTable.push(
											{ 
												currency: currency.symbol, 
												destination: '', 
												destinationRequired: false,
												selected: true
											}
										);
									}
									
									if (merchantFeeDestination) {
										this.merchantFeeDestinationTable.push(
											{ 
												currency: currency.symbol, 
												destination: merchantFeeDestination.destination,
												selected: true
											}
										);
									}
								} else if (currency.fiat === true) {
									currenciesFiat.push(new CurrencyView(currency));
								}
							}

							this.currencyOptionsFiat = currenciesFiat;

							this.currencyDestinationOptions = [...currenciesCrypto];
							this.currencyMerchantDestinationOptions = [...currenciesCrypto];

							this.currenciesTable = new MatTableDataSource(this.currenciesTable);
							this.merchantFeeDestinationTable = new MatTableDataSource(this.merchantFeeDestinationTable);
						}
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
		if (this.currenciesTable._data._value?.length > 0) {
			const lastTableElement = this.currenciesTable._data._value.at(-1);

			if (!lastTableElement.currency) return;
		
			if (this.currenciesTable._data._value.some(e => e.destination)) {
				// if some contains destination, set all destinationRequired = true
				this.currenciesTable._data._value.forEach(c => c.destinationRequired = true);
				this.currenciesTable._data._value.push({ currency: null, destination: '', destinationRequired: true, selected: true });

			} else if (this.currenciesTable._data._value.every(e => !e.destination)) {
				// if every NOT contains destination, set all destinationRequired = false
				this.currenciesTable._data._value.forEach(c => c.destinationRequired = false);
				this.currenciesTable._data._value.push({ currency: null, destination: '', destinationRequired: false, selected: true });
				
			}
		} else {
			this.currenciesTable._data._value.push({ currency: null, destination: '', destinationRequired: false, selected: true });
		}

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

		if (this.currenciesTable._data._value?.length > 0) {
			if (this.currenciesTable._data._value.some(e => e.destination)) {
				// if some contains destination, set all destinationRequired = true
				this.currenciesTable._data._value.forEach(c => c.destinationRequired = true);
			} else if (this.currenciesTable._data._value.every(e => !e.destination)) {
				// if every NOT contains destination, set all destinationRequired = false
				this.currenciesTable._data._value.forEach(c => c.destinationRequired = false);
			} 
		}
  }

	addMerchantFeeDestinationAddress(): void{
		const lastTableElement = this.merchantFeeDestinationTable._data._value.at(-1);

		if (lastTableElement) {
			if (!lastTableElement.currency || !lastTableElement.destination) return;
		}

  	this.merchantFeeDestinationTable._data._value.push({ currency: null, destination: '', selected: true });
  	this.merchantFeeDestinationTable = new MatTableDataSource(this.merchantFeeDestinationTable._data._value);
  }

  delMerchantFeeDestinationAddress(element: any): void{
  	const merchantFeeDestinationTableDel: Record<string, any>[] = [];

  	for(const item of this.merchantFeeDestinationTable._data._value){
  		if(item.currency !== element.currency){
  			merchantFeeDestinationTableDel.push(item);
  		}
  	}

  	this.merchantFeeDestinationTable = new MatTableDataSource(merchantFeeDestinationTableDel);
  }

	addAmountSetting(): void{
		const lastTableElement = this.amountsSettingsTable.data.at(-1);

		if (lastTableElement) {
			if (!lastTableElement.currency) return;
		}

  	this.amountsSettingsTable.data.push({ currency: null, minAmount: 0, maxAmount: 0, selected: true });

  	this.amountsSettingsTable = new MatTableDataSource(this.amountsSettingsTable.data);
  }

	deleteAmountSetting(rowId: number): void {
    if (rowId > -1) {
      this.amountsSettingsTable.data.splice(rowId, 1);
      this.amountsTable.renderRows();
    }
  }

	mapAmountSettings(): AmountItem[] {
    if (this.amountsSettingsTable.data.length > 0) {
      const amounts: AmountItem[]  = [];

  		for (const item of this.amountsSettingsTable.data) {
  			if (item.selected) {
					amounts.push({
						currency: item.currency,
						minAmount: item.minAmount,
						maxAmount: item.maxAmount,
					});
  			}
  		}

      return amounts;
  	}
    
    return [];
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
