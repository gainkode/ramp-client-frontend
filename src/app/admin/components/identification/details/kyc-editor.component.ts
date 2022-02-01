import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  SettingsKycTargetFilterType, KycProvider, UserMode, UserType
} from '../../../../model/generated-models';
import {
  KycTargetFilterList, UserTypeList, UserModeList, KycProviderList, KycLevelView
} from 'src/app/model/payment.model';
import { CommonTargetValue, TargetParams } from 'src/app/model/common.model';
import { CountryFilterList, getCountry } from 'src/app/model/country-code.model';
import { KycScheme } from 'src/app/model/identification.model';
import { AdminDataService } from '../../../services/admin-data.service';
import { TransactionSourceFilterList } from 'src/app/model/fee-scheme.model';
import { Filter } from '../../../model/filter.model';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-kyc-editor',
  templateUrl: 'kyc-editor.component.html',
  styleUrls: ['kyc-editor.component.scss', '../list/identification-list.component.scss']
})
export class KycEditorComponent implements OnInit, OnDestroy {
  @Input()
  set currentScheme(scheme: KycScheme | null) {
    this.setFormData(scheme);
    this.settingsId = (scheme !== null) ? scheme?.id : '';
    this.layoutService.setBackdrop(!this.settingsId);
  }

  @Input() create = false;
  @Output() save = new EventEmitter<KycScheme>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();
  @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
  @ViewChild('levelValueInput') levelValueInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  private defaultSchemeName = '';
  private settingsId = '';
  private destroy$ = new Subject();
  private targetSearchString$ = new BehaviorSubject<string>('');
  private subscriptions: Subscription = new Subscription();

  errorMessage = '';
  targetEntity = '';
  targetType = SettingsKycTargetFilterType.None;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTargetValues$: Observable<CommonTargetValue[]> | undefined;

  targets = KycTargetFilterList;
  userTypes = UserTypeList;
  userModes = UserModeList;
  providers = KycProviderList;
  levels: KycLevelView[] = [];
  targetValues: CommonTargetValue[] = [];

