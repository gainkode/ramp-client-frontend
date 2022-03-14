import { DatePipe } from '@angular/common';
import { getCryptoSymbol, getCurrencySign, getTransactionAmountHash, getTransactionStatusHash, shortenString } from '../utils/utils';
import { CommonTargetValue } from './common.model';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountUk } from './cost-scheme.model';
import {
  AccountStatus,
  AdminTransactionStatus,
  PaymentInstrument,
  Transaction,
  TransactionKycStatus,
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
  CardView,
  UserModeShortList,
  TransactionKycStatusList,
  UserTypeList,
  AdminTransactionStatusList,
  TransactionStatusList,
} from './payment.model';
import { UserItem } from './user.model';

export class TransactionItemFull {
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
  instrumentDetailsData: string[] = [];
  paymentProvider = '';
  paymentProviderResponse = '';
  source: TransactionSource | undefined = undefined;
  currencyToSpend = '';
  currencyToReceive = '';
  amountToSpend = 0;
  amountToReceive = 0;
  transferOrderId = '';
  transferOriginalOrderId = '';
  transferOrderHash = '';
  transferFee = '';
  benchmarkTransferOrderId = '';
  benchmarkTransferOrderHash = '';
  transferOrderBlockchainLink = '';
  benchmarkTransferOrderBlockchainLink = '';
  address = '';
  sender = '';
  recipient = '';
  ip = '';
  euro = 0;
  fees = 0;
  rate = 0;
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
  widgetName = '';
  selected = false;
  comment = '';
  vaultIds: string[] = [];

