import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-widget-deposit-details',
  templateUrl: 'deposit-details.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss',
    '../../../assets/details.scss'
  ]
})
export class WidgetDepositDetailsComponent implements OnInit, OnDestroy {
  @Input() currencies: CurrencyView[] = [];
  @Input() errorMessage = '';
  @Input() set summary(val: CheckoutSummary) {
    this.defaultSummary = val;
    if (val.currencyTo !== undefined) {
      this.currencyTo?.setValue(val.currencyTo);
      this.currencyFrom?.setValue(val.currencyFrom);
    }
    if (val.amountTo !== undefined) {
      this.amountTo?.setValue(val.amountTo);
      this.amountFrom?.setValue(val.amountFrom);
    }
    if (val.transactionType === TransactionType.Deposit) {
      this.amountTitle = 'Fiat Received';
    } else if (val.transactionType === TransactionType.Withdrawal) {
      this.amountTitle = 'Fiat Sent';
    }
  }
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private defaultSummary: CheckoutSummary | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pSubscriptions: Subscription = new Subscription();

  selectedCurrency: CurrencyView | undefined = undefined;
  currencyInit = false;
  amountTitle = '';
  done = false;

  dataForm = this.formBuilder.group({
    amountTo: [undefined, { validators: [], updateOn: 'change' }],
    currencyTo: [undefined, { validators: [], updateOn: 'change' }],
    currencyFrom: [null, { validators: [], updateOn: 'change' }],
    amountFrom: [undefined, { validators: [], updateOn: 'change' }],
  });

  amountErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  get amountTo(): AbstractControl | null {
    return this.dataForm.get('amountTo');
  }

  get currencyTo(): AbstractControl | null {
    return this.dataForm.get('currencyTo');
  }

  get amountFrom(): AbstractControl | null {
    return this.dataForm.get('amountFrom');
  }

  get currencyFrom(): AbstractControl | null {
    return this.dataForm.get('currencyFrom');
  }

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.currencyTo?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
    const defaultFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
    let currency = defaultFiat;
    if (this.defaultSummary) {
      if (this.defaultSummary.currencyTo !== '') {
        currency = this.defaultSummary.currencyTo;
      }
    }
    this.currencyTo?.setValue(currency);
    this.currencyFrom?.setValue(currency);
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  onSubmit(): void {
    this.done = true;
    const data = new CheckoutSummary();
    data.amountTo = parseFloat(this.amountTo?.value ?? '0');
    data.currencyTo = this.currencyTo?.value ?? 'EUR';
    data.amountFrom = parseFloat(this.amountFrom?.value ?? '0');
    data.currencyFrom = this.currencyFrom?.value ?? 'EUR';
    this.onComplete.emit(data);
  }

  private onCurrencyUpdated(symbol: string): void {
    this.currencyInit = true;
    this.selectedCurrency = this.currencies.find(x => x.symbol === symbol);
    if (this.amountTo?.value === undefined || this.amountTo?.value === null) {
      this.amountTo?.setValue(this.selectedCurrency?.minAmount ?? 0);
    }

    if (this.amountFrom?.value === undefined || this.amountFrom?.value === null) {
      this.amountFrom?.setValue(this.selectedCurrency?.minAmount ?? 0);
    }
    this.amountErrorMessages['min'] = `Min. amount ${this.selectedCurrency?.minAmount ?? 0} ${this.selectedCurrency?.display}`;
    const validators = [
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.min(this.selectedCurrency?.minAmount ?? 0),
    ];
    this.amountTo?.setValidators(validators);
    this.amountTo?.updateValueAndValidity();

    this.amountFrom?.setValidators(validators);
    this.amountFrom?.updateValueAndValidity();
  }
}
