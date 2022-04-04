import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionSource, TransactionType } from 'src/app/model/generated-models';
import { PaymentCompleteDetails, PaymentErrorDetails, PaymentWidgetType, WidgetSettings } from '../model/payment-base.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-buy-sell-fiat-widget',
  templateUrl: 'buy-sell-fiat.component.html',
  styleUrls: ['../../assets/button.scss', '../../assets/payment.scss'],
})
export class BuySellFiatWidgetComponent {
  @Input() set widgetType(val: PaymentWidgetType) {
    this.selectPaymentType(val);
  }
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();
  @Output() onError = new EventEmitter<PaymentErrorDetails>();

  WIDGET_TYPE: typeof PaymentWidgetType = PaymentWidgetType;
  widgetVisible = false;
  widgetSettings = new WidgetSettings();
  selectedWidgetType = PaymentWidgetType.None;

  constructor(private auth: AuthService) {

  }

  selectPaymentType(selected: PaymentWidgetType): void {
    if (this.selectedWidgetType === selected) {
      return;
    }
    this.widgetVisible = false;
    this.selectedWidgetType = selected;
    this.widgetSettings = new WidgetSettings();
    this.widgetSettings.embedded = true;
    this.widgetSettings.email = this.auth.user?.email ?? '';
    switch (selected) {
      case PaymentWidgetType.Deposit:
        this.widgetSettings.transaction = TransactionType.DepositFiat;
        break;
      case PaymentWidgetType.Withdrawal:
        this.widgetSettings.transaction = TransactionType.WithdrawFiat;
        break;
      default:
        break;
    }
    this.widgetSettings.source = TransactionSource.Wallet;
    this.widgetSettings.walletAddressPreset = false;
    this.widgetSettings.kycFirst = false;
    this.widgetSettings.disclaimer = false;
    this.widgetVisible = true;
  }

  widgetComplete(details: PaymentCompleteDetails): void {
    details.paymentType = this.selectedWidgetType;
    this.onComplete.emit(details);
  }

  widgetError(error: PaymentErrorDetails): void {
    error.paymentType = this.selectedWidgetType;
    this.onError.emit(error);
  }
}
