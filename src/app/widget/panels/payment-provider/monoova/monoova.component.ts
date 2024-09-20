import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WidgetPaymentPagerService } from 'services/widget-payment-pager.service';

@Component({
  selector: 'app-widget-payment-monoova',
  templateUrl: './monoova.component.html',
  styleUrl: './monoova.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPaymentMonoovaComponent {
  @Output() selectedForm = new EventEmitter<{
    bsbNumber: string;
    accountNumber: string;
  }>();
  @Output() stageBackEvent = new EventEmitter();
  private readonly _fb = inject(FormBuilder);
  private readonly _pager = inject(WidgetPaymentPagerService);

  form = this._fb.group({
    bsbNumber: this._fb.control<string>(undefined,[Validators.required, Validators.minLength(6)]),
    accountNumber: this._fb.control<string>(undefined, [Validators.required, Validators.maxLength(80)]),
  });

  stageBack(): void {
  	const stage = this._pager.goBack();

  	if (!stage) {
  		this.stageBackEvent.emit();
  	}
  }

  onSubmit(): void {
    this.selectedForm.emit({
      bsbNumber: this.form.controls.bsbNumber.value,
      accountNumber: this.form.controls.accountNumber.value,
    });
  }
}
