import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionItem } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
    selector: 'app-transaction-details',
    templateUrl: 'transaction-details.component.html',
    styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent {
    @Input() transaction: TransactionItem | null | undefined = null;
    inProgress = false;
    errorMessage = '';

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private dataService: CommonDataService,
        private router: Router) {
    }
}
