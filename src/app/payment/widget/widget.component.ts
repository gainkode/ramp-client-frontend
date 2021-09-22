import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-widget',
  templateUrl: 'widget.component.html',
  styleUrls: ['../../../assets/payment.scss'],
})
export class WidgetComponent {
  @Input() set internal(val: boolean) {
    this.internalPayment = val;
  }

  internalPayment = false;

  constructor() {}
}
