import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonTargetValue } from 'model/common.model';
import { UserModeView } from 'model/payment.model';

@Component({
	selector: 'app-admin-details-item',
	templateUrl: './details-item.component.html'
})
export class AdminDetailsItemComponent {
  @Input() label?: string;
  @Input() smartLink = false;

  @Input()
  set value(value: string | string[] | number | CommonTargetValue | UserModeView | null | undefined) {
  	this.setArray = false;
  	if (value instanceof CommonTargetValue) {
  		this.valueImage = value;
  	} else if (typeof (value) === 'number') {
  		this.valueString = value.toString();
  	} else if (typeof (value) === 'string') {
  		this.valueString = value ? value.trim() : undefined;
  	} else if(value instanceof UserModeView) {
  		this.valueString = value ? value.toString() : undefined;
  	} else{
  		this.setArray = true;
  		this.valueStrings = value?.filter(x => x !== '') ?? [];
  		this.valueString = this.valueStrings.length > 0 ? 'data' : undefined;
  	}
  }

  @Input() set linkUrl(val: string) {
  	this.setLink = true;
  	if (val.startsWith('http')) {
  		this.url = val;
  		this.smartUrl = val;
  	} else {
  		this.urlPath = val;
  		this.smartUrl = val;
  	}
  }

  valueString?: string;
  valueStrings?: string[];
  valueImage?: CommonTargetValue;
  setLink = false;
  setArray = false;
  urlPath: string | undefined = undefined;
  url: string | undefined = undefined;
  smartUrl: string | undefined = undefined;

  constructor(private router: Router) { }

  linkClick(): void {
  	void this.router.navigateByUrl(this.smartUrl).then(() => window.location.reload());
  }
}
