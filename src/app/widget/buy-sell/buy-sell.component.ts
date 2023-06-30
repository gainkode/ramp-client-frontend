import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionType, TransactionSource } from 'model/generated-models';
import { PaymentWidgetType, PaymentCompleteDetails, PaymentErrorDetails, WidgetSettings } from 'model/payment-base.model';
import { AuthService } from 'services/auth.service';


@Component({
	selector: 'app-buy-sell-widget',
	templateUrl: 'buy-sell.component.html',
	styleUrls: []
})
export class BuySellWidgetComponent {
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
  		case PaymentWidgetType.Buy:
  			this.widgetSettings.transaction = TransactionType.Buy;
  			break;
  		case PaymentWidgetType.Sell:
  			this.widgetSettings.transaction = TransactionType.Sell;
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

  widgetError(error: PaymentErrorDetails): void {
  	error.paymentType = this.selectedWidgetType;
  	this.onError.emit(error);
  }
}
