import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceView } from 'model/payment.model';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-widget-crypto-finish',
	templateUrl: 'crypto-finish.component.html',
	styleUrls: [
		'../../../assets/payment.scss',
		'../../../assets/button.scss',
		'../../../assets/text-control.scss',
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
  finishLink = EnvService.crypto_widget_finish_link;

  constructor(
  	private router: Router,
  	private clipboard: Clipboard) { }

  copyAddress(): void {
  	this.clipboard.copy(this.data?.walletAddress ?? '');
  }

  goHome(): void {
  	this.router.navigateByUrl(this.finishLink).then(() => {
  		window.location.reload();
  	});
  }
}
