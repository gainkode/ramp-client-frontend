import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonGroupValue } from 'src/app/model/common.model';
import { TransactionType, UserState } from 'src/app/model/generated-models';
import { CheckoutSummary, WidgetSettings } from 'src/app/model/payment.model';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { WalletValidator } from 'src/app/utils/wallet.validator';

@Component({
  selector: 'app-widget-payment',
  templateUrl: 'payment.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetPaymentComponent implements OnInit, OnDestroy {
  @Input() settings: WidgetSettings = new WidgetSettings();
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Output() onBack = new EventEmitter();
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onReset = new EventEmitter();
  @Output() onUpdate = new EventEmitter<string>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private pSubscriptions: Subscription = new Subscription();

  walletInit = false;
  errorMessage = '';
  userWallets: CommonGroupValue[] = [];
  userWalletsFiltered: Observable<CommonGroupValue[]> | undefined = undefined;

  dataForm = this.formBuilder.group({
    wallet: ['', { validators: [Validators.required], updateOn: 'change' }],
    currencyTo: [''],
    transaction: [TransactionType.Deposit],
  },
    {
      validators: [
        WalletValidator.addressValidator(
          'wallet',
          'currencyTo',
          'transaction'
        ),
      ],
      updateOn: 'change',
    });

  get walletField(): AbstractControl | null {
    return this.dataForm.get('wallet');
  }

  get currencyToField(): AbstractControl | null {
    return this.dataForm.get('currencyTo');
  }

  get transactionField(): AbstractControl | null {
    return this.dataForm.get('transaction');
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.currencyToField?.setValue(this.summary?.currencyTo);
    this.transactionField?.setValue(this.summary?.transactionType);
    this.pSubscriptions.add(this.walletField?.valueChanges.subscribe(val => this.onWalletUpdated(val)));
    this.pSubscriptions.add(this.dataForm.valueChanges.subscribe({ next: (result: any) => this.onFormUpdated() }));
    this.userWalletsFiltered =
      this.walletField?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterUserWallets(value))
      );
    this.loadWallets();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  loadWallets(): void {
    console.log('loadWallets');
    this.userWallets = [];
    if (this.summary?.address) {
      this.walletField?.setValue(this.summary?.address);
    } else {
      this.walletField?.setValue('');
    }
    this.walletField?.setValidators([]);
    this.walletField?.updateValueAndValidity();
    this.changeDetector.detectChanges();

    const stateData = this.dataService.getState();
    if (stateData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.onProgress.emit(true);
      this.pSubscriptions.add(
        stateData.valueChanges.subscribe(({ data }) => {
          this.getStateData(data.myState as UserState);
          this.onProgress.emit(false);
        }, (error) => {
          this.onProgress.emit(false);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
            this.onReset.emit();
          } else {
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load wallet list'));
          }
        })
      );
    }
  }

  private getStateData(state: UserState): void {
    const vaultAssets: string[] = [];
    const externalWallets: string[] = [];
    state.vault?.assets?.forEach((x) => {
      if (x.id === this.summary?.currencyTo) {
        x.addresses?.forEach((a) => vaultAssets.push(a.address as string));
      }
    });
    if (vaultAssets.length > 0) {
      const v = new CommonGroupValue();
      v.id = 'Vault Assets';
      v.values = vaultAssets;
      this.userWallets.push(v);
    }
    state.externalWallets?.forEach((x) => {
      x.assets?.forEach((a) => {
        if (a.id === this.summary?.currencyTo) {
          externalWallets.push(a.address as string);
        }
      });
    });
    if (externalWallets.length > 0) {
      const v = new CommonGroupValue();
      v.id = 'External Wallets';
      v.values = externalWallets;
      this.userWallets.push(v);
    }
    if (this.settings.walletAddress === '') {
      this.walletField?.setValidators([Validators.required]);
    } else {
      this.walletField?.setValidators([]);
    }
    this.walletField?.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  private filterUserWallets(value: string): CommonGroupValue[] {
    if (value !== null) {
      return this.userWallets
        .map(group => ({ id: group.id, values: this.filterUserWalletGroupItem(group.values, value) }))
        .filter(group => group.values.length > 0);
    } else {
      return [];
    }
  }

  private filterUserWalletGroupItem = (opt: string[], value: string): string[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => item.toLowerCase().includes(filterValue));
  }

  private onFormUpdated(): void {
    if (this.dataForm.valid) {
      this.onUpdate.emit(this.walletField?.value);
    }
  }

  private onWalletUpdated(val: string): void {
    if (val && val !== '') {
      this.walletInit = true;
    }
  }
}
