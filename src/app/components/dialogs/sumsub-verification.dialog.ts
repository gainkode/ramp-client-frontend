import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogData } from 'src/app/model/dialog.model';
import { TokenAction } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-sumsub-verification-dialog-box',
    templateUrl: 'sumsub-verification.dialog.html',
    styleUrls: ['../../../assets/button.scss', '../../../assets/dialog.scss']
})
export class SumsubVerificationDialogBox implements OnDestroy {
    complete = false;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        public dialogRef: MatDialogRef<SumsubVerificationDialogBox>,
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
                }, (error) => {})
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
