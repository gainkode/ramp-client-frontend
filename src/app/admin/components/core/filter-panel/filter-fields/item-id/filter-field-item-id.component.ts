import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-filter-field-item-id',
  templateUrl: './filter-field-item-id.component.html',
  styleUrls: ['./filter-field-item-id.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldItemIdComponent),
      multi: true
    }
  ]
})
export class FilterFieldItemIdComponent implements ControlValueAccessor {
  @Input() title = 'ID';
  @ViewChild('idInput') idInput!: ElementRef<HTMLInputElement>;

  filteredOptions: string[] = [];

  constructor() {
  }

  // region ControlValueAccessor implementation

  onTouched = () => {
  }

  onChange = (_: any) => {
  }

  writeValue(value: string[]): void {
    this.filteredOptions = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // endregion

  handleIdInputChange(event: Event): void {
    let idString = event.target ? (event.target as HTMLInputElement).value : '';
    idString = idString.toLowerCase().trim();
  }

  handleOptionAdded(event: MatChipInputEvent): void {
    const newVal = event.value.toLowerCase().trim();
    this.setSelectedOptions([ ...this.filteredOptions, newVal ]);
    this.idInput.nativeElement.value = '';
  }

  removeOption(id: string): void {
    this.setSelectedOptions(this.filteredOptions.filter(v => v !== id));
  }

  clearOptions(): void {
    this.setSelectedOptions([]);
  }

  private setSelectedOptions(options: string[]): void {
    this.filteredOptions = options;
    this.onChange(options);
  }
}
