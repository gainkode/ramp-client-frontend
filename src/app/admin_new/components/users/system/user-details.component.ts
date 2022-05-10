import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { DateFormatAdapter } from 'src/app/admin_new/misc/date-range/date-format.adapter';
import { DateParserFormatter } from 'src/app/admin_new/misc/date-range/date.formatter';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { AccountStatus, UserInput, UserRole, UserType } from 'src/app/model/generated-models';
import { UserStatusList, UserTypeList } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
  selector: 'app-admin-user-details',
  templateUrl: 'user-details.component.html',
  styleUrls: ['user-details.component.scss', '../../../assets/scss/_validation.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: DateFormatAdapter },
    { provide: NgbDateParserFormatter, useClass: DateParserFormatter }
  ]
})
export class AdminUserDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input() roles: UserRole[] = [];
  @Input() set user(val: UserItem | null | undefined) {
    this.setFormData(val);
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  disableInProgress = false;
  errorMessage = '';
  USER_TYPE: typeof UserType = UserType;
  userType: UserType = UserType.Personal;
  userData: UserItem | null | undefined = undefined;
  countries = Countries;
  accountStatuses = UserStatusList;
  accountTypes = UserTypeList;
  minBirthdayDate: NgbDateStruct = {
    year: 1900,
    month: 1,
    day: 1
  };
  maxBirthdayDate: NgbDateStruct = {
    year: new Date().getFullYear() - 17,
    month: 1,
    day: 1
  };
  currentRoles: string[] = ['USER'];
  disableButtonTitle = 'Disable';
  removable = false;
  createNew = false;

  dataForm = this.formBuilder.group({
    id: [''],
    email: ['', { validators: [Validators.required], updateOn: 'change' }],
    firstName: ['', { validators: [Validators.required], updateOn: 'change' }],
    lastName: ['', { validators: [], updateOn: 'change' }],
    birthday: [null, { validators: [], updateOn: 'change' }],
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
    accountType: [UserType.Personal, { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private modalService: NgbModal,
    private adminService: AdminDataService) {
      
    }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dataForm.get('accountType')?.valueChanges.subscribe(val => {
        this.userType = val;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(data: UserItem | null | undefined): void {
    if (data?.id === undefined || data?.id === '') {
      data = undefined;
    }
    this.userData = data;
    this.errorMessage = '';
    this.dataForm.reset();
    if (data) {
      this.userType = data.userType?.id ?? UserType.Personal;
      this.disableButtonTitle = (data.deleted) ? 'Enable' : 'Disable';
      this.dataForm.get('id')?.setValue(data?.id);
      this.dataForm.get('email')?.setValue(data?.email);
      if (this.userType === UserType.Merchant) {
        this.dataForm.get('firstName')?.setValue(data?.company);
        this.dataForm.get('lastName')?.setValue('');
        this.dataForm.get('birthday')?.setValue(null);
      } else {
        this.dataForm.get('firstName')?.setValue(data?.firstName);
        this.dataForm.get('lastName')?.setValue(data?.lastName);
        if (data?.birthday) {
          const b = `${data.birthday.getDate()}-${data.birthday.getMonth() + 1}-${data.birthday.getFullYear()}`;
          this.dataForm.get('birthday')?.setValue(b);
        } else {
          this.dataForm.get('birthday')?.setValue(null);
        }
      }
      this.dataForm.get('accountType')?.setValue(this.userType);
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
    } else {
      this.createNew = true;
      this.dataForm.get('id')?.setValue('');
      this.dataForm.get('email')?.setValue('');
      this.dataForm.get('firstName')?.setValue('');
      this.dataForm.get('lastName')?.setValue('');
      this.dataForm.get('birthday')?.setValue(null);
      this.dataForm.get('accountType')?.setValue(UserType.Personal);
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
    }
    const settingsId = data?.id ?? '';
    this.removable = (this.auth.user?.userId !== settingsId);
  }

  private setCustomerData(): UserInput {
    const code3 = this.dataForm.get('country')?.value;
    const country = getCountryByCode3(code3);
    const code2 = (country) ? country.code2 : '';
    const data = {
      email: this.dataForm.get('email')?.value,
      firstName: this.dataForm.get('firstName')?.value,
      lastName: this.dataForm.get('lastName')?.value,
      birthday: getFormattedUtcDate(this.dataForm.get('birthday')?.value ?? '', '-'),
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
      accountStatus: this.dataForm.get('accountStatus')?.value,
      type: this.dataForm.get('accountType')?.value
    } as UserInput;
    return data;
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.dataForm.valid) {
      this.onSave(this.userData?.id ?? '', this.setCustomerData(), undefined);
    }
  }

  onResetPassword(content: any): void {
    this.onSave(
      this.userData?.id ?? '',
      {
        email: this.userData?.email ?? '',
        changePasswordRequired: true
      } as UserInput,
      content);
  }

  onDeleteUser(content: any): void {
    const dialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      dialog.closed.subscribe(data => {
        if (this.userData?.deleted ?? false) {
          this.onRestore(this.userData?.id ?? '');
        } else {
          this.onDelete(this.userData?.id ?? '');
        }
      })
    );
  }

  private onSave(id: string, customer: UserInput, content: any): void {
    this.saveInProgress = true;
    const requestData$ = this.adminService.saveCustomer(id, customer, this.currentRoles);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        if (customer.changePasswordRequired === true) {
          this.modalService.open(content, {
            backdrop: 'static',
            windowClass: 'modalCusSty',
          });
        } else {
          if (this.auth.user?.userId === id) {
            this.auth.setUserName(customer.firstName ?? '', customer.lastName ?? '');
            this.auth.setUserCurrencies(
              customer.defaultCryptoCurrency ?? 'BTC',
              customer.defaultFiatCurrency ?? 'EUR');
          }
        }
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

  private onDelete(id: string): void {
    this.disableInProgress = true;
    const requestData$ = this.adminService.deleteCustomer(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.disableInProgress = false;
        this.save.emit();
      }, (error) => {
        this.disableInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private onRestore(id: string): void {
    this.disableInProgress = true;
    const requestData$ = this.adminService.restoreCustomer(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.disableInProgress = false;
        this.save.emit();
      }, (error) => {
        this.disableInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onRolesUpdated(roles: string[]): void {
    this.currentRoles = roles.map(x => x);
  }

  onClose(): void {
    this.close.emit();
  }
}
