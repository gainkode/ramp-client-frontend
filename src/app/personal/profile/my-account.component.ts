import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-my-account',
    templateUrl: './my-account.component.html'
})
export class PersonalMyAccountComponent implements OnInit, OnDestroy {
    private pUserSubscription!: any;
    inProgress = false;
    errorMessage = '';
    passwordCanBeChanged = false;
    twoFaEnabled = false;
    user!: User;

    constructor(
        private auth: AuthService,
        private profile: ProfileDataService,
        private errorHandler: ErrorService,
        private router: Router) {}

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pUserSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
    }

    twoFaChanged(): void {
        this.loadData();
    }

    private loadData(): void {
        this.errorMessage = '';
        this.inProgress = true;
        const meQuery = this.profile.getProfileData();
        if (meQuery === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            if (this.pUserSubscription) {
                (this.pUserSubscription as Subscription).unsubscribe();
            }
            this.pUserSubscription = meQuery.valueChanges.subscribe(({ data }) => {
                const userData = data.me as User;
                if (userData) {
                    this.user = userData;
                    this.passwordCanBeChanged = this.user.hasEmailAuth as boolean;
                    this.twoFaEnabled = this.user.is2faEnabled as boolean;
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load user data');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }
}
