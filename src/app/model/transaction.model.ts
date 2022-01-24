import { DatePipe } from '@angular/common';
import { getCurrencySign, getTransactionStatusHash } from '../utils/utils';
import { CommonTargetValue } from './common.model';
import {
  AccountStatus,
  PaymentInstrument,
  Transaction,
  TransactionKycStatus,
  TransactionShort,
  TransactionSource,
  TransactionStatus,
  TransactionStatusDescriptorMap,
  TransactionType,
  User,
  UserMode,
  UserTransactionStatus
} from './generated-models';
import {
  TransactionTypeList,
  PaymentInstrumentList,
  TransactionSourceList,
  CardView,
  UserModeShortList,
  TransactionKycStatusList,
  UserTypeList,
} from './payment.model';
import { UserItem } from './user.model';

export class TransactionItemDeprecated {
  id = '';
  code = '';
  created = '';
  executed = '';
  updated = '';
  accountId = '';
  accountName = '';
  type: TransactionType | undefined = undefined;
  userMode: UserMode | undefined = undefined;
  instrument: PaymentInstrument | undefined = undefined;
  instrumentDetails: CommonTargetValue | null = null;
  paymentProvider = '';
  paymentProviderResponse = '';
  source: TransactionSource | undefined = undefined;
  currencyToSpend = '';
  currencyToReceive = '';
  amountToSpend = 0;
  amountToReceive = 0;
  initialAmountToReceive = 0;
  initialAmount = false;
  transferOrderId = '';
  transferOrderHash = '';
  benchmarkTransferOrderId = '';
  benchmarkTransferOrderHash = '';
  address = '';
  ip = '';
  euro = 0;
  fees = 0;
  rate = 0;
  initialRate = 0;
  status: TransactionStatus | undefined = undefined;
  statusInfo: TransactionStatusDescriptorMap | undefined = undefined;
  user: UserItem | undefined;
  balance = 0;
  accountStatus = '';
  accountStatusValue = AccountStatus.Closed;
  kycStatus = '';
  kycStatusValue = TransactionKycStatus.KycWaiting;
  kycTier = '';
  widgetId = '';
  selected = false;

  constructor(data: Transaction | TransactionShort | null) {
    if (data !== null) {
      this.code = data.code ?? '';
      this.id = data.transactionId;
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = datepipe.transform(data.created, 'dd-MM-YYYY HH:mm:ss') as string;
      this.executed = datepipe.transform(data.executed, 'dd-MM-YYYY HH:mm:ss') as string;
      this.updated = datepipe.transform(data.updated, 'dd-MM-YYYY HH:mm:ss') as string;
      this.address = data.destination as string;
      this.accountId = data.userId ?? '';
      this.accountStatus = data.accountStatus ?? '';
      this.accountStatusValue = data.accountStatus ?? AccountStatus.Closed;
      const transactionData = data as Transaction;
      if (transactionData.user) {
        this.user = new UserItem(transactionData.user as User);
        this.accountName = this.user.fullName;
        this.ip = transactionData.userIp as string;
        this.userMode = transactionData.user?.mode as UserMode | undefined;
        this.benchmarkTransferOrderId = transactionData.benchmarkTransferOrder?.orderId ?? '';
        this.benchmarkTransferOrderHash = transactionData.benchmarkTransferOrder?.transferHash ?? '';
      }
      this.transferOrderId = data.transferOrder?.orderId ?? '';
      this.transferOrderHash = data.transferOrder?.transferHash ?? '';
      this.type = data.type;
      this.instrument = data.instrument ?? undefined;
      this.paymentProvider = data.paymentProvider ?? '';
      this.widgetId = data.widgetId ?? '';
      this.source = data.source ?? undefined;
      this.currencyToSpend = data.currencyToSpend ?? '';
      this.currencyToReceive = data.currencyToReceive ?? '';
      this.amountToSpend = data.amountToSpend ?? 0;
      if (data.amountToReceive) {
        this.amountToReceive = data.amountToReceive ?? 0;
        this.rate = data.rate ?? 0;
      } else {
        this.amountToReceive = data.initialAmountToReceive ?? 0;
        this.rate = data.initialRate ?? 0;
        this.initialAmount = true;
      }
      const kycStatus = TransactionKycStatusList.find(x => x.id === (data as Transaction).kycStatus);
      this.kycStatus = (kycStatus) ? kycStatus.name : '';
      this.kycStatusValue = (kycStatus) ? kycStatus.id : TransactionKycStatus.KycWaiting;
      this.kycTier = data.userTier?.name ?? '';
      this.fees = data.feeFiat as number ?? 0;
      this.status = data.status;

      if (data.paymentOrder) {
        if (data.paymentOrder.paymentInfo) {
          let payment = JSON.parse(data.paymentOrder.paymentInfo);
          // sometimes it comes as a string with escape symbols.
          //  In this case parse returns a stringified JSON, which has to be parsed again
          if (typeof payment === 'string') {
            payment = JSON.parse(payment);
          }
          if (this.instrument === PaymentInstrument.CreditCard) {
            const card = new CardView();
            card.setPaymentInfo(JSON.stringify(payment));
            this.instrumentDetails = card.cardInfo;
            if (this.instrumentDetails) {
              this.instrumentDetails.title = card.secureCardNumber;
            }
          }
        }
        if (data.paymentOrder.operations) {
          if (data.paymentOrder.operations.length > 0) {
            let operations = data.paymentOrder.operations.slice();
            // take the latest operation
            if (operations.length > 1) {
              operations = operations.sort((a, b) => {
                if (a.created > b.created) {
                  return -1;
                }
                if (a.created < b.created) {
                  return 1;
                }
                return 0;
              });
            }
            this.paymentProviderResponse = `${operations[0].type}: ${operations[0].status}`;
          }
        }
      }
    }
  }

