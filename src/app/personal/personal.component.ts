import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../menu.scss']
})
export class PersonalComponent implements OnInit {
    _selectedSection = '';

    constructor(private auth: AuthService, private notification: NotificationService,
        private router: Router) {
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
        //this.routeTo('/home');
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
}
