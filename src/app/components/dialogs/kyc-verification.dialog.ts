import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogData } from 'model/dialog.model';
import { TokenAction } from 'model/generated-models';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-kyc-verification-dialog-box',
	templateUrl: 'kyc-verification.dialog.html',
	styleUrls: ['../../../assets/dialog.scss']
})
export class KycVerificationDialogBox implements OnDestroy {
	complete = false;
	errorMessage = '';
    
	private subscriptions: Subscription = new Subscription();

	constructor(
		private router: Router,
		private auth: AuthService,
		public dialogRef: MatDialogRef<KycVerificationDialogBox>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData) {

	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	onComplete(): void {
		if (this.auth.getAuthAction() === TokenAction.KycRequired) {
			this.subscriptions.add(
				this.auth.authenticateVerifiedMerchant().subscribe(({ data }) => {
					this.auth.setLoginUser(data.generateDefaultTokenWhenKycSent);
					this.complete = true;
					this.dialogRef.close();
					void this.router.navigateByUrl(this.auth.getUserMainPage()).then(() => {
						setTimeout(() => {
							window.location.reload();
						  }, 0);
					});
				}, () => {
					this.complete = true;
					this.dialogRef.close();
				})
			);
		} else {
			this.complete = true;
			this.dialogRef.close();
		}
	}

	handleError(message: string): void {
		this.setError(message);
	}

	private setError(message: string): void {
		this.errorMessage = message;
	}

	onClose(): void {
		this.dialogRef.close();
	}
}
