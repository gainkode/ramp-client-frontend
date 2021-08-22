import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';
import { CountryCodes, ICountryCode } from 'src/app/model/country-code.model';
import { DashboardFilter } from 'src/app/model/dashboard.model';
import { User, UserListResult } from 'src/app/model/generated-models';
import { TransactionSourceList, UserTypeList } from 'src/app/model/payment.model';
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

    inProgress = false;
    sources = TransactionSourceList;
    userTypes = UserTypeList;
    countries: ICountryCode[] = CountryCodes;
    selectedCountries: ICountryCode[] = [];
    selectedUsers: User[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredCountries: Observable<ICountryCode[]> | undefined;
    filteredUsers: Observable<User[]> | undefined;

    filterForm = this.formBuilder.group({
        accountType: [[]],
        users: [[]],
        user: [''],
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
            debounceTime(1000),
            filter((value) => !!value)
        ).subscribe(val => {
            this.filterUsers(val);
        });
    }

    get accountTypeField(): AbstractControl | null {
        return this.filterForm.get('accountType');
    }

    get userField(): AbstractControl | null {
        return this.filterForm.get('user');
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
        this.userField?.setValue(null);
    }

    removeUser(val: User, index: number): void {
        if (index >= 0) {
            this.selectedUsers.splice(index, 1);
        }
    }

    clearUsers(): void {
        this.selectedUsers = [];
    }

    userSelected(event: MatAutocompleteSelectedEvent): void {
        const item = this.selectedUsers.find(x => x.userId === event.option.id);
        if (!item) {
            this.selectedUsers.push(event.option.value);
        }
        this.userInput.nativeElement.value = '';
        this.userField?.setValue(null);
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
                            this.filteredUsers = of(dataList?.list?.map((val) => val) as User[]);
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
            filter.userIdOnly.push(u.userId);
        });
        // countries
        filter.countriesOnly = [];
        this.selectedCountries.forEach(c => {
            filter.countriesOnly.push(c.code3);
        });
        // transaction sources
        filter.sourcesOnly = this.sourceField?.value;

        console.log(filter);

        this.update.emit(filter);
    }
}
