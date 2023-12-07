import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-payment-instruction',
  templateUrl: './payment-instruction.component.html',
  styleUrls: ['./payment-instruction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentInstructionComponent {
  @Output() nextStep = new EventEmitter();
  @Output() onBack = new EventEmitter();

}
