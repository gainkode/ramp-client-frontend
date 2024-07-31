import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
	NgbDateAdapter,
	NgbDateParserFormatter,
	NgbDateStruct,
	NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { DateFormatAdapter } from 'admin/misc/date-range/date-format.adapter';
import { DateParserFormatter } from 'admin/misc/date-range/date.formatter';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { Countries, getCountryByCode3 } from 'model/country-code.model';
import {
	AccountStatus,
	KycProvider,
	RiskLevel,
	UserInput,
	UserType,
} from 'model/generated-models';
import {
	CurrencyView,
	KycProviderList,
	RiskLevelViewList,
	UserStatusList,
} from 'model/payment.model';
import { GenderList, UserItem } from 'model/user.model';
import { Observable, Subject, Subscription, concat, map, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, take, tap } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { getFormattedUtcDate } from 'utils/utils';

@Component({
	selector: 'app-admin-customer-details',
	templateUrl: './customer-details.component.html',
	styleUrls: [
		'customer-details.component.scss',
		'../../../../assets/scss/_validation.scss',
	],
	providers: [
		{ provide: NgbDateAdapter, useClass: DateFormatAdapter },
		{ provide: NgbDateParserFormatter, useClass: DateParserFormatter },
	],
})
export class AdminCustomerDetailsComponent implements OnInit, OnDestroy {
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
  flagInProgress = false;
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
	usersOptions$: Observable<CommonTargetValue[]> = of([]);
	minUsersLengthTerm = 1;
	isUsersLoading = false;

	usersSearchInput$ = new Subject<string>();
  minBirthdayDate: NgbDateStruct = {
  	year: 1900,
  	month: 1,
  	day: 1,
  };
  maxBirthdayDate: NgbDateStruct = {
  	year: new Date().getFullYear() - 17,
  	month: 1,
  	day: 1,
  };
  disableButtonTitle = 'Disable';
  removable = false;
  adminAdditionalSettings: Record<string, any> = {};

  dataForm = this.formBuilder.group({
  	id: [''],
  	email: ['', { validators: [Validators.required], updateOn: 'change' }],
  	firstName: ['', { validators: [], updateOn: 'change' }],
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
  	accountStatus: [
  		AccountStatus.Closed,
  		{ validators: [Validators.required], updateOn: 'change' },
  	],
  	risk: [
  		RiskLevel.Medium,
  		{ validators: [Validators.required], updateOn: 'change' },
  	],
  	kycProvider: [
  		KycProvider.Local,
  		{ validators: [Validators.required], updateOn: 'change' },
  	],
  	tier: ['', { validators: [Validators.required], updateOn: 'change' }],
  	fiat: ['', { validators: [Validators.required], updateOn: 'change' }],
  	crypto: ['', { validators: [Validators.required], updateOn: 'change' }],
  	comment: ['', { validators: [], updateOn: 'change' }],
  	company: ['', { validators: [], updateOn: 'change' }],
  	widgetId: [undefined],
		affiliate: [undefined],
  });
  widgetOptions$: Observable<CommonTargetValue[]>;

