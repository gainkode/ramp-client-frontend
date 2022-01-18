import { Observable, Subject } from 'rxjs';
import { PaymentInstrumentList, RiskLevelViewList, TransactionSourceList, TransactionTypeList, UserTypeList } from 'src/app/model/payment.model';
import { Filter } from '../../../model/filter.model';
import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { EmptyObject } from 'apollo-angular/types';
import { DateTimeInterval } from 'src/app/model/generated-models';

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
  riskLevelsOptions = RiskLevelViewList;
  paymentInstrumentsOptions = PaymentInstrumentList;
  userTypeOptions = UserTypeList;
  transactionTypeOptions = TransactionTypeList;

  filterForm?: FormGroup;

  get createdDateIntervalStartField(): AbstractControl | null {
    return this.filterForm?.controls.createdDateIntervalStart ?? null;
  }

  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    const controlsConfig: EmptyObject = {};
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
    if (this.fields.includes('createdDateStart')) {
      controlsConfig.createdDateRangeStart = '';
    }
    if (this.fields.includes('createdDateEnd')) {
      controlsConfig.createdDateRangeEnd = '';
    }
    if (this.fields.includes('completedDateStart')) {
      controlsConfig.completedDateRangeStart = '';
    }
    if (this.fields.includes('completedDateEnd')) {
      controlsConfig.completedDateRangeEnd = '';
    }
    if (this.fields.includes('transactionType')) {
      controlsConfig.transactionTypes = [[]];
    }
    if (this.fields.includes('widget')) {
      controlsConfig.widgets = [[]];
    }
    if (this.fields.includes('riskAlertCode')) {
      controlsConfig.riskAlertCode = [undefined];
    }
    if (this.fields.includes('riskLevel')) {
      controlsConfig.riskLevels = [[]];
    }
    if (this.fields.includes('paymentInstrument')) {
      controlsConfig.paymentInstruments = [[]];
    }
    if (this.fields.includes('walletAddress')) {
      controlsConfig.walletAddress = [''];
    }
    if (this.fields.includes('search')) {
      controlsConfig.search = [''];
    }

    this.filterForm = this.formBuilder.group(controlsConfig);
  }

  ngOnDestroy(): void {

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
      if (this.fields.includes('createdDateStart')) {
        this.filterForm.controls.createdDateRangeStart.setValue(undefined);
      }
      if (this.fields.includes('createdDateEnd')) {
        this.filterForm.controls.createdDateRangeEnd.setValue(undefined);
      }
      if (this.fields.includes('completedDateStart')) {
        this.filterForm.controls.completedDateRangeStart.setValue(undefined);
      }
      if (this.fields.includes('completedDateEnd')) {
        this.filterForm.controls.completedDateRangeEnd.setValue(undefined);
      }
      if (this.fields.includes('createdDateInterval')) {
        this.filterForm.controls.createdDateIntervalStart.setValue('');
        this.filterForm.controls.createdDateIntervalEnd.setValue('');
      }
      if (this.fields.includes('transactionType')) {
        this.filterForm.controls.transactionTypes.setValue([]);
      }
      if (this.fields.includes('widget')) {
        this.filterForm.controls.widgets.setValue([]);
      }
      if (this.fields.includes('riskAlertCode')) {
        this.filterForm.controls.riskAlertCode.setValue(undefined);
      }
      if (this.fields.includes('riskLevel')) {
        this.filterForm.controls.riskLevels.setValue([]);
      }
      if (this.fields.includes('paymentInstrument')) {
        this.filterForm.controls.paymentInstruments.setValue([]);
      }
      if (this.fields.includes('walletAddress')) {
        this.filterForm.controls.walletAddress.setValue('');
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

