import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../model/generated-models';
import { TransactionItem } from '../model/transaction.model';
import { UserItem } from '../model/user.model';
import { AuthService } from '../services/auth.service';
import { CommonDataService } from '../services/common-data.service';
import { ErrorService } from '../services/error.service';

@Component({
    selector: 'app-transaction-details',
    templateUrl: 'transaction-details.component.html',
    styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
    @Input() transaction: TransactionItem | null | undefined = null;
    inProgress = false;
    errorMessage = '';

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private dataService: CommonDataService, private router: Router) {
    }

    ngOnInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }
}
