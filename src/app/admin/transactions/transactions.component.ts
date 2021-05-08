import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { TransactionItem } from '../../model/transaction.model';
import { TransactionListResult } from "../../model/generated-models";
import { Transaction, TransactionType, TransactionSource, TransactionStatus, LiquidityProvider, PaymentInstrument, PaymentProvider } from "../../model/generated-models";
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'transactions.component.html',
  styleUrls: ['../admin.scss', 'transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private _showDetails = false;
  private _transactionsSubscription!: any;
  inProgress = false;
  errorMessage = '';
  selectedTransaction: TransactionItem | null = null;
  transactions: TransactionItem[] = [];
  displayedColumns: string[] = [
    'id', 'executed', 'accountId', 'email', 'type', 'instrument', 'paymentProvider', 'paymentProviderResponse',
    'source', 'walletSource', 'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
    'address', 'euro', 'fees', 'status', 'details'
  ];

  get showDetailed(): boolean {
    return this._showDetails;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    const dt: Transaction = {
      transactionId: '67b1def1-d17e-4dfd-8787-2eefef84cebe',
      code: 'M-1651631-1568416',
      userId: 'd05169d2-c131-4119-acc9-30f02a298ef6',
      affiliateId: '7af592aa-dd6b-45d4-983c-c983f2a65d5c',
      created: '2021/05/05 15:14:49',
      executed: '2021/05/05 15:15:02',
      type: TransactionType.Deposit,
      source: TransactionSource.QuickCheckout,
      status: TransactionStatus.Completed,
      fee: 0.2389,
      feePercent: 0.15,
      feeMinEuro: 5,
      feeDetails: 'Fee details',
      currencyToSpend: 'EOR',
      amountToSpend: 2974.25,
      amountToSpendWithoutFee: 2944.36,
      currencyToReceive: 'BTC',
      amountToReceive: 0.24859,
      amountToReceiveWithoutFee: 0.24833,
      rate: 9745.8,
      orderId: 'd156e0da-616d-417b-92bd-4a182b1d075c',
      liquidityProvider: LiquidityProvider.Bitstamp,
      instrument: PaymentInstrument.Bitstamp,
      paymentProvider: PaymentProvider.Fibonatix,
      originalOrderId: 'd156e0da-616d-417b-92bd-4a182b1d075c',
      order: 'Order',
      data: 'Data'
    };
    const item: TransactionItem = new TransactionItem(dt);
    this.transactions.push(item);
    

    // const transactionsData = this.adminService.getTransactions();
    // if (transactionsData === null) {
    //   this.errorMessage = this.errorHandler.getRejectedCookieMessage();;
    // } else {
    //   this.inProgress = true;
    //   this._transactionsSubscription = transactionsData.valueChanges.subscribe(({ data }) => {
    //     const dataList = data.getTransactions as TransactionListResult;
    //     let itemCount = 0;
    //     if (dataList !== null) {
    //       itemCount = dataList?.count as number;
    //       if (itemCount > 0) {
    //         this.transactions = dataList?.list?.map((val) => new TransactionItem(val)) as TransactionItem[];
    //       }
    //     }
    //     this.inProgress = false;
    //   }, (error) => {
    //     this.inProgress = false;
    //     if (this.auth.token !== '') {
    //       this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load transactions');
    //     } else {
    //       this.router.navigateByUrl('/');
    //     }
    //   });
    // }
  }

  ngOnDestroy(): void {
    const s: Subscription = this._transactionsSubscription;
    if (s !== undefined) {
      s.unsubscribe();
    }
  }

  private isSelectedTransaction(transactionId: string): boolean {
    let selected = false;
    if (this.selectedTransaction !== null) {
      if (this.selectedTransaction.id === transactionId) {
        selected = true;
      }
    }
    return selected;
  }

  private showEditor(transaction: TransactionItem | null, visible: boolean): void {
    this._showDetails = visible;
    if (visible) {
      this.selectedTransaction = transaction;
    } else {
      this.selectedTransaction = null;
    }
  }

  toggleDetails(transaction: TransactionItem): void {
    let show = true;
    if (this.isSelectedTransaction(transaction.id)) {
      show = false;
    }
    this.showEditor(transaction, show);
  }

  getDetailsIcon(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'clear' : 'description';
  }

  getDetailsTooltip(transactionId: string): string {
    return (this.isSelectedTransaction(transactionId)) ? 'Hide details' : 'Transaction details';
  }
}
