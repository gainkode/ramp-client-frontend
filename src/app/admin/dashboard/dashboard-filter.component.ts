import { Component, Output, EventEmitter } from '@angular/core';
import { DashboardFilter } from 'src/app/model/dashboard.model';
import { UserType } from 'src/app/model/generated-models';

@Component({
    selector: 'app-dashboard-filter',
    templateUrl: 'dashboard-filter.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardFilterComponent {
    @Output() update = new EventEmitter<DashboardFilter>();

    test() {
        const defaultFilter = new DashboardFilter();
        defaultFilter.accountTypesOnly = [UserType.Merchant];
        this.update.emit(defaultFilter);
    }
}