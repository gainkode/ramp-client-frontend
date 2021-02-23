import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { FeeSheme, FeeShemes } from '../model/fake-fee-schemes.model';

@Component({
  templateUrl: 'fees.component.html',
  styleUrls: ['admin.scss', 'fees.component.scss']
})
export class FeesComponent {
  private showDetails = false;
  inProgress = false;
  errorMessage = '';

  detailsColumnIndex = 6;
  displayedColumns: string[] = [
    'isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'
  ];

  schemeForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    instrument: ['', { validators: [Validators.required], updateOn: 'change' }],
    trxType: ['', { validators: [Validators.required], updateOn: 'change' }],
    provider: ['', { validators: [Validators.required], updateOn: 'change' }],
    transactionFees: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
    minTransactionFee: ['',
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
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

  schemes = FeeShemes;

  get showDetailed(): boolean {
    return this.showDetails;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private formBuilder: FormBuilder, private router: Router) { }

  createForm(scheme: FeeSheme | null): void {
    this.schemeForm = this.formBuilder.group({
      name: [{
        value: scheme === null ? '' : scheme?.name,
        disabled: scheme === null ? false : scheme.isDefault
      },
      { validators: [Validators.required], updateOn: 'change' }],
      target: [scheme === null ? '' : scheme?.target,
      { validators: [Validators.required], updateOn: 'change' }],
      instrument: [scheme === null ? '' : scheme?.instrument,
      { validators: [Validators.required], updateOn: 'change' }],
      trxType: [scheme === null ? '' : scheme?.trxType,
      { validators: [Validators.required], updateOn: 'change' }],
      provider: [scheme === null ? '' : scheme?.provider,
      { validators: [Validators.required], updateOn: 'change' }],
      transactionFees: [scheme === null ? '' : scheme?.transactionFees,
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
      minTransactionFee: [scheme === null ? '' : scheme?.minTransactionFee,
      { validators: [Validators.required, Validators.min(0), Validators.max(1000)], updateOn: 'change' }],
      rollingReserves: [scheme === null ? '' : scheme?.rollingReserves,
      { validators: [Validators.required, Validators.min(0), Validators.max(10000)], updateOn: 'change' }],
      rollingReservesDays: [scheme === null ? '' : scheme?.rollingReservesDays,
      { validators: [Validators.required, Validators.min(0), Validators.max(365)], updateOn: 'change' }],
      chargebackFees: [scheme === null ? '' : scheme?.chargebackFees,
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
      monthlyFees: [scheme === null ? '' : scheme?.monthlyFees,
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
      minMonthlyFees: [scheme === null ? '' : scheme?.minMonthlyFees,
      { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
      beneficiaryName: [scheme === null ? '' : scheme?.beneficiaryName,
      { validators: [Validators.required], updateOn: 'change' }],
      beneficiaryAddress: [scheme === null ? '' : scheme?.beneficiaryAddress,
      { validators: [Validators.required], updateOn: 'change' }],
      iban: [scheme === null ? '' : scheme?.iban,
      { validators: [Validators.required], updateOn: 'change' }],
      bankName: [scheme === null ? '' : scheme?.bankName,
      { validators: [Validators.required], updateOn: 'change' }],
      bankAddress: [scheme === null ? '' : scheme?.bankAddress,
      { validators: [Validators.required], updateOn: 'change' }],
      swift: [scheme === null ? '' : scheme?.swift,
      { validators: [Validators.required], updateOn: 'change' }]
    });
  }

  toggleDetails(scheme: FeeSheme): void {
    this.showDetails = !this.showDetails;
    if (this.showDetails) {
      this.displayedColumns.splice(this.detailsColumnIndex, 1);
      this.createForm(scheme);
    } else {
      this.displayedColumns.push('details');
    }
  }

  onSubmit(): void {

  }
}
