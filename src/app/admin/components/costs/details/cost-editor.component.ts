import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { CostScheme, PspFilterList } from '../../../../model/cost-scheme.model';
import {
  SettingsCostTargetFilterType, PaymentInstrument, PaymentProvider, TransactionType, WireTransferBankAccount, WireTransferBankAccountListResult
} from '../../../../model/generated-models';
import {
  PaymentInstrumentList,
  TransactionTypeList,
  CostTargetFilterList,
  PaymentProviderView
} from 'src/app/model/payment.model';
import { CommonTargetValue, TargetParams } from 'src/app/model/common.model';
import { CountryFilterList, getCountry } from 'src/app/model/country-code.model';
import { ErrorService } from 'src/app/services/error.service';
import { AdminDataService } from '../../../services/admin-data.service';

@Component({
  selector: 'app-cost-editor',
  templateUrl: 'cost-editor.component.html',
  styleUrls: ['cost-editor.component.scss']
})
export class CostEditorComponent implements OnInit, OnDestroy {
  @Input()
  set currentScheme(scheme: CostScheme | null) {
    this.forceValidate = false;
    this.setFormData(scheme);
    this.settingsId = (scheme !== null) ? scheme?.id : '';
  }

  @Input() create = false;
  @Output() save = new EventEmitter<CostScheme>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();
  @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  private defaultSchemeName = '';
  private settingsId = '';
  private forceValidate = false;
  private loadingData = false;
  private subscriptions: Subscription = new Subscription();
  selectedTab = 0;
  errorMessage = '';
  targetEntity = '';
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

  targets = CostTargetFilterList;
  transactionTypes = TransactionTypeList;
  instruments = PaymentInstrumentList;
  providers: PaymentProviderView[] = [];
  bankAccounts: CommonTargetValue[] = [];

