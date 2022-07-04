import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-widget-crypto-complete',
  templateUrl: 'crypto-complete.component.html',
  styleUrls: [
    '../../../assets/payment.scss',
    '../../../assets/button.scss',
    '../../../assets/text-control.scss',
    '../../../assets/profile.scss',
    '../../../assets/details.scss'
  ]
})
export class WidgetCryptoCompleteComponent {
  @Input() address = '';

  qrCodeBackground = EnvService.color_white;
  qrCodeForeground = EnvService.color_purple_900;

  constructor(private clipboard: Clipboard) { }

  copyAddress(): void {
    this.clipboard.copy(this.address);
  }
}
