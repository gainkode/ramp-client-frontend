import { DatePipe } from '@angular/common';
import { CommonTargetValue } from './common.model';
import {
  PaymentInstrument,
  PaymentProvider,
  Transaction,
  TransactionShort,
  TransactionSource,
  TransactionStatus,
  TransactionType,
  User,
  UserMode,
} from './generated-models';
import {
  TransactionTypeList,
  PaymentInstrumentList,
  PaymentProviderList,
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
      this.amountToReceive = data.amountToReceive;

      if (
        transactionData.amountToSpendInEur ||
        transactionData.amountToReceiveInEur
      ) {
        if (transactionData.amountToSpendInEur) {
          this.euro = transactionData.amountToSpendInEur;
        } else {
          this.euro = transactionData.amountToReceiveInEur;
        }
      }

      this.rate = data.rate;
      this.fees = data.fee;
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
    return PaymentProviderList.find((p) => p.id === this.paymentProvider)
      ?.name as string;
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
  date = '';
  type: TransactionType | undefined = undefined;
  sender = '';
  recipient = '';
  currencyToSpend = '';
  currencyToReceive = '';
  amountToSpend = 0;
  amountToReceive = 0;
  fees = 0;
  status: TransactionStatus | undefined = undefined;

  constructor(data: Transaction | TransactionShort | null) {
    if (data !== null) {
      this.id = data.transactionId;
      const datepipe = new DatePipe('en-US');
      this.date = (datepipe.transform(data.created, 'd MMM YYYY') as string).toUpperCase();
      //this.date = datepipe.transform(data.executed, 'd MMM YYYY') as string;
      this.type = data.type;
      this.currencyToSpend = data.currencyToSpend;
      this.currencyToReceive = data.currencyToReceive;
      this.amountToSpend = data.amountToSpend;
      this.amountToReceive = data.amountToReceive;
      this.fees = data.fee;
      this.status = data.status;
    }
  }

  get typeName(): string {
    return TransactionTypeList.find((t) => t.id === this.type)?.name as string;
  }

  get statusName(): string {
    return TransactionStatusList.find((t) => t.id === this.status)?.name as string;
  }

  get systemFees(): string {
    return this.fees.toFixed(6).toString();
  }

  get amountSent(): string {
    if (this.isFiatCurrency(this.currencyToSpend)) {
      return `${this.getCurrencySign(this.currencyToSpend)}${this.amountToSpend.toFixed(this.getFixedNumber(this.currencyToSpend))}`;
    } else {
      return `${this.amountToSpend.toFixed(this.getFixedNumber(this.currencyToSpend))} ${this.getCurrencySign(this.currencyToSpend)}`;
    }
  }

  get amountReceived(): string {
    if (this.isFiatCurrency(this.currencyToReceive)) {
      return `${this.getCurrencySign(this.currencyToReceive)}${this.amountToReceive.toFixed(this.getFixedNumber(this.currencyToReceive))}`;
    } else {
      return `${this.amountToReceive.toFixed(this.getFixedNumber(this.currencyToReceive))} ${this.getCurrencySign(this.currencyToReceive)}`;
    }
  }

  isFiatCurrency(currency: string): boolean {
    return (currency === 'USD' || currency === 'EUR');
  }

  getCurrencySign(currency: string): string {
    let result = currency;
    switch (currency) {
      case 'EUR':
        result = '\u20AC';
        break;
      case 'USD':
        result = '$';
        break;
    }
    return result;
  }

  getFixedNumber(currency: string): number {
    let result = 4;
    switch (currency) {
      case 'EUR':
        result = 2;
        break;
      case 'USD':
        result = 2;
        break;
    }
    return result;
  }
}