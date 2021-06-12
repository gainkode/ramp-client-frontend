import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionShortListResult, TransactionSource } from 'src/app/model/generated-models';
import { TransactionItem } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-transactions',
    templateUrl: './profile-transactions.component.html',
    styleUrls: ['profile.scss', 'profile-transactions.component.scss']
})
export class ProfileTransactionsComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort!: MatSort;
    private pTransactionsSubscription!: any;
    inProgress = false;
    errorMessage = '';
    transactions: TransactionItem[] = [];
    transactionCount = 0;
    pageSize = 10;
    pageIndex = 0;

    displayedColumns: string[] = [
        'id', 'created', 'executed', 'type', 'instrument', 'payment',
        'currencyToSpend', 'amountToSpend', 'fees', 'balance', 'status'
    ];

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private profileService: ProfileDataService, private router: Router) { }

    ngOnInit(): void {
        this.loadTransactions();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pTransactionsSubscription;
        if (s !== undefined) {
            s.unsubscribe();
        }
    }

    private loadTransactions(): void {
        this.transactionCount = 0;
        const transactionsData = this.profileService.getMyTransactions(
            this.pageIndex,
            this.pageSize,
            [TransactionSource.QuickCheckout, TransactionSource.Wallet, TransactionSource.Widget],
            'created',
            true);
        if (transactionsData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pTransactionsSubscription = transactionsData.valueChanges.subscribe(({ data }) => {
                const dataList = data.getMyTransactions as TransactionShortListResult;
                if (dataList !== null) {
                    console.log(dataList);
                    this.transactionCount = dataList?.count as number;
                    if (this.transactionCount > 0) {
                        this.transactions = dataList?.list?.map((val) => new TransactionItem(val)) as TransactionItem[];
                    }
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }
}