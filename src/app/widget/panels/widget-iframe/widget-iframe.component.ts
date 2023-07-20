import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-widget-iframe',
  templateUrl: './widget-iframe.component.html',
  styleUrls: ['./widget-iframe.component.scss']
})
export class WidgetIframeComponent {
  @Input() sourceLink = '';

  allow = 'camer';

}
