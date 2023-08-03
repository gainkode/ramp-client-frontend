import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-widget-embedded-details',
  templateUrl: './widget-embedded-details.component.html',
  styleUrls: ['./widget-embedded-details.component.scss']
})
export class WidgetEmbeddedDetailsComponent {
  @Input() showWidgetDetails = false;

  @Output() backToOverview = new EventEmitter<boolean>();
}
