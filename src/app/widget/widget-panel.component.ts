import { Component, Input } from '@angular/core';
import { PaymentWidgetType } from '../model/payment.model';

@Component({
  selector: 'app-embedded-widget',
  templateUrl: 'widget-panel.component.html',
  styleUrls: ['../../assets/payment.scss']
})
export class WidgetPanelComponent {
  @Input() widgetType = PaymentWidgetType.None;

  WIDGET_TYPE: typeof PaymentWidgetType = PaymentWidgetType;

  constructor() {
    
  }

  selectPaymentType(selected: PaymentWidgetType): void {
    this.widgetType = selected;
  }
}
