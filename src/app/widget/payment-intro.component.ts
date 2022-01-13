import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Rate, SettingsCurrencyWithDefaults } from '../model/generated-models';
import { CheckoutSummary, CurrencyView } from '../model/payment.model';
import { CommonDataService } from '../services/common-data.service';
import { ErrorService } from '../services/error.service';
import { PaymentDataService } from '../services/payment.service';

@Component({
  selector: 'app-payment-intro',
  templateUrl: 'payment-intro.component.html',
  styleUrls: ['../../assets/payment.scss']
})
export class PaymentIntroComponent implements OnInit, OnDestroy {
  @Output() onComplete = new EventEmitter<CheckoutSummary>();
  @Output() onError = new EventEmitter<string>();

  private pSubscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];

  amountSpendErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };
  amountReceiveErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  dataForm = this.formBuilder.group({
    amountSpend: [undefined, { validators: [], updateOn: 'change' }],
    currencySpend: [null, { validators: [], updateOn: 'change' }],
    amountReceive: [undefined, { validators: [], updateOn: 'change' }],
    currencyReceive: [null, { validators: [], updateOn: 'change' }]
  });

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

  constructor(
    private formBuilder: FormBuilder,
    private errorHandler: ErrorService,
    private paymentService: PaymentDataService,
    private commonService: CommonDataService) {

  }

  ngOnInit(): void {
    this.loadDetailsForm();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  onSubmit(): void {

  }

  private loadDetailsForm(): void {
    this.onError.emit('');
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.pSubscriptions.add(
        currencyData.valueChanges.subscribe(
          ({ data }) => {
            this.loadCurrencyList(data.getSettingsCurrency as SettingsCurrencyWithDefaults);
          },
          (error) => {
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load available list of currency types'));
          })
      );
    }
  }

  private loadCurrencyList(currencySettings: SettingsCurrencyWithDefaults) {
    let itemCount = 0;
    this.pCurrencies = [];
    if (currencySettings !== null) {
      const currencyList = currencySettings.settingsCurrency;
      let defaultFiatCurrency = currencySettings.defaultFiat ?? '';
      if (defaultFiatCurrency === '') {
        defaultFiatCurrency = 'EUR';
      }
      let defaultCryptoCurrency = currencySettings.defaultCrypto ?? '';
      if (defaultCryptoCurrency === '') {
        defaultCryptoCurrency = 'BTC';
      }
      itemCount = currencyList?.count as number;
      if (itemCount > 0) {
        const defaultFiat = currencyList?.list?.find(x => x.symbol === defaultFiatCurrency && x.fiat === true)
        if (!defaultFiat) {
          defaultFiatCurrency = 'EUR';
        }
        this.pCurrencies = currencyList?.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
        // this.setCurrencyValues(
        //   initState,
        //   defaultFiatCurrency,
        //   defaultCryptoCurrency,
        //   undefined,
        //   undefined);
      }
    }
  }
}
