import { Component, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Filter } from 'admin/model/filter.model';
import { RiskAlertCodeList } from 'admin/model/lists.model';
import { EmptyObject } from 'apollo-angular/types';
import { CommonTargetValue } from 'model/common.model';
import { Countries } from 'model/country-code.model';
import { SettingsKycTier, UserFilter } from 'model/generated-models';
import { CurrencyView, KycStatusList, PaymentInstrumentList, RiskLevelViewList, TransactionKycStatusList, TransactionSourceList, TransactionStatusList, TransactionTypeList, UserActionTypeList, UserModeList, UserNotificationCodeList, UserStatusList, UserTypeList } from 'model/payment.model';
import { Observable, Subject, concat, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { AdminDateRangeComponent } from '../date-range/date-range.component';

interface FilterField {
	name: string;
	value: string;
	groupName: GroupFieldName;
}

enum GroupFieldName {
	Transaction = 'Transaction',
	Widget = 'Widget',
	User = 'User',
	Payment = 'Payment',
	None = 'None'
}

const defaultFilterFields: FilterField[] = [
	{ name: 'Notification type', value: 'notificationType', groupName: GroupFieldName.None },
	{ name: 'Account type', value: 'accountType', groupName: GroupFieldName.User },
	{ name: 'Account mode', value: 'accountMode', groupName: GroupFieldName.User },
	{ name: 'Account status', value: 'accountStatus', groupName: GroupFieldName.User },
	{ name: 'Country', value: 'country', groupName: GroupFieldName.User },
	{ name: 'Source', value: 'source', groupName: GroupFieldName.Widget },
	{ name: 'DocsCheck Statuses', value: 'kycStatus', groupName: GroupFieldName.User },
	{ name: 'DocsCheck Statuses', value: 'transactionKycStatus', groupName: GroupFieldName.User },
	{ name: 'Risk Levels', value: 'riskLevel', groupName: GroupFieldName.None },
	{ name: 'Fiat currency', value: 'fiatCurrency', groupName: GroupFieldName.Widget },
	{ name: 'Transaction Types', value: 'transactionType', groupName: GroupFieldName.Transaction },
	{ name: 'User Actions Types', value: 'transactionType', groupName: GroupFieldName.User },
	{ name: 'Verification Levels', value: 'tier', groupName: GroupFieldName.User },
	{ name: 'Transaction ID', value: 'transactionIds', groupName: GroupFieldName.Transaction },
	{ name: 'Transaction Statuses', value: 'transactionStatus', groupName: GroupFieldName.Transaction },
	{ name: 'Payment methods', value: 'paymentInstrument', groupName: GroupFieldName.Payment },
	{ name: 'Transactions created', value: 'createdDate', groupName: GroupFieldName.Transaction },
	{ name: 'User action created', value: 'createdDateAction', groupName: GroupFieldName.User },
	{ name: 'Transactions completed', value: 'completedDate', groupName: GroupFieldName.Transaction },
	{ name: 'Transactions updated', value: 'updatedDate', groupName: GroupFieldName.Transaction },
	{ name: 'Registered', value: 'registrationDate', groupName: GroupFieldName.User },
	{ name: 'User', value: 'user', groupName: GroupFieldName.User },
	{ name: 'Customer search', value: 'users', groupName: GroupFieldName.User },
	{ name: 'Widget Identifiers', value: 'widget', groupName: GroupFieldName.Widget },
	{ name: 'Widget Names', value: 'widgetName', groupName: GroupFieldName.Widget },
	{ name: 'Risk Alert Code', value: 'riskAlertCode', groupName: GroupFieldName.None },
	{ name: 'Wallet address', value: 'walletAddress', groupName: GroupFieldName.Payment },
	{ name: 'Buy volume over', value: 'totalBuyVolume', groupName: GroupFieldName.User },
	{ name: 'Verify When Paid', value: 'verifyWhenPaid', groupName: GroupFieldName.Widget },
	{ name: 'Flag', value: 'transactionFlag', groupName: GroupFieldName.Transaction },
	{ name: 'Transaction Was Ever Completed', value: 'transactionWasEverCompleted', groupName: GroupFieldName.Transaction },
	{ name: 'Preauth', value: 'preauthFlag', groupName: GroupFieldName.Payment },
	{ name: 'Hide zero balance', value: 'zeroBalance', groupName: GroupFieldName.None },
	{ name: 'Has recall number', value: 'hasRecallNumber', groupName: GroupFieldName.Payment },
	{ name: 'Recall number ', value: 'recallNumber', groupName: GroupFieldName.Payment },
	{ name: 'Has reversal processed', value: 'isReversalProcessed', groupName: GroupFieldName.Payment },
];

@Component({
	selector: 'app-admin-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss']
})
export class AdminFilterComponent implements OnInit, OnDestroy {
	@Input() fields: Array<string> = [];
	@Input() filterType: string;
	@Input() filterData: Filter | undefined = undefined;
	@Input() currencies: Array<CurrencyView> = [];
	@Input() fiatCurrencies: Array<CurrencyView> = [];
	@Input() isFilterCollapsed = true;
	@Output() get filter(): Observable<Filter> {
		return this.filterSubject.asObservable();
	}
	@ViewChild('created_filter') createFilterPicker!: AdminDateRangeComponent;
	@ViewChild('completed_filter') completeFilterPicker!: AdminDateRangeComponent;
	@ViewChild('registered_filter') registerFilterPicker!: AdminDateRangeComponent;
	@ViewChild('updated_filter') updateFilterPicker!: AdminDateRangeComponent;

