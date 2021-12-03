import { LiquidityProvider, RiskAlertCodes } from '../../model/generated-models';

// TODO: maybe a specific type not needed, looks quite generic
export interface LiquidityProviderItem {
  id: string;
  name: string;
}

export const LiquidityProviderList: Array<LiquidityProviderItem> = [
  { id: LiquidityProvider.Bitstamp, name: 'Bitstamp' },
  { id: LiquidityProvider.Binance, name: 'Binance' },
  { id: LiquidityProvider.Kraken, name: 'Kraken' }
];


// TODO: maybe a specific type not needed, looks quite generic
export interface RiskAlertCodeItem {
  id: RiskAlertCodes;
  name: string;
}

export const RiskAlertCodeList: Array<RiskAlertCodeItem> = [
  { id: RiskAlertCodes.TooManyFailedLoginAttempts, name: 'Too many failed login attempts'},
  { id: RiskAlertCodes.UnusualUserIpAddress, name: 'Unusual user IP address'}
];
