import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileBaseFilter } from 'src/app/model/filter.model';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-personal-wallets',
    templateUrl: './wallets.component.html',
    styleUrls: ['../../../assets/profile.scss']
})
export class PersonalWalletsComponent {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    // private dataListPanel!: PersonalWalletListComponent;
    // @ViewChild('datalist') set dataList(panel: PersonalWalletListComponent) {
    //     if (panel) {
    //         this.dataListPanel = panel;
    //         this.dataListPanel.load(this.filter);
    //     }
    // }

    //filter = new WalletsFilter();
    inProgress = false;
    errorMessage = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private router: Router) {
        // this.filter.setData({
        //     currencies: this.activeRoute.snapshot.params['currencies'],
        //     zeroBalance: this.activeRoute.snapshot.params['balance']
        // });
    }

    onFilterUpdate(filter: ProfileBaseFilter): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([
                `${this.auth.getUserMainPage()}/wallets`,
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
