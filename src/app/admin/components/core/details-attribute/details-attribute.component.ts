import { Component, Input, OnInit } from '@angular/core';
import { CommonTargetValue } from '../../../../model/common.model';

@Component({
  selector: 'app-details-attribute',
  templateUrl: './details-attribute.component.html',
  styleUrls: ['./details-attribute.component.scss']
})
export class DetailsAttributeComponent implements OnInit {

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

  @Input() highlight = false;

  valueString?: string;
  valueStrings?: string[];
  valueImage?: CommonTargetValue;
  setLink = false;
  setArray = false;
  urlPath: string | undefined = undefined;
  url: string | undefined = undefined;

  constructor() { }

  ngOnInit(): void {

  }

}
