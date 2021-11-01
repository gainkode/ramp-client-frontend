import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-personal-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['../../../assets/profile.scss']
})
export class PersonalNotificationsComponent {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    // private dataListPanel!: PersonalTransactionListComponent;
    // @ViewChild('datalist') set dataList(panel: PersonalTransactionListComponent) {
    //     if (panel) {
    //         this.dataListPanel = panel;
    //         this.dataListPanel.load(this.filter);
    //     }
    // }

    //filter = new TransactionsFilter();
    inProgress = false;
    errorMessage = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private router: Router) {
        // this.filter.setData(
        //     this.activeRoute.snapshot.params['wallets'],
        //     this.activeRoute.snapshot.params['types'],
        //     this.activeRoute.snapshot.params['date'],
        //     this.activeRoute.snapshot.params['sender']
        // );
    }

    onFilterUpdate(filter: TransactionsFilter): void {
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
