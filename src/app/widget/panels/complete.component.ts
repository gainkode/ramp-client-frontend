import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionType } from 'src/app/model/generated-models';
import { EnvService } from 'src/app/services/env.service';

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
  supportEmail = this.env.support_email ?? 'support@test.com';
  supportEmailLink = `mailto: ${this.env.support_email}` ?? 'mailto: support@test.com';

  constructor(private env: EnvService) {

  }
}