  schemeForm = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    bankAccounts: [[], { validators: [Validators.required], updateOn: 'change' }],
    isDefault: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
    targetValue: [''],
    instrument: [[], { validators: [Validators.required], updateOn: 'change' }],
    trxType: [[], { validators: [Validators.required], updateOn: 'change' }],
    provider: [[], { validators: [Validators.required], updateOn: 'change' }],
    mdr: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }],
    transactionCost: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }],
    rollingReserves: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }],
    rollingReservesDays: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }],
    chargebackCost: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }],
    monthlyCost: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }],
    minMonthlyCost: [
      '', {
        validators: [
          Validators.required, Validators.pattern('^[0-9.]+$')
        ], updateOn: 'change'
      }]
  });

  get defaultSchemeFlag(): string {
    return this.defaultSchemeName;
  }

  get targetValueParams(): TargetParams {
    const val = this.schemeForm.get('target')?.value;
    const params = new TargetParams();
    switch (val) {
      case SettingsCostTargetFilterType.None: {
        params.title = '';
        params.inputPlaceholder = '';
        params.dataList = [];
        this.targetEntity = '';
        break;
      }
      case SettingsCostTargetFilterType.Psp: {
        params.title = 'List of PSP *';
        params.inputPlaceholder = 'New PSP...';
        params.dataList = PspFilterList;
        this.targetEntity = 'PSP value';
        break;
      }
      case SettingsCostTargetFilterType.Country: {
        params.title = 'List of countries *';
        params.inputPlaceholder = 'New country...';
        params.dataList = CountryFilterList;
        this.targetEntity = 'country';
        break;
      }
    }
    return params;
  }

  constructor(
    private formBuilder: FormBuilder,
    private dataService: AdminDataService,
    private errorHandler: ErrorService) {
  }

  ngOnInit(): void {
    this.filteredTargetValues = of(this.filterTargetValues(''));
    this.subscriptions.add(
      this.schemeForm.valueChanges.subscribe({
        next: (result: any) => {
          if (!this.create && !this.loadingData) {
            this.formChanged.emit(true);
          }
        }
      })
    );
    this.subscriptions.add(
      this.schemeForm.get('target')?.valueChanges.subscribe(val => {
        this.clearTargetValues();
        this.setTargetValidator();
        this.filteredTargetValues = this.schemeForm.get('targetValue')?.valueChanges.pipe(startWith(''),
          map(value => this.filterTargetValues(value)));
      })
    );
    this.getPaymentProviders();
    this.getWiteTransferAccounts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getPaymentProviders(): void {
    this.providers = [];
    const data$ = this.dataService.getProviders()?.valueChanges;
    this.subscriptions.add(
      data$.subscribe(({ data }) => {
        const providers = data.getPaymentProviders as PaymentProvider[];
        this.providers = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
      }, (error) => {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load wallet list');
      })
    );
  }

  private getWiteTransferAccounts(): void {
    this.bankAccounts = [];
    const data$ = this.dataService.getWireTransferBankAccounts()?.valueChanges;
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
      }, (error) => {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load wallet list');
      })
    );
  }

  private setTargetValidator(): void {
    const val = this.schemeForm.get('target')?.value;
    if (val === SettingsCostTargetFilterType.None) {
      this.schemeForm.get('targetValues')?.clearValidators();
    } else {
      this.schemeForm.get('targetValues')?.setValidators([Validators.required]);
    }
    this.schemeForm.get('targetValues')?.updateValueAndValidity();
  }

  private filterTargetValues(value: string): CommonTargetValue[] {
    if (this.targetEntity !== '') {
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

  setFormData(scheme: CostScheme | null): void {
    this.schemeForm.reset();
    this.defaultSchemeName = '';
    if (scheme !== null) {
      this.loadingData = true;
      this.removeIncorrectTargetValues(scheme);
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.schemeForm.get('id')?.setValue(scheme?.id);
      this.schemeForm.get('name')?.setValue(scheme?.name);
      this.schemeForm.get('description')?.setValue(scheme?.description);
      this.schemeForm.get('bankAccounts')?.setValue(scheme?.bankAccountIds);
      this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
      this.schemeForm.get('target')?.setValue(scheme?.target);
      this.schemeForm.get('targetValues')?.setValue(scheme?.targetValues);
      this.schemeForm.get('instrument')?.setValue(scheme.instrument);
      this.schemeForm.get('trxType')?.setValue(scheme?.trxType);
      this.schemeForm.get('provider')?.setValue(scheme?.provider);
      this.schemeForm.get('mdr')?.setValue(scheme?.terms.mdr);
      this.schemeForm.get('transactionCost')?.setValue(scheme?.terms.transactionCost);
      this.schemeForm.get('rollingReserves')?.setValue(scheme?.terms.rollingReserves);
      this.schemeForm.get('rollingReservesDays')?.setValue(scheme?.terms.rollingReservesDays);
      this.schemeForm.get('chargebackCost')?.setValue(scheme?.terms.chargebackCost);
      this.schemeForm.get('monthlyCost')?.setValue(scheme?.terms.monthlyCost);
      this.schemeForm.get('minMonthlyCost')?.setValue(scheme?.terms.minMonthlyCost);
      const p = this.targetValueParams;
      this.setTargetValidator();
      this.loadingData = false;
      this.formChanged.emit(false);
    } else {
      this.schemeForm.get('id')?.setValue('');
      this.schemeForm.get('name')?.setValue('');
      this.schemeForm.get('description')?.setValue('');
      this.schemeForm.get('bankAccounts')?.setValue([]);
      this.schemeForm.get('isDefault')?.setValue('');
      this.schemeForm.get('target')?.setValue(SettingsCostTargetFilterType.None);
      this.schemeForm.get('targetValues')?.setValue([]);
      this.schemeForm.get('instrument')?.setValue('');
      this.schemeForm.get('trxType')?.setValue('');
      this.schemeForm.get('provider')?.setValue('');
      this.schemeForm.get('mdr')?.setValue('');
      this.schemeForm.get('transactionCost')?.setValue('');
      this.schemeForm.get('rollingReserves')?.setValue('');
      this.schemeForm.get('rollingReservesDays')?.setValue('');
      this.schemeForm.get('chargebackCost')?.setValue('');
      this.schemeForm.get('monthlyCost')?.setValue('');
      this.schemeForm.get('minMonthlyCost')?.setValue('');
      this.setTargetValidator();
    }
  }

  setSchemeData(): CostScheme {
    const data = new CostScheme(null);
    // common
    data.name = this.schemeForm.get('name')?.value;
    data.description = this.schemeForm.get('description')?.value;
    data.isDefault = this.schemeForm.get('isDefault')?.value;
    data.id = this.schemeForm.get('id')?.value;
    data.bankAccountIds = this.schemeForm.get('bankAccounts')?.value;
    // target
    data.setTarget(this.schemeForm.get('target')?.value, this.schemeForm.get('targetValues')?.value);
    (this.schemeForm.get('instrument')?.value as PaymentInstrument[]).forEach(x => data.instrument.push(x));
    (this.schemeForm.get('trxType')?.value as TransactionType[]).forEach(x => data.trxType.push(x));
    (this.schemeForm.get('provider')?.value as string[]).forEach(x => data.provider.push(x));
    // terms
    data.terms.mdr = Number(this.schemeForm.get('mdr')?.value);
    data.terms.transactionCost = Number(this.schemeForm.get('transactionCost')?.value);
    data.terms.rollingReserves = Number(this.schemeForm.get('rollingReserves')?.value);
    data.terms.rollingReservesDays = Number(this.schemeForm.get('rollingReservesDays')?.value);
    data.terms.chargebackCost = Number(this.schemeForm.get('chargebackCost')?.value);
    data.terms.monthlyCost = Number(this.schemeForm.get('monthlyCost')?.value);
    data.terms.minMonthlyCost = Number(this.schemeForm.get('minMonthlyCost')?.value);
    return data;
  }

  private validateField(name: string): boolean {
    let valid = true;
    if (this.schemeForm.get(name)?.touched || this.forceValidate) {
      valid = this.schemeForm.get(name)?.valid as boolean;
    }
    return valid;
  }

  tabHasError(tab: string): boolean {
    let valid: boolean | undefined = true;
    if (tab === 'tab1') {
      valid = this.validateField('target');
      if (valid) {
        valid = this.validateField('targetValues');
      }
      if (valid) {
        valid = this.validateField('instrument');
      }
      if (valid) {
        valid = this.validateField('trxType');
      }
      if (valid) {
        valid = this.validateField('provider');
      }
      if (valid) {
        valid = (this.errorMessage === '');
      }
    } else if (tab === 'tab2') {
      valid = this.validateField('transactionCost');
      if (valid) {
        valid = this.validateField('mdr');
      }
      if (valid) {
        valid = this.validateField('rollingReserves');
      }
      if (valid) {
        valid = this.validateField('rollingReservesDays');
      }
      if (valid) {
        valid = this.validateField('chargebackCost');
      }
      if (valid) {
        valid = this.validateField('monthlyCost');
      }
      if (valid) {
        valid = this.validateField('minMonthlyCost');
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
      this.schemeForm.get('targetValues')
        ?.setValue(values);
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.schemeForm.get('targetValue')
      ?.setValue(null);
  }

  removeTargetValue(val: string): void {
    const values = this.schemeForm.get('targetValues')?.value;
    const index = values.indexOf(val);
    if (index >= 0) {
      values.splice(index, 1);
      this.schemeForm.get('targetValues')
        ?.setValue(values);
    }
  }

  clearTargetValues(): void {
    this.schemeForm.get('targetValues')
      ?.setValue([]);
  }

  targetItemSelected(event: MatAutocompleteSelectedEvent): void {
    const values = this.schemeForm.get('targetValues')?.value;
    if (!values.includes(event.option.viewValue)) {
      values.push(event.option.viewValue);
      this.schemeForm.get('targetValues')
        ?.setValue(values);
    }
    this.targetValueInput.nativeElement.value = '';
    this.schemeForm.get('targetValue')
      ?.setValue(null);
  }

  onDeleteScheme(): void {
    this.delete.emit(this.settingsId);
  }

  private removeIncorrectTargetValues(scheme: CostScheme): void {
    scheme.targetValues = scheme.targetValues.filter(val => {
      let result = true;
      if (scheme.target === SettingsCostTargetFilterType.Country) {
        const c = getCountry(val);
        result = (c !== null);
      }
      return result;
    });
  }

  private validateTargetValues(): boolean {
    let result = true;
    const filter = this.schemeForm.get('target')?.value as SettingsCostTargetFilterType;
    if (filter === SettingsCostTargetFilterType.Country) {
      (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
        const c = getCountry(x);
        if (c === null) {
          result = false;
          this.errorMessage = `Country ${x} is not found in a list`;
          this.selectedTab = 0;
          return false;
        }
        return true;
      });
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
