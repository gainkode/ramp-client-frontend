import { Component, ElementRef, forwardRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AdminDataService } from '../../../../../services/admin-data.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Countries, Country } from '../../../../../../model/country-code.model';

@Component({
  selector: 'app-filter-field-country',
  templateUrl: './filter-field-country.component.html',
  styleUrls: ['./filter-field-country.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldCountryComponent),
      multi: true
    }
  ]
})
export class FilterFieldCountryComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  countryOptions = Countries;
  filteredOptions: Country[] = [];
  selectedOptions: Country[] = [];

  private searchString$ = new BehaviorSubject<string>('');

  private destroy$ = new Subject();

  constructor(private adminDataService: AdminDataService) {
  }

  ngOnInit(): void {
    this.searchString$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      switchMap(searchString => this.getFilteredOptions(searchString))
    )
        .subscribe(options => {
          this.filteredOptions = options;
        });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  // region ControlValueAccessor implementation

  onTouched = () => {
  }

  onChange = (_: any) => {
  }

  writeValue(value: Country[]): void {
    this.selectedOptions = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // endregion

  handleSearchInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase()
                               .trim();
    this.searchString$.next(searchString);
  }

  handleOptionAdded(event: MatChipInputEvent): void {
    const country = this.filteredOptions.find(
      c => c.name.toLowerCase() === event.value.toLowerCase()
                                         .trim()
    );

    if (country) {
      this.setSelectedOptions([...this.selectedOptions, country]);
    }

    this.searchInput.nativeElement.value = '';
  }

  handleOptionSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedOptions.some(x => x.code3 === event.option.id)) {
      this.setSelectedOptions([...this.selectedOptions, event.option.value]);
    }

    this.searchInput.nativeElement.value = '';
  }

  removeOption(country: Country): void {
    this.setSelectedOptions(this.selectedOptions.filter(v => v.code3 !== country.code3));
  }

  clearOptions(): void {
    this.setSelectedOptions([]);
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }

  private getFilteredOptions(searchString: string): Observable<Country[]> {
    const filteredOptions = this.countryOptions.filter(c => {
      return (
          !searchString || c.name.toLowerCase()
                            .includes(searchString)
        ) &&
        !this.selectedOptions.some(s => {
          return s.code3 === c.code3;
        });
    });

    return of(filteredOptions);
  }

  private setSelectedOptions(options: Country[]): void {
    this.selectedOptions = options;
    this.onChange(options.map(o => o.code3));
  }

}
