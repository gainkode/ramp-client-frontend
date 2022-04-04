import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingsCurrencyWithDefaults, TransactionType } from 'src/app/model/generated-models';
import { ErrorService } from 'src/app/services/error.service';
import { WireTransferBankAccountAu, WireTransferUserSelection } from '../model/cost-scheme.model';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { CheckoutSummary, CurrencyView } from '../model/payment.model';
import { CommonDataService } from '../services/common-data.service';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-buy-sell-fiat-widget',
  templateUrl: 'buy-sell-fiat.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class BuySellFiatWidgetComponent implements OnInit {
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  errorMessage = '';
  inProgress = false;
  initState = true;
  stageId = 'order_details';
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();
  initMessage = 'Loading...';
  cryptoList: CurrencyView[] = [];
  wireTransferList: WireTransferPaymentCategoryItem[] = [];
  bankAccountId = '';

  private pSubscriptions: Subscription = new Subscription();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private widgetService: WidgetService,
    private commonService: CommonDataService,
    private errorHandler: ErrorService,
    private router: Router) { }

  ngOnInit(): void {
    this.summary.transactionType = TransactionType.DepositFiat;
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

  depositDetailsComplete(data: CheckoutSummary): void {
    this.summary.currencyTo = data.currencyTo;
    this.summary.amountTo = data.amountTo;
    const widget = new WidgetSettings();
    widget.embedded = true;
    this.widgetService.getWireTransferSettings(this.summary, widget);
  }

  paymentBack(): void {
    this.stageId = 'deposiit_details';
    this.title = 'Deposit details';
  }

  wireTransferPaymentComplete(data: WireTransferUserSelection): void {
    const settings = {
      settingsCostId: data.id,
      accountType: data.selected
    };
    const settingsData = JSON.stringify(settings);
    //this.createTransaction('', PaymentInstrument.WireTransfer, settingsData);
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
        this.stageId = 'deposiit_details';
        this.title = 'Deposit details';
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




      bankAccountId = 'rhbreh';
      const au = {
        accountName: 'name',
        accountNumber: 'number',
        bsb: 'BSB'
      } as WireTransferBankAccountAu;
      wireTransferList.push({
        id: WireTransferPaymentCategory.AU,
        title: 'Test title',
        data: JSON.stringify(au)
      } as WireTransferPaymentCategoryItem);
      this.initMessage = '';
      this.stageId = 'transfer';
      this.title = 'Transfer';





      //this.errorMessage = 'No settings found for wire transfer';
    }
  }
}
