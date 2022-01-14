import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: 'quickcheckout.component.html',
  styleUrls: ['../../assets/payment.scss'],
})
export class QuickCheckoutComponent {
  prodMode = environment.production;
  userParamsId = '';
  expressFrom = '';
  expressTo = '';
  expressValue = 0;

  constructor(private route: ActivatedRoute) {
    this.userParamsId = this.route.snapshot.params['userParamsId'] ?? '';
    this.expressFrom = this.route.snapshot.params['from'] ?? '';
    this.expressTo = this.route.snapshot.params['to'] ?? '';
    this.expressValue = this.route.snapshot.params['value'] ?? 0;
    if (this.expressFrom !== '' && this.expressTo !== '' && this.expressValue !== 0) {

    }
  }
}
