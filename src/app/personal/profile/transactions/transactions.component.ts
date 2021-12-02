import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileBaseFilter, TransactionsFilter } from 'src/app/model/filter.model';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';
import { PersonalTransactionListComponent } from './data/transaction-list.component';

@Component({
    selector: 'app-personal-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['../../../../assets/profile.scss']
})
export class PersonalTransactionsComponent {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onShowError = new EventEmitter<string>();
    private dataListPanel!: PersonalTransactionListComponent;
    @ViewChild('datalist') set dataList(panel: PersonalTransactionListComponent) {
        if (panel) {
            this.dataListPanel = panel;
            this.dataListPanel.load(this.filter);
        }
    }

    filter = new TransactionsFilter();
    inProgress = false;
    errorMessage = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private router: Router) {
        this.filter.setData({
            wallets: this.activeRoute.snapshot.params['wallets'],
            types: this.activeRoute.snapshot.params['types'],
            date: this.activeRoute.snapshot.params['date'],
            sender: this.activeRoute.snapshot.params['sender']
        });
    }

    onFilterUpdate(filter: ProfileBaseFilter): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([
                `${this.auth.getUserMainPage()}/transactions`,
                filter.getParameters()
            ])
        );
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.onShowError.emit(this.errorMessage);
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
