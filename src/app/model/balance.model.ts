import { DatePipe } from "@angular/common";
import { getCryptoSymbol, getCurrencySign } from "../utils/utils";
import { BalancePerAsset } from "./generated-models";

export class BalancePoint {
  date!: Date;
  dateLabel = '';
  balanceCrypto = 0;
  balanceFiat = 0;
  currency = '';

  private datepipe: DatePipe = new DatePipe('en-US');

  get datePoint(): string {
    return this.datepipe.transform(this.date, 'dd MMM') as string;
  }

  get datePointFull(): string {
    return this.datepipe.transform(this.date, 'dd MMM YYYY') as string;
  }

  get balanceCryptoValue(): string {
    return `${this.balanceCrypto} BTC`;
  }

  get balanceFiatValue(): string {
    return `${getCurrencySign(getCryptoSymbol(this.currency))}${this.balanceFiat}`;
  }
}

export class UserBalanceItem {
  private pId = '';
  private pAsset = '';
  private pCryptoCurrency = '';
  private pFiatSymbol = '';
  private pIconUrl = '';
  private pBalanceCrypto = 0;
  private pBalanceFiat = 0;
  private pCryptoPrecision = 0;
  private pFiatPrecision = 0;
  private pFiat = false;

  get id(): string {
    return this.pId;
  }

  get isFiat(): boolean {
    return this.pFiat;
  }

  get currencyName(): string {
    return (this.pFiat) ? this.pAsset : this.pCryptoCurrency;
  }

  get icon(): string {
    return this.pIconUrl;
  }

  get balanceCrypto(): string {
    return (this.pFiat) ?
      `${getCurrencySign(this.pFiatSymbol)}${this.pBalanceFiat.toFixed(this.pFiatPrecision)}` :
      `${this.pBalanceCrypto.toFixed(this.pCryptoPrecision)} ${this.pId}`;
  }

  get balanceFiat(): string {
    return (this.pFiat) ? ' ' : `${getCurrencySign(this.pFiatSymbol)}${this.pBalanceFiat.toFixed(this.pFiatPrecision)}`;
  }

  constructor(data: BalancePerAsset | undefined, cuurencyName: string, fiatSymbol: string, fiatPrecision: number, cryptoPrecision: number, fiatBalance: number) {
    if (data) {
      this.pFiat = false;
      this.pId = data.assetId ?? '';
      this.pCryptoCurrency = cuurencyName;
      this.pAsset = this.pId;
      this.pIconUrl = `assets/svg-crypto/${getCryptoSymbol(this.pAsset).toLowerCase()}.svg`;
      this.pCryptoPrecision = cryptoPrecision;
      this.pBalanceCrypto = data.totalBalance ?? 0;
      this.pBalanceFiat = data.totalBalanceFiat;
    } else {
      this.pFiat = true;
      this.pBalanceFiat = fiatBalance;
      this.pId = fiatSymbol;
      this.pAsset = this.pId;
    }
    this.pFiatSymbol = fiatSymbol;
    this.pFiatPrecision = fiatPrecision;
  }

  increaseCrypto(val: number): void {
    this.pBalanceCrypto += val;
  }

  increaseFiat(val: number): void {
    this.pBalanceFiat += val;
  }
}