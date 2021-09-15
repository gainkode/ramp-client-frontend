import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { INotificationObserver } from 'src/app/services/notification.observer';
import { User } from '../../model/generated-models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-icon',
  templateUrl: 'notification.component.html',
  styleUrls: ['notification.component.scss'],
})
export class NotificationIconComponent implements OnInit, OnDestroy, INotificationObserver {
  barHorizontalPosition: MatSnackBarHorizontalPosition = 'right';
  barVerticalPosition: MatSnackBarVerticalPosition = 'top';
  user: User | null = null;
  s: Subscription | undefined = undefined;

  constructor(
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private notification: NotificationService
  ) { }

  refreshToken(): void {
    //this.stopNotifications();
    //this.startNotifications();
    console.log('Notification: Token is refreshed');
  }

  ngOnInit(): void {
    this.user = this.auth.user;
    this.startNotifications();
    this.auth.attachRefreshTokenNotification(this);
  }

  ngOnDestroy(): void {
    this.stopNotifications();
  }

  private openSnackBar(data: any): void {
    this.snackBar.openFromComponent(NotificationBarComponent, {
      duration: 10000,
      data: { message: data.text },
      panelClass: ['snackbar-box'],
      horizontalPosition: this.barHorizontalPosition,
      verticalPosition: this.barVerticalPosition,
    });
  }

  private startNotifications(): void {
    console.log('start user notification subscrption: ', this.auth.token);
    this.s = this.notification.subscribeToNotifications().subscribe(
      ({ data }) => {
        // got data
        console.log('user notification', data);
        if (this.user) {
          if (this.user.userId === data.newNotification?.userId) {
            this.openSnackBar(data.newNotification);
          }
        }
      },
      (error) => {
        console.log('notification error', error);
        // there was an error subscribing to notifications
      }
    );
  }

  private stopNotifications(): void {
    if (this.s) {
      this.s.unsubscribe();
      this.s = undefined;
    }
  }
}

@Component({
  selector: 'app-notification-bar',
  templateUrl: 'notification-bar.html',
  styleUrls: ['notification.component.scss'],
})
export class NotificationBarComponent {
  constructor(
    private snackBarRef: MatSnackBarRef<NotificationBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) { }

  public dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
