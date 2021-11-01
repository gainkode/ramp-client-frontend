import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { TransactionShortListResult, TransactionStatusDescriptorMap } from 'src/app/model/generated-models';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { TransactionItem } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-transaction-list',
    templateUrl: './transaction-list.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss', './transaction-list.component.scss']
})
export class PersonalTransactionListComponent implements OnDestroy, AfterViewInit {
    @Input() recent = false;
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @ViewChild(MatSort) sort!: MatSort;

    private pTransactionsSubscription: Subscription | undefined = undefined;
    private pStatusSubscription: Subscription | undefined = undefined;
    private pSortSubscription: Subscription | undefined = undefined;
    filter = new TransactionsFilter();
    userStatuses: TransactionStatusDescriptorMap[] = [];
    transactions: TransactionItem[] = [];
    transactionCount = 0;
    selectedTransaction: TransactionItem | null = null;
    pageCounts = [25, 50, 100];
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'transaction';
    sortedDesc = true;
    displayedColumns: string[] = ['transaction', 'dt', 'sender', 'recipient', 'sent', 'received', 'fees', 'status', 'details'];

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    load(val: TransactionsFilter): void {
        this.filter = val;
        if (this.recent) {
            this.pageSize = 10;
            this.sortedField = 'dt';
        }
        if (this.userStatuses.length === 0) {
            this.loadUserStatuses();
        } else {
            this.loadTransactions();
        }
    }

    ngOnDestroy(): void {
        if (this.pTransactionsSubscription !== undefined) {
            this.pTransactionsSubscription.unsubscribe();
            this.pTransactionsSubscription = undefined;
        }
        if (this.pStatusSubscription !== undefined) {
            this.pStatusSubscription.unsubscribe();
            this.pStatusSubscription = undefined;
        }
        if (this.pSortSubscription !== undefined) {
            this.pSortSubscription.unsubscribe();
            this.pSortSubscription = undefined;
        }
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.pSortSubscription = this.sort.sortChange.subscribe(() => {
                this.sortedDesc = (this.sort.direction === 'desc');
                this.sortedField = this.sort.active;
                this.loadTransactions();
            });
        }
    }

    private getSortedField(): string {
        let result = this.sortedField;
        if (this.sortedField === 'dt') {
            result = 'created';
        } else if (this.sortedField === 'transaction') {
            result = 'type';
        } else if (this.sortedField === 'sender') {
            result = '';
        } else if (this.sortedField === 'recipient') {
            result = '';
        } else if (this.sortedField === 'sent') {
            result = 'amountToSpend';
        } else if (this.sortedField === 'received') {
            result = 'amountToReceive';
        } else if (this.sortedField === 'fees') {
            result = 'feeFiat';
        }
        return result;
    }

    private loadTransactions(): void {
        this.transactionCount = 0;
        const transactionsData = this.profileService.getMyTransactions(
            this.pageIndex,
            this.pageSize,
            this.filter.walletTypes,
            this.getSortedField(),
            this.sortedDesc);
        if (transactionsData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.onProgress.emit(true);
            this.pTransactionsSubscription = transactionsData.valueChanges.subscribe(({ data }) => {
                const dataList = data.myTransactions as TransactionShortListResult;
                if (dataList !== null) {
                    this.transactionCount = dataList?.count as number;
                    if (this.transactionCount > 0) {
                        console.log(dataList?.list);
                        this.transactions = dataList?.list?.map((val) => {
                            const status = this.userStatuses.find(x => x.key === val.status);
                            return new TransactionItem(val, status);
                        }) as TransactionItem[];
                    }
                }
                this.onProgress.emit(false);
            }, (error) => {
                this.onProgress.emit(false);
                if (this.auth.token !== '') {
                    this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load transactions'));
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    private refresh(): void {
        if (this.pTransactionsSubscription !== undefined) {
            this.pTransactionsSubscription.unsubscribe();
            this.pTransactionsSubscription = undefined;
        }
        this.loadTransactions();
    }

    private loadUserStatuses(): void {
        const statusListData = this.profileService.getTransactionStatuses();
        if (statusListData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.onProgress.emit(true);
            this.pStatusSubscription = statusListData.valueChanges.subscribe(({ data }) => {
                this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
                this.onProgress.emit(false);
                this.loadTransactions();
            }, (error) => {
                this.onProgress.emit(false);
                if (this.auth.token !== '') {
                    this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load transactions statuses'));
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.refresh();
        return event;
    }

    showDetailsPanel(item: TransactionItem): void {
        const c = new ProfileItemContainer();
        c.container = ProfileItemContainerType.Transaction;
        c.transaction = item;
        this.onShowDetails.emit(c);
    }
}
