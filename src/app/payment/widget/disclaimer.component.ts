import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-widget-disclaimer',
  templateUrl: 'disclaimer.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetDisclaimerComponent {
  @Input() agreementChecked = false;
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  checkAgreement(): void {
    this.agreementChecked = !this.agreementChecked;
  }
}
