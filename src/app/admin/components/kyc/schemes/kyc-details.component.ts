import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { CountryFilterList } from 'src/app/model/country-code.model';
import { TransactionSourceFilterList } from 'src/app/model/fee-scheme.model';
import { KycProvider, SettingsKycTargetFilterType, UserMode, UserType } from 'src/app/model/generated-models';
import { KycScheme } from 'src/app/model/identification.model';
import { KycLevelView, KycProviderList, KycTargetFilterList, UserModeList, UserTypeList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-kyc-details',
  templateUrl: 'kyc-details.component.html',
  styleUrls: ['kyc-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminKycSchemeDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set currentScheme(scheme: KycScheme | undefined) {
    this.setFormData(scheme);
    this.settingsId = (scheme) ? scheme?.id : '';
    this.createNew = (this.settingsId === '');
  }

  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  private removeDialog: NgbModalRef | undefined = undefined;
  private settingsId = '';

  TARGET_TYPE: typeof SettingsKycTargetFilterType = SettingsKycTargetFilterType;
  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  defaultSchemeName = '';
  userTypeOptions = UserTypeList;
  userModes = UserModeList;
  kycProviders = KycProviderList;
  levels: KycLevelView[] = [];
  targetEntity = ['', ''];
  targetSearchText = '';
  targetsTitle = '';
  targetType = SettingsKycTargetFilterType.None;
  targets = KycTargetFilterList;
  isTargetsLoading = false;
  targetsSearchInput$ = new Subject<string>();
  targetsOptions$: Observable<CommonTargetValue[]> = of([]);
  sourceTargetsOptions = TransactionSourceFilterList;
  minTargetsLengthTerm = 1;

  form = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    isDefault: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
    level: ['', { validators: [Validators.required], updateOn: 'change' }],
    userMode: [[], { validators: [Validators.required], updateOn: 'change' }],
    userType: ['', { validators: [Validators.required], updateOn: 'change' }],
    provider: [[], { validators: [Validators.required], updateOn: 'change' }],
    requireUserFullName: [false],
    requireUserPhone: [false],
    requireUserBirthday: [false],
    requireUserAddress: [false],
    requireUserFlatNumber: [false]
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService) {

  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.form.get('target')?.valueChanges.subscribe(val => this.updateTarget())
    );
    this.subscriptions.add(
      this.form.get('userType')?.valueChanges.subscribe(val => {
        this.form.get('level')?.setValue(undefined);
        this.loadLevelValues(val);
      })
    );
    this.subscriptions.add(
      this.form.get('requireUserFlatNumber')?.valueChanges.subscribe(val => {
        if (val === true) {
          this.form.get('requireUserAddress')?.setValue(true);
        }
      })
    );
    this.subscriptions.add(
      this.form.get('requireUserAddress')?.valueChanges.subscribe(val => {
        if (val === false) {
          this.form.get('requireUserFlatNumber')?.setValue(false);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(scheme: KycScheme | undefined): void {
    this.form.reset();
    this.defaultSchemeName = '';
    if (scheme) {
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.form.get('id')?.setValue(scheme?.id);
      this.form.get('name')?.setValue(scheme?.name);
      this.form.get('description')?.setValue(scheme?.description);
      this.form.get('isDefault')?.setValue(scheme?.isDefault);
      this.form.get('level')?.setValue(scheme?.level?.settingsKycLevelId ?? undefined);
      this.form.get('target')?.setValue(scheme?.target);
      this.targetType = scheme?.target ?? SettingsKycTargetFilterType.None;
      this.setTargetValues(scheme?.targetValues);
      this.form.get('userMode')?.setValue(scheme.userModes);
      this.form.get('userType')?.setValue(scheme?.userType);
      this.form.get('provider')?.setValue(scheme?.kycProviders);
      this.form.get('requireUserFullName')?.setValue(scheme?.requireUserFullName);
      this.form.get('requireUserPhone')?.setValue(scheme?.requireUserPhone);
      this.form.get('requireUserBirthday')?.setValue(scheme?.requireUserBirthday);
      this.form.get('requireUserAddress')?.setValue(scheme?.requireUserAddress);
      this.form.get('requireUserFlatNumber')?.setValue(scheme?.requireUserFlatNumber);
      this.loadLevelValues(scheme?.userType);
      this.setTargetValidator();
      this.setTargetValueParams();
    } else {
      this.form.get('id')?.setValue('');
      this.form.get('name')?.setValue('');
      this.form.get('description')?.setValue('');
      this.form.get('isDefault')?.setValue('');
      this.form.get('level')?.setValue('');
      this.form.get('target')?.setValue(SettingsKycTargetFilterType.None);
      this.form.get('targetValues')?.setValue([]);
      this.form.get('userMode')?.setValue([]);
      this.form.get('userType')?.setValue('');
      this.form.get('provider')?.setValue([]);
      this.form.get('requireUserFullName')?.setValue(false);
      this.form.get('requireUserPhone')?.setValue(false);
      this.form.get('requireUserBirthday')?.setValue(false);
      this.form.get('requireUserAddress')?.setValue(false);
      this.form.get('requireUserFlatNumber')?.setValue(false);
      this.setTargetValidator();
    }
  }

  private setSchemeData(): KycScheme {
    const data = new KycScheme(null);
    data.name = this.form.get('name')?.value;
    data.description = this.form.get('description')?.value;
    data.isDefault = this.form.get('isDefault')?.value;
    data.id = this.form.get('id')?.value;
    data.setTarget(this.targetType, this.form.get('targetValues')?.value);
    data.userType = this.form.get('userType')?.value;
    data.levelId = this.form.get('level')?.value;
    (this.form.get('userMode')?.value as UserMode[]).forEach(x => data.userModes.push(x));
    (this.form.get('provider')?.value as KycProvider[]).forEach(x => data.kycProviders.push(x));
    data.requireUserFullName = this.form.get('requireUserFullName')?.value;
    data.requireUserPhone = this.form.get('requireUserPhone')?.value;
    data.requireUserBirthday = this.form.get('requireUserBirthday')?.value;
    data.requireUserAddress = this.form.get('requireUserAddress')?.value;
    data.requireUserFlatNumber = this.form.get('requireUserFlatNumber')?.value;
    return data;
  }

  private setTargetValues(values: string[]): void {
    if (this.targetType === SettingsKycTargetFilterType.AccountId) {
      const filter = new Filter({
        users: values
      });
      this.subscriptions.add(
        this.getFilteredAccounts(filter).subscribe(result => {
          this.targetsOptions$ = of(result);
          this.form.get('targetValues')?.setValue(result);
        })
      );
    } else if (this.targetType === SettingsKycTargetFilterType.WidgetId) {
      const filter = new Filter({
        widgets: values
      });
      this.subscriptions.add(
        this.getFilteredWidgets(filter).subscribe(result => {
          this.targetsOptions$ = of(result);
          this.form.get('targetValues')?.setValue(result);
        })
      );
    } else if (this.targetType === SettingsKycTargetFilterType.Country) {
      const data = values.map(x => {
        const c = CountryFilterList.find(c => c.id === x);
        if (c) {
          c.imgClass = 'country-flag-admin';
          return c;
        } else {
          return new CommonTargetValue();
        }
      }).filter(x => x.id !== '');
      this.targetsOptions$ = of(data);
      this.form.get('targetValues')?.setValue(data);
    } else if (this.targetType === SettingsKycTargetFilterType.InitiateFrom) {
      const data = values.map(x => {
        const c = TransactionSourceFilterList.find(c => c.id === x);
        if (c) {
          return c;
        } else {
          return new CommonTargetValue();
        }
      }).filter(x => x.id !== '');
      this.targetsOptions$ = of(data);
      this.form.get('targetValues')?.setValue(data);
    } else {
      this.form.get('targetValues')?.setValue([]);
    }
  }

  private setTargetValueParams(): void {
    this.targetType = this.form.get('target')?.value as SettingsKycTargetFilterType;
    switch (this.targetType) {
      case SettingsKycTargetFilterType.None: {
        this.targetEntity = ['', ''];
        this.targetSearchText = '';
        this.targetsTitle = '';
        break;
      }
      case SettingsKycTargetFilterType.Country: {
        this.targetEntity = ['country', 'countries'];
        this.targetSearchText = 'Type a country name';
        this.targetsTitle = 'Countries';
        break;
      }
      case SettingsKycTargetFilterType.AccountId: {
        this.targetEntity = ['account', 'accounts'];
        this.targetSearchText = 'Type email or user name';
        this.targetsTitle = 'Accounts';
        break;
      }
      case SettingsKycTargetFilterType.WidgetId: {
        this.targetEntity = ['widget', 'widgets'];
        this.targetSearchText = 'Type a widget name';
        this.targetsTitle = 'Widgets';
        break;
      }
      case SettingsKycTargetFilterType.InitiateFrom: {
        this.targetEntity = ['source', 'sources'];
        this.targetSearchText = '';
        this.targetsTitle = 'Transaction sources';
        break;
      }
    }
    if (this.targetType !== SettingsKycTargetFilterType.None) {
      this.initTargetSearch();
    }
  }

  private initTargetSearch() {
    this.targetsOptions$ = concat(
      of([]),
      this.targetsSearchInput$.pipe(
        filter(res => {
          return res !== null && res.length >= this.minTargetsLengthTerm
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isTargetsLoading = true;
        }),
        switchMap(searchString => {
          this.isTargetsLoading = false;
          return this.filterTargets(searchString);
        })
      ));
  }

  private filterTargets(searchString: string): Observable<CommonTargetValue[]> {
    if (this.targetType === SettingsKycTargetFilterType.Country) {
      return of(CountryFilterList
        .map(x => {
          x.imgClass = 'country-flag-admin';
          return x;
        })
        .filter(x => x.title.toLowerCase().includes(searchString.toLowerCase()))
      );
    } else if (this.targetType === SettingsKycTargetFilterType.WidgetId) {
      const filter = new Filter({ search: searchString });
      return this.getFilteredWidgets(filter);
    } else if (this.targetType === SettingsKycTargetFilterType.AccountId) {
      const filter = new Filter({ search: searchString });
      return this.getFilteredAccounts(filter);
    } else if (this.targetType === SettingsKycTargetFilterType.InitiateFrom) {
      return of(TransactionSourceFilterList);
    } else {
      return of([]);
    }
  }

  private getFilteredAccounts(filter: Filter): Observable<CommonTargetValue[]> {
    return this.adminService.findUsers(filter)
      .pipe(map(result => result.list.map(user => {
        return {
          id: user.id,
          title: user.extendedName
        } as CommonTargetValue;
      })));
  }

  private getFilteredWidgets(filter: Filter): Observable<CommonTargetValue[]> {
    return this.adminService.getWidgets(0, 100, 'widgetId', false, filter)
      .pipe(map(result => {
        return result.list.map(widget => {
          return {
            id: widget.id,
            title: widget.name
          } as CommonTargetValue;
        });
      }));
  }

  private updateTarget(): void {
    this.clearTargetValues();
    this.setTargetValidator();
    this.setTargetValueParams();
  }

  private clearTargetValues(): void {
    this.targetsOptions$ = of([]);
    this.form.get('targetValues')?.setValue([]);
  }

  private setTargetValidator(): void {
    const val = this.form.get('target')?.value;
    this.targetType = val ?? SettingsKycTargetFilterType.None as SettingsKycTargetFilterType;
    if (val === SettingsKycTargetFilterType.None) {
      this.form.get('targetValues')?.clearValidators();
    } else {
      this.form.get('targetValues')?.setValidators([Validators.required]);
    }
    this.form.get('targetValues')?.updateValueAndValidity();
  }

  private loadLevelValues(userType: UserType): void {
    this.subscriptions.add(
      this.adminService.getKycLevels(userType).pipe(take(1)).subscribe(data => {
        this.levels = data.list.map(val => {
          const c = new KycLevelView();
          c.id = val.id;
          c.name = val.name as string;
          c.description = val.description as string;
          return c;
        });
      })
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.saveScheme(this.setSchemeData());
    }
  }

  deleteScheme(content: any): void {
    this.removeDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.removeDialog.closed.subscribe(val => {
        this.deleteSchemeConfirmed(this.settingsId ?? '');
      })
    );
  }

  private saveScheme(scheme: KycScheme): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.saveKycSettings(scheme, this.createNew);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  deleteSchemeConfirmed(id: string): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.deleteKycSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
