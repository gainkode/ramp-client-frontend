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

  constructor(private route: ActivatedRoute) {
    this.userParamsId = this.route.snapshot.params['userParamsId'] ?? '';
  }
}
