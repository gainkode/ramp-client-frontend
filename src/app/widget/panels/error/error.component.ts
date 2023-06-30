import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-widget-error',
	templateUrl: 'error.component.html',
	styleUrls: []
})
export class WidgetErrorComponent {
  @Input() title = '';
  @Input() errorMessage = '';
  @Input() tryAgain = true;
  @Output() onFinish = new EventEmitter();
}
