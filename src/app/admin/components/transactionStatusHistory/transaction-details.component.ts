import { Component, ErrorHandler, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AccountStatus, KycStatus, Rate, SettingsCommon, Transaction, TransactionKycStatus, TransactionStatus, TransactionStatusDescriptorMap, TransactionType } from 'src/app/model/generated-models';
import { AdminTransactionStatusList, CurrencyView, TransactionKycStatusList, TransactionStatusList, TransactionStatusView, UserStatusList } from 'src/app/model/payment.model';
import { TransactionItemFull } from 'src/app/model/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExchangeRateService } from 'src/app/services/rate.service';
import { getTransactionAmountHash, getTransactionStatusHash } from 'src/app/utils/utils';

@Component({
  selector: 'app-admin-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminTransactionDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input() set transaction(val: TransactionItemFull | undefined) {
    this.setFormData(val);
    this.pStatusHash = val?.statusHash ?? 0;
    this.pAmountHash = val?.amountHash ?? 0;
    this.pDefaultRate = val?.rate ?? 0;
    this.setCurrencies(this.pCurrencies);
    if (val?.type === TransactionType.Sell) {
      this.amountToSpendTitle = 'Amount To Sell';
      this.currencyToSpendTitle = 'Currency To Sell';
    }
    this.systemFeeTitle = `Fee, ${val?.currencyFiat}`;
  }
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
  @Output() close = new EventEmitter();

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
  private pStatusHash = 0;
  private pAmountHash = 0;
  private statusChanged = false;
  private amountChanged = false;
  private restartTransaction = false;
  private recalculateAmounts = false;
  private transactionToUpdate: Transaction | undefined = undefined;
  private pDefaultRate = 0;
  private pCurrencies: CurrencyView[] = [];
  private deleteDialog?: NgbModalRef;
  private updateDialog?: NgbModalRef;
  private statusDialog?: NgbModalRef;
  private amountDialog?: NgbModalRef;
  private amountDialogContent: any;
  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  cancelInProgress = false;
  errorMessage = '';
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
  notPaidStatus = false;
  notDeclinedStatus = false;
  kycStatus = '';
  accountStatus = '';
  showTransferHash = false;
  showBenchmarkTransferHash = false;
  transferOrderBlockchainLink = '';
  benchmarkTransferOrderBlockchainLink = '';
  amountToSpendTitle = 'Amount To Buy';
  currencyToSpendTitle = 'Currency To Buy';
  systemFeeTitle = 'Fee, EUR';
  editableDestination = false;
  destroyed = false;

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
    private modalService: NgbModal,
    private errorHandler: ErrorService,
    private exchangeRate: ExchangeRateService,
    private adminService: AdminDataService) { }

  ngOnInit(): void {
    this.getSettingsCommon();
    this.exchangeRate.register(this.onExchangeRateUpdated.bind(this));
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
    this.exchangeRate.stop();
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
    const currencyToSpend = this.currenciesToSpend.find(x => x.symbol === currencyToSpendSymbol);
    const spendFiat = currencyToSpend?.fiat ?? false;
    const spend = this.form.get('currencyToSpend')?.value;
    const receive = this.form.get('currencyToReceive')?.value;
    if (spendFiat) {
      this.exchangeRate.setCurrency(spend, receive, TransactionType.Buy);
    } else {
      this.exchangeRate.setCurrency(receive, spend, TransactionType.Buy);
    }
    this.exchangeRate.update();
  }

  private setCurrencies(list: CurrencyView[]): void {
    if (this.data) {
      const currencyToSpendSymbol = this.data?.currencyToSpend;
      const currencyToSpend = list.find(x => x.symbol === currencyToSpendSymbol);
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
      if (this.data.status === TransactionStatus.Completed ||
        this.data.status === TransactionStatus.Paid ||
        this.data.status === TransactionStatus.Exchanged ||
        this.data.status === TransactionStatus.Exchanging ||
        this.data.status === TransactionStatus.TransferBenchmarkWaiting) {
        this.notPaidStatus = false;
      } else {
        this.notPaidStatus = true;
      }
      if (this.data.status === TransactionStatus.Completed ||
        this.data.status === TransactionStatus.PaymentDeclined) {
        this.notDeclinedStatus = false;
      } else {
        this.notDeclinedStatus = true;
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

  filterByUserId(): void {
    this.router.navigateByUrl(`/admin/customers/${this.data?.user?.id}`).then(() => {
      window.location.reload();
    });
  }

  updateRate(): void {
    if (this.currentRate) {
      this.form.get('rate')?.setValue(this.currentRate);
    }
  }

  updateTransaction(): void {
    this.saveInProgress = true;
    const requestData$ = this.adminService.updateTransaction(
      this.transactionToUpdate as Transaction,
      this.restartTransaction,
      this.recalculateAmounts);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = (!error || error === '') ? this.errorHandler.getCurrentError() : error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSubmit(content: any): void {
    this.submitted = true;
    if (this.form.valid) {
      const currentRateValue = this.form.get('rate')?.value;
      let currentRate: number | undefined = undefined;
      if (currentRateValue !== undefined) {
        currentRate = parseFloat(currentRateValue);
      }
      // if (currentRate === this.pDefaultRate) {
      //   currentRate = undefined;
      // }
      this.transactionToUpdate = {
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
        this.transactionToUpdate.status,
        this.transactionToUpdate.kycStatus ?? TransactionKycStatus.KycWaiting,
        this.transactionToUpdate.accountStatus ?? AccountStatus.Closed);
      const amountHash = getTransactionAmountHash(
        currentRate ?? this.pDefaultRate,
        this.transactionToUpdate.amountToSpend ?? 0,
        this.transactionToUpdate.feeFiat ?? 0);
      this.statusChanged = this.pStatusHash !== statusHash;
      this.amountChanged = this.pAmountHash !== amountHash;
      this.updateDialog = this.modalService.open(content, {
        backdrop: 'static',
        windowClass: 'modalCusSty',
      });
    }
  }

  private deleteTransaction(): void {
    this.cancelInProgress = true;
    const requestData = this.adminService.deleteTransaction(this.transactionId);
    this.subscriptions.add(
      requestData.subscribe(({ data }) => {
        this.cancelInProgress = false;
        this.save.emit();
      }, (error) => {
        this.errorMessage = error;
        this.cancelInProgress = false;
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

  onDelete(content: any): void {
    this.deleteDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  onPaid(content: any): void {
    this.fastStatusChange(TransactionStatus.Paid, content);
  }

  onDeclined(content: any): void {
    this.fastStatusChange(TransactionStatus.PaymentDeclined, content);
  }
  
  fastStatusChange(newStatus: TransactionStatus, content: any): void {
    this.transactionToUpdate = {
      transactionId: this.transactionId,
      status: newStatus,
      destination: this.data?.address ?? '',
      feeFiat: this.data?.fees ?? 0,
      rate: undefined,
      currencyToSpend: this.data?.currencyToSpend ?? 0,
      currencyToReceive: this.data?.currencyToReceive ?? 0,
      amountToSpend: this.data?.amountToSpend ?? 0,
      kycStatus: this.data?.kycStatusValue ?? TransactionKycStatus.KycApproved,
      accountStatus: this.data?.accountStatusValue ?? AccountStatus.Live,
      benchmarkTransferOrder: {
        orderId: this.data?.benchmarkTransferOrderId,
        transferHash: this.data?.benchmarkTransferOrderHash
      },
      comment: this.data?.comment ?? '',
      transferOrder: {
        orderId: this.data?.transferOrderId,
        transferHash: this.data?.transferOrderHash
      },
    } as Transaction;
    this.amountChanged = false;
    this.statusChanged = true;
    this.updateDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onConfirmDelete(): void {
    if (this.deleteDialog) {
      this.deleteDialog.close('');
      this.deleteTransaction();
    }
  }

  onConfirmUpdate(statusContent: any, amountContent: any): void {
    this.amountDialogContent = amountContent;
    if (this.updateDialog) {
      this.updateDialog.close('');
      if (this.statusChanged) {
        this.statusDialog = this.modalService.open(statusContent, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      } else {
        if (this.amountChanged) {
          this.amountDialog = this.modalService.open(this.amountDialogContent, {
            backdrop: 'static',
            windowClass: 'modalCusSty',
          });
        } else {
          this.updateTransaction();
        }
      }
    }
  }

  onChangeTransactionStatusConfirm(restartTransaction: number): void {
    this.restartTransaction = (restartTransaction === 1);
    if (this.statusDialog) {
      this.statusDialog.close('');
    }
    if (this.amountChanged) {
      this.amountDialog = this.modalService.open(this.amountDialogContent, {
        backdrop: 'static',
        windowClass: 'modalCusSty',
      });
    } else {
      this.updateTransaction();
    }
  }

  onChangeTransactionAmountConfirm(recalcTransaction: number): void {
    this.recalculateAmounts = (recalcTransaction === 1);
    if (this.amountDialog) {
      this.amountDialog.close('');
    }
    this.updateTransaction();
  }
}
