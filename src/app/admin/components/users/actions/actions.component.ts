import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserActionItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-admin-user-actions',
  templateUrl: 'actions.component.html',
  styleUrls: ['actions.component.scss']
})
export class AdminUserActionsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];
  displayedColumns: string[] = [
    'date',
    'userId',
    'actionType',
    'result',
    'status',
    'info'
  ];
  inProgress = false;
  permission = 0;
  selectedAction?: UserActionItem;
  actionCount = 0;
  actions: UserActionItem[] = [];
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'date';
  sortedDesc = true;
  filter = new Filter({});

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('NOTIFICATIONS');
  }

  ngOnInit(): void {
    this.loadUserActions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadUserActions();
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadUserActions();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadUserActions();
  }

  showDetails(notification: UserActionItem, content: any) {
    this.selectedAction = notification;
    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  private loadUserActions(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getUserActions(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.actions = list;
        this.actionCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
