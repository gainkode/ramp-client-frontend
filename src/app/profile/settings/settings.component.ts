import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenAction, UserType } from 'model/generated-models';
import { AuthService } from 'services/auth.service';

@Component({
    selector: 'app-profile-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['../../../assets/profile.scss', '../../../assets/button.scss']
})
export class ProfileSettingsComponent {
    @Output() onShowError = new EventEmitter<string>();
    @Output() onUpdateAvatar = new EventEmitter<string>();

    inProgress = false;
    errorMessage = '';
    selectedTab = '';
    showTabs = false;

    constructor(
        private auth: AuthService,
        private changeDetector: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router) {
        const pageId = this.route.snapshot.params['page'] ?? '';
        const apiKeysPage = (pageId === 'apikeys' && this.auth.user?.type === UserType.Merchant);
        if (pageId === 'info' || pageId === 'verification' || pageId === 'security' || pageId === 'iplist' || apiKeysPage) {
            this.pageSelected(pageId);
        } else {
            this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/info/`);
        }
        if (auth.getAuthAction() !== TokenAction.KycRequired) {
            this.showTabs = true;
        }
    }

    pageSelected(id: string): void {
        this.selectedTab = id;
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.onShowError.emit(this.errorMessage);
        this.changeDetector.detectChanges();
    }

    progressChanged(visible: boolean): void {
        this.inProgress = visible;
        this.changeDetector.detectChanges();
    }
}
