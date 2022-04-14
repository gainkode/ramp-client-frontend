import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionType } from 'src/app/model/generated-models';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-widget-complete',
  templateUrl: 'complete.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetCompleteComponent {
  @Input() showRestartButton = false;
  @Input() transaction: TransactionType = TransactionType.Buy;
  @Output() onFinish = new EventEmitter();
  
  TRANSACTION_TYPE: typeof TransactionType = TransactionType;
  supportEmail = environment.support_email ?? 'support@test.com';
  supportEmailLink = `mailto: ${environment.support_email}` ?? 'mailto: support@test.com';
}
