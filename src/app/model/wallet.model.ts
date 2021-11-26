import { getCurrencySign } from "../utils/utils";
import { AssetAddressShort } from "./generated-models";
import { CurrencyView } from "./payment.model";

export class WalletItem {
  id = '';
  vault = '';
  type = '';
  address = '';
  addressFormat = '';
  asset = '';
  total = 0;
  totalFiat = 0;
  name = '';

  private pIconUrl = '';
  private fiat = '';
  private pCurrencyName = '';
  private pFullName = '';

  constructor(data: AssetAddressShort | null, defaultFiat: string, currency: CurrencyView | undefined) {
    if (data) {
      this.fiat = defaultFiat;
      this.id = data.originalId ?? '';
      this.vault = data.vaultId ?? '';
      this.address = data.address ?? '';
      this.addressFormat = data.addressFormat ?? '';
      this.asset = data.assetId ?? '';
      this.total = data.total ?? 0;
      this.totalFiat = data.totalFiat ?? 0;
      this.name = data.vaultName ?? '';
      if (this.asset !== '') {
        this.pIconUrl = `assets/svg-crypto/${this.asset.toLowerCase()}.svg`;
      }
      if (currency) {
        this.pCurrencyName = `${currency.name.toUpperCase()} - ${this.asset}`;
        this.pFullName = currency.name;
      } else {
        this.pCurrencyName = this.asset;
        this.pFullName = this.asset;
      }
    }
  }

  get icon(): string {
    return this.pIconUrl;
  }

  get totalValue(): string {
    return `${getCurrencySign(this.fiat)}${this.totalFiat.toFixed(2)}`;
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
}
