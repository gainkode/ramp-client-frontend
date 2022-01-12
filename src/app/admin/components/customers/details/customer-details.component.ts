import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { User, UserType } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: 'customer-details.component.html',
  styleUrls: ['customer-details.component.scss']
})
export class CustomerDetailsComponent {
  @Input() set customer(val: UserItem | null | undefined) {
    this.setFormData(val);
    this.settingsId = (val) ? val?.id : '';
    this.removable = (this.auth.user?.userId !== this.settingsId);
    this.address = (val) ? val.address : '';
    this.userType = (val) ? val.userType?.id ?? UserType.Personal : UserType.Personal;
    this.kycProviderLink = (val) ? val.kycProviderLink : '';
    this.user = val;
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
  kycProviderLink = '';
  user: UserItem | null | undefined;
  userType = UserType.Personal;
  loadingData = false;
  errorMessage = '';
  removable = false;
  countries = Countries;
  fiatCurrencies: CurrencyView[] = [];
  cryptoCurrencies: CurrencyView[] = [];

  dataForm = this.formBuilder.group({
    id: [''],
    email: ['', { validators: [Validators.required], updateOn: 'change' }],
    firstName: ['', { validators: [Validators.required], updateOn: 'change' }],
    lastName: ['', { validators: [], updateOn: 'change' }],
    country: ['', { validators: [Validators.required], updateOn: 'change' }],
    phone: ['', { validators: [], updateOn: 'change' }],
    fiat: ['', { validators: [Validators.required], updateOn: 'change' }],
    crypto: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService) {
  }

  setFormData(data: UserItem | null | undefined): void {
    this.errorMessage = '';
    this.dataForm.reset();
    if (data) {
      this.loadingData = true;
      this.dataForm.get('id')?.setValue(data?.id);
      this.dataForm.get('email')?.setValue(data?.email);
      if (data.userType?.id === UserType.Merchant) {
        this.dataForm.get('firstName')?.setValue(data?.company);
        this.dataForm.get('lastName')?.setValue('');
      } else {
        this.dataForm.get('firstName')?.setValue(data?.firstName);
        this.dataForm.get('lastName')?.setValue(data?.lastName);
      }
      this.dataForm.get('country')?.setValue(data?.country?.id);
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
      this.dataForm.get('country')?.setValue('');
      this.dataForm.get('phone')?.setValue('');
      this.dataForm.get('fiat')?.setValue('');
      this.dataForm.get('crypto')?.setValue('');
    }
  }

  setCustomerData(): User {
    const code3 = this.dataForm.get('country')?.value;
    const country = getCountryByCode3(code3);
    const code2 = (country) ? country.code2 : '';
    const data = {
      userId: this.dataForm.get('id')?.value,
      email: this.dataForm.get('email')?.value,
      firstName: this.dataForm.get('firstName')?.value,
      lastName: this.dataForm.get('lastName')?.value,
      countryCode2: code2,
      countryCode3: code3,
      phone: this.dataForm.get('phone')?.value,
      defaultFiatCurrency: this.dataForm.get('fiat')?.value,
      defaultCryptoCurrency: this.dataForm.get('crypto')?.value
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

  onCancel(): void {
    this.cancel.emit();
  }
}



/**
 riskCodes,
 widgetId,
 widgetCode,
 affiliateId,
 affiliateCode
 */