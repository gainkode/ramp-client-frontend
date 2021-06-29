import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserNotificationListResult } from 'src/app/model/generated-models';
import { NotificationItem } from 'src/app/model/notification.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './profile-notifications.component.html',
    styleUrls: ['profile.scss', 'profile-notifications.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class ProfileNotificationsComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() recent = false;
    @Input() messageLengthLimit = 80;
    @ViewChild(MatSort) sort!: MatSort;
    private pNotificationsSubscription!: any;
    inProgress = false;
    errorMessage = '';
    notifications: NotificationItem[] = [];
    notificationCount = 0;
    selectedNotification: NotificationItem | null = null;
    pageSize = 10;
    pageIndex = 0;
    sortedField = 'created';
    sortedDesc = true;

    displayedColumns: string[] = [
        'text', 'userNotificationTypeCode', 'created', 'viewed'
    ];

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private profileService: ProfileDataService, private router: Router) { }

    ngOnInit(): void {
        this.pageSize = (this.recent) ? 10 : 25;
        this.loadNotifications();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pNotificationsSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.sort.sortChange.subscribe(() => {
                this.sortedDesc = (this.sort.direction === 'desc');
                this.sortedField = this.sort.active;
                this.loadNotifications();
            });
        }
    }

    get pageTitle(): string {
        return (this.recent) ? 'Recent Notifications' : 'Notification History';
    }

    private loadNotifications(): void {
        this.notificationCount = 0;
        const notificationsData = this.profileService.getMyNotifications(
            this.pageIndex,
            this.pageSize,
            this.sortedField,
            this.sortedDesc);
        if (notificationsData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pNotificationsSubscription = notificationsData.valueChanges.subscribe(({ data }) => {
                const dataList = data.myNotifications as UserNotificationListResult;
                if (dataList !== null) {
                    this.notificationCount = dataList?.count as number;
                    if (this.notificationCount > 0) {
                        this.notifications = dataList?.list?.map((val) => new NotificationItem(val)) as NotificationItem[];
                    }
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load notifications');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    private refresh(): void {
        const s: Subscription = this.pNotificationsSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
        this.loadNotifications();
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.refresh();
        return event;
    }
}