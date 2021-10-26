import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { User } from 'src/app/model/generated-models';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { PersonalTransactionListComponent } from './data/transaction-list.component';

@Component({
    selector: 'app-personal-home',
    templateUrl: './home.component.html',
    styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss', '../../../assets/profile.scss']
})
export class PersonalHomeComponent implements OnInit, OnDestroy {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    private transactionsPanel!: PersonalTransactionListComponent;
    @ViewChild('transactions') set recentTransactions(panel: PersonalTransactionListComponent) {
        if (panel) {
            this.transactionsPanel = panel;
            this.transactionsPanel.load(new TransactionsFilter());
        }
    }

    private pUserSubscription!: any;
    inProgress = false;
    errorMessage = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private auth: AuthService,
        private profile: ProfileDataService,
        private errorHandler: ErrorService,
        private router: Router) {}

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pUserSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
    }

    private loadData(): void {
        this.errorMessage = '';
        this.inProgress = true;
        const meQuery = this.profile.getProfileData();
        if (meQuery === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.pUserSubscription = meQuery.valueChanges.subscribe(({ data }) => {
                const userData = data.me as User;
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load user data');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.changeDetector.detectChanges();
    }

    progressChanged(visible: boolean): void {
        this.inProgress = visible;
        this.changeDetector.detectChanges();
    }

    showTransactionDetails(details: ProfileItemContainer): void {
        this.onShowDetails.emit(details);
    }
}
