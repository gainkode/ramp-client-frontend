import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserType } from '../model/generated-models';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../menu.scss']
})
export class PersonalComponent implements OnInit {
    constructor(private auth: AuthService, private notification: NotificationService,
        private router: Router) { }

    get userName(): string {
        let name = '';
        const user = this.auth.user;
        if (user) {
            name = `${user.firstName} ${user.lastName}`;
        }
        return name;
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
