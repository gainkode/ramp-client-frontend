import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { CommonDataService } from '../services/common-data.service';
import { EnvService } from '../services/env.service';

@Component({
  selector: 'app-crypto-demo-wizard',
  templateUrl: 'demo-wizard.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss', '../../assets/text-control.scss'],
})
export class CryptoDemoWizardComponent implements OnInit {
  private pSubscriptions: Subscription = new Subscription();
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  errorMessage = '';
  inProgress = false;
  logoSrc = `${EnvService.image_host}/images/logo-color.png`;
  logoAlt = EnvService.product;
  defaultCrypto = '';
  defaultFiat = '';
  cryptoList: CurrencyView[] = [];
  fiatList: CurrencyView[] = [];
  selectedFiat: CurrencyView | undefined = undefined;
  done = false;
  validData = false;
  widgetLink = '';

  emailErrorMessages: { [key: string]: string; } = {
    ['pattern']: 'Email is not valid'
  };
  amountCryptoErrorMessages: { [key: string]: string; } = {
    ['pattern']: 'Amount must be a valid number',
    ['min']: 'Minimal amount'
  };

  dataForm = this.formBuilder.group({
    email: [undefined,
      {
        validators: [
          Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        ], updateOn: 'change'
      }
    ],
    amount: [undefined, {
      validators: [
        Validators.pattern(this.pNumberPattern)
      ], updateOn: 'change'
    }],
    currencyCrypto: [undefined, { validators: [], updateOn: 'change' }],
    currencyFiat: [undefined, { validators: [], updateOn: 'change' }]
  });

  get emailField(): AbstractControl | null {
    return this.dataForm.get('email');
  }

  get amountField(): AbstractControl | null {
    return this.dataForm.get('amount');
  }

  get currencyCryptoField(): AbstractControl | null {
    return this.dataForm.get('currencyCrypto');
  }

  get currencyFiatField(): AbstractControl | null {
    return this.dataForm.get('currencyFiat');
  }

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private commonService: CommonDataService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.currencyFiatField?.valueChanges.subscribe(val => this.onCurrencyFiatUpdated(val)));
    this.pSubscriptions.add(this.currencyCryptoField?.valueChanges.subscribe(val => this.onCurrencyCryptoUpdated(val)));
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private onCurrencyFiatUpdated(currency: string): void {
    this.selectedFiat = this.fiatList.find(x => x.symbol === currency);
  }

  private onCurrencyCryptoUpdated(currency: string): void {
    const selected = this.cryptoList.find(x => x.symbol === currency);
    let validators: ValidatorFn[] = [];
    if (selected) {
      this.amountCryptoErrorMessages['min'] = `Min. amount ${selected?.minAmount} ${selected?.display}`;
      validators = [
        Validators.pattern(this.pNumberPattern),
        Validators.min(selected?.minAmount ?? 0)
      ];
    } else {
      validators = [
        Validators.pattern(this.pNumberPattern)
      ];
    }
    this.amountField?.setValidators(validators);
    this.amountField?.updateValueAndValidity();
  }

  loadCurrencies(): void {
    this.handleError('');
    this.progressChanged(true);
    const currencyData$ = this.commonService.getSettingsCurrency();
    this.pSubscriptions.add(
      currencyData$.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        this.progressChanged(false);
        const dataList = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        this.defaultCrypto = dataList.defaultCrypto ?? 'BTC';
        this.defaultFiat = dataList.defaultFiat ?? 'EUR';
        this.cryptoList = dataList?.settingsCurrency?.list?.
          filter(x => x.fiat === false).
          map((val) => new CurrencyView(val)) as CurrencyView[];
        if (this.cryptoList.length > 0) {
          this.cryptoList.splice(0, 0, {
            symbol: '',
            name: ''
          } as CurrencyView)
        }
        this.fiatList = dataList?.settingsCurrency?.list?.
          filter(x => x.fiat === true).
          map((val) => new CurrencyView(val)) as CurrencyView[];
        if (this.fiatList.length > 0) {
          this.currencyFiatField?.setValue('EUR');
        }
      }, (error) => {
        this.progressChanged(false);
        this.handleError(this.errorHandler.getError(error.message, 'Unable to get currency data'));
      })
    );
  }

  save(): void {
    this.handleError('');
    this.progressChanged(true);
    const transactionData$ = this.dataService.preAuth('', '', '');
    this.pSubscriptions.add(
      transactionData$.subscribe(
        ({ data }) => {
          this.progressChanged(false);
          this.done = true;
          this.widgetLink = '';
        }, (error) => {
          this.progressChanged(false);
          this.handleError(this.errorHandler.getError(error.message, 'Unable to save data'));
        }
      )
    );
  }
}
