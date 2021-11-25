import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaymentInstrument, Rate, SettingsCurrencyWithDefaults, TransactionShort, TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { CheckoutSummary, CurrencyView, PaymentCompleteDetails } from 'src/app/model/payment.model';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { AuthService } from '../services/auth.service';
import { CommonDataService } from '../services/common-data.service';
import { WidgetPagerService } from '../services/widget-pager.service';

@Component({
  selector: 'app-send-widget',
  templateUrl: 'send.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class SendWidgetComponent implements OnInit {
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();

  errorMessage = '';
  rateErrorMessage = '';
  inProgress = false;
  initMessage = 'Initialization...';
  summary = new CheckoutSummary();
  cryptoList: CurrencyView[] = [];

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private exhangeRate: ExchangeRateService,
    public pager: WidgetPagerService,
    private router: Router,
    private authService: AuthService,
    private commonService: CommonDataService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService) { }

  ngOnInit(): void {
    this.initMessage = 'Initialization...';
    this.pager.init('initialization', 'Initialization');
    this.initData();
    this.loadCurrencyData();
    this.startExchangeRate();
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    this.exhangeRate.stop();
  }

  private initData(): void {
    this.initMessage = 'Initialization...';
    this.summary.agreementChecked = true;
    this.summary.email = '';
    this.summary.transactionType = TransactionType.Transfer;
    this.summary.address = '';
    this.summary.currencyFrom = this.authService.user?.defaultCryptoCurrency ?? 'BTC';
    this.summary.currencyTo = this.authService.user?.defaultFiatCurrency ?? 'EUR';
  }

  private startExchangeRate(): void {
    this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, TransactionType.Withdrawal);
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
    this.rateErrorMessage = error;
    if (rate) {
      this.summary.exchangeRate = rate;
    }
  }

  resetWizard(): void {
    this.summary.reset();
    this.initData();
    this.pager.init('', '');
    this.nextStage('send_details', 'Send details', 1);
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
  }

  handleAuthError(): void {
    this.router.navigateByUrl('/');
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  private stageBack(): void {
    this.inProgress = false;
    this.pager.goBack();
  }

  private nextStage(id: string, name: string, stepId: number): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.pager.nextStage(id, name, stepId, false, false);
    }, 50);
  }

  removeStage(stage: string) {
    this.pager.removeStage(stage);
  }

  private loadCurrencyData(): void {
    this.cryptoList = [];
    this.inProgress = true;
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.pSubscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          this.inProgress = false;
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
          if (currencySettings.settingsCurrency) {
            if (currencySettings.settingsCurrency.count ?? 0 > 0) {
              this.cryptoList = currencySettings.settingsCurrency.list?.
                filter(x => x.fiat === false).
                map((val) => new CurrencyView(val)) as CurrencyView[];
            }
          }
          this.nextStage('send_details', 'Send details', 1);
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.router.navigateByUrl('/');
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currencies');
          }
        })
      );
    }
  }

  // == Order details page ==
  orderDetailsChanged(data: CheckoutSummary): void {
    this.summary.initialized = true;
    this.summary.fee = 0;
    const amountFromTemp = (data.amountFrom) ? data.amountFrom?.toFixed(8) : undefined;
    this.summary.amountFrom = (amountFromTemp) ? parseFloat(amountFromTemp) : undefined;
    this.summary.amountFromPrecision = data.amountFromPrecision;
    this.summary.amountToPrecision = data.amountToPrecision;
    const currencyFromChanged = (this.summary.currencyFrom !== data.currencyFrom);
    this.summary.currencyFrom = data.currencyFrom;
    if (currencyFromChanged) {
      this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, TransactionType.Withdrawal);
      this.exhangeRate.update();
    }
  }

  orderWalletChanged(data: string | undefined): void {
    this.summary.address = data ?? '';
  }

  orderDetailsComplete(): void {
    this.desclaimerNext();
  }
  // =======================

  // == Disclaimer =========
  desclaimerBack(): void {
    this.stageBack();
  }

  desclaimerNext(): void {
    this.summary.agreementChecked = true;
  }
  // ================

  private createTransaction(providerId: string, instrument: PaymentInstrument): void {
    this.errorMessage = '';
    this.inProgress = true;
    const tempStageId = this.pager.swapStage('initialization');
    this.initMessage = 'Processing...';
    if (this.summary) {
      let destination = this.summary.address;
      this.pSubscriptions.add(
        this.dataService.createQuickCheckout(
          this.summary.transactionType,
          TransactionSource.Wallet,
          '',
          this.summary.currencyFrom,
          this.summary.currencyTo,
          this.summary.amountFrom ?? 0,
          instrument,
          providerId,
          '',
          destination
        ).subscribe(({ data }) => {
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.instrument = instrument;
            this.summary.orderId = order.code as string;
            this.summary.fee = order.feeFiat as number ?? 0;
            this.summary.feeMinFiat = order.feeMinFiat as number ?? 0;
            this.summary.feePercent = order.feePercent as number ?? 0;
            this.summary.networkFee = order.approxNetworkFee ?? 0;
            this.summary.transactionDate = new Date().toLocaleString();
            this.summary.transactionId = order.transactionId as string;
          } else {
            this.errorMessage = 'Order code is invalid';
            this.pager.swapStage(tempStageId);
          }
        }, (error) => {
          this.inProgress = false;
          this.pager.swapStage(tempStageId);
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
          }
        })
      );
    }
  }
}
