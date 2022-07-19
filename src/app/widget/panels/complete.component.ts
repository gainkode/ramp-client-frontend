import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomTextList, CustomTextType } from 'src/app/model/custom-text.model';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-widget-complete',
  templateUrl: 'complete.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetCompleteComponent {
  @Input() showRestartButton = false;
  @Input() set textContent(data: string[]) {
    if (data.length > 0) {
      this.textData = new CustomTextList(data);
    }
  }
  @Output() onFinish = new EventEmitter();
  
  supportEmail = EnvService.support_email ?? 'support@test.com';
  supportEmailLink = `mailto: ${EnvService.support_email}` ?? 'mailto: support@test.com';
  productName = EnvService.productFull;
  textData = new CustomTextList([]);
  TEXT_TYPE: typeof CustomTextType = CustomTextType;
}
