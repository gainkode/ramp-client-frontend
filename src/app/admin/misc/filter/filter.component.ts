import { Component, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { EmptyObject } from 'apollo-angular/types';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { Filter } from 'admin/model/filter.model';
import { RiskAlertCodeList } from 'admin/model/lists.model';
import { AdminDataService } from 'services/admin-data.service';
import { CommonTargetValue } from 'model/common.model';
import { Countries } from 'model/country-code.model';
import { SettingsKycTier } from 'model/generated-models';
import { CurrencyView, KycStatusList, PaymentInstrumentList, RiskLevelViewList, TransactionKycStatusList, TransactionSourceList, TransactionStatusList, TransactionTypeList, UserActionTypeList, UserModeList, UserNotificationCodeList, UserStatusList, UserTypeList } from 'model/payment.model';
import { AdminDateRangeComponent } from '../date-range/date-range.component';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss', '../../../../assets/button.scss']
})
export class AdminFilterComponent implements OnInit, OnDestroy {
  @Input() fields: Array<string> = [];
  @Input() filterData: Filter | undefined = undefined;
  @Input() currencies: Array<CurrencyView> = [];
  @Input() fiatCurrencies: Array<CurrencyView> = [];
  @Output() get filter(): Observable<Filter> {
  	return this.filterSubject.asObservable();
  }
  @ViewChild('created_filter') createFilterPicker!: AdminDateRangeComponent;
  @ViewChild('completed_filter') completeFilterPicker!: AdminDateRangeComponent;
  @ViewChild('registered_filter') registerFilterPicker!: AdminDateRangeComponent;
  @ViewChild('updated_filter') updateFilterPicker!: AdminDateRangeComponent;

  private filterSubject = new Subject<Filter>();
  private subscriptions = new Subscription();

