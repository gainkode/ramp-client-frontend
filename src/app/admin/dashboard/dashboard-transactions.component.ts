import { Component, Input } from '@angular/core';
import { DashboardTransactionItemModel } from 'src/app/model/dashboard.model';

@Component({
    selector: 'app-dashboard-transactions',
    templateUrl: 'dashboard-transactions.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardTransactionsComponent {
    @Input() title = '';
    @Input() transactions: DashboardTransactionItemModel[] = [];
    displayedColumns: string[] = ['title', 'approved', 'declined', 'abounded', 'inProcess', 'ratio', 'fee'];
}