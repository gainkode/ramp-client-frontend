import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { AccountStatus, Rate, SettingsCommon, TransactionKycStatus, TransactionStatus, TransactionStatusDescriptorMap, TransactionType, TransactionTypeSetting, TransactionUpdateInput, TransactionUpdatePaymentOrderChanges } from 'model/generated-models';
import { AdminTransactionStatusList, CurrencyView, TransactionKycStatusList, TransactionStatusList, TransactionStatusView, TransactionTypeList, UserStatusList } from 'model/payment.model';
import { ScreeningAnswer, TransactionItemFull } from 'model/transaction.model';
import { Observable, Subject, Subscription, map, takeUntil } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ExchangeRateService } from 'services/rate.service';
import { getTransactionAmountHash, getTransactionStatusHash } from 'utils/utils';
import { TransactionRecallModalComponent, TransactionRefundModalComponent } from '..';
import { NUMBER_PATTERN } from 'utils/constants';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-transaction-details',
  templateUrl: 'transaction-details.component.html',
  styleUrls: ['transaction-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminTransactionDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('originalorderid_confirm_content') originalOrderIdDialogContent: ElementRef | undefined = undefined;
  @ViewChild('payment_status_confirm_content') paymentStatusConfirmContent: ElementRef | undefined = undefined;
  @ViewChild('update_confirm_content') updateConfirmContent: ElementRef | undefined = undefined;
  
  @Input() permission = 0;
  @Input() isScreeningInfo = false;
  @Input() set transaction(val: TransactionItemFull | undefined) {
    this.setFormData(val);
    this.setCurrencies(this.pCurrencies);
    
    this.pStatusHash = val?.statusHash ?? 0;
    this.pAmountHash = val?.amountHash ?? 0;
    this.pDefaultRate = val?.rate ?? 0;

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

  form = this.fb.group({
    address: this.fb.control<string>(undefined),
    currencyToSpend: this.fb.control<string>(undefined, Validators.required),
    currencyToReceive: this.fb.control<string>(undefined, Validators.required),
    amountToSpend: this.fb.control<number>(undefined, [Validators.required, Validators.pattern(NUMBER_PATTERN)]),
    rate: this.fb.control<number>(undefined, [Validators.required, Validators.pattern(NUMBER_PATTERN)]),
    fees: this.fb.control<number>(undefined, [Validators.required, Validators.pattern(NUMBER_PATTERN)]),
    transactionStatus: this.fb.control<TransactionStatus>(TransactionStatus.New, Validators.required),
    kycStatus: this.fb.control<TransactionKycStatus>(undefined, Validators.required),
    accountStatus: this.fb.control<AccountStatus>(AccountStatus.Closed, Validators.required),
    widgetId: this.fb.control<string>(undefined),
    transferOrderHash: this.fb.control<string>(undefined),
    transactionType: this.fb.control<TransactionType>(undefined, Validators.required),
    screeningAnswer: this.fb.control<ScreeningAnswer>(undefined),
    screeningRiskscore: this.fb.control<number>(undefined),
    screeningStatus: this.fb.control<string>(undefined),
    benchmarkTransferOrderHash: this.fb.control<string>(undefined),
    comment: this.fb.control<string>(undefined),
    merchantFeePercent: this.fb.control<number>(undefined),
    feePercent: this.fb.control<number>(undefined),
    refundOrderAddress: this.fb.control<string>(undefined),
    refundOrderAmount: this.fb.control<number>(undefined),
    recallNumber: this.fb.control<string>(undefined),
  });

  private pStatusHash = 0;
  private pAmountHash = 0;
  private statusChanged = false;
  private amountChanged = false;
  private originalOrderIdChanged = false;
  private restartTransaction = false;
  private recalculateAmounts = false;
  private transactionToUpdate: TransactionUpdateInput | undefined = undefined;
  private pDefaultRate = 0;
  private pCurrencies: CurrencyView[] = [];
  private deleteDialog?: NgbModalRef;
  private updateDialog?: NgbModalRef;
  private statusDialog?: NgbModalRef;
  private amountDialog?: NgbModalRef;
  private originalOrderDialog?: NgbModalRef;
  private amountDialogContent: any;
  // private originalOrderIdDialogContent: any;
  private subscriptions: Subscription = new Subscription();

  selectedTabIndex: number;
  transactionTypes = TransactionTypeList;
  submitted = false;
  saveInProgress = false;
  flagInProgress = false;
  cancelInProgress = false;
  errorMessage = '';
  TRANSACTION_TYPE: typeof TransactionType = TransactionType;
  data: TransactionItemFull | undefined = undefined;
  accountStatuses = UserStatusList;
  kycStatuses = TransactionKycStatusList;
  transactionStatuses: TransactionStatusView[] = [];
  removable = false;
  isFastPaid = false;
  transactionId = '';
  scriningData = {};
  transactionType: TransactionType = TransactionType.System;
  currenciesToSpend: CurrencyView[] = [];
  currenciesToReceive: CurrencyView[] = [];
  currentRate = 0;
  transactionStatus: TransactionStatus | undefined = undefined;
  transactionStatusName = '';
  notPaidStatuses = [TransactionStatus.Completed, TransactionStatus.Paid, TransactionStatus.Exchanged, TransactionStatus.Exchanging, TransactionStatus.TransferBenchmarkWaiting];
  exchangeStatuses = [TransactionStatus.Paid];
  isTransactionNotDepositOrWithdrawal = false;
  isSellTransactionType = false;
  isReceiveTransactionType = false;
  isTransactionCompleted = false;
  kycStatus = '';
  accountStatus = '';
  transferOrderBlockchainLink = '';
  benchmarkTransferOrderBlockchainLink = '';
  amountToSpendTitle = 'Amount To Buy';
  currencyToSpendTitle = 'Currency To Buy';
  systemFeeTitle = 'Fee, EUR';
  editableDestination = false;
  flag = false;
  transactionTypeSetting: TransactionTypeSetting = undefined;
  originalOrderId = undefined;

  get merchantFeePercentField(): AbstractControl | null {
    return this.form.controls.merchantFeePercent;
  }

  get merchantFeeFiat(): string {
    return `${((this.merchantFeePercentField.value / 100) * this.data.amountToSpend / this.data.rate).toFixed(8)}, ${this.data.currencyCrypto}`;
  }

  get feePercentField(): AbstractControl | null {
    return this.form.controls.feePercent;
  }

  get feePercentFiat(): string {
    return `${((this.feePercentField?.value / 100) * this.data.amountToSpend).toFixed(2)}, ${this.data.currencyFiat}`;
  }

  widgetOptions$: Observable<CommonTargetValue[]>;
  isTransactionRefreshing = false;
  instrumentDetailsData: string[] = [];
  paymentOrderChanges: TransactionUpdatePaymentOrderChanges = {};
	private readonly unsubscribe$ = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private errorHandler: ErrorService,
    private exchangeRate: ExchangeRateService,
    private _snackBar: MatSnackBar,
    private adminService: AdminDataService) { }

  ngOnInit(): void {
    this.getSettingsCommon();
    this.exchangeRate.register(this.onExchangeRateUpdated.bind(this));

    this.form.controls.currencyToSpend.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.startExchangeRate());

    this.form.controls.currencyToReceive.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.startExchangeRate());

    this.form.controls.transactionStatus.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        if (value === TransactionStatus.Refund) {
          this.onRecallNumberModal(false);
        }

        if (value === TransactionStatus.Paid ) {
          if (this.data.paymentOrder) {
            if (!this.isTransactionCompleted) {
              this.originalOrderDialog = this.modalService.open(this.paymentStatusConfirmContent, {
                backdrop: 'static',
                windowClass: 'modalCusSty',
              });
            } 
          } else {
            this.onOriginalOrderModal(this.originalOrderIdDialogContent);
          }
        }

        if (value === TransactionStatus.Chargeback) {
          if (!this.data.paymentOrder) {
						this._snackBar.open(`The transaction ${this.data.code} does not have a payment order; therefore, you cannot set the Chargeback status for it. Please either use the Refund status instead or set the Paid status first and then the Chargeback status.`, null, { duration: 10000 });
            this.form.controls.transactionStatus.patchValue(this.data.status);
          } else {
						this.onRecallNumberModal(true);
          }
        }

        if (!this.data.recallNumber) {
  				this.form.controls.recallNumber.patchValue(null);
  			}	

        if (!this.data.paymentOrder && this.originalOrderIdChanged) {
          this.originalOrderId = null;
          this.paymentOrderChanges.originalOrderId = null;
        }
      });
    
    this.widgetOptions$ = this.getFilteredWidgets();

    if (this.data.paymentOrder) {
      this.isPaymentOrderCompleted();
    }

    if (this.isScreeningInfo) {
      this.selectedTabIndex = 1;
    }
  }

  onChangePaymentCancel(): void {
    this.originalOrderDialog?.close('');
    this.isFastPaid = false;
    this.form.controls.transactionStatus.patchValue(this.data.status);
  }

  onChangePaymentConfirm(): void {
    if (this.isFastPaid) {
      this.fastStatusChange(TransactionStatus.Paid, this.updateConfirmContent);
    } 

    this.isFastPaid = false;
    this.originalOrderDialog?.close('');
  }
  
  onOriginalOrderModal(content: any): void {
    if (!this.data.paymentOrder) {
      this.originalOrderDialog = this.modalService.open(this.originalOrderIdDialogContent || content, {
        backdrop: 'static',
        windowClass: 'modalCusSty',
      });
    }
  }

  onRecallNumberModal(isRequired: boolean, isFastSave: boolean = false, content?: any): void {
    if (this.data.paymentOrder) {
      const dialogRef = this.dialog.open(TransactionRecallModalComponent, {
        width: '500px',
        data: { isRequired }
      });
   
      dialogRef.afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(result => {
          if (result === 'close') {
            this.form.controls.transactionStatus.patchValue(this.data.status);
            return;
          }
  
          // continue run update modal if status Refund is settled
          if (!isRequired && isFastSave) {
            this.amountChanged = false;
            this.statusChanged = true;
        
            this.updateDialog = this.modalService.open(content, {
              backdrop: 'static',
              windowClass: 'modalCusSty',
            });
          } 
  
          if (result?.recallNumber) {
            this.form.controls.recallNumber.patchValue(result.recallNumber);
          }
      });
    }
  }

  private getFilteredWidgets(): Observable<CommonTargetValue[]> {
    return this.adminService.getWidgets(0, 100, 'name', false, <Filter>{}).pipe(
      map(result => result.list.map(widget => ({
        id: widget.id,
        title: widget.name
      } as CommonTargetValue)))
    );
  }

  private isPaymentOrderCompleted(): void {
    this.adminService.isPaymentOrderCompleted(this.data.id).subscribe((result) => this.isTransactionCompleted = result);
  }

  widgetSearchFn(term: string, item: CommonTargetValue): boolean {
    term = term.toLocaleLowerCase();

    return item.title.toLocaleLowerCase().indexOf(term) > -1 ||
    item.id && item.id.toLocaleLowerCase().indexOf(term) > -1;
  }

  ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();

    this.exchangeRate.stop();
    this.subscriptions.unsubscribe();
	}

  onExchangeRateUpdated(rate: Rate | undefined, countDownTitle: string, countDownValue: string, error: string): void {
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

    const spend = this.form.controls.currencyToSpend.value;
    const receive = this.form.controls.currencyToReceive.value;

    this.exchangeRate.setCurrency((spendFiat ? spend : receive), (spendFiat ? receive : spend), TransactionType.Buy);
    this.exchangeRate.update();
  }

  private setCurrencies(list: CurrencyView[]): void {
    if (this.data) {
      const currencyToSpendSymbol = this.data?.currencyToSpend;
      const currencyToSpend = list.find(x => x.symbol === currencyToSpendSymbol);

      if (currencyToSpend) {
        if (this.data.type === TransactionType.Receive || this.data.type === TransactionType.Transfer) {
          this.currenciesToSpend = list.filter(x => !x.fiat);
          this.currenciesToReceive = list.filter(x => !x.fiat);
        } else if (this.data.type === TransactionType.Deposit || this.data.type === TransactionType.Withdrawal) {
          this.currenciesToSpend = list.filter(x => x.fiat);
          this.currenciesToReceive = list.filter(x => x.fiat);
        } else {
          this.currenciesToSpend = list.filter(x => x.fiat === currencyToSpend.fiat);
          this.currenciesToReceive = list.filter(x => x.fiat === !currencyToSpend.fiat);
        }

        this.form.controls.currencyToSpend.setValue(this.data?.currencyToSpend);
        this.form.controls.currencyToReceive.setValue(this.data?.currencyToReceive);
      }

      this.startExchangeRate();
    }
  }

  private setFormData(val: TransactionItemFull | undefined): void {
    this.data = val;
    this.transactionId = val?.id ?? '';
    this.transactionType = val?.type ?? TransactionType.System;

    this.isTransactionNotDepositOrWithdrawal = this.transactionType !== this.TRANSACTION_TYPE.Deposit && this.transactionType !== this.TRANSACTION_TYPE.Withdrawal;
    this.isSellTransactionType = this.transactionType === this.TRANSACTION_TYPE.Sell;
    this.isReceiveTransactionType = this.transactionType === this.TRANSACTION_TYPE.Receive;

    this.transferOrderBlockchainLink = val?.transferOrderBlockchainLink ?? '';
    this.benchmarkTransferOrderBlockchainLink = val?.benchmarkTransferOrderBlockchainLink ?? '';
    this.removable = true;

    if (this.data) {
      this.flag = this.data.flag === true;

      this.form.patchValue({
        transactionType: this.data.type,
        address: this.data.address,
        rate: this.data.rate,
        fees: this.data.fees,
        amountToSpend: this.data.amountToSpend,
        currencyToSpend: this.data.currencyToSpend,
        currencyToReceive: this.data.currencyToReceive,
        transactionStatus: this.data.status,
        recallNumber: this.data.recallNumber,
        kycStatus: this.data.kycStatusValue,
        widgetId: this.data.widgetId,
        accountStatus: this.data.accountStatusValue,
        transferOrderHash: this.data.transferOrderHash,
        screeningAnswer: this.data.screeningAnswer,
        screeningRiskscore: this.data.screeningRiskscore,
        screeningStatus: this.data.screeningStatus,
        benchmarkTransferOrderHash: this.data.benchmarkTransferOrderHash,
        merchantFeePercent: this.data.merchantFeePercent,
        feePercent: this.data.feePercent,
        comment: this.data.comment
      });

      if (this.data?.screeningData?.paymentChecks && this.data?.screeningData?.paymentChecks.length > 0){
        this.scriningData = this.data?.screeningData?.paymentChecks[0];
      }

      this.transactionStatus = this.data.status;

      if (this.transactionStatuses.length > 0) {
        this.transactionStatusName = this.transactionStatuses.find(x => x.id === this.transactionStatus)?.name ?? '';
      }
    
      this.kycStatus = TransactionKycStatusList.find(x => x.id === this.data?.kycStatusValue)?.name ?? '';
      this.accountStatus = UserStatusList.find(x => x.id === this.data?.accountStatusValue)?.name ?? '';
    }

    if (this.transactionType === TransactionType.Withdrawal || this.transactionType === TransactionType.Deposit) {
      this.form.controls.address.setValidators([]);
      this.form.updateValueAndValidity();
    }


  if (this.transactionType === TransactionType.Sell || this.transactionType === TransactionType.Buy ||
      this.transactionType === TransactionType.Deposit || this.transactionType === TransactionType.Withdrawal) {
      this.instrumentDetailsData = this.getInstrumentDetails(this.data.instrumentDetailsRaw);
    }
  }

  private getSettingsCommon(): void {
    this.adminService.getSettingsCommon()
      .valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(settings => {
        const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
        const additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
        this.editableDestination = additionalSettings.admin?.editTransactionDestination ?? false;
        
        if(settingsCommon.transactionTypeSettings && settingsCommon.transactionTypeSettings.length !== 0){
          this.transactionTypeSetting = settingsCommon.transactionTypeSettings.find(item => item.transactionType === this.transactionType);
          
        this.transactionTypes = 
          this.transactionTypes.filter(item =>settingsCommon.transactionTypeSettings.find(settingType => settingType.transactionType === item.id && settingType.allowChange));
        }
    });
  }

  refreshTransaction(id: string): void {
    this.isTransactionRefreshing = true;

    this.adminService.getTransaction(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (transaction) => {
          this.isTransactionRefreshing = false;
          this.setFormData(transaction);
        }
      });
  }

  getTransactionToUpdate(): TransactionUpdateInput {
    let widgetUserParamsChanges = undefined;

    if (this.form.controls.merchantFeePercent.value) {
      widgetUserParamsChanges = {
        merchantFeePercent: this.form.controls.merchantFeePercent.value ?? ''
      };
    }

    if (this.form.controls.merchantFeePercent.value) {
      widgetUserParamsChanges = {
        merchantFeePercent: this.form.controls.merchantFeePercent.value ?? ''
      };
    }

    this.paymentOrderChanges.recallNumber = this.form.controls.recallNumber.value ?? undefined;
    
    const transactionToUpdate: TransactionUpdateInput = {
      destination: this.form.controls.address.value,
      currencyToSpend: this.form.controls.currencyToSpend.value,
      currencyToReceive: this.form.controls.currencyToReceive.value,
      amountToSpend: this.form.controls.amountToSpend.value ?? 0,
      rate: this.form.controls.rate.value,
      feeFiat: this.form.controls.fees.value ?? 0,
      status: this.form.controls.transactionStatus.value,
      widgetId: this.form.controls.widgetId.value,
      kycStatus: this.form.controls.kycStatus.value,
      accountStatus: this.form.controls.accountStatus.value,
      transferOrderChanges: {
        orderId: this.data?.transferOrderId,
        hash: this.form.controls.transferOrderHash.value ?? ''
      },
      benchmarkTransferOrderChanges: {
        orderId: this.data?.benchmarkTransferOrderId,
        hash: this.form.controls.benchmarkTransferOrderHash.value ?? ''
      },
      refundTransferOrderChanges: {
        address: this.form.controls.refundOrderAddress.value,
        amount: this.form.controls.refundOrderAmount.value
      },
      type: this.form.controls.transactionType.value ?? undefined,
      widgetUserParamsChanges,
      comment: this.form.controls.comment.value ?? '',
      flag: this.flag,
      feePercent: this.feePercentField?.value ?? undefined,
      merchantFeePercent: this.merchantFeePercentField?.value ?? undefined
    };

    return transactionToUpdate;
  }

  flagText(): String {
    return this.flag ? 'Unflag' : 'Flag';
  }

  flagValue(): void {
    this.flagInProgress = true;
    this.saveInProgress = true;
    this.flag = this.flag !== true;
    
    this.adminService.updateTransactionFlag(this.flag, this.transactionId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.saveInProgress = false;
          this.flagInProgress = false;
          this.save.emit();
        },
        error: error => {
          this.saveInProgress = false;
          this.flagInProgress = false;
          this.errorMessage = (!error || error === '') ? this.errorHandler.getCurrentError() : error;

          if (this.auth.token === '') {
            void this.router.navigateByUrl('/');
          }
        }
    });
  }

  updateRate(): void {
    if (this.currentRate) {
      this.form.controls.rate.setValue(this.currentRate);
    }
  }

  updateTransaction(): void {
    this.saveInProgress = true;
    this.transactionToUpdate = this.getTransactionToUpdate();

    this.transactionToUpdate.paymentOrderChanges = this.paymentOrderChanges;

    this.adminService.updateTransaction(
      this.transactionId,
      this.transactionToUpdate,
      this.restartTransaction,
      this.recalculateAmounts)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.saveInProgress = false;
          this.flagInProgress = false;
          this.save.emit();
        },
        error: error => {
          this.saveInProgress = false;
          this.flagInProgress = false;
          this.errorMessage = (!error || error === '') ? this.errorHandler.getCurrentError() : error;

          if (this.auth.token === '') {
            void this.router.navigateByUrl('/');
          }
        }
      });
  }

  onSubmit(content: any): void {
    this.submitted = true;

    if (this.form.valid) {
      this.transactionToUpdate = this.getTransactionToUpdate();

      const statusHash = getTransactionStatusHash(
        this.transactionToUpdate.status,
        this.transactionToUpdate.kycStatus ?? TransactionKycStatus.KycWaiting,
        this.transactionToUpdate.accountStatus ?? AccountStatus.Closed);

      const amountHash = getTransactionAmountHash(
        this.transactionToUpdate.rate ?? this.pDefaultRate,
        this.transactionToUpdate.amountToSpend ?? 0,
        this.transactionToUpdate.feePercent ?? 0,
        this.transactionToUpdate.merchantFeePercent ?? 0);
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

    this.adminService.deleteTransaction(this.transactionId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.cancelInProgress = false;
          this.save.emit();
        },
        error: (error) => {
          this.errorMessage = error;
          this.cancelInProgress = false;

          if (this.auth.token === '') {
            void this.router.navigateByUrl('/');
          }
        }
    });
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
    this.isFastPaid = true;

    if (this.data.paymentOrder) {
      if (!this.isTransactionCompleted) {
        this.originalOrderDialog = this.modalService.open(this.paymentStatusConfirmContent, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }
    } else {
      this.onOriginalOrderModal(content);
    }
  }

  onExchange(content: any): void {
    this.fastStatusChange(TransactionStatus.Exchanging, content);
  }

  onDeclined(content: any): void {
    this.fastStatusChange(TransactionStatus.PaymentDeclined, content);
  }
  
  fastStatusChange(newStatus: TransactionStatus, content: any): void {
    this.form.controls.transactionStatus.patchValue(newStatus);

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

  onChangeOriginaOrderlIdConfirm(): void {
    this.originalOrderDialog?.close('');
    this.isFastPaid = false;

    if (this.originalOrderId) {
      this.paymentOrderChanges.originalOrderId = this.originalOrderId;

      this.originalOrderIdChanged = true;
    }
  }

  onChangeTransactionStatusConfirm(restartTransaction: number): void {
    this.restartTransaction = (restartTransaction === 1);
    
    const transactionStatus = this.form.controls?.transactionStatus?.value;

    if (this.statusDialog) {
      this.statusDialog.close('');
    }

    if (this.amountChanged) {
      this.amountDialog = this.modalService.open(this.amountDialogContent, {
        backdrop: 'static',
        windowClass: 'modalCusSty',
      });
    } if (this.transactionType === TransactionType.Sell && transactionStatus === TransactionStatus.Refund){ 
      const dialogRef = this.dialog.open(TransactionRefundModalComponent, {
        width: '500px',
        data: {
          sourceWallet: this.data?.sourceWallet,
          amountToSpend: this.form?.controls.amountToSpend.value
        }
      });
   
      dialogRef.afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(result => {
          this.form.controls.refundOrderAddress.patchValue(<string>result.sourceWallet);
          this.form.controls.refundOrderAmount.patchValue(<number>result.amountToSell);
          this.updateTransaction();
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

  navigateToKrakenTrades(uuid: string): void {
    const tradeURL = `https://www.kraken.com/u/trade/trades#txid=${uuid}`;
    window.open(tradeURL, '_blank');
  }

  navigateToRecallNumber(recallNumber: string): void {
  	if (this.data.paymentOrderRecallNumberLink) {
  		const recallUrl = `${this.data.paymentOrderRecallNumberLink}/${recallNumber}`;
  		window.open(recallUrl, '_blank');
  	}
  }
  
  getInstrumentDetails(data: string): string[] {
    const result: string[] = [];
    
    try {
      const details = JSON.parse(data);

      if (details) {
        const accountData = typeof details.accountType === 'string' ? JSON.parse(details.accountType) : details.accountType;

        if (accountData) {
          const paymentData = JSON.parse(accountData.data);

          if (paymentData) {
            if (accountData.id === 'AU') {
              result.push('Australian bank');
            } else if (accountData.id === 'UK') {
              result.push('United Kingdom bank');
            } else if (accountData.id === 'EU') {
              result.push('European bank');
            } 

            const addInstrumentDetail = (label: string, ...values): void => {
              const value = values.find(v => v !== undefined && v !== null);
              if (value) {
                result.push(`${label}: ${value}`);
              }
            };

            addInstrumentDetail('Account name', paymentData.bankAccountName, paymentData.accountName);
            addInstrumentDetail('Account number', paymentData.bankAccountNumber, paymentData.accountNumber);
            addInstrumentDetail('Bank name', paymentData.bankName);
            addInstrumentDetail('Bank address', paymentData.bankAddress);
            addInstrumentDetail('Beneficiary name', paymentData.beneficiaryName);
            addInstrumentDetail('Beneficiary address', paymentData.beneficiaryAddress);
            addInstrumentDetail('Holder', paymentData.bankAccountHolderName);
            addInstrumentDetail('BSB', paymentData.bsb);
            addInstrumentDetail('Sort code', paymentData.sortCode);
            addInstrumentDetail('IBAN', paymentData.iban);
            addInstrumentDetail('SWIFT / BIC', paymentData.swiftBic);
            addInstrumentDetail('Routing Number', paymentData.routingNumber);
            addInstrumentDetail('Reference', paymentData.reference);
            addInstrumentDetail('Credit to', paymentData.creditTo);
          }
        }
      }
    } catch (e) {}

    return result;
  }
}
