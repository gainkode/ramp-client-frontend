import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-info-settings',
    templateUrl: './personal-info.component.html',
    styleUrls: ['../../../../../assets/menu.scss', '../../../../../assets/button.scss', '../../../../../assets/profile.scss']
})
export class PersonalInfoSettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    user!: User;
    userView: UserItem = new UserItem(null);

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.loadAccountData();
    }

    private loadAccountData(): void {
        this.error.emit('');
        this.progressChange.emit(true);
        const meQuery = this.profileService.getProfileData();
        if (meQuery === null) {
            this.error.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.subscriptions.add(
                meQuery.valueChanges.subscribe(({ data }) => {
                    if (data) {
                        const userData = data.me as User;
                        if (userData) {
                            this.user = userData;
                            this.userView = new UserItem(this.user);
                        }
                    } else {
                        this.router.navigateByUrl('/');
                    }
                    this.progressChange.emit(false);
                }, (error) => {
                    this.progressChange.emit(false);
                    if (this.auth.token !== '') {
                        this.error.emit(this.errorHandler.getError(error.message, 'Unable to load user data'));
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    verifyKyc(): void {
        this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
            window.location.reload();
        });
    }

    setAvatar(): void {
        
    }
}
