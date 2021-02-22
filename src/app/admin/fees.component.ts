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
    name: ['',
      {
        validators: [Validators.required], updateOn: 'change'
      }],
      target: ['', { validators: [Validators.required], updateOn: 'change' }],
      instrument: ['', { validators: [Validators.required], updateOn: 'change' }],
      trxType: ['', { validators: [Validators.required], updateOn: 'change' }],
      provider: ['', { validators: [Validators.required], updateOn: 'change' }]
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
      {
        validators: [Validators.required], updateOn: 'change'
      }],
      target: [scheme === null ? '' : scheme?.target, 
      { validators: [Validators.required], updateOn: 'change' }],
      instrument: [scheme === null ? '' : scheme?.instrument, 
      { validators: [Validators.required], updateOn: 'change' }],
      trxType: [scheme === null ? '' : scheme?.trxType, 
      { validators: [Validators.required], updateOn: 'change' }],
      provider: [scheme === null ? '' : scheme?.provider, 
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
