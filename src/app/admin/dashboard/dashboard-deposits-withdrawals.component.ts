import { Component, Input } from '@angular/core';
import { DashboardTransactionItemModel } from 'src/app/model/dashboard.model';

@Component({
    selector: 'app-dashboard-deposits-withdrawals',
    templateUrl: 'dashboard-deposits-withdrawals.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardDepositsWithdrawalsComponent {
    @Input() title = '';
    @Input() transactions: DashboardTransactionItemModel[] = [];
    displayedColumns: string[] = ['title', 'approved', 'declined', 'abounded', 'inProcess', 'ratio', 'fee'];
}