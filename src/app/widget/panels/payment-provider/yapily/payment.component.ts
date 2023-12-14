import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentBank, PaymentBankInput, PaymentPreauthResultShort, TransactionInput, TransactionShort, TransactionSource, TransactionType, YapilyAuthorizationRequestStatus } from 'model/generated-models';
import { CheckoutSummary } from 'model/payment.model';
import { Subscription, finalize, map, switchMap } from 'rxjs';
import { EnvService } from 'services/env.service';
import { NotificationService } from 'services/notification.service';
import { PaymentDataService } from 'services/payment.service';
import { WidgetPaymentPagerService } from 'services/widget-payment-pager.service';
import { YapilyRedirectModel } from './panels/banks-page/bank.component';

@Component({
	selector: 'app-widget-payment-yapily',
	templateUrl: 'payment.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetPaymentYapilyComponent implements OnInit, OnDestroy {
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() source: TransactionSource = TransactionSource.QuickCheckout;
  @Input() userParamsId = '';
  @Input() errorMessage = '';
  @Output() onBack = new EventEmitter();
  yapilyRedirectObject!: YapilyRedirectModel;
  isLoading = false;
  bankName = '';
  transactionId = '';
  paymentBank: PaymentBank = undefined;
  transactionInput: TransactionInput | undefined = undefined;
  newWindow: Window = undefined;
  isPaymentSuccess = false;
  private pSubscriptions: Subscription = new Subscription();
  private pPaymentStatusSchangedSubscription: Subscription | undefined = undefined;
  constructor(
  	private cdr: ChangeDetectorRef,
  	private readonly http: HttpClient,
  	private notification: NotificationService,
  	public paymentService: PaymentDataService,
  	public pager: WidgetPaymentPagerService
  ) {
  }
  
  ngOnInit(): void {
  	this.pager.init('instructions', 'Instructions');
  }

  ngOnDestroy(): void {
  	if (this.pPaymentStatusSchangedSubscription) {
  		this.pPaymentStatusSchangedSubscription.unsubscribe();
  	}

  	this.pSubscriptions.unsubscribe();
  }

	isLoadingfunc(value: boolean) {
		this.isLoading = value;
		this.cdr.markForCheck();
	}

  onInstructionsConfirm(): void {
  	this.startPaymentStatusChangedSubscriptions();
  	this.pager.nextStage('initialization', 'Banks', 2);
  }

  bankSelected(bank: PaymentBank): void {
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

  openWindow(url: string): void {
  	this.newWindow = window.open(url, '_blank');
  }
  
  private startPaymentStatusChangedSubscriptions():void {
  	this.pPaymentStatusSchangedSubscription = this.notification.subscribeToPaymentStatusChanged()
  		.subscribe({
  			next: ({ data }) => {
  				console.log(data.paymentStatusChanged.status, YapilyAuthorizationRequestStatus.AwaitingAuthorization)
  				if (data.paymentStatusChanged.status === YapilyAuthorizationRequestStatus.AwaitingAuthorization) {
  					this.isLoading = true;
						this.cdr.markForCheck();
  				} else if(data.paymentStatusChanged.status === YapilyAuthorizationRequestStatus.Authorized) {
  					this.isLoading = false;
  					this.newWindow.close();
  					this.isPaymentSuccess = true;
						this.cdr.markForCheck();
  					this.pager.nextStage('payment_completed', 'Completed', 3);
  				} else if(data.paymentStatusChanged.status === YapilyAuthorizationRequestStatus.Failed) {
  					this.isPaymentSuccess = false;
						this.isLoading = false;
  					this.pager.nextStage('payment_completed', 'Completed', 3);
						this.cdr.markForCheck();
  				}
  			},
  			error: (error) => console.log(error),
  			complete: () => this.cdr.markForCheck()
  		});
  }

  private createTransactionInternal(): void {
  	this.errorMessage = '';
  	this.isLoading = true;
  	this.pSubscriptions.add(
		  this.paymentService.createTransaction(this.transactionInput)
		  .subscribe(
  			{
  				next: ({ data }) => {
  					const order = data.createTransaction as TransactionShort;

  						if (order) {
  							const parsedInstrumentDetails = JSON.parse(order.instrumentDetails);
  							this.bankName = parsedInstrumentDetails?.name ?? '';
  							this.transactionId = order.transactionId;
  						}

			  		this.preauth(this.transactionId);
  				},
  				error: () => this.isLoading = false,
  					complete: () => this.cdr.markForCheck()
  			})
  	);
  }

  private preauth(transactionId: string): void {
  	const paymentBankInput: PaymentBankInput = {
  		id: this.paymentBank.id,
  		name: this.paymentBank.name
  	};

  	this.pSubscriptions.add(
  		this.paymentService.preAuth(
  			transactionId, 
  			this.summary.providerView.instrument, 
  			this.summary.providerView.name,
  			paymentBankInput
  		).pipe(
  			switchMap(({ data }) => {
  				const codec = new HttpUrlEncodingCodec();
  				const order = data.preauth as PaymentPreauthResultShort;
  				const baseUrl = `${EnvService.api_server}/rest/yapily/qrcode-callback?`;
  				const yapilyUrl = codec.encodeValue(order.openBankingObject.yapily.url);
  				const yapilyQrCodeUrl = baseUrl + 'authorisationUrl=' + yapilyUrl + '&transactionId=' + transactionId;
	
  				return this.http.get('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(yapilyQrCodeUrl), { responseType: 'text' })
  					.pipe(map(res => ({
  						yapilyQrCodeUrl: res || yapilyQrCodeUrl,
  						yapilyAuthUrl: order.openBankingObject.yapily.url,
  						bankName: this.bankName,
  						transactionId
  					})));
  			}),
  			finalize(() => this.isLoading = false)
  		).subscribe({
  			next: (redirectObject) => {
  				this.yapilyRedirectObject = redirectObject as YapilyRedirectModel;
  			},
  			error: (error) => {
  				console.error(error);
  			},
  			complete: () => this.cdr.markForCheck()
  		}));
  }

  stageBack(): void {
  	const stage = this.pager.goBack();
  	if (!stage) {
  		this.onBack.emit();
  	}
  }
}
