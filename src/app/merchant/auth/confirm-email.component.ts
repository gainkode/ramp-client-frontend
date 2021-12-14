import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
    templateUrl: 'confirm-email.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class MerchantConfirmEmailComponent implements OnDestroy {
    token = '';
    validated = false;
    valid = false;
    errorMessage = '';

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params['token'];
        if (this.token !== undefined) {
            this.subscriptions.add(
                this.auth.confirmEmail(this.token).subscribe(({ data }) => {
                    this.validated = true;
                    this.valid = true;
                }, (error) => {
                    this.validated = true;
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to validate email');
                })
            );
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
