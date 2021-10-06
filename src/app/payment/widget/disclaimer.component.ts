import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-widget-disclaimer',
  templateUrl: 'disclaimer.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetDisclaimerComponent {
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();
}
