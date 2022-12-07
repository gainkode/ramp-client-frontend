import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AssetAddressShortListResult, KycProvider, LoginResult, PaymentInstrument, PaymentPreauthResultShort, PaymentProviderByInstrument, Rate, TextPage, TransactionShort, TransactionSource, TransactionType, Widget } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, PaymentProviderInstrumentView } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { environment } from 'src/environments/environment';
import { CommonDialogBox } from '../components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from '../model/cost-scheme.model';
import { completeDataDefault, disclaimerDataDefault } from '../model/custom-data.model';
import { PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings, WireTransferPaymentCategory, WireTransferPaymentCategoryItem } from '../model/payment-base.model';
import { WalletItem } from '../model/wallet.model';
import { CommonDataService } from '../services/common-data.service';
import { EnvService } from '../services/env.service';
import { ProfileDataService } from '../services/profile.service';
import { WidgetPagerService } from '../services/widget-pager.service';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-widget',
  templateUrl: 'widget.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class WidgetComponent implements OnInit {
  @Input() userParamsId = '';
  @Input() quickCheckout = false;
  @Input() settings: WidgetSettings | undefined = undefined;
  @Input() shuftiSubscribeResult: boolean | undefined = undefined;
  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  requiredFields: string[] = [];
  errorMessage = '';
  rateErrorMessage = '';
  transactionErrorTitle = '';
  transactionErrorMessage = '';
  transactionErrorTryAgain = true;
  inProgress = false;
  initLoading = true;
  internalPayment = false;
  initState = true;
  showSummary = true;
  mobileSummary = false;
  requiredExtraData = false;
  initMessage = 'Loading...';
  summary = new CheckoutSummary();
  widget = new WidgetSettings();
  userWallets: WalletItem[] = [];
  exchangeRateCountDownTitle = '';
  exchangeRateCountDownValue = '';
  paymentProviders: PaymentProviderInstrumentView[] = [];
  bankAccountId = '';
  wireTransferList: WireTransferPaymentCategoryItem[] = [];
  selectedWireTransfer: WireTransferPaymentCategoryItem = {
    id: WireTransferPaymentCategory.AU,
    bankAccountId: '',
    title: '',
    data: ''
  }
  requestKyc = false;
  overLimitLevel = '';
  iframeContent = '';
  instantpayDetails = '';
  paymentComplete = false;
  notificationStarted = false;
  recentTransactions = false;
  introDisclaimerBack = false;
  logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
  logoAlt = EnvService.product;
  disclaimerTextData = disclaimerDataDefault;
  completeTextData = completeDataDefault;

  private pSubscriptions: Subscription = new Subscription();
  private pNotificationsSubscription: Subscription | undefined = undefined;

  get showTransactionsLink(): boolean {
    const user = this.auth.user;
    if (user && this.auth.authenticated) {
      return true;
    }
    return false;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    public router: Router,
    public dialog: MatDialog,
    public pager: WidgetPagerService,
    private exhangeRate: ExchangeRateService,
    private widgetService: WidgetService,
    private notification: NotificationService,
    public auth: AuthService,
    private commonService: CommonDataService,
    private dataService: PaymentDataService,
    private profileService: ProfileDataService,
    private errorHandler: ErrorService) { }
    private shuftiSubscriptionFlag: boolean = false;

  ngOnInit(): void {
    this.widgetService.register(
      this.progressChanged.bind(this),
      this.handleError.bind(this),
      this.settingsIdRequired.bind(this),
      this.settingsAuthRequired.bind(this),
      this.onLoginRequired.bind(this),
      this.checkLoginResult.bind(this),
      this.onCodeLoginRequired.bind(this),
      this.settingsKycState.bind(this),
      this.settingsCommonComplete.bind(this),
      this.onWireTransferListLoaded.bind(this),
      this.userInfoRequired.bind(this)
    );
    this.initMessage = 'Loading...';

    // this.summary.orderId = 'ID1351816';
    // this.selectedWireTransfer.id = WireTransferPaymentCategory.EU;
    // this.selectedWireTransfer.title = 'Title';
    // const dataObject = {
    //   bankAddress: 'A5-3 Room, Floor 23, 8 Canada Square, London, England, UK, E14 5HQ',
    //   bankName: 'HSBC',
    //   beneficiaryAddress: 'Apartment 8, Rue Paul Janson 50, 6150 Anderlues, Belgium',
    //   beneficiaryName: 'Mister John Doe',
    //   iban: 'EG810025025800000258946648241',
    //   swiftBic: 'HSBCTRI2516'
    // };
    // this.selectedWireTransfer.data = JSON.stringify(dataObject);
    // this.pager.init('wire_transfer_result', 'Initialization');

    this.pager.init('initialization', 'Initialization');
    this.loadCustomData();
    this.startExchangeRate();
    
    if(!this.shuftiSubscriptionFlag){
      this.startShuftiNotificationListener();
    }
  }

  private initPage(): void {
    this.initLoading = false;
    if (this.userParamsId === '') {
      if (this.settings) {
        this.widget = this.settings;
      }
      if (this.widget.embedded) {
        this.pager.init('initialization', 'Initialization');
        this.loadUserWallets();
      } else {
        if (this.quickCheckout) {
          this.pager.init('order_details', 'Order details');
        } else {
          this.pager.init('intro_disclaimer', 'Disclaimer');
        }
        this.initData(undefined);
      }
    } else {
      this.pager.init('initialization', 'Initialization');
      this.loadUserParams();
    }
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
    this.stopNotificationListener();
    this.exhangeRate.stop();
  }

  private initData(data: Widget | undefined): void {
    this.requiredExtraData = false;
    this.initMessage = 'Loading...';
    if (data) {
      this.widget.allowToPayIfKycFailed = data.allowToPayIfKycFailed ?? false;
      let userParams: Record<string, any> = {};
      if (data.additionalSettings) {
        //{"minAmountFrom":0,"maxAmountFrom":0,"fixedAmountFrom":0,"kycBeforePayment":false,"disclaimer":true}
        const extraData = JSON.parse(data.additionalSettings);
        this.widget.disclaimer = extraData.disclaimer ?? true;
        this.widget.kycFirst = extraData.kycBeforePayment ?? false;
        this.widget.minAmountFrom = extraData.minAmountFrom;
        this.widget.maxAmountFrom = extraData.maxAmountFrom;
      } else {
        this.widget.disclaimer = true;
        this.widget.kycFirst = false;
      }
      let userTransaction: TransactionType | undefined = undefined;
      let presetAddress = false;

      this.widget.widgetId = data.widgetId;
      this.widget.email = data.currentUserEmail ?? '';
      this.widget.walletAddressPreset = data.hasFixedAddress ?? false;
      
      if (data.currentUserParams) {
        userParams = JSON.parse(data.currentUserParams);
        if (userParams.params) {
          if (userParams.params.amount) {
            this.widget.amountFrom = userParams.params.amount;
            this.summary.amountFrom = this.widget.amountFrom;
          }
          if (userParams.params.currency) {
            this.widget.currencyFrom = userParams.params.currency;
            this.summary.currencyFrom = this.widget.currencyFrom;
          }
          if (userParams.params.convertedCurrency) {
            this.widget.currencyTo = userParams.params.convertedCurrency;
            this.summary.currencyTo = this.widget.currencyTo;
          }
          if (userParams.params.transactionType) {
            userTransaction = userParams.params.transactionType;
          }
          if (userParams.params.destination) {
            presetAddress = true;
          }
        }
      }
      
      if(!this.widget.walletAddressPreset){
        this.summary.address = (userParams?.params?.destination) ? userParams.params.destination : 
        (data?.destinationAddress) ? data?.destinationAddress : '';
      }
      
      if (presetAddress) {
        this.widget.walletAddressPreset = true;
      }
      // if (this.quickCheckout) {
      //   this.widget.walletAddressPreset = false;
      // }
      this.widget.transaction = undefined;
      if (data.currenciesCrypto) {
        if (data.currenciesCrypto.length > 0) {
          this.widget.cryptoList = data.currenciesCrypto.map(val => val);
        }
      }
      if (data.currenciesFiat) {
        if (data.currenciesFiat.length > 0) {
          this.widget.fiatList = data.currenciesFiat.map(val => val);
        }
      }
      if (userTransaction) {
        this.widget.transaction = userTransaction;
      } else {
        if (data.transactionTypes) {
          if (data.transactionTypes.length > 0) {
            const apropriateTransactions = data.transactionTypes.
              filter(x => x === TransactionType.Buy || x === TransactionType.Sell);
            if (apropriateTransactions.length > 0) {
              this.widget.transaction = apropriateTransactions[0];
            } else {
              this.widget.transaction = data.transactionTypes[0];
            }
          }
        }
      }
      this.widget.source = (this.quickCheckout) ? TransactionSource.QuickCheckout : TransactionSource.Widget;
    } else {  // Quick checkout w/o parameters
      if (!this.widget.embedded) {
        this.widget.disclaimer = false;
        this.widget.kycFirst = false;
        this.widget.email = '';
        // temp
        //this.widget.kycFirst = true;
        //this.widget.email = 'tugaymv@gmail.com';
        //this.widget.disclaimer = true;
        this.widget.transaction = TransactionType.Buy;
        //temp
        this.widget.source = TransactionSource.QuickCheckout;
      }
      if (this.widget.amountFrom !== 0) {
        this.summary.amountFrom = this.widget.amountFrom;
      }
      if (this.widget.currencyFrom !== '') {
        this.summary.currencyFrom = this.widget.currencyFrom;
      }
      if (this.widget.currencyTo !== '') {
        this.summary.currencyTo = this.widget.currencyTo;
      }
    }
    if (!this.widget.disclaimer) {
      this.summary.agreementChecked = true;
    }
    if (this.widget.email) {
      this.summary.email = this.widget.email;
    } else {
      const user = this.auth.user;
      if (user) {
        this.summary.email = this.auth?.user?.email ?? '';
      }
    }
    if (this.widget.transaction) {
      this.summary.transactionType = this.widget.transaction;
    }
  }

  private startExchangeRate(): void {
    this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  private startNotificationListener(): void {
    this.notificationStarted = true;
    this.pNotificationsSubscription = this.notification.subscribeToTransactionNotifications().subscribe(
      ({ data }) => {
        this.handleTransactionSubscription(data);
      },
      (error) => {
        this.notificationStarted = false;
        // there was an error subscribing to notifications
        if (!environment.production) {
          console.error('Notifications error', error);
        }
      }
    );
  }

  private startShuftiNotificationListener(): void {
    if(this.auth.user && this.auth.user?.kycProvider == KycProvider.Shufti && this.auth.user?.kycValid != true){
      console.log('Shufti completed notifications subscribed')
      this.shuftiSubscriptionFlag = true;
      this.pSubscriptions.add(
          this.notification.subscribeToKycCompleteNotifications().subscribe(
            ({ data }) => {
                const subscriptionData = data.kycCompletedNotification;
                console.log('Shufti completed', subscriptionData);
                if(subscriptionData.kycStatus == 'completed'){
                    if (subscriptionData.kycValid === true) {
                        this.shuftiSubscribeResult = true;
                    }else{
                        console.log('Shufti rejected')
                        this.shuftiSubscribeResult = false;
                    }
                }
            },
            (error) => {
              this.shuftiSubscriptionFlag = false;
              console.error('KYC complete notification error', error);
            }
        )
      )
    }
    // }
  }

  private stopNotificationListener(): void {
    if (this.pNotificationsSubscription) {
      this.pNotificationsSubscription.unsubscribe();
    }
    this.pNotificationsSubscription = undefined;
    this.notificationStarted = false;
  }

  private handleTransactionSubscription(data: any): void {
    let res = false;
    if (data.transactionServiceNotification.type === 'PaymentStatusChanged') {
      res = true;
    } else {
      console.error('transactionApproved: unexpected type', data.transactionServiceNotification.type);
    }
    if (res) {
      if (data.transactionServiceNotification.userId === this.auth.user?.userId) {
        res = true;
      } else {
        console.error('transactionApproved: unexpected userId', data.transactionServiceNotification.userId);
      }
    }
    if (res) {
      if (data.transactionServiceNotification.operationStatus === 'approved' ||
        data.transactionServiceNotification.operationStatus === 'declined' ||
        data.transactionServiceNotification.operationStatus === 'error') {
        res = true;
      } else {
        console.error('transactionApproved: unexpected operationStatus', data.transactionServiceNotification.operationStatus);
      }
    }
    if (res) {
      if (data.transactionServiceNotification.operationType === 'preauth' ||
        data.transactionServiceNotification.operationType === 'approved') {
        res = true;
      } else {
        console.error('transactionApproved: unexpected operationType', data.transactionServiceNotification.operationType);
      }
    }
    if (res) {
      this.paymentComplete = true;
    }
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
    this.exchangeRateCountDownTitle = countDownTitle;
    this.exchangeRateCountDownValue = countDownValue;
    this.rateErrorMessage = error;
    if (rate) {
      this.summary.exchangeRate = rate;
    }
  }

  resetWizard(): void {
    this.inProgress = false;
    this.requiredExtraData = false;
    this.summary.reset();
    if (this.userParamsId === '') {
      this.initData(undefined);
      if (this.widget.orderDefault) {
        this.orderDetailsComplete(this.summary.email);
      } else {
        this.pager.init('', '');
        this.nextStage('order_details', 'Order details', 1, false);
      }
    } else {
      this.loadUserParams();
    }
  }

  handleError(message: string): void {
    this.setError('Transaction failed', message, 'handleError');
  }
  handleReject(): void {
    console.log(this.widget.kycFirst, this.widget.allowToPayIfKycFailed, this.paymentProviders)
    if (this.widget.kycFirst && this.widget.allowToPayIfKycFailed) {
      if (this.paymentProviders.length < 1) {
        this.setError(
          'No payment providers',
          `No supported payment providers found for "${this.summary.currencyFrom}"`,
          'kycComplete');
      } else if (this.paymentProviders.length > 1) {
        this.nextStage('payment', 'Payment info', 5, true);
      } else {
        this.selectProvider(this.paymentProviders[0]);
      }
    }
  }
  handleAuthError(): void {
    if (this.widget.embedded) {
      this.router.navigateByUrl('/');
    } else {
      if (this.widget.orderDefault) {
        this.nextStage('login_auth', 'Authorization', 3, true);
      } else {
        this.nextStage('order_details', 'Order details', 1, false);
      }
    }
  }

  progressChanged(visible: boolean): void {
    this.inProgress = visible;
    this.changeDetector.detectChanges();
  }

  showTransactions(): void {
    this.recentTransactions = true;
  }

  transactionsBack(): void {
    this.recentTransactions = false;
    this.mobileSummary = false;
  }

  private stageBack(): void {
    this.inProgress = false;
    const stage = this.pager.goBack();
    if (stage) {
      this.showSummary = stage.summary;
    }
  }

  private nextStage(id: string, name: string, stepId: number, summaryVisible: boolean): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.pager.nextStage(id, name, stepId, this.showSummary);
      this.showSummary = summaryVisible;
      this.inProgress = false;
    }, 50);
  }

  removeStage(stage: string) {
    this.pager.removeStage(stage);
  }

  private loadCustomData(): void {
    this.errorMessage = '';
    const widgetData = this.commonService.getCustomText().valueChanges.pipe(take(1));
    this.inProgress = true;
    this.pSubscriptions.add(
      widgetData.subscribe(({ data }) => {
        this.inProgress = false;
        if (data.getTextPages) {
          const pagesData = data.getTextPages as TextPage[];
          this.disclaimerTextData = pagesData.filter(x => x.page === 1).map(x => x.text ?? '').filter(x => x !== '');
          this.completeTextData = pagesData.filter(x => x.page === 2).map(x => x.text ?? '').filter(x => x !== '');
        }
        this.initPage();
      }, (error) => {
        this.inProgress = false;
        this.initPage();
      })
    );
  }

  private loadUserParams(): void {
    this.errorMessage = '';
    const widgetData = this.dataService.getWidget(this.userParamsId).valueChanges.pipe(take(1));
    this.inProgress = true;
    this.pSubscriptions.add(
      widgetData.subscribe(({ data }) => {
        this.inProgress = false;
        this.initData(data.getWidget as Widget);
        let validTransactionType = true;
        if (this.widget.transaction) {
          validTransactionType = (this.widget.transaction === TransactionType.Buy ||
            this.widget.transaction === TransactionType.Sell);
        }
        if (validTransactionType) {
          if (this.widget.orderDefault) {
            if (this.auth.user?.email !== this.widget.email) {
              this.summary.email = '';
            }
            this.orderDetailsComplete(this.widget.email);
          } else {
            if (this.quickCheckout || this.summary.agreementChecked) {
              this.pager.init('order_details', 'Order details');
            } else {
              this.pager.init('intro_disclaimer', 'Disclaimer');
            }
          }
        } else {
          this.showTransactionError(
            'Wrong widget settings',
            `Incorrect transaction type: ${this.widget.transaction}`,
            false);
        }
      }, (error) => {
        this.inProgress = false;
        this.initData(undefined);
        this.pager.init('order_details', 'Order details');
      })
    );
  }

  loadUserWallets(): void {
    this.errorMessage = '';
    this.inProgress = true;
    const walletData = this.profileService.getMyWallets([]).valueChanges.pipe(take(1));
    this.pSubscriptions.add(
      walletData.subscribe(({ data }) => {
        this.inProgress = false;
        const dataList = data.myWallets as AssetAddressShortListResult;
        if (dataList !== null) {
          const walletCount = dataList?.count as number;
          if (walletCount > 0) {
            this.userWallets = dataList?.list?.map((val) => new WalletItem(val, '', undefined)) as WalletItem[];
          }
        }
        this.initData(undefined);
        this.pager.init('order_details', 'Order details');
      }, (error) => {
        this.inProgress = false;
        this.initData(undefined);
        this.pager.init('order_details', 'Order details');
      })
    );
  }

  // == Order details page ==
  orderDetailsChanged(data: CheckoutSummary): void {
    this.stopNotificationListener();
    if (this.initState && (data.amountFrom || data.amountTo)) {
      this.initState = false;
    }
    this.summary.initialized = true;
    this.summary.fee = 0;
    const amountFromTemp = (data.amountFrom) ? data.amountFrom?.toFixed(8) : undefined;
    this.summary.amountFrom = (amountFromTemp) ? parseFloat(amountFromTemp) : undefined;
    const amountToTemp = (data.amountTo) ? data.amountTo?.toFixed(8) : undefined;
    this.summary.amountTo = (amountToTemp) ? parseFloat(amountToTemp) : undefined;
    this.summary.amountFromPrecision = data.amountFromPrecision;
    this.summary.amountToPrecision = data.amountToPrecision;
    const currencyFromChanged = (this.summary.currencyFrom !== data.currencyFrom);
    const currencyToChanged = (this.summary.currencyTo !== data.currencyTo);
    this.summary.currencyFrom = data.currencyFrom;
    this.summary.currencyTo = data.currencyTo;
    this.summary.transactionType = data.transactionType;
    this.summary.quoteLimit = data.quoteLimit;
    if (currencyFromChanged || currencyToChanged) {
      this.exhangeRate.setCurrency(this.summary.currencyFrom, this.summary.currencyTo, this.summary.transactionType);
      this.exhangeRate.update();
    }
  }

  orderQuoteChanged(quote: number): void {
    this.summary.quoteLimit = quote;
  }

  orderWalletChanged(data: CheckoutSummary): void {
    this.summary.address = data.address ?? '';
    this.summary.vaultId = data.vaultId ?? '';
  }

  orderVerifyWhenPaidChanged(val: boolean): void {
    this.summary.verifyWhenPaid = val;
  }

  orderDetailsComplete(email: string): void {
    if (this.summary.email === email) {
      // if (this.summary.agreementChecked) {
      //   this.desclaimerNext();
      // } else {
      //   this.nextStage('disclaimer', 'Disclaimer', 2, false);
      // }
      this.disclaimerNext();
    } else {
      this.summary.transactionId = '';
      this.summary.fee = 0;
      this.summary.email = email;
      this.widgetService.authenticate(email, this.widget.widgetId);
    }
  }
  // =======================

  // == Sell ===============
  sellComplete(instrumentDetails: string): void {
    const settings = {
      accountType: instrumentDetails
    };
    const settingsData = JSON.stringify(settings);
    this.createSellTransaction(settingsData);
  }
  // =======================

  // == Disclaimer =========
  disclaimerBack(): void {
    this.stageBack();
  }

  disclaimerNext(): void {
    this.summary.agreementChecked = true;
    if (this.summary.transactionType === TransactionType.Sell) {
      this.nextStage('sell_details', 'Bank details', 2, true);
      //this.createWithdrawalTransaction();
    } else {
      this.widgetService.getSettingsCommon(this.summary, this.widget, this.widget.orderDefault);
    }
  }

  introDisclaimerNext(): void {
    this.summary.agreementChecked = true;
    let validTransactionType = true;
    if (this.widget.transaction) {
      validTransactionType = (this.widget.transaction === TransactionType.Buy ||
        this.widget.transaction === TransactionType.Sell);
    }
    if (this.widget.orderDefault && validTransactionType) {
      if (this.auth.user?.email !== this.widget.email) {
        this.summary.email = '';
      }
      this.orderDetailsComplete(this.widget.email);
    } else {
      this.pager.init('order_details', 'Order details');
    }
  }
  // ================

  // == Common settings ==
  settingsAuthRequired(email: string): void {
    this.widgetService.authenticate(this.summary.email, this.widget.widgetId);
  }

  settingsIdRequired(): void {
    if (this.widget.orderDefault) {
      this.orderDetailsComplete(this.summary.email);
    } else {
      this.nextStage('order_details', 'Order details', 1, true);
    }
  }

  private settingsKycState(state: boolean, level: string): void {
    if (this.summary.quoteLimit !== 0) {
      this.widget.kycFirst = true;
    }
    if (level !== '') {
      this.overLimitLevel = level;
    }
    this.requestKyc = state;// || this.summary.quoteLimit !== 0;
  }

  private settingsCommonComplete(providers: PaymentProviderInstrumentView[]): void {
    this.paymentProviders = providers.map(val => val);


    //test
    // const wt = this.paymentProviders.find(x => x.instrument === PaymentInstrument.WireTransfer);
    // if (wt) {
    //   wt.id = 'Openpayd';
    // }


    const nextStage = 4;

    console.log(this.widget.kycFirst, this.requestKyc, this.widget.embedded);
    if (this.widget.kycFirst && !this.widget.embedded) {
      this.nextStage('verification', 'Verification', nextStage, false);
    } else {
      if (this.paymentProviders.length < 1) {
        this.setError(
          'Payment providers not found',
          `No supported payment providers found for "${this.summary.currencyFrom}"`,
          'settingsCommonComplete');
      } else if (this.paymentProviders.length > 1) {
        if (!this.notificationStarted) {
          this.startNotificationListener();
        }
        this.nextStage('payment', 'Payment info', nextStage, true);
      } else {
        this.selectProvider(this.paymentProviders[0]);
      }
    }
  }
  // =====================

  // == Payment info ==
  paymentBack(): void {
    this.stageBack();
  }

  selectProvider(provider: PaymentProviderInstrumentView) {
    if (provider.instrument === PaymentInstrument.WireTransfer) {
      this.summary.providerView = this.paymentProviders.find(x => x.id === provider.id);
      this.startPayment();
    } else {
      this.createBuyTransaction(provider.id, provider.instrument, '');
    }
  }
  // ====================

  // == Credit card ==
  creditCardPaymentComplete(data: CardView): void {
    this.paymentComplete = false;
    this.completeCreditCardTransaction(this.summary.transactionId, this.summary.providerView?.id ?? '', data);
  }

  // ====================

  // == Wire transfer ==
  wireTransferPaymentComplete(data: WireTransferUserSelection): void {
    this.selectedWireTransfer = data.selected;
    const settings = {
      settingsCostId: data.id,
      accountType: data.selected
    };
    const settingsData = JSON.stringify(settings);
    this.createBuyTransaction(this.summary.providerView?.id ?? '', PaymentInstrument.WireTransfer, settingsData);
  }

  sendWireTransaferMessageResult(): void {
    this.dialog.open(CommonDialogBox, {
      width: '450px',
      data: {
        title: 'Email Sent',
        message: 'Bank details has been sent to your Email address'
      }
    });
  }

  sendWireTransaferMessage(): void {
    this.widgetService.sendWireTransferMessage(
      this.summary.email,
      this.summary.transactionId,
      this.sendWireTransaferMessageResult.bind(this)
    )
  }

  // ====================

  // == Payment ===========
  requiredFieldsComplete(): void {
    this.widgetService.getWireTransferSettings(this.summary, this.widget);
  }

  processingComplete(): void {
    if (this.widget.embedded) {
      const details = new PaymentCompleteDetails();
      details.amount = parseFloat(this.summary.amountTo?.toFixed(this.summary.amountToPrecision) ?? '0');
      details.currency = this.summary.currencyTo;
      this.onComplete.emit(details);
    } else {
      if (!this.widget.kycFirst && this.requestKyc && !this.widget.embedded) {
        this.nextStage('verification', 'Verification', 5, false);
      } else {
        this.nextStage('complete', 'Complete', 6, false);
      }
    }
  }
  // ======================

  // == Auth ========
  onRegister(email: string): void {
    this.summary.email = email;
    this.nextStage('register', 'Authorization', 3, true);
  }

  registerBack(): void {
    this.stageBack();
  }

  onLoginRequired(email: string): void {
    if (this.widget.embedded) {
      this.router.navigateByUrl('/');
    } else {
      const currentEmail = this.auth.user?.email ?? '';
      if (currentEmail !== email) {
        this.auth.logout();
        this.summary.transactionId = '';
        this.summary.fee = 0;
      }
      this.summary.email = email;
      if (this.summary.transactionId === '') {
        this.nextStage('login_auth', 'Authorization', 3, true);
      } else {
        this.startPayment();
      }
    }
  }

  onCodeLoginRequired(email: string): void {
    this.summary.email = email;
    this.nextStage('code_auth', 'Authorization', 3, true);
  }

  loginCodeConfirmed(): void {
    this.widgetService.getSettingsCommon(this.summary, this.widget, true);
  }

  loginComplete(data: LoginResult): void {
    this.checkLoginResult(data);
  }

  loginBack(): void {
    this.stageBack();
  }
  // ====================

  // == Identification ==
  identificationComplete(data: LoginResult): void {
    this.auth.setLoginUser(data);
    this.summary.email = data.user?.email ?? '';
    this.widgetService.getSettingsCommon(this.summary, this.widget, false);
  }

  identificationBack(): void {
    this.stageBack();
  }
  // ====================

  // == KYC =============
  kycBack(): void {
    this.stageBack();
  }

  kycComplete(): void {
    if (this.widget.kycFirst) {
      if (this.paymentProviders.length < 1) {
        this.setError(
          'No payment providers',
          `No supported payment providers found for "${this.summary.currencyFrom}"`,
          'kycComplete');
      } else if (this.paymentProviders.length > 1) {
        this.nextStage('payment', 'Payment info', 5, true);
      } else {  
        this.selectProvider(this.paymentProviders[0]);
      }
    } else {
      this.nextStage('complete', 'Complete', 6, false);
    }
  }
  // ====================

  private checkLoginResult(data: LoginResult) {
    this.stopNotificationListener();
    if (data.user) {
      this.summary.email = data.user?.email;
    }
    if (data.authTokenAction === 'Default' || data.authTokenAction === 'KycRequired') {
      this.auth.setLoginUser(data);
      
      if(!this.shuftiSubscriptionFlag){
        this.startShuftiNotificationListener();
      }

      if (this.summary.agreementChecked) {
        if (this.summary.transactionId === '') {
          this.disclaimerNext();
        } else {
          this.startPayment();
        }
      } else {
        this.nextStage('disclaimer', 'Disclaimer', 2, false);
      }
    } else if (data.authTokenAction === 'UserInfoRequired') {
      this.auth.setLoginUser(data);
      this.requiredExtraData = true;
      this.nextStage('login_auth', 'Authorization', 3, true);
    } else {
      this.setError(
        'Authentication failed',
        `Unable to authenticate user with the action "${data.authTokenAction}"`,
        'checkLoginResult');
    }
  }

  private createBuyTransaction(providerId: string, instrument: PaymentInstrument, instrumentDetails: string): void {
    this.errorMessage = '';
    this.inProgress = true;
    const tempStageId = this.pager.swapStage('initialization');
    this.initMessage = 'Processing...';
    if (this.summary) {
      let destination = this.summary.address;
      this.pSubscriptions.add(
        this.dataService.createTransaction(
          this.summary.transactionType,
          this.widget.source,
          this.summary.vaultId,
          this.summary.currencyFrom,
          this.summary.currencyTo,
          this.summary.amountFrom ?? 0,
          instrument,
          instrumentDetails,
          providerId,
          this.userParamsId,
          destination,
          this.summary.verifyWhenPaid
        ).subscribe(({ data }) => {
          if (!this.notificationStarted) {
            this.startNotificationListener();
          }
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.instrument = instrument;
            this.summary.providerView = this.paymentProviders.find(x => x.id === providerId);
            this.summary.orderId = order.code as string;
            this.summary.fee = order.feeFiat as number ?? 0;
            this.summary.feeMinFiat = order.feeMinFiat as number ?? 0;
            this.summary.feePercent = order.feePercent as number ?? 0;
            this.summary.networkFee = order.approxNetworkFee ?? 0;
            this.summary.transactionDate = new Date().toLocaleString();
            this.summary.transactionId = order.transactionId as string;
            if (instrument === PaymentInstrument.WireTransfer) {
              this.nextStage('wire_transfer_result', 'Payment', 5, false);
            } else {
              this.startPayment();
            }
          } else {
            this.errorMessage = 'Order code is invalid';
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            } else {
              if (this.widget.orderDefault) {
                this.setError('Transaction failed', 'Order code is invalid', 'createBuyTransaction order');
              } else {
                if (tempStageId === 'verification') {
                  this.pager.goBack();
                } else {
                  this.pager.swapStage(tempStageId);
                }
              }
            }
          }
        }, (error) => {
          this.inProgress = false;
          if (tempStageId === 'verification') {
            this.pager.goBack();
          } else {
            this.pager.swapStage(tempStageId);
          }
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            const msg = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
            this.errorMessage = msg;
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: msg
              } as PaymentErrorDetails);
            } else {
              setTimeout(() => {
                this.setError('Transaction handling failed', msg, 'createBuyTransaction');
              }, 100);
            }
          }
        })
      );
    }
  }

  private createSellTransaction(instrumentDetails: string): void {
    this.errorMessage = '';
    this.inProgress = true;
    this.initMessage = 'Processing...';
    if (this.summary) {
      this.pSubscriptions.add(
        this.dataService.createTransaction(
          TransactionType.Sell,
          this.widget.source,
          this.summary.vaultId,
          this.summary.currencyFrom,
          this.summary.currencyTo,
          this.summary.amountFrom ?? 0,
          undefined,
          instrumentDetails,
          '',
          this.userParamsId,
          '',
          false
        ).subscribe(({ data }) => {
          const order = data.createTransaction as TransactionShort;
          this.inProgress = false;
          if (order.code) {
            this.summary.orderId = order.code as string;
            this.summary.fee = order.feeFiat as number ?? 0;
            this.summary.feeMinFiat = order.feeMinFiat as number ?? 0;
            this.summary.feePercent = order.feePercent as number ?? 0;
            this.summary.networkFee = order.approxNetworkFee ?? 0;
            this.summary.transactionDate = new Date().toLocaleString();
            this.summary.transactionId = order.transactionId as string;
            this.processingComplete();
          } else {
            this.errorMessage = 'Order code is invalid';
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            } else {
              this.setError('Transaction handling failed', this.errorMessage, 'createSellTransaction order');
            }
          }
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to register a new transaction');
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            } else {
              setTimeout(() => {
                this.setError('Transaction handling failed', this.errorMessage, 'createSellTransaction');
              }, 100);
            }
          }
        })
      );
    }
  }

  private startPayment(): void {
    if (this.summary.providerView?.instrument === PaymentInstrument.CreditCard) {
      this.nextStage('credit_card', 'Payment info', this.pager.step, true);
    } else if (this.summary.providerView?.instrument === PaymentInstrument.Apm) {
      this.completeInstantpayTransaction(
        this.summary.transactionId,
        this.summary.providerView.id,
        PaymentInstrument.Apm);
    } else if (this.summary.providerView?.instrument === PaymentInstrument.WireTransfer) {
      this.widgetService.getWireTransferSettings(this.summary, this.widget);
    } else {
      this.setError(
        'Invalid payment instrument',
        `Invalid payment instrument ${this.summary.providerView?.instrument}`,
        'startPayment');
    }
  }

  private completeCreditCardTransaction(transactionId: string, provider: string, card: CardView): void {
    this.inProgress = true;
    this.iframeContent = '';
    this.pSubscriptions.add(
      this.dataService.preAuthCard(transactionId, PaymentInstrument.CreditCard, provider, card).subscribe(
        ({ data }) => {
          // One more chance to start notifictions
          if (!this.notificationStarted) {
            this.startNotificationListener();
          }
          const preAuthResult = data.preauth as PaymentPreauthResultShort;
          const order = preAuthResult.order;
          this.summary.setPaymentInfo(PaymentInstrument.CreditCard, order?.paymentInfo as string);
          this.iframeContent = preAuthResult.html as string;
          this.inProgress = false;
          this.nextStage('processing-frame', 'Payment', this.pager.step, false);
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            } else {
              this.setError('Transaction handling failed', this.errorMessage, 'completeCreditCardTransaction');
            }
          }
        }
      )
    );
  }

  private completeInstantpayTransaction(transactionId: string, provider: string, instrument: PaymentInstrument): void {
    this.inProgress = true;
    this.instantpayDetails = '';
    this.pSubscriptions.add(
      this.dataService.preAuth(transactionId, instrument, provider).subscribe(
        ({ data }) => {
          const preAuthResult = data.preauth as PaymentPreauthResultShort;
          const order = preAuthResult.order;
          this.summary.setPaymentInfo(instrument, order?.paymentInfo as string);
          if (preAuthResult.details) {
            this.instantpayDetails = preAuthResult.details as string;
          }
          this.inProgress = false;
          this.nextStage('processing-instantpay', 'Payment', this.pager.step, false);
        }, (error) => {
          this.inProgress = false;
          if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
            this.handleAuthError();
          } else {
            this.errorMessage = this.errorHandler.getError(error.message, 'Unable to confirm your order');
            if (this.widget.embedded) {
              this.onError.emit({
                errorMessage: this.errorMessage
              } as PaymentErrorDetails);
            } else {
              this.setError('Transaction handling failed', this.errorMessage, 'completeInstantpayTransaction');
            }
          }
        }
      )
    );
  }

  private onWireTransferListLoaded(wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string): void {
    this.bankAccountId = bankAccountId;
    this.wireTransferList = wireTransferList;
    if (this.wireTransferList.length > 1) {
      this.nextStage('wire_transfer', 'Payment info', this.pager.step, true);
    } else if (this.wireTransferList.length === 1) {
      this.wireTransferPaymentComplete({
        id: this.bankAccountId,
        selected: this.wireTransferList[0]
      } as WireTransferUserSelection);
    } else {
      this.setError('Transaction failed', 'No settings found for wire transfer', 'onWireTransferListLoaded');
    }
  }

  private userInfoRequired(requiredFields: string[]): void {
    this.requiredFields = requiredFields;
    this.nextStage('wire_transfer_info_required', 'Payment info', this.pager.step, true);
  }

  private setError(title: string, message: string, tag: string): void {
    this.errorMessage = message;
    this.changeDetector.detectChanges();
    if ((this.widget.orderDefault || this.pager.stageId === 'initialization') && this.errorMessage !== '') {
      this.showTransactionError(title, message, !this.widget.orderDefault);
    }
  }

  private showTransactionError(messageTitle: string, messageText: string, tryAgain: boolean = true): void {
    this.transactionErrorMessage = messageText;
    this.transactionErrorTitle = messageTitle;
    this.transactionErrorTryAgain = tryAgain;
    this.nextStage('error', 'Error', 6, false);
  }
}
