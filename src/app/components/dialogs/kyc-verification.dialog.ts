import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogData } from 'src/app/model/dialog.model';
import { TokenAction } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-kyc-verification-dialog-box',
    templateUrl: 'kyc-verification.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class KycVerificationDialogBox implements OnDestroy {
    complete = false;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private router: Router,
        private auth: AuthService,
        public dialogRef: MatDialogRef<KycVerificationDialogBox>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

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
                    this.router.navigateByUrl(this.auth.getUserMainPage()).then(() => {
                        window.location.reload();
                    });
                }, (error) => {
                    this.complete = true;
                    this.dialogRef.close();
                })
            );
        } else {
            this.complete = true;
            this.dialogRef.close();
        }
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
