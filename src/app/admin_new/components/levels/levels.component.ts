import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { getCountryByCode2, getCountryByCode3 } from 'src/app/model/country-code.model';
import { BlackCountryListResult } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-levels',
  templateUrl: 'levels.component.html',
  styleUrls: ['levels.component.scss']
})
export class AdminLevelsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'name',
    'delete'
  ];
  inProgress = false;
  errorMessage = '';
  permission = 0;
  selectedCountry?: CommonTargetValue;
  countries: CommonTargetValue[] = [];

  private subscriptions: Subscription = new Subscription();
  private createDialog: NgbModalRef | undefined = undefined;
  private removeDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('KYC');
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addCountry(content: any): void {
    this.selectedCountry = undefined;
    this.createDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.createDialog.closed.subscribe(val => {
        if (this.createDialog) {
          this.createDialog.close();
          this.loadCountries();
        }
      })
    );
  }

  private loadCountries(): void {
    this.countries = [];
    this.inProgress = true;
    const listData$ = this.adminService.getCountryBlackList().valueChanges.pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const responseData = data.getCountryBlackList as BlackCountryListResult;
        let itemCount = 0;
        this.inProgress = false;
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

  remove(country: CommonTargetValue, content: any): void {
    this.selectedCountry = country;
    this.removeDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.removeDialog.closed.subscribe(val => {
        this.removeCountryConfirmed(this.selectedCountry?.id ?? '');
      })
    );
  }

  private removeCountryConfirmed(id: string): void {
    const c = getCountryByCode3(id);
    if (c) {
      this.errorMessage = '';
      this.inProgress = true;
      const requestData$ = this.adminService.deleteBlackCountry(c.code2);
      this.subscriptions.add(
        requestData$.subscribe(({ data }) => {
          this.inProgress = false;
          if (this.removeDialog) {
            this.removeDialog.close();
            this.loadCountries();
          }
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }
}
