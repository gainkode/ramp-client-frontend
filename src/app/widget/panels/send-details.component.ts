import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShortListResult, TransactionType, UserContact, UserContactListResult } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView } from 'src/app/model/payment.model';
import { ContactItem } from 'src/app/model/user.model';
import { WalletItem } from 'src/app/model/wallet.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { getCurrencySign } from 'src/app/utils/utils';
import { WalletValidator } from 'src/app/utils/wallet.validator';

@Component({
  selector: 'app-widget-send-details',
  templateUrl: 'send-details.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss'
  ]
})
export class WidgetSendDetailsComponent implements OnInit, OnDestroy {
  @Input() errorMessage = '';
  @Input() presetContactId = '';
  @Input() presetWalletId = '';
  @Input() presetCurrency = '';
  @Input() currencies: CurrencyView[] = [];
  @Input() set withdrawalRate(val: number | undefined) {
    this.pWithdrawalRate = val;
    this.updateCurrentAmounts();
  }
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onWalletAddressUpdated = new EventEmitter<string | undefined>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private pSubscriptions: Subscription = new Subscription();
  private pWithdrawalRate: number | undefined = undefined;
  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  inProgress = false;
  validData = false;
  currentSymbol = '';
  currentCurrency: CurrencyView | undefined = undefined;
  contacts: ContactItem[] = [];
  wallets: WalletItem[] = [];
  selectedWallet: WalletItem | undefined = undefined;
  selectedContact: ContactItem | undefined = undefined;
  fiatAmount = '';
  zeroAmount = false;
  walletInit = false;
  contactInit = false;
  addressInit = false;

  amountErrorMessages: { [key: string]: string; } = {
    ['required']: 'Amount is required',
    ['pattern']: 'Amount must be a valid number',
    ['max']: 'Maximal amount'
  };
  walletErrorMessages: { [key: string]: string; } = {
    ['required']: 'Address is required'
  };
  addressErrorMessages: { [key: string]: string; } = {
    ['required']: 'Address is required'
  };

  dataForm = this.formBuilder.group({
    amount: [undefined, { validators: [], updateOn: 'change' }],
    currency: [null, { validators: [Validators.required], updateOn: 'change' }],
    transaction: [TransactionType.Deposit, { validators: [], updateOn: 'change' }],
    wallet: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    address: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    contact: [undefined, { validators: [], updateOn: 'change' }]
  }, {
    validators: [
      WalletValidator.addressValidator(
        'address',
        'currency',
        'transaction'
      ),
    ],
    updateOn: 'change',
  });

  get amountField(): AbstractControl | null {
    return this.dataForm.get('amount');
  }

  get currencyField(): AbstractControl | null {
    return this.dataForm.get('currency');
  }

  get walletField(): AbstractControl | null {
    return this.dataForm.get('wallet');
  }

  get addressField(): AbstractControl | null {
    return this.dataForm.get('address');
  }

  get contactField(): AbstractControl | null {
    return this.dataForm.get('contact');
  }

  constructor(
    private auth: AuthService,
    private profileService: ProfileDataService,
    private errorHandler: ErrorService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.currencyField?.valueChanges.subscribe(val => this.onCurrencyUpdated(val)));
    this.pSubscriptions.add(this.amountField?.valueChanges.subscribe(val => this.onAmountUpdated(val)));
    this.pSubscriptions.add(this.walletField?.valueChanges.subscribe(val => this.onWalletUpdated(val)));
    this.pSubscriptions.add(this.contactField?.valueChanges.subscribe(val => this.onContactUpdated(val)));
    if (this.presetCurrency === '') {
      this.currencyField?.setValue(this.auth.user?.defaultCryptoCurrency);
    } else {
      this.currencyField?.setValue(this.presetCurrency);
    }
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  sendAll(): void {
    this.amountField?.setValue(this.selectedWallet?.total);
  }

