import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { TransactionShortListResult, TransactionStatusDescriptorMap } from 'src/app/model/generated-models';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { TransactionItem } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['../../../assets/menu.scss', '../../../assets/button.scss', '../../../assets/profile.scss', './transactions.component.scss']
})
export class PersonalTransactionsComponent implements OnInit, OnDestroy, AfterViewInit {
    @Output() showDetails = new EventEmitter<ProfileItemContainer>();
    @ViewChild(MatSort) sort!: MatSort;
    private pTransactionsSubscription: Subscription | undefined = undefined;
    private pStatusSubscription: Subscription | undefined = undefined;
    filter = new TransactionsFilter();
    inProgress = false;
    errorMessage = '';
    userStatuses: TransactionStatusDescriptorMap[] = [];
    transactions: TransactionItem[] = [];
    transactionCount = 0;
    selectedTransaction: TransactionItem | null = null;
    pageCounts = [25, 50, 100];
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'transaction';
    sortedDesc = true;
    displayedColumns: string[] = ['transaction', 'sender', 'recipient', 'sent', 'received', 'fees', 'status', 'details'];

    get paginatorVisible(): boolean {
        return this.transactionCount > this.pageCounts[0] && this.transactionCount > 0;
    }

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router,
        private activeRoute: ActivatedRoute) {
        this.filter.setData(
            this.activeRoute.snapshot.params['wallets'],
            this.activeRoute.snapshot.params['types'],
            this.activeRoute.snapshot.params['date'],
            this.activeRoute.snapshot.params['sender']
        );
    }

    ngOnInit(): void {
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
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.sort.sortChange.subscribe(() => {
                this.sortedDesc = (this.sort.direction === 'desc');
                this.sortedField = this.sort.active;
                this.loadTransactions();
            });
        }
    }

    private getSortedField(): string {
        let result = this.sortedField;
        if (this.sortedField === 'transaction') {
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
            result = 'fee';
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
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pTransactionsSubscription = transactionsData.valueChanges.subscribe(({ data }) => {
                console.log(data);
                const dataList = data.myTransactions as TransactionShortListResult;
                if (dataList !== null) {
                    this.transactionCount = dataList?.count as number;
                    if (this.transactionCount > 0) {
                        this.transactions = dataList?.list?.map((val) => {
                            const status = this.userStatuses.find(x => x.key === val.status);
                            return new TransactionItem(val, status);
                        }) as TransactionItem[];
                    }
                }
                this.inProgress = false;
            }, (error) => {
                console.log('transaction error');
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions');
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
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pStatusSubscription = statusListData.valueChanges.subscribe(({ data }) => {
                this.userStatuses = data.getTransactionStatuses as TransactionStatusDescriptorMap[];
                this.inProgress = false;
                this.loadTransactions();
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions statuses');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    onFilterUpdate(filter: TransactionsFilter): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([
                `${this.auth.getUserMainPage()}/transactions`,
                filter.getParameters()
            ])
        );
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
        this.showDetails.emit(c);
    }
}
