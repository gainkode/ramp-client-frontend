import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  FeeScheme, AccountTypeFilterList, TransactionSourceFilterList
} from '../../../../model/fee-scheme.model';
import {
  SettingsFeeTargetFilterType, PaymentInstrument, PaymentProvider, TransactionType, UserType, UserMode, SettingsCostListResult
} from '../../../../model/generated-models';
import {
  PaymentInstrumentList, FeeTargetFilterList, TransactionTypeList, UserTypeList, UserModeList, PaymentProviderView
} from 'src/app/model/payment.model';
import { CommonTargetValue, TargetParams } from 'src/app/model/common.model';
import { CountryFilterList, getCountry } from 'src/app/model/country-code.model';
import { ErrorService } from 'src/app/services/error.service';
import { LayoutService } from '../../../services/layout.service';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { Filter } from 'src/app/admin_new/model/filter.model';
import { CostScheme } from 'src/app/model/cost-scheme.model';
import { getCheckedProviderList, getProviderList } from 'src/app/utils/utils';

@Component({
  selector: 'app-fee-editor',
  templateUrl: 'fee-details.component.html',
  styleUrls: ['fee-details.component.scss']
})
export class FeeDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set currentScheme(scheme: FeeScheme | null) {
    this.forceValidate = false;
    this.setFormData(scheme);
    this.layoutService.setBackdrop(!this.settingsId);
  }

  @Output() save = new EventEmitter<FeeScheme>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();
  @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  PAYMENT_INSTRUMENT: typeof PaymentInstrument = PaymentInstrument;
  currectScheme: FeeScheme | null = null;
  settingsId = '';
  errorMessage = '';
  selectedTab = 0;
  targetEntity = '';
  targetType = SettingsFeeTargetFilterType.None;
  currency = '';
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTargetValues$: Observable<CommonTargetValue[]> | undefined;
  targets = FeeTargetFilterList;
  transactionTypes = TransactionTypeList;
  instruments = PaymentInstrumentList;
  providers: PaymentProviderView[] = [];
  filteredProviders: PaymentProviderView[] = [];
  showPaymentProvider = false;
  userTypes = UserTypeList;
  userModes = UserModeList;
  targetValues: CommonTargetValue[] = [];
  costSchemes: CostScheme[] = [];

  private defaultSchemeName = '';
  private forceValidate = false;
  private destroy$ = new Subject();
  private targetSearchString$ = new BehaviorSubject<string>('');
  private subscriptions: Subscription = new Subscription();

  schemeForm = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    isDefault: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
    targetValue: [''],
    instrument: [undefined],
    userType: [[]],
    userMode: [[]],
    trxType: [[]],
    provider: [[]],
    transactionFees: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    minTransactionFee: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    rollingReserves: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    rollingReservesDays: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    chargebackFees: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    monthlyFees: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    minMonthlyFees: ['', { validators: [Validators.required, Validators.pattern('^[0-9.]+$')], updateOn: 'change' }]
  });

  get defaultSchemeFlag(): string {
    return this.defaultSchemeName;
  }

  get targetValueParams(): TargetParams {
    const val = this.schemeForm.get('target')?.value;
    const params = new TargetParams();
    switch (val) {
      case SettingsFeeTargetFilterType.None: {
        params.title = '';
        params.inputPlaceholder = '';
        params.dataList = [];
        this.targetEntity = '';
        break;
      }
      case SettingsFeeTargetFilterType.WidgetId: {
        params.title = 'List of widgets *';
        params.inputPlaceholder = 'New widget (Name, code or ID)...';
        params.dataList = [];
        this.targetEntity = 'widget identifier';
        break;
      }
      case SettingsFeeTargetFilterType.Country: {
        params.title = 'List of countries *';
        params.inputPlaceholder = 'New country...';
        params.dataList = CountryFilterList;
        this.targetEntity = 'country';
        break;
      }
      case SettingsFeeTargetFilterType.AccountId: {
        params.title = 'List of accounts *';
        params.inputPlaceholder = 'Type account email...';
        params.dataList = [];
        this.targetEntity = 'account identifier';
        break;
      }
      case SettingsFeeTargetFilterType.AccountType: {
        params.title = 'List of account types *';
        params.inputPlaceholder = 'New account type...';
        params.dataList = AccountTypeFilterList;
        this.targetEntity = 'account type';
        break;
      }
      case SettingsFeeTargetFilterType.InitiateFrom: {
        params.title = 'List of sources *';
        params.inputPlaceholder = 'New source...';
        params.dataList = TransactionSourceFilterList;
        this.targetEntity = 'source';
        break;
      }
    }
    return params;
  }

  constructor(
    private formBuilder: FormBuilder,
    private adminDataService: AdminDataService,
    private errorHandler: ErrorService,
    private layoutService: LayoutService
  ) {
  }

  ngOnInit(): void {
    this.filteredTargetValues$ = of(this.filterTargetValues(''));
    this.subscriptions.add(
      this.schemeForm.get('target')?.valueChanges.subscribe(val => this.updateTarget(val))
    );
    this.subscriptions.add(
      this.schemeForm.get('instrument')?.valueChanges.subscribe(val => this.updateInstrument(val))
    );
    this.getPaymentProviders();
    this.loadCostSchemeList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  private updateInstrument(val: any): void {
    this.schemeForm.get('provider')?.setValue(undefined);
    this.filterPaymentProviders([val]);
  }

  private updateTarget(val: any): void {
    this.clearTargetValues();
    this.setTargetValidator();
    if (this.targetType === SettingsFeeTargetFilterType.WidgetId ||
      this.targetType === SettingsFeeTargetFilterType.AccountId) {
      this.targetSearchString$.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        debounceTime(1000),
        switchMap(searchString => this.getFilteredOptions(searchString))
      ).subscribe(options => {
        this.filteredTargetValues$ = of(options);
      });
    } else {
      this.filteredTargetValues$ = this.schemeForm.get('targetValue')?.valueChanges.pipe(
        startWith(''),
        map(value => this.filterTargetValues(value))
      );
    }
  }

  private getFilteredOptions(searchString: string): Observable<CommonTargetValue[]> {
    if (searchString) {
      if (this.targetType === SettingsFeeTargetFilterType.AccountId) {
        const accountFilter = new Filter({ search: searchString });
        return this.getFilteredAccounts(accountFilter);
      } else if (this.targetType === SettingsFeeTargetFilterType.WidgetId) {
        const widgetFilter = new Filter({ search: searchString });
        return this.getFilteredWidgets(widgetFilter);
      } else {
        return of([]);
      }
    } else {
      return of([]);
    }
  }

  private getFilteredAccounts(filter: Filter): Observable<CommonTargetValue[]> {
    return this.adminDataService.getUsers([], 0, 100, 'email', false, filter).pipe(
      map(result => {
        return result.list.map(user => {
          return {
            id: user.id,
            title: user.email
          } as CommonTargetValue;
        });
      })
    );
  }

  private getFilteredWidgets(filter: Filter): Observable<CommonTargetValue[]> {
    return this.adminDataService.getWidgets(0, 100, 'widgetId', false, filter).pipe(
      map(result => {
        return result.list.map(widget => {
          return {
            id: widget.id,
            title: widget.name
          } as CommonTargetValue;
        });
      })
    );
  }

  private getPaymentProviders(): void {
    this.providers = [];
    this.subscriptions.add(
      this.adminDataService.getProviders()?.valueChanges.subscribe(({ data }) => {
        const providers = data.getPaymentProviders as PaymentProvider[];
        this.providers = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
        const selectedInstrument = this.schemeForm.get('instrument')?.value;
        this.filterPaymentProviders([selectedInstrument]);
      }, (error) => {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load wallet list');
      })
    );
  }

  private filterPaymentProviders(instruments: PaymentInstrument[]): void {
    this.filteredProviders = getProviderList(instruments, this.providers);
    this.showPaymentProvider = this.filteredProviders.length > 0;
    if (this.providers.length > 0) {
      this.schemeForm.get('provider')?.setValue(getCheckedProviderList(
        this.schemeForm.get('provider')?.value ?? [],
        this.filteredProviders));
    }
  }

  private loadCostSchemeList(): void {
    const listData$ = this.adminDataService.getCostSettings().valueChanges.pipe(take(1));
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
      }, (error) => {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load cost settings');
      })
    );
  }

  private setTargetValidator(): void {
    const val = this.schemeForm.get('target')?.value;
    this.targetType = val ?? SettingsFeeTargetFilterType.None as SettingsFeeTargetFilterType;
    if (this.targetType === SettingsFeeTargetFilterType.None) {
      this.schemeForm.get('targetValues')?.clearValidators();
    } else {
      this.schemeForm.get('targetValues')?.setValidators([Validators.required]);
    }
    this.schemeForm.get('targetValues')?.updateValueAndValidity();
  }

  private filterTargetValues(value: string): CommonTargetValue[] {
    if (this.targetType !== SettingsFeeTargetFilterType.None) {
      let filterValue = '';
      if (value) {
        filterValue = value.toLowerCase();
        return this.targetValueParams.dataList.filter(c => c.title.toLowerCase().includes(filterValue));
      } else {
        return this.targetValueParams.dataList;
      }
    } else {
      return [];
    }
  }

  handleTargetInputChange(event: Event): void {
    if (this.targetType === SettingsFeeTargetFilterType.WidgetId ||
      this.targetType === SettingsFeeTargetFilterType.AccountId) {
      let searchString = event.target ? (event.target as HTMLInputElement).value : '';
      searchString = searchString.toLowerCase().trim();
      this.targetSearchString$.next(searchString);
    }
  }

  private setFormData(scheme: FeeScheme | null): void {
    this.schemeForm.reset();
    this.defaultSchemeName = '';
    this.currency = scheme?.currency ?? '';
    this.settingsId = (scheme !== null) ? scheme?.id : '';
    if (scheme !== null) {
      this.removeIncorrectTargetValues(scheme);
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.schemeForm.get('id')?.setValue(scheme?.id);
      this.schemeForm.get('name')?.setValue(scheme?.name);
      this.schemeForm.get('description')?.setValue(scheme?.description);
      this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
      this.schemeForm.get('target')?.setValue(scheme?.target);
      this.targetType = scheme?.target ?? SettingsFeeTargetFilterType.None;
      if (this.targetType === SettingsFeeTargetFilterType.AccountId) {
        const filter = new Filter({
          users: scheme?.targetValues
        });
        this.subscriptions.add(
          this.getFilteredAccounts(filter).subscribe(result => {
            this.targetValues = result;
            this.schemeForm.get('targetValues')?.setValue(result.map(x => x.title));
          })
        );
        this.updateTarget('');
      } else if (this.targetType === SettingsFeeTargetFilterType.WidgetId) {
        const filter = new Filter({
          widgets: scheme?.targetValues
        });
        this.subscriptions.add(
          this.getFilteredWidgets(filter).subscribe(result => {
            this.targetValues = result;
            this.schemeForm.get('targetValues')?.setValue(result.map(x => x.title));
          })
        );
        this.updateTarget('');
      } else {
        this.schemeForm.get('targetValues')?.setValue(scheme?.targetValues);
      }
      if (scheme.instrument && scheme.instrument.length > 0) {
        const instrument = scheme.instrument[0];
        this.schemeForm.get('instrument')?.setValue(instrument);
        if (instrument === PaymentInstrument.WireTransfer) {
          this.schemeForm.get('provider')?.setValue(scheme?.provider[0]);
        } else {
          this.schemeForm.get('provider')?.setValue(scheme?.provider);
        }
      } else {
        this.schemeForm.get('instrument')?.setValue(undefined);
        this.schemeForm.get('provider')?.setValue([]);
      }
      this.schemeForm.get('userType')?.setValue(scheme?.userType);
      this.schemeForm.get('userMode')?.setValue(scheme?.userMode);
      this.schemeForm.get('trxType')?.setValue(scheme?.trxType);
      this.schemeForm.get('transactionFees')?.setValue(scheme?.terms.transactionFees);
      this.schemeForm.get('minTransactionFee')?.setValue(scheme?.terms.minTransactionFee);
      this.schemeForm.get('rollingReserves')?.setValue(scheme?.terms.rollingReserves);
      this.schemeForm.get('rollingReservesDays')?.setValue(scheme?.terms.rollingReservesDays);
      this.schemeForm.get('chargebackFees')?.setValue(scheme?.terms.chargebackFees);
      this.schemeForm.get('monthlyFees')?.setValue(scheme?.terms.monthlyFees);
      this.schemeForm.get('minMonthlyFees')?.setValue(scheme?.terms.minMonthlyFees);
      const p = this.targetValueParams;
      this.setTargetValidator();
      this.formChanged.emit(false);
    } else {
      this.schemeForm.get('id')?.setValue('');
      this.schemeForm.get('name')?.setValue('');
      this.schemeForm.get('description')?.setValue('');
      this.schemeForm.get('isDefault')?.setValue('');
      this.schemeForm.get('target')?.setValue(SettingsFeeTargetFilterType.None);
      this.schemeForm.get('targetValues')?.setValue([]);
      this.schemeForm.get('instrument')?.setValue(undefined);
      this.schemeForm.get('userType')?.setValue([]);
      this.schemeForm.get('userMode')?.setValue([]);
      this.schemeForm.get('trxType')?.setValue('');
      this.schemeForm.get('provider')?.setValue([]);
      this.schemeForm.get('transactionFees')?.setValue('');
      this.schemeForm.get('minTransactionFee')?.setValue('');
      this.schemeForm.get('rollingReserves')?.setValue('');
      this.schemeForm.get('rollingReservesDays')?.setValue('');
      this.schemeForm.get('chargebackFees')?.setValue('');
      this.schemeForm.get('monthlyFees')?.setValue('');
      this.schemeForm.get('minMonthlyFees')?.setValue('');
      this.setTargetValidator();
    }
  }

  setSchemeData(): FeeScheme {
    const data = new FeeScheme(null);
    // common
    data.name = this.schemeForm.get('name')?.value;
    data.description = this.schemeForm.get('description')?.value;
    data.isDefault = this.schemeForm.get('isDefault')?.value;
    data.id = this.schemeForm.get('id')?.value;
    // target
    if (this.targetType === SettingsFeeTargetFilterType.WidgetId ||
      this.targetType === SettingsFeeTargetFilterType.AccountId) {
      data.setTargetOld(this.schemeForm.get('target')?.value, this.targetValues.map(c => {
        return c.id;
      }));
    } else {
      data.setTargetOld(this.schemeForm.get('target')?.value, this.schemeForm.get('targetValues')?.value);
    }
    const instrument = this.schemeForm.get('instrument')?.value;
    if (instrument) {
      data.instrument = [instrument];
    }
    const transactionTypes = this.schemeForm.get('trxType')?.value as TransactionType[];
    if (transactionTypes) {
      transactionTypes.forEach(x => data.trxType.push(x));
    }
    if (instrument === PaymentInstrument.WireTransfer) {
      const providers = this.schemeForm.get('provider')?.value as string;
      if (providers) {
        data.provider = [ providers ];
      }
    } else {
      const providers = this.schemeForm.get('provider')?.value as string[];
      if (providers) {
        providers.forEach(x => data.provider.push(x));
      }
    }
    const userTypes = this.schemeForm.get('userType')?.value as UserType[];
    if (userTypes) {
      userTypes.forEach(x => data.userType.push(x));
    }
    const userModes = this.schemeForm.get('userMode')?.value as UserMode[];
    if (userModes) {
      userModes.forEach(x => data.userMode.push(x));
    }
    // terms
    data.terms.transactionFees = Number(this.schemeForm.get('transactionFees')?.value);
    data.terms.minTransactionFee = Number(this.schemeForm.get('minTransactionFee')?.value);
    data.terms.rollingReserves = Number(this.schemeForm.get('rollingReserves')?.value);
    data.terms.rollingReservesDays = Number(this.schemeForm.get('rollingReservesDays')?.value);
    data.terms.chargebackFees = Number(this.schemeForm.get('chargebackFees')?.value);
    data.terms.monthlyFees = Number(this.schemeForm.get('monthlyFees')?.value);
    data.terms.minMonthlyFees = Number(this.schemeForm.get('minMonthlyFees')?.value);
    return data;
  }

  private validateField(name: string): boolean {
    let valid = true;
    if (this.schemeForm.get(name)?.touched || this.forceValidate) {
      valid = this.schemeForm.get(name)?.valid as boolean;
    }
    return valid;
  }

  resetInstrument(): void {
    this.schemeForm.get('instrument')?.setValue(undefined);
    this.schemeForm.get('provider')?.setValue([]);
  }

  tabHasError(tab: string): boolean {
    let valid: boolean | undefined = true;
    if (tab === 'tab1') {
      valid = this.validateField('target');
      if (valid) {
        valid = this.validateField('targetValues');
      }
      if (valid) {
        valid = (this.errorMessage === '');
      }
    } else if (tab === 'tab2') {
      valid = this.validateField('transactionFees');
      if (valid) {
        valid = this.validateField('minTransactionFee');
      }
      if (valid) {
        valid = this.validateField('rollingReserves');
      }
      if (valid) {
        valid = this.validateField('rollingReservesDays');
      }
      if (valid) {
        valid = this.validateField('chargebackFees');
      }
      if (valid) {
        valid = this.validateField('monthlyFees');
      }
      if (valid) {
        valid = this.validateField('minMonthlyFees');
      }
    }
    return valid !== true;
  }

  setSelectedTab(index: number): void {
    this.selectedTab = index;
  }

  addTargetValue(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add new target value
    if ((value || '').trim()) {
      const values = this.schemeForm.get('targetValues')?.value;
      values.push(value.trim());
      this.addTarget(value.trim());
      this.schemeForm.get('targetValues')?.setValue(values);
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.schemeForm.get('targetValue')?.setValue(null);
  }

  removeTargetValue(val: string): void {
    const values = this.schemeForm.get('targetValues')?.value;
    const index = values.indexOf(val);
    if (index >= 0) {
      values.splice(index, 1);
      this.removeTarget(val);
      this.schemeForm.get('targetValues')?.setValue(values);
    }
  }

  clearTargetValues(): void {
    this.targetValues = [];
    this.filteredTargetValues$ = of([]);
    this.schemeForm.get('targetValues')?.setValue([]);
  }

  targetItemSelected(event: MatAutocompleteSelectedEvent): void {
    const values = this.schemeForm.get('targetValues')?.value;
    if (!values.includes(event.option.viewValue)) {
      values.push(event.option.viewValue);
      this.addTarget(event.option.viewValue);
      this.schemeForm.get('targetValues')?.setValue(values);
    }
    this.targetValueInput.nativeElement.value = '';
    this.schemeForm.get('targetValue')?.setValue(null);
  }

  onDeleteScheme(): void {
    this.delete.emit(this.settingsId);
  }

  private addTarget(value: string): void {
    this.subscriptions.add(
      this.filteredTargetValues$?.subscribe(val => {
        const valueObject = val.find(x => x.title === value);
        if (valueObject) {
          this.targetValues.push(valueObject);
        }
      })
    );
  }

  private removeTarget(value: string): void {
    const idx = this.targetValues.findIndex(x => x.title === value);
    this.targetValues.splice(idx, 1);
  }

  private removeIncorrectTargetValues(scheme: FeeScheme): void {
    scheme.targetValues = scheme.targetValues.filter(val => {
      let result = true;
      if (scheme.target === SettingsFeeTargetFilterType.Country) {
        const c = getCountry(val);
        result = (c !== null);
      } else if (scheme.target === SettingsFeeTargetFilterType.AccountType) {
        const c = AccountTypeFilterList.find(x => x.title.toLowerCase() === val.toLowerCase());
        result = (c !== undefined);
      }
      return result;
    });
  }

  private validateTargetValues(): boolean {
    let result = true;
    const filter = this.schemeForm.get('target')?.value as SettingsFeeTargetFilterType;
    if (filter === SettingsFeeTargetFilterType.Country) {
      result = (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
        const c = getCountry(x);
        if (c === null) {
          result = false;
          this.errorMessage = `Country ${x} is not found in a list`;
          this.selectedTab = 0;
          return false;
        }
        return true;
      });
    } else if (filter === SettingsFeeTargetFilterType.AccountType) {
      result = (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
        const c = AccountTypeFilterList.find(t => t.title.toLowerCase() === x.toLowerCase());
        if (c === undefined) {
          result = false;
          this.errorMessage = `Account type ${x} is not valid`;
          this.selectedTab = 0;
          return false;
        }
        return true;
      });
    }
    if (result) {
      this.errorMessage = '';
    }
    return result;
  }

  onSubmit(): void {
    this.forceValidate = true;
    if (this.schemeForm.valid && this.validateTargetValues()) {
      this.save.emit(this.setSchemeData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
