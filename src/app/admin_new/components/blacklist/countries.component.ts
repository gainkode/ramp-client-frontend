import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { WidgetItem } from 'src/app/admin_old/model/widget.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { getCountryByCode2 } from 'src/app/model/country-code.model';
import { BlackCountryListResult } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-country-black-list',
  templateUrl: 'countries.component.html',
  styleUrls: ['countries.component.scss']
})
export class AdminCountryBlackListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

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
  selectedCountry?: CommonTargetValue;
  countries: CommonTargetValue[] = [];
  widgetCount = 0;
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;

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
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadCountries();
      })
    );
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadCountries();
  }

  addWidget(content: any): void {
    this.widgetDetailsTitle = 'Create a new Widget';
    this.selectedCountry = undefined;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  onWidgetSelected(item: CommonTargetValue): void {

  }

  private loadCountries(): void {
    this.countries = [];
    this.inProgress = true;
    const listData$ = this.adminService.getCountryBlackList().valueChanges.pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const responseData = data.getCountryBlackList as BlackCountryListResult;
        let itemCount = 0;
        if (responseData !== null) {
          itemCount = responseData?.count ?? 0;
          if (itemCount > 0) {
            this.countries = responseData?.list?.map((val) => {
              const c = getCountryByCode2(val.countryCode2);
              return {
                id: c?.code3 ?? '',
                title: c?.name ?? '',
                imgClass: 'country-flag',
                imgSource: `assets/svg-country-flags/${c?.code2.toLowerCase()}.svg`
              }
            }) as CommonTargetValue[];
          }
        }
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSaveWidget(): void {
    this.selectedCountry = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadCountries();
    }
  }

  showDetails(country: CommonTargetValue, content: any) {
    this.widgetDetailsTitle = 'Widget Details';
    this.selectedCountry = country;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }
}
