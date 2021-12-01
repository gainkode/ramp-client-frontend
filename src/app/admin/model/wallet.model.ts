import { AssetAddress } from '../../model/generated-models';

export class WalletItem {
  address = '';
  legacyAddress?: string;
  description?: string;
  type?: string;
  addressFormat?: string;
  assetId?: string;
  originalId?: string;
  total?: number;
  available?: number;
  pending?: number;
  lockedAmount?: number;
  vaultId?: string;
  vaultName?: string;
  userId?: string;
  userEmail?: string;

  constructor(data?: AssetAddress) {
    if (data) {
      this.address = data.address as string; // TODO: if it's a real primary key, define it as mandatory in the GQL type
      this.legacyAddress = data.legacyAddress as string;
      this.description = data.description as string;
      this.type = data.type as string;
      this.addressFormat = data.addressFormat as string;
      this.assetId = data.assetId as string;
      this.originalId = data.originalId as string;
      this.total = data.total as number;
      this.available = data.available as number;
      this.pending = data.pending as number;
      this.lockedAmount = data.lockedAmount as number;
      this.vaultId = data.vaultId as string;
      this.vaultName = data.vaultName as string;
      this.userId = data.userId as string;
      this.userEmail = data.userEmail as string;
    }
  }
}
