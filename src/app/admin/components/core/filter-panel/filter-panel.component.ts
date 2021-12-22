import { Observable, Subject } from 'rxjs';
import { TransactionSourceList, UserTypeList } from 'src/app/model/payment.model';
import { Filter } from '../../../model/filter.model';
import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmptyObject } from 'apollo-angular/types';

@Component({
  selector: 'app-filter-panel',
  templateUrl: 'filter-panel.component.html',
  styleUrls: ['filter-panel.scss']
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Input() fields: Array<string> = [];
  @Input() filterData: Filter | undefined = undefined;

  private filterSubject = new Subject<Filter>();

  @Output() get filter(): Observable<Filter> {
    return this.filterSubject.asObservable();
  }

  sourceOptions = TransactionSourceList;
  userTypeOptions = UserTypeList;

  filterForm?: FormGroup;

  private destroy$ = new Subject();

  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    const controlsConfig: EmptyObject = {};

    console.log(this.filterData);

    if (this.fields.includes('accountType')) {
      controlsConfig.accountTypes = [[]];
    }
    if (this.fields.includes('country')) {
      controlsConfig.countries = [[]];
    }
    if (this.fields.includes('source')) {
      controlsConfig.sources = [[]];
    }
    if (this.fields.includes('user')) {
      controlsConfig.user = [undefined];
    }
    if (this.fields.includes('users')) {
      controlsConfig.users = [[]];
      // if (this.filterData) {
      //   if (this.filterData.users) {
      //     controlsConfig.users = [this.filterData.users];
      //   }
      // }
    }
    if (this.fields.includes('widget')) {
      controlsConfig.widgets = [[]];
    }
    if (this.fields.includes('riskAlertCode')) {
      controlsConfig.riskAlertCode = [undefined];
    }
    if (this.fields.includes('search')) {
      controlsConfig.search = [''];
    }

    this.filterForm = this.formBuilder.group(controlsConfig);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  resetFilters(): void {
    if (this.filterForm) {
      if (this.fields.includes('accountType')) {
        this.filterForm.controls.accountTypes.setValue([]);
      }
      if (this.fields.includes('country')) {
        this.filterForm.controls.countries.setValue([]);
      }
      if (this.fields.includes('source')) {
        this.filterForm.controls.sources.setValue([]);
      }
      if (this.fields.includes('user')) {
        this.filterForm.controls.user.setValue(undefined);
      }
      if (this.fields.includes('users')) {
        this.filterForm.controls.users.setValue([]);
      }
      if (this.fields.includes('widget')) {
        this.filterForm.controls.widgets.setValue([]);
      }
      if (this.fields.includes('riskAlertCode')) {
        this.filterForm.controls.riskAlertCode.setValue(undefined);
      }
      if (this.fields.includes('search')) {
        this.filterForm.controls.search.setValue('');
      }
    }

    this.applyFilters();
  }

  applyFilters(): void {
    if (this.filterForm) {
      this.filterSubject.next(new Filter(this.filterForm.value));
    }
  }
}

