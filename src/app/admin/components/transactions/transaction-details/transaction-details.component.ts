import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, map } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AccountStatus, KycStatus, Rate, SettingsCommon, TransactionKycStatus, TransactionStatus, TransactionStatusDescriptorMap, TransactionType, TransactionTypeSetting, TransactionUpdateInput } from 'model/generated-models';
import { AdminTransactionStatusList, CurrencyView, TransactionKycStatusList, TransactionStatusList, TransactionStatusView, TransactionTypeList, UserStatusList } from 'model/payment.model';
import { TransactionItemFull } from 'model/transaction.model';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ExchangeRateService } from 'services/rate.service';
import { getTransactionAmountHash, getTransactionStatusHash } from 'utils/utils';
import { Filter } from 'admin/model/filter.model';
import { CommonTargetValue } from 'model/common.model';
import { MatDialog } from '@angular/material/dialog';
import { TransactionRefundModalComponent } from '../modals/transaction-refund-modal/transaction-refund-modal.component';

@Component({
	selector: 'app-admin-transaction-details',
	templateUrl: 'transaction-details.component.html',
	styleUrls: ['transaction-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminTransactionDetailsComponent implements OnInit, OnDestroy {
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

  private pNumberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
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
  private originalOrderIdDialogContent: any;
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

  form = this.formBuilder.group({
  	address: [undefined],
  	currencyToSpend: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	currencyToReceive: [undefined, { validators: [Validators.required], updateOn: 'change' }],
  	amountToSpend: [undefined, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	rate: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	fee: [0, { validators: [Validators.required, Validators.pattern(this.pNumberPattern)], updateOn: 'change' }],
  	transactionStatus: [TransactionStatus.New, { validators: [Validators.required], updateOn: 'change' }],
  	kycStatus: [KycStatus.Unknown, { validators: [Validators.required], updateOn: 'change' }],
  	accountStatus: [AccountStatus.Closed, { validators: [Validators.required], updateOn: 'change' }],
  	widgetId: [undefined],
  	transferHash: [undefined],
  	screeningAnswer: [undefined],
  	screeningRiskscore: [undefined],
  	screeningStatus: [undefined],
  	benchmarkTransferHash: [undefined],
  	comment: [undefined],
  	transactionType: [undefined],
  	merchantFeePercent: [undefined],
		feePercent: [undefined],
		refundOrderAddress: [undefined],
		refundOrderAmount: [undefined]
  });

  get merchantFeePercentField(): AbstractControl | null {
	return this.form.get('merchantFeePercent');
}

  get merchantFeeFiat(): string {
	  return `${((this.merchantFeePercentField.value / 100) * this.data.amountToSpend / this.data.rate).toFixed(8)}, ${this.data.currencyCrypto}`;
  }

  get feePercentField(): AbstractControl | null {
	return this.form.get('feePercent');
}

  get feePercentFiat(): string {
	  return `${((this.feePercentField?.value / 100) * this.data.amountToSpend).toFixed(2)}, ${this.data.currencyFiat}`;
  }

  widgetOptions$: Observable<CommonTargetValue[]>;
  isTransactionRefreshing = false;
  instrumentDetailsData: string[] = [];
  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private auth: AuthService,
  	private modalService: NgbModal,
	private dialog: MatDialog,
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

  	this.widgetOptions$ = this.getFilteredWidgets();

  	if (this.isScreeningInfo) {
  		this.selectedTabIndex = 1;
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
  widgetSearchFn(term: string, item: CommonTargetValue): boolean {
  	term = term.toLocaleLowerCase();

  	return item.title.toLocaleLowerCase().indexOf(term) > -1 ||
		item.id && item.id.toLocaleLowerCase().indexOf(term) > -1;
  }

  ngOnDestroy(): void {
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
  				this.currenciesToSpend = list.filter(x => !x.fiat);
  				this.currenciesToReceive = list.filter(x => !x.fiat);
  			} else if (this.data.type === TransactionType.Deposit || this.data.type === TransactionType.Withdrawal) {
  				this.currenciesToSpend = list.filter(x => x.fiat);
  				this.currenciesToReceive = list.filter(x => x.fiat);
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

  	this.isTransactionNotDepositOrWithdrawal = this.transactionType !== this.TRANSACTION_TYPE.Deposit && this.transactionType !== this.TRANSACTION_TYPE.Withdrawal;
  	this.isSellTransactionType = this.transactionType === this.TRANSACTION_TYPE.Sell;
	this.isReceiveTransactionType = this.transactionType === this.TRANSACTION_TYPE.Receive;

  	this.transferOrderBlockchainLink = val?.transferOrderBlockchainLink ?? '';
  	this.benchmarkTransferOrderBlockchainLink = val?.benchmarkTransferOrderBlockchainLink ?? '';
  	this.removable = true;

  	if (this.data) {
  		this.flag = this.data.flag === true;
  		this.form.get('transactionType')?.setValue(this.data.type);
  		this.form.get('address')?.setValue(this.data.address);
  		this.form.get('rate')?.setValue(this.data.rate);
  		this.form.get('fee')?.setValue(this.data.fees);
  		this.form.get('amountToSpend')?.setValue(this.data.amountToSpend);
  		this.form.get('currencyToSpend')?.setValue(this.data.currencyToSpend);
  		this.form.get('currencyToReceive')?.setValue(this.data.currencyToReceive);
  		this.form.get('transactionStatus')?.setValue(this.data.status);
  		this.form.get('kycStatus')?.setValue(this.data.kycStatusValue);
  		this.form.get('widgetId')?.setValue(this.data.widgetId);
  		this.form.get('accountStatus')?.setValue(this.data.accountStatusValue);
  		this.form.get('transferHash')?.setValue(this.data.transferOrderHash);
  		this.form.get('screeningAnswer')?.setValue(this.data.screeningAnswer);
  		this.form.get('screeningRiskscore')?.setValue(this.data.screeningRiskscore);
  		this.form.get('screeningStatus')?.setValue(this.data.screeningStatus);
		this.form.get('benchmarkTransferHash')?.setValue(this.data.benchmarkTransferOrderHash);
		this.form.get('merchantFeePercent')?.setValue(this.data.calcMerchantFeePercent);
		this.form.get('feePercent')?.setValue(this.data.feePercent);

  		if(this.data?.screeningData?.paymentChecks && this.data?.screeningData?.paymentChecks.length > 0){
  			this.scriningData = this.data?.screeningData?.paymentChecks[0];
  		}

  		this.form.get('comment')?.setValue(this.data.comment);
  		this.transactionStatus = this.data.status;

  		if (this.transactionStatuses.length > 0) {
  			this.transactionStatusName = this.transactionStatuses.find(x => x.id === this.transactionStatus)?.name ?? '';
  		}
		
  		this.kycStatus = TransactionKycStatusList.find(x => x.id === this.data?.kycStatusValue)?.name ?? '';
  		this.accountStatus = UserStatusList.find(x => x.id === this.data?.accountStatusValue)?.name ?? '';
  	}

  	if (this.transactionType === TransactionType.Withdrawal || this.transactionType === TransactionType.Deposit) {
  		this.form.get('address')?.setValidators([]);
  		this.form.updateValueAndValidity();
  	}


	if (this.transactionType === TransactionType.Sell || 
		this.transactionType === TransactionType.Buy ||
		this.transactionType === TransactionType.Deposit ||
		this.transactionType === TransactionType.Withdrawal) {
		this.instrumentDetailsData = this.getInstrumentDetails(this.data.instrumentDetailsRaw);
	}
  }

  private getSettingsCommon(): void {
  	this.subscriptions.add(
  		this.adminService.getSettingsCommon()?.valueChanges.subscribe(settings => {
  			const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
  			const additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
  			this.editableDestination = additionalSettings.admin?.editTransactionDestination ?? false;
				
  			if(settingsCommon.transactionTypeSettings && settingsCommon.transactionTypeSettings.length !== 0){
  				this.transactionTypeSetting = settingsCommon.transactionTypeSettings.find(item => item.transactionType === this.transactionType);
  				
				this.transactionTypes = 
					this.transactionTypes.filter(item =>settingsCommon.transactionTypeSettings.find(settingType => settingType.transactionType === item.id && settingType.allowChange));
  			}
				
  		})
  	);
  }

  refreshTransaction(id: string): void {
	this.isTransactionRefreshing = true;

	this.subscriptions.add(
		this.adminService.getTransaction(id).subscribe({
			next: (transaction) => {
				this.isTransactionRefreshing = false;
				this.setFormData(transaction);
			}
		})
	);
  }

  getTransactionToUpdate(): TransactionUpdateInput {
  	const currentRateValue = this.form.get('rate')?.value;
  	let currentRate: number | undefined = undefined;
  	if (currentRateValue !== undefined && currentRateValue !== this.data.rate) {
  		currentRate = parseFloat(currentRateValue);
  	}
  	let widgetUserParamsChanges = undefined;
  	if (this.form.get('merchantFeePercent')?.value) {
  		widgetUserParamsChanges = {
  			merchantFeePercent: this.form.get('merchantFeePercent')?.value ?? ''
  		};
  	}
  	const transactionToUpdate: TransactionUpdateInput = {
  		destination: this.form.get('address')?.value,
  		currencyToSpend: this.form.get('currencyToSpend')?.value,
  		currencyToReceive: this.form.get('currencyToReceive')?.value,
  		amountToSpend: parseFloat(this.form.get('amountToSpend')?.value ?? '0'),
  		rate: currentRate,
  		feeFiat: parseFloat(this.form.get('fee')?.value ?? '0'),
  		status: this.form.get('transactionStatus')?.value,
  		widgetId: this.form.get('widgetId')?.value,
  		kycStatus: this.form.get('kycStatus')?.value,
  		accountStatus: this.form.get('accountStatus')?.value,
  		transferOrderChanges: {
  			orderId: this.data?.transferOrderId,
  			hash: this.form.get('transferHash')?.value ?? ''
  		},
  		benchmarkTransferOrderChanges: {
  			orderId: this.data?.benchmarkTransferOrderId,
  			hash: this.form.get('benchmarkTransferHash')?.value ?? ''
  		},
		refundTransferOrderChanges: {
			address: this.form.get('refundOrderAddress')?.value,
			amount: this.form.get('refundOrderAmount')?.value
		},
  		type: this.form.get('transactionType')?.value ?? undefined,
  		widgetUserParamsChanges,
  		comment: this.form.get('comment')?.value ?? '',
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
    
  	const requestData$ = this.adminService.updateTransactionFlag(this.flag, this.transactionId);
  	this.subscriptions.add(
  		requestData$.subscribe({
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
		})
  	);
  }

  updateRate(): void {
  	if (this.currentRate) {
  		this.form.get('rate')?.setValue(this.currentRate);
  	}
  }

  updateTransaction(): void {
  	this.saveInProgress = true;
	this.transactionToUpdate = this.getTransactionToUpdate();

  	const requestData$ = this.adminService.updateTransaction(
  		this.transactionId,
  		this.transactionToUpdate,
  		this.restartTransaction,
  		this.recalculateAmounts);

  	this.subscriptions.add(
  		requestData$.subscribe({
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
			})
  	);
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
  	const requestData = this.adminService.deleteTransaction(this.transactionId);
  	this.subscriptions.add(
  		requestData.subscribe({
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

  onExchange(content: any): void {
  	this.fastStatusChange(TransactionStatus.Exchanging, content);
  }

  onDeclined(content: any): void {
  	this.fastStatusChange(TransactionStatus.PaymentDeclined, content);
  }

  onRefunded(content: any): void {
  	this.fastStatusChange(TransactionStatus.Refund, content);
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

  onConfirmUpdate(statusContent: any, amountContent: any, originalOrderIdContent: any): void {
  	this.amountDialogContent = amountContent;
  	this.originalOrderIdDialogContent = originalOrderIdContent;

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
  	if (this.originalOrderDialog) {
  		this.originalOrderDialog.close('');
  	}

  	if (this.originalOrderId) {
  		this.transactionToUpdate.paymentOrderChanges = {
  			originalOrderId: this.originalOrderId
  		};

  		this.originalOrderIdChanged = true;
  		this.onChangeTransactionStatusConfirm(Number(this.restartTransaction));
  	}
  }

  onChangeTransactionStatusConfirm(restartTransaction: number): void {
  	let continueCurrentChange = true;
  	this.restartTransaction = (restartTransaction === 1);
		const transactionStatus = this.form.controls?.transactionStatus?.value;

  	if (this.statusDialog) {
  		this.statusDialog.close('');
  	}

  	if ((!this.data.paymentOrderId || this.data.paymentOrderId === '') && !this.originalOrderIdChanged) {
  		if(transactionStatus === TransactionStatus.Paid) {
  			continueCurrentChange = false;
  			this.originalOrderDialog = this.modalService.open(this.originalOrderIdDialogContent, {
  				backdrop: 'static',
  				windowClass: 'modalCusSty',
  			});
  		}
  	}
		
  	if (continueCurrentChange) {
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
				this.subscriptions.add(
					dialogRef.afterClosed().subscribe(result => {
						this.form.controls.refundOrderAddress.patchValue(result.sourceWallet);
						this.form.controls.refundOrderAmount.patchValue(result.amountToSell);
						this.updateTransaction();
					})
				); 
			} else {
  			this.updateTransaction();
  		}
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

	getInstrumentDetails(data: string): string[] {
		const result: string[] = [];
		
		try {
			const details = JSON.parse(data);
			if (details) {
				let accountData;

				if (typeof details.accountType === 'string') {
					accountData = JSON.parse(details.accountType);
				} else {
					accountData = details.accountType;
				}

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
