import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { LayoutService } from 'src/app/admin_old/services/layout.service';
import { DeleteDialogBox } from 'src/app/components/dialogs/delete-box.dialog';
import { YesNoDialogBox } from 'src/app/components/dialogs/yesno-box.dialog';
import { AccountStatus, KycStatus, Rate, SettingsCommon, Transaction, TransactionKycStatus, TransactionStatus, TransactionStatusDescriptorMap, TransactionType } from 'src/app/model/generated-models';
import { AdminTransactionStatusList, CurrencyView, TransactionKycStatusList, TransactionStatusList, TransactionStatusView, UserStatusList } from 'src/app/model/payment.model';
import { TransactionItemFull } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { getTransactionAmountHash, getTransactionStatusHash } from 'src/app/utils/utils';

@Component({
  selector: 'app-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input() set transaction(val: TransactionItemFull | undefined) {
    this.setFormData(val);
    this.pStatusHash = val?.statusHash ?? 0;
    this.pAmountHash = val?.amountHash ?? 0;
    this.pDefaultRate = val?.rate ?? 0;
    this.setCurrencies(this.pCurrencies);
    this.layoutService.setBackdrop(!val?.id);
    if (val?.type === TransactionType.Sell) {
      this.amountToSpendTitle = 'Amount To Sell';
    }
    this.systemFeeTitle = `Fee, ${val?.currencyFiat}`;
  }
  @Input() cancelable = false;
  @Input() set userStatuses(list: TransactionStatusDescriptorMap[]) {
    this.transactionStatuses = TransactionStatusList.map(data => {
      const statusName = this.getTransactionStatusName(list, data);
      return {
        id: data.id,
        name: statusName
      } as TransactionStatusView;
    });
    if (this.transactionStatus) {
      this.transactionStatusName = this.transactionStatuses.find(x => x.id === this.transactionStatus)?.name ?? '';
    }
  }
  @Input() set currencies(list: CurrencyView[]) {
    this.pCurrencies = list;
    this.setCurrencies(list);
  }
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pStatusHash = 0;
  private pAmountHash = 0;
  private pDefaultRate = 0;
  private pCurrencies: CurrencyView[] = [];
  private subscriptions: Subscription = new Subscription();

  TRANSACTION_TYPE: typeof TransactionType = TransactionType;
  data: TransactionItemFull | undefined = undefined;
  accountStatuses = UserStatusList;
  kycStatuses = TransactionKycStatusList;
  transactionStatuses: TransactionStatusView[] = [];
  removable = false;
  transactionId = '';
  transactionType: TransactionType = TransactionType.System;
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];
  currentRate = 0;
  transactionStatus: TransactionStatus | undefined = undefined;
  transactionStatusName = '';
  kycStatus = '';
  accountStatus = '';
  showTransferHash = false;
  showBenchmarkTransferHash = false;
  transferOrderBlockchainLink = '';
  benchmarkTransferOrderBlockchainLink = '';
  amountToSpendTitle = 'Amount To Buy';
  systemFeeTitle = 'Fee, EUR';
  editableDestination = false;

  form = this.formBuilder.group({
    address: ['', { validators: [Validators.required], updateOn: 'change' }],
    currencyToSpend: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    currencyToReceive: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    amountToSpend: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    rate: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    fee: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
    transactionStatus: [TransactionStatus.New, { validators: [Validators.required], updateOn: 'change' }],
    kycStatus: [KycStatus.Unknown, { validators: [Validators.required], updateOn: 'change' }],
    accountStatus: [AccountStatus.Closed, { validators: [Validators.required], updateOn: 'change' }],
    transferHash: [undefined],
    benchmarkTransferHash: [undefined],
    comment: [undefined]
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    public dialog: MatDialog,
    private exhangeRate: ExchangeRateService,
    private layoutService: LayoutService,
    private adminService: AdminDataService
  ) { }

  ngOnInit(): void {
    this.getSettingsCommon();
    this.exhangeRate.register(this.onExchangeRateUpdated.bind(this));
    this.subscriptions.add(
      this.form.get('currencyToSpend')?.valueChanges.subscribe(val => {
        this.startExchangeRate();
      })
    );
    this.subscriptions.add(
      this.form.get('currencyToReceive')?.valueChanges.subscribe(val => {
        this.startExchangeRate();
      })
    );
  }

  ngOnDestroy(): void {
    this.exhangeRate.stop();
    this.subscriptions.unsubscribe();
  }

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
    //this.rateErrorMessage = error;
    if (rate) {
      this.currentRate = rate.depositRate;
    }
  }

  private startExchangeRate(): void {
    if (this.currenciesToSpend.length === 0) {
      return;
    }
    const currencyToSpendSymbol = this.data?.currencyToSpend;
    const currencyToSpend = this.currenciesToSpend.find(x => x.id === currencyToSpendSymbol);
    const spendFiat = currencyToSpend?.fiat ?? false;
    const spend = this.form.get('currencyToSpend')?.value;
    const receive = this.form.get('currencyToReceive')?.value;
    if (spendFiat) {
      this.exhangeRate.setCurrency(spend, receive, TransactionType.Buy);
    } else {
      this.exhangeRate.setCurrency(receive, spend, TransactionType.Buy);
    }
    this.exhangeRate.update();
  }

  private setCurrencies(list: CurrencyView[]): void {
    if (this.data) {
      const currencyToSpendSymbol = this.data?.currencyToSpend;
      const currencyToSpend = list.find(x => x.id === currencyToSpendSymbol);
      if (currencyToSpend) {
        if (this.data.type === TransactionType.Receive || this.data.type === TransactionType.Transfer) {
          this.currenciesToSpend = list.filter(x => x.fiat === false);
          this.currenciesToReceive = list.filter(x => x.fiat === false);
        } else if (this.data.type === TransactionType.Deposit || this.data.type === TransactionType.Withdrawal) {
          this.currenciesToSpend = list.filter(x => x.fiat === true);
          this.currenciesToReceive = list.filter(x => x.fiat === true);
        } else {
          this.currenciesToSpend = list.filter(x => x.fiat === currencyToSpend.fiat);
          this.currenciesToReceive = list.filter(x => x.fiat === !currencyToSpend.fiat);
        }
        this.form.get('currencyToSpend')?.setValue(this.data?.currencyToSpend);
        this.form.get('currencyToReceive')?.setValue(this.data?.currencyToReceive);
      }
      this.startExchangeRate();
    }
  }

  private setFormData(val: TransactionItemFull | undefined): void {
    this.data = val;
    this.transactionId = val?.id ?? '';
    this.transactionType = val?.type ?? TransactionType.System;
    this.transferOrderBlockchainLink = val?.transferOrderBlockchainLink ?? '';
    this.benchmarkTransferOrderBlockchainLink = val?.benchmarkTransferOrderBlockchainLink ?? '';
    this.removable = true;//val?.statusInfo?.value.canBeCancelled ?? false;  // confirmed
    if (this.data) {
      this.form.get('address')?.setValue(this.data.address);
      this.form.get('rate')?.setValue(this.data.rate);
      this.form.get('fee')?.setValue(this.data.fees);
      this.form.get('amountToSpend')?.setValue(this.data.amountToSpend);
      this.form.get('currencyToSpend')?.setValue(this.data.currencyToSpend);
      this.form.get('currencyToReceive')?.setValue(this.data.currencyToReceive);
      this.form.get('transactionStatus')?.setValue(this.data.status);
      this.form.get('kycStatus')?.setValue(this.data.kycStatusValue);
      this.form.get('accountStatus')?.setValue(this.data.accountStatusValue);
      this.form.get('transferHash')?.setValue(this.data.transferOrderHash);
      this.form.get('benchmarkTransferHash')?.setValue(this.data.benchmarkTransferOrderHash);
      this.form.get('comment')?.setValue(this.data.comment);
      this.transactionStatus = this.data.status;
      if (this.transactionStatuses.length > 0) {
        this.transactionStatusName = this.transactionStatuses.find(x => x.id === this.transactionStatus)?.name ?? '';
      }
      this.showTransferHash = (this.data.transferOrderId !== '');
      this.showBenchmarkTransferHash = (this.data.benchmarkTransferOrderId !== '');
      this.kycStatus = TransactionKycStatusList.find(x => x.id === this.data?.kycStatusValue)?.name ?? '';
      this.accountStatus = UserStatusList.find(x => x.id === this.data?.accountStatusValue)?.name ?? '';
    }
    if (this.transactionType === TransactionType.Withdrawal || this.transactionType === TransactionType.Deposit) {
      this.form.get('address')?.setValidators([]);
      this.form.updateValueAndValidity();
    }
  }

  private getSettingsCommon(): void {
    this.subscriptions.add(
      this.adminService.getSettingsCommon()?.valueChanges.subscribe(settings => {
        const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
        const additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
        this.editableDestination = additionalSettings.admin?.editTransactionDestination ?? false;
      })
    );
  }

  updateRate(): void {
    this.form.get('rate')?.setValue(this.currentRate);
  }

  private saveTransaction(transaction: Transaction, statusChanged: boolean, amountChanged: boolean): void {
    const dialogRef = this.dialog.open(DeleteDialogBox, {
      width: '400px',
      data: {
        title: 'Update transaction',
        message: `You are going to update transaction data. Confirm operation.`,
        button: 'CONFIRM'
      }
    });
    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          if (statusChanged) {
            this.requestTransactionStatusChange(transaction, amountChanged);
          } else {
            this.requestTransactionAmountChange(transaction, false);
          }
        }
      })
    );
  }

  private requestTransactionStatusChange(transaction: Transaction, requireAmountChangeConfirmation: boolean): void {
    const dialogRef = this.dialog.open(YesNoDialogBox, {
      width: '400px',
      data: {
        title: 'Update transaction',
        message: `You are going to change the transaction status. Should we restart the transaction handling after saving?`
      }
    });
    this.subscriptions.add(
      dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
        if (result && result !== 0) {
          const changeStatus = (result === 1);
          if (requireAmountChangeConfirmation) {
            this.requestTransactionAmountChange(transaction, changeStatus);
          } else {
            this.updateTransaction(transaction, changeStatus, false);
          }
        }
      })
    );
  }

  private requestTransactionAmountChange(transaction: Transaction, changeStatus: boolean): void {
    const dialogRef = this.dialog.open(YesNoDialogBox, {
      width: '400px',
      data: {
        title: 'Update transaction',
        message: `You are going to change the transaction amounts. Should we recalculate transaction after saving?`
      }
    });
    this.subscriptions.add(
      dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
        if (result && result !== 0) {
          this.updateTransaction(transaction, changeStatus, result === 1);
        }
      })
    );
  }

  updateTransaction(transaction: Transaction, restartTransaction: boolean, recalculateAmounts: boolean): void {
    const requestData$ = this.adminService.updateTransaction(transaction, restartTransaction, recalculateAmounts);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.save.emit();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      const currentRateValue = this.form.get('rate')?.value;
      let currentRate: number | undefined = undefined;
      if (currentRateValue !== undefined) {
        currentRate = parseFloat(currentRateValue);
      }
      if (currentRate === this.pDefaultRate) {
        currentRate = undefined;
      }
      const transaction = {
        transactionId: this.transactionId,
        destination: this.form.get('address')?.value,
        currencyToSpend: this.form.get('currencyToSpend')?.value,
        currencyToReceive: this.form.get('currencyToReceive')?.value,
        amountToSpend: parseFloat(this.form.get('amountToSpend')?.value ?? '0'),
        rate: currentRate,
        feeFiat: parseFloat(this.form.get('fee')?.value ?? '0'),
        status: this.form.get('transactionStatus')?.value,
        kycStatus: this.form.get('kycStatus')?.value,
        accountStatus: this.form.get('accountStatus')?.value,
        transferOrder: {
          orderId: this.data?.transferOrderId,
          transferHash: this.form.get('transferHash')?.value ?? ''
        },
        benchmarkTransferOrder: {
          orderId: this.data?.benchmarkTransferOrderId,
          transferHash: this.form.get('benchmarkTransferHash')?.value ?? ''
        },
        comment: this.form.get('comment')?.value ?? ''
      } as Transaction;
      const statusHash = getTransactionStatusHash(
        transaction.status,
        transaction.kycStatus ?? TransactionKycStatus.KycWaiting,
        transaction.accountStatus ?? AccountStatus.Closed);
      const amountHash = getTransactionAmountHash(
        currentRate ?? this.pDefaultRate,
        transaction.amountToSpend ?? 0,
        transaction.feeFiat ?? 0);
      this.saveTransaction(transaction, this.pStatusHash !== statusHash, this.pAmountHash !== amountHash);
    }
  }

  private deleteTransaction(): void {
    const requestData = this.adminService.deleteTransaction(this.transactionId);
    this.subscriptions.add(
      requestData.subscribe(({ data }) => {
        this.save.emit();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private getTransactionStatusName(list: TransactionStatusDescriptorMap[], data: TransactionStatusView): string {
    const status = list.find(x => x.key === data.id);
    const adminStatus = status?.value.adminStatus;
    const statusName = data.name;
    let adminStatusName = 'Unknown';
    if (adminStatus) {
      adminStatusName = AdminTransactionStatusList.find(x => x.id === adminStatus)?.name ?? 'Unknown';
    }
    status?.value.adminStatus ?? 'Unknown';
    return `${adminStatusName} (${statusName})`;
  }

  onDelete(): void {
    if (this.transactionId !== '' && this.removable) {
      const dialogRef = this.dialog.open(DeleteDialogBox, {
        width: '400px',
        data: {
          title: 'Delete transaction',
          message: `You are going to delete selected transaction. Confirm operation.`,
          button: 'DELETE'
        }
      });
      this.subscriptions.add(
        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.deleteTransaction();
          }
        })
      );
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
