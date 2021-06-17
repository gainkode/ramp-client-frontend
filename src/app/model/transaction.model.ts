import { DatePipe } from "@angular/common";
import { CommonTargetValue } from "./common.model";
import {
  PaymentInstrument,
  PaymentProvider,
  Transaction,
  TransactionShort,
  TransactionShortListResult,
  TransactionSource,
  TransactionStatus,
  TransactionType,
  User,
} from "./generated-models";
import {
  TransactionTypeList,
  PaymentInstrumentList,
  PaymentProviderList,
  TransactionSourceList,
  TransactionStatusList,
  CardView,
} from "./payment.model";
import { UserItem } from "./user.model";

export class TransactionItem {
  id = "";
  code = "";
  created: string = "";
  executed: string = "";
  accountId = "";
  type: TransactionType | undefined = undefined;
  instrument: PaymentInstrument | undefined = undefined;
  instrumentDetails: CommonTargetValue | null = null;
  paymentProvider: PaymentProvider | undefined = undefined;
  paymentProviderResponse = "";
  source: TransactionSource | undefined = undefined;
  walletSource = "";
  currencyToSpend = "";
  currencyToReceive = "";
  amountToSpend = 0;
  amountToReceive = 0;
  address = "";
  ip = "";
  euro = 0;
  fees = 0;
  rate = 0;
  status: TransactionStatus | undefined = undefined;
  user: UserItem | undefined;
  balance: number = 74.1254;
  payment = "4111 **** **** 1111";

  constructor(data: Transaction | TransactionShort | null) {
    if (data !== null) {
      this.code = data.code as string;
      this.id = data.transactionId;
      const datepipe: DatePipe = new DatePipe("en-US");
      this.created = datepipe.transform(
        data.created,
        "dd-MM-YYYY HH:mm:ss"
      ) as string;
      this.executed = datepipe.transform(
        data.executed,
        "dd-MM-YYYY HH:mm:ss"
      ) as string;
      this.address = data.destination as string;
      this.accountId = data.userId as string;
      const transactionData = data as Transaction;
      if (transactionData.user) {
        this.user = new UserItem(transactionData.user as User);
        this.ip = transactionData.userIp as string;
      }

      //this.euro = 100;
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
      this.rate = data.rate;
      this.fees = data.fee;
      this.status = data.status;

      if (data.paymentOrder) {
        if (data.paymentOrder.paymentInfo) {
          let payment = JSON.parse(data.paymentOrder.paymentInfo);
          // sometimes it comes as a string with escape symbols.
          //  In this case parse returns a stringified JSON, which has to be parsed again
          if (typeof payment === "string") {
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
      }

      this.paymentProviderResponse = "Response";
      this.walletSource = "Wallet source";
      this.euro = 100;
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
}
