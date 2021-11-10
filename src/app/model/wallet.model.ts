import { AssetAddressShort } from "./generated-models";

export class WalletItem {
  id = '';
  type = '';
  address = '';
  addressFormat = '';
  asset = '';
  total = 0;
  totalFiat = '';
  name = '';

  private pIconUrl = '';

  constructor(data: AssetAddressShort | null) {
    if (data) {
      this.id = data.assetId ?? '';
      this.address = data.address ?? '';
      this.addressFormat = data.addressFormat ?? '';
      this.asset = data.assetId ?? '';
      this.total = data.total ?? 0;
      this.totalFiat = '$UNKNOWN';
      this.name = 'UNKNOWN';
      if (this.asset !== '') {
        this.pIconUrl = `assets/svg-crypto/${this.asset.toLowerCase()}.svg`;
      }
    }
  }

  get icon(): string {
    return this.pIconUrl;
  }
}
