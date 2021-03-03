import { Component, ElementRef, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminDataService } from '../services/admin-data.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { TargetParams, CommonTargetValue, FeeScheme,
  PaymentInstrumentList, PaymentProviderList, TransactionTypeList } from '../model/fee-scheme.model';
import { CountryCodes } from '../model/country-code.model';
import { SettingsFeeListResult } from '../model/generated-models';

@Component({
  templateUrl: 'fees.component.html',
  styleUrls: ['admin.scss', 'fees.component.scss']
})
export class FeesComponent {
  private showDetails = false;
  inProgress = false;
  errorMessage = '';
  selectedTab = 0;
  tab2HasError = false;
  tab3HasError = false;
  schemes: FeeScheme[] = [];
  targetValues: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

  detailsColumnIndex = 6;
  displayedColumns: string[] = ['isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'];
  targets: string[] = [
    'AffiliateId',
    'Country',
    'AccountId',
    'AccountType',
    'Initiate from widget',
    'Initiate from checkout',
    'Initiate from wallet'
  ];
  transactionTypes = TransactionTypeList;
  instruments = PaymentInstrumentList;
  providers = PaymentProviderList;

  countries: CommonTargetValue[] = CountryCodes.map(c => {
    let item = new CommonTargetValue();
    item.imgClass = "country-flag";
    item.imgSource = `assets/svg-country-flags/${c.code2.toLowerCase()}.svg`;
    item.title = c.name;
    return item;
  });
  
  schemeForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
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
  accountTypes: CommonTargetValue[] = [
    { title: 'Personal', imgClass: '', imgSource: '' },
    { title: 'Merchant', imgClass: '', imgSource: '' }
  ];
  widgets: CommonTargetValue[] = [
    { title: 'Widget A', imgClass: '', imgSource: '' },
    { title: 'Widget B', imgClass: '', imgSource: '' },
    { title: 'Widget C', imgClass: '', imgSource: '' },
    { title: 'Widget D', imgClass: '', imgSource: '' }
  ];
  checkouts: CommonTargetValue[] = [
    { title: 'Checkout 001', imgClass: '', imgSource: '' },
    { title: 'Checkout 002', imgClass: '', imgSource: '' },
    { title: 'Checkout 003', imgClass: '', imgSource: '' },
    { title: 'Checkout 004', imgClass: '', imgSource: '' }
  ];
  wallets: CommonTargetValue[] = [
    { title: 'Wallet 001', imgClass: '', imgSource: '' },
    { title: 'Wallet 002', imgClass: '', imgSource: '' },
    { title: 'Wallet 003', imgClass: '', imgSource: '' },
    { title: 'Wallet 004', imgClass: '', imgSource: '' }
  ];
  // temp

  get showDetailed(): boolean {
    return this.showDetails;
  }

  get targetValueParams(): TargetParams {
    const val = this.schemeForm.get('target')?.value;
    let params = new TargetParams();
    switch (val) {
      case 'AffiliateId': {
        params.title = 'List of affiliate identifiers';
        params.inputPlaceholder = 'New identifier...';
        params.dataList = this.affiliateIds;
        break;
      }
      case 'Country': {
        params.title = 'List of countries';
        params.inputPlaceholder = 'New country...';
        params.dataList = this.countries;
        break;
      }
      case 'AccountId': {
        params.title = 'List of account identifiers';
        params.inputPlaceholder = 'New identifier...';
        params.dataList = this.accountIds;
        break;
      }
      case 'AccountType': {
        params.title = 'List of account types';
        params.inputPlaceholder = 'New account type...';
        params.dataList = this.accountTypes;
        break;
      }
      case 'Initiate from widget': {
        params.title = 'List of widgets';
        params.inputPlaceholder = 'New widget...';
        params.dataList = this.widgets;
        break;
      }
      case 'Initiate from checkout': {
        params.title = 'List of checkout items';
        params.inputPlaceholder = 'New item...';
        params.dataList = this.checkouts;
        break;
      }
      case 'Initiate from wallet': {
        params.title = 'List of wallets';
        params.inputPlaceholder = 'New wallet...';
        params.dataList = this.wallets;
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
    this.adminService.getFeeSettings().subscribe(({ data }) => {
      this.inProgress = false;
      const settings = data.getSettingsFee as SettingsFeeListResult;
      let settingsCount = 0;
      if (settings !== null) {
        settingsCount = settings?.count as number;
        if (settingsCount > 0) {
          this.schemes = settings?.list?.map((val) => new FeeScheme(val)) as FeeScheme[];
        }
      }
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(
          error.message,
          'Unable to load fee settings');
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
      this.schemeForm.setControl('name', new FormControl({
        value: scheme?.name,
        disabled: scheme.isDefault
      },
        { validators: [Validators.required], updateOn: 'change' }
      ));
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
    }
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
    this.targetValues.push(event.option.viewValue);
    this.targetValueInput.nativeElement.value = '';
    this.schemeForm.get('targetValues')?.setValue(null);
  }

  onSubmit(): void {
    let data = new FeeScheme(null);
    data.terms.transactionFees = this.schemeForm.get('transactionFees')?.value;
    data.terms.minTransactionFee = this.schemeForm.get('minTransactionFee')?.value;
    data.terms.rollingReserves = this.schemeForm.get('rollingReserves')?.value;
    data.terms.rollingReservesDays = this.schemeForm.get('rollingReservesDays')?.value;
    data.terms.chargebackFees = this.schemeForm.get('chargebackFees')?.value;
    data.terms.monthlyFees = this.schemeForm.get('monthlyFees')?.value;
    data.terms.minMonthlyFees = this.schemeForm.get('minMonthlyFees')?.value;
  }
}
