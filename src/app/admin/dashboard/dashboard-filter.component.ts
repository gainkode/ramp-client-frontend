import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CountryCodes, getCountry, ICountryCode } from 'src/app/model/country-code.model';
import { DashboardFilter } from 'src/app/model/dashboard.model';
import { TransactionSourceList, UserTypeList } from 'src/app/model/payment.model';

@Component({
    selector: 'app-dashboard-filter',
    templateUrl: 'dashboard-filter.component.html',
    styleUrls: ['../admin.scss', 'dashboard.scss']
})
export class DashboardFilterComponent implements OnInit {
    @Output() update = new EventEmitter<DashboardFilter>();
    @ViewChild('countryInput') countryInput!: ElementRef<HTMLInputElement>;

    sources = TransactionSourceList;
    userTypes = UserTypeList;
    countries: ICountryCode[] = CountryCodes;
    selectedCountries: ICountryCode[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredCountries: Observable<ICountryCode[]> | undefined;

    filterForm = this.formBuilder.group({
        accountType: [[]],
        users: [[]],
        user: [''],
        countries: [[]],
        country: [''],
        source: [[]]
    });

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.filteredCountries = this.countryField?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCountries(value)));
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
        console.log(event.option.viewValue, event.option.id);
        const item = this.selectedCountries.find(x => x.code3 === event.option.id);
        if (!item) {
            const newCountry = this.countries.find(x => x.code3 === event.option.id);
            if (newCountry) {
                this.selectedCountries.push(newCountry);
            }
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

    resetFilter(): void {
        this.accountTypeField?.setValue([]);
        this.countryField?.setValue(null);
        this.selectedCountries = [];
        this.sourceField?.setValue([]);
        this.update.emit(new DashboardFilter());
    }

    onSubmit(): void {
        const filter = new DashboardFilter();
        // account types
        filter.accountTypesOnly = this.accountTypeField?.value;
        // transaction sources
        filter.sourcesOnly = this.sourceField?.value;
        // countries
        filter.countriesOnly = [];
        this.selectedCountries.forEach(c => {
            filter.countriesOnly.push(c.code3);
        });

        console.log(filter);

        this.update.emit(filter);
    }
}
