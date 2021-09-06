import { Component } from '@angular/core';
import { TransactionsFilter } from 'src/app/model/filter.model';

@Component({
    selector: 'app-personal-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['../../menu.scss', '../../button.scss']
})
export class PersonalTransactionsComponent {
    onFilterUpdate(filter: TransactionsFilter): void {
        console.log(filter);
    }
}
