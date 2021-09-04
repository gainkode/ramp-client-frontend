import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MenuItem } from '../../../model/common.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuCloseReason } from '@angular/material/menu/menu';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-nav-popup',
    templateUrl: 'nav-popup.component.html',
    styleUrls: ['nav-popup.component.scss', '../../../fonts.scss', '../../../colors.scss', '../../../menu.scss']
})
export class NavPopupComponent implements OnInit {
    @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() userName: string = '';

    menuOpened = false;
    barHorizontalPosition: MatSnackBarHorizontalPosition = 'right';
    barVerticalPosition: MatSnackBarVerticalPosition = 'top';
    userId: string | undefined = undefined;

    private openSnackBar(data: any): void {
        this.snackBar.openFromComponent(NotificationBarComponent, {
            duration: 10000,
            data: { message: data.text },
            panelClass: ['snackbar-box'],
            horizontalPosition: this.barHorizontalPosition,
            verticalPosition: this.barVerticalPosition,
        });
    }

    constructor(
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private notification: NotificationService
    ) { }

    ngOnInit(): void {
        this.userId = this.auth.user?.userId;
        this.notification.subscribeToNotifications().subscribe(
            ({ data }) => {
                // got data
                console.log('popup user notification', data);
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

    clickItem(item: MenuItem): void {
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }

    onMenuOpened(): void {
        this.menuOpened = true;
    }

    onMenuClosed(reason: MenuCloseReason): void {
        this.menuOpened = false;
    }

    isItemSeparatorVisible(itemIndex: number): boolean {
        let result = false;
        if (this.items) {
            result = (itemIndex < this.items.length - 1);
        }
        return result;
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