  private loadUserWallets(symbol: string): void {
    this.errorMessage = '';
    this.inProgress = true;
    this.onProgress.emit(this.inProgress);
    this.wallets = [];
    this.contacts = [];
    const walletData = this.profileService.getMyWallets([symbol]);
    this.pSubscriptions.add(
      walletData.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const dataList = data.myWallets as AssetAddressShortListResult;
        if (dataList !== null) {
          const walletCount = dataList?.count as number;
          if (walletCount > 0) {
            this.wallets = dataList?.list?.
              map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
          }
        }
        if (this.wallets.length > 0) {
          this.loadContacts(symbol);
          if (this.presetWalletId === '') {
            if (this.wallets.length === 1) {
              this.walletField?.setValue(this.wallets[0].id);
            }
          } else {
            this.walletField?.setValue(this.presetWalletId);
          }
        } else {
          this.errorMessage = `No wallets found for ${symbol}`;
          this.inProgress = false;
          this.onProgress.emit(this.inProgress);
        }
      }, (error) => {
        this.inProgress = false;
        this.onProgress.emit(this.inProgress);
        if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load wallets');
        }
      })
    );
  }

  private loadContacts(symbol: string): void {
    this.errorMessage = '';
    const contactsData$ = this.profileService.getMyContacts(
      [symbol],
      [],
      [],
      0,
      1000,
      'displayName',
      false).valueChanges.pipe(take(1));
    this.contacts = [];
    if (this.inProgress === false) {
      this.inProgress = true;
      this.onProgress.emit(this.inProgress);
    }
    const userFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
    this.pSubscriptions.add(
      contactsData$.subscribe(({ data }) => {
        const contactsItems = data.myContacts as UserContactListResult;
        if (contactsItems) {
          const contactCount = contactsItems?.count as number;
          if (contactCount > 0) {
            this.contacts = contactsItems?.list?.map((val) => new ContactItem(val)) as ContactItem[];
            this.contacts.splice(0, 0, new ContactItem({
              userContactId: '',
              contactEmail: '',
              displayName: '...',
              assetId: symbol
            } as UserContact));
            if (this.presetContactId !== '') {
              this.contactField?.setValue(this.presetContactId);
            }
          }
        }
        this.inProgress = false;
        this.onProgress.emit(this.inProgress);
      }, (error) => {
        this.inProgress = false;
        this.onProgress.emit(this.inProgress);
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load contacts');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private sendData(): void {
    const data = new CheckoutSummary();
    if (this.amountField?.valid) {
      data.amountFrom = parseFloat(this.amountField?.value);
    } else {
      data.amountFrom = undefined;
    }
    if (this.currencyField?.valid) {
      data.currencyFrom = this.currencyField?.value;
      data.amountFromPrecision = this.currentCurrency?.precision ?? 2;
    }
    this.onDataUpdated.emit(data);
  }

  private setAmountValidators(): void {
    this.amountErrorMessages['max'] = `Max. amount to send ${this.selectedWallet?.total} ${this.currencyField?.value}`;
    this.amountField?.setValidators([
      Validators.required,
      Validators.pattern(this.pNumberPattern),
      Validators.max(this.selectedWallet?.total ?? 0),
    ]);
    this.amountField?.updateValueAndValidity();
  }

  private onCurrencyUpdated(currency: string): void {
    if (currency && currency !== '' && currency !== this.currentSymbol) {
      this.currentCurrency = this.currencies.find(x => x.id === currency);
      if (this.zeroAmount === false) {
        this.sendData();
      }
      this.currentSymbol = currency;
      this.loadUserWallets(currency);
    }
  }

  private onAmountUpdated(val: any) {
    if (this.amountField?.valid) {
      this.zeroAmount = (this.amountField.value === '0');
    } else {
      this.zeroAmount = false;
    }
    this.updateCurrentAmounts();
  }

  private onWalletUpdated(val: string): void {
    this.walletInit = true;
    this.selectedWallet = this.wallets.find(x => x.id === val);
    this.setAmountValidators();
  }

  private onContactUpdated(val: string): void {
    this.contactInit = true;
    this.selectedContact = this.contacts.find(x => x.id === val);
    this.addressField?.setValue(this.selectedContact?.address);
  }

  private updateCurrentAmounts(): void {
    let valid = this.amountField?.valid;
    let amountStr = '';
    if (valid) {
      amountStr = this.amountField?.value;
      if (amountStr) {
        valid = (amountStr !== '');
      } else {
        valid = false;
      }
    }
    if (valid && this.pWithdrawalRate) {
      const send = parseFloat(this.amountField?.value);
      const fiat = (send * this.pWithdrawalRate).toFixed(2);
      const defaultFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
      this.fiatAmount = `= ${getCurrencySign(defaultFiat)}${fiat}`;
    } else {
      this.fiatAmount = '';
    }
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      const data = new CheckoutSummary();
      data.amountFrom = parseFloat(this.amountField?.value);
      data.amountFromPrecision = this.currentCurrency?.precision ?? 2;
      data.currencyFrom = this.currencyField?.value;
      data.address = this.addressField?.value;
      data.vaultId = this.walletField?.value;
      this.onComplete.emit(data);
    }
  }
}
