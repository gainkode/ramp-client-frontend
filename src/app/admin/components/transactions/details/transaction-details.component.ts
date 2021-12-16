import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { Transaction, TransactionKycStatus, TransactionType } from 'src/app/model/generated-models';
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
      if (this.data.type === TransactionType.Withdrawal) {
        this.currenciesToReceive = list.filter(x => x.fiat === true);
        this.currenciesToSpend = list.filter(x => x.fiat === false);
        this.form.get('currencyToSpend')?.setValue(this.data?.currencyToSpend);
        this.form.get('currencyToReceive')?.setValue(this.data?.currencyToReceive);
      } else {
        this.currenciesToReceive = list.filter(x => x.fiat === false);
        this.currenciesToSpend = list.filter(x => x.fiat === true);
        this.form.get('currencyToReceive')?.setValue(this.data?.currencyToSpend);
        this.form.get('currencyToSpend')?.setValue(this.data?.currencyToReceive);
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
    currencyToSpend: ['', { validators: [Validators.required], updateOn: 'change' }],
    currencyToReceive: ['', { validators: [Validators.required], updateOn: 'change' }],
    amountToReceive: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    amountToSpend: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
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
      if (this.data.type === TransactionType.Withdrawal) {
        this.form.get('currencyToReceive')?.setValue(this.data.currencyToSpend);
        this.form.get('currencyToSpend')?.setValue(this.data.currencyToReceive);
      } else {
        this.form.get('currencyToSpend')?.setValue(this.data.currencyToSpend);
        this.form.get('currencyToReceive')?.setValue(this.data.currencyToReceive);
      }
      this.form.get('amountToSpend')?.setValue(this.data.amountToSpend);
      this.form.get('amountToReceive')?.setValue(this.data.amountToReceive);
      this.form.get('rate')?.setValue(this.data.rate);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const transaction = {
        transactionId: this.transactionId,
        destination: this.form.get('address')?.value,
        currencyToSpend: (this.data?.type === TransactionType.Withdrawal) ?
        this.form.get('currencyToReceive')?.value :
        this.form.get('currencyToSpend')?.value,
        currencyToReceive: (this.data?.type === TransactionType.Withdrawal) ?
        this.form.get('currencyToSpend')?.value :
        this.form.get('currencyToReceive')?.value,
        amountToSpend: parseFloat(this.form.get('amountToSpend')?.value ?? '0'),
        amountToReceive: parseFloat(this.form.get('amountToReceive')?.value ?? '0'),
        rate: parseFloat(this.form.get('rate')?.value ?? '0')
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
