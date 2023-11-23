import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PaymentBank, PaymentBankInput, PaymentPreauthResultShort, TransactionInput, TransactionShort, TransactionSource, TransactionType } from 'model/generated-models';
import { CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
import { NotificationService } from 'services/notification.service';
import { PaymentDataService } from 'services/payment.service';
import { WidgetPaymentPagerService } from 'services/widget-payment-pager.service';

@Component({
	selector: 'app-widget-payment-yapily',
	templateUrl: 'payment.component.html',
	styleUrls: []
})
export class WidgetPaymentYapilyComponent implements OnInit, OnDestroy {
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() source: TransactionSource = TransactionSource.QuickCheckout;
  @Input() userParamsId = '';
  @Input() errorMessage = '';
  @Output() onBack = new EventEmitter();
  
  private pSubscriptions: Subscription = new Subscription();
  paymentBank: PaymentBank = undefined;
  transactionInput: TransactionInput | undefined = undefined;
  private pPaymentStatusSchangedSubscription: Subscription | undefined = undefined;
  constructor(
  	private notification: NotificationService,
  	public paymentService: PaymentDataService,
  	public pager: WidgetPaymentPagerService
  ) {
  }
  
  get providerName(): string {
  	return 'Yapily';
  }
  
  ngOnInit(): void {
    this.startPaymentStatusChangedSubscriptions();
  	this.pager.init('initialization', 'Banks');
  }

  ngOnDestroy(): void {
  	if(this.pPaymentStatusSchangedSubscription){
  		this.pPaymentStatusSchangedSubscription.unsubscribe();
  	}

  	this.pSubscriptions.unsubscribe();
  }

  bankSelected(bank: PaymentBank) {
  	this.paymentBank = bank;
  	const transactionSourceVaultId = (this.summary.vaultId === '') ? undefined : this.summary.vaultId;
  	const destination = this.summary.transactionType === TransactionType.Buy ? this.summary.address : '';
  	const instrumentDetails = JSON.stringify(bank);

  	this.transactionInput = {
  		type: this.summary.transactionType,
  		source: this.source,
  		sourceVaultId: transactionSourceVaultId,
  		currencyToSpend: this.summary.currencyFrom,
  		currencyToReceive: (this.summary.currencyTo !== '') ? this.summary.currencyTo : undefined,
  		amountToSpend: this.summary.amountFrom ?? 0,
  		instrument: this.summary.providerView.instrument,
  		instrumentDetails: (instrumentDetails !== '') ? instrumentDetails : undefined,
  		paymentProvider: this.summary.providerView.id ?? undefined,
  		widgetUserParamsId: (this.userParamsId !== '') ? this.userParamsId : undefined,
  		destination: destination,
  		verifyWhenPaid: this.summary.transactionType === TransactionType.Buy ? this.summary.verifyWhenPaid : false
  	};

  	this.createTransactionInternal();
  }
  
  private startPaymentStatusChangedSubscriptions() {
  	this.pPaymentStatusSchangedSubscription = this.notification.subscribeToPaymentStatusChanged()
  		.subscribe((data) => {
        console.log(data)
      });
  }
  private createTransactionInternal(): void {
  	this.errorMessage = '';
  	this.pSubscriptions.add(
		  this.paymentService.createTransaction(this.transactionInput).subscribe(({ data }) => {
			  const order = data.createTransaction as TransactionShort;
			  this.preauth(order.transactionId);
		  }, (error) => {
			 
		  })
	  );
  }

  private preauth(transactionId: string): void {
  	const paymentBankInput: PaymentBankInput = {
  		id: this.paymentBank.id,
  		name: this.paymentBank.name
  	}
  	this.pSubscriptions.add(
		  this.paymentService.preAuth(
  			transactionId, 
  			this.summary.providerView.instrument, 
  			this.summary.providerView.name,
  			paymentBankInput
  		).subscribe(({ data }) => {
			  const order = data.preauth as PaymentPreauthResultShort;
			  console.log(order)
		  }, (error) => {
			 
		  })
	  );
  }

  stageBack(): void {
  	const stage = this.pager.goBack();
  	if (!stage) {
  		this.onBack.emit();
  	}
  }
}
