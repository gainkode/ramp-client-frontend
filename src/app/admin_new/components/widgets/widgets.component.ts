import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { WidgetItem } from 'src/app/admin_old/model/widget.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { SettingsCurrencyWithDefaults, TransactionStatusDescriptorMap, TransactionType } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { TransactionItemFull } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-admin-widgets',
  templateUrl: 'widgets.component.html',
  styleUrls: ['widgets.component.scss']
})
export class AdminWidgetsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'search'
  ];
  displayedColumns: string[] = [
    'details',
    'name',
    'code',
    'link',
    'created',
    'createdBy',
    'transactionType',
    'currenciesCrypto',
    'currenciesFiat',
    'destinationAddress',
    'userNotificationId',
    'countries',
    'instruments',
    'paymentProviders',
    'liquidityProvider',
    'id'
  ];
  // sendMessageInProgress = false;
  // sendMessageError = '';
  inProgress = false;
  errorMessage = '';
  permission = 0;
  widgetDetailsTitle = 'Widget Details';
  userIdFilter = '';
  selected = false;
  selectedWidget?: WidgetItem;
  widgets: WidgetItem[] = [];
  widgetCount = 0;
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  // isUsersLoading = false;
  // usersSearchInput$ = new Subject<string>();
  // usersOptions$: Observable<UserItem[]> = of([]);
  // minUsersLengthTerm = 1;

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;
  private rolesDialog: NgbModalRef | undefined = undefined;
  private messageDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userIdFilter = this.route.snapshot.params['userId'] ?? '';
    this.permission = this.auth.isPermittedObjectCode('AFFILIATES');
  }

  ngOnInit(): void {
    if (this.userIdFilter !== '') {
      this.filter = new Filter({
        users: [this.userIdFilter]
      });
    }
    this.loadWidgets();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadWidgets();
      })
    );
  }

  onWidgetSelected(item: WidgetItem): void {
    item.selected = !item.selected;
    this.selected = this.widgets.some(x => x.selected === true);
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadWidgets();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadWidgets();
  }

  addWidget(content: any): void {
    this.widgetDetailsTitle = 'Create a new Widget';
    this.selectedWidget = undefined;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  private loadWidgets(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getWidgets(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.widgets = list;
        this.widgetCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  // private initUserSearch() {
  //   this.usersOptions$ = concat(
  //     of([]),
  //     this.usersSearchInput$.pipe(
  //       filter(res => {
  //         return res !== null && res.length >= this.minUsersLengthTerm
  //       }),
  //       debounceTime(300),
  //       distinctUntilChanged(),
  //       tap(() => {
  //         this.isUsersLoading = true;
  //       }),
  //       switchMap(searchString => {
  //         this.isUsersLoading = false;
  //         return this.adminService.findUsers(new Filter({ search: searchString }))
  //           .pipe(map(result => result.list));
  //       })
  //     ));
  // }

  onSaveWidget(): void {
    this.selectedWidget = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadWidgets();
    }
  }

  // sendMessage(content: any): void {
  //   this.messageDialog = this.modalService.open(content, {
  //     backdrop: 'static',
  //     windowClass: 'modalCusSty',
  //   });
  // }

  // sendMessageStart(data: UserMessageData): void {
  //   this.sendMessageInProgress = true;
  //   this.sendMessageError = '';
  //   const ids = this.users.filter(x => x.selected === true).map(val => val.id);
  //   const requestData$ = this.adminService.sendAdminNotification(ids, data.level, data.title, data.text);
  //   this.subscriptions.add(
  //     requestData$.subscribe(({ result }) => {
  //       this.sendMessageInProgress = false;
  //       this.selected = false;
  //       this.users.forEach(x => x.selected = false);
  //       if (this.messageDialog) {
  //         this.messageDialog.close();
  //       }
  //     }, (error) => {
  //       this.sendMessageInProgress = false;
  //       this.sendMessageError = error;
  //       if (this.auth.token === '') {
  //         this.router.navigateByUrl('/');
  //       }
  //     })
  //   );
  // }

  export(content: any): void {
    const ids = this.widgets.filter(x => x.selected === true).map(val => val.id);
    const exportData$ = this.adminService.exportWidgetsToCsv(
      ids,
      this.sortedField,
      this.sortedDesc,
      this.filter);
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  showDetails(widget: WidgetItem, content: any) {
    this.widgetDetailsTitle = 'Widget Details';
    this.selectedWidget = widget;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }
}