  isFilterCollapsed = true;
  sourceOptions = TransactionSourceList;
  riskLevelsOptions = RiskLevelViewList;
  paymentInstrumentsOptions = PaymentInstrumentList;
  userTypeOptions = UserTypeList;
  notificationTypeOptions = UserNotificationCodeList;
  userModeOptions = UserModeList;
  userStatusOptions = UserStatusList;
  transactionTypeOptions = TransactionTypeList;
  userActionTypeOptions = UserActionTypeList;
  transactionStatusOptions = TransactionStatusList;
  kysStatusOptions = KycStatusList;
  transactionKysStatusOptions = TransactionKycStatusList;
  countryOptions = Countries;
  riskAlertOptions = RiskAlertCodeList;
  filterForm?: UntypedFormGroup;
  isTierLoading = false;
  isUsersLoading = false;
  isWidgetsLoading = false;
  tierSearchInput$ = new Subject<string>();
  usersSearchInput$ = new Subject<string>();
  widgetsSearchInput$ = new Subject<string>();
  widgetNamesSearchInput$ = new Subject<string>();
  tierOptions$: Observable<CommonTargetValue[]> = of([]);
  usersOptions$: Observable<CommonTargetValue[]> = of([]);
  widgetsOptions$: Observable<CommonTargetValue[]> = of([]);
  widgetNamesOptions$: Observable<CommonTargetValue[]> = of([]);
  minUsersLengthTerm = 1;
  minWidgetsLengthTerm = 1;
  minWidgetNamesLengthTerm = 1;
  adminAdditionalSettings: Record<string, any> = {};

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private auth: AuthService,
  	private adminDataService: AdminDataService) {

  }

  ngOnInit(): void {
  	this.loadCommonSettings();
  	this.initForm();
  	if (this.fields.includes('tier')) {
  		this.tierSearch();
  	}
  	if (this.fields.includes('user') || this.fields.includes('users')) {
  		this.usersSearch();
  	}
  	if (this.fields.includes('widget')) {
  		this.widgetsSearch();
  	}
  	if (this.fields.includes('widgetName')) {
  		this.widgetNamesSearch();
  	}
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private loadCommonSettings(){
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if(settingsCommon){
  		this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
  		this.userModeOptions = this.userModeOptions.filter(item => this.adminAdditionalSettings.userMode[item.id] == true);
  		this.userTypeOptions = this.userTypeOptions.filter(item => this.adminAdditionalSettings.userType[item.id] == true);
  		this.paymentInstrumentsOptions = this.paymentInstrumentsOptions.filter(item => this.adminAdditionalSettings.paymentMethods[item.id] == true);
  		this.transactionTypeOptions = this.transactionTypeOptions.filter(item => this.adminAdditionalSettings.transactionType[item.id] == true);
  	}
  }

  private tierSearch(): void {
  	this.isTierLoading = true;
  	this.tierOptions$ = this.adminDataService.getSettingsKycTiers('').pipe(
  		map(settings => {
  			this.isTierLoading = false;
  			if (settings.count > 0) {
  				const rawTiers = [...settings.list];
  				return (rawTiers
  					.sort((a, b) => this.tierSortHandler(a, b))
  					.map(tier => {
  						return {
  							id: tier.settingsKycTierId,
  							title: tier.name
  						} as CommonTargetValue;
  					}));
  			} else {
  				return [];
  			}
  		})
  	);
  }

  private tierSortHandler(a: SettingsKycTier, b: SettingsKycTier): number {
  	if (a.name > b.name) {
  		return 1;
  	} else if (a.name < b.name) {
  		return -1;
  	}
  	return 0;
  }

  private usersSearch(): void {
  	this.usersOptions$ = concat(
  		of([]),
  		this.usersSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minUsersLengthTerm;
  			}),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => {
  				this.isUsersLoading = true;
  			}),
  			switchMap(searchString => {
  				this.isUsersLoading = false;
  				return this.adminDataService.getUsers(
  					[],
  					0,
  					100,
  					'email',
  					false,
  					new Filter({ search: searchString })
  				).pipe(map(result => {
  					return result.list.map(x => {
  						return {
  							id: x.id,
  							title: (x.fullName !== '') ? `${x.fullName} (${x.email})` : x.email
  						} as CommonTargetValue;
  					});
  				}));
  			})
  		));
  }

  private widgetsSearch(): void {
  	this.widgetsOptions$ = concat(
  		of([]),
  		this.widgetsSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minWidgetsLengthTerm;
  			}),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => {
  				this.isWidgetsLoading = true;
  			}),
  			switchMap(searchString => {
  				this.isWidgetsLoading = false;
  				return this.adminDataService.getWidgetIds(searchString, 0, 100, 'code', false)
  					.pipe(map(result => {
  						return result.list.map(x => {
  							return {
  								id: x.id,
  								title: x.code ?? x.id
  							} as CommonTargetValue;
  						});
  					}));
  			})
  		));
  }

  private widgetNamesSearch(): void {
  	this.widgetNamesOptions$ = concat(
  		of([]),
  		this.widgetNamesSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minWidgetNamesLengthTerm;
  			}),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => {
  				this.isWidgetsLoading = true;
  			}),
  			switchMap(searchString => {
  				this.isWidgetsLoading = false;
  				return this.adminDataService.getWidgetIds(searchString, 0, 100, 'name', false)
  					.pipe(map(result => {
  						return result.list.map(x => {
  							return {
  								id: x.id,
  								title: x.name ?? x.id
  							} as CommonTargetValue;
  						});
  					}));
  			})
  		));
  }

  private initForm(): void {
    const controlsConfig: EmptyObject = {};
    if (this.fields.includes('accountType')) {
      controlsConfig.accountTypes = [[]];
    }
    if (this.fields.includes('notificationType')) {
      controlsConfig.notificationType = [''];
    }
    if (this.fields.includes('accountMode')) {
      controlsConfig.accountModes = [[]];
    }
    if (this.fields.includes('accountStatus')) {
      controlsConfig.accountStatuses = [[]];
    }
    if (this.fields.includes('userActionType')) {
      controlsConfig.userActionTypes = [[]];
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
    }
    if (this.fields.includes('assets')) {
      controlsConfig.assets = [[]];
    }
    if (this.fields.includes('fiatCurrency')) {
      controlsConfig.fiatCurrency = [undefined];
    }
    if (this.fields.includes('createdDate')) {
      controlsConfig.createdDateRangeStart = [undefined];
      controlsConfig.createdDateRangeEnd = [undefined];
    }
    if (this.fields.includes('createdDateAction')) {
      controlsConfig.createdDateRangeStart = [undefined];
      controlsConfig.createdDateRangeEnd = [undefined];
    }
    if (this.fields.includes('completedDate')) {
      controlsConfig.completedDateRangeStart = [undefined];
      controlsConfig.completedDateRangeEnd = [undefined];
    }
    if (this.fields.includes('registrationDate')) {
      controlsConfig.registrationDateRangeStart = [undefined];
      controlsConfig.registrationDateRangeEnd = [undefined];
    }
    if (this.fields.includes('updatedDate')) {
      controlsConfig.updatedDateRangeStart = [undefined];
      controlsConfig.updatedDateRangeEnd = [undefined];
    }
    if (this.fields.includes('transactionIds')) {
      controlsConfig.transactionIds = [[]];
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
    if (this.fields.includes('widgetName')) {
      controlsConfig.widgetNames = [[]];
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
    if (this.fields.includes('transactionKycStatus')) {
      controlsConfig.transactionKycStatuses = [[]];
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
    if (this.fields.includes('search')) {
      controlsConfig.search = [''];
    }
    if (this.fields.includes('verifyWhenPaid')) {
      controlsConfig.verifyWhenPaid = [false];
    }
    if (this.fields.includes('transactionFlag')) {
      controlsConfig.transactionFlag = [false];
    }
    if (this.fields.includes('preauthFlag')) {
      controlsConfig.preauthFlag = [false];
    }
    if (this.fields.includes('zeroBalance')) {
      controlsConfig.zeroBalance = false;
    }
    this.filterForm = this.formBuilder.group(controlsConfig);

  	if (this.filterData?.createdDateInterval) {
  		this.filterForm.controls.createdDateRangeStart.setValue(this.filterData?.createdDateInterval.from as Date);
  		this.filterForm.controls.createdDateRangeEnd.setValue(this.filterData?.createdDateInterval.to as Date);
  	}
  	if (this.filterData?.completedDateInterval) {
  		this.filterForm.controls.completedDateRangeStart.setValue(this.filterData?.completedDateInterval.from as Date);
  		this.filterForm.controls.completedDateRangeEnd.setValue(this.filterData?.completedDateInterval.to as Date);
  	}
  	if (this.filterData?.updatedDateInterval) {
  		this.filterForm.controls.updatedDateRangeStart.setValue(this.filterData?.updatedDateInterval.from as Date);
  		this.filterForm.controls.updatedDateRangeEnd.setValue(this.filterData?.updatedDateInterval.to as Date);
  	}
  }

  resetFilters(): void {
    if (this.filterForm) {
      if (this.fields.includes('accountType')) {
        this.filterForm.controls.accountTypes.setValue([]);
      }
      if (this.fields.includes('notificationType')) {
        this.filterForm.controls.notificationType.setValue('');
      }
      if (this.fields.includes('accountMode')) {
        this.filterForm.controls.accountModes.setValue([]);
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
      if (this.fields.includes('assets')) {
        this.filterForm.controls.assets.setValue([]);
      }
      if (this.fields.includes('fiatCurrency')) {
        this.filterForm.controls.fiatCurrency.setValue(undefined);
      }
      if (this.fields.includes('createdDate')) {
        this.filterForm.controls.createdDateRangeStart.setValue(undefined);
        this.filterForm.controls.createdDateRangeEnd.setValue(undefined);
        if (this.createFilterPicker) {
          this.createFilterPicker.reset();
        }
      }
      if (this.fields.includes('createdDateAction')) {
        this.filterForm.controls.createdDateRangeStart.setValue(undefined);
        this.filterForm.controls.createdDateRangeEnd.setValue(undefined);
        if (this.createFilterPicker) {
          this.createFilterPicker.reset();
        }
      }
      if (this.fields.includes('completedDate')) {
        this.filterForm.controls.completedDateRangeStart.setValue(undefined);
        this.filterForm.controls.completedDateRangeEnd.setValue(undefined);
        if (this.completeFilterPicker) {
          this.completeFilterPicker.reset();
        }
      }
      if (this.fields.includes('registrationDate')) {
        this.filterForm.controls.registrationDateRangeStart.setValue(undefined);
        this.filterForm.controls.registrationDateRangeEnd.setValue(undefined);
        if (this.registerFilterPicker) {
          this.registerFilterPicker.reset();
        }
      }
      if (this.fields.includes('updatedDate')) {
        this.filterForm.controls.updatedDateRangeStart.setValue(undefined);
        this.filterForm.controls.updatedDateRangeEnd.setValue(undefined);
        if (this.updateFilterPicker) {
          this.updateFilterPicker.reset();
        }
      }
      if (this.fields.includes('transactionIds')) {
        this.filterForm.controls.transactionIds.setValue([]);
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
      if (this.fields.includes('widgetName')) {
        this.filterForm.controls.widgetNames.setValue([]);
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
      if (this.fields.includes('transactionKycStatus')) {
        this.filterForm.controls.transactionKycStatuses.setValue([]);
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
      if (this.fields.includes('search')) {
        this.filterForm.controls.search.setValue('');
      }
      if (this.fields.includes('verifyWhenPaid')) {
        this.filterForm.controls.verifyWhenPaid.setValue(false);
      }
      if (this.fields.includes('transactionFlag')) {
        this.filterForm.controls.transactionFlag.setValue(false);
      }
      if (this.fields.includes('preauthFlag')) {
        this.filterForm.controls.preauthFlag.setValue(false);
      }
      if (this.fields.includes('zeroBalance')) {
        this.filterForm.controls.zeroBalance.setValue(false);
      }
    }
    this.applyFilters();
  }

  applyFilters(): void {
  	if (this.filterForm) {
  		this.filterSubject.next(new Filter(this.filterForm.value));
  	}
  }

  getCountryFlag(code: string): string {
  	return `${code.toLowerCase()}.svg`;
  }
}
