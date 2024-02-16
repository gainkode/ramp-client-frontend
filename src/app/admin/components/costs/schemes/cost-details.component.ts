import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { CommonTargetValue } from 'model/common.model';
import { CostScheme } from 'model/cost-scheme.model';
import { CountryFilterList } from 'model/country-code.model';
import { PaymentInstrument, PaymentProvider, SettingsCostTargetFilterType, TransactionType, WireTransferBankAccountListResult } from 'model/generated-models';
import { CostTargetFilterList, PaymentInstrumentList, PaymentProviderView, TransactionTypeList } from 'model/payment.model';
import { AuthService } from 'services/auth.service';
import { getCheckedProviderList, getProviderList } from 'utils/utils';
import { Filter } from 'admin/model/filter.model';

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

  private subscriptions: Subscription = new Subscription();
  private removeDialog: NgbModalRef | undefined = undefined;
  private settingsId = '';

  TARGET_TYPE: typeof SettingsCostTargetFilterType = SettingsCostTargetFilterType;
  submitted = false;
  createNew = false;
  saveInProgress = false;
  errorMessage = '';
  defaultSchemeName = '';
  bankAccounts: CommonTargetValue[] = [];
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
  targetsSearchInput$ = new Subject<string>();
	widgetsSearchInput$ = new Subject<string>();
  targetsOptions$: Observable<CommonTargetValue[]> = of([]);
	widgetsOptions$: Observable<CommonTargetValue[]> = of([]);
  minTargetsLengthTerm = 1;
  adminAdditionalSettings: Record<string, any> = {};

  form = this.formBuilder.group({
  	id: [undefined],
  	name: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	description: [undefined],
  	bankAccounts: [[]],
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

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService) {

  }

  ngOnInit(): void {
  	this.subscriptions.add(
  		this.form.get('target')?.valueChanges.subscribe(_ => this.updateTarget())
  	);
  	this.subscriptions.add(
  		this.form.get('instrument')?.valueChanges.subscribe(val => this.filterPaymentProviders(val))
  	);
  	this.loadCommonSettings();
  	this.getPaymentProviders();
  	this.getWireTransferAccounts();
		this.initWidgetSearch();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
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
  	if (scheme) {
  		this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
  		this.form.get('id')?.setValue(scheme?.id);
  		this.form.get('name')?.setValue(scheme?.name);
  		this.form.get('description')?.setValue(scheme?.description);
  		this.form.get('isDefault')?.setValue(scheme?.isDefault);
  		this.form.get('bankAccounts')?.setValue(scheme?.bankAccountIds);
  		this.form.get('target')?.setValue(scheme?.target);
  		this.targetType = scheme?.target ?? SettingsCostTargetFilterType.None;
  		this.setTargetValues(scheme?.targetValues);
			this.setWidgets(scheme.widgetIds);
  		this.form.get('trxType')?.setValue(scheme?.trxType);
  		this.form.get('instrument')?.setValue(scheme.instrument);
			console.log(scheme?.provider)
  		this.form.get('provider')?.setValue(scheme?.provider);
  		this.form.get('mdr')?.setValue(scheme?.terms.mdr);
  		this.form.get('transactionCost')?.setValue(scheme?.terms.transactionCost);
			console.log(this.form);
  		this.filterPaymentProviders(scheme.instrument);
  		this.setTargetValidator();
  		this.setTargetValueParams();
  	} else {
  		this.form.get('id')?.setValue('');
  		this.form.get('name')?.setValue('');
  		this.form.get('description')?.setValue('');
  		this.form.get('isDefault')?.setValue('');
  		this.form.get('bankAccounts')?.setValue([]);
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

	private setWidgets(values: string[]): void {
		if (values?.length) {
			const filter = new Filter({
				widgets: values
			});
			this.subscriptions.add(
				this.getFilteredWidgets(filter).subscribe(result => {
					this.widgetsOptions$ = of(result);
					this.form.get('widgetIds')?.setValue(result);
				})
			);
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
  	data.bankAccountIds = this.form.get('bankAccounts')?.value;
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
  	this.widgetsOptions$ = concat(
  		of([]),
  		this.widgetsSearchInput$.pipe(
  			filter(res => res !== null && res.length >= this.minTargetsLengthTerm),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => this.isTargetsLoading = true),
  			switchMap(searchString => {
  				this.isTargetsLoading = false;
  				const filter = new Filter({ search: searchString });
  				return this.getFilteredWidgets(filter);
  			})
  		));
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
  	const data$ = this.adminService.getProviders()?.valueChanges;
  	this.subscriptions.add(
  		data$.subscribe(({ data }) => {
  			const providers = data.getPaymentProviders as PaymentProvider[];
  			this.providers = providers?.map((val) => new PaymentProviderView(val));
				if (this.providers?.length) {
					this.filterPaymentProviders(this.form.get('instrument')?.value);
				}
  		})
  	);
  }

  private getWireTransferAccounts(): void {
  	this.bankAccounts = [];
  	const data$ = this.adminService.getWireTransferBankAccounts().valueChanges;
  	this.subscriptions.add(
  		data$.subscribe(({ data }) => {
  			const dataList = data.getWireTransferBankAccounts as WireTransferBankAccountListResult;
  			if (dataList?.count ?? 0 > 0) {
  				this.bankAccounts = dataList?.list?.map(val => {
  					return {
  						id: val.bankAccountId,
  						title: val.name
  					} as CommonTargetValue;
  				}) ?? [];
  			}
  		})
  	);
  }

  onSubmit(): void {
  	this.submitted = true;
  	if (this.form.valid) {
  		this.saveScheme(this.setSchemeData());
  	}
  }

  deleteScheme(content: any): void {
  	this.removeDialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  	this.subscriptions.add(
  		this.removeDialog.closed.subscribe(val => this.deleteSchemeConfirmed(this.settingsId ?? ''))
  	);
  }

  private saveScheme(scheme: CostScheme): void {
  	this.errorMessage = '';
  	this.saveInProgress = true;
  	const requestData$ = this.adminService.saveCostSettings(scheme, this.createNew);
  	this.subscriptions.add(
  		requestData$.subscribe(() => {
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
  }

  deleteSchemeConfirmed(id: string): void {
  	this.errorMessage = '';
  	this.saveInProgress = true;
  	const requestData$ = this.adminService.deleteCostSettings(id);
  	this.subscriptions.add(
  		requestData$.subscribe(() => {
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
  }
}
