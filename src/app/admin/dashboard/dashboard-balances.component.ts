import { Component, Input } from '@angular/core';
import { DashboardBalanceModel } from 'src/app/model/dashboard.model';

@Component({
    selector: 'app-dashboard-balances',
    templateUrl: 'dashboard-balances.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardBalancesComponent {
    @Input() balances: DashboardBalanceModel[] = [];
    displayedColumns: string[] = ['currency', 'count', 'volume'];
}
