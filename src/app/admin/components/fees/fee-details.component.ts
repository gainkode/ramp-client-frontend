import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { CostScheme } from 'src/app/model/cost-scheme.model';
import { CountryFilterList } from 'src/app/model/country-code.model';
import { FeeScheme, TransactionSourceFilterList } from 'src/app/model/fee-scheme.model';
import { PaymentInstrument, PaymentProvider, SettingsCostListResult, SettingsFeeTargetFilterType, TransactionType, UserMode, UserType } from 'src/app/model/generated-models';
import { FeeTargetFilterList, PaymentInstrumentList, PaymentProviderView, TransactionTypeList, UserModeList, UserTypeList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { getCheckedProviderList, getProviderList } from 'src/app/utils/utils';

@Component({
  selector: 'app-admin-fee-details',
  templateUrl: 'fee-details.component.html',
  styleUrls: ['fee-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminFeeSchemeDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set currentScheme(scheme: FeeScheme | undefined) {
    this.setFormData(scheme);
    this.settingsId = (scheme) ? scheme?.id : '';
    this.createNew = (this.settingsId === '');
  }

  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  private removeDialog: NgbModalRef | undefined = undefined;
  private settingsId = '';

  TARGET_TYPE: typeof SettingsFeeTargetFilterType = SettingsFeeTargetFilterType;
  PAYMENT_INSTRUMENT: typeof PaymentInstrument = PaymentInstrument;
  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  defaultSchemeName = '';
  userTypeOptions = UserTypeList;
  userModes = UserModeList;
  transactionTypes = TransactionTypeList;
  instruments = PaymentInstrumentList;
  providers: PaymentProviderView[] = [];
  filteredProviders: PaymentProviderView[] = [];
  showPaymentProvider = false;
  costSchemes: CostScheme[] = [];
  currency = '';
  targetEntity = ['', ''];
  targetSearchText = '';
  targetsTitle = '';
  targetType = SettingsFeeTargetFilterType.None;
  targets = FeeTargetFilterList;
  isTargetsLoading = false;
  targetsSearchInput$ = new Subject<string>();
  targetsOptions$: Observable<CommonTargetValue[]> = of([]);
  sourceTargetsOptions = TransactionSourceFilterList;
  minTargetsLengthTerm = 1;

  form = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    isDefault: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
    instrument: [undefined],
    userType: [[]],
    userMode: [[]],
    trxType: [[]],
    provider: [[]],
    transactionFees: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    minTransactionFee: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    rollingReserves: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    rollingReservesDays: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    chargebackFees: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    monthlyFees: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    minMonthlyFees: [undefined, { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService) {

  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.form.get('target')?.valueChanges.subscribe(val => this.updateTarget())
    );
    this.subscriptions.add(
      this.form.get('instrument')?.valueChanges.subscribe(val => this.filterPaymentProviders(val))
    );
    this.getPaymentProviders();
    this.loadCostSchemeList();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(scheme: FeeScheme | undefined): void {
    this.form.reset();
    this.defaultSchemeName = '';
    this.currency = scheme?.currency ?? '';
    if (scheme) {
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.form.get('id')?.setValue(scheme?.id);
      this.form.get('name')?.setValue(scheme?.name);
      this.form.get('description')?.setValue(scheme?.description);
      this.form.get('isDefault')?.setValue(scheme?.isDefault);
      // Targets
      this.form.get('target')?.setValue(scheme?.target);
      this.targetType = scheme?.target ?? SettingsFeeTargetFilterType.None;
      this.setTargetValues(scheme?.targetValues);
      if (scheme.instrument && scheme.instrument.length > 0) {
        const instrument = scheme.instrument[0];
        this.form.get('instrument')?.setValue(instrument);
        if (instrument === PaymentInstrument.WireTransfer) {
          this.form.get('provider')?.setValue(scheme?.provider[0]);
        } else {
          this.form.get('provider')?.setValue(scheme?.provider);
        }
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
      this.form.get('rollingReserves')?.setValue(scheme?.terms.rollingReserves);
      this.form.get('rollingReservesDays')?.setValue(scheme?.terms.rollingReservesDays);
      this.form.get('chargebackFees')?.setValue(scheme?.terms.chargebackFees);
      this.form.get('monthlyFees')?.setValue(scheme?.terms.monthlyFees);
      this.form.get('minMonthlyFees')?.setValue(scheme?.terms.minMonthlyFees);
      this.setTargetValidator();
      this.setTargetValueParams();
    } else {
      this.form.get('id')?.setValue('');
      this.form.get('name')?.setValue('');
      this.form.get('description')?.setValue('');
      this.form.get('isDefault')?.setValue('');
      // Targets
      this.form.get('target')?.setValue(SettingsFeeTargetFilterType.None);
      this.form.get('targetValues')?.setValue([]);
      this.form.get('instrument')?.setValue(undefined);
      this.form.get('userMode')?.setValue([]);
      this.form.get('userType')?.setValue('');
      this.form.get('trxType')?.setValue('');
      this.form.get('provider')?.setValue([]);
      // Terms
      this.form.get('transactionFees')?.setValue(undefined);
      this.form.get('minTransactionFee')?.setValue(undefined);
      this.form.get('rollingReserves')?.setValue(undefined);
      this.form.get('rollingReservesDays')?.setValue(undefined);
      this.form.get('chargebackFees')?.setValue(undefined);
      this.form.get('monthlyFees')?.setValue(undefined);
      this.form.get('minMonthlyFees')?.setValue(undefined);
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
    data.userType = this.form.get('userType')?.value as UserType[];
    data.userMode = this.form.get('userMode')?.value as UserMode[];
    data.trxType = this.form.get('trxType')?.value as TransactionType[];
    const instrument = this.form.get('instrument')?.value;
    if (instrument === undefined || instrument === null) {
      data.instrument = [];
    } else {
      data.instrument = [instrument];
    }
    data.provider = this.form.get('provider')?.value as string[];
    // terms
    data.terms.transactionFees = Number(this.form.get('transactionFees')?.value);
    data.terms.minTransactionFee = Number(this.form.get('minTransactionFee')?.value);
    data.terms.rollingReserves = Number(this.form.get('rollingReserves')?.value);
    data.terms.rollingReservesDays = Number(this.form.get('rollingReservesDays')?.value);
    data.terms.chargebackFees = Number(this.form.get('chargebackFees')?.value);
    data.terms.monthlyFees = Number(this.form.get('monthlyFees')?.value);
    data.terms.minMonthlyFees = Number(this.form.get('minMonthlyFees')?.value);
    return data;
  }

  private setTargetValues(values: string[]): void {
    if (this.targetType === SettingsFeeTargetFilterType.AccountId) {
      const filter = new Filter({
        users: values
      });
      this.subscriptions.add(
        this.getFilteredAccounts(filter).subscribe(result => {
          this.targetsOptions$ = of(result);
          this.form.get('targetValues')?.setValue(result);
        })
      );
    } else if (this.targetType === SettingsFeeTargetFilterType.WidgetId) {
      const filter = new Filter({
        widgets: values
      });
      this.subscriptions.add(
        this.getFilteredWidgets(filter).subscribe(result => {
          this.targetsOptions$ = of(result);
          this.form.get('targetValues')?.setValue(result);
        })
      );
    } else if (this.targetType === SettingsFeeTargetFilterType.Country) {
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
    } else if (this.targetType === SettingsFeeTargetFilterType.InitiateFrom) {
      const data = values.map(x => {
        const c = TransactionSourceFilterList.find(c => c.id === x);
        if (c) {
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
      case SettingsFeeTargetFilterType.WidgetId: {
        this.targetEntity = ['widget', 'widgets'];
        this.targetSearchText = 'Type a widget name';
        this.targetsTitle = 'Widgets';
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

  private initTargetSearch() {
    this.targetsOptions$ = concat(
      of([]),
      this.targetsSearchInput$.pipe(
        filter(res => {
          return res !== null && res.length >= this.minTargetsLengthTerm
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isTargetsLoading = true;
        }),
        switchMap(searchString => {
          this.isTargetsLoading = false;
          return this.filterTargets(searchString);
        })
      ));
  }

  private filterPaymentProviders(instruments: PaymentInstrument[]): void {
    if (instruments) {
      if (instruments.length > 0) {
        if (!instruments.includes(PaymentInstrument.WireTransfer)) {
          this.filteredProviders = getProviderList(instruments, this.providers);
          this.showPaymentProvider = this.filteredProviders.length > 0;
          if (this.providers.length > 0) {
            this.form.get('provider')?.setValue(getCheckedProviderList(
              this.form.get('provider')?.value ?? [],
              this.filteredProviders));
          } else {
            this.form.get('provider')?.setValue([]);
          }
        }
      } else {
        this.form.get('instrument')?.setValue(undefined);
        this.form.get('provider')?.setValue([]);
      }
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
    } else if (this.targetType === SettingsFeeTargetFilterType.WidgetId) {
      const filter = new Filter({ search: searchString });
      return this.getFilteredWidgets(filter);
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
    return this.adminService.getWidgets(0, 100, 'widgetId', false, filter)
      .pipe(map(result => {
        return result.list.map(widget => {
          return {
            id: widget.id,
            title: widget.name
          } as CommonTargetValue;
        });
      }));
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
    this.targetType = val ?? SettingsFeeTargetFilterType.None as SettingsFeeTargetFilterType;
    if (val === SettingsFeeTargetFilterType.None) {
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
        const instrument = this.form.get('instrument')?.value;
        this.filterPaymentProviders([instrument]);
      })
    );
  }

  private loadCostSchemeList(): void {
    const listData$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));
    this.errorMessage = '';
    this.costSchemes = [];
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const settings = data.getSettingsCost as SettingsCostListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count ?? 0;
          if (itemCount > 0) {
            this.costSchemes = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
          }
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
      this.removeDialog.closed.subscribe(val => {
        this.deleteSchemeConfirmed(this.settingsId ?? '');
      })
    );
  }

  private saveScheme(scheme: FeeScheme): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.saveFeeSettings(scheme);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  deleteSchemeConfirmed(id: string): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.deleteFeeSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
