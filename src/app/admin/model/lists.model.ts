import { LiquidityProvider, RiskAlertCodes } from '../../model/generated-models';

// TODO: maybe a specific type not needed, looks quite generic
export interface LiquidityProviderItem {
	id: string;
	name: string;
}

export const LiquidityProviderList: Array<LiquidityProviderItem> = [
  { id: LiquidityProvider.Bitstamp, name: 'Bitstamp' },
  { id: LiquidityProvider.Kraken, name: 'Kraken' },
  { id: LiquidityProvider.PrimeTrustLiquidity, name: 'PrimeTrustLiquidity' },
  { id: LiquidityProvider.Xbo, name: 'Xbo' }
];


// TODO: maybe a specific type not needed, looks quite generic
export interface RiskAlertCodeItem {
	id: RiskAlertCodes;
	name: string;
}

export const RiskAlertCodeList: Array<RiskAlertCodeItem> = [
	{ id: RiskAlertCodes.UserAge, name: 'User age' },
	{ id: RiskAlertCodes.TooManyFailedLoginAttempts, name: 'Too many failed login attempts' },
	{ id: RiskAlertCodes.UnusualUserIpAddress, name: 'Unusual user IP address' },
	{ id: RiskAlertCodes.TwoOrMoreCustomersWithdrawalSameAddress, name: 'Two or more customers made withdrawal to the same address' },
	{ id: RiskAlertCodes.DepositXPercentUpThanTheLastOne, name: 'Deposit percentage is higher than the last one' },
	{ id: RiskAlertCodes.DepositAbove_10K, name: 'Deposit above 10000' },
	{ id: RiskAlertCodes.DepositAbove_50K, name: 'Deposit above 50000' },
	{ id: RiskAlertCodes.DepositAboveXAmountInYTimeframe, name: 'Deposit amount exceeds timeframe limit' },
	{ id: RiskAlertCodes.SumsubWords, name: 'Sumsub words' },
	{ id: RiskAlertCodes.WithdrawalOwner, name: 'Withdrawal owner' }
];