  constructor(data: Transaction | TransactionShort | null) {
    if (data !== null) {
      this.code = data.code ?? '';
      this.id = data.transactionId;
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = datepipe.transform(data.created, 'dd-MM-YYYY HH:mm:ss') as string;
      this.executed = datepipe.transform(data.executed, 'dd-MM-YYYY HH:mm:ss') as string;
      this.updated = datepipe.transform(data.updated, 'dd-MM-YYYY HH:mm:ss') as string;
      this.address = data.destination ?? '';
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
      if (data.type === TransactionType.Withdrawal) {
        this.instrumentDetailsData = this.getInstrumentDetails(data.instrumentDetails ?? '{}');
      }
      this.comment = transactionData.comment ?? '';
      this.transferOrderId = data.transferOrder?.orderId ?? '';
      this.transferOriginalOrderId = data.transferOrder?.originalOrderId ?? '-';
      this.transferOrderHash = data.transferOrder?.transferHash ?? '';
      this.transferFee = data.transferOrder?.feeCurrency?.toFixed(8) ?? '';
      this.transferOrderBlockchainLink = transactionData.transferOrderBlockchainLink ?? '';
      this.benchmarkTransferOrderBlockchainLink = transactionData.benchmarkTransferOrderBlockchainLink ?? '';
      this.type = data.type;
      this.instrument = data.instrument ?? undefined;
      this.paymentProvider = data.paymentProvider ?? '';
      this.widgetId = data.widgetId ?? '';
      this.source = data.source ?? undefined;
      this.amountToSpend = data.amountToSpend ?? 0;
      const paymentData = getPaymentData(data);
      this.currencyToSpend = paymentData.currencyToSpend;
      this.currencyToReceive = paymentData.currencyToReceive;
      this.amountToSpend = paymentData.amountToSpend;
      this.fees = paymentData.fees;
      this.sender = paymentData.sender.title;
      this.recipient = paymentData.recipient.title;
      if (data.amountToReceive !== undefined && data.amountToReceive !== null) {
        this.amountToReceive = data.amountToReceiveWithoutFee ?? 0;
      } else {
        this.amountToReceive = data.initialAmountToReceiveWithoutFee ?? 0;
      }
      if (data.rate !== undefined && data.rate !== null) {
        this.rate = data.rate;
      } else {
        this.rate = data.initialRate ?? 0;
      }
      const kycStatus = TransactionKycStatusList.find(x => x.id === (data as Transaction).kycStatus);
      this.kycStatus = (kycStatus) ? kycStatus.name : '';
      this.kycStatusValue = (kycStatus) ? kycStatus.id : TransactionKycStatus.KycWaiting;
      this.kycTier = data.userTier?.name ?? '';
      this.status = data.status;
      const widgetData = JSON.parse(data.widget ?? '{}');
      if (widgetData) {
        this.widgetName = widgetData.widgetName;
      }

      if (data.destVaultId) {
        if (!this.vaultIds.includes(data.destVaultId)) {
          this.vaultIds.push(data.destVaultId);
        }
      }
      if (data.sourceVaultId) {
        if (!this.vaultIds.includes(data.sourceVaultId)) {
          this.vaultIds.push(data.sourceVaultId);
        }
      }

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

  getInstrumentDetails(data: string): string[] {
    const result: string[] = [];
    try {
      const details = JSON.parse(data);
      if (details) {
        const accountData = JSON.parse(details.accountType);
        if (accountData) {
          const paymentData = JSON.parse(accountData.data);
          if (paymentData) {
            if (accountData.id === 'AU') {
              result.push('Australian bank');
              const values = paymentData as WireTransferBankAccountAu;
              result.push(`Account name: ${values.accountName}`);
              result.push(`Account number: ${values.accountNumber}`);
              result.push(`BSB: ${values.bsb}`);
            } else if (accountData.id === 'UK') {
              const values = paymentData as WireTransferBankAccountUk;
              result.push(`Account name: ${values.accountName}`);
              result.push(`Account number: ${values.accountNumber}`);
              result.push(`Sort code: ${values.sortCode}`);
            } else if (accountData.id === 'EU') {
              const values = paymentData as WireTransferBankAccountEu;
              result.push(`Bank name: ${values.bankName}`);
              result.push(`Bank address: ${values.bankAddress}`);
              result.push(`Beneficiary name: ${values.beneficiaryName}`);
              result.push(`Beneficiary address: ${values.beneficiaryAddress}`);
              result.push(`IBAN: ${values.iban}`);
              result.push(`SWIFT / BIC: ${values.swiftBic}`);
            }
          }
        }
      }
    } catch (e) {

    }
    return result;
  }

  private getTransactionStatusColor(): string {
    let color = 'white';
    switch (this.statusInfo?.value.adminStatus) {
      case AdminTransactionStatus.New:
        color = 'white';
        break;
      case AdminTransactionStatus.Pending:
        color = 'grey';
        break;
      case AdminTransactionStatus.Paid:
        color = 'orange';
        break;
      case AdminTransactionStatus.Exchanging:
        color = 'blue';
        break;
      case AdminTransactionStatus.Confirming:
        color = 'purple';
        break;
      case AdminTransactionStatus.Completed:
        color = 'green';
        break;
      case AdminTransactionStatus.Abandoned:
      case AdminTransactionStatus.Canceled:
      case AdminTransactionStatus.Chargeback:
      case AdminTransactionStatus.PaymentDeclined:
        color = 'red';
        break;
      case AdminTransactionStatus.AddressDeclined:
      case AdminTransactionStatus.ExchangeDeclined:
      case AdminTransactionStatus.TransferDeclined:
      case AdminTransactionStatus.BenchmarkTransferDeclined:
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
    return TransactionTypeList.find((t) => t.id === this.type)?.name ?? '';
  }

  get transactionSourceName(): string {
    return TransactionSourceList.find((t) => t.id === this.source)?.name ?? '';
  }

  get transactionStatusName(): string {
    const adminStatus = AdminTransactionStatusList.find((t) => t.id === this.statusInfo?.value.adminStatus)?.name ?? 'Unknown';
    const transactionStatus = TransactionStatusList.find((t) => t.id === this.statusInfo?.key)?.name ?? 'Unknown';
    return `${adminStatus} (${transactionStatus})`;
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

  get amountHash(): number {
    return getTransactionAmountHash(this.rate, this.amountToSpend, this.fees);
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
  recipient: CommonTargetValue = {
    id: '',
    title: '',
    imgClass: '',
    imgSource: ''
  };
  currencyToSpend = '';
  currencyToReceive = '';
  currencyFiat = '';
  amountToSpend = 0;
  amountToReceive = 0;
  fees = 0;
  networkFee = 0;
  rate = 0;
  ip = '';
  status: TransactionStatusDescriptorMap | undefined = undefined;
  typeIcon = 'error';
  kycStatus = '';
  kycRejected = false;
  private created!: Date;
  private datepipe = new DatePipe('en-US');

  constructor(
    data: Transaction | TransactionShort | null,
    userStatus: TransactionStatusDescriptorMap | undefined = undefined) {
    if (data) {
      this.id = data.transactionId;
      this.created = data.created;
      this.type = data.type;
      const paymentData = getPaymentData(data);
      this.currencyToSpend = paymentData.currencyToSpend;
      this.currencyToReceive = paymentData.currencyToReceive;
      this.amountToSpend = paymentData.amountToSpend;
      this.amountToReceive = paymentData.amountToReceive;
      this.currencyFiat = paymentData.currencyFiat;
      this.fees = paymentData.fees;
      this.networkFee = paymentData.networkFee;
      this.typeIcon = paymentData.typeIcon;
      this.sender = paymentData.sender;
      this.recipient = paymentData.recipient;
      this.rate = data.rate ?? 0;
      this.status = userStatus;
      this.ip = data.userIp as string;
      const kycStatusValue = data.kycStatus ?? TransactionKycStatus.KycApproved;
      if (kycStatusValue !== TransactionKycStatus.KycApproved) {
        this.kycStatus = TransactionKycStatusList.find(x => x.id === kycStatusValue)?.name ?? '';
        this.kycRejected = kycStatusValue === TransactionKycStatus.KycRejected;
      }
    }
  }

  get dateShort(): string {
    return (this.datepipe.transform(this.created, 'd MMM YYYY') as string).toUpperCase();
  }

  get dateLong(): string {
    return (this.datepipe.transform(this.created, 'd MMM YYYY HH:mm:ss') as string).toUpperCase();
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
    return `${getCurrencySign(this.currencyFiat)}${this.networkFee.toFixed(6)}`;
  }

  get systemFees(): string {
    return `${getCurrencySign(this.currencyFiat)}${this.fees.toFixed(6)}`;
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

  get recipientShort(): string {
    return shortenString(this.recipient.title, 18);
  }

  isFiatCurrency(currency: string): boolean {
    return (currency === 'USD' || currency === 'EUR');
  }
}

class TransactionPayment {
  currencyToSpend = '';
  currencyToReceive = '';
  currencyFiat = '';
  amountToSpend = 0;
  amountToReceive = 0;
  fees = 0;
  networkFee = 0;
  typeIcon = '';
  sender: CommonTargetValue = {
    id: '',
    title: '',
    imgClass: '',
    imgSource: ''
  };
  recipient: CommonTargetValue = {
    id: '',
    title: '',
    imgClass: '',
    imgSource: ''
  };
}

function getPaymentData(data: Transaction | TransactionShort): TransactionPayment {
  const result = new TransactionPayment();
  result.currencyToSpend = data.currencyToSpend ?? '';
  result.currencyToReceive = data.currencyToReceive ?? '';
  result.amountToSpend = data.amountToSpend ?? 0;
  result.amountToReceive = data.amountToReceiveWithoutFee ?? 0;
  if (data.type === TransactionType.Deposit) {
    result.currencyFiat = result.currencyToSpend;
    const c = getCryptoSymbol(result.currencyToReceive);
    const cryptoImg = (c !== '') ?
      `../../../assets/svg-crypto/${c.toLowerCase()}.svg` :
      '';
    const destVaultData = JSON.parse(data.destVault ?? '{}');
    let recipientName = `Default Vault ${c}`;
    if (data.destination) {
      recipientName = data.destination;
    }
    if (destVaultData && destVaultData.name) {
      recipientName = destVaultData.name;
    }
    result.recipient = {
      id: '',
      title: recipientName,
      imgClass: '',
      imgSource: cryptoImg
    };
    if (
      data.instrument === PaymentInstrument.Apm ||
      data.instrument === PaymentInstrument.WireTransfer) {
      result.sender = {
        id: '',
        title: PaymentInstrumentList.find(x => x.id === data.instrument)?.name ?? '',
        imgSource: '',
        imgClass: ''
      } as CommonTargetValue;
    } else if (data.instrument === PaymentInstrument.CreditCard) {
      if (data.paymentOrder) {
        if (data.paymentOrder.paymentInfo) {
          let payment = JSON.parse(data.paymentOrder.paymentInfo);
          // sometimes it comes as a string with escape symbols.
          //  In this case parse returns a stringified JSON, which has to be parsed again
          if (typeof payment === 'string') {
            payment = JSON.parse(payment);
          }
          const card = new CardView();
          card.setPaymentInfo(JSON.stringify(payment));
          if (card.cardInfo) {
            result.sender = card.cardInfo;
            if (result.sender) {
              result.sender.title = card.secureCardNumber;
            }
          }
        }
      }
    }
    result.fees = data.feeFiat as number ?? 0;
    result.networkFee = data.approxNetworkFeeFiat ?? 0;
    result.typeIcon = 'account_balance';
  } else if (data.type === TransactionType.Transfer) {
    result.currencyFiat = 'EUR';
    result.recipient = {
      id: '',
      title: data.destination ?? '',
      imgClass: '',
      imgSource: ''
    };
    const c = getCryptoSymbol(result.currencyToSpend);
    let cryptoImg = (c !== '') ?
      `../../../assets/svg-crypto/${c.toLowerCase()}.svg` :
      '';
    let sourceVaultData = JSON.parse(data.sourceVault ?? '{}');
    // sometimes it comes as a string with escape symbols.
    //  In this case parse returns a stringified JSON, which has to be parsed again
    if (typeof sourceVaultData === 'string') {
      sourceVaultData = JSON.parse(sourceVaultData);
    }
    let senderName = '';
    if (sourceVaultData && sourceVaultData.name) {
      senderName = sourceVaultData.name;
    }
    if (senderName === '') {
      cryptoImg = '';
    }
    result.sender = {
      id: '',
      title: senderName,
      imgClass: '__profile-transactions-table-cell-sender-icon',
      imgSource: cryptoImg
    };
    result.fees = data.feeFiat as number ?? 0;
    result.networkFee = data.approxNetworkFeeFiat ?? 0;
    result.typeIcon = 'file_upload';
  } else if (data.type === TransactionType.Receive) {
    result.currencyFiat = 'EUR';
    const c = getCryptoSymbol(result.currencyToReceive).toLowerCase();
    const cryptoImg = (c !== '') ? `../../../assets/svg-crypto/${c}.svg` : '';
    const destVaultData = JSON.parse(data.destVault ?? '{}');
    let recipientName = data.destination ?? '';
    if (destVaultData && destVaultData.name) {
      recipientName = destVaultData.name;
    }
    result.recipient = {
      id: '',
      title: recipientName,
      imgClass: '',
      imgSource: cryptoImg
    };
    result.fees = data.feeFiat as number ?? 0;
    result.networkFee = data.approxNetworkFeeFiat ?? 0;
    result.typeIcon = 'file_download';
    let senderName = 'External';
    const transferDetails = data.transferOrder?.transferDetails;
    if (transferDetails) {
      let transferDetailsData = JSON.parse(transferDetails);
      // sometimes it comes as a string with escape symbols.
      //  In this case parse returns a stringified JSON, which has to be parsed again
      if (typeof transferDetailsData === 'string') {
        transferDetailsData = JSON.parse(transferDetailsData);
      }
      if (transferDetailsData.data) {
        let sourceData = JSON.parse(transferDetailsData.data);
        senderName = `${sourceData?.source?.name ?? ''} ${sourceData?.sourceAddress ?? 'External'}`;
      }
    }
    result.sender = {
      id: '',
      title: senderName,
      imgSource: '',
      imgClass: ''
    } as CommonTargetValue;
  } else if (data.type === TransactionType.Withdrawal) {
    result.currencyFiat = result.currencyToReceive;
    result.recipient = {
      id: '',
      title: 'Wire transfer',
      imgClass: '',
      imgSource: ''
    };
    const c = getCryptoSymbol(result.currencyToSpend);
    let cryptoImg = (c !== '') ?
      `../../../assets/svg-crypto/${c.toLowerCase()}.svg` :
      '';
    const sourceVaultData = JSON.parse(data.sourceVault ?? '{}');
    let senderName = '';
    if (sourceVaultData && sourceVaultData.name) {
      senderName = sourceVaultData.name;
    }
    if (senderName === '') {
      cryptoImg = '';
    }
    result.sender = {
      id: '',
      title: senderName,
      imgClass: '__profile-transactions-table-cell-sender-icon',
      imgSource: cryptoImg
    };
    result.fees = data.feeFiat as number ?? 0;
    result.networkFee = data.approxNetworkFeeFiat ?? 0;
    result.typeIcon = 'account_balance';
  } else {
    result.fees = 4.2;
    result.networkFee = 0.42;
  }
  return result;
}

