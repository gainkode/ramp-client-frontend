import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { CryptoInvoiceCreationResult } from 'src/app/model/generated-models';
import { InvoiceView } from 'src/app/model/payment.model';
import { EnvService } from 'src/app/services/env.service';
import { PaymentDataService } from 'src/app/services/payment.service';

const interval = 600000;  // 10 minutes

@Component({
  selector: 'app-widget-crypto-complete',
  templateUrl: 'crypto-complete.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss',
    '../../../assets/details.scss'
  ]
})
export class WidgetCryptoCompleteComponent implements OnInit, OnDestroy {
  @Input() data: InvoiceView | undefined = undefined;

  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;

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
