import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentBank, PaymentBankInput, TransactionInput, TransactionShort, TransactionSource, TransactionType } from 'model/generated-models';
import { CheckoutSummary } from 'model/payment.model';
import { Subscription } from 'rxjs';
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
  constructor(
    public paymentService: PaymentDataService,
    public pager: WidgetPaymentPagerService
  ) { }
  
  get providerName(): string {
  	return 'Yapily';
  }
  
  ngOnInit(): void {
    this.pager.init('initialization', 'Banks');
  }

  ngOnDestroy(): void {
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
			  const order = data.preauth;
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
