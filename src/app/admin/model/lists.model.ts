import { LiquidityProvider } from '../../model/generated-models';

export interface LiquidityProviderItem {
  id: string;
  name: string;
}

export const LiquidityProviderList: Array<LiquidityProviderItem> = [
  { id: LiquidityProvider.Bitstamp, name: 'Bitstamp' },
  { id: LiquidityProvider.Binance, name: 'Binance' },
  { id: LiquidityProvider.Kraken, name: 'Kraken' }
];
