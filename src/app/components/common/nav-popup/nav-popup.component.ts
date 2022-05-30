import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MenuItem } from '../../../model/common.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuCloseReason } from '@angular/material/menu/menu';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Subscription } from 'rxjs';
import { CommonDataService } from 'src/app/services/common-data.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-nav-popup',
    templateUrl: 'nav-popup.component.html',
    styleUrls: ['nav-popup.component.scss', '../../../../assets/fonts.scss', '../../../../assets/colors.scss', '../../../../assets/menu.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavPopupComponent implements OnInit, OnDestroy {
    @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Output() onTransactionUpdate = new EventEmitter<string>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() userName: string = '';
    @Input() avatar: string = '';

    private subscriptions: Subscription = new Subscription();

    menuOpened = false;
    menuArrow = 'expand_more';
    barHorizontalPosition: MatSnackBarHorizontalPosition = 'right';
    barVerticalPosition: MatSnackBarVerticalPosition = 'top';
    userId: string | undefined = undefined;

    constructor(
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private commonService: CommonDataService,
        private notification: NotificationService
    ) { }

    ngOnInit(): void {
        this.userId = this.auth.user?.userId;
        this.loadTransactionsTotal();
        // if (!this.items?.some(x => x.id === 'test')) {
        //     this.items?.push(
        //         {
        //             code: 'test',
        //             id: 'test',
        //             name: 'test',
        //             url: '',
        //             icon: ''
        //         }
        //     );
        // }
    }

    ngOnDestroy(): void {
        this.stopNotifications();
    }

    private startNotifications(): void {
        this.subscriptions.add(
            this.notification.subscribeToNotifications().subscribe(
                ({ data }) => {
                    // got data
                    /**
                     * created: "2022-02-28T11:41:06.891Z"
                     * linkedId: "49df848e-62d8-401f-9777-1e3faa1655e4"
                     * linkedTable: "t_transaction"
                     * params: null
                     * text: "your deposit transaction (code: T43935, created: Mon Feb 28 2022 11:41:06 GMT+0300 (Moscow Standard Time)) status has been changed to New."
                     * title: null
                     * userId: "d05169d2-c131-4119-acc9-30f02a298ef6"
                     * userNotificationId: "ce6fc343-df19-4d31-9e56-701bd4673a9d"
                     * userNotificationLevel: "Info"
                     * userNotificationTypeCode: "TRANSACTION_STATUS_CHANGED"
                     * viewed: null
                     */
                    if (this.userId) {
                        if (data.newNotification?.userNotificationTypeCode === 'TRANSACTION_STATUS_CHANGED') {
                            this.onTransactionUpdate.emit(data.newNotification?.linkedId);
                        }
                        if (this.userId === data.newNotification?.userId) {
                            this.openSnackBar(data.newNotification);
                        }
                    }
                },
                (error) => {
                    console.error('popup notification error', error);
                    // there was an error subscribing to notifications
                }
            )
        );
    }

    private stopNotifications(): void {
        this.subscriptions.unsubscribe();
    }

    private loadTransactionsTotal(): void {
        const totalData = this.commonService.getMyTransactionsTotal();
        this.subscriptions.add(
            totalData.valueChanges.pipe(take(1)).subscribe(({ data }) => {
                this.startNotifications();
            }, (error) => {

            })
        );
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
        if (item.id === 'test') {
            this.kycNotificationTest();
            return;
        }
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }

    kycNotificationTest(): void {
        // this.subscriptions.add(
        //     this.notification.sendTestKycNotification().subscribe(({ data }) => {
        //         // data
        //     }, (error) => {
        //         // error
        //     })
        // );
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
