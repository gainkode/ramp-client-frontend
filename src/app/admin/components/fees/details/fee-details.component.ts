import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { CountryFilterList } from 'model/country-code.model';
import { FeeScheme, RiskFeeCode, TransactionSourceFilterList } from 'model/fee-scheme.model';
import { PaymentInstrument, PaymentProvider, SettingsCurrencyWithDefaults, SettingsFeeSimilarResult, SettingsFeeTargetFilterType, TransactionType, UserMode, UserType } from 'model/generated-models';
import { CurrencyView, FeeTargetFilterList, PaymentInstrumentList, PaymentProviderView, TransactionTypeList, UserModeList, UserTypeList } from 'model/payment.model';
import { Observable, Subject, concat, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, shareReplay, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { getCheckedProviderList, getProviderList } from 'utils/utils';
import { FeeRiskCodesComponent } from './fee-risk-codes/fee-risk-codes.component';

@Component({
	selector: 'app-admin-fee-details',
	templateUrl: 'fee-details.component.html',
	styleUrls: ['fee-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminFeeSchemeDetailsComponent implements OnInit, OnDestroy {
	@ViewChild('feeRiskCodes') feeRiskCodes: FeeRiskCodesComponent;
	@Input() permission = 0;
	@Input() set currentScheme(scheme: FeeScheme | undefined) {
		this.setFormData(scheme);
		this.settingsId = (scheme) ? scheme?.id : '';
		this.createNew = (this.settingsId === '');
	}

	@Output() save = new EventEmitter();
	@Output() close = new EventEmitter();

	private settingsId = '';
	TARGET_TYPE: typeof SettingsFeeTargetFilterType = SettingsFeeTargetFilterType;
	submitted = false;
	createNew = false;
	saveInProgress = false;
	disableInProgress = false;
	errorMessage = '';
	defaultSchemeName = '';
	currencyOptions: CurrencyView[] = [];
	riskFees: RiskFeeCode[] = [];
	userTypeOptions = UserTypeList;
	userModes = UserModeList;
	transactionTypes = TransactionTypeList;
	instruments = PaymentInstrumentList;
	providers: PaymentProviderView[] = [];
	filteredProviders: PaymentProviderView[] = [];
	currency = '';
	deleted = false; 
	targetEntity = ['', ''];
	targetSearchText = '';
	targetsTitle = '';
	targetType = SettingsFeeTargetFilterType.None;
	targets = FeeTargetFilterList;
	isTargetsLoading = false;
	isWidgetsLoading = false;
	targetsSearchInput$ = new Subject<string>();
	widgetsSearchInput$ = new Subject<string>();
	targetsOptions$: Observable<CommonTargetValue[]> = of([]);
	widgetsOptions$: Observable<CommonTargetValue[]> = of([]);
	sourceTargetsOptions = TransactionSourceFilterList;
	minTargetsLengthTerm = 1;
	adminAdditionalSettings: Record<string, any> = {};
	similarSchemas$: Observable<SettingsFeeSimilarResult>;
	widgetIds: string[] = [];
	form = this.formBuilder.group({
		id: [''],
		name: ['', { validators: [Validators.required], updateOn: 'change' }],
		description: [''],
		isDefault: [false],
		target: ['', { validators: [Validators.required], updateOn: 'change' }],
		targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
		instrument: [undefined],
		currenciesFrom: [],
		currenciesTo: [],
		userType: [undefined],
		userMode: [[]],
		trxType: [undefined],
		provider: [undefined],
		transactionFees: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		minTransactionFee: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		widgetIds: [undefined]
	});

	private readonly destroy$ = new Subject<void>();
	constructor(
		private formBuilder: UntypedFormBuilder,
		private router: Router,
		private auth: AuthService,
		private commonService: CommonDataService,
		private adminService: AdminDataService) {
	}

	ngOnInit(): void {
		this.form.get('target')?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.updateTarget());

		this.form.get('instrument')?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(val => this.filterPaymentProviders(val));

		this.loadCommonSettings();
		this.getPaymentProviders();
		this.loadCurrencies();
		this.initWidgetSearch();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadCommonSettings(): void{
		const settingsCommon = this.auth.getLocalSettingsCommon();

		if(settingsCommon){
			this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
			this.userModes = this.userModes.filter(item => this.adminAdditionalSettings.userMode[item.id]);
			this.transactionTypes = this.transactionTypes.filter(item => this.adminAdditionalSettings.transactionType[item.id]);
			this.userTypeOptions = this.userTypeOptions.filter(item => this.adminAdditionalSettings.userType[item.id]);
			this.instruments = this.instruments.filter(item => this.adminAdditionalSettings.paymentMethods[item.id]);
		}
	}

	private loadCurrencies(): void {
		this.commonService.getSettingsCurrency()?.valueChanges
			.pipe(take(1), takeUntil(this.destroy$))
			.subscribe(({ data }) => {
				const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;

				if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
					this.currencyOptions = currencySettings.settingsCurrency.list?. map((val) => new CurrencyView(val)) as CurrencyView[];
				} else {
					this.currencyOptions = [];
				}
			}, (error) => {
				this.errorMessage = error;
			});
	}

	private setFormData(scheme: FeeScheme | undefined): void {
		this.form.reset();
		this.defaultSchemeName = '';
		this.currency = scheme?.currency ?? '';
		this.deleted = !!scheme?.deleted;

		if (scheme) {
			this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
			this.widgetIds = scheme.widgetIds;
			this.form.get('id')?.setValue(scheme.id);
			this.form.get('name')?.setValue(scheme.name);
			this.form.get('description')?.setValue(scheme.description);
			this.form.get('isDefault')?.setValue(scheme.isDefault);

			this.form.get('currenciesFrom')?.setValue(scheme.currenciesFrom);
			this.form.get('currenciesTo')?.setValue(scheme.currenciesTo);
			// Targets
			this.form.get('target')?.setValue(scheme.target);
			this.targetType = scheme?.target ?? SettingsFeeTargetFilterType.None;
			this.setTargetValues(scheme?.targetValues);

			if (scheme.instrument && scheme.instrument.length > 0) {
				const instrument = scheme.instrument[0];
				this.form.get('instrument')?.setValue(instrument);
					this.form.get('provider')?.setValue(scheme?.provider);
			} else {
				this.form.get('instrument')?.setValue(undefined);
				this.form.get('provider')?.setValue([]);
			}

			this.form.get('userMode')?.setValue(scheme?.userMode);
			this.form.get('userType')?.setValue(scheme?.userType);
			this.form.get('trxType')?.setValue(scheme?.trxType);
			// Terms
			this.form.get('transactionFees')?.setValue(scheme?.terms.transactionFees);
			this.form.get('minTransactionFee')?.setValue(scheme?.terms.minTransactionFee);

			scheme?.terms?.riskFees?.forEach(item => {
				this.riskFees.push(
				{ 
					riskCode: item.riskCode, 
					feePercent: item.feePercent,
					selected: true
				}
			);
		});

			this.setTargetValidator();
			this.setTargetValueParams();
		} else {
			this.form.get('id')?.setValue('');
			this.form.get('name')?.setValue('');
			this.form.get('description')?.setValue('');
			this.form.get('isDefault')?.setValue('');

			this.form.get('currenciesFrom')?.setValue([]);
			this.form.get('currenciesTo')?.setValue([]);
			// Targets
			this.form.get('target')?.setValue(SettingsFeeTargetFilterType.None);
			this.form.get('targetValues')?.setValue([]);
			this.form.get('instrument')?.setValue(undefined);
			this.form.get('userMode')?.setValue([]);
			this.form.get('userType')?.setValue(undefined);
			this.form.get('trxType')?.setValue(undefined);
			this.form.get('provider')?.setValue([]);
			// Terms
			this.form.get('transactionFees')?.setValue(undefined);
			this.form.get('minTransactionFee')?.setValue(undefined);
			this.setTargetValidator();
		}
	}

	private setSchemeData(): FeeScheme {
		const data = new FeeScheme(null);

		data.name = this.form.get('name')?.value;
		data.description = this.form.get('description')?.value;
		data.isDefault = this.form.get('isDefault')?.value;
		data.id = this.form.get('id')?.value;
		data.setTarget(this.targetType, this.form.get('targetValues')?.value);
		data.setWidgets(this.form.get('widgetIds')?.value);
		data.userType = this.form.get('userType')?.value as UserType[];
		data.userMode = this.form.get('userMode')?.value as UserMode[];
		data.trxType = this.form.get('trxType')?.value as TransactionType[];
		data.currenciesFrom = this.form.get('currenciesFrom')?.value as Array<string>;
		data.currenciesTo = this.form.get('currenciesTo')?.value as Array<string>;
		
		const instrument = this.form.get('instrument')?.value;
			
		data.instrument = instrument === undefined || instrument === null ? [] : [instrument];

		data.provider = this.form.get('provider')?.value as string[];

		// terms
		data.terms.transactionFees = Number(this.form.get('transactionFees')?.value);
		data.terms.minTransactionFee = Number(this.form.get('minTransactionFee')?.value);

		data.terms.riskFees = this.feeRiskCodes.mapFeeRiskCodes();

		return data;
	}

	private setTargetValues(users: string[]): void {
		if (this.targetType === SettingsFeeTargetFilterType.AccountId) {
			const filter = new Filter({ users });

				this.getFilteredAccounts(filter)
					.pipe(takeUntil(this.destroy$))
					.subscribe(result => {
						this.targetsOptions$ = of(result);
						this.form.get('targetValues')?.setValue(result);
					});

		} else if (this.targetType === SettingsFeeTargetFilterType.Country) {
				
			const data = users.map(x => {
				const c = CountryFilterList.find(c => c.id === x);
				if (c) {
					c.imgClass = 'country-flag-admin';
					return c;
				} else {
					return new CommonTargetValue();
				}
			}).filter(x => x.id !== '');

			this.targetsOptions$ = of(data);
			this.form.get('targetValues')?.setValue(data);
		} else if (this.targetType === SettingsFeeTargetFilterType.InitiateFrom) {
				
			const data = users.map(x => {
				const c = TransactionSourceFilterList.find(c => c.id === x);
				return c ?? new CommonTargetValue();
			}).filter(x => x.id !== '');
				
			this.targetsOptions$ = of(data);
			this.form.get('targetValues')?.setValue(data);
		} else {
			this.form.get('targetValues')?.setValue([]);
		}
	}

	private setTargetValueParams(): void {
		this.targetType = this.form.get('target')?.value as SettingsFeeTargetFilterType;
			
		switch (this.targetType) {
			case SettingsFeeTargetFilterType.None: {
				this.targetEntity = ['', ''];
				this.targetSearchText = '';
				this.targetsTitle = '';
				break;
			}
			case SettingsFeeTargetFilterType.Country: {
				this.targetEntity = ['country', 'countries'];
				this.targetSearchText = 'Type a country name';
				this.targetsTitle = 'Countries';
				break;
			}
			case SettingsFeeTargetFilterType.AccountId: {
				this.targetEntity = ['account', 'accounts'];
				this.targetSearchText = 'Type email or user name';
				this.targetsTitle = 'Accounts';
				break;
			}
			case SettingsFeeTargetFilterType.InitiateFrom: {
				this.targetEntity = ['source', 'sources'];
				this.targetSearchText = '';
				this.targetsTitle = 'Transaction sources';
				break;
			}
		}
		if (this.targetType !== SettingsFeeTargetFilterType.None) {
			this.initTargetSearch();
		}
	}

	private initTargetSearch(): void {
		this.targetsOptions$ = concat(
			of([]),
			this.targetsSearchInput$.pipe(
				filter(res => res !== null && res.length >= this.minTargetsLengthTerm),
				debounceTime(300),
				distinctUntilChanged(),
				tap(() => this.isTargetsLoading = true),
				switchMap(searchString => {
					this.isTargetsLoading = false;
					return this.filterTargets(searchString);
				})
			));
	}

		private initWidgetSearch(): void {
			let initialLoadDone = false;

		this.widgetsOptions$ = this.widgetsSearchInput$.pipe(
				startWith(null),
				debounceTime(300),
				distinctUntilChanged(),
				switchMap(searchString => {
					if (searchString === null && !initialLoadDone && this.widgetIds?.length) {
						this.isWidgetsLoading = true;
						initialLoadDone = true;

						return this.getFilteredWidgets(new Filter({ widgets: this.widgetIds })).pipe(
							tap(result => {
								this.form.get('widgetIds')?.setValue(result);
								this.isWidgetsLoading = false;
							}));
					} else if (searchString !== null && searchString.length >= this.minTargetsLengthTerm) {
						this.isWidgetsLoading = true;

						return this.getFilteredWidgets(new Filter({ search: searchString })).pipe(
							tap(() => this.isWidgetsLoading = false));
					} else {
						this.isWidgetsLoading = false;
						return of([]);
					}
				})
		);
	}

	private filterPaymentProviders(instruments: PaymentInstrument[]): void {
		if (!instruments || instruments.length === 0) {
			this.form.get('instrument')?.setValue(undefined);
			this.form.get('provider')?.setValue([]);
			return;
		}

		this.filteredProviders = getProviderList(instruments, this.providers);
		
		if (this.filteredProviders.length) {
			this.form.controls.provider.enable();
		} else {
			this.form.controls.provider.disable();
		}

		if (this.providers.length > 0) {
			this.form.get('provider')?.setValue(getCheckedProviderList(
				this.form.get('provider')?.value ?? [],
				this.filteredProviders
			));
		} else {
			this.form.get('provider')?.setValue([]);
		}
	}

	private filterTargets(searchString: string): Observable<CommonTargetValue[]> {
		if (this.targetType === SettingsFeeTargetFilterType.Country) {
			return of(CountryFilterList
				.map(x => {
					x.imgClass = 'country-flag-admin';
					return x;
				})
				.filter(x => x.title.toLowerCase().includes(searchString.toLowerCase()))
			);
		} else if (this.targetType === SettingsFeeTargetFilterType.AccountId) {
			const filter = new Filter({ search: searchString });
			return this.getFilteredAccounts(filter);
		} else if (this.targetType === SettingsFeeTargetFilterType.InitiateFrom) {
			return of(TransactionSourceFilterList);
		} else {
			return of([]);
		}
	}

	private getFilteredAccounts(filter: Filter): Observable<CommonTargetValue[]> {
		return this.adminService.findUsers(filter)
			.pipe(map(result => result.list.map(user => {
				return {
					id: user.id,
					title: user.extendedName
				} as CommonTargetValue;
			})));
	}

	private getFilteredWidgets(filter: Filter): Observable<CommonTargetValue[]> {
		return this.adminService.getWidgets(0, 100, 'widgetId', false, filter).pipe(
			map(result => result.list.map(widget => ({
				id: widget.id,
				title: widget.name
			} as CommonTargetValue)))
		);
	}

	private updateTarget(): void {
		this.clearTargetValues();
		this.setTargetValidator();
		this.setTargetValueParams();
	}

	private clearTargetValues(): void {
		this.targetsOptions$ = of([]);
		this.form.get('targetValues')?.setValue([]);
	}

	private setTargetValidator(): void {
		const targetValue = this.form.get('target')?.value;
		this.targetType = targetValue ?? SettingsFeeTargetFilterType.None as SettingsFeeTargetFilterType;

		const targetValuesControl = this.form.get('targetValues');

		if (targetValue === SettingsFeeTargetFilterType.None) {
			targetValuesControl?.clearValidators();
		} else {
			targetValuesControl?.setValidators([Validators.required]);
		}
			
		targetValuesControl?.updateValueAndValidity();
	}

	private getPaymentProviders(): void {
		this.providers = [];

		this.adminService.getProviders()?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(({ data }) => {
				const providers = data.getPaymentProviders as PaymentProvider[];
				this.providers = providers?.map((val) => new PaymentProviderView(val));
				const instrument = this.form.get('instrument')?.value;
				this.filterPaymentProviders([instrument]);
			});
	}

	onSubmit(): void {
		this.submitted = true;

		if (this.form.valid) {
			const scheme = this.setSchemeData();
			const isRiskFeesContainsDuplicates = this.feeRiskCodes.riskFeesContainsDuplicates();

			if (scheme.terms.riskFees.some(item => !item.riskCode || !item.feePercent) || isRiskFeesContainsDuplicates) {
				return undefined;
			} 

			this.errorMessage = '';
			this.saveInProgress = true;

			this.adminService.saveFeeSettings(scheme)
				.pipe(
					finalize(() => this.saveInProgress = false), 
					takeUntil(this.destroy$))
				.subscribe({
					next: () => this.save.emit(),
					error: (errorMessage) => {
						this.errorMessage = errorMessage;
						
						if (this.auth.token === '') {
							void this.router.navigateByUrl('/');
						}
					}
			});
		}
	}

	onTest(): void {
		this.submitted = true;

		if (this.form.valid) {
			this.getSimilarSchemes(this.setSchemeData());
		}
	}

	onStateChangeScheme(): void {
		this.disableInProgress = true;

		this.adminService.changeFeeSettingsStatus(this.settingsId)
			.pipe(
				finalize(() => this.disableInProgress = false),
				takeUntil(this.destroy$))
			.subscribe({
				next: () => this.save.emit(),
				error: (errorMessage) => {
					this.errorMessage = errorMessage;

					if (this.auth.token === '') {
						void this.router.navigateByUrl('/');
					}
				},
			});
	}

	private getSimilarSchemes(scheme: FeeScheme): void {
		this.errorMessage = '';
		this.saveInProgress = true;

		this.similarSchemas$ = this.adminService.getFeeSettingsSimilar(scheme)
			.pipe(finalize(() => this.saveInProgress = false), shareReplay(1));
	}
}
