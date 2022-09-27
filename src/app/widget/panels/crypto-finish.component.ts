import { Component, Input } from '@angular/core';
import { InvoiceView } from 'src/app/model/payment.model';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-widget-crypto-finish',
  templateUrl: 'crypto-finish.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/profile.scss',
    '../../../assets/details.scss'
  ]
})
export class WidgetCryptoFinishComponent {
  @Input() title = '';
  @Input() complete = false;
  @Input() success = false;
  @Input() data: InvoiceView | undefined = undefined;

  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;
  productName = EnvService.productFull;
  supportEmail = EnvService.support_email ?? 'support@test.com';
  supportEmailLink = `mailto: ${EnvService.support_email}` ?? 'mailto: support@test.com';
}
