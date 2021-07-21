import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginResult, SettingsCommon, UserType } from '../model/generated-models';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBox } from '../components/common-box.dialog';
import { ErrorService } from '../services/error.service';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    userType = UserType.Personal;
    inProgress = false;
    errorMessage = '';
    showExtraOptions = true;

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private router: Router, public dialog: MatDialog) { }

    private showWrongUserTypeRedirectDialog(userType: UserType): void {
        const dialogRef = this.dialog.open(CommonDialogBox, {
            width: '550px',
            data: {
                title: 'Authentication',
                message: `You are signing in as a ${userType.toLowerCase()} in the personal section. You will be redirected to the merchant section.`
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.router.navigateByUrl('/auth/merchant/login');
        });
    }

    private handleSuccessLogin(userData: LoginResult): void {
        this.auth.setLoginUser(userData);
        this.inProgress = true;
        this.auth.getSettingsCommon().valueChanges.subscribe(settings => {
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
        });
    }

    onError(error: string): void {
        this.errorMessage = error;
    }

    onProgressChange(status: boolean): void {
        this.inProgress = status;
    }

    onAuthenticated(userData: LoginResult): void {
        if (userData.user?.type === UserType.Personal) {
            if (userData.authTokenAction === 'Default') {
                this.handleSuccessLogin(userData);
            } else {
                this.auth.logout();
                this.errorMessage = 'Unable to sign in';
            }
        } else {
            this.auth.logout();
            let u = UserType.Merchant;
            if (userData.user?.type) {
                u = userData.user?.type;
            }
            this.showWrongUserTypeRedirectDialog(u);
        }
    }

    onSocialAuthenticated(userData: LoginResult): void {
        if (userData.user?.type === UserType.Personal) {
            if (userData.authTokenAction === 'Default') {
                this.handleSuccessLogin(userData);
            } else if (userData.authTokenAction === 'ConfirmName') {
                this.auth.logout();
                this.router.navigateByUrl(`/auth/personal/signup/${userData.authToken}`);
            } else {
                this.auth.logout();
                this.errorMessage = `Invalid authentication via social media`;
            }
        } else {
            this.auth.logout();
            let u = UserType.Merchant;
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