	get isMerchant(): boolean {
		return this.userData?.userType.id === UserType.Merchant;
	}
  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	public auth: AuthService,
  	private errorHandler: ErrorService,
  	private modalService: NgbModal,
  	private adminService: AdminDataService
  ) {}

  ngOnInit(): void {
		this.initUserSearch();
  	this.loadCommonSettings();
  	this.widgetOptions$ = this.getFilteredWidgets();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private getFilteredWidgets(): Observable<CommonTargetValue[]> {
  	return this.adminService.getWidgets(0, 100, 'name', false, <Filter>{}).pipe(
  		map(result => result.list.map(widget => ({
  			id: widget.id,
  			title: widget.name
  		} as CommonTargetValue)))
  	);
  }
  widgetSearchFn(term: string, item: CommonTargetValue): boolean {
  	term = term.toLocaleLowerCase();
  	return item.title.toLocaleLowerCase().indexOf(term) > -1 ||
		item.id && item.id.toLocaleLowerCase().indexOf(term) > -1;
  }
	
  private setCurrencies(list: CurrencyView[]): void {
  	if (this.userData) {
  		this.fiatCurrencies = list.filter((x) => x.fiat === true);
  		this.dataForm.get('fiat')?.setValue(this.userData?.fiatCurrency ?? '');
  		this.cryptoCurrencies = list.filter((x) => x.fiat === false);
  		this.dataForm.get('crypto')?.setValue(this.userData.cryptoCurrency ?? '');
  	}
  }

  private loadCommonSettings(): void {
  	const settingsCommon = this.auth.getLocalSettingsCommon();
  	if (settingsCommon) {
  		this.adminAdditionalSettings =
        typeof settingsCommon.adminAdditionalSettings == 'string'
        	? JSON.parse(settingsCommon.adminAdditionalSettings)
        	: settingsCommon.adminAdditionalSettings;
  		this.kycProviders = this.kycProviders.filter(
  			(item) => this.adminAdditionalSettings.kycProviders[item.id] === true
  		);
  	}
  }
  private setFormData(data: UserItem | null | undefined): void {
  	this.userData = data;
  	this.errorMessage = '';
  	this.dataForm.reset();
  	if (data) {
  		this.flag = data.flag === true;
  		this.disableButtonTitle = data.deleted ? 'Enable' : 'Disable';
  		this.dataForm.get('id')?.setValue(data?.id);
  		this.dataForm.get('email')?.setValue(data?.email);
  		this.dataForm.get('comment')?.setValue(data.comment);

  		if(data.widgetId) {
  			this.dataForm.get('widgetId')?.setValue(data.widgetId);
  		}

			if(data.affiliateId) {
				this.setAffilate(data.affiliateId);
  			// this.dataForm.get('affiliate')?.setValue(data.affiliateId);
  		}

  		if (data.userType?.id === UserType.Merchant) {
  			this.dataForm.get('company')?.setValue(data?.company);
  			this.dataForm.get('firstName')?.setValue(data?.company);
  			this.dataForm.get('lastName')?.setValue('');
  			this.dataForm.get('birthday')?.setValue(null);
  			this.dataForm.get('gender')?.setValue(undefined);
  		} else {
  			this.dataForm.get('firstName')?.setValue(data?.firstName);
  			this.dataForm.get('lastName')?.setValue(data?.lastName);
  			this.dataForm.get('gender')?.setValue(data?.gender);
  			if (data?.birthday) {
  				const b = `${data.birthday.getDate()}-${
  					data.birthday.getMonth() + 1
  				}-${data.birthday.getFullYear()}`;
  				this.dataForm.get('birthday')?.setValue(b);
  			} else {
  				this.dataForm.get('birthday')?.setValue(null);
  			}
  		}
  		this.dataForm.get('risk')?.setValue(data?.risk ?? RiskLevel.Medium);
  		this.dataForm
  			.get('accountStatus')
  			?.setValue(data?.accountStatus ?? AccountStatus.Closed);
  		this.dataForm
  			.get('kycProvider')
  			?.setValue(data?.kycProvider ?? KycProvider.Local);
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
  		this.dataForm.get('widgetId')?.setValue(undefined);
			this.dataForm.get('affiliate')?.setValue(undefined);
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
  	this.removable = this.auth.user?.userId !== settingsId;
  	if (data) {
  		this.getUserKycInfo(settingsId);
  		this.getUserState(settingsId);
  		this.getUserKycTiers(settingsId);
  	}
  }

  private getUserKycInfo(id: string): void {
  	this.subscriptions.add(
  		this.adminService
  			.getUserKycInfo(id)
  			.pipe(take(1))
  			.subscribe((kyc) => {
  				this.kycDocs = kyc?.appliedDocuments?.map((doc) => doc.code) ?? [];
  			})
  	);
  }

  private getUserKycTiers(id: string): void {
  	this.tiers = [];
  	this.subscriptions.add(
  		this.adminService
  			.getSettingsKycTiers(id)
  			.pipe(take(1))
  			.subscribe((data) => {
  				this.tiers = data?.list?.map((tier) => {
  					return {
  						id: tier.settingsKycTierId,
  						title: tier.name,
  					} as CommonTargetValue;
  				}) ?? [];
  			})
  	);
  }

  private getUserState(id: string): void {
  	this.subscriptions.add(
  		this.adminService
  			.getUserState(id)
  			.pipe(take(1))
  			.subscribe((state) => {
  				this.kycProviderLink = state?.kycProviderLink ?? '';
  				let balance = 0;
  				state?.vaults?.forEach((x) => {
  					balance += x.totalBalanceEur ?? 0;
  				});
  				this.totalBalance = `${balance} EUR`;
  			})
  	);
  }

  private setCustomerData(): UserInput {
  	const code3 = this.dataForm.get('country')?.value;
  	const country = getCountryByCode3(code3);
  	const code2 = country ? country.code2 : '';
  	const tierName = this.dataForm.get('tier')?.value;
  	const tierId = this.tiers.find((x) => x.title === tierName)?.id;
  	const genderId = this.dataForm.get('gender')?.value ?? undefined;
  	const data = {
  		email: this.dataForm.get('email')?.value,
  		firstName: this.dataForm.get('firstName')?.value,
  		lastName: this.dataForm.get('lastName')?.value,
  		birthday: getFormattedUtcDate(
  			this.dataForm.get('birthday')?.value ?? '',
  			'-'
  		),
  		gender: genderId !== '' ? genderId : undefined,
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
  		companyName: this.dataForm.get('company')?.value,
  		flag: this.flag,
  		widgetId: this.dataForm.get('widgetId')?.value,
			affiliateId: this.dataForm.get('affiliate')?.value
  	} as UserInput;
  	return data;
  }

  flagText(): String {
  	return this.flag ? 'Unflag' : 'Flag';
  }

  flagValue(): void {
  	this.flagInProgress = true;
  	this.flag = this.flag !== true;
  	this.saveInProgress = true;
  	if (this.userData?.id) {
  		const requestData$ = this.adminService.updateUserFlag(
  			this.flag,
  			this.userData.id
  		);
  		this.subscriptions.add(
  			requestData$.pipe(finalize(() => {
  				this.saveInProgress = false;
  				this.flagInProgress = false;
  			})).subscribe({
  				next: () => this.save.emit(),
  				error: (errorMessage) => {
  					this.errorMessage = errorMessage;
  					this.navigateToHome();
  				} 
  			})
  		);
  	}
  }

  getCountryFlag(code: string): string {
  	return `${code.toLowerCase()}.svg`;
  }

  onKycProviderLink(): void {
  	this.kycProviderLinkInProgress = true;
	  this.subscriptions.add(
  		this.adminService.getVerificationLink(this.userData?.id ?? '').valueChanges.
  			pipe(finalize(() => this.kycProviderLinkInProgress = false))
  			.subscribe({
  				next: ({ data }) => {
						this.kycProviderLinkInProgress = false;
  					if (data?.getVerificationLink) {
							void this.router.navigate([]).then(() => window.open(data?.getVerificationLink, '_blank'));
  					}else{
							this.errorMessage = this.errorHandler.getCurrentErrorMessage();
  						this.navigateToHome();
						}
  				},
  				error: (errorMessage) => {
						this.kycProviderLinkInProgress = false;
  					this.errorMessage = errorMessage ?? this.errorHandler.getCurrentErrorMessage();
  					this.navigateToHome();
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
  	this.onSave(
  		this.userData?.id ?? '',
  		{
  			email: this.userData?.email ?? '',
  			changePasswordRequired: true,
  		} as UserInput,
  		content
  	);
  }

  onDeleteCustomer(content: any): void {
  	const dialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  	this.subscriptions.add(
  		dialog.closed.subscribe(() => {
  			if (this.userData?.deleted ?? false) {
  				this.onRestore(this.userData?.id ?? '');
  			} else {
  				this.onDelete(this.userData?.id ?? '');
  			}
  		})
  	);
  }

	private initUserSearch(): void {
  	this.usersOptions$ = concat(
  		of([]),
  		this.usersSearchInput$.pipe(
  			filter(res => {
  				return res !== null && res.length >= this.minUsersLengthTerm;
  			}),
  			debounceTime(300),
  			distinctUntilChanged(),
  			tap(() => {
  				this.isUsersLoading = true;
  			}),
  			switchMap(searchString => {
  				this.isUsersLoading = false;
  				return this.adminService.findUsers(new Filter({
  					search: searchString,
  					accountTypes: [UserType.Merchant]
  				})).pipe(map(result => result.list.map(user => ({
						id: user.id,
						title: user.email
					} as CommonTargetValue))));
  			})
  		));
  }

	private setAffilate(affilateId: string): void {
		this.adminService.findUsers(new Filter({
			users: [affilateId]
		}))
		.pipe(map(result => result.list.map(user => ({
			id: user.id,
			title: user.email
		} as CommonTargetValue))))
		.subscribe(result => {
			this.usersOptions$ = of(result);
			this.dataForm.get('affiliate')?.patchValue(affilateId);
		});
	}
  private onSave(id: string, customer: UserInput, content: any): void {
  	this.saveInProgress = true;
  	const requestData$ = this.adminService.saveCustomer(id, customer);
  	
  	this.subscriptions.add(
  		requestData$.pipe(finalize(() => {
  			this.saveInProgress = false;
  			this.flagInProgress = false;
  		})).subscribe({
  				next: () => {
  					if (customer.changePasswordRequired) {
  						this.modalService.open(content, {
  							backdrop: 'static',
  							windowClass: 'modalCusSty',
  						});
  					} else {
  						if (this.auth.user?.userId === id) {
  							this.auth.setUserName(
  								customer.firstName ?? '',
  								customer.lastName ?? ''
  							);
  							this.auth.setUserCurrencies(
  								customer.defaultCryptoCurrency ?? 'BTC',
  								customer.defaultFiatCurrency ?? 'EUR'
  							);
  						}
  					}
  					this.save.emit();
  				},
  				error: (errorMessage) => {
  					this.errorMessage = errorMessage;
  					this.navigateToHome();
  				} 
  			})
  	);
  }

  private onDelete(id: string): void {
  	this.disableInProgress = true;
  	const requestData$ = this.adminService.deleteCustomer(id);
	
  	this.subscriptions.add(
  		requestData$.pipe(finalize(() => this.disableInProgress = false))
  			.subscribe({
  				next: () => this.save.emit(),
  				error: (errorMessage) => {
  					this.errorMessage = errorMessage;
  					this.navigateToHome();
  				} 
  			})
  	);
  }

  private onRestore(id: string): void {
  	this.disableInProgress = true;
  	const requestData$ = this.adminService.restoreCustomer(id);

  	this.subscriptions.add(
  		requestData$.pipe(finalize(() => this.disableInProgress = false))
  			.subscribe({
  				next: () => this.save.emit(),
  				error: (errorMessage) => {
  					this.errorMessage = errorMessage;
  					this.navigateToHome();
  				} 
  			})
  	);
  }

  private navigateToHome(): void {
  	if (this.auth.token === '') {
  		void this.router.navigateByUrl('/');
  	}
  }

  onClose(): void {
  	this.close.emit();
  }
}
