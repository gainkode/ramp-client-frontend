import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CurrencyView } from 'src/app/model/payment.model';

@Component({
  selector: 'app-admin-withdrawal-address',
  templateUrl: 'withdrawal-address.component.html',
  styleUrls: ['withdrawal-address.component.scss']
})
export class AdminWithdrawalAddressComponent {
  @Input() set values(data: { [key: string]: string }) {
    this.addresses = data;
    this.updateCryptoList();
  }
  @Input() set cryptoList(data: CurrencyView[]) {
    this.cryptoListData = data;
    this.updateCryptoList();
  }
  @Output() save = new EventEmitter<{ key: string, value: string }>();
  @Output() delete = new EventEmitter<string>();

  addingMode = false;
  addresses: { [key: string]: string } = {};
  currencies: CurrencyView[] = [];

  form = this.formBuilder.group({
    id: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    address: [undefined, { validators: [Validators.required], updateOn: 'change' }]
  });

  private cryptoListData: CurrencyView[] = [];

  constructor(private formBuilder: FormBuilder) { }

  private updateCryptoList(): void {
    this.currencies = this.cryptoListData.filter(x => this.addresses[x.symbol] === undefined);
  }

  addAddress(): void {
    this.addingMode = true;
  }

  cancelAddress(): void {
    this.addingMode = false;
    this.form.reset();
  }

  remove(key: string): void {
    this.delete.emit(key);
    this.updateCryptoList();
  }

  onSubmit(): void {
    this.save.emit({
      key: this.form.controls.id?.value,
      value: this.form.controls.address?.value
    });
    this.addingMode = false;
    this.form.reset();
    this.updateCryptoList();
  }
}
