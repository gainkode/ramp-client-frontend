import { Component, Input } from '@angular/core';

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
}
