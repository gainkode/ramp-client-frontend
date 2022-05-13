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
  private pCryptoCurrencyFull = '';
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
    return this.pCryptoCurrencyFull;
  }

  get icon(): string {
    return this.pIconUrl;
  }

  get balanceCrypto(): string {
    return (this.pFiat) ?
      `${getCurrencySign(this.pCryptoCurrency)}${this.pBalanceCrypto.toFixed(this.pCryptoPrecision)}` :
      `${this.pBalanceCrypto.toFixed(this.pCryptoPrecision)} ${this.pCryptoCurrency}`;
  }

  get balanceFiat(): string {
    return `${getCurrencySign(this.pFiatSymbol)}${this.pBalanceFiat.toFixed(this.pFiatPrecision)}`;
  }

  constructor(data: BalancePerAsset | undefined, currencyName: string, currencyNameFull: string, fiatSymbol: string, fiatPrecision: number, cryptoPrecision: number, cryptoBalance: number, fiatBalance: number) {
    this.pCryptoPrecision = cryptoPrecision;
    this.pCryptoCurrency = currencyName;
    this.pCryptoCurrencyFull = currencyNameFull;
    this.pFiatSymbol = fiatSymbol;
    this.pFiatPrecision = fiatPrecision;
    if (data) {
      this.pFiat = false;
      this.pId = data.assetId ?? '';
      this.pAsset = this.pId;
      this.pIconUrl = `assets/svg-crypto/${getCryptoSymbol(this.currencyName).toLowerCase()}.svg`;
      this.pBalanceCrypto = data.totalBalance ?? 0;
      this.pBalanceFiat = data.totalBalanceFiat;
    } else {
      this.pFiat = true;
      this.pBalanceCrypto = cryptoBalance;
      this.pBalanceFiat = fiatBalance;
      this.pId = currencyName;
      this.pAsset = this.pId;
    }
  }

  increaseCrypto(val: number): void {
    this.pBalanceCrypto += val;
  }

  increaseFiat(val: number): void {
    this.pBalanceFiat += val;
  }
}