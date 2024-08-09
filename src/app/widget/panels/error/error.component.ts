import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-widget-error',
	templateUrl: 'error.component.html',
})
export class WidgetErrorComponent {
  @Input() title = '';
  @Output() onFinish = new EventEmitter();
}
