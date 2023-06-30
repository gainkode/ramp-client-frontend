import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-widget-initialization',
	templateUrl: 'initialization.component.html',
	styleUrls: ['../../../../assets/text-control.scss']
})
export class WidgetInitializationComponent {
  @Input() message = '';
}
