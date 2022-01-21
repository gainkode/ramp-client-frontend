import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { AccountStatus, KycStatus, Rate, Transaction, TransactionKycStatus, TransactionStatus, TransactionType, TransferOrder } from 'src/app/model/generated-models';
import { CurrencyView, TransactionKycStatusList, TransactionStatusList, UserStatusList } from 'src/app/model/payment.model';
import { TransactionItemDeprecated } from 'src/app/model/transaction.model';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { getTransactionStatusHash } from 'src/app/utils/utils';

@Component({
  selector: 'app-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
  @Input() set transaction(val: TransactionItemDeprecated | undefined) {
    this.setFormData(val);
    this.pStatusHash = val?.statusHash ?? 0;
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
  @Output() save = new EventEmitter<{
    transaction: Transaction,
    statusChanged: boolean
  }>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pStatusHash = 0;
  private subscriptions: Subscription = new Subscription();

  data: TransactionItemDeprecated | undefined = undefined;
  accountStatuses = UserStatusList;
  kycStatuses = TransactionKycStatusList;
  transactionStatuses = TransactionStatusList;
  removable = false;
  transactionId = '';
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];
  currentRate = 0;
  showTransferHash = false;
  showBenchmarkTransferHash = false;

  form = this.formBuilder.group({
    address: ['', { validators: [Validators.required], updateOn: 'change' }],
    currencyToSpend: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    currencyToReceive: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    amountToReceive: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    amountToSpend: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    rate: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    fee: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    transactionStatus: [TransactionStatus.New, { validators: [Validators.required], updateOn: 'change' }],
    kycStatus: [KycStatus.Unknown, { validators: [Validators.required], updateOn: 'change' }],
    accountStatus: [AccountStatus.Closed, { validators: [Validators.required], updateOn: 'change' }],
    transferHash: [undefined],
    benchmarkTransferHash: [undefined]
  });

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private exhangeRate: ExchangeRateService,
    private layoutService: LayoutService
  ) { }

  ngOnInit(): void {
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
  }

  ngOnDestroy(): void {
    this.exhangeRate.stop();
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
    //this.rateErrorMessage = error;
    if (rate) {
      this.currentRate = rate.depositRate;
    }
  }

  private startExchangeRate(): void {
    const currencyToSpendSymbol = this.data?.currencyToSpend;
    const currencyToSpend = this.currenciesToSpend.find(x => x.id === currencyToSpendSymbol);
    if (currencyToSpend?.fiat) {
      this.exhangeRate.setCurrency(this.form.get('currencyToReceive')?.value, this.form.get('currencyToSpend')?.value, TransactionType.Deposit);
    } else {
      this.exhangeRate.setCurrency(this.form.get('currencyToSpend')?.value, this.form.get('currencyToReceive')?.value, TransactionType.Deposit);
    }
    this.exhangeRate.update();
  }

  private setFormData(val: TransactionItemDeprecated | undefined): void {
    this.data = val;
    this.transactionId = val?.id ?? '';
    this.removable = true;//val?.statusInfo?.value.canBeCancelled ?? false;  // confirmed
    if (this.data) {
      this.form.get('address')?.setValue(this.data.address);
      this.form.get('amountToSpend')?.setValue(this.data.amountToSpend);
      this.form.get('amountToReceive')?.setValue(this.data.amountToReceive);
      this.form.get('currencyToSpend')?.setValue(this.data?.currencyToSpend);
      this.form.get('currencyToReceive')?.setValue(this.data?.currencyToReceive);
      this.form.get('rate')?.setValue(this.data.rate);
      this.form.get('fee')?.setValue(this.data.fees);
      this.form.get('transactionStatus')?.setValue(this.data.status);
      this.form.get('kycStatus')?.setValue(this.data.kycStatusValue);
      this.form.get('accountStatus')?.setValue(this.data.accountStatusValue);
      this.form.get('transferHash')?.setValue(this.data.transferOrderHash);
      this.form.get('benchmarkTransferHash')?.setValue(this.data.benchmarkTransferOrderHash);
      this.showTransferHash = (this.data.transferOrderId !== '');
      this.showBenchmarkTransferHash = (this.data.benchmarkTransferOrderId !== '');
      this.startExchangeRate();
    }
  }

  updateRate(): void {
    this.form.get('rate')?.setValue(this.currentRate);
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
        feeFiat: parseFloat(this.form.get('fee')?.value ?? '0'),
        status: this.form.get('transactionStatus')?.value,
        kycStatus: this.form.get('kycStatus')?.value,
        accountStatus: this.form.get('accountStatus')?.value,
        initialRate: (this.data?.initialAmount) ? parseFloat(this.form.get('rate')?.value ?? '0') : undefined,
        transferOrder: {
          orderId: this.data?.transferOrderId,
          transferHash: this.form.get('transferHash')?.value ?? ''
        },
        benchmarkTransferOrder: {
          orderId: this.data?.benchmarkTransferOrderId,
          transferHash: this.form.get('benchmarkTransferHash')?.value ?? ''
        }
      } as Transaction;
      const hash = getTransactionStatusHash(
        transaction.status,
        transaction.kycStatus ?? TransactionKycStatus.KycWaiting,
        transaction.accountStatus ?? AccountStatus.Closed);
      this.save.emit({
        transaction,
        statusChanged: this.pStatusHash !== hash
      });
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
