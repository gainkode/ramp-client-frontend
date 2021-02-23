import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { FeeSheme, FeeShemes } from '../model/fake-fee-schemes.model';

class TargetParams {
  title: string = '';
  inputPlaceholder: string = '';
  dataList: string[] = [];
}

@Component({
  templateUrl: 'fees.component.html',
  styleUrls: ['admin.scss', 'fees.component.scss']
})
export class FeesComponent {
  private showDetails = false;
  inProgress = false;
  errorMessage = '';
  targetValues: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTargetValues: Observable<string[]> | undefined;

  detailsColumnIndex = 6;
  displayedColumns: string[] = [
    'isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'
  ];

  schemeForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [''],
    instrument: ['', { validators: [Validators.required], updateOn: 'change' }],
    trxType: ['', { validators: [Validators.required], updateOn: 'change' }],
    provider: ['', { validators: [Validators.required], updateOn: 'change' }],
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
  schemes = FeeShemes;
  affiliateIds: string[] = ['fb4598gbf38d73', 'ce98g6g7fb80g4', 'ee3f78f4358g74', 'abab90ag59bedb'];
  accountIds: string[] = ['37d83fbg8954bf', '4g08bf7g6g89ec', '47g8534f87f3ee', 'bdeb95gaabab90'];
  accountTypes: string[] = ['Personal', 'Merchant'];
  widgets: string[] = ['Widget A', 'Widget B', 'Widget C', 'Widget D'];
  checkouts: string[] = ['Checkout 001', 'Checkout 002', 'Checkout 003', 'Checkout 004'];
  wallets: string[] = ['Wallet 001', 'Wallet 002', 'Wallet 003', 'Wallet 004'];
  countrues: string[] = ['America', 'Mordor'];
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
        params.dataList = this.countrues;
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
        params.title = 'List widgets';
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
    private formBuilder: FormBuilder, private router: Router) {
  }

  ngOnInit(): void {
    this.filteredTargetValues = this.schemeForm.get('targetValues')?.valueChanges.pipe(
      startWith(''),
      map(value => this.filterTargetValues(value)));
  }

  private filterTargetValues(value: string): string[] {
    let filterValue = '';
    if (value) {
      filterValue = value.toLowerCase();
      return this.targetValueParams.dataList.filter(c => c.toLowerCase().includes(filterValue));
    } else {
      return this.targetValueParams.dataList;
    }
  }

  setFormData(scheme: FeeSheme | null): void {
    if (scheme !== null) {
      this.schemeForm.setControl('name', new FormControl({
        value: scheme?.name,
        disabled: scheme.isDefault
      },
        { validators: [Validators.required], updateOn: 'change' }
      ));
      this.schemeForm.get('target')?.setValue(scheme?.target);
      this.schemeForm.get('instrument')?.setValue(scheme?.instrument);
      this.schemeForm.get('trxType')?.setValue(scheme?.trxType);
      this.schemeForm.get('provider')?.setValue(scheme?.provider);
      this.schemeForm.get('transactionFees')?.setValue(scheme?.transactionFees);
      this.schemeForm.get('minTransactionFee')?.setValue(scheme?.minTransactionFee);
      this.schemeForm.get('rollingReserves')?.setValue(scheme?.rollingReserves);
      this.schemeForm.get('rollingReservesDays')?.setValue(scheme?.rollingReservesDays);
      this.schemeForm.get('chargebackFees')?.setValue(scheme?.chargebackFees);
      this.schemeForm.get('monthlyFees')?.setValue(scheme?.monthlyFees);
      this.schemeForm.get('minMonthlyFees')?.setValue(scheme?.minMonthlyFees);
      this.schemeForm.get('beneficiaryName')?.setValue(scheme?.beneficiaryName);
      this.schemeForm.get('beneficiaryAddress')?.setValue(scheme?.beneficiaryAddress);
      this.schemeForm.get('iban')?.setValue(scheme?.iban);
      this.schemeForm.get('bankName')?.setValue(scheme?.bankName);
      this.schemeForm.get('bankAddress')?.setValue(scheme?.bankAddress);
      this.schemeForm.get('swift')?.setValue(scheme?.swift);
    }
  }

  toggleDetails(scheme: FeeSheme): void {
    this.showDetails = !this.showDetails;
    if (this.showDetails) {
      this.displayedColumns.splice(this.detailsColumnIndex, 1);
      this.setFormData(scheme);
    } else {
      this.displayedColumns.push('details');
    }
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

  targetItemSelected(event: MatAutocompleteSelectedEvent): void {
    this.targetValues.push(event.option.viewValue);
    this.targetValueInput.nativeElement.value = '';
    this.schemeForm.get('targetValues')?.setValue(null);
  }

  onSubmit(): void {

  }
}
