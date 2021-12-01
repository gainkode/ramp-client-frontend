import { Component, ElementRef, forwardRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject,  Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AdminDataService } from '../../../../../services/admin-data.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-filter-field-widget',
  templateUrl: './filter-field-widget.component.html',
  styleUrls: ['./filter-field-widget.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldWidgetComponent),
      multi: true
    }
  ]
})
export class FilterFieldWidgetComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  filteredOptions: string[] = [];
  selectedOptions: string[] = [];

  private searchString$ = new BehaviorSubject<string>('');

  private destroy$ = new Subject();

  constructor(private adminDataService: AdminDataService) {
  }

  ngOnInit(): void {
    this.searchString$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      debounceTime(1000),
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

  writeValue(value: string[]): void {
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
    const widget = this.filteredOptions.find(
      c => c.toLowerCase() === event.value.toLowerCase()
                                          .trim()
    );

    if (widget) {
      this.setSelectedOptions([...this.selectedOptions, widget]);
    }

    this.searchInput.nativeElement.value = '';
  }

  handleOptionSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedOptions.some(x => x === event.option.id)) {
      this.setSelectedOptions([...this.selectedOptions, event.option.value]);
    }

    this.searchInput.nativeElement.value = '';
  }

  removeOption(option: string): void {
    this.setSelectedOptions(this.selectedOptions.filter(i => i !== option));
  }

  clearOptions(): void {
    this.setSelectedOptions([]);
  }

  private getFilteredOptions(searchString: string): Observable<string[]> {
    if (searchString) {
      return this.adminDataService.getWidgetIds(searchString, 0, 100, 'widgetId', false)
                 .pipe(
                   map(result => {
                     return result.list.filter(
                       u => !this.selectedOptions.some(s => u === s));
                   })
                 );
    } else {
      return of([]);
    }
  }

  private setSelectedOptions(options: string[]): void {
    this.selectedOptions = options;
    this.onChange(options);
  }
}
