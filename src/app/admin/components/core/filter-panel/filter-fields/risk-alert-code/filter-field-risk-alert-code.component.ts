import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RiskAlertCodes } from '../../../../../../model/generated-models';
import { RiskAlertCodeItem, RiskAlertCodeList } from '../../../../../model/lists.model';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-filter-field-risk-alert-code',
  templateUrl: 'filter-field-risk-alert-code.component.html',
  styleUrls: ['filter-field-risk-alert-code.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterFieldRiskAlertCodeComponent),
      multi: true
    }
  ]
})
export class FilterFieldRiskAlertCodeComponent implements ControlValueAccessor {

  valueInternal?: RiskAlertCodes;

  options = RiskAlertCodeList;

  constructor() {
  }

  // region ControlValueAccessor implementation

  onTouched = () => {
  }

  onChange = (_: any) => {
  }

  writeValue(value?: RiskAlertCodes): void {
    const listItem = RiskAlertCodeList.find(c => c.id === value);
    this.valueInternal = listItem?.id ?? undefined;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // endregion

  handleSelectionChange(event: MatSelectChange): void {
    this.valueInternal = event.value;
    this.onChange(event.value);
  }
}
