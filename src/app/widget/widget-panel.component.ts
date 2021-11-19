import { Component, Input } from '@angular/core';
import { TransactionSource, TransactionType } from '../model/generated-models';
import { PaymentWidgetType, WidgetSettings } from '../model/payment.model';
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

  WIDGET_TYPE: typeof PaymentWidgetType = PaymentWidgetType;
  widgetVisible = false;
  widgetSettings = new WidgetSettings();
  selectedWidgetType = PaymentWidgetType.None;

  constructor(private auth: AuthService) {

  }

  selectPaymentType(selected: PaymentWidgetType): void {
    this.widgetVisible = false;
    this.selectedWidgetType = selected;
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
    this.widgetSettings.walletAddress = '';
    this.widgetSettings.kycFirst = false;
    this.widgetSettings.disclaimer = false;
    this.widgetVisible = true;
  }
}
