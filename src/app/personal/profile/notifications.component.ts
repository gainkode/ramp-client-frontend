import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileBaseFilter, NotificationsFilter } from 'src/app/model/filter.model';
import { NotificationItem } from 'src/app/model/notification.model';
import { AuthService } from 'src/app/services/auth.service';
import { PersonalNotificationListComponent } from './data/notification-list.component';
import { Subscription } from 'rxjs';
import { ProfileDataService } from 'src/app/services/profile.service';
import { ErrorService } from 'src/app/services/error.service';
import { UserNotification } from 'src/app/model/generated-models';

@Component({
    selector: 'app-personal-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['../../../assets/profile.scss', '../../../assets/button.scss']
})
export class PersonalNotificationsComponent implements OnDestroy {
    private dataListPanel!: PersonalNotificationListComponent;
    @ViewChild('datalist') set dataList(panel: PersonalNotificationListComponent) {
        if (panel) {
            this.dataListPanel = panel;
            this.dataListPanel.load(this.filter);
        }
    }

    lastItem = false;
    details = false;
    filter = new NotificationsFilter();
    inProgress = false;
    errorMessage = '';
    selectedNotification: NotificationItem | undefined = undefined;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private profileService: ProfileDataService,
        private errorHandler: ErrorService,
        private router: Router) {
        this.filter.setData({
            unreadOnly: this.activeRoute.snapshot.params['unreadOnly'],
            search: this.activeRoute.snapshot.params['search']
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onFilterUpdate(filter: ProfileBaseFilter): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([
                `${this.auth.getUserMainPage()}/notifications`,
                filter.getParameters()
            ])
        );
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.changeDetector.detectChanges();
    }

    progressChanged(visible: boolean): void {
        this.inProgress = visible;
        this.changeDetector.detectChanges();
    }

    showDetails(item: NotificationItem): void {
        this.selectNotification(item);
        this.details = true;
    }

    nextItem(): void {
        this.selectNotification(this.dataListPanel.getNextItem(this.selectedNotification?.id ?? ''));
    }

    selectNotification(item: NotificationItem | undefined): void {
        this.selectedNotification = item;
        if (item) {
            this.lastItem = (this.dataListPanel.getLastItemId() === item.id);
            if (item.viewedStatus === false) {
                this.setNotificationViewed(item.id);
            }
        } else {
            this.lastItem = true;
        }
    }

    private setNotificationViewed(id: string): void {
        this.inProgress = true;
        this.subscriptions.add(
            this.profileService.makeNotificationsViewed([id]).subscribe(({ data }) => {
                if (data) {
                    const resultList = data.makeNotificationsViewed as UserNotification[];
                    if (resultList.length > 0) {
                        const notification = resultList[0];
                        this.dataListPanel.setViewed(notification.userNotificationId, notification.viewed);
                    }
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, `Unable to change notification status`);
            })
        );
    }
}
