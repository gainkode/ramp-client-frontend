import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaymentInstrument, SettingsCurrencyWithDefaults, TransactionShort, TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { ErrorService } from 'src/app/services/error.service';
import { CommonDialogBox } from '../components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from '../model/cost-scheme.model';
import { PaymentCompleteDetails, PaymentErrorDetails, PaymentWidgetType, WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { CheckoutSummary, CurrencyView } from '../model/payment.model';
import { CommonDataService } from '../services/common-data.service';
import { PaymentDataService } from '../services/payment.service';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-fiat-widget',
  templateUrl: 'fiat.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class FiatWidgetComponent implements OnInit {
  @Input() set settings(val: WidgetSettings | undefined) {
    if (val) {
      this.widgetSettings = val;
      this.summary.transactionType = val.transaction ?? TransactionType.Deposit;
    }
  }
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  errorMessage = '';
  inProgress = false;
  initState = true;
  stageId = 'order_details';
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();
  widgetSettings: WidgetSettings = new WidgetSettings();
  initMessage = 'Loading...';
  cryptoList: CurrencyView[] = [];
  wireTransferList: WireTransferPaymentCategoryItem[] = [];
  bankAccountId = '';
  selectedWireTransfer: WireTransferPaymentCategoryItem = {
    id: WireTransferPaymentCategory.AU,
    title: '',
    data: ''
  }

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    public dialog: MatDialog,
    private widgetService: WidgetService,
    private commonService: CommonDataService,
    private dataService: PaymentDataService,
    private errorHandler: ErrorService,
    private router: Router) {
    this.widgetSettings.embedded = true;
  }

  ngOnInit(): void {
    this.initMessage = 'Loading...';
    this.stageId = 'initialization';
    this.title = 'Initialization';
    this.widgetService.register(
      this.progressChanged.bind(this),
      this.handleError.bind(this),
      this.onIdRequired.bind(this),
      this.onAuthRequired.bind(this),
      () => { },
      () => { },
      () => { },
      () => { },
      () => { },
      this.onWireTransferListLoaded.bind(this)
    );
    this.loadCurrencyData();
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

  orderDetailsComplete(data: CheckoutSummary): void {
    this.summary.currencyTo = data.currencyTo;
    this.summary.amountTo = data.amountTo;
    if (this.summary.transactionType === TransactionType.Deposit) {
      this.widgetService.getWireTransferSettings(this.summary, this.widgetSettings);
    } else {
      this.stageId = 'sell_details';
      this.title = 'Sell Details';
    }
  }

  paymentBack(): void {
    this.stageId = 'order_details';
    this.title = 'Order details';
  }

  wireTransferPaymentComplete(data: WireTransferUserSelection): void {
    this.selectedWireTransfer = data.selected;
    const settings = {
      settingsCostId: data.id,
      accountType: data.selected
    };
    const settingsData = JSON.stringify(settings);
    this.createTransaction(PaymentInstrument.WireTransfer, settingsData);
  }

  sellComplete(instrumentDetails: string): void {
    const settings = {
      accountType: instrumentDetails
    };
    const settingsData = JSON.stringify(settings);
    this.createTransaction(undefined, settingsData);
  }

  processingComplete(): void {
    const details = new PaymentCompleteDetails();
    details.paymentType = (this.widgetSettings.transaction === TransactionType.Deposit) ?
      PaymentWidgetType.Deposit :
      PaymentWidgetType.Withdrawal;
    details.amount = parseFloat(this.summary.amountTo?.toFixed(this.summary.amountToPrecision) ?? '0');
    details.currency = this.summary.currencyTo;
    this.onComplete.emit(details);
  }

  sendWireTransaferMessage(): void {
    this.widgetService.sendWireTransferMessage(
      this.summary.email,
      this.summary.transactionId,
      this.sendWireTransaferMessageResult.bind(this)
    )
  }

  sendWireTransaferMessageResult(): void {
    this.dialog.open(CommonDialogBox, {
      width: '450px',
      data: {
        title: 'Payment',
        message: 'Message has been sent successfully'
      }
    });
  }

  resetWizard(): void {
    this.summary.reset();
    this.stageId = 'order_details';
    this.title = 'Order details';
  }

  private onAuthRequired(email: string): void {
    this.router.navigateByUrl('/');
  }

  private onIdRequired(): void {
    this.router.navigateByUrl('/');
  }

  private loadCurrencyData(): void {
    this.cryptoList = [];
    this.inProgress = true;
    const currencyData = this.commonService.getSettingsCurrency();
    this.pSubscriptions.add(
      currencyData.valueChanges.subscribe(({ data }) => {
        this.inProgress = false;
        const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        if (currencySettings.settingsCurrency) {
          if (currencySettings.settingsCurrency.count ?? 0 > 0) {
            this.cryptoList = currencySettings.settingsCurrency.list?.
              filter(x => x.fiat === true).
              map((val) => new CurrencyView(val)) as CurrencyView[];
          }
        }
        this.stageId = 'order_details';
        this.title = 'Order details';
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

  private onWireTransferListLoaded(wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string): void {
    this.bankAccountId = bankAccountId;
    this.wireTransferList = wireTransferList;
    if (this.wireTransferList.length > 1) {
      this.initMessage = '';
      this.stageId = 'transfer';
      this.title = 'Transfer';
    } else {
      this.errorMessage = 'No settings found for wire transfer';
    }
  }

  private createTransaction(instrument: PaymentInstrument | undefined, instrumentDetails: string): void {
    this.errorMessage = '';
    this.inProgress = true;
    this.pSubscriptions.add(
      this.dataService.createTransaction(
        this.summary.transactionType,
        TransactionSource.Wallet,
        '',
        this.summary.currencyTo,
        this.summary.currencyTo,
        this.summary.amountTo ?? 0,
        instrument,
        instrumentDetails,
        '',
        '',
        ''
      ).subscribe(({ data }) => {
        const order = data.createTransaction as TransactionShort;
        this.inProgress = false;
        if (order.code) {
          this.summary.instrument = instrument;
          this.summary.orderId = order.code ?? '';
          this.summary.fee = order.feeFiat ?? 0;
          this.summary.feeMinFiat = order.feeMinFiat ?? 0;
          this.summary.feePercent = order.feePercent ?? 0;
          this.summary.networkFee = order.approxNetworkFee ?? 0;
          this.summary.transactionDate = new Date().toLocaleString();
          this.summary.transactionId = order.transactionId as string;
          this.initMessage = '';
          if (this.summary.transactionType === TransactionType.Deposit) {
            this.stageId = 'transfer_result';
            this.title = 'Transfer Result';
          } else {
            this.stageId = 'complete';
            this.title = 'Complete';
          }
        } else {
          this.errorMessage = 'Order code is invalid';
          this.onError.emit({
            errorMessage: this.errorMessage,
            paymentType: (this.widgetSettings.transaction === TransactionType.Deposit) ?
              PaymentWidgetType.Deposit :
              PaymentWidgetType.Withdrawal
          } as PaymentErrorDetails);
        }
      }, (error) => {
        this.inProgress = false;
        if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
          this.onError.emit({
            errorMessage: this.errorMessage,
            paymentType: (this.widgetSettings.transaction === TransactionType.Deposit) ?
              PaymentWidgetType.Deposit :
              PaymentWidgetType.Withdrawal
          } as PaymentErrorDetails);
        }
      })
    );
  }
}
