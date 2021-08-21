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
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredCountries: Observable<ICountryCode[]> | undefined;

    filterForm = this.formBuilder.group({
        accountType: [],
        countries: [[]],
        country: [''],
        source: []
    });

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.filteredCountries = this.countryField?.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCountries(value)));
    }

    get countryField(): AbstractControl | null {
        return this.filterForm.get('country');
    }

    get countriesField(): AbstractControl | null {
        return this.filterForm.get('countries');
    }

    getCountryFlag(code: string): string {
        return `${code.toLowerCase()}.svg`;
    }

    addCountry(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add new country value
        if ((value || '').trim()) {
            const values = this.countriesField?.value;
            values.push(value.trim());
            this.countriesField?.setValue(values);
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.countryField?.setValue(null);
    }

    removeCountry(val: string): void {
        const values = this.countriesField?.value;
        const index = values.indexOf(val);
        if (index >= 0) {
            values.splice(index, 1);
            this.countriesField?.setValue(values);
        }
    }

    clearCountries(): void {
        this.countriesField?.setValue([]);
    }

    countrySelected(event: MatAutocompleteSelectedEvent): void {
        const values = this.countriesField?.value;
        if (!values.includes(event.option.viewValue)) {
            values.push(event.option.viewValue);
            this.countriesField?.setValue(values);
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

    onSubmit() {
        const filter = new DashboardFilter();
        // account types
        filter.accountTypesOnly = this.filterForm.get('accountType')?.value;
        // transaction sources
        filter.sourcesOnly = this.filterForm.get('source')?.value;
        // countries
        const countryCodes: string[] = [];
        (this.countriesField?.value as string[]).forEach(x => {
            const c = getCountry(x);
            if (c !== null) {
                console.log(c);
                countryCodes.push(c.code3);
            }
        });
        filter.countriesOnly = countryCodes;

        //console.log(filter);

        this.update.emit(filter);
    }
}
