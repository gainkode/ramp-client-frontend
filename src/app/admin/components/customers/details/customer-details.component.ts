import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { RiskLevel, User, UserType } from 'src/app/model/generated-models';
import { CurrencyView, RiskLevelView, RiskLevelViewList, UserModeView } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { Subject, Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/admin/services/admin-data.service';
import { take, takeUntil } from 'rxjs/operators';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
  selector: 'app-customer-details',
  templateUrl: 'customer-details.component.html',
  styleUrls: ['customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnDestroy {
  @Input() set customer(val: UserItem | null | undefined) {
    this.setFormData(val);
    this.settingsId = (val) ? val?.id : '';
    this.email = (val) ? val?.email : '';
    this.removable = (this.auth.user?.userId !== this.settingsId);
    this.address = (val) ? val.address : '';
    this.userType = (val) ? val.userType?.id ?? UserType.Personal : UserType.Personal;
    this.user = val;
    if (val) {
      this.getUserKycInfo(this.settingsId);
      this.getUserState(this.settingsId);
    }
  }
  @Input() set currencies(val: CurrencyView[]) {
    this.fiatCurrencies = val.filter(x => x.fiat === true);
    this.cryptoCurrencies = val.filter(x => x.fiat === false);
  }
  @Input() cancelable = false;
  @Output() save = new EventEmitter<User>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();
  @Output() formChanged = new EventEmitter<boolean>();

  USER_TYPE: typeof UserType = UserType;
  settingsId = '';
  email = '';
  address = '';
  user: UserItem | null | undefined;
  userType = UserType.Personal;
  loadingData = false;
  errorMessage = '';
  removable = false;
  countries = Countries;
  fiatCurrencies: CurrencyView[] = [];
  cryptoCurrencies: CurrencyView[] = [];
  riskLevels = RiskLevelViewList;
  totalBalance = '';
  kycProviderLink = '';
  kycDocs: string[] = [];

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
    risk: [RiskLevel.Medium, { validators: [Validators.required], updateOn: 'change' }],
    fiat: ['', { validators: [Validators.required], updateOn: 'change' }],
    crypto: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private adminService: AdminDataService) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(data: UserItem | null | undefined): void {
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
      this.dataForm.get('risk')?.setValue(data?.risk ?? RiskLevel.Medium);
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
      this.formChanged.emit(false);
    } else {
      this.dataForm.get('id')?.setValue('');
      this.dataForm.get('email')?.setValue('');
      this.dataForm.get('firstName')?.setValue('');
      this.dataForm.get('lastName')?.setValue('');
      this.dataForm.get('birthday')?.setValue('');
      this.dataForm.get('birthday')?.setValidators([]);
      this.dataForm.get('risk')?.setValue(RiskLevel.Medium);
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
      this.dataForm.get('fiat')?.setValue('');
      this.dataForm.get('crypto')?.setValue('');
    }
    this.dataForm.get('birthday')?.updateValueAndValidity();
  }

  private getUserKycInfo(id: string): void {
    this.subscriptions.add(
      this.adminService.getUserKycInfo(id).pipe(take(1)).subscribe(kyc => {
        this.kycDocs = kyc?.appliedDocuments?.map(doc => doc.code) ?? [];
      }));
  }

  private getUserState(id: string): void {
    this.subscriptions.add(
      this.adminService.getUserState(id).pipe(take(1)).subscribe(state => {
        this.kycProviderLink = state?.kycProviderLink ?? '';
        let balance = 0;
        state?.vaults?.forEach(x => {
          balance += x.totalBalanceEur ?? 0;
        });
        this.totalBalance = `${balance} EUR`;
      }));
  }

  private setCustomerData(): User {
    const code3 = this.dataForm.get('country')?.value;
    const country = getCountryByCode3(code3);
    const code2 = (country) ? country.code2 : '';
    const data = {
      userId: this.dataForm.get('id')?.value,
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
      defaultFiatCurrency: this.dataForm.get('fiat')?.value,
      defaultCryptoCurrency: this.dataForm.get('crypto')?.value,
      risk: this.dataForm.get('risk')?.value
    } as User;
    return data;
  }

  onDeleteCustomer(): void {
    this.delete.emit(this.settingsId);
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.save.emit(this.setCustomerData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onResetPassword(): void {
    this.save.emit({
      userId: this.settingsId,
      email: this.email,
      changePasswordRequired: true
    } as User);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
