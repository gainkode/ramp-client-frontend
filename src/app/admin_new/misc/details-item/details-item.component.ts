import { Component, Input } from '@angular/core';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
  selector: 'app-admin-details-item',
  templateUrl: './details-item.component.html',
  styleUrls: ['./details-item.component.scss']
})
export class AdminDetailsItemComponent {

  @Input()
  label?: string;

  @Input()
  set value(value: string | string[] | number | CommonTargetValue | null | undefined) {
    this.setArray = false;
    if (value instanceof CommonTargetValue) {
      this.valueImage = value;
    } else if (typeof (value) === 'number') {
      this.valueString = value.toString();
    } else if (typeof (value) === 'string') {
      this.valueString = value ? value.trim() : undefined;
    } else {
      this.setArray = true;
      this.valueString = (value) ? (value.length > 0 ? 'data' : undefined) : undefined;
      this.valueStrings = value ?? [];
    }
  }

  @Input() set linkUrl(val: string) {
    this.setLink = true;
    if (val.startsWith('http')) {
      this.url = val;
    } else {
      this.urlPath = val;
    }
  }

  valueString?: string;
  valueStrings?: string[];
  valueImage?: CommonTargetValue;
  setLink = false;
  setArray = false;
  urlPath: string | undefined = undefined;
  url: string | undefined = undefined;

  constructor() { }
}
