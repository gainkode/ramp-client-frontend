import { DatePipe } from '@angular/common';
import { getCurrencySign } from '../utils/utils';
import { CommonTargetValue } from './common.model';
import {
  PaymentInstrument,
  PaymentProvider,
  Transaction,
  TransactionShort,
  TransactionSource,
  TransactionStatus,
  TransactionStatusDescriptorMap,
  TransactionType,
  User,
  UserMode
} from './generated-models';
import {
  TransactionTypeList,
  PaymentInstrumentList,
  TransactionSourceList,
  TransactionStatusList,
  CardView,
  UserModeShortList,
} from './payment.model';
import { UserItem } from './user.model';

export class TransactionItemDeprecated {
  id = '';
  code = '';
  created = '';
  executed = '';
  accountId = '';
  type: TransactionType | undefined = undefined;
  userMode: UserMode | undefined = undefined;
  instrument: PaymentInstrument | undefined = undefined;
  instrumentDetails: CommonTargetValue | null = null;
  paymentProvider: PaymentProvider | undefined = undefined;
  paymentProviderResponse = '';
  source: TransactionSource | undefined = undefined;
  currencyToSpend = '';
  currencyToReceive = '';
  amountToSpend = 0;
  amountToReceive = 0;
  address = '';
  ip = '';
  euro = 0;
  fees = 0;
  rate = 0;
  status: TransactionStatus | undefined = undefined;
  user: UserItem | undefined;
  balance = 74.1254;

  constructor(data: Transaction | TransactionShort | null) {
    if (data !== null) {
      this.code = data.code as string;
      this.id = data.transactionId;
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = datepipe.transform(
        data.created,
        'dd-MM-YYYY HH:mm:ss'
      ) as string;
      this.executed = datepipe.transform(
        data.executed,
        'dd-MM-YYYY HH:mm:ss'
      ) as string;
      this.address = data.destination as string;
      this.accountId = data.userId as string;
      const transactionData = data as Transaction;
      if (transactionData.user) {
        this.user = new UserItem(transactionData.user as User);
        this.ip = transactionData.userIp as string;
        this.userMode = transactionData.user?.mode as UserMode | undefined;
      }

      this.type = data.type;
      this.instrument = data.instrument;
      this.paymentProvider = data.paymentProvider as
        | PaymentProvider
        | undefined;
      this.source = data.source;
      this.currencyToSpend = data.currencyToSpend;
      this.currencyToReceive = data.currencyToReceive;
      this.amountToSpend = data.amountToSpend;
      this.amountToReceive = data.amountToReceive ?? 0;

      // if (
      //   transactionData.amountToSpendInEur ||
      //   transactionData.amountToReceiveInEur
      // ) {
      //   if (transactionData.amountToSpendInEur) {
      //     this.euro = transactionData.amountToSpendInEur;
      //   } else {
      //     this.euro = transactionData.amountToReceiveInEur;
      //   }
      // }

      this.rate = data.rate ?? 0;
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

  get transactionTypeName(): string {
    return TransactionTypeList.find((t) => t.id === this.type)?.name as string;
  }

  get transactionSourceName(): string {
    return TransactionSourceList.find((t) => t.id === this.source)
      ?.name as string;
  }

  get transactionStatusName(): string {
    return TransactionStatusList.find((t) => t.id === this.status)
      ?.name as string;
  }

  get instrumentName(): string {
    return PaymentInstrumentList.find((i) => i.id === this.instrument)
      ?.name as string;
  }

  get paymentProviderName(): string {
    return this.paymentProvider?.name ?? '';
  }

  get userModeName(): string {
    if (this.userMode) {
      return UserModeShortList.find((p) => p.id === this.userMode)
        ?.name as string;
    }
    return '';
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
  rate = 0;
  ip = '';
  status: TransactionStatusDescriptorMap | undefined = undefined;
  private created!: Date;
  private executed!: Date;
  private datepipe = new DatePipe('en-US');

  constructor(data: Transaction | TransactionShort | null,
    userStatus: TransactionStatusDescriptorMap | undefined = undefined) {
    if (data) {
      this.id = data.transactionId;
      this.created = data.created;
      this.executed = data.executed;
      this.type = data.type;
      if (this.type === TransactionType.Deposit) {
        this.currencyToSpend = data.currencyToSpend;
        this.currencyToReceive = data.currencyToReceive;
        this.amountToSpend = data.amountToSpend;
        this.amountToReceive = data.amountToReceive ?? 0;
        this.fees = data.feeFiat as number ?? 0;
      } else {
        this.currencyToSpend = '-X-';
        this.currencyToReceive = '-X-';
        this.amountToSpend = 42;
        this.amountToReceive = 42;
        this.fees = 42;
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
