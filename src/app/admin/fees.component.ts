import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminDataService } from '../services/admin-data.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  TargetParams, CommonTargetValue, FeeScheme, TargetFilterList,
  PaymentInstrumentList, PaymentProviderList, TransactionTypeList,
  AccountTypeFilterList, CountryFilterList
} from '../model/fee-scheme.model';
import {
  SettingsFeeListResult, FeeSettingsTargetFilterType,
  PaymentInstrument, PaymentProvider, TransactionType
} from '../model/generated-models';
import { Subscription } from 'apollo-angular/subscription';

@Component({
  templateUrl: 'fees.component.html',
  styleUrls: ['admin.scss', 'fees.component.scss']
})
export class FeesComponent implements OnInit {
  private showDetails = false;
  private defaultSchemeName = '';
  private settingsSubscription!: any;
  inProgress = false;
  errorMessage = '';
  selectedTab = 0;
  schemes: FeeScheme[] = [];
  targetValues: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

  detailsColumnIndex = 6;
  displayedColumns: string[] = ['isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'];
  targets = TargetFilterList;
  transactionTypes = TransactionTypeList;
  instruments = PaymentInstrumentList;
  providers = PaymentProviderList;

  schemeForm = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: ['', { validators: [Validators.required], updateOn: 'change' }],
    isDefault: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [''],
    instrument: [[], { validators: [Validators.required], updateOn: 'change' }],
    trxType: [[], { validators: [Validators.required], updateOn: 'change' }],
    provider: [[], { validators: [Validators.required], updateOn: 'change' }],
    transactionFees: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
    minTransactionFee: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(1000)], updateOn: 'change' }],
    rollingReserves: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(10000)], updateOn: 'change' }],
    rollingReservesDays: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(365)], updateOn: 'change' }],
    chargebackFees: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
    monthlyFees: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
    minMonthlyFees: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
    beneficiaryName: ['', { validators: [Validators.required], updateOn: 'change' }],
    beneficiaryAddress: ['', { validators: [Validators.required], updateOn: 'change' }],
    iban: ['', { validators: [Validators.required], updateOn: 'change' }],
    bankName: ['', { validators: [Validators.required], updateOn: 'change' }],
    bankAddress: ['', { validators: [Validators.required], updateOn: 'change' }],
    swift: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  // temp
  affiliateIds: CommonTargetValue[] = [
    { title: 'fb4598gbf38d73', imgClass: '', imgSource: '' },
    { title: 'ce98g6g7fb80g4', imgClass: '', imgSource: '' },
    { title: 'ee3f78f4358g74', imgClass: '', imgSource: '' },
    { title: 'abab90ag59bedb', imgClass: '', imgSource: '' }
  ];
  accountIds: CommonTargetValue[] = [
    { title: '37d83fbg8954bf', imgClass: '', imgSource: '' },
    { title: '4g08bf7g6g89ec', imgClass: '', imgSource: '' },
    { title: '47g8534f87f3ee', imgClass: '', imgSource: '' },
    { title: 'bdeb95gaabab90', imgClass: '', imgSource: '' }
  ];
  widgets: CommonTargetValue[] = [
    { title: 'Widget A', imgClass: '', imgSource: '' },
    { title: 'Widget B', imgClass: '', imgSource: '' },
    { title: 'Widget C', imgClass: '', imgSource: '' },
    { title: 'Widget D', imgClass: '', imgSource: '' }
  ];
  // temp

  get showDetailed(): boolean {
    return this.showDetails;
  }

  get defaultSchemeFlag(): string {
    return this.defaultSchemeName;
  }

  get targetValueParams(): TargetParams {
    const val = this.schemeForm.get('target')?.value;
    let params = new TargetParams();
    switch (val) {
      case FeeSettingsTargetFilterType.AffiliateId: {
        params.title = 'List of affiliate identifiers';
        params.inputPlaceholder = 'New identifier...';
        params.dataList = this.affiliateIds;
        break;
      }
      case FeeSettingsTargetFilterType.Country: {
        params.title = 'List of countries';
        params.inputPlaceholder = 'New country...';
        params.dataList = CountryFilterList;
        break;
      }
      case FeeSettingsTargetFilterType.AccountId: {
        params.title = 'List of account identifiers';
        params.inputPlaceholder = 'New identifier...';
        params.dataList = this.accountIds;
        break;
      }
      case FeeSettingsTargetFilterType.AccountType: {
        params.title = 'List of account types';
        params.inputPlaceholder = 'New account type...';
        params.dataList = AccountTypeFilterList;
        break;
      }
      case FeeSettingsTargetFilterType.InitiateFrom: {
        params.title = 'List of widgets';
        params.inputPlaceholder = 'New widget...';
        params.dataList = this.widgets;
        break;
      }
    }
    return params;
  }

  @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private formBuilder: FormBuilder, private router: Router) {
  }

  ngOnInit(): void {
    // Load settings table
    this.inProgress = true;
    this.settingsSubscription = this.adminService.getFeeSettings().valueChanges.subscribe(({ data }) => {
      this.inProgress = false;
      const settings = data.getSettingsFee as SettingsFeeListResult;
      let itemCount = 0;
      if (settings !== null) {
        itemCount = settings?.count as number;
        if (itemCount > 0) {
          this.schemes = settings?.list?.map((val) => new FeeScheme(val)) as FeeScheme[];
        }
      }
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load fee settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
    // field events
    this.schemeForm.get('target')?.valueChanges.subscribe(val => {
      this.clearTargetValues();
      this.filteredTargetValues = this.schemeForm.get('targetValues')?.valueChanges.pipe(
        startWith(''),
        map(value => this.filterTargetValues(value)));
    });
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

  private filterTargetValues(value: string): CommonTargetValue[] {
    let filterValue = '';
    if (value) {
      filterValue = value.toLowerCase();
      return this.targetValueParams.dataList.filter(c => c.title.toLowerCase().includes(filterValue));
    } else {
      return this.targetValueParams.dataList;
    }
  }

  setFormData(scheme: FeeScheme | null): void {
    if (scheme !== null) {
      this.schemeForm.get('id')?.setValue(scheme?.id);
      this.schemeForm.get('name')?.setValue(scheme?.name);
      this.schemeForm.get('description')?.setValue(scheme?.description);
      this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
      this.schemeForm.get('target')?.setValue(scheme?.target);
      this.schemeForm.get('instrument')?.setValue(scheme.instrument);
      this.schemeForm.get('trxType')?.setValue(scheme?.trxType);
      this.schemeForm.get('provider')?.setValue(scheme?.provider);
      this.schemeForm.get('transactionFees')?.setValue(scheme?.terms.transactionFees);
      this.schemeForm.get('minTransactionFee')?.setValue(scheme?.terms.minTransactionFee);
      this.schemeForm.get('rollingReserves')?.setValue(scheme?.terms.rollingReserves);
      this.schemeForm.get('rollingReservesDays')?.setValue(scheme?.terms.rollingReservesDays);
      this.schemeForm.get('chargebackFees')?.setValue(scheme?.terms.chargebackFees);
      this.schemeForm.get('monthlyFees')?.setValue(scheme?.terms.monthlyFees);
      this.schemeForm.get('minMonthlyFees')?.setValue(scheme?.terms.minMonthlyFees);
      this.schemeForm.get('beneficiaryName')?.setValue(scheme?.details.beneficiaryName);
      this.schemeForm.get('beneficiaryAddress')?.setValue(scheme?.details.beneficiaryAddress);
      this.schemeForm.get('iban')?.setValue(scheme?.details.iban);
      this.schemeForm.get('bankName')?.setValue(scheme?.details.bankName);
      this.schemeForm.get('bankAddress')?.setValue(scheme?.details.bankAddress);
      this.schemeForm.get('swift')?.setValue(scheme?.details.swift);
      scheme?.targetValues.forEach(x => this.targetValues.push(x));
    }
  }

  setSchemeData(): FeeScheme {
    let data = new FeeScheme(null);
    // common
    data.name = this.schemeForm.get('name')?.value;
    data.description = this.schemeForm.get('description')?.value;
    data.isDefault = this.schemeForm.get('isDefault')?.value;
    data.id = this.schemeForm.get('id')?.value;
    // target
    data.setTarget(this.schemeForm.get('target')?.value, this.targetValues);
    (this.schemeForm.get('instrument')?.value as PaymentInstrument[]).forEach(x => data.instrument.push(x));
    (this.schemeForm.get('trxType')?.value as TransactionType[]).forEach(x => data.trxType.push(x));
    (this.schemeForm.get('provider')?.value as PaymentProvider[]).forEach(x => data.provider.push(x));
    // terms
    data.terms.transactionFees = this.schemeForm.get('transactionFees')?.value;
    data.terms.minTransactionFee = this.schemeForm.get('minTransactionFee')?.value;
    data.terms.rollingReserves = this.schemeForm.get('rollingReserves')?.value;
    data.terms.rollingReservesDays = this.schemeForm.get('rollingReservesDays')?.value;
    data.terms.chargebackFees = this.schemeForm.get('chargebackFees')?.value;
    data.terms.monthlyFees = this.schemeForm.get('monthlyFees')?.value;
    data.terms.minMonthlyFees = this.schemeForm.get('minMonthlyFees')?.value;
    // wire details
    data.details.beneficiaryName = this.schemeForm.get('beneficiaryName')?.value;
    data.details.beneficiaryAddress = this.schemeForm.get('beneficiaryAddress')?.value;
    data.details.iban = this.schemeForm.get('iban')?.value;
    data.details.bankName = this.schemeForm.get('bankName')?.value;
    data.details.bankAddress = this.schemeForm.get('bankAddress')?.value;
    data.details.swift = this.schemeForm.get('swift')?.value;
    return data;
  }

  private validateField(name: string): boolean {
    let valid = true;
    if (this.schemeForm.get(name)?.touched) {
      valid = this.schemeForm.get(name)?.valid as boolean;
    }
    return valid;
  }

  tabHasError(tab: string): boolean {
    let valid: boolean | undefined = true;
    if (tab == 'tab1') {
      valid = this.validateField('target');
      if (valid) valid = this.validateField('targetValues');
      if (valid) valid = this.validateField('instrument');
      if (valid) valid = this.validateField('trxType');
      if (valid) valid = this.validateField('provider');
    } else if (tab == 'tab2') {
      valid = this.validateField('transactionFees');
      if (valid) valid = this.validateField('minTransactionFee');
      if (valid) valid = this.validateField('rollingReserves');
      if (valid) valid = this.validateField('rollingReservesDays');
      if (valid) valid = this.validateField('chargebackFees');
      if (valid) valid = this.validateField('monthlyFees');
      if (valid) valid = this.validateField('minMonthlyFees');
    } else if (tab == 'tab3') {
      valid = this.validateField('beneficiaryName');
      if (valid) valid = this.validateField('beneficiaryAddress');
      if (valid) valid = this.validateField('iban');
      if (valid) valid = this.validateField('bankName');
      if (valid) valid = this.validateField('bankAddress');
      if (valid) valid = this.validateField('swift');
    }
    return valid !== true;
  }

  toggleDetails(scheme: FeeScheme): void {
    this.showDetails = !this.showDetails;
    if (this.showDetails) {
      this.displayedColumns.splice(this.detailsColumnIndex, 1);
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.setFormData(scheme);
    } else {
      this.displayedColumns.push('details');
    }
  }

  setSelectedTab(index: number): void {
    this.selectedTab = index;
  }

  addTargetValue(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add new target value
    if ((value || '').trim()) {
      this.targetValues.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.schemeForm.get('targetValues')?.setValue(null);
  }

  removeTargetValue(val: string) {
    const index = this.targetValues.indexOf(val);
    if (index >= 0) {
      this.targetValues.splice(index, 1);
    }
  }

  clearTargetValues() {
    this.targetValues.splice(0, this.targetValues.length);
  }

  targetItemSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.targetValues.includes(event.option.viewValue)) {
      this.targetValues.push(event.option.viewValue);
    }
    this.targetValueInput.nativeElement.value = '';
    this.schemeForm.get('targetValues')?.setValue(null);
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.schemeForm.valid) {
      this.inProgress = true;
      const scheme = this.setSchemeData();
      this.adminService.saveFeeSettings(scheme, false).subscribe(({ data }) => {
        this.inProgress = false;
        this.toggleDetails(scheme);
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to save fee settings');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    } else {
      console.log('invalid data');
    }
  }
}