	private filterSubject = new Subject<Filter>();

	sourceOptions = TransactionSourceList;
	riskLevelsOptions = RiskLevelViewList;
	paymentInstrumentsOptions = PaymentInstrumentList;
	userTypeOptions = UserTypeList;
	notificationTypeOptions = UserNotificationCodeList;
	userModeOptions = UserModeList;
	userStatusOptions = UserStatusList;
	transactionTypeOptions = TransactionTypeList;
	userActionTypeOptions = UserActionTypeList;
	transactionStatusOptions = TransactionStatusList;
	kysStatusOptions = KycStatusList;
	transactionKysStatusOptions = TransactionKycStatusList;
	countryOptions = Countries;
	riskAlertOptions = RiskAlertCodeList;
	filterForm?: UntypedFormGroup;
	isTierLoading = false;
	isUsersLoading = false;
	isWidgetsLoading = false;
	isFiltersUdating = false;
	tierSearchInput$ = new Subject<string>();
	usersSearchInput$ = new Subject<string>();
	widgetsSearchInput$ = new Subject<string>();
	widgetNamesSearchInput$ = new Subject<string>();
	tierOptions$: Observable<CommonTargetValue[]> = of([]);
	usersOptions$: Observable<CommonTargetValue[]> = of([]);
	widgetsOptions$: Observable<CommonTargetValue[]> = of([]);
	widgetNamesOptions$: Observable<CommonTargetValue[]> = of([]);
	minUsersLengthTerm = 1;
	minWidgetsLengthTerm = 1;
	minWidgetNamesLengthTerm = 1;
	isPlainSearch = false;
	adminAdditionalSettings: Record<string, any> = {};

	originFields: string[] = [];
	filteredFields: string[] = [];
	filteredFieldsList: FilterField[] = [];
	filteredField = new FormControl();
	isFilterSelected = false;

	private readonly destroy$ = new Subject<void>();
	constructor(
		private formBuilder: UntypedFormBuilder,
		private auth: AuthService,
		private adminDataService: AdminDataService) {
	}

