import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-widget-processing',
  templateUrl: 'processing.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetProcessingComponent {
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  complete = false;
}
