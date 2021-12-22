import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { ErrorService } from '../../../../services/error.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-customer-single',
  templateUrl: './customer-single.component.html',
  styleUrls: ['./customer-single.component.scss']
})
export class CustomerSingleComponent implements OnInit, OnDestroy {
  customerId?: string;
  customer?: UserItem;

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
    this.customerId = id;

    this.adminService.getUser(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(user =>  {
      this.customer = user;
    });
  }

}