	ngOnInit(): void {
		this.loadCommonSettings();
		this.initForm();
		this.proceedFilters();
		
		this.originFields = this.fields;

		this.isPlainSearch = this.originFields.includes('search');
		this.fields = this.fields.filter(field => field !== 'search'); 

		if (this.fields.includes('tier')) {
			this.tierSearch();
		}
		if (this.fields.includes('user') || this.fields.includes('users')) {
			this.usersSearch();
		}
		if (this.fields.includes('widget')) {
			this.widgetsSearch();
		}
		if (this.fields.includes('widgetName')) {
			this.widgetNamesSearch();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
	}

	private proceedFilters(): void {
		/* Exclude filteredFields from fields list */
		const filterFieldsList = (): void => {
			this.filteredFieldsList = this.filteredFieldsList.filter(item => !this.filteredFields.includes(item.value));
		};

		/* Parse init fields, and map create list with FilterField interface */
		this.fields.forEach(field => {
			const parsedField = defaultFilterFields.find(defaultField => defaultField.value === field);
			if (parsedField) {
				this.filteredFieldsList.push(parsedField);
			}
		});

		/* Get user filters, if they are exists then assign them to current filteredFields */
		if (this.auth.user?.filters && this.auth.user?.filters[this.filterType]) {
			this.filteredFields = this.auth.user?.filters[this.filterType];
			filterFieldsList();
		} else if (this.filterType === 'dashboard') {
			/*If no filters found and its dashboard pre-set updatedDate filter and remove form the list */
			this.filteredFields = ['updatedDate'];
			this.filteredFieldsList = this.filteredFieldsList.filter(item => item.value !== 'updatedDate');
		}
		/* Subrcribe to filteredField, in case of found parsedField add to filteredFields and remove from the list*/
		this.filteredField.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((value: string) => {
				if (value) {
					const parsedField = defaultFilterFields.find(defaultField => defaultField.value === value);

					if (parsedField) {
						this.filteredFields.push(parsedField.value);
						filterFieldsList();
						this.isFilterSelected = false;
					}
				}
			});
	}

	private loadCommonSettings(): void {
		const settingsCommon = this.auth.getLocalSettingsCommon();
		
		if (settingsCommon) {
			this.adminAdditionalSettings = typeof settingsCommon.adminAdditionalSettings == 'string' ? JSON.parse(settingsCommon.adminAdditionalSettings) : settingsCommon.adminAdditionalSettings;
			if (this.adminAdditionalSettings) {
				this.userModeOptions = this.userModeOptions.filter(item => this.adminAdditionalSettings?.userMode[item.id]);
				this.userTypeOptions = this.userTypeOptions.filter(item => this.adminAdditionalSettings?.userType[item.id]);
				this.paymentInstrumentsOptions = this.paymentInstrumentsOptions.filter(item => this.adminAdditionalSettings.paymentMethods[item.id]);
				this.transactionTypeOptions = this.transactionTypeOptions.filter(item => this.adminAdditionalSettings.transactionType[item.id]);
			}
		}
	}

	private tierSearch(): void {
		this.isTierLoading = true;
		this.tierOptions$ = this.adminDataService.getSettingsKycTiers('').pipe(
			map(settings => {
				this.isTierLoading = false;
				if (settings.count > 0) {
					const rawTiers = [...settings.list];
					return (rawTiers
						.sort((a, b) => this.tierSortHandler(a, b))
						.map(tier => {
							return {
								id: tier.settingsKycTierId,
								title: tier.name
							} as CommonTargetValue;
						}));
				} else {
					return [];
				}
			})
		);
	}

	private tierSortHandler(a: SettingsKycTier, b: SettingsKycTier): number {
		if (a.name > b.name) {
			return 1;
		} else if (a.name < b.name) {
			return -1;
		}
		return 0;
	}

	private usersSearch(): void {
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
					return this.adminDataService.getUsers(
						[],
						0,
						100,
						'email',
						false,
						new Filter({ search: searchString })
					).pipe(map(result => {
						return result.list.map(x => {
							return {
								id: x.id,
								title: (x.fullName !== '') ? `${x.fullName} (${x.email})` : x.email
							} as CommonTargetValue;
						});
					}));
				})
			));
	}

	private widgetsSearch(): void {
		this.widgetsOptions$ = concat(
			of([]),
			this.widgetsSearchInput$.pipe(
				filter(res => {
					return res !== null && res.length >= this.minWidgetsLengthTerm;
				}),
				debounceTime(300),
				distinctUntilChanged(),
				tap(() => {
					this.isWidgetsLoading = true;
				}),
				switchMap(searchString => {
					this.isWidgetsLoading = false;
					return this.adminDataService.getWidgetIds(searchString, 0, 100, 'code', false)
						.pipe(map(result => {
							return result.list.map(x => {
								return {
									id: x.id,
									title: x.code ?? x.id
								} as CommonTargetValue;
							});
						}));
				})
			));
	}

	private widgetNamesSearch(): void {
		this.widgetNamesOptions$ = concat(
			of([]),
			this.widgetNamesSearchInput$.pipe(
				filter(res => {
					return res !== null && res.length >= this.minWidgetNamesLengthTerm;
				}),
				debounceTime(300),
				distinctUntilChanged(),
				tap(() => {
					this.isWidgetsLoading = true;
				}),
				switchMap(searchString => {
					this.isWidgetsLoading = false;
					return this.adminDataService.getWidgetIds(searchString, 0, 100, 'name', false)
						.pipe(map(result => {
							return result.list.map(x => {
								return {
									id: x.id,
									title: x.name ?? x.id
								} as CommonTargetValue;
							});
						}));
				})
			));
	}

	private initForm(): void {
		const controlsConfig: EmptyObject = {};

		const fieldConfigurations = {
			'accountType': { key: 'accountTypes', value: [[]] },
			'notificationType': { key: 'notificationType', value: [undefined] },
			'accountMode': { key: 'accountModes', value: [[]] },
			'accountStatus': { key: 'accountStatuses', value: [[]] },
			'userActionType': { key: 'userActionTypes', value: [[]] },
			'country': { key: 'countries', value: [[]] },
			'source': { key: 'sources', value: [[]] },
			'user': { key: 'user', value: [undefined] },
			'users': { key: 'users', value: [[]] },
			'fiatCurrency': { key: 'fiatCurrency', value: [undefined] },
			'transactionIds': { key: 'transactionIds', value: [[]] },
			'transactionType': { key: 'transactionTypes', value: [[]] },
			'transactionStatus': { key: 'transactionStatuses', value: [[]] },
			'tier': { key: 'tiers', value: [[]] },
			'widget': { key: 'widgets', value: [[]] },
			'widgetName': { key: 'widgetNames', value: [[]] },
			'riskAlertCode': { key: 'riskAlertCode', value: [undefined] },
			'riskLevel': { key: 'riskLevels', value: [[]] },
			'kycStatus': { key: 'kycStatuses', value: [[]] },
			'transactionKycStatus': { key: 'transactionKycStatuses', value: [[]] },
			'paymentInstrument': { key: 'paymentInstruments', value: [[]] },
			'walletAddress': { key: 'walletAddress', value: [undefined] },
			'totalBuyVolume': { key: 'totalBuyVolumeOver', value: [0] },
			'transactionCount': { key: 'transactionCountOver', value: [0] },
			'recallNumber': { key: 'recallNumber', value: [''] },
			'search': { key: 'search', value: [''] },
			'verifyWhenPaid': { key: 'verifyWhenPaid', value: [false] },
			'transactionFlag': { key: 'transactionFlag', value: [false] },
			'transactionWasEverCompleted': { key: 'transactionWasEverCompleted', value: [false] },
			'hasRecallNumber': { key: 'hasRecallNumber', value: [false] },
			'isReversalProcessed': { key: 'isReversalProcessed', value: [false] },
			'preauthFlag': { key: 'preauthFlag', value: [false] },
			'zeroBalance': { key: 'zeroBalance', value: false },
			'from': { key: 'from', value: [''] },
		};

		this.fields.forEach(field => {
			const config = fieldConfigurations[field];
			if (config) {
				controlsConfig[config.key] = config.value;
			}
		});

		if (this.fields.includes('createdDate')) {
			controlsConfig.createdDateRangeStart = [undefined];
			controlsConfig.createdDateRangeEnd = [undefined];
		}
		if (this.fields.includes('createdDateAction')) {
			controlsConfig.createdDateRangeStart = [undefined];
			controlsConfig.createdDateRangeEnd = [undefined];
		}
		if (this.fields.includes('completedDate')) {
			controlsConfig.completedDateRangeStart = [undefined];
			controlsConfig.completedDateRangeEnd = [undefined];
		}
		if (this.fields.includes('registrationDate')) {
			controlsConfig.registrationDateRangeStart = [undefined];
			controlsConfig.registrationDateRangeEnd = [undefined];
		}
		if (this.fields.includes('updatedDate')) {
			controlsConfig.updatedDateRangeStart = [undefined];
			controlsConfig.updatedDateRangeEnd = [undefined];
		}

		this.filterForm = this.formBuilder.group(controlsConfig);

		if (this.filterData?.search) {
			this.filterForm.controls.search.setValue(this.filterData.search);
		}

		if (this.filterData?.from) {
  		this.filterForm.controls.from.setValue(this.filterData.from);
  	}

		if (this.filterData?.createdDateInterval) {
			this.filterForm.controls.createdDateRangeStart.setValue(this.filterData?.createdDateInterval.from as Date);
			this.filterForm.controls.createdDateRangeEnd.setValue(this.filterData?.createdDateInterval.to as Date);
		}
		if (this.filterData?.completedDateInterval) {
			this.filterForm.controls.completedDateRangeStart.setValue(this.filterData?.completedDateInterval.from as Date);
			this.filterForm.controls.completedDateRangeEnd.setValue(this.filterData?.completedDateInterval.to as Date);
		}
		if (this.filterData?.updatedDateInterval) {
			this.filterForm.controls.updatedDateRangeStart.setValue(this.filterData?.updatedDateInterval.from as Date);
			this.filterForm.controls.updatedDateRangeEnd.setValue(this.filterData?.updatedDateInterval.to as Date);
		}
	}

	resetFilters(): void {
		if (this.filterForm) {
			if (this.originFields.includes('createdDate')) {
				this.filterForm.controls.createdDateRangeStart.setValue(undefined);
				this.filterForm.controls.createdDateRangeEnd.setValue(undefined);
				if (this.createFilterPicker) {
					this.createFilterPicker.reset();
				}
			}
			if (this.originFields.includes('createdDateAction')) {
				this.filterForm.controls.createdDateRangeStart.setValue(undefined);
				this.filterForm.controls.createdDateRangeEnd.setValue(undefined);
				if (this.createFilterPicker) {
					this.createFilterPicker.reset();
				}
			}
			if (this.originFields.includes('completedDate')) {
				this.filterForm.controls.completedDateRangeStart.setValue(undefined);
				this.filterForm.controls.completedDateRangeEnd.setValue(undefined);
				if (this.completeFilterPicker) {
					this.completeFilterPicker.reset();
				}
			}
			if (this.originFields.includes('registrationDate')) {
				this.filterForm.controls.registrationDateRangeStart.setValue(undefined);
				this.filterForm.controls.registrationDateRangeEnd.setValue(undefined);
				if (this.registerFilterPicker) {
					this.registerFilterPicker.reset();
				}
			}
			if (this.originFields.includes('updatedDate')) {
				this.filterForm.controls.updatedDateRangeStart.setValue(undefined);
				this.filterForm.controls.updatedDateRangeEnd.setValue(undefined);
				if (this.updateFilterPicker) {
					this.updateFilterPicker.reset();
				}
			}

			const controlValues = {
				'accountType': { controlName: 'accountTypes', value: [] },
				'notificationType': { controlName: 'notificationType', value: undefined },
				'accountMode': { controlName: 'accountModes', value: [] },
				'accountStatus': { controlName: 'accountStatuses', value: [] },
				'country': { controlName: 'countries', value: [] },
				'source': { controlName: 'sources', value: [] },
				'user': { controlName: 'user', value: undefined },
				'users': { controlName: 'users', value: [] },
				'fiatCurrency': { controlName: 'fiatCurrency', value: undefined },
				'transactionIds': { controlName: 'transactionIds', value: [] },
				'transactionType': { controlName: 'transactionTypes', value: [] },
				'transactionStatus': { controlName: 'transactionStatuses', value: [] },
				'tier': { controlName: 'tiers', value: [] },
				'widget': { controlName: 'widgets', value: [] },
				'widgetName': { controlName: 'widgetNames', value: [] },
				'riskAlertCode': { controlName: 'riskAlertCode', value: undefined },
				'riskLevel': { controlName: 'riskLevels', value: [] },
				'kycStatus': { controlName: 'kycStatuses', value: [] },
				'transactionKycStatus': { controlName: 'transactionKycStatuses', value: [] },
				'paymentInstrument': { controlName: 'paymentInstruments', value: [] },
				'walletAddress': { controlName: 'walletAddress', value: '' },
				'totalBuyVolume': { controlName: 'totalBuyVolumeOver', value: 0 },
				'transactionCount': { controlName: 'transactionCountOver', value: 0 },
				'recallNumber': { controlName: 'recallNumber', value: '' },
				'search': { controlName: 'search', value: '' },
				'from': { controlName: 'from', value: '' },
				'verifyWhenPaid': { controlName: 'verifyWhenPaid', value: false },
				'transactionFlag': { controlName: 'transactionFlag', value: false },
				'transactionWasEverCompleted': { controlName: 'transactionWasEverCompleted', value: false },
				'hasRecallNumber': { controlName: 'hasRecallNumber', value: false },
				'isReversalProcessed': { controlName: 'isReversalProcessed', value: false },
				'preauthFlag': { controlName: 'preauthFlag', value: false },
				'zeroBalance': { controlName: 'zeroBalance', value: false },
			};
		
			this.originFields.forEach(field => {
				if (controlValues[field]) {
					const { controlName, value } = controlValues[field];
					if (this.filterForm.controls[controlName]) {
						this.filterForm.controls[controlName].setValue(value);
					}
				}
			});
		}
	
		this.applyFilters();
		this.fields = this.originFields;
		this.isFilterSelected = false;
	}

	applyFilters(): void {
		if (this.filterForm) {
			this.filterSubject.next(new Filter(this.filterForm.value));
		}
	}

	getCountryFlag(code: string): string {
		return `${code.toLowerCase()}.svg`;
	}

	onFilterRemove(field: string, formControlName: string | string[]): void {
		this.isFilterSelected = false;
		/* 
			Set formControlValue undefined, so that the next time the filters are applied, 
			they can be removed from the payload
		*/
		if (typeof formControlName === 'string') {
			this.filterForm.controls[formControlName]?.patchValue(null);
		} else {
			formControlName.forEach(field => this.filterForm.controls[field]?.patchValue(null));
		}
			
		/* Remove field from filteredFields */
		const index = this.filteredFields.indexOf(field);
		this.filteredFields.splice(index, 1);

		/* Add removed field back to list */
		const parsedField = defaultFilterFields.find(defaultField => defaultField.value === field);
		this.filteredFieldsList.unshift(parsedField);
	}

	updateUserFilters(): void {
		this.isFiltersUdating = true;
		this.adminDataService.updateUserFilters({ [this.filterType]: this.filteredFields })
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (value) => {
					/* Get current user settings, and set filters from the payload */
					const currentUser = this.auth.user;
					currentUser.filters = value.data.updateUserFilters as UserFilter;

					this.auth.setUser(currentUser);
					this.isFiltersUdating = false;
				}
			});
	}
}