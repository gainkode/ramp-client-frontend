import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DashboardFilter } from 'src/app/model/dashboard.model';
import { TransactionSourceList, UserTypeList } from 'src/app/model/payment.model';

@Component({
    selector: 'app-dashboard-filter',
    templateUrl: 'dashboard-filter.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardFilterComponent {
    @Output() update = new EventEmitter<DashboardFilter>();

    sources = TransactionSourceList;
    userTypes = UserTypeList;

    filterForm = this.formBuilder.group({
        accountType: [],
        source: []
    });

    constructor(private formBuilder: FormBuilder) { }

    onSubmit() {
        const filter = new DashboardFilter();
        filter.accountTypesOnly = this.filterForm.get('accountType')?.value;
        filter.sourcesOnly = this.filterForm.get('source')?.value;
        this.update.emit(filter);
    }
}
