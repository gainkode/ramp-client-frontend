import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonDialogBox } from './components/dialogs/common-box.dialog';
import { UserMode } from './model/generated-models';
import { CheckoutSummary } from './model/payment.model';
import { AuthService } from './services/auth.service';
import { EnvService } from './services/env.service';

@Component({
    templateUrl: 'intro.component.html',
    styleUrls: ['../assets/button.scss', '../assets/intro.scss']
})
export class IntroComponent implements OnInit {
    logoSrc = `${EnvService.image_host}/images/logo-color.png`;
    logoAlt = EnvService.product;

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private auth: AuthService) { }

    ngOnInit(): void {
        if (this.auth.authenticated) {
            if (this.auth.user?.mode === UserMode.InternalWallet) {
                this.router.navigateByUrl(this.auth.getUserMainPage());
            }
        }
    }

    routeTo(link: string): void {
        this.router.navigateByUrl(link);
    }

    onWidgetComplete(data: CheckoutSummary): void {
        const url = `payment/quickcheckout-express/${data.currencyFrom}/${data.currencyTo}/${data.amountFrom}`;
        this.router.navigateByUrl(url);
    }

    onWidgetError(error: string): void {
        if (error !== '') {
            const dialogRef = this.dialog.open(CommonDialogBox, {
                width: '450px',
                data: {
                    title: 'Error',
                    message: error
                }
            });
            const intervalId = setInterval(() => {
                dialogRef.close(undefined);
                clearInterval(intervalId);
            }, 10000);
        }
    }
}
