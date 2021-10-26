import { getCurrencySign } from "../utils/utils";
import { UserBalanceHistory, UserTransactionSummary } from "./generated-models";

export enum BalancePointType {
    Balance = 'Balance',
    BalanceEur = 'BalanceEur'
}

export class BalancePoint {
    date!: Date;
    balance = 0;
    transactionId = '';

    constructor(point: UserBalanceHistory | undefined, pointType: BalancePointType) {
        if (point) {
            this.date = point.date;
            this.transactionId = point.transactionId as string;
            if (pointType === BalancePointType.Balance) {
                this.balance = point.balance;
            } else if (pointType === BalancePointType.BalanceEur) {
                this.balance = point.balanceEur;
            }
        }
    }
}

export class UserBalanceItem {
    private pId = '';
    private pCryptoCurrency = '';
    private pFiatSymbol = '';
    private pIconUrl = '';
    private pBalanceCrypto = 0;
    private pBalanceFiat = 0;
    private pFiatPrecision = 0;
  
    get currencyName(): string {
      return this.pCryptoCurrency;
    }
  
    get icon(): string {
      return this.pIconUrl;
    }
  
    get balanceCrypto(): string {
      return `${this.pBalanceCrypto} ${this.pId}`;
    }
  
    get balanceFiat(): string {
      return `${getCurrencySign(this.pFiatSymbol)}${this.pBalanceFiat.toFixed(this.pFiatPrecision)}`;
    }
  
    constructor(data: UserTransactionSummary, cryptoCurrency: string, fiatSymbol: string, fiatPrecision: number, rate: number) {
      this.pId = data.assetId ?? '';
      this.pCryptoCurrency = cryptoCurrency;
      this.pFiatSymbol = fiatSymbol;
      if (this.pId.toLowerCase() === 'btc') {
        this.pIconUrl = 'assets/svg-payment-systems/bitcoin.svg';
      }
      this.pFiatPrecision = fiatPrecision;
      this.pBalanceCrypto = data.in?.amount ?? 0;
      this.pBalanceFiat = this.pBalanceCrypto * rate;
    }
  }