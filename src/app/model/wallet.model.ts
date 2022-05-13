import { getCryptoSymbol, getCurrencySign } from "../utils/utils";
import { AssetAddressShort, FiatVault } from "./generated-models";
import { CurrencyView } from "./payment.model";

export class WalletItem {
  id = '';
  originalId = '';
  vaultOriginalId = '';
  vault = '';
  type = '';
  address = '';
  addressFormat = '';
  asset = '';
  symbol = '';
  total = 0;
  totalFiat = 0;
  name = '';
  crypto = true;

  private pIconUrl = '';
  private fiat = '';
  private pCurrencyName = '';
  private pFullName = '';

  constructor(data: AssetAddressShort | null, defaultFiat: string, currency: CurrencyView | undefined) {
    this.crypto = true;
    if (data) {
      this.fiat = defaultFiat;
      this.id = data.vaultId ?? '';
      this.originalId = data.originalId ?? '';
      this.vaultOriginalId = data.vaultOriginalId ?? '';
      this.vault = data.vaultId ?? '';
      this.address = data.address ?? '';
      this.addressFormat = data.addressFormat ?? '';
      this.asset = currency?.symbol ?? '';
      if (this.asset === '') {
        this.asset = data.assetId ?? '';
      }
      this.total = data.total ?? 0;
      this.totalFiat = data.totalFiat ?? 0;
      this.name = data.vaultName ?? '';
      if (this.asset !== '') {
        this.pIconUrl = `assets/svg-crypto/${getCryptoSymbol(this.asset).toLowerCase()}.svg`;
      }
      if (currency) {
        this.pCurrencyName = `${currency.display} - ${currency.name.toUpperCase()}`;
        this.pFullName = currency.name;
        this.symbol = currency.display;
      } else {
        this.pCurrencyName = this.asset;
        this.pFullName = this.asset;
        this.symbol = this.asset;
      }
    }
  }

  get icon(): string {
    return this.pIconUrl;
  }

  get totalValue(): string {
    return `${getCurrencySign(this.fiat)}${this.totalFiat.toFixed(2)}`;
  }

  get totalFullFiat(): string {
    return `${getCurrencySign(this.asset)}${this.total.toFixed(2)}`;
  }

  get nameValue(): string {
    const limit = 15;
    return (this.name.length > limit) ? `${this.name.substr(0, limit)}...` : this.name;
  }

  get currencyName(): string {
    return this.pCurrencyName;
  }

  get fullName(): string {
    return this.pFullName;
  }

  setName(n: string): void {
    this.name = n;
  }

  setFiat(data: FiatVault, defaultFiat: string) {
    this.crypto = false;
    if (data) {
      this.fiat = defaultFiat;
      this.id = data.fiatVaultId ?? '';
      this.vault = data.fiatVaultId ?? '';
      this.asset = data.currency ?? '';
      this.symbol = data.currency ?? '';
      this.total = data.generalBalance ?? 0;
      this.totalFiat = data.balance ?? 0;
      this.name = `${this.asset} wallet`;
      this.pCurrencyName = this.asset;
      this.pFullName = `${this.asset} wallet`;
    }
  }
}
