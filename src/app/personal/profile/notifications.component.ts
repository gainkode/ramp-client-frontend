import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileBaseFilter, NotificationsFilter } from 'src/app/model/filter.model';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';
import { PersonalNotificationListComponent } from './data/notification-list.component';

@Component({
    selector: 'app-personal-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['../../../assets/profile.scss']
})
export class PersonalNotificationsComponent {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    private dataListPanel!: PersonalNotificationListComponent;
    @ViewChild('datalist') set dataList(panel: PersonalNotificationListComponent) {
        if (panel) {
            this.dataListPanel = panel;
            this.dataListPanel.load(this.filter);
        }
    }

    filter = new NotificationsFilter();
    inProgress = false;
    errorMessage = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private router: Router) {
        this.filter.setData({
            unreadOnly: this.activeRoute.snapshot.params['unreadOnly'],
            search: this.activeRoute.snapshot.params['search']
        });
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

    showDetails(details: ProfileItemContainer): void {
        this.onShowDetails.emit(details);
    }
}
