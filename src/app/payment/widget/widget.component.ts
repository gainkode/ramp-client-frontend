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
  initState = true;
  title = 'Order details';
  step = 1;

  constructor() { }

  isStageActive(stageId: string): boolean {
    let result = false;
    if (stageId === 'order_details') {
      result = true;
    }
    return result;
  }
}
