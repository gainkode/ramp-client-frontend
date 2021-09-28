import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-widget-register',
  templateUrl: 'register.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetRegisterComponent implements OnInit, OnDestroy {
  @Input() email = '';
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onComplete = new EventEmitter<void>();

  private pSubscriptions: Subscription = new Subscription();

  validData = false;

  loginErrorMessages: { [key: string]: string; } = {
    ['email']: 'Email is not valid',
    ['required']: 'Email is required'
  };
  password1ErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };
  password2ErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  dataForm = this.formBuilder.group({
    email: [null, { validators: [Validators.email], updateOn: 'change' }],
    password1: [null, { validators: [], updateOn: 'change' }],
    password2: [null, { validators: [], updateOn: 'change' }]
  });

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  get password1Field(): AbstractControl | null {
    return this.dataForm.get('password1');
  }

  get password2Field(): AbstractControl | null {
    return this.dataForm.get('password2');
  }

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    // this.pSubscriptions.add(this.currencySpendField?.valueChanges.subscribe(val => this.onCurrencySpendUpdated(val)));
    // this.pSubscriptions.add(this.currencyReceiveField?.valueChanges.subscribe(val => this.onCurrencyReceiveUpdated(val)));

    // this.detailsAmountFromControl?.valueChanges.subscribe((val) => {
    //   this.setSummuryAmountFrom(val);
    // });
    // this.detailsAmountToControl?.valueChanges.subscribe((val) => {
    //   this.setSummuryAmountTo(val);
    // });
    // this.detailsTransactionControl?.valueChanges.subscribe((val) => {
    //   const currencyFrom = this.detailsCurrencyFromControl?.value;
    //   const currencyTo = this.detailsCurrencyToControl?.value;
    //   const amountFrom = this.detailsAmountFromControl?.value;
    //   const amountTo = this.detailsAmountToControl?.value;
    //   this.transactionTypeEdit = true;
    //   this.currentTransaction = val as TransactionType;
    //   this.summary.transactionType = this.currentTransaction;
    //   this.setCurrencyValues(currencyTo, currencyFrom, amountTo, amountFrom);
    //   this.priceEdit = true;
    //   this.updateAmountTo();
    //   this.priceEdit = false;
    //   this.transactionTypeEdit = false;
    //   this.exchangeRateComponent?.updateRate();
    // });



  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  onSubmit(): void {
    this.emailField?.setValidators([Validators.email, Validators.required]);
    this.emailField?.updateValueAndValidity();

    if (this.dataForm.valid) {
      this.onComplete.emit();
    }
  }
}
