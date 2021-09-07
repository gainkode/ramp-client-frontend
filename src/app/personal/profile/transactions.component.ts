import { Component, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TransactionsFilter } from 'src/app/model/filter.model';
import { TransactionItem } from 'src/app/model/transaction.model';

@Component({
    selector: 'app-personal-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['../../menu.scss', '../../button.scss', '../../profile.scss', './transactions.component.scss']
})
export class PersonalTransactionsComponent {
    @ViewChild(MatSort) sort!: MatSort;
    inProgress = false;
    errorMessage = '';
    transactions: TransactionItem[] = [];
    transactionCount = 0;
    selectedTransaction: TransactionItem | null = null;
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'transaction';
    sortedDesc = true;
    displayedColumns: string[] = ['transaction', 'sender', 'recipient', 'sent', 'received', 'fees', 'status', 'details'];

    onFilterUpdate(filter: TransactionsFilter): void {
        console.log(filter);
        this.inProgress = true;
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        //this.refresh();
        return event;
    }
}