  private getTransactionStatusColor(): string {
    let color = 'white';
    switch (this.statusInfo?.value.userStatus) {
      case UserTransactionStatus.New:
        color = 'white';
        break;
      case UserTransactionStatus.Processing:
        color = 'grey';
        break;
      case UserTransactionStatus.SendingError:
        color = 'purple';
        break;
      case UserTransactionStatus.Declined:
      case UserTransactionStatus.Canceled:
        color = 'red';
        break;
      case UserTransactionStatus.Confirming:
        color = 'blue';
        break;
      case UserTransactionStatus.Completed:
        color = 'green';
        break;
      case UserTransactionStatus.UnderReview:
        color = 'yellow';
        break;
      default:
        color = 'white';
    }
    return color;
  }

  get transactionListSelectorColumnStyle(): string[] {
    return [
      'transaction-list-selector-column',
      `transaction-list-column-${this.getTransactionStatusColor()}`
    ];
  }

  get transactionListDataColumnStyle(): string[] {
    return [
      'transaction-list-data-column',
      `transaction-list-column-${this.getTransactionStatusColor()}`
    ];
  }

  get transactionTypeName(): string {
    return TransactionTypeList.find((t) => t.id === this.type)?.name as string;
  }

  get transactionSourceName(): string {
    return TransactionSourceList.find((t) => t.id === this.source)?.name as string;
  }

  get transactionStatusName(): string {
    return this.statusInfo?.value.userStatus.toString() ?? '';
  }

  get instrumentName(): string {
    return PaymentInstrumentList.find((i) => i.id === this.instrument)?.name as string;
  }

  get userModeName(): string {
    if (this.userMode) {
      return UserModeShortList.find((p) => p.id === this.userMode)?.name as string;
    }
    return '';
  }

  get userTypeName(): string {
    if (this.user) {
      return UserTypeList.find((p) => p.id === this.user?.userType?.id)?.name as string;
    }
    return '';
  }

  get statusHash(): number {
    return getTransactionStatusHash(this.status ?? '', this.kycStatusValue, this.accountStatusValue);
  }
}

export class TransactionItem {
  id = '';
  type: TransactionType | undefined = undefined;
  sender: CommonTargetValue = {
    id: '',
    title: '',
    imgClass: '',
    imgSource: ''
  };
  recipient = 'Default Vault BTC';
  currencyToSpend = '';
  currencyToReceive = '';
  amountToSpend = 0;
  amountToReceive = 0;
  fees = 0;
  networkFee = 0;
  rate = 0;
  ip = '';
  status: TransactionStatusDescriptorMap | undefined = undefined;
  typeIcon = 'error';
  private created!: Date;
  private datepipe = new DatePipe('en-US');

