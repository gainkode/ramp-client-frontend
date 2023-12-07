import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EnvService } from 'services/env.service';
import { YapilyRedirectModel } from '../banks-page/bank.component';

@Component({
	selector: 'app-transaction-details',
	templateUrl: './transaction-details.component.html',
	styleUrls: ['./transaction-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent {
  @Input() yapilyRedirectObject: YapilyRedirectModel;
  @Output() transactionDone = new EventEmitter();
  success = false;
  productName = EnvService.productFull;
  supportEmail = EnvService.support_email ?? 'support@test.com';
  supportEmailLink = `mailto: ${EnvService.support_email}` ?? 'mailto: support@test.com';
  finishLink = EnvService.crypto_widget_finish_link;

  constructor(
  	private _snackBar: MatSnackBar,
  	public router: Router, 
  	public clipboard: Clipboard) {

  }

  onReturn(): void {
  	void this.router.navigateByUrl(this.finishLink).then(() => {
  		window.location.reload();
  	});
  }

  copyParameter(value: string): void {
  	this.clipboard.copy(value);
  	this._snackBar.open('Copied.', null, { duration: 2000 });
  }
}
