import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MenuItem } from '../../../model/common.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuCloseReason } from '@angular/material/menu/menu';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-nav-popup',
    templateUrl: 'nav-popup.component.html',
    styleUrls: ['nav-popup.component.scss', '../../../../assets/fonts.scss', '../../../../assets/colors.scss', '../../../../assets/menu.scss']
})
export class NavPopupComponent implements OnInit, OnDestroy {
    @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() userName: string = '';

    private pNotificationSubscription: Subscription | undefined = undefined;

    menuOpened = false;
    menuArrow = 'expand_more';
    barHorizontalPosition: MatSnackBarHorizontalPosition = 'right';
    barVerticalPosition: MatSnackBarVerticalPosition = 'top';
    userId: string | undefined = undefined;

    constructor(
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private notification: NotificationService
    ) { }

    ngOnInit(): void {
        this.userId = this.auth.user?.userId;
        this.startNotifications();
    }

    ngOnDestroy(): void {
        this.stopNotifications();
    }

    private startNotifications(): void {
        console.log('start popup user notification subscrption: ', this.auth.token);
        this.pNotificationSubscription = this.notification.subscribeToNotifications().subscribe(
            ({ data }) => {
                // got data
                if (this.userId) {
                    if (this.userId === data.newNotification?.userId) {
                        this.openSnackBar(data.newNotification);
                    }
                }
            },
            (error) => {
                console.log('popup notification error', error);
                // there was an error subscribing to notifications
            }
        );
    }

    private stopNotifications(): void {
        if (this.pNotificationSubscription) {
            this.pNotificationSubscription.unsubscribe();
            this.pNotificationSubscription = undefined;
        }
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

    clickItem(item: MenuItem): void {
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }

    onMenuOpened(): void {
        this.menuOpened = true;
        this.menuArrow = 'expand_less';
    }

    onMenuClosed(reason: MenuCloseReason): void {
        this.menuOpened = false;
        this.menuArrow = 'expand_more';
    }
}

@Component({
    selector: 'app-notification-bar',
    templateUrl: 'notification-bar.html',
    styleUrls: ['nav-popup.component.scss']
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
