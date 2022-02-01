import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminDataService } from '../../../services/admin-data.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UserItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-system-user-single',
  templateUrl: './user-single.component.html',
  styleUrls: ['./user-single.component.scss']
})
export class SystemUserSingleComponent implements OnInit, OnDestroy {
  userId?: string;
  user?: UserItem;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private activeRoute: ActivatedRoute,
    private adminService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.activeRoute.params.subscribe(routeParams => {
        this.loadData(routeParams.id);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(id: string): void {
    this.userId = id;
    this.subscriptions.add(
      this.adminService.getUser(id).pipe(take(1)).subscribe(user => {
        this.user = user;
      })
    );
  }

}
