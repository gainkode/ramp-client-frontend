import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { PaymentInstrument, PaymentProviderByInstrument, TransactionType, User } from 'src/app/model/generated-models';
import { CheckoutSummary, PaymentProviderInstrumentView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-widget-settings-service',
  template: '<div></div>'
})
export class WidgetSettingsService implements OnInit, OnDestroy {
  @Input() summary: CheckoutSummary = new CheckoutSummary();
  @Input() widgetId: string = '';
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onAuthenticationRequired = new EventEmitter<string>();
  @Output() onIdentificationRequired = new EventEmitter();
  @Output() onLoginRequired = new EventEmitter<string>();
  @Output() onKycStatusUpdate = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<PaymentProviderInstrumentView[]>();

  private pSubscriptions: Subscription = new Subscription();

  constructor(private auth: AuthService, private paymentService: PaymentDataService, private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.getSettingsCommon();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  private getSettingsCommon(): void {
    this.onError.emit('');
    if (this.auth.token === '') {
      if (this.summary.email) {
        this.onAuthenticationRequired.emit(this.summary.email);
      } else {
        this.onIdentificationRequired.emit();
      }
    } else {
      const dataGetter = this.auth.getSettingsCommon();
      if (dataGetter) {
        this.onProgress.emit(true);
        this.pSubscriptions.add(
          dataGetter.valueChanges.subscribe(({ data }) => {
            if (this.auth.user) {
              this.auth.setLocalSettingsCommon(data.getSettingsCommon);
              this.getKycStatus();
            } else {
              this.onLoginRequired.emit(this.summary.email);
            }
            this.onProgress.emit(false);
          }, (error) => {
            this.onProgress.emit(false);
            if (error.message === 'Access denied') {
              if (this.summary.email) {
                this.onAuthenticationRequired.emit(this.summary.email);
              } else {
                this.onIdentificationRequired.emit();
              }
            } else {
              this.onError.emit(this.errorHandler.getError(error.message, 'Unable to read settings'));
            }
          }));
      } else {
        this.onError.emit(this.errorHandler.getRejectedCookieMessage());
      }
    }
  }

  private getKycStatus(): void {
    const kycStatusData = this.auth.getMyKycData();
    if (kycStatusData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.onProgress.emit(true);
      this.pSubscriptions.add(
        kycStatusData.valueChanges.subscribe(({ data }) => {
          const userKyc = data.me as User;
          const kycData = this.isKycRequired(userKyc);
          this.onProgress.emit(false);
          if (kycData === null) {
            this.onError.emit('We cannot proceed your payment because your identity is rejected');
          } else {
            this.onKycStatusUpdate.emit(kycData === true);
            if (this.summary.transactionType === TransactionType.Deposit) {
              this.loadPaymentProviders();
            } else {
              this.onError.emit(`Transaction type "${this.summary.transactionType}" is currently not supported`);
            }
          }
        }, (error) => {
          this.onProgress.emit(false);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
            if (this.summary.email) {
              this.onAuthenticationRequired.emit(this.summary.email);
            } else {
              this.onIdentificationRequired.emit();
            }
          } else {
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load your identification status'));
          }
        })
      );
    }
  }

  private isKycRequired(kyc: User): boolean | null {
    let result = true;
    const kycStatus = kyc.kycStatus?.toLowerCase();
    if (kycStatus !== 'init' && kycStatus !== 'unknown') {
      result = false;
    } else {
      if (kyc.kycValid === true) {
        result = false;
      } else if (kyc.kycValid === false) {
        if (kyc.kycReviewRejectedType?.toLowerCase() === 'final') {
          return null;
        }
      }
    }
    return result;
  }

  private loadPaymentProviders(): void {
    let fiatCurrency = '';
    if (this.summary.transactionType === TransactionType.Deposit) {
      fiatCurrency = this.summary.currencyFrom;
    } else if (this.summary.transactionType === TransactionType.Withdrawal) {
      fiatCurrency = this.summary.currencyTo;
    }
    const providersData = this.paymentService.getProviders(fiatCurrency, (this.widgetId !== '') ? this.widgetId : undefined);
    if (providersData === null) {
      this.onError.emit(this.errorHandler.getRejectedCookieMessage());
    } else {
      this.onProgress.emit(true);
      this.pSubscriptions.add(
        providersData.valueChanges.subscribe(({ data }) => {
          this.onProgress.emit(false);
          this.onComplete.emit(this.getPaymentProviderList(data.getAppropriatePaymentProviders as PaymentProviderByInstrument[]));
        }, (error) => {
          this.onProgress.emit(false);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid') {
            if (this.summary.email) {
              this.onAuthenticationRequired.emit(this.summary.email);
            } else {
              this.onIdentificationRequired.emit();
            }
          } else {
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load payment instruments'));
          }
        })
      );
    }
  }

  private getPaymentProviderList(list: PaymentProviderByInstrument[]): PaymentProviderInstrumentView[] {
    let currency = '';
    if (this.summary?.transactionType === TransactionType.Deposit) {
      currency = this.summary?.currencyFrom ?? '';
    } else if (this.summary?.transactionType === TransactionType.Withdrawal) {
      currency = this.summary?.currencyTo ?? '';
    }
    return list
      .filter(x => x.provider?.currencies?.includes(currency, 0) || x.instrument === PaymentInstrument.WireTransfer)
      .map(val => new PaymentProviderInstrumentView(val));
  }
}
