import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-widget-kyc',
  templateUrl: 'kyc.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetKycComponent {
  @Input() address = '';
  @Input() flow = '';
  @Output() onError = new EventEmitter<string>();
  @Output() onAuthError = new EventEmitter();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();
}
