import { Component, EventEmitter, Output } from '@angular/core';
import { CheckoutSummary } from '../model/payment.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-payment-intro',
  templateUrl: 'payment-intro.component.html',
  styleUrls: ['../../assets/payment.scss']
})
export class PaymentIntroComponent {
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  constructor(private auth: AuthService) {

  }
}
