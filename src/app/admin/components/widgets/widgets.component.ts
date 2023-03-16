import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { WidgetItem } from 'src/app/admin/model/widget.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AuthService } from 'src/app/services/auth.service';

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
  sortedField = 'name';
  sortedDesc = false;
  filter = new Filter({});
  adminAdditionalSettings: Record<string, any> = {};

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;

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
    this.loadCommonSettings();
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

  private loadCommonSettings(){
    let settingsCommon = this.auth.getLocalSettingsCommon();
    if(settingsCommon){
      this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
      if(this.adminAdditionalSettings?.tabs?.widget?.filterFields){
        this.filterFields = this.adminAdditionalSettings.tabs.widget.filterFields;
      }
    }
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

  onSaveWidget(): void {
    this.selectedWidget = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadWidgets();
    }
  }

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
