import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: 'quickcheckout.component.html',
  styleUrls: ['../../assets/payment.scss'],
})
export class QuickCheckoutComponent {
  prodMode = environment.production;

  constructor() {}
}
