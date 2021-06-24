import { Component, Inject, Input, OnInit } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
  MAT_SNACK_BAR_DATA,
} from "@angular/material/snack-bar";
import { User } from "../../model/generated-models";
import { AuthService } from "../../services/auth.service";
import { ErrorService } from "../../services/error.service";
import { NotificationService } from "../../services/notification.service";

@Component({
  selector: "app-notification-icon",
  templateUrl: "notification.component.html",
  styleUrls: ["notification.component.scss"],
})
export class NotificationIconComponent implements OnInit {
  barHorizontalPosition: MatSnackBarHorizontalPosition = "right";
  barVerticalPosition: MatSnackBarVerticalPosition = "top";
  user: User | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.user;
    this.notification.subscribeToNotifications().subscribe(
      ({ data }) => {
        // got data
        console.log(data);
        if (this.user) {
          if (this.user.userId === data.newNotification?.userId) {
            this.openSnackBar(data.newNotification);
          }
        }
      },
      (error) => {
        // there was an error subscribing to notifications
      }
    );
  }

  private openSnackBar(data: any) {
    this.snackBar.openFromComponent(NotificationBarComponent, {
      duration: 10000,
      data: { message: data.text },
      panelClass: ["snackbar-box"],
      horizontalPosition: this.barHorizontalPosition,
      verticalPosition: this.barVerticalPosition,
    });
  }
}

@Component({
  selector: "app-notification-bar",
  templateUrl: "notification-bar.html",
  styleUrls: ["notification.component.scss"],
})
export class NotificationBarComponent {
  constructor(
    private snackBarRef: MatSnackBarRef<NotificationBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  public dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
