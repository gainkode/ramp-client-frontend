import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { Transaction, TransactionType } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { TransactionItemDeprecated } from 'src/app/model/transaction.model';

@Component({
  selector: 'app-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent {
  @Input() set transaction(val: TransactionItemDeprecated | undefined) {
    this.setFormData(val);
    this.layoutService.setBackdrop(!val?.id);
  }
  @Input() cancelable = false;
  @Input() set currencies(list: CurrencyView[]) {
    if (this.data) {
      const currencyToSpendSymbol = this.data?.currencyToSpend;
      const currencyToSpend = list.find(x => x.id === currencyToSpendSymbol);
      if (currencyToSpend) {
        this.currenciesToSpend = list.filter(x => x.fiat === currencyToSpend.fiat);
        this.currenciesToReceive = list.filter(x => x.fiat === !currencyToSpend.fiat);
        this.form.get('currencyToSpend')?.setValue(this.data?.currencyToSpend);
        this.form.get('currencyToReceive')?.setValue(this.data?.currencyToReceive);
      }
    }
  }
  @Output() save = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;

  data: TransactionItemDeprecated | undefined = undefined;
  removable = false;
  transactionId = '';
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];

  form = this.formBuilder.group({
    address: ['', { validators: [Validators.required], updateOn: 'change' }],
    currencyToSpend: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    currencyToReceive: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    amountToReceive: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    amountToSpend: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    rate: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: FormBuilder,
    private layoutService: LayoutService
  ) { }

  setFormData(val: TransactionItemDeprecated | undefined) {
    this.data = val;
    this.transactionId = val?.id ?? '';
    this.removable = val?.statusInfo?.value.canBeCancelled ?? false;
    if (this.data) {
      this.form.get('address')?.setValue(this.data.address);
      this.form.get('amountToSpend')?.setValue(this.data.amountToSpend);
      this.form.get('amountToReceive')?.setValue(this.data.amountToReceive);
      this.form.get('currencyToSpend')?.setValue(this.data?.currencyToSpend);
      this.form.get('currencyToReceive')?.setValue(this.data?.currencyToReceive);
      this.form.get('rate')?.setValue(this.data.rate);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const transaction = {
        transactionId: this.transactionId,
        destination: this.form.get('address')?.value,
        currencyToSpend: this.form.get('currencyToSpend')?.value,
        currencyToReceive: this.form.get('currencyToReceive')?.value,
        amountToSpend: parseFloat(this.form.get('amountToSpend')?.value ?? '0'),
        amountToReceive: (!this.data?.initialAmount) ? this.form.get('amountToReceive')?.value : undefined,
        initialAmountToReceive: (this.data?.initialAmount) ? this.form.get('amountToReceive')?.value : undefined,
        rate: (!this.data?.initialAmount) ? parseFloat(this.form.get('rate')?.value ?? '0') : undefined,
        initialRate: (this.data?.initialAmount) ? parseFloat(this.form.get('rate')?.value ?? '0') : undefined
      } as Transaction;
      this.save.emit(transaction);
    }
  }

  onDeleteTransaction(): void {
    if (this.transactionId !== '' && this.removable) {
      this.delete.emit(this.transactionId);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
