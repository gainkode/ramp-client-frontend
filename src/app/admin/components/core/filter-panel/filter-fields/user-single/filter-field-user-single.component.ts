import { Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserItem } from '../../../../../../model/user.model';
import { AdminDataService } from '../../../../../services/admin-data.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Filter } from '../../../../../model/filter.model';

@Component({
  selector: 'app-filter-field-user',
  templateUrl: './filter-field-user-single.component.html',
  styleUrls: ['./filter-field-user-single.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldUserSingleComponent),
      multi: true
    }
  ]
})
export class FilterFieldUserSingleComponent implements OnInit, OnDestroy, ControlValueAccessor {
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

  handleOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.onChange(event.option.value.id);
  }

  handleUserInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase()
                               .trim();
    this.searchString$.next(searchString);
  }

  formatValue(user: UserItem): string {
    return user ?
      (user.fullName + (user.email ? ' (' + user.email + ')' : '')) :
      '';
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
                     return result.list;
                   })
                 );
    } else {
      return of([]);
    }
  }
}
