import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { RiskLevel, User, UserInput, UserType } from 'src/app/model/generated-models';
import { CurrencyView, RiskLevelViewList } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/admin/services/admin-data.service';
import { take } from 'rxjs/operators';
import { getFormattedUtcDate } from 'src/app/utils/utils';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { Router } from '@angular/router';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
  selector: 'app-customer-details',
  templateUrl: 'customer-details.component.html',
  styleUrls: ['customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnDestroy {
  @Input() set customer(val: UserItem | null | undefined) {
    this.setFormData(val);
    this.setCurrencies(this.pCurrencies);
    this.layoutService.setBackdrop(!val?.id);
  }
  @Input() set currencies(val: CurrencyView[]) {
    this.pCurrencies = val;
    this.setCurrencies(val);
  }
  @Input() cancelable = false;
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  data: UserItem | null | undefined
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
  tiers: CommonTargetValue[] = [];

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
    tier: ['', { validators: [Validators.required], updateOn: 'change' }],
    fiat: ['', { validators: [Validators.required], updateOn: 'change' }],
    crypto: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  private subscriptions: Subscription = new Subscription();
  private pCurrencies: CurrencyView[] = [];

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

  private setCurrencies(list: CurrencyView[]): void {
    if (this.data) {
      this.fiatCurrencies = list.filter(x => x.fiat === true);
      this.dataForm.get('fiat')?.setValue(this.data?.fiatCurrency ?? '');
      this.cryptoCurrencies = list.filter(x => x.fiat === false);
      this.dataForm.get('crypto')?.setValue(this.data.cryptoCurrency ?? '');
    }
  }

  private setFormData(data: UserItem | null | undefined): void {
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
      this.dataForm.get('risk')?.setValue(data?.risk ?? RiskLevel.Medium);
      this.dataForm.get('tier')?.setValue(data?.kycLevel);
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
      this.dataForm.get('id')?.setValue('');
      this.dataForm.get('email')?.setValue('');
      this.dataForm.get('firstName')?.setValue('');
      this.dataForm.get('lastName')?.setValue('');
      this.dataForm.get('birthday')?.setValue('');
      this.dataForm.get('birthday')?.setValidators([]);
      this.dataForm.get('risk')?.setValue(RiskLevel.Medium);
      this.dataForm.get('tier')?.setValue('');
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
    this.settingsId = (data) ? data?.id : '';
    this.email = (data) ? data?.email : '';
    this.removable = (this.auth.user?.userId !== this.settingsId);
    this.address = (data) ? data.address : '';
    this.userType = (data) ? data.userType?.id ?? UserType.Personal : UserType.Personal;
    this.user = data;
    if (data) {
      this.getUserKycInfo(this.settingsId);
      this.getUserState(this.settingsId);
      this.getUserKycTiers(this.settingsId);
    }
  }

  private getUserKycInfo(id: string): void {
    this.subscriptions.add(
      this.adminService.getUserKycInfo(id).pipe(take(1)).subscribe(kyc => {
        this.kycDocs = kyc?.appliedDocuments?.map(doc => doc.code) ?? [];
      }));
  }

  private getUserKycTiers(id: string): void {
    this.tiers = [];
    this.subscriptions.add(
      this.adminService.getSettingsKycTiers(id).pipe(take(1)).subscribe(data => {
        this.tiers = data?.list?.map(tier => {
          return {
            id: tier.settingsKycTierId,
            title: tier.name
          } as CommonTargetValue;
        }) ?? [];
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

  private setCustomerData(): UserInput {
    const code3 = this.dataForm.get('country')?.value;
    const country = getCountryByCode3(code3);
    const code2 = (country) ? country.code2 : '';
    const tierName = this.dataForm.get('tier')?.value;
    const tierId = this.tiers.find(x => x.title === tierName)?.id;
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
      defaultFiatCurrency: this.dataForm.get('fiat')?.value,
      defaultCryptoCurrency: this.dataForm.get('crypto')?.value,
      risk: this.dataForm.get('risk')?.value,
      kycTierId: tierId
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

  onDeleteCustomer(): void {
    this.onDelete(this.settingsId);
  }

  onSave(id: string, customer: UserInput): void {
    const requestData$ = this.adminService.saveCustomer(id, customer);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        if (customer.changePasswordRequired === true) {
          this.dialog.open(CommonDialogBox, {
            width: '450px',
            data: {
              title: 'Reset password',
              message: 'Password has been reset successfully'
            }
          });
        } else {
          if (this.auth.user?.userId === id) {
            this.auth.setUserName(customer.firstName ?? '', customer.lastName ?? '');
            this.auth.setUserCurrencies(
              customer.defaultCryptoCurrency ?? 'BTC',
              customer.defaultFiatCurrency ?? 'EUR');
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
      this.onSave(this.settingsId, this.setCustomerData());
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
