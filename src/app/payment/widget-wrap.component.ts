import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: 'widget-wrap.component.html',
  styleUrls: ['../../assets/payment.scss']
})
export class WidgetWrapComponent {
  userParamsId = '';

  constructor(private route: ActivatedRoute) {
    this.userParamsId = this.route.snapshot.params['userParamsId'] ?? '';
  }
}
