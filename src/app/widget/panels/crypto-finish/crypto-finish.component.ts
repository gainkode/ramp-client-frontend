import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from 'core/app-config';
import { InvoiceView } from 'model/payment.model';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-widget-crypto-finish',
	templateUrl: 'crypto-finish.component.html',
	styleUrls: [
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss',
		'../../../../assets/details.scss'
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
  supportEmail = this.config.platformInfo.supportEmail ?? 'support@test.com';
  supportEmailLink = `mailto: ${this.config.platformInfo.supportEmail}` ?? 'mailto: support@test.com';

  finishLink = EnvService.crypto_widget_finish_link;

  constructor(
  	private router: Router,
    private config: AppConfig,
  	private clipboard: Clipboard) { }

  copyAddress(): void {
  	this.clipboard.copy(this.data?.walletAddress ?? '');
  }

  goHome(): void {
  	void this.router.navigateByUrl(this.finishLink).then(() => {
  		window.location.reload();
  	});
  }
}
