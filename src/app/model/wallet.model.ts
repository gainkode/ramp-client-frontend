import { getCurrencySign } from "../utils/utils";
import { AssetAddressShort } from "./generated-models";

export class WalletItem {
  id = '';
  type = '';
  address = '';
  addressFormat = '';
  asset = '';
  total = 0;
  totalFiat = 0;
  name = '';

  private pIconUrl = '';
  private fiat = '';

  constructor(data: AssetAddressShort | null, defaultFiat: string) {
    if (data) {
      this.fiat = defaultFiat;
      this.id = data.originalId ?? '';
      this.address = data.address ?? '';
      this.addressFormat = data.addressFormat ?? '';
      this.asset = data.assetId ?? '';
      this.total = data.total ?? 0;
      this.totalFiat = 0;
      this.name = 'UNKNOWN';
      if (this.asset !== '') {
        this.pIconUrl = `assets/svg-crypto/${this.asset.toLowerCase()}.svg`;
      }
    }
  }

  get icon(): string {
    return this.pIconUrl;
  }

  get totalValue(): string {
    return `${getCurrencySign(this.fiat)}${this.totalFiat.toFixed(2)}`;
  }
}
