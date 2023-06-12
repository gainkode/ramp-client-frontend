import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginResult, SettingsCommon, UserMode, UserType } from '../../model/generated-models';
import { MatDialog } from '@angular/material/dialog';
import { ErrorService } from '../../services/error.service';
import { Subscription } from 'rxjs';
import { CommonDialogBox } from 'components/dialogs/common-box.dialog';
import { EnvService } from 'services/env.service';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class MerchantLoginComponent implements OnDestroy {
    userType = UserType.Merchant;
    inProgress = false;
    errorMessage = '';
    showExtraOptions = true;
    logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
    logoAlt = EnvService.product;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        public router: Router,
        public dialog: MatDialog) { }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private showWrongUserTypeRedirectDialog(userType: UserType): void {
        const dialogRef = this.dialog.open(CommonDialogBox, {
            width: '550px',
            data: {
                title: '',//Authentication
                message: `You are signing in as a ${userType.toLowerCase()} in the merchant section. You will be redirected to the personal section.`
            }
        });
        this.subscriptions.add(
            dialogRef.afterClosed().subscribe(result => {
                this.router.navigateByUrl('/personal/auth/login');
            })
        );
    }

    private showWrongUserModeRedirectDialog(): void {
        const dialogRef = this.dialog.open(CommonDialogBox, {
            width: '550px',
            data: {
                title: '',//Authentication
                message: undefined,
                paragraphs: [
                    'Dear Customer,', 
                    'Seems like the account you are trying to access has only been registered to Exchange Services.', 
                    `You may Create a Wallet using the same email or Contact us <a href="mailto: ${EnvService.support_email}">${EnvService.support_email}</a>.`
                ]
            }
        });
    }

    private handleSuccessLogin(userData: LoginResult): void {
        this.auth.setLoginUser(userData);
        this.inProgress = true;
        this.subscriptions.add(
            this.auth.getSettingsCommon()?.valueChanges.subscribe(settings => {
                const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
                this.auth.setLocalSettingsCommon(settingsCommon);
                this.inProgress = false;
                this.router.navigateByUrl(this.auth.getUserMainPage());
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load common settings');
                } else {
                    this.router.navigateByUrl('/');
                }
            })
        );
    }

    onError(error: string) {
        this.errorMessage = error;
    }

    onProgressChange(status: boolean): void {
        this.inProgress = status;
    }

    onAuthenticated(userData: LoginResult): void {
        if(userData.user?.mode == UserMode.OneTimeWallet){
            this.showWrongUserModeRedirectDialog();
        }else if (userData.user?.type === UserType.Merchant) {
            if (userData.authTokenAction === 'Default' || userData.authTokenAction === 'KycRequired') {
                this.handleSuccessLogin(userData);
            } else {
                this.auth.logout();
                this.errorMessage = 'Unable to sign in';
            }
        } else {
            this.auth.logout();
            let u = UserType.Personal;
            if (userData.user?.type) {
                u = userData.user?.type;
            }
            this.showWrongUserTypeRedirectDialog(u);
        }
    }

    onLoginExtraData(visible: boolean): void {
        this.showExtraOptions = !visible;
    }
}
