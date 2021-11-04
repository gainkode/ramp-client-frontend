import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationsFilter } from 'src/app/model/filter.model';
import { UserNotification, UserNotificationLevel, UserNotificationListResult } from 'src/app/model/generated-models';
import { NotificationItem } from 'src/app/model/notification.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-notification-list',
    templateUrl: './notification-list.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss', './notification-list.component.scss']
})
export class PersonalNotificationListComponent implements OnDestroy, AfterViewInit {
    @Input() recent = false;
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onOpenDetails = new EventEmitter<NotificationItem>();
    @Output() onCloseDetails = new EventEmitter();
    @ViewChild(MatSort) sort!: MatSort;

    private pNotificationsSubscription: Subscription | undefined = undefined;
    private pDeleteSubscription: Subscription | undefined = undefined;
    private pSortSubscription: Subscription | undefined = undefined;
    filter = new NotificationsFilter();
    notifications: NotificationItem[] = [];
    notificationCount = 0;
    selectedNotification: NotificationItem | null = null;
    selectedRows = false;
    pageCounts = [25, 50, 100];
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'createdDate';
    sortedDesc = true;
    displayedColumns: string[] = ['selected', 'viewedIcon', 'createdDate', 'viewedDate', 'notificationCode', 'id', 'remove'];

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
        if (this.pDeleteSubscription !== undefined) {
            this.pDeleteSubscription.unsubscribe();
            this.pDeleteSubscription = undefined;
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
        } else if (this.sortedField === 'viewedDate') {
            result = 'viewed';
        } else if (this.sortedField === 'notificationCode') {
            result = 'userNotificationTypeCode';
        } else if (this.sortedField === 'id') {
            result = 'userNotificationId';
        }
        return result;
    }

    private loadNotifications(): void {
        this.notificationCount = 0;
        const notificationsData = this.profileService.getMyNotifications(
            this.filter.unreadOnly,
            this.filter.search,
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
                //const dataList = this.getFakeData();
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

    onRowSelected(selectedItem: NotificationItem): void {
        this.onOpenDetails.emit(selectedItem);
    }

    toggleSelected(item: NotificationItem): void {
        item.selected = !item.selected;
        let selectedCount = 0;
        this.notifications.forEach(x => {
            if (x.selected) {
                selectedCount++;
            }
        });
        this.selectedRows = (selectedCount > 0);
    }

    getLastItemId(): string {
        if (this.notifications.length > 0) {
            return this.notifications[this.notifications.length - 1].id;
        } else {
            return '';
        }
    }

    getNextItem(id: string): NotificationItem | undefined {
        const itemIndex = this.notifications.findIndex(x => x.id === id);
        if (itemIndex >= 0 && itemIndex < this.notifications.length - 1) {
            return this.notifications[itemIndex + 1];
        } else {
            return undefined;
        }
    }

    removeNotification(item: NotificationItem): void {
        this.removeNotifications([item.id]);
    }

    removeSelectedNotifications(): void {
        this.removeNotifications(this.notifications.map(x => x.id));
    }

    private removeNotifications(ids: string[]): void {
        this.onCloseDetails.emit();
        this.onError.emit('');
        this.onProgress.emit(true);
        const notificationsDelete = this.profileService.deleteMyNotification(ids[0]);
        this.pDeleteSubscription = notificationsDelete.subscribe(({ data }) => {
            this.loadNotifications();
        }, (error) => {
            this.onProgress.emit(false);
            this.onError.emit(this.errorHandler.getError(error.message, 'Unable to delete notifications'));
        });
    }

    private getFakeData(): UserNotificationListResult {
        return {
            count: 2,
            list: [{
                userNotificationId: 'N002',
                userId: 'user_id_1',
                userNotificationTypeCode: 'ADMIN_TO_USER_NOTIFICATION',
                userNotificationLevel: UserNotificationLevel.Request,
                created: new Date(),
                viewed: new Date(),
                text: 'Administratir requested auxiliary data'
            } as UserNotification,
            {
                userNotificationId: 'N007',
                userId: 'user_id_1',
                userNotificationTypeCode: 'ASK_TRANSACTION_REDO',
                userNotificationLevel: UserNotificationLevel.Warning,
                created: new Date(),
                viewed: undefined,
                text: 'You have to redo your transaction and put back all money to the cash office'
            } as UserNotification]
        } as UserNotificationListResult;
    }
}
