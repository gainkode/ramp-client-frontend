import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { WidgetSettings } from 'src/app/model/payment-base.model';
import { CheckoutSummary, CurrencyView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-widget-crypto-details',
  templateUrl: 'crypto-details.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss'
  ]
})
export class WidgetCryptoDetailsComponent implements OnInit, OnDestroy {
  @Input() errorMessage = '';
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() widget: WidgetSettings | undefined = undefined;
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private pSubscriptions: Subscription = new Subscription();
  private pAmountInit = false;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  validData = false;
  currentCurrency: CurrencyView | undefined = undefined;
  currencies: CurrencyView[] = [];
  hideEmail = false;
  done = false;

  emailErrorMessages: { [key: string]: string; } = {
    ['pattern']: 'Email is not valid',
    ['required']: 'Email is required'
  };
  amountErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  dataForm = this.formBuilder.group({
    email: ['',
      {
        validators: [
          Validators.required,
          Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        ], updateOn: 'change'
      }
    ],
    amount: [undefined, { validators: [], updateOn: 'change' }],
    currency: [null, { validators: [], updateOn: 'change' }]
  });

  get amountInit(): boolean {
    return this.pAmountInit;
  }

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  get amountField(): AbstractControl | null {
    return this.dataForm.get('amount');
  }

  get currencyField(): AbstractControl | null {
    return this.dataForm.get('currency');
  }

  constructor(
    private auth: AuthService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    if (this.summary?.email) {
      this.emailField?.setValue(this.summary.email);
    }
    this.hideEmail = false;
    if (this.widget) {
      this.hideEmail = this.widget.hideEmail;
    }
    this.loadDetailsForm();
    this.pSubscriptions.add(this.currencyField?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
    this.pSubscriptions.add(this.amountField?.valueChanges.subscribe(val => this.onAmountUpdated()));
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  private loadDetailsForm(): void {
    this.onError.emit('');
    const currencyData = this.commonService.getSettingsCurrency();
    this.onProgress.emit(true);
    this.pSubscriptions.add(
      currencyData.valueChanges.subscribe(
        ({ data }) => {
          this.loadCurrencyList(data.getSettingsCurrency as SettingsCurrencyWithDefaults);
          this.onProgress.emit(false);
        },
        (error) => {
          this.onProgress.emit(false);
          this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load available list of currency types'));
        })
    );
  }

  private loadCurrencyList(currencySettings: SettingsCurrencyWithDefaults) {
    let itemCount = 0;
    this.currencies = [];
    let currencyFiat = false;
    if (currencySettings !== null) {
      const currencyList = currencySettings.settingsCurrency;
      if (this.widget?.currencyFrom !== '') {
        const widgetCurrency = currencyList?.list?.find(x => x.symbol === this.widget?.currencyFrom);
        if (widgetCurrency) {
          currencyFiat = widgetCurrency.fiat === true;
        }
      }

      let selectedCurrency = '';
      if (currencyFiat) {
        selectedCurrency = this.auth.user?.defaultFiatCurrency ?? '';
        if (selectedCurrency === '') {
          selectedCurrency = 'EUR';
        }
        if (this.widget?.currencyFrom !== '') {
          selectedCurrency = this.widget?.currencyFrom ?? 'EUR';
        }
      } else {
        selectedCurrency = this.auth.user?.defaultCryptoCurrency ?? '';
        if (selectedCurrency === '') {
          selectedCurrency = 'BTC';
        }
        if (this.widget?.currencyFrom !== '') {
          selectedCurrency = this.widget?.currencyFrom ?? 'BTC';
        }
      }
      itemCount = currencyList?.count as number;
      if (itemCount > 0) {
        this.currencies = currencyList?.list?.
          map((val) => new CurrencyView(val)).
          filter((c) => c.fiat === currencyFiat) as CurrencyView[];
        this.currencyField?.setValue(selectedCurrency);
      }
    }
  }

  private setValidators(): void {
    this.amountErrorMessages['min'] = `Min. amount ${this.currentCurrency?.minAmount} ${this.currentCurrency?.display}`;
    let validators = [
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.min(this.currentCurrency?.minAmount ?? 0)
    ];
    this.amountField?.setValidators(validators);
    this.amountField?.updateValueAndValidity();
  }

  private onCurrencyUpdated(currency: string): void {
    let updated = true;
    if (this.currentCurrency) {
      if (this.currentCurrency.symbol === currency) {
        updated = false;
      }
    }
    if (updated) {
      this.currentCurrency = this.currencies.find((x) => x.symbol === currency);
      if (this.currentCurrency) {
        this.validData = true;
        const dataSet = (this.amountField?.value && this.amountField?.value !== null);
        if (dataSet) {
          this.setValidators();
        }
      }
    }
  }

  private onAmountUpdated(): void {
    const dataSet = (this.amountField?.value && this.amountField?.value !== null);
    if (!this.pAmountInit && dataSet) {
      this.pAmountInit = true;
      this.setValidators();
    }
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.done = true;
      const data = new CheckoutSummary();
      data.email = this.emailField?.value;
      data.amountFrom = parseFloat(this.amountField?.value);
      data.currencyFrom = this.currencyField?.value;
      this.onComplete.emit(data);
    }
  }
}
