import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { RiskAlertItem } from 'src/app/admin/model/risk-alert.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-risks',
  templateUrl: 'risks.component.html',
  styleUrls: ['risks.component.scss']
})
export class AdminRisksComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'user',
    'riskAlertCode',
    'search'
  ];
  displayedColumns: string[] = [
    'details',
    'riskAlertId',
    'user',
    'email',
    'created',
    'riskAlertTypeCode',
    'entity'
  ];
  inProgress = false;
  permission = 0;
  selectedAlert?: RiskAlertItem;
  alertCount = 0;
  alerts: RiskAlertItem[] = [];
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('RISKS');
  }

  ngOnInit(): void {
    this.loadAlerts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadAlerts();
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadAlerts();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadAlerts();
  }

  showDetails(alert: RiskAlertItem, content: any) {
    this.selectedAlert = alert;
    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  private loadAlerts(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getRiskAlerts(
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.alerts = list;
        this.alertCount = count;
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
