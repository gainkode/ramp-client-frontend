import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EnvService } from 'services/env.service';
import { YapilyRedirectModel } from '../banks-page/bank.component';
import { AppConfig } from 'core/app-config';

@Component({
	selector: 'app-transaction-details',
	templateUrl: './transaction-details.component.html',
	styleUrls: ['./transaction-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent {
  @Input() yapilyRedirectObject: YapilyRedirectModel;
  @Input() isPaymentSuccess: boolean;
  @Output() transactionDone = new EventEmitter();
  productName = EnvService.productFull;
  supportEmail = this.config.platformInfo.supportEmail ?? 'support@test.com';
  supportEmailLink = `mailto: ${this.config.platformInfo.supportEmail}` ?? 'mailto: support@test.com';
  finishLink = EnvService.crypto_widget_finish_link;
  constructor(
  	private _snackBar: MatSnackBar,
    private config: AppConfig,
  	public router: Router, 
  	public clipboard: Clipboard) {

  }

  onReturn(): void {
  	window.location.reload();
  }

  copyParameter(value: string): void {
  	this.clipboard.copy(value);
  	this._snackBar.open('Copied.', null, { duration: 2000 });
  }
}
