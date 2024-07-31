import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonDialogBox } from 'components/dialogs/common-box.dialog';
import { WireTransferUserSelection } from 'model/cost-scheme.model';
import { TransactionType, PaymentInstrument, SettingsCurrencyWithDefaults, TransactionSource, TransactionShort, WireTransferPaymentCategory, TransactionInput } from 'model/generated-models';
import { WidgetSettings, PaymentCompleteDetails, PaymentErrorDetails, WireTransferPaymentCategoryItem, PaymentWidgetType } from 'model/payment-base.model';
import { CheckoutSummary, CurrencyView } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { CommonDataService } from 'services/common-data.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';
import { WidgetService } from 'services/widget.service';

@Component({
	selector: 'app-fiat-widget',
	templateUrl: 'fiat.component.html',
	styleUrls: [],
})
export class FiatWidgetComponent implements OnInit, OnDestroy {
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
  requiredFields: string[] = [];
  stageId = 'order_details';
  title = 'Order details';
  step = 1;
  summary = new CheckoutSummary();
  widgetSettings: WidgetSettings = new WidgetSettings();
  initMessage = 'Loading...';
  cryptoList: CurrencyView[] = [];
  wireTransferList: WireTransferPaymentCategoryItem[] = [];
  bankAccountId = '';
	transactionInput: TransactionInput | undefined = undefined;
  selectedWireTransfer: WireTransferPaymentCategoryItem = {
  	id: WireTransferPaymentCategory.Au,
  	bankAccountId: '',
  	title: '',
  	data: ''
  };

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
  		this.onWireTransferListLoaded.bind(this),
  		this.userInfoRequired.bind(this)
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
  	this.summary.currencyFrom = data.currencyFrom;
  	this.summary.amountFrom = data.amountFrom;
    
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
  	);
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

  resetWizard(): void {
  	this.summary.reset();
  	this.stageId = 'order_details';
  	this.title = 'Order details';
  }

  requiredFieldsComplete(): void {
		this.createTransactionInternal();
  }

  private onAuthRequired(): void {
  	void this.router.navigateByUrl('/');
  }

  private onIdRequired(): void {
  	void this.router.navigateByUrl('/');
  }

  private userInfoRequired(requiredFields: string[]): void {
  	this.requiredFields = requiredFields;
  	this.stageId = 'wire_transfer_info_required';
  	this.title = 'Payment info';
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
  				void this.router.navigateByUrl('/');
  			} else {
  				this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currencies');
  			}
  		})
  	);
  }

  private onWireTransferListLoaded(wireTransferList: WireTransferPaymentCategoryItem[], bankAccountId: string): void {
  	this.bankAccountId = bankAccountId;
  	this.wireTransferList = wireTransferList;
  	if (this.wireTransferList.length > 0) {
  		this.initMessage = '';
  		this.stageId = 'transfer';
  		this.title = 'Transfer';
  	} else {
  		this.errorMessage = 'No settings found for wire transfer';
  	}
  }

  private createTransaction(instrument: PaymentInstrument | undefined, instrumentDetails: string): void {
		this.transactionInput = {
			type: this.summary.transactionType,
			source: TransactionSource.Wallet,
			sourceVaultId: undefined,
			currencyToSpend: this.summary.currencyTo,
			currencyToReceive: this.summary.currencyTo,
			amountToSpend: this.summary.amountFrom ?? 0,
			instrument,
			instrumentDetails,
			paymentProvider: undefined,
			widgetUserParamsId: undefined,
			destination: undefined,
			verifyWhenPaid: false
		};
  	
		this.createTransactionInternal();
  }

	private createTransactionInternal(): void {
		this.errorMessage = '';
  	this.inProgress = true;
  	this.pSubscriptions.add(
  		this.dataService.createTransaction(this.transactionInput).subscribe(({ data }) => {
  			const order = data.createTransaction as TransactionShort;
  			this.inProgress = false;
				if(order.requiredFields && order.requiredFields.length != 0) {
					this.userInfoRequired(order.requiredFields);
					return;
				}
  			if (order.code) {
  				this.summary.instrument = this.transactionInput.instrument;
  				this.summary.orderId = order.code ?? '';
  				this.summary.fee = order.feeFiat ?? 0;
  				this.summary.feeMinFiat = order.feeMinFiat ?? 0;
  				this.summary.feePercent = order.feePercent ?? 0;
  				this.summary.networkFee = order.approxNetworkFee ?? 0;
  				this.summary.transactionDate = new Date().toLocaleString();
  				this.summary.transactionId = order.transactionId as string;
  				this.initMessage = '';
  				if (this.summary.transactionType === TransactionType.Deposit) {
						if (this.transactionInput.instrument === PaymentInstrument.WireTransfer) {
							if(order.instrumentDetails) {
								const instrumentDetails = typeof order.instrumentDetails == 'string' ? JSON.parse(order.instrumentDetails) : order.instrumentDetails;
								this.selectedWireTransfer.data = instrumentDetails.accountType.data;
							}
							
							this.stageId = 'transfer_result';
  						this.title = 'Transfer Result';
						}
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
  				void this.router.navigateByUrl('/');
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
