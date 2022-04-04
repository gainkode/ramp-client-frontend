import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
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
      this.currencyField?.setValue(val.currencyTo);
    }
    if (val.amountTo !== undefined) {
      this.amountField?.setValue(val.amountTo);
    }
  }
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private defaultSummary: CheckoutSummary | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pSubscriptions: Subscription = new Subscription();

  selectedCurrency: CurrencyView | undefined = undefined;
  currencyInit = false;

  dataForm = this.formBuilder.group({
    amount: [undefined, { validators: [], updateOn: 'change' }],
    currency: [undefined, { validators: [], updateOn: 'change' }],
  });

  amountErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  get amountField(): AbstractControl | null {
    return this.dataForm.get('amount');
  }

  get currencyField(): AbstractControl | null {
    return this.dataForm.get('currency');
  }

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.currencyField?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
    const defaultFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
    let currency = defaultFiat;
    if (this.defaultSummary) {
      if (this.defaultSummary.currencyTo !== '') {
        currency = this.defaultSummary.currencyTo;
      }
    }
    this.currencyField?.setValue(currency);
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  onSubmit(): void {
    const data = new CheckoutSummary();
    data.amountTo = parseFloat(this.amountField?.value ?? '0');
    data.currencyTo = this.currencyField?.value ?? 'EUR';
    this.onComplete.emit(data);
  }

  private onCurrencyUpdated(symbol: string): void {
    this.currencyInit = true;
    this.selectedCurrency = this.currencies.find(x => x.id === symbol);
    if (this.amountField?.value === undefined || this.amountField?.value === null) {
      this.amountField?.setValue(this.selectedCurrency?.minAmount ?? 0);
    }
    this.amountErrorMessages['min'] = `Min. amount ${this.selectedCurrency?.minAmount ?? 0} ${this.selectedCurrency?.title}`;
    const validators = [
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.min(this.selectedCurrency?.minAmount ?? 0),
    ];
    this.amountField?.setValidators(validators);
    this.amountField?.updateValueAndValidity();
  }
}
