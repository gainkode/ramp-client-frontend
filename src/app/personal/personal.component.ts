import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html'
})
export class PersonalComponent {
    constructor(private auth: AuthService, private notification: NotificationService,
        private formBuilder: FormBuilder, private router: Router) { }

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
