import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { CountryCodes, ICountryCode } from 'src/app/model/country-code.model';
import { DashboardFilter } from 'src/app/model/dashboard.model';
import { UserListResult, WidgetListResult } from 'src/app/model/generated-models';
import { TransactionSourceList, UserTypeList } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AdminDataService } from 'src/app/services/admin-data.service';

@Component({
    selector: 'app-dashboard-filter',
    templateUrl: 'dashboard-filter.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardFilterComponent implements OnInit {
    @Output() update = new EventEmitter<DashboardFilter>();
    @ViewChild('countryInput') countryInput!: ElementRef<HTMLInputElement>;
    @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
    @ViewChild('affiliateInput') affiliateInput!: ElementRef<HTMLInputElement>;

    inProgress = false;
    sources = TransactionSourceList;
    userTypes = UserTypeList;
    countries: ICountryCode[] = CountryCodes;
    selectedCountries: ICountryCode[] = [];
    selectedUsers: UserItem[] = [];
    selectedAffiliates: string[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredCountries: Observable<ICountryCode[]> | undefined;
    filteredUsers: Observable<UserItem[]> | undefined;
    filteredAffiliates: Observable<string[]> | undefined;

    filterForm = this.formBuilder.group({
        accountType: [[]],
        users: [[]],
        user: [''],
        affiliates: [[]],
        affiliate: [''],
        countries: [[]],
        country: [''],
        source: [[]]
    });

    constructor(private formBuilder: FormBuilder, private adminService: AdminDataService) { }

    ngOnInit(): void {
        this.filteredCountries = this.countryField?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCountries(value))
        );
        this.userField?.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(1000)
        ).subscribe(val => {
            this.filterUsers(val);
        });
        this.affiliateField?.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(1000)
        ).subscribe(val => {
            this.filterAffiliates(val);
        });
    }

    get accountTypeField(): AbstractControl | null {
        return this.filterForm.get('accountType');
    }

    get userField(): AbstractControl | null {
        return this.filterForm.get('user');
    }

    get affiliateField(): AbstractControl | null {
        return this.filterForm.get('affiliate');
    }

    get countryField(): AbstractControl | null {
        return this.filterForm.get('country');
    }

    get sourceField(): AbstractControl | null {
        return this.filterForm.get('source');
    }

    getCountryFlag(code: string): string {
        return `${code.toLowerCase()}.svg`;
    }

    addCountry(event: MatChipInputEvent): void {
        this.countryField?.setValue(null);
    }

    removeCountry(val: ICountryCode, index: number): void {
        if (index >= 0) {
            this.selectedCountries.splice(index, 1);
        }
    }

    clearCountries(): void {
        this.selectedCountries = [];
    }

    countrySelected(event: MatAutocompleteSelectedEvent): void {
        const item = this.selectedCountries.find(x => x.code3 === event.option.id);
        if (!item) {
            this.selectedCountries.push(event.option.value);
        }
        this.countryInput.nativeElement.value = '';
        this.countryField?.setValue(null);
    }

    private filterCountries(value: string | ICountryCode): ICountryCode[] {
        let filterValue = '';
        if (value) {
            filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();
            return this.countries.filter(c => c.name.toLowerCase().includes(filterValue));
        } else {
            return this.countries;
        }
    }

    addUser(event: MatChipInputEvent): void {
        this.userInput.nativeElement.value = '';
        this.userField?.setValue(null);
        this.filteredUsers = of([]);
    }

    removeUser(val: UserItem, index: number): void {
        if (index >= 0) {
            this.selectedUsers.splice(index, 1);
        }
    }

    clearUsers(): void {
        this.selectedUsers = [];
    }

    userSelected(event: MatAutocompleteSelectedEvent): void {
        const item = this.selectedUsers.find(x => x.id === event.option.id);
        if (!item) {
            this.selectedUsers.push(event.option.value);
        }
        this.userInput.nativeElement.value = '';
        this.userField?.setValue(null);
        this.filteredUsers = of([]);
    }

    private filterUsers(value: string): void {
        if (value && value !== '') {
            this.inProgress = true;
            const userData = this.adminService.getCustomers(value, 0, 1000, 'email', false);
            if (userData !== null) {
                userData.valueChanges.subscribe(({ data }) => {
                    const dataList = data.getUsers as UserListResult;
                    if (dataList !== null) {
                        const userCount = dataList?.count as number;
                        if (userCount > 0) {
                            this.filteredUsers = of(dataList?.list?.map((val) => new UserItem(val)) as UserItem[]);
                        }
                    }
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    this.filteredUsers = of([]);
                });
            }
        } else {
            this.filteredUsers = of([]);
        }
    }

    addAffiliate(event: MatChipInputEvent): void {
        this.affiliateInput.nativeElement.value = '';
        this.affiliateField?.setValue(null);
        this.filteredAffiliates = of([]);
    }

    removeAffiliate(val: string, index: number): void {
        if (index >= 0) {
            this.selectedAffiliates.splice(index, 1);
        }
    }

    clearAffiliates(): void {
        this.selectedAffiliates = [];
    }

    affiliateSelected(event: MatAutocompleteSelectedEvent): void {
        const item = this.selectedAffiliates.find(x => x === event.option.value);
        if (!item) {
            this.selectedAffiliates.push(event.option.value);
        }
        this.affiliateInput.nativeElement.value = '';
        this.affiliateField?.setValue(null);
        this.filteredAffiliates = of([]);
    }

    private filterAffiliates(value: string): void {
        if (value && value !== '') {
            this.inProgress = true;
            const userData = this.adminService.getWidgets(value, 0, 1000, 'widgetId', false);
            if (userData !== null) {
                userData.valueChanges.subscribe(({ data }) => {
                    const dataList = data.getWidgets as WidgetListResult;
                    if (dataList !== null) {
                        const userCount = dataList?.count as number;
                        if (userCount > 0) {
                            this.filteredAffiliates = of(dataList?.list?.map((val) => val.widgetId?.toString()) as string[]);
                        }
                    }
                    this.inProgress = false;
                }, (error) => {
                    this.inProgress = false;
                    this.filteredUsers = of([]);
                });
            }
        } else {
            this.filteredUsers = of([]);
        }
    }

    resetFilter(): void {
        this.accountTypeField?.setValue([]);
        this.userInput.nativeElement.value = '';
        this.userField?.setValue(null);
        this.selectedUsers = [];
        this.affiliateInput.nativeElement.value = '';
        this.affiliateField?.setValue(null);
        this.selectedAffiliates = [];
        this.countryInput.nativeElement.value = '';
        this.countryField?.setValue(null);
        this.selectedCountries = [];
        this.sourceField?.setValue([]);
        this.update.emit(new DashboardFilter());
    }

    onSubmit(): void {
        const filter = new DashboardFilter();
        // account types
        filter.accountTypesOnly = this.accountTypeField?.value;
        // users
        filter.userIdOnly = [];
        this.selectedUsers.forEach(u => {
            filter.userIdOnly.push(u.id);
        });
        // affiliates
        filter.affiliateIdOnly = this.selectedAffiliates;
        // countries
        filter.countriesOnly = [];
        this.selectedCountries.forEach(c => {
            filter.countriesOnly.push(c.code3);
        });
        // transaction sources
        filter.sourcesOnly = this.sourceField?.value;

        //console.log(filter);

        this.update.emit(filter);
    }
}
