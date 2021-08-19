import { Component, Input } from '@angular/core';
import { DashboardTransactionItemModel } from 'src/app/model/dashboard.model';

@Component({
    selector: 'app-dashboard-fees',
    templateUrl: 'dashboard-fees.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardFeesComponent {
    @Input() totals: DashboardTransactionItemModel[] = [];
    displayedColumns: string[] = ['title', 'fee', 'show'];
}