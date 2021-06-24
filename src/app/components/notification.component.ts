import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ErrorService } from "../services/error.service";
import { NotificationService } from "../services/notification.service";

@Component({
  selector: "app-notification-icon",
  templateUrl: "notification.component.html",
  styleUrls: ["notification.component.scss"],
})
export class NotificationComponent implements OnInit {
    constructor(private auth: AuthService, private notification: NotificationService,
        private errorHandler: ErrorService) {}

    ngOnInit(): void {
        this.notification.subscribeToNotifications().subscribe(({ data }) => {
            // got data
            console.log(data);
        }, (error) => {
            // there was an error subscribing to notifications
        });
    }
}
