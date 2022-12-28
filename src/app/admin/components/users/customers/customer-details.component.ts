import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DateFormatAdapter } from 'src/app/admin/misc/date-range/date-format.adapter';
import { DateParserFormatter } from 'src/app/admin/misc/date-range/date.formatter';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { AccountStatus, KycProvider, RiskLevel, UserInput, UserType } from 'src/app/model/generated-models';
import { CurrencyView, KycProviderList, RiskLevelViewList, UserModeView, UserStatusList } from 'src/app/model/payment.model';
import { GenderList, UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { getFormattedUtcDate } from 'src/app/utils/utils';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-admin-customer-details',
  templateUrl: 'customer-details.component.html',
  styleUrls: ['customer-details.component.scss', '../../../assets/scss/_validation.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: DateFormatAdapter },
    { provide: NgbDateParserFormatter, useClass: DateParserFormatter }
  ]
})
export class AdminCustomerDetailsComponent implements OnDestroy {
  @Input() permission = 0;
  @Input() set customer(val: UserItem | null | undefined) {
    this.setFormData(val);
    this.setCurrencies(this.pCurrencies);
  }
  @Input() set currencies(val: CurrencyView[]) {
    this.pCurrencies = val;
    this.setCurrencies(val);
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private pCurrencies: CurrencyView[] = [];
  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  disableInProgress = false;
  kycProviderLinkInProgress = false;
  errorMessage = '';
  USER_TYPE: typeof UserType = UserType;
  KYC_PROVIDER: typeof KycProvider = KycProvider;
  userData: UserItem | null | undefined = undefined;
  countries = Countries;
  fiatCurrencies: CurrencyView[] = [];
  cryptoCurrencies: CurrencyView[] = [];
  riskLevels = RiskLevelViewList;
  accountStatuses = UserStatusList;
  genders = GenderList;
  kycProviders = KycProviderList;
  kycProviderLink = '';
  kycDocs: string[] = [];
  tiers: CommonTargetValue[] = [];
  totalBalance = '';
  flag = false;
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
  disableButtonTitle = 'Disable';
  removable = false;

  dataForm = this.formBuilder.group({
    id: [''],
    email: ['', { validators: [Validators.required], updateOn: 'change' }],
    firstName: ['', { validators: [Validators.required], updateOn: 'change' }],
    lastName: ['', { validators: [], updateOn: 'change' }],
    birthday: [null, { validators: [], updateOn: 'change' }],
    gender: [undefined, { validators: [], updateOn: 'change' }],
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
    risk: [RiskLevel.Medium, { validators: [Validators.required], updateOn: 'change' }],
    kycProvider: [KycProvider.Local, { validators: [Validators.required], updateOn: 'change' }],
    tier: ['', { validators: [Validators.required], updateOn: 'change' }],
    fiat: ['', { validators: [Validators.required], updateOn: 'change' }],
    crypto: ['', { validators: [Validators.required], updateOn: 'change' }],
    comment: [undefined]
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private modalService: NgbModal,
    private adminService: AdminDataService) { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setCurrencies(list: CurrencyView[]): void {
    if (this.userData) {
      this.fiatCurrencies = list.filter(x => x.fiat === true);
      this.dataForm.get('fiat')?.setValue(this.userData?.fiatCurrency ?? '');
      this.cryptoCurrencies = list.filter(x => x.fiat === false);
      this.dataForm.get('crypto')?.setValue(this.userData.cryptoCurrency ?? '');
    }
  }

  private setFormData(data: UserItem | null | undefined): void {
    this.userData = data;
    this.errorMessage = '';
    this.dataForm.reset();
    if (data) {
      this.flag = data.flag == true;
      this.disableButtonTitle = (data.deleted) ? 'Enable' : 'Disable';
      this.dataForm.get('id')?.setValue(data?.id);
      this.dataForm.get('email')?.setValue(data?.email);
      this.dataForm.get('comment')?.setValue(data.comment);
      if (data.userType?.id === UserType.Merchant) {
        this.dataForm.get('firstName')?.setValue(data?.company);
        this.dataForm.get('lastName')?.setValue('');
        this.dataForm.get('birthday')?.setValue(null);
        this.dataForm.get('gender')?.setValue(undefined);
      } else {
        this.dataForm.get('firstName')?.setValue(data?.firstName);
        this.dataForm.get('lastName')?.setValue(data?.lastName);
        this.dataForm.get('gender')?.setValue(data?.gender);
        if (data?.birthday) {
          const b = `${data.birthday.getDate()}-${data.birthday.getMonth() + 1}-${data.birthday.getFullYear()}`;
          this.dataForm.get('birthday')?.setValue(b);
        } else {
          this.dataForm.get('birthday')?.setValue(null);
        }
      }
      this.dataForm.get('risk')?.setValue(data?.risk ?? RiskLevel.Medium);
      this.dataForm.get('accountStatus')?.setValue(data?.accountStatus ?? AccountStatus.Closed);
      this.dataForm.get('kycProvider')?.setValue(data?.kycProvider ?? KycProvider.Local);
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
    } else {
      this.dataForm.get('id')?.setValue('');
      this.dataForm.get('email')?.setValue('');
      this.dataForm.get('firstName')?.setValue('');
      this.dataForm.get('lastName')?.setValue('');
      this.dataForm.get('birthday')?.setValue(undefined);
      this.dataForm.get('gender')?.setValue(undefined);
      this.dataForm.get('risk')?.setValue(RiskLevel.Medium);
      this.dataForm.get('accountStatus')?.setValue(AccountStatus.Closed);
      this.dataForm.get('kycProvider')?.setValue(KycProvider.Local);
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
    const settingsId = data?.id ?? '';
    this.removable = (this.auth.user?.userId !== settingsId);
    if (data) {
      this.getUserKycInfo(settingsId);
      this.getUserState(settingsId);
      this.getUserKycTiers(settingsId);
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
    const genderId = this.dataForm.get('gender')?.value ?? undefined;
    const data = {
      email: this.dataForm.get('email')?.value,
      firstName: this.dataForm.get('firstName')?.value,
      lastName: this.dataForm.get('lastName')?.value,
      birthday: getFormattedUtcDate(this.dataForm.get('birthday')?.value ?? '', '-'),
      gender: (genderId !== '') ? genderId : undefined,
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
      accountStatus: this.dataForm.get('accountStatus')?.value,
      kycTierId: tierId,
      kycProvider: this.dataForm.get('kycProvider')?.value,
      comment: this.dataForm.get('comment')?.value,
      flag: this.flag
    } as UserInput;
    return data;
  }

  flagText(): String {
    return this.flag == true ? 'Unflag' : 'Flag';
  }

  flagValue(): void {
    this.flag = this.flag != true;
    if (this.dataForm.valid) {
      this.onSave(this.userData?.id ?? '', this.setCustomerData(), undefined);
    }
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }

  onKycProviderLink(): void {
    this.kycProviderLinkInProgress = true;
    this.subscriptions.add(
      this.adminService.getVerificationLink(this.userData?.id ?? '').valueChanges.subscribe(({ data }) => {
        this.kycProviderLinkInProgress = false;
        if (data) {
          if (data.getVerificationLink) {
            this.router.navigate([]).then((result) => {
              window.open(data.getVerificationLink, '_blank');
            });
          }
        }
      }, (error) => {
        this.kycProviderLinkInProgress = false;
        if (error) {
          this.errorMessage = error;
        } else {
          this.errorMessage = this.errorHandler.getCurrentErrorMessage();
        }
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.dataForm.valid) {
      this.onSave(this.userData?.id ?? '', this.setCustomerData(), undefined);
    }
  }

  onResetPassword(content: any): void {
    this.onSave(this.userData?.id ?? '', {
      email: this.userData?.email ?? '',
      changePasswordRequired: true
    } as UserInput,
      content);
  }

  onDeleteCustomer(content: any): void {
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
    const requestData$ = this.adminService.saveCustomer(id, customer);
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

  onClose(): void {
    this.close.emit();
  }
}