  schemeForm = this.formBuilder.group({
    id: [''],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    isDefault: [false],
    target: ['', { validators: [Validators.required], updateOn: 'change' }],
    targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
    targetValue: [''],
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

  get defaultSchemeFlag(): string {
    return this.defaultSchemeName;
  }

  get targetValueParams(): TargetParams {
    const val = this.schemeForm.get('target')?.value;
    const params = new TargetParams();
    switch (val) {
      case SettingsKycTargetFilterType.None: {
        params.title = '';
        params.inputPlaceholder = '';
        params.dataList = [];
        this.targetEntity = '';
        break;
      }
      case SettingsKycTargetFilterType.Country: {
        params.title = 'List of countries *';
        params.inputPlaceholder = 'New country...';
        params.dataList = CountryFilterList;
        this.targetEntity = 'country';
        break;
      }
      case SettingsKycTargetFilterType.AccountId: {
        params.title = 'List of accounts *';
        params.inputPlaceholder = 'Type account email...';
        params.dataList = [];
        this.targetEntity = 'account identifier';
        break;
      }
      case SettingsKycTargetFilterType.WidgetId: {
        params.title = 'List of widgets *';
        params.inputPlaceholder = 'New widget (Name, code or ID)...';
        params.dataList = [];
        this.targetEntity = 'widget identifier';
        break;
      }
      case SettingsKycTargetFilterType.InitiateFrom: {
        params.title = 'List of sources *';
        params.inputPlaceholder = 'New source...';
        params.dataList = TransactionSourceFilterList;
        this.targetEntity = 'source';
        break;
      }
    }
    return params;
  }

  constructor(
    private adminService: AdminDataService,
    private formBuilder: FormBuilder,
    private layoutService: LayoutService) {
  }

  ngOnInit(): void {
    this.filteredTargetValues$ = of(this.filterTargetValues(''));
    this.subscriptions.add(
      this.schemeForm.get('target')?.valueChanges.subscribe(val => this.updateTarget(val))
    );
    this.subscriptions.add(
      this.schemeForm.get('userType')?.valueChanges.subscribe(val => {
        this.loadLevelValues(val);
      })
    );
    this.subscriptions.add(
      this.schemeForm.get('requireUserFlatNumber')?.valueChanges.subscribe(val => {
        if (val === true) {
          this.schemeForm.get('requireUserAddress')?.setValue(true);
        }
      })
    );
    this.subscriptions.add(
      this.schemeForm.get('requireUserAddress')?.valueChanges.subscribe(val => {
        if (val === false) {
          this.schemeForm.get('requireUserFlatNumber')?.setValue(false);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  private updateTarget(val: any): void {
    this.clearTargetValues();
    this.setTargetValidator();
    if (this.targetType === SettingsKycTargetFilterType.WidgetId ||
      this.targetType === SettingsKycTargetFilterType.AccountId) {
      this.targetSearchString$.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        debounceTime(1000),
        switchMap(searchString => this.getFilteredOptions(searchString))
      ).subscribe(options => {
        this.filteredTargetValues$ = of(options);
      });
    } else {
      this.filteredTargetValues$ = this.schemeForm.get('targetValue')?.valueChanges.pipe(
        startWith(''),
        map(value => this.filterTargetValues(value))
      );
    }
  }

  private getFilteredOptions(searchString: string): Observable<CommonTargetValue[]> {
    if (searchString) {
      if (this.targetType === SettingsKycTargetFilterType.AccountId) {
        const accountFilter = new Filter({ search: searchString });
        return this.getFilteredAccounts(accountFilter);
      } else if (this.targetType === SettingsKycTargetFilterType.WidgetId) {
        const widgetFilter = new Filter({ search: searchString });
        return this.getFilteredWidgets(widgetFilter);
      } else {
        return of([]);
      }
    } else {
      return of([]);
    }
  }

  private getFilteredAccounts(filter: Filter): Observable<CommonTargetValue[]> {
    return this.adminService.getUsers(0, 100, 'email', false, filter).pipe(
      map(result => {
        return result.list.map(user => {
          return {
            id: user.id,
            title: user.email
          } as CommonTargetValue;
        });
      })
    );
  }

  private getFilteredWidgets(filter: Filter): Observable<CommonTargetValue[]> {
    return this.adminService.getWidgets(0, 100, 'widgetId', false, filter).pipe(
      map(result => {
        return result.list.map(widget => {
          return {
            id: widget.id,
            title: widget.name
          } as CommonTargetValue;
        });
      })
    );
  }

  private setTargetValidator(): void {
    const val = this.schemeForm.get('target')?.value;
    this.targetType = val ?? SettingsKycTargetFilterType.None as SettingsKycTargetFilterType;
    if (val === SettingsKycTargetFilterType.None) {
      this.schemeForm.get('targetValues')?.clearValidators();
    } else {
      this.schemeForm.get('targetValues')?.setValidators([Validators.required]);
    }
    this.schemeForm.get('targetValues')?.updateValueAndValidity();
  }

  private filterTargetValues(value: string): CommonTargetValue[] {
    if (this.targetType !== SettingsKycTargetFilterType.None) {
      let filterValue = '';
      if (value) {
        filterValue = value.toLowerCase();
        return this.targetValueParams.dataList.filter(c => c.title.toLowerCase().includes(filterValue));
      } else {
        return this.targetValueParams.dataList;
      }
    } else {
      return [];
    }
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

  handleTargetInputChange(event: Event): void {
    if (this.targetType === SettingsKycTargetFilterType.WidgetId ||
      this.targetType === SettingsKycTargetFilterType.AccountId) {
      let searchString = event.target ? (event.target as HTMLInputElement).value : '';
      searchString = searchString.toLowerCase().trim();
      this.targetSearchString$.next(searchString);
    }
  }

  setFormData(scheme: KycScheme | null): void {
    this.schemeForm.reset();
    this.defaultSchemeName = '';
    if (scheme !== null) {
      this.removeIncorrectTargetValues(scheme);
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.schemeForm.get('id')?.setValue(scheme?.id);
      this.schemeForm.get('name')?.setValue(scheme?.name);
      this.schemeForm.get('description')?.setValue(scheme?.description);
      this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
      this.schemeForm.get('level')?.setValue(scheme?.level?.settingsKycLevelId ?? '');
      this.schemeForm.get('target')?.setValue(scheme?.target);
      this.targetType = scheme?.target ?? SettingsKycTargetFilterType.None;
      if (this.targetType === SettingsKycTargetFilterType.AccountId) {
        const filter = new Filter({
          users: scheme?.targetValues
        });
        this.subscriptions.add(
          this.getFilteredAccounts(filter).subscribe(result => {
            this.targetValues = result;
            this.schemeForm.get('targetValues')?.setValue(result.map(x => x.title));
          })
        );
        this.updateTarget('');
      } else if (this.targetType === SettingsKycTargetFilterType.WidgetId) {
        const filter = new Filter({
          widgets: scheme?.targetValues
        });
        this.subscriptions.add(
          this.getFilteredWidgets(filter).subscribe(result => {
            this.targetValues = result;
            this.schemeForm.get('targetValues')?.setValue(result.map(x => x.title));
          })
        );
        this.updateTarget('');
      } else {
        this.schemeForm.get('targetValues')?.setValue(scheme?.targetValues);
      }
      this.schemeForm.get('targetValues')?.setValue(scheme?.targetValues);
      this.schemeForm.get('userMode')?.setValue(scheme.userModes);
      this.schemeForm.get('userType')?.setValue(scheme?.userType);
      this.schemeForm.get('provider')?.setValue(scheme?.kycProviders);
      this.schemeForm.get('requireUserFullName')?.setValue(scheme?.requireUserFullName);
      this.schemeForm.get('requireUserPhone')?.setValue(scheme?.requireUserPhone);
      this.schemeForm.get('requireUserBirthday')?.setValue(scheme?.requireUserBirthday);
      this.schemeForm.get('requireUserAddress')?.setValue(scheme?.requireUserAddress);
      this.schemeForm.get('requireUserFlatNumber')?.setValue(scheme?.requireUserFlatNumber);
      this.loadLevelValues(scheme?.userType);
      this.setTargetValidator();
      const p = this.targetValueParams;
      this.formChanged.emit(false);
    } else {
      this.schemeForm.get('id')?.setValue('');
      this.schemeForm.get('name')?.setValue('');
      this.schemeForm.get('description')?.setValue('');
      this.schemeForm.get('isDefault')?.setValue('');
      this.schemeForm.get('level')?.setValue('');
      this.schemeForm.get('target')?.setValue(SettingsKycTargetFilterType.None);
      this.schemeForm.get('targetValues')?.setValue([]);
      this.schemeForm.get('userMode')?.setValue([]);
      this.schemeForm.get('userType')?.setValue('');
      this.schemeForm.get('provider')?.setValue([]);
      this.schemeForm.get('requireUserFullName')?.setValue(false);
      this.schemeForm.get('requireUserPhone')?.setValue(false);
      this.schemeForm.get('requireUserBirthday')?.setValue(false);
      this.schemeForm.get('requireUserAddress')?.setValue(false);
      this.schemeForm.get('requireUserFlatNumber')?.setValue(false);
      this.setTargetValidator();
    }
  }

  setSchemeData(): KycScheme {
    const data = new KycScheme(null);
    // common
    data.name = this.schemeForm.get('name')?.value;
    data.description = this.schemeForm.get('description')?.value;
    data.isDefault = this.schemeForm.get('isDefault')?.value;
    data.id = this.schemeForm.get('id')?.value;
    // target
    if (this.targetType === SettingsKycTargetFilterType.WidgetId ||
      this.targetType === SettingsKycTargetFilterType.AccountId) {
      data.setTarget(this.schemeForm.get('target')?.value, this.targetValues.map(c => {
        return c.id;
      }));
    } else {
      data.setTarget(this.schemeForm.get('target')?.value, this.schemeForm.get('targetValues')?.value);
    }
    data.userType = this.schemeForm.get('userType')?.value;
    data.levelId = this.schemeForm.get('level')?.value;
    (this.schemeForm.get('userMode')?.value as UserMode[]).forEach(x => data.userModes.push(x));
    (this.schemeForm.get('provider')?.value as KycProvider[]).forEach(x => data.kycProviders.push(x));
    data.requireUserFullName = this.schemeForm.get('requireUserFullName')?.value;
    data.requireUserPhone = this.schemeForm.get('requireUserPhone')?.value;
    data.requireUserBirthday = this.schemeForm.get('requireUserBirthday')?.value;
    data.requireUserAddress = this.schemeForm.get('requireUserAddress')?.value;
    data.requireUserFlatNumber = this.schemeForm.get('requireUserFlatNumber')?.value;
    return data;
  }

  addTargetValue(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add new target value
    if ((value || '').trim()) {
      const values = this.schemeForm.get('targetValues')?.value;
      values.push(value.trim());
      this.addTarget(value.trim());
      this.schemeForm.get('targetValues')?.setValue(values);
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.schemeForm.get('targetValue')?.setValue(null);
  }

  removeTargetValue(val: string): void {
    const values = this.schemeForm.get('targetValues')?.value;
    const index = values.indexOf(val);
    if (index >= 0) {
      values.splice(index, 1);
      this.removeTarget(val);
      this.schemeForm.get('targetValues')?.setValue(values);
    }
  }

  clearTargetValues(): void {
    this.targetValues = [];
    this.filteredTargetValues$ = of([]);
    this.schemeForm.get('targetValues')?.setValue([]);
  }

  targetItemSelected(event: MatAutocompleteSelectedEvent): void {
    const values = this.schemeForm.get('targetValues')?.value;
    if (!values.includes(event.option.viewValue)) {
      values.push(event.option.viewValue);
      this.addTarget(event.option.viewValue);
      this.schemeForm.get('targetValues')?.setValue(values);
    }
    this.targetValueInput.nativeElement.value = '';
    this.schemeForm.get('targetValue')?.setValue(null);
  }

  onDeleteScheme(): void {
    this.delete.emit(this.settingsId);
  }

  private addTarget(value: string): void {
    this.filteredTargetValues$?.subscribe(val => {
      const valueObject = val.find(x => x.title === value);
      if (valueObject) {
        this.targetValues.push(valueObject);
      }
    });
  }

  private removeTarget(value: string): void {
    const idx = this.targetValues.findIndex(x => x.title === value);
    this.targetValues.splice(idx, 1);
  }

  private removeIncorrectTargetValues(scheme: KycScheme): void {
    scheme.targetValues = scheme.targetValues.filter(val => {
      let result = true;
      if (scheme.target === SettingsKycTargetFilterType.Country) {
        result = (getCountry(val) !== null);
      }
      return result;
    });
  }

  private validateTargetValues(): boolean {
    let result = true;
    const filter = this.schemeForm.get('target')?.value as SettingsKycTargetFilterType;
    if (filter === SettingsKycTargetFilterType.Country) {
      result = (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
        const c = getCountry(x);
        if (c === null) {
          result = false;
          this.errorMessage = `Country ${x} is not found in a list`;
          return false;
        }
        return true;
      });
    }
    if (result) {
      this.errorMessage = '';
    }
    return result;
  }

  onSubmit(): void {
    if (this.schemeForm.valid && this.validateTargetValues()) {
      this.save.emit(this.setSchemeData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
