import { DatePipe } from "@angular/common";
import { getCurrencySign } from "../utils/utils";
import { BalancePerAsset, UserTransactionSummary } from "./generated-models";

export class BalancePoint {
    date!: Date;
    dateLabel = '';
    balanceCrypto = 0;
    balanceFiat = 0;

    private datepipe: DatePipe = new DatePipe('en-US');

    get datePoint(): string {
      return this.datepipe.transform(this.date, 'dd MMM') as string;
    }

    get balanceCryptoValue(): string {
      return `${this.balanceCrypto} BTC`;
    }

    get balanceFiatValue(): string {
      return `$${this.balanceFiat}`;
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
  
    constructor(data: BalancePerAsset, cuurencyName: string, fiatSymbol: string, fiatPrecision: number) {
      this.pId = data.assetId ?? '';
      this.pCryptoCurrency = cuurencyName;
      this.pFiatSymbol = fiatSymbol;
      if (this.pId.toLowerCase() === 'btc') {
        this.pIconUrl = 'assets/svg-payment-systems/bitcoin.svg';
      }
      this.pFiatPrecision = fiatPrecision;
      this.pBalanceCrypto = data.totalBalance ?? 0;
      this.pBalanceFiat = data.totalBalanceFiat;
    }

    increaseCrypto(val: number): void {
      this.pBalanceCrypto += val;
    }

    increaseFiat(val: number): void {
      this.pBalanceFiat += val;
    }
  }