import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetAddressShort, Rate, SettingsCurrencyWithDefaults, TransactionType, UserState } from 'src/app/model/generated-models';
import { WidgetSettings } from 'src/app/model/payment-base.model';
import { CheckoutSummary, CurrencyView, QuickCheckoutTransactionTypeList } from 'src/app/model/payment.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { getCurrencySign } from 'src/app/utils/utils';
import { WalletValidator } from 'src/app/utils/wallet.validator';

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
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private pSubscriptions: Subscription = new Subscription();
  private pInit = false;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  validData = false;
  currentCurrency: CurrencyView | undefined = undefined;
  currencies: CurrencyView[] = [];

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
    if (currencySettings !== null) {
      const currencyList = currencySettings.settingsCurrency;
      let defaultCryptoCurrency = this.auth.user?.defaultCryptoCurrency ?? '';
      if (defaultCryptoCurrency === '') {
        defaultCryptoCurrency = 'BTC';
      }
      itemCount = currencyList?.count as number;
      if (itemCount > 0) {
        this.currencies = currencyList?.list?.
          map((val) => new CurrencyView(val)).
          filter((c) => c.fiat === false) as CurrencyView[];
        this.currencyField?.setValue(defaultCryptoCurrency);
      }
    }
  }

  private setValidators(): void {
    if (!this.pInit) {
      return;
    }
    this.amountErrorMessages['min'] = `Min. amount ${this.currentCurrency?.minAmount} ${this.currentCurrency?.display}`;
    let validators = [
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.min(this.currentCurrency?.minAmount ?? 0),
    ];
    this.amountField?.setValidators(validators);
    this.amountField?.updateValueAndValidity();
  }

  private onCurrencyUpdated(currency: string): void {
    this.currentCurrency = this.currencies.find((x) => x.symbol === currency);
    if (this.currentCurrency) {
      this.validData = true;
      this.setValidators();
    }
  }

  private onAmountUpdated(): void {
    this.pInit = true;
    this.setValidators();
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      const data = new CheckoutSummary();
      data.email = this.emailField?.value;
      data.amountFrom = this.amountField?.value;
      data.currencyFrom = this.currencyField?.value;
      this.onComplete.emit(this.emailField?.value);
    }
  }
}
