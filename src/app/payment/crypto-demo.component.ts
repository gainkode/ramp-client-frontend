import { Component } from '@angular/core';
import { EnvService } from '../services/env.service';

@Component({
  templateUrl: 'crypto-demo.component.html',
  styleUrls: ['../../assets/payment.scss'],
})
export class CryptoDemoComponent {
  bg_mask = (EnvService.widget_bg_mask === 'true');
}
