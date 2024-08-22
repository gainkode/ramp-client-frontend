import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { CostScheme } from 'model/cost-scheme.model';
import { CountryFilterList } from 'model/country-code.model';
import { PaymentInstrument, PaymentProvider, SettingsCostSimilarResult, SettingsCostTargetFilterType, TransactionType } from 'model/generated-models';
import { CostTargetFilterList, PaymentInstrumentList, PaymentProviderView, TransactionTypeList } from 'model/payment.model';
import { concat, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { getProviderList } from 'utils/utils';

@Component({
	selector: 'app-admin-cost-details',
	templateUrl: 'cost-details.component.html',
	styleUrls: ['cost-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminCostSchemeDetailsComponent implements OnInit, OnDestroy {
	@Input() permission = 0;
	@Input()
	set currentScheme(scheme: CostScheme | undefined) {
		this.setFormData(scheme);
		this.settingsId = (scheme) ? scheme?.id : '';
		this.createNew = (this.settingsId === '');
	}

	@Output() save = new EventEmitter();
	@Output() close = new EventEmitter();

	private settingsId = '';

	TARGET_TYPE: typeof SettingsCostTargetFilterType = SettingsCostTargetFilterType;
	submitted = false;
	createNew = false;
	deleted = false;
	disableInProgress = false;
	saveInProgress = false;
	errorMessage = '';
	defaultSchemeName = '';
	transactionTypes = TransactionTypeList;
	instruments = PaymentInstrumentList;
	providers: PaymentProviderView[] = [];
	filteredProviders: PaymentProviderView[] = [];
	showPaymentProvider = false;
	targetEntity = ['', ''];
	targetSearchText = '';
	targetsTitle = '';
	targetType = SettingsCostTargetFilterType.None;
	targets = CostTargetFilterList;
	isTargetsLoading = false;
	isWidgetsLoading = false;
	targetsSearchInput$ = new Subject<string>();
	widgetsSearchInput$ = new Subject<string>();
	targetsOptions$: Observable<CommonTargetValue[]> = of([]);
	widgetsOptions$: Observable<CommonTargetValue[]> = of([]);
	minTargetsLengthTerm = 1;
	adminAdditionalSettings: Record<string, any> = {};
	similarSchemas$: Observable<SettingsCostSimilarResult>;
	widgetIds: string[] = [];
	form = this.formBuilder.group({
		id: [undefined],
		name: [undefined, { validators: [Validators.required], updateOn: 'change' }],
		description: [undefined],
		isDefault: [false],
		target: [undefined, { validators: [Validators.required], updateOn: 'change' }],
		targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
		instrument: [[]],
		trxType: [[]],
		provider: [[]],
		mdr: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		transactionCost: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
		widgetIds: [undefined]
	});

	private readonly destroy$ = new Subject<void>();
	constructor(
		private formBuilder: UntypedFormBuilder,
		private router: Router,
		private auth: AuthService,
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
			this.transactionTypes = this.transactionTypes.filter(item => this.adminAdditionalSettings.transactionType[item.id] == true);
			this.instruments = this.instruments.filter(item => this.adminAdditionalSettings.paymentMethods[item.id] == true);
		}
	}

	private setFormData(scheme: CostScheme | undefined): void {
		this.form.reset();
		this.defaultSchemeName = '';
		this.deleted = !!scheme?.deleted;

		if (scheme) {
			this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
			this.widgetIds = scheme.widgetIds;
				
			this.form.get('id')?.setValue(scheme?.id);
			this.form.get('name')?.setValue(scheme?.name);
			this.form.get('description')?.setValue(scheme?.description);
			this.form.get('isDefault')?.setValue(scheme?.isDefault);
			this.form.get('target')?.setValue(scheme?.target);
			this.targetType = scheme?.target ?? SettingsCostTargetFilterType.None;
			this.setTargetValues(scheme?.targetValues);
			this.form.get('trxType')?.setValue(scheme?.trxType);
			this.form.get('instrument')?.setValue(scheme.instrument);
			this.form.get('provider')?.setValue(scheme?.provider);
			this.form.get('mdr')?.setValue(scheme?.terms.mdr);
			this.form.get('transactionCost')?.setValue(scheme?.terms.transactionCost);
			this.filterPaymentProviders(scheme.instrument);
			this.setTargetValidator();
			this.setTargetValueParams();
		} else {
			this.form.get('id')?.setValue('');
			this.form.get('name')?.setValue('');
			this.form.get('description')?.setValue('');
			this.form.get('isDefault')?.setValue('');
			this.form.get('target')?.setValue(SettingsCostTargetFilterType.None);
			this.form.get('targetValues')?.setValue([]);
			this.form.get('trxType')?.setValue([]);
			this.form.get('instrument')?.setValue([]);
			this.form.get('provider')?.setValue([]);
			this.form.get('mdr')?.setValue(undefined);
			this.form.get('transactionCost')?.setValue(undefined);
			this.filterPaymentProviders([]);
			this.setTargetValidator();
		}
	}

	private setSchemeData(): CostScheme {
		const data = new CostScheme(null);
		data.name = this.form.get('name')?.value;
		data.description = this.form.get('description')?.value;
		data.isDefault = this.form.get('isDefault')?.value;
		data.id = this.form.get('id')?.value;
		data.setWidgets(this.form.get('widgetIds')?.value);
		data.setTarget(this.targetType, this.form.get('targetValues')?.value);
		data.trxType = this.form.get('trxType')?.value as TransactionType[];
		data.instrument = this.form.get('instrument')?.value as PaymentInstrument[];
		data.provider = this.form.get('provider')?.value as string[];
		// terms
		data.terms.mdr = Number(this.form.get('mdr')?.value);
		data.terms.transactionCost = Number(this.form.get('transactionCost')?.value);
		return data;
	}

	private setTargetValues(values: string[]): void {
		if (this.targetType === SettingsCostTargetFilterType.Country) {
			const data = values.map(x => {
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
		} else {
			this.form.get('targetValues')?.setValue([]);
		}
	}

	private setTargetValueParams(): void {
		this.targetType = this.form.get('target')?.value as SettingsCostTargetFilterType;
		switch (this.targetType) {
			case SettingsCostTargetFilterType.None: {
				this.targetEntity = ['', ''];
				this.targetSearchText = '';
				this.targetsTitle = '';
				break;
			}
			case SettingsCostTargetFilterType.Country: {
				this.targetEntity = ['country', 'countries'];
				this.targetSearchText = 'Type a country name';
				this.targetsTitle = 'Countries';
				break;
			}
		}
		if (this.targetType !== SettingsCostTargetFilterType.None) {
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
					if (searchString === null && !initialLoadDone && this.widgetIds.length) {
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
		if (instruments?.length) {
			this.filteredProviders = getProviderList(instruments, this.providers);
			this.showPaymentProvider = this.filteredProviders.length > 0;
		}
	}

	private getFilteredWidgets(filter: Filter): Observable<CommonTargetValue[]> {
		return this.adminService.getWidgets(0, 100, 'widgetId', false, filter).pipe(
			map(result => result.list.map(widget => ({
				id: widget.id,
				title: widget.name
			} as CommonTargetValue)))
		);
	}
		
	private filterTargets(searchString: string): Observable<CommonTargetValue[]> {
		if (this.targetType === SettingsCostTargetFilterType.Country) {
			return of(CountryFilterList
				.map(x => {
					x.imgClass = 'country-flag-admin';
					return x;
				})
				.filter(x => x.title.toLowerCase().includes(searchString.toLowerCase()))
			);
		} else {
			return of([]);
		}
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
		const val = this.form.get('target')?.value;
		this.targetType = val ?? SettingsCostTargetFilterType.None as SettingsCostTargetFilterType;
		
		if (val === SettingsCostTargetFilterType.None) {
			this.form.get('targetValues')?.clearValidators();
		} else {
			this.form.get('targetValues')?.setValidators([Validators.required]);
		}

		this.form.get('targetValues')?.updateValueAndValidity();
	}

	private getPaymentProviders(): void {
		this.providers = [];

		this.adminService.getProviders()?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(({ data }) => {
			const providers = data.getPaymentProviders as PaymentProvider[];
			this.providers = providers?.map((val) => new PaymentProviderView(val));
				this.filterPaymentProviders(this.form.get('instrument')?.value);
		});
	}

	onSubmit(): void {
		this.submitted = true;

		if (this.form.valid) {
			this.saveScheme(this.setSchemeData());
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

		this.adminService.changeCostSettingsStatus(this.settingsId)
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

	private saveScheme(scheme: CostScheme): void {
		this.errorMessage = '';
		this.saveInProgress = true;
	
		this.adminService.saveCostSettings(scheme, this.createNew).pipe(takeUntil(this.destroy$)).subscribe({
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
	}

	private getSimilarSchemes(scheme: CostScheme): void {
		this.errorMessage = '';
		this.saveInProgress = true;
		this.similarSchemas$ = this.adminService.getCostSettingsSimilar(scheme).pipe(finalize(() => this.saveInProgress = false), shareReplay(1));
	}
}
