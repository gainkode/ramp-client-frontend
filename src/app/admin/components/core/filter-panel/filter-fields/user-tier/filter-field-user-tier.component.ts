import { Component, ElementRef, forwardRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminDataService } from '../../../../../services/admin-data.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
  selector: 'app-filter-field-user-tier',
  templateUrl: './filter-field-user-tier.component.html',
  styleUrls: ['./filter-field-user-tier.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldUserTierComponent),
      multi: true
    }
  ]
})
export class FilterFieldUserTierComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  filteredOptions: CommonTargetValue[] = [];
  selectedOptions: CommonTargetValue[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(private adminDataService: AdminDataService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.adminDataService.getSettingsKycTiers().subscribe(val => {
        if (val.count === 0) {
          this.filteredOptions = [];
        } else {
          this.filteredOptions = val.list.map(data => {
            return {
              id: data.settingsKycTierId,
              title: data.name
            } as CommonTargetValue
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // region ControlValueAccessor implementation

  onTouched = () => {
  }

  onChange = (_: any) => {
  }

  // writeValue(value: CommonTargetValue[]): void {
  //   this.selectedOptions = value;
  // }

  writeValue(value: any): void {
    console.log('writeValue', value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // endregion
}
