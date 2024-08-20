import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentBank, WireTransferBankAccount } from 'model/generated-models';
import { CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { PaymentDataService } from 'services/payment.service';
import { WidgetPaymentPagerService } from 'services/widget-payment-pager.service';
import { YapilyRedirectModel } from '../yapily/panels/banks-page/bank.component';

@Component({
  selector: 'app-widget-payment-wrbankaccount',
  templateUrl: './wrbankaccount.component.html',
  styleUrl: './wrbankaccount.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPaymentWrBankAccountComponent implements OnInit, OnDestroy {
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() bankAccount: WireTransferBankAccount | undefined = undefined;
  @Output() onBack = new EventEmitter();
  yapilyRedirectObject!: YapilyRedirectModel;
  isLoading = false;
  bankName = '';
  transactionId = '';
  paymentBank: PaymentBank = undefined;
  newWindow: Window = undefined;
  isPaymentSuccess = false;
  private pSubscriptions: Subscription = new Subscription();
  private pPaymentStatusSchangedSubscription: Subscription | undefined = undefined;
  constructor(
  	private cdr: ChangeDetectorRef,
  	public paymentService: PaymentDataService,
  	public pager: WidgetPaymentPagerService
  ) {
  }
  
  ngOnInit(): void {
  	this.pager.init('instructions', 'Instructions');

		// const transactionSourceVaultId = (this.summary.vaultId === '') ? undefined : this.summary.vaultId;
  	// const destination = this.summary.transactionType === TransactionType.Buy ? this.summary.address : '';
 
  	// const transactionInput: TransactionInput = {
  	// 	type: this.summary.transactionType,
  	// 	source: this.source,
  	// 	sourceVaultId: transactionSourceVaultId,
  	// 	currencyToSpend: this.summary.currencyFrom,
  	// 	currencyToReceive: (this.summary.currencyTo !== '') ? this.summary.currencyTo : undefined,
  	// 	amountToSpend: this.summary.amountFrom ?? 0,
  	// 	instrument: this.summary.providerView.instrument,
  	// 	paymentProvider: this.summary.providerView.id ?? undefined,
  	// 	widgetUserParamsId: (this.userParamsId !== '') ? this.userParamsId : undefined,
  	// 	destination: destination,
  	// 	verifyWhenPaid: this.summary.transactionType === TransactionType.Buy ? this.summary.verifyWhenPaid : false
  	// };

  	// this.createTransactionInternal(transactionInput);
  }

  ngOnDestroy(): void {
  	if (this.pPaymentStatusSchangedSubscription) {
  		this.pPaymentStatusSchangedSubscription.unsubscribe();
  	}

  	this.pSubscriptions.unsubscribe();
  }

  isLoadingfunc(value: boolean): void {
  	this.isLoading = value;

  	this.cdr.markForCheck();
  }

  onInstructionsConfirm(): void {
  	// this.startPaymentStatusChangedSubscriptions();
  	this.pager.nextStage('initialization', 'Banks', 2);
  }

  // bankSelected(bank: PaymentBank): void {
  // 	this.paymentBank = bank;

	// 	this.preauth(this.transactionId);
  // }

  openWindow(url: string): void {
  	this.newWindow = window.open(url, '_blank');
  }
  
  // private startPaymentStatusChangedSubscriptions():void {
  // 	this.pPaymentStatusSchangedSubscription = this.notification.subscribeToPaymentStatusChanged()
  // 		.subscribe({
  // 			next: ({ data }) => {
  // 				if (data.paymentStatusChanged.status === YapilyAuthorizationRequestStatus.AwaitingAuthorization) {
  // 					this.isLoading = true;
  // 					this.cdr.markForCheck();
  // 				} else if(data.paymentStatusChanged.status === YapilyAuthorizationRequestStatus.Authorized) {
  // 					this.isLoading = false;

  // 					if (this.newWindow) {
  // 						this.newWindow.close();
  // 					}
  					
  // 					this.isPaymentSuccess = true;
  // 					this.cdr.markForCheck();
  // 					this.pager.nextStage('payment_completed', 'Completed', 3);
  // 				} else if(data.paymentStatusChanged.status === YapilyAuthorizationRequestStatus.Failed) {
  // 					this.isPaymentSuccess = false;
  // 					this.isLoading = false;

  // 					if (this.newWindow) {
  // 						this.newWindow.close();
  // 					}
						
  // 					this.pager.nextStage('payment_completed', 'Completed', 3);
  // 					this.cdr.markForCheck();
  // 				}
  // 			},
  // 			error: (error) => console.log(error),
  // 			complete: () => this.cdr.markForCheck()
  // 		});
  // }

  // private createTransactionInternal(transaction: TransactionInput): void {
  // 	this.errorMessage = '';
  // 	this.isLoading = true;

  // 	this.pSubscriptions.add(
	// 	  this.paymentService.createTransaction(transaction)
	// 	  .subscribe({
  // 				next: ({ data }) => {
  // 					const order = data.createTransaction as TransactionShort;
							
	// 					if (order) {
	// 						const parsedInstrumentDetails = JSON.parse(order.instrumentDetails);

	// 						this.bankName = parsedInstrumentDetails?.name ?? '';
	// 						this.transactionId = order.transactionId;
	// 					}

	// 					this.isLoading = false;
	// 					this.cdr.markForCheck();
  // 				},
  // 				error: () => this.isLoading = false,
  // 				complete: () => this.cdr.markForCheck()
  // 			})
  // 	);
  // }

  // private preauth(transactionId: string): void {
  // 	const paymentBankInput: PaymentBankInput = {
  // 		id: this.paymentBank.id,
  // 		name: this.paymentBank.name
  // 	};

  // 	this.pSubscriptions.add(
  // 		this.paymentService.preAuth(
  // 			transactionId, 
  // 			this.summary.providerView.instrument, 
  // 			this.summary.providerView.name,
  // 			paymentBankInput
  // 		).pipe(finalize(() => this.isLoading = false))
  // 			.subscribe({
  // 				next: ({ data }) => {
  // 					const order = data.preauth as PaymentPreauthResultShort;

  // 					this.yapilyRedirectObject = {
  // 						yapilyQrCodeUrl: order.openBankingObject.yapily.qrCodeUrl,
  // 						yapilyAuthUrl: order.openBankingObject.yapily.url,
  // 						bankName: this.bankName,
  // 						transactionId
  // 					} as YapilyRedirectModel;

  // 				},
  // 				error: (error) => {
  // 					console.error(error);
  // 				},
  // 				complete: () => this.cdr.markForCheck()
  // 			}));
  // }

  stageBack(): void {
  	const stage = this.pager.goBack();

  	if (!stage) {
  		this.onBack.emit();
  	}
  }
}
