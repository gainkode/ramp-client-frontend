import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionSource, TransactionType } from '../model/generated-models';
import { PaymentCompleteDetails, PaymentWidgetType, WidgetSettings } from '../model/payment-base.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-embedded-widget',
  templateUrl: 'widget-panel.component.html',
  styleUrls: ['../../assets/payment.scss']
})
export class WidgetPanelComponent {
  @Input() set widgetType(val: PaymentWidgetType) {
    this.selectPaymentType(val);
  }
  @Output() onComplete = new EventEmitter<PaymentCompleteDetails>();

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
      case PaymentWidgetType.Buy:
        this.widgetSettings.transaction = TransactionType.Deposit;
        break;
      case PaymentWidgetType.Sell:
        this.widgetSettings.transaction = TransactionType.Withdrawal;
        break;
      case PaymentWidgetType.Transfer:
        this.widgetSettings.transaction = TransactionType.Transfer;
        break;
      default:
        break;
    }
    this.widgetSettings.source = TransactionSource.Wallet;
    this.widgetSettings.walletAddressPreset = (selected === PaymentWidgetType.Sell);
    this.widgetSettings.kycFirst = false;
    this.widgetSettings.disclaimer = false;
    this.widgetVisible = true;
  }

  widgetComplete(details: PaymentCompleteDetails): void {
    details.paymentType = this.selectedWidgetType;
    this.onComplete.emit(details);
  }
}
