import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html'
})
export class PersonalComponent implements OnInit {
    constructor(private auth: AuthService, private notification: NotificationService,
        private router: Router) { }

    ngOnInit(): void {
        this.notification.subscribeToNotifications().subscribe(({ data }) => {
            console.log('got data ', data);
        }, (error) => {
            console.log('there was an error sending the query', error);
        });
    }

    logout(): void {
        this.auth.logout();
    }

    notificationTest(): void {
        this.notification.sendTestNotification().subscribe(({ data }) => {
            console.log(data);
        }, (error) => {
            console.log(error);
        });
    }
}
