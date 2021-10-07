import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-widget-complete',
  templateUrl: 'complete.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetCompleteComponent {
  supportEmail = environment.support_email ?? 'support@test.com';
  supportEmailLink = `mailto: ${environment.support_email}` ?? 'mailto: support@test.com';
}
