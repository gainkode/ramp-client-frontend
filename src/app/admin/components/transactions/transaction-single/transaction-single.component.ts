import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { TransactionItemDeprecated } from '../../../../model/transaction.model';
import { ErrorService } from '../../../../services/error.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-transaction-single',
  templateUrl: './transaction-single.component.html',
  styleUrls: ['./transaction-single.component.scss']
})
export class TransactionSingleComponent implements OnInit, OnDestroy {
  transactionId?: string;
  transaction?: TransactionItemDeprecated;

  private destroy$ = new Subject();

  constructor(
    private activeRoute: ActivatedRoute,
    private errorHandler: ErrorService,
    private adminService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(routeParams => {
      this.loadData(routeParams.id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private loadData(id: string): void {
    this.transactionId = id;

    this.adminService.getTransaction(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(transaction =>  {
      this.transaction = transaction;
    });
  }

}
