import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

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
    this.termsLink = environment.terms_link;
  }
}
