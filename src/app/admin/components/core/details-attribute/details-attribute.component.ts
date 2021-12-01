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
  set value(value: string | CommonTargetValue | null | undefined) {
    if (value instanceof CommonTargetValue) {
      this.valueImage = value;
    }
    else {
      this.valueString = value ? value.trim() : undefined;
    }
  }

  @Input()
  linkUrl?: string;

  @Input()
  highlight = false;

  valueString?: string;
  valueImage?: CommonTargetValue;

  constructor() { }

  ngOnInit(): void {

  }

}
