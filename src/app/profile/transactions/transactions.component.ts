import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileBaseFilter, TransactionsFilter } from 'model/filter.model';
import { UserType } from 'model/generated-models';
import { ProfileItemContainer } from 'model/profile-item.model';
import { AuthService } from 'services/auth.service';
import { ProfileTransactionListComponent } from './data/transaction-list.component';

@Component({
    selector: 'app-profile-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['../../../assets/profile.scss']
})
export class ProfileTransactionsComponent {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onShowError = new EventEmitter<string>();
    private dataListPanel!: ProfileTransactionListComponent;
    @ViewChild('datalist') set dataList(panel: ProfileTransactionListComponent) {
        if (panel) {
            this.dataListPanel = panel;
            this.dataListPanel.load(this.filter);
        }
    }

    filter = new TransactionsFilter(this.auth.user?.type ?? UserType.Personal);
    inProgress = false;
    errorMessage = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private router: Router) {
        const walletId = this.activeRoute.snapshot.params['wallet'] ?? '';
        this.filter.setData({
            wallets: this.activeRoute.snapshot.params['wallets'],
            types: this.activeRoute.snapshot.params['types'],
            date: this.activeRoute.snapshot.params['date'],
            sender: this.activeRoute.snapshot.params['sender']
        });
        this.filter.walletAddress = walletId;
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

    update(): void {
        this.dataListPanel.load(this.filter);
    }

    updateTransactionStatus(transactionId: string): void {
        this.dataListPanel.updateTransactionStatus(transactionId);
    }
}
