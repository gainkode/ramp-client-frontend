import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CryptoInvoiceCreationResult } from 'model/generated-models';
import { InvoiceView } from 'model/payment.model';
import { Subscription, timer } from 'rxjs';
import { EnvService } from 'services/env.service';
import { PaymentDataService } from 'services/payment.service';
import { getMinSec } from 'utils/utils';

const interval = 600000;  // 10 minutes

@Component({
	selector: 'app-widget-crypto-complete',
	templateUrl: 'crypto-complete.component.html',
	styleUrls: [
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss',
		'../../../../assets/details.scss'
	]
})
export class WidgetCryptoCompleteComponent implements OnInit, OnDestroy {
  @Input() data: InvoiceView | undefined = undefined;
  @Input() set counter(val: number) {
  	this.counterTime = getMinSec(val);
  }

  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;
  counterTime = '';

  private pSubscriptions: Subscription = new Subscription();
  private updateTimer = timer(interval, interval);

  constructor(
  	private clipboard: Clipboard,
  	private dataService: PaymentDataService) { }

  ngOnInit(): void {
    
  	this.pSubscriptions.add(
  		this.updateTimer.subscribe(val => {
  			if (this.data) {
  				if (this.data.invoiceId !== '') {
  					this.reloadTransactionData();
  				}
  			}
  		})
  	);
  }

  ngOnDestroy(): void {
  	this.pSubscriptions.unsubscribe();
  }

  copyAddress(): void {
  	this.clipboard.copy(this.data?.walletAddress ?? '');
  }

  copySourceAmount(): void {
  	this.clipboard.copy(this.data?.amountSourceValue ?? '');
  }

  copyConvertedAmount(): void {
  	this.clipboard.copy(this.data?.amountConvertedValue ?? '');
  }

  private reloadTransactionData(): void {
  	this.pSubscriptions.add(
  		this.dataService.calculateInvoice(this.data?.invoiceId ?? '').subscribe(
  			({ data }) => {
  				this.data = new InvoiceView(data.calculateInvoice as CryptoInvoiceCreationResult);
  			}, (error) => {
  			}
  		)
  	);
  }
}
