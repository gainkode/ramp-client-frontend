import { Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserItem } from '../../../../../../model/user.model';
import { AdminDataService } from '../../../../../../services/admin-data.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Filter } from '../../../../../../admin/model/filter.model';

@Component({
  selector: 'app-filter-field-users',
  templateUrl: './filter-field-user-multiple.component.html',
  styleUrls: ['./filter-field-user-multiple.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldUserMultipleComponent),
      multi: true
    }
  ]
})
export class FilterFieldUserMultipleComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  filteredOptions: UserItem[] = [];
  selectedOptions: UserItem[] = [];

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

  writeValue(value: UserItem[]): void {
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
    const user = this.filteredOptions.find(
      c => c.email.toLowerCase() === event.value.toLowerCase()
        .trim()
    );

    if (user) {
      this.setSelectedOptions([...this.selectedOptions, user]);
    }

    this.searchInput.nativeElement.value = '';
  }

  handleOptionSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedOptions.some(x => x.id === event.option.id)) {
      this.setSelectedOptions([...this.selectedOptions, event.option.value]);
    }

    this.searchInput.nativeElement.value = '';
  }

  removeOption(user: UserItem): void {
    this.setSelectedOptions(this.selectedOptions.filter(v => v.id !== user.id));
  }

  clearOptions(): void {
    this.setSelectedOptions([]);
  }

  private getFilteredOptions(searchString: string): Observable<UserItem[]> {
    if (searchString) {
      return this.adminDataService.getUsers(
        [],
        0,
        100,
        'email',
        false,
        new Filter({ search: searchString })
      )
        .pipe(
          map(result => {
            return result.list.filter(
              u => !this.selectedOptions.some(s => u.id === s.id));
          })
        );
    } else {
      return of([]);
    }
  }

  private setSelectedOptions(options: UserItem[]): void {
    this.selectedOptions = options;
    this.onChange(options.map(o => o.id));
  }

}
