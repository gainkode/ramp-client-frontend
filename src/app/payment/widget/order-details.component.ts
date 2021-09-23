import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
  selector: 'app-widget-order-details',
  templateUrl: 'order-details.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetOrderDetailsComponent implements OnInit {
  spendCurrencyList: CommonTargetValue[] = [];
  receiveCurrencyList: CommonTargetValue[] = [];

  emailErrorMessages: { [key: string]: string; } = {
    ['email']: 'Email is not valid',
    ['required']: 'Email is required'
  };
  amountSpendErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required'
  };

  dataForm = this.formBuilder.group({
    email: [null, { validators: [Validators.email], updateOn: 'change' }],
    amountSpend: [null, { validators: [], updateOn: 'change' }],
    currencySpend: [null, { validators: [], updateOn: 'change' }],
    amountReceive: [null, { validators: [], updateOn: 'change' }],
    currencyReceive: [null, { validators: [], updateOn: 'change' }]
  });

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  get amountSpendField(): AbstractControl | null {
    return this.dataForm.get('amountSpend');
  }

  get currencySpendField(): AbstractControl | null {
    return this.dataForm.get('currencySpend');
  }

  get amountReceiveField(): AbstractControl | null {
    return this.dataForm.get('amountReceive');
  }

  get currencyReceiveField(): AbstractControl | null {
    return this.dataForm.get('currencyReceive');
  }

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.spendCurrencyList.push({
      id: 'eur',
      title: 'EUR'
    } as CommonTargetValue);
    this.spendCurrencyList.push({
      id: 'usd',
      title: 'USD'
    } as CommonTargetValue);
  }

  onSubmit(): void {
    this.emailField?.setValidators([Validators.email, Validators.required]);
    this.emailField?.updateValueAndValidity();
    this.amountSpendField?.setValidators([Validators.required]);
    this.amountSpendField?.updateValueAndValidity();
    this.currencySpendField?.setValidators([Validators.required]);
    this.currencySpendField?.updateValueAndValidity();
    this.amountReceiveField?.setValidators([Validators.required]);
    this.amountReceiveField?.updateValueAndValidity();
    this.currencyReceiveField?.setValidators([Validators.required]);
    this.currencyReceiveField?.updateValueAndValidity();

    console.log('email', this.emailField?.value, this.emailField?.valid ? 'valid' : 'invalid');
    console.log('spend', this.amountSpendField?.value, this.amountSpendField?.valid ? 'valid' : 'invalid');
    console.log('spend currency', this.currencySpendField?.value, this.currencySpendField?.valid ? 'valid' : 'invalid');
    console.log('receive', this.amountReceiveField?.value, this.amountReceiveField?.valid ? 'valid' : 'invalid');
    console.log('receive currency', this.currencyReceiveField?.value, this.currencyReceiveField?.valid ? 'valid' : 'invalid');
  }
}
