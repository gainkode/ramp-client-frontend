import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-widget-recent-transactions',
  templateUrl: 'recent-transactions.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetRecentTransactionsComponent {
  @Output() back = new EventEmitter();
}
