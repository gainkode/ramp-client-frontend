import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-widget-disclaimer',
  templateUrl: 'disclaimer.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetDisclaimerComponent {
  @Input() agreementChecked = false;
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  termsLink = '';
  
  checkAgreement(): void {
    this.agreementChecked = !this.agreementChecked;
    this.termsLink = EnvService.terms_link;
  }
}
