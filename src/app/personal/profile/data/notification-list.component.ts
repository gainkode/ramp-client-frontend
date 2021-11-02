import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationsFilter } from 'src/app/model/filter.model';
import { TransactionShortListResult, UserNotificationListResult } from 'src/app/model/generated-models';
import { NotificationItem } from 'src/app/model/notification.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-notification-list',
    templateUrl: './notification-list.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss', './transaction-list.component.scss']
})
export class PersonalNotificationListComponent implements OnDestroy, AfterViewInit {
    @Input() recent = false;
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @ViewChild(MatSort) sort!: MatSort;

    private pNotificationsSubscription: Subscription | undefined = undefined;
    private pStatusSubscription: Subscription | undefined = undefined;
    private pSortSubscription: Subscription | undefined = undefined;
    filter = new NotificationsFilter();
    notifications: NotificationItem[] = [];
    notificationCount = 0;
    selectedNotification: NotificationItem | null = null;
    pageCounts = [25, 50, 100];
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'createdDate';
    sortedDesc = true;
    //displayedColumns: string[] = ['selected', 'viewedIcon', 'createdDate', 'viewedDate', 'notificationCode', 'id'];
    displayedColumns: string[] = ['createdDate'];

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    load(val: NotificationsFilter): void {
        this.filter = val;
        if (this.recent) {
            this.pageSize = 10;
            this.sortedField = 'dt';
        }
        this.loadNotifications();
    }

    ngOnDestroy(): void {
        if (this.pNotificationsSubscription !== undefined) {
            this.pNotificationsSubscription.unsubscribe();
            this.pNotificationsSubscription = undefined;
        }
        if (this.pStatusSubscription !== undefined) {
            this.pStatusSubscription.unsubscribe();
            this.pStatusSubscription = undefined;
        }
        if (this.pSortSubscription !== undefined) {
            this.pSortSubscription.unsubscribe();
            this.pSortSubscription = undefined;
        }
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.pSortSubscription = this.sort.sortChange.subscribe(() => {
                this.sortedDesc = (this.sort.direction === 'desc');
                this.sortedField = this.sort.active;
                this.loadNotifications();
            });
        }
    }

    private getSortedField(): string {
        let result = this.sortedField;
        if (this.sortedField === 'createdDate') {
            result = 'created';
        } else if (this.sortedField === 'notification') {
            result = 'type';
        } else if (this.sortedField === 'sender') {
            result = '';
        } else if (this.sortedField === 'recipient') {
            result = '';
        } else if (this.sortedField === 'sent') {
            result = 'amountToSpend';
        } else if (this.sortedField === 'received') {
            result = 'amountToReceive';
        } else if (this.sortedField === 'fees') {
            result = 'feeFiat';
        }
        return result;
    }

    private loadNotifications(): void {
        this.notificationCount = 0;
        const notificationsData = this.profileService.getMyNotifications(
            this.pageIndex,
            this.pageSize,
            this.getSortedField(),
            this.sortedDesc);
        if (notificationsData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.onProgress.emit(true);
            this.pNotificationsSubscription = notificationsData.valueChanges.subscribe(({ data }) => {
                const dataList = data.myNotifications as UserNotificationListResult;
                if (dataList !== null) {
                    console.log(dataList);
                    this.notificationCount = dataList?.count as number;
                    if (this.notificationCount > 0) {
                        this.notifications = dataList?.list?.map((val) => {
                            return new NotificationItem(val);
                        }) as NotificationItem[];
                    }
                }
                this.onProgress.emit(false);
            }, (error) => {
                this.onProgress.emit(false);
                if (this.auth.token !== '') {
                    this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load notifications'));
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    private refresh(): void {
        if (this.pNotificationsSubscription !== undefined) {
            this.pNotificationsSubscription.unsubscribe();
            this.pNotificationsSubscription = undefined;
        }
        this.loadNotifications();
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.refresh();
        return event;
    }

    showDetailsPanel(): void {
        
    }
}
