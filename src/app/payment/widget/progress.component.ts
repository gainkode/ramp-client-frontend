import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-widget-progress',
  templateUrl: 'progress.component.html',
  styleUrls: ['../../../assets/payment.scss'],
})
export class WidgetProgressComponent {
  @Input() title = '';
  @Input() set step(val: number) {
    this.position = val;
    if (this.position < 1) {
      this.position = 1;
    } else if (this.position > 6) {
      this.position = 6;
    }
  }

  position = 1;

  constructor() {}

  getIndicatorStyle(): any {
    return {
      '__widget-progress-indicator': true,
      '__widget-progress-indicator-step-1': this.position === 1,
      '__widget-progress-indicator-step-2': this.position === 2,
      '__widget-progress-indicator-step-3': this.position === 3,
      '__widget-progress-indicator-step-4': this.position === 4,
      '__widget-progress-indicator-step-5': this.position === 5,
      '__widget-progress-indicator-step-6': this.position === 6
    };
  }
}
