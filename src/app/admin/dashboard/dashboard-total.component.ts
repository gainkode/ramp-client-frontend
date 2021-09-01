import { Component, Input } from '@angular/core';
import { DashboardTransactionItemModel } from 'src/app/model/dashboard.model';

@Component({
    selector: 'app-dashboard-total',
    templateUrl: 'dashboard-total.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardTotalComponent {
    @Input() totals: DashboardTransactionItemModel[] = [];
    displayedColumns: string[] = ['title', 'approved', 'declined', 'abandoned', 'inProcess', 'ratio'];
}