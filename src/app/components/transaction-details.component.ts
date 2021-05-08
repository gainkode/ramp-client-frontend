import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../model/generated-models';
import { TransactionItem } from '../model/transaction.model';
import { UserItem } from '../model/user.model';
import { AuthService } from '../services/auth.service';
import { CommonDataService } from '../services/common-data.service';
import { ErrorService } from '../services/error.service';

@Component({
    selector: 'app-transaction-details',
    templateUrl: 'transaction-details.component.html',
    styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {
    @Input() transaction: TransactionItem | null | undefined = null;

    private _userSubscription!: any;

    inProgress = false;
    errorMessage = '';
    currentUser: UserItem | null = null;

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private dataService: CommonDataService, private router: Router) {
    }

    ngOnInit(): void {
        this.currentUser = null;
        if (this.transaction?.accountId !== null) {
            const id = this.transaction?.accountId as string;
            const userData = this.dataService.getUserById(id);
            if (userData === null) {
                this.errorMessage = this.errorHandler.getRejectedCookieMessage();;
            } else {
                this.inProgress = true;
                this._userSubscription = userData.valueChanges.subscribe(({ data }) => {
                    const user = data.userById as User;
                    this.currentUser = new UserItem(user);
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
    }

    ngOnDestroy(): void {
        console.log('destroy');
        const s: Subscription = this._userSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
    }
}
