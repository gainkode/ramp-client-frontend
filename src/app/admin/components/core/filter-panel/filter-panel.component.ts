import { Observable, Subject } from 'rxjs';
import { KycStatusList, PaymentInstrumentList, RiskLevelViewList, TransactionSourceList, TransactionStatusList, TransactionTypeList, UserStatusList, UserTypeList } from 'src/app/model/payment.model';
import { Filter } from '../../../model/filter.model';
import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
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
  riskLevelsOptions = RiskLevelViewList;
  paymentInstrumentsOptions = PaymentInstrumentList;
  userTypeOptions = UserTypeList;
  userStatusOptions = UserStatusList;
  transactionTypeOptions = TransactionTypeList;
  transactionStatusOptions = TransactionStatusList;
  kysStatusOptions = KycStatusList;

  filterForm?: FormGroup;

  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    const controlsConfig: EmptyObject = {};
    if (this.fields.includes('accountType')) {
      controlsConfig.accountTypes = [[]];
    }
    if (this.fields.includes('accountStatus')) {
      controlsConfig.accountStatuses = [[]];
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
      controlsConfig.createdDateRangeStart = [undefined];
    }
    if (this.fields.includes('createdDateEnd')) {
      controlsConfig.createdDateRangeEnd = [undefined];
    }
    if (this.fields.includes('completedDateStart')) {
      controlsConfig.completedDateRangeStart = [undefined];
    }
    if (this.fields.includes('completedDateEnd')) {
      controlsConfig.completedDateRangeEnd = [undefined];
    }
    if (this.fields.includes('registrationDateStart')) {
      controlsConfig.registrationDateRangeStart = [undefined];
    }
    if (this.fields.includes('registrationDateEnd')) {
      controlsConfig.registrationDateRangeEnd = [undefined];
    }
    if (this.fields.includes('transactionType')) {
      controlsConfig.transactionTypes = [[]];
    }
    if (this.fields.includes('transactionStatus')) {
      controlsConfig.transactionStatuses = [[]];
    }
    if (this.fields.includes('tier')) {
      controlsConfig.tiers = [[]];
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
    if (this.fields.includes('kycStatus')) {
      controlsConfig.kycStatuses = [[]];
    }
    if (this.fields.includes('paymentInstrument')) {
      controlsConfig.paymentInstruments = [[]];
    }
    if (this.fields.includes('walletAddress')) {
      controlsConfig.walletAddress = [undefined];
    }
    if (this.fields.includes('totalBuyVolume')) {
      controlsConfig.totalBuyVolumeOver = [0];
    }
    if (this.fields.includes('transactionCount')) {
      controlsConfig.transactionCountOver = [0];
    }
    if (this.fields.includes('transactionDate')) {
      controlsConfig.transactionDate = [undefined];
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
      if (this.fields.includes('accountStatus')) {
        this.filterForm.controls.accountStatuses.setValue([]);
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
      if (this.fields.includes('registrationDateStart')) {
        this.filterForm.controls.registrationDateRangeStart.setValue(undefined);
      }
      if (this.fields.includes('registrationDateEnd')) {
        this.filterForm.controls.registrationDateRangeEnd.setValue(undefined);
      }
      if (this.fields.includes('transactionType')) {
        this.filterForm.controls.transactionTypes.setValue([]);
      }
      if (this.fields.includes('transactionStatus')) {
        this.filterForm.controls.transactionStatuses.setValue([]);
      }
      if (this.fields.includes('tier')) {
        this.filterForm.controls.tiers.setValue([]);
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
      if (this.fields.includes('kycStatus')) {
        this.filterForm.controls.kycStatuses.setValue([]);
      }
      if (this.fields.includes('paymentInstrument')) {
        this.filterForm.controls.paymentInstruments.setValue([]);
      }
      if (this.fields.includes('walletAddress')) {
        this.filterForm.controls.walletAddress.setValue('');
      }
      if (this.fields.includes('totalBuyVolume')) {
        this.filterForm.controls.totalBuyVolumeOver.setValue(0);
      }
      if (this.fields.includes('transactionCount')) {
        this.filterForm.controls.transactionCountOver.setValue(0);
      }
      if (this.fields.includes('transactionDate')) {
        this.filterForm.controls.transactionDate.setValue(undefined);
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

