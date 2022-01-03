import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { ErrorService } from '../../../../services/error.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-system-user-single',
  templateUrl: './user-single.component.html',
  styleUrls: ['./user-single.component.scss']
})
export class SystemUserSingleComponent implements OnInit, OnDestroy {
  userId?: string;
  user?: UserItem;

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
    this.userId = id;

    this.adminService.getUser(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(user =>  {
      this.user = user;
    });
  }

}
