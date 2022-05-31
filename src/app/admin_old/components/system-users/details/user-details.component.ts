import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { LayoutService } from 'src/app/admin_old/services/layout.service';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { AccountStatus, UserInput, UserType } from 'src/app/model/generated-models';
import { UserStatusList } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
  selector: 'app-system-user-details',
  templateUrl: 'user-details.component.html',
  styleUrls: ['user-details.component.scss']
})
export class SystemUserDetailsComponent implements OnDestroy {
  @Input() permission = 0;
  @Input() set user(val: UserItem | null | undefined) {
    this.setFormData(val);
    this.layoutService.setBackdrop(!val?.id);
  }
  @Input() cancelable = false;
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  data: UserItem | null | undefined
  USER_TYPE: typeof UserType = UserType;
  createNew = false;
  settingsId = '';
  email = '';
  address = '';
  userData: UserItem | null | undefined;
  userType = UserType.Personal;
  loadingData = false;
  errorMessage = '';
  removable = false;
  countries = Countries;
  accountStatuses = UserStatusList;

  dataForm = this.formBuilder.group({
    id: [''],
    email: ['', { validators: [Validators.required], updateOn: 'change' }],
    firstName: ['', { validators: [Validators.required], updateOn: 'change' }],
    lastName: ['', { validators: [], updateOn: 'change' }],
    birthday: ['', { validators: [], updateOn: 'change' }],
    country: ['', { validators: [Validators.required], updateOn: 'change' }],
    postCode: ['', { validators: [], updateOn: 'change' }],
    town: ['', { validators: [], updateOn: 'change' }],
    street: ['', { validators: [], updateOn: 'change' }],
    subStreet: ['', { validators: [], updateOn: 'change' }],
    stateName: ['', { validators: [], updateOn: 'change' }],
    buildingName: ['', { validators: [], updateOn: 'change' }],
    buildingNumber: ['', { validators: [], updateOn: 'change' }],
    flatNumber: ['', { validators: [], updateOn: 'change' }],
    phone: ['', { validators: [], updateOn: 'change' }],
    accountStatus: [AccountStatus.Closed, { validators: [Validators.required], updateOn: 'change' }],
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private layoutService: LayoutService,
    private router: Router,
    public dialog: MatDialog,
    private auth: AuthService,
    private adminService: AdminDataService) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(data: UserItem | null | undefined): void {
    if (data?.id === undefined || data?.id === '') {
      data = undefined;
    }
    this.data = data;
    this.errorMessage = '';
    this.dataForm.reset();
    if (data) {
      this.loadingData = true;
      this.dataForm.get('id')?.setValue(data?.id);
      this.dataForm.get('email')?.setValue(data?.email);
      if (data.userType?.id === UserType.Merchant) {
        this.dataForm.get('firstName')?.setValue(data?.company);
        this.dataForm.get('lastName')?.setValue('');
        this.dataForm.get('birthday')?.setValue('');
        this.dataForm.get('birthday')?.setValidators([]);
      } else {
        this.dataForm.get('firstName')?.setValue(data?.firstName);
        this.dataForm.get('lastName')?.setValue(data?.lastName);
        if (data?.birthday) {
          const d = `${data.birthday.getDate()}/${data.birthday.getMonth() + 1}/${data.birthday.getFullYear()}`;
          this.dataForm.get('birthday')?.setValue(d);
        } else {
          this.dataForm.get('birthday')?.setValue('');
        }
        this.dataForm.get('birthday')?.setValidators([
          Validators.required,
          Validators.pattern('^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$')
        ]);
      }
      this.dataForm.get('accountStatus')?.setValue(data?.accountStatus ?? AccountStatus.Closed);
      this.dataForm.get('country')?.setValue(data?.country?.id);
      this.dataForm.get('postCode')?.setValue(data?.postCode);
      this.dataForm.get('town')?.setValue(data?.town);
      this.dataForm.get('street')?.setValue(data?.street);
      this.dataForm.get('subStreet')?.setValue(data?.subStreet);
      this.dataForm.get('stateName')?.setValue(data?.stateName);
      this.dataForm.get('buildingName')?.setValue(data?.buildingName);
      this.dataForm.get('buildingNumber')?.setValue(data?.buildingNumber);
      this.dataForm.get('flatNumber')?.setValue(data?.flatNumber);
      this.dataForm.get('phone')?.setValue(data?.phone);
      this.dataForm.get('fiat')?.setValue(data?.fiatCurrency);
      this.dataForm.get('crypto')?.setValue(data?.cryptoCurrency);
      this.loadingData = false;
    } else {
      this.createNew = true;
      this.dataForm.get('id')?.setValue('');
      this.dataForm.get('email')?.setValue('');
      this.dataForm.get('firstName')?.setValue('');
      this.dataForm.get('lastName')?.setValue('');
      this.dataForm.get('birthday')?.setValue('');
      this.dataForm.get('birthday')?.setValidators([]);
      this.dataForm.get('accountStatus')?.setValue(AccountStatus.Live);
      this.dataForm.get('country')?.setValue('');
      this.dataForm.get('postCode')?.setValue('');
      this.dataForm.get('town')?.setValue('');
      this.dataForm.get('street')?.setValue('');
      this.dataForm.get('subStreet')?.setValue('');
      this.dataForm.get('stateName')?.setValue('');
      this.dataForm.get('buildingName')?.setValue('');
      this.dataForm.get('buildingNumber')?.setValue('');
      this.dataForm.get('flatNumber')?.setValue('');
      this.dataForm.get('phone')?.setValue('');
      this.dataForm.get('birthday')?.setValidators([
        Validators.required,
        Validators.pattern('^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$')
      ]);
    }
    this.dataForm.get('birthday')?.updateValueAndValidity();
    this.settingsId = (data) ? data?.id : '';
    this.email = (data) ? data?.email : '';
    this.removable = (this.auth.user?.userId !== this.settingsId);
    this.address = (data) ? data.address : '';
    this.userType = (data) ? data.userType?.id ?? UserType.Personal : UserType.Personal;
    this.userData = data;
  }

  private setUserData(): UserInput {
    const code3 = this.dataForm.get('country')?.value;
    const country = getCountryByCode3(code3);
    const code2 = (country) ? country.code2 : '';
    const data = {
      email: this.dataForm.get('email')?.value,
      firstName: this.dataForm.get('firstName')?.value,
      lastName: this.dataForm.get('lastName')?.value,
      birthday: getFormattedUtcDate(this.dataForm.get('birthday')?.value ?? ''),
      countryCode2: code2,
      countryCode3: code3,
      postCode: this.dataForm.get('postCode')?.value,
      town: this.dataForm.get('town')?.value,
      street: this.dataForm.get('street')?.value,
      subStreet: this.dataForm.get('subStreet')?.value,
      stateName: this.dataForm.get('stateName')?.value,
      buildingName: this.dataForm.get('buildingName')?.value,
      buildingNumber: this.dataForm.get('buildingNumber')?.value,
      flatNumber: this.dataForm.get('flatNumber')?.value,
      phone: this.dataForm.get('phone')?.value,
      accountStatus: this.dataForm.get('accountStatus')?.value
    } as UserInput;
    return data;
  }

  private onDelete(id: string): void {
    const requestData$ = this.adminService.deleteCustomer(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.save.emit();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onDeleteUser(): void {
    this.onDelete(this.settingsId);
  }

  onSave(id: string, user: UserInput): void {
    const requestData$ = this.adminService.saveCustomer(id, user);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        if (user.changePasswordRequired === true) {
          this.dialog.open(CommonDialogBox, {
            width: '450px',
            data: {
              title: 'Reset password',
              message: 'Password has been reset successfully'
            }
          });
        } else {
          if (this.auth.user?.userId === id) {
            this.auth.setUserName(user.firstName ?? '', user.lastName ?? '');
            this.auth.setUserCurrencies(
              user.defaultCryptoCurrency ?? 'BTC',
              user.defaultFiatCurrency ?? 'EUR');
          }
          this.save.emit();
        }
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.onSave(this.settingsId, this.setUserData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onResetPassword(): void {
    this.onSave(this.settingsId, {
      email: this.email,
      changePasswordRequired: true
    } as UserInput);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
