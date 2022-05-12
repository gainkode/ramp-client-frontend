import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { getCountry } from 'src/app/model/country-code.model';
import { SettingsKycTargetFilterType } from 'src/app/model/generated-models';
import { KycScheme } from 'src/app/model/identification.model';
import { KycProviderList, KycTargetFilterList, UserModeList, UserTypeList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-kyc-details',
  templateUrl: 'kyc-details.component.html',
  styleUrls: ['kyc-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminKycSchemeDetailsComponent implements OnDestroy {
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

  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  defaultSchemeName = '';
  targets = KycTargetFilterList;
  userTypeOptions = UserTypeList;
  userModes = UserModeList;
  kycProviders = KycProviderList;

  form = this.formBuilder.group({
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService) {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setFormData(scheme: KycScheme | undefined): void {
    this.form.reset();
    this.defaultSchemeName = '';
    if (scheme) {
      this.removeIncorrectTargetValues(scheme);
      this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
      this.form.get('id')?.setValue(scheme?.id);
      this.form.get('name')?.setValue(scheme?.name);
      this.form.get('description')?.setValue(scheme?.description);
      this.form.get('isDefault')?.setValue(scheme?.isDefault);
      // this.form.get('level')?.setValue(scheme?.level?.settingsKycLevelId ?? '');
      this.form.get('target')?.setValue(scheme?.target);
      // this.targetType = scheme?.target ?? SettingsKycTargetFilterType.None;
      // if (this.targetType === SettingsKycTargetFilterType.AccountId) {
      //   const filter = new Filter({
      //     users: scheme?.targetValues
      //   });
      //   this.subscriptions.add(
      //     this.getFilteredAccounts(filter).subscribe(result => {
      //       this.targetValues = result;
      //       this.form.get('targetValues')?.setValue(result.map(x => x.title));
      //     })
      //   );
      //   this.updateTarget('');
      // } else if (this.targetType === SettingsKycTargetFilterType.WidgetId) {
      //   const filter = new Filter({
      //     widgets: scheme?.targetValues
      //   });
      //   this.subscriptions.add(
      //     this.getFilteredWidgets(filter).subscribe(result => {
      //       this.targetValues = result;
      //       this.form.get('targetValues')?.setValue(result.map(x => x.title));
      //     })
      //   );
      //   this.updateTarget('');
      // } else {
      //   this.form.get('targetValues')?.setValue(scheme?.targetValues);
      // }

      // this.form.get('targetValues')?.setValue(scheme?.targetValues);
      this.form.get('userMode')?.setValue(scheme.userModes);
      this.form.get('userType')?.setValue(scheme?.userType);
      this.form.get('provider')?.setValue(scheme?.kycProviders);
      this.form.get('requireUserFullName')?.setValue(scheme?.requireUserFullName);
      this.form.get('requireUserPhone')?.setValue(scheme?.requireUserPhone);
      this.form.get('requireUserBirthday')?.setValue(scheme?.requireUserBirthday);
      this.form.get('requireUserAddress')?.setValue(scheme?.requireUserAddress);
      this.form.get('requireUserFlatNumber')?.setValue(scheme?.requireUserFlatNumber);

      // this.loadLevelValues(scheme?.userType);
      // this.setTargetValidator();
      // const p = this.targetValueParams;
    } else {
      this.form.get('id')?.setValue('');
      this.form.get('name')?.setValue('');
      this.form.get('description')?.setValue('');
      this.form.get('isDefault')?.setValue('');
      // this.form.get('level')?.setValue('');
      this.form.get('target')?.setValue(SettingsKycTargetFilterType.None);

      // this.form.get('targetValues')?.setValue([]);
      this.form.get('userMode')?.setValue([]);
      this.form.get('userType')?.setValue('');
      this.form.get('provider')?.setValue([]);
      this.form.get('requireUserFullName')?.setValue(false);
      this.form.get('requireUserPhone')?.setValue(false);
      this.form.get('requireUserBirthday')?.setValue(false);
      this.form.get('requireUserAddress')?.setValue(false);
      this.form.get('requireUserFlatNumber')?.setValue(false);
      //this.setTargetValidator();
    }
  }

  setSchemeData(): KycScheme {
    const data = new KycScheme(null);
    // common
    data.name = this.form.get('name')?.value;
    data.description = this.form.get('description')?.value;
    data.isDefault = this.form.get('isDefault')?.value;
    data.id = this.form.get('id')?.value;
    // target
    // if (this.targetType === SettingsKycTargetFilterType.WidgetId ||
    //   this.targetType === SettingsKycTargetFilterType.AccountId) {
    //   data.setTarget(this.form.get('target')?.value, this.targetValues.map(c => {
    //     return c.id;
    //   }));
    // } else {
    //   data.setTarget(this.form.get('target')?.value, this.form.get('targetValues')?.value);
    // }
    // data.userType = this.form.get('userType')?.value;
    // data.levelId = this.form.get('level')?.value;
    // (this.form.get('userMode')?.value as UserMode[]).forEach(x => data.userModes.push(x));
    // (this.form.get('provider')?.value as KycProvider[]).forEach(x => data.kycProviders.push(x));
    // data.requireUserFullName = this.form.get('requireUserFullName')?.value;
    // data.requireUserPhone = this.form.get('requireUserPhone')?.value;
    // data.requireUserBirthday = this.form.get('requireUserBirthday')?.value;
    // data.requireUserAddress = this.form.get('requireUserAddress')?.value;
    // data.requireUserFlatNumber = this.form.get('requireUserFlatNumber')?.value;
    return data;
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

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.saveLevel(this.setSchemeData());
    }
  }

  deleteLevel(content: any): void {
    this.removeDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.removeDialog.closed.subscribe(val => {
        this.deleteLevelConfirmed(this.settingsId ?? '');
      })
    );
  }

  private saveLevel(scheme: KycScheme): void {
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

  deleteLevelConfirmed(id: string): void {
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
