import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, UserNotification } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-home',
    templateUrl: './home.component.html'
})
export class PersonalHomeComponent implements OnInit, OnDestroy {
    private pUserSubscription!: any;
    inProgress = false;
    errorMessage = '';

    constructor(private auth: AuthService, private profile: ProfileDataService,
        private errorHandler: ErrorService, private router: Router) {}

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pUserSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
    }

    private loadData(): void {
        this.errorMessage = '';
        this.inProgress = true;
        const meQuery = this.profile.getProfileHomeData();
        if (meQuery === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.pUserSubscription = meQuery.valueChanges.subscribe(({ data }) => {
                const userData = data.me as User;
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