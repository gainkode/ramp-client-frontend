import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserNotification } from '../model/generated-models';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { NotificationService } from '../services/notification.service';
import { ProfileDataService } from '../services/profile.service';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../menu.scss']
})
export class PersonalComponent implements OnInit {
    inProgress = false;
    errorMessage = '';
    _selectedSection = '';
    notifications: UserNotification[] = [];

    constructor(private auth: AuthService, private notification: NotificationService,
        private profile: ProfileDataService, private errorHandler: ErrorService, private router: Router) {
        this._selectedSection = 'home';
    }

    get userName(): string {
        let name = '';
        const user = this.auth.user;
        if (user) {
            name = `${user.firstName} ${user.lastName}`;
        }
        return name;
    }

    get selectedSection(): string {
        return this._selectedSection;
    }

    ngOnInit(): void {
        this.notification.subscribeToNotifications().subscribe(({ data }) => {
            // got data
        }, (error) => {
            // there was an error subscribing to notifications
        });
        this.routeTo(`/personal/main/${this._selectedSection}`);

    }

    routeTo(link: string): void {
        const urlBlocks = link.split('/');
        if (urlBlocks.length > 0) {
            const s = urlBlocks[urlBlocks.length - 1];
            if (s === 'home' || s === 'myaccount' || s === 'mycontacts' || s === 'transactions' || s === 'exchanger') {
                this._selectedSection = s;
            }
        }
        this.router.navigateByUrl(link);
        this.loadMe();
    }

    logout(): void {
        this.auth.logout();
    }

    notificationTest(): void {
        this.notification.sendTestNotification().subscribe(({ data }) => {
            // data
        }, (error) => {
            // error
        });
    }

    private loadMe(): void {
        this.errorMessage = '';
        this.inProgress = true;
        let notificationCount = 0;
        this.notifications = [];
        const meQuery = this.profile.getMe();
        if (meQuery) {
            meQuery.valueChanges.subscribe(({ data }) => {
                const userData = data.me as User;
                if (userData) {
                    if (userData.state) {
                        notificationCount = userData.state.notifications?.count as number;
                        if (notificationCount > 0) {
                            this.notifications = userData.state.notifications?.list?.map(
                                (val) => val) as UserNotification[];
                        }
                    }
                }
                console.log(this.notifications);
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
