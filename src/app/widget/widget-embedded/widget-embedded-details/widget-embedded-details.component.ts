import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
	AbstractControl,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { WidgetSettings } from 'model/payment-base.model';
import { CheckoutSummary } from 'model/payment.model';
import { distinctUntilChanged } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { WalletValidator } from 'utils/wallet.validator';

@Component({
	selector: 'app-widget-embedded-details',
	templateUrl: './widget-embedded-details.component.html',
	styleUrls: ['./widget-embedded-details.component.scss'],
})
export class WidgetEmbeddedDetailsComponent {
  @Input() showWidgetDetails = false;
  @Input() settings: WidgetSettings = new WidgetSettings();
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Output() backToOverview = new EventEmitter<boolean>();
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onDataUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onWalletAddressUpdated = new EventEmitter<CheckoutSummary>();
  @Output() onVerifyWhenPaidChanged = new EventEmitter<boolean>();
  @Output() onQuoteChanged = new EventEmitter<number>();
  @Output() onComplete = new EventEmitter<string>();

  emailErrorMessages: { [key: string]: string; } = {
  	['pattern']: 'Email is not valid',
  	['required']: 'Email is required',
  };

  walletErrorMessages: { [key: string]: string; } = {
  	['required']: 'Address is required'
  };


  dataForm = this.formBuilder.group(
  	{
  		email: [
  			'',
  			{
  				validators: [
  					Validators.required,
  					Validators.pattern(
  						/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  					),
  				],
  				updateOn: 'change',
  			},
  		],
  		wallet: [undefined, { validators: [], updateOn: 'change' }],
  	},
  	{
  		validators: [
  			WalletValidator.addressValidator(
  				'wallet',
  				'currencyReceive',
  				'transaction'
  			),
  		],
  		updateOn: 'change',
  	}
  );

  get emailField(): AbstractControl {
  	return this.dataForm.get('email');
  }

  get walletField(): AbstractControl | null {
  	return this.dataForm.get('wallet');
  }

  get isOrderDetailsFormValid(): boolean {
  	return (
  		!this.dataForm.valid ||
      !this.walletField?.valid ||
      !this.emailField?.valid
  	);
  }

  constructor(
  	private router: Router,
  	private auth: AuthService,
  	private formBuilder: UntypedFormBuilder
  ) {
  	if (this.summary?.email) {
  		this.emailField?.setValue(this.summary.email);
  	}

  	if (this.summary?.address) {
  		this.walletField?.setValue(this.summary.address);
  		// this.walletInit = false;
  		// if (this.summary.address !== '') {
  		// 	this.selectedWallet = this.wallets.find(x => x.address === this.summary?.address);
  		// 	this.walletSelectorField?.setValue(this.summary.address);
  		// }
  	}

  	this.walletField?.valueChanges
  		.pipe(distinctUntilChanged((prev, curr) => prev === curr))
  		.subscribe((val) => this.onWalletUpdated(val));
  }

  private onWalletUpdated(val: string): void {}

  onSubmit(): void {
  	this.onProgress.emit(true);
  	if (this.dataForm.valid) {
  		if (this.auth.user) {
  			if (this.auth.user.email !== this.emailField?.value) {
  				this.auth.logout();
  				return;
  			}
  		}
  		// this.initialized = false;
  		// this.onVerifyWhenPaidChanged.emit(
  		// 	this.verifyWhenPaidField?.value ?? false
  		// );
  		this.onComplete.emit(this.emailField?.value);
  	}
  }
}