  constructor(
    data: Transaction | TransactionShort | null,
    userStatus: TransactionStatusDescriptorMap | undefined = undefined) {
    if (data) {
      this.id = data.transactionId;
      this.created = data.created;
      this.type = data.type;
      if (this.type === TransactionType.Deposit) {
        this.currencyToSpend = data.currencyToSpend ?? '';
        this.currencyToReceive = data.currencyToReceive ?? '';
        this.amountToSpend = data.amountToSpend ?? 0;
        this.amountToReceive = data.amountToReceive ?? 0;
        this.fees = data.feeFiat as number ?? 0;
        this.networkFee = data.approxNetworkFee ?? 0;
        this.typeIcon = 'account_balance';
      } else if (this.type === TransactionType.Transfer) {
        this.currencyToSpend = '-X-';
        this.currencyToReceive = '-X-';
        this.amountToSpend = 42;
        this.amountToReceive = 42;
        this.fees = 4.2;
        this.networkFee = 0.42;
        this.typeIcon = 'file_upload';
      } else {
        this.currencyToSpend = '-X-';
        this.currencyToReceive = '-X-';
        this.amountToSpend = 42;
        this.amountToReceive = 42;
        this.fees = 4.2;
        this.networkFee = 0.42;
      }
      this.rate = data.rate ?? 0;
      this.status = userStatus;
      this.ip = data.userIp as string;

      if (data.paymentOrder) {
        if (data.paymentOrder.paymentInfo) {
          let payment = JSON.parse(data.paymentOrder.paymentInfo);
          // sometimes it comes as a string with escape symbols.
          //  In this case parse returns a stringified JSON, which has to be parsed again
          if (typeof payment === 'string') {
            payment = JSON.parse(payment);
          }
          if (data.instrument === PaymentInstrument.CreditCard) {
            const card = new CardView();
            card.setPaymentInfo(JSON.stringify(payment));
            if (card.cardInfo) {
              if (this.type === TransactionType.Deposit) {
                this.sender = card.cardInfo;
                if (this.sender) {
                  this.sender.title = card.secureCardNumber;
                }
              }
            }
          }
        }
        // } else {
        //   this.sender.imgClass = '__table-cell-payment-icon';
        //   this.sender.imgSource = `assets/svg-payment-systems/visa.svg`;
        //   this.sender.title = '1234 **** **** 5678';
      }
    }
  }

  get dateShort(): string {
    return (this.datepipe.transform(this.created, 'd MMM YYYY') as string).toUpperCase();
  }

  get dateLong(): string {
    return (this.datepipe.transform(this.created, 'd MMM YYYY HH:mm:ss') as string).toUpperCase();
  }

  get recipientData(): string {
    return this.recipient;
  }

  get typeName(): string {
    return TransactionTypeList.find((t) => t.id === this.type)?.name as string;
  }

  get statusName(): string {
    return (this.status) ? this.status.value.userStatus as string : '-';
  }

  get statusLevel(): string {
    return (this.status) ? this.status.value.level as string : '';
  }

  get networkFees(): string {
    return `${getCurrencySign('EUR')}${this.fees.toFixed(6)}`;
  }

  get amountSent(): string {
    if (this.isFiatCurrency(this.currencyToSpend)) {
      return `${getCurrencySign(this.currencyToSpend)}${this.amountToSpend}`;
    } else {
      return `${this.amountToSpend} ${getCurrencySign(this.currencyToSpend)}`;
    }
  }

  get amountReceived(): string {
    if (this.isFiatCurrency(this.currencyToReceive)) {
      return `${getCurrencySign(this.currencyToReceive)}${this.amountToReceive}`;
    } else {
      return `${this.amountToReceive} ${getCurrencySign(this.currencyToReceive)}`;
    }
  }

  isFiatCurrency(currency: string): boolean {
    return (currency === 'USD' || currency === 'EUR');
  }
}
