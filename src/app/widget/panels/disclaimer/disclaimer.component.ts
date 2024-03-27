import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomTextList, CustomTextType } from 'model/custom-text.model';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-widget-disclaimer',
	templateUrl: 'disclaimer.component.html',
	styleUrls: []
})
export class WidgetDisclaimerComponent {
  @Input() agreementChecked = false;
  @Input() backButton = true;
  @Input() set textContent(data: string[]) {
  	if (data?.length > 0) {
  		this.textData = new CustomTextList(data);
  	}
  }
  @Input() errorMessageData = '';
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  done = false;
  termsLink = EnvService.terms_link;
  productName = EnvService.productFull;
  textData = new CustomTextList([]);
  TEXT_TYPE: typeof CustomTextType = CustomTextType;

  constructor() {
  }
  checkAgreement(): void {
  	this.agreementChecked = !this.agreementChecked;
  }
}
