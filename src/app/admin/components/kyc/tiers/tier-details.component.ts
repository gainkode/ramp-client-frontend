import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
import { KycTier } from 'src/app/model/identification.model';
import { KycLevelView, KycProviderList, KycTargetFilterList, UserModeList, UserTypeList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { findExistingDefaultTier } from 'src/app/utils/utils';

@Component({
  selector: 'app-admin-tier-details',
  templateUrl: 'tier-details.component.html',
  styleUrls: ['tier-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminKycTierDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set currentTier(tier: KycTier | undefined) {
    this.setFormData(tier);
    this.settingsId = (tier) ? tier?.id : '';
    this.createNew = (this.settingsId === '');
  }
  @Input() tiers: KycTier[] = [];

  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  private removeDialog: NgbModalRef | undefined = undefined;
  private defaultOverwriteConfirmDialog: NgbModalRef | undefined = undefined;
  private settingsId = '';

  TARGET_TYPE: typeof SettingsKycTargetFilterType = SettingsKycTargetFilterType;
  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  defaultTierName = '';
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
  defaultAmount: number | null = null;

  form = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    isDefault: [false],
    amount: [0, { validators: [Validators.pattern('^[0-9.]+$')], updateOn: 'change' }],
    amountUnlimited: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
    level: ['', { validators: [Validators.required], updateOn: 'change' }],
    userMode: [[], { validators: [Validators.required], updateOn: 'change' }],
    userType: ['', { validators: [Validators.required], updateOn: 'change' }],
    provider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    requireUserFullName: [false],
    requireUserPhone: [false],
    requireUserBirthday: [false],
    requireUserAddress: [false],
    requireUserFlatNumber: [false]
  });

  constructor(
    private formBuilder: FormBuilder,
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
    this.subscriptions.add(
      this.form.get('amountUnlimited')?.valueChanges.subscribe(val => {
        if (val === true) {
          this.defaultAmount = this.form.get('amount')?.value;
          this.form.get('amount')?.setValue(null);
          this.form.get('amount')?.disable();
        } else {
          this.form.get('amount')?.setValue(this.defaultAmount);
          this.form.get('amount')?.enable();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(tier: KycTier | undefined): void {
    this.form.reset();
    this.defaultTierName = '';
    if (tier) {
      this.defaultTierName = tier.isDefault ? tier.name : '';
      this.form.get('id')?.setValue(tier?.id);
      this.form.get('name')?.setValue(tier?.name);
      this.form.get('description')?.setValue(tier?.description);
      this.form.get('amount')?.setValue(tier?.amount);
      this.form.get('amountUnlimited')?.setValue(tier?.amount === null);
      if (tier?.amount === null) {
        this.defaultAmount = 0;
        this.form.get('amount')?.disable();
      }
      this.form.get('isDefault')?.setValue(tier?.isDefault);
      this.form.get('level')?.setValue(tier?.level?.settingsKycLevelId ?? undefined);
      this.targetType = tier?.target ?? SettingsKycTargetFilterType.None;
      this.form.get('target')?.setValue(this.targetType);
      this.setTargetValues(tier?.targetValues);
      this.form.get('userMode')?.setValue(tier.userModes);
      this.form.get('userType')?.setValue(tier?.userType);
      if (tier?.kycProviders.length > 0) {
        this.form.get('provider')?.setValue(tier?.kycProviders[0]);
      }
      this.form.get('requireUserFullName')?.setValue(tier?.requireUserFullName);
      this.form.get('requireUserPhone')?.setValue(tier?.requireUserPhone);
      this.form.get('requireUserBirthday')?.setValue(tier?.requireUserBirthday);
      this.form.get('requireUserAddress')?.setValue(tier?.requireUserAddress);
      this.form.get('requireUserFlatNumber')?.setValue(tier?.requireUserFlatNumber);
      this.loadLevelValues(tier?.userType);
      this.setTargetValidator();
      this.setTargetValueParams();
    } else {
      this.form.get('id')?.setValue('');
      this.form.get('name')?.setValue('');
      this.form.get('description')?.setValue('');
      this.form.get('amount')?.setValue(0);
      this.form.get('amountUnlimited')?.setValue(false);
      this.form.get('isDefault')?.setValue(false);
      this.form.get('level')?.setValue('');
      this.form.get('target')?.setValue(SettingsKycTargetFilterType.None);
      this.form.get('targetValues')?.setValue([]);
      this.form.get('userMode')?.setValue([]);
      this.form.get('userType')?.setValue('');
      this.form.get('provider')?.setValue(undefined);
      this.form.get('requireUserFullName')?.setValue(false);
      this.form.get('requireUserPhone')?.setValue(false);
      this.form.get('requireUserBirthday')?.setValue(false);
      this.form.get('requireUserAddress')?.setValue(false);
      this.form.get('requireUserFlatNumber')?.setValue(false);
      this.setTargetValidator();
    }
  }

  private setTierData(): KycTier {
    const data = new KycTier(null);
    data.name = this.form.get('name')?.value;
    data.description = this.form.get('description')?.value;
    if (this.form.get('amountUnlimited')?.value === true) {
      data.amount = null;
    } else {
      data.amount = parseFloat(this.form.get('amount')?.value);
    }
    data.isDefault = this.form.get('isDefault')?.value;
    data.id = this.form.get('id')?.value;
    data.setTarget(this.targetType, this.form.get('targetValues')?.value);
    data.userType = this.form.get('userType')?.value;
    data.levelId = this.form.get('level')?.value;
    (this.form.get('userMode')?.value as UserMode[]).forEach(x => data.userModes.push(x));
    data.kycProviders = [this.form.get('provider')?.value];
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

  onSubmit(content: any): void {
    this.submitted = true;
    if (this.form.valid) {
      const tier = this.setTierData();
      const showDefaultWarning = findExistingDefaultTier(this.tiers, tier);
      if (showDefaultWarning) {
        this.defaultOverwriteConfirmDialog = this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
        this.subscriptions.add(
          this.defaultOverwriteConfirmDialog.closed.subscribe(val => {
            this.saveTier(tier);
          })
        );
      } else {
        this.saveTier(tier);
      }
    }
  }

  deleteTier(content: any): void {
    this.removeDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.removeDialog.closed.subscribe(val => {
        this.deleteTierConfirmed(this.settingsId ?? '');
      })
    );
  }

  private saveTier(tier: KycTier): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.saveKycTierSettings(tier, this.createNew);
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

  deleteTierConfirmed(id: string): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.deleteKycTierSettings(id);
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
