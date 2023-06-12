import { KycProvider, UserType } from '../model/generated-models';
import { KycTier } from '../model/identification.model';
import { findExistingDefaultTier, getMinSec, isSumsubVerificationComplete } from './utils';

describe('isSumsubVerificationComplete', () => {
	it('should return success', () => {
		const payload = {
			reviewId: 'CbJqo',
			attemptId: 'hHMMr',
			attemptCnt: 7,
			elapsedSincePendingMs: 14980,
			elapsedSinceQueuedMs: 44389,
			reprocessing: true,
			levelName: 'Identity-verification',
			createDate: '2022-07-29 11:45:51+0000',
			reviewDate: '2022-07-29 11:46:06+0000',
			reviewResult: {
				reviewAnswer: 'GREEN'
			},
			reviewStatus: 'completed',
			priority: 0,
			moderatorNames: null,
			autoChecked: false
		};
		const result = isSumsubVerificationComplete(payload);
		expect(result.result).toBeTruthy();
	});
});

describe('findExistingDefaultTier', () => {
	const tierDefaultPersonalSumsub = {
		id: 'tier_default_personal_sumsub_id',
		isDefault: true,
		userType: UserType.Personal,
		kycProviders: [ KycProvider.SumSub ]
	} as KycTier;
	const tierDefaultPersonalShufti = {
		id: 'tier_default_personal_shufti_id',
		isDefault: true,
		userType: UserType.Personal,
		kycProviders: [ KycProvider.Shufti ]
	} as KycTier;
	const tierDefaultMerchantShufti = {
		id: 'tier_default_merchant_shufti_id',
		isDefault: true,
		userType: UserType.Merchant,
		kycProviders: [ KycProvider.Shufti ]
	} as KycTier;
	const tierDefaultPersonalSumsubShufti = {
		id: 'tier_default_personal_sumsub_shufti_id',
		isDefault: true,
		userType: UserType.Personal,
		kycProviders: [ KycProvider.SumSub, KycProvider.Shufti ]
	} as KycTier;
	const tierPersonalSumsubShufti = {
		id: 'tier_personal_sumsub_shufti_id',
		isDefault: false,
		userType: UserType.Personal,
		kycProviders: [ KycProvider.SumSub, KycProvider.Shufti ]
	} as KycTier;
	const tierMerchantSumsub = {
		id: 'tier_merchant_sumsub_id',
		isDefault: false,
		userType: UserType.Merchant,
		kycProviders: [ KycProvider.SumSub ]
	} as KycTier;
	const tierPersonalShufti = {
		id: 'tier_personal_shufti_id',
		isDefault: false,
		userType: UserType.Personal,
		kycProviders: [ KycProvider.Shufti ]
	} as KycTier;
	const tierMerchantShufti = {
		id: 'tier_merchant_shufti_id',
		isDefault: false,
		userType: UserType.Merchant,
		kycProviders: [ KycProvider.Shufti ]
	} as KycTier;

	it('should return true for a tier is set as default (found matched default tier with the same type and provider)', () => {
		const tiers = [
			tierDefaultPersonalSumsub,
			tierDefaultMerchantShufti,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const tier = new KycTier(null);
		Object.assign(tier, tierMerchantShufti);
		tier.isDefault = true;
		const result = findExistingDefaultTier(tiers, tier);
		expect(result).toBeTruthy();
	});

	it('should return true for a tier is set as default (found matched default tier with the same type and all providers)', () => {
		const tiers = [
			tierDefaultPersonalSumsubShufti,
			tierDefaultMerchantShufti,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const tier = new KycTier(null);
		Object.assign(tier, tierPersonalSumsubShufti);
		tier.isDefault = true;
		const result = findExistingDefaultTier(tiers, tier);
		expect(result).toBeTruthy();
	});

	it('should return false for a tier is set as default (matched default, user type, one of providers)', () => {
		const tiers = [
			tierDefaultPersonalSumsubShufti,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const result = findExistingDefaultTier(tiers, tierDefaultPersonalShufti);
		expect(result).toBeFalsy();
	});

	it('should return false for a tier is set as default (matched default)', () => {
		const tiers = [
			tierDefaultPersonalSumsub,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const result = findExistingDefaultTier(tiers, tierDefaultMerchantShufti);
		expect(result).toBeFalsy();
	});

	it('should return false for a tier is set as default (matched default, providers)', () => {
		const tiers = [
			tierDefaultPersonalShufti,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const result = findExistingDefaultTier(tiers, tierDefaultMerchantShufti);
		expect(result).toBeFalsy();
	});

	it('should return false for a tier to be saved is already default', () => {
		const tiers = [
			tierDefaultPersonalSumsub,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const result = findExistingDefaultTier(tiers, tierDefaultPersonalSumsub);
		expect(result).toBeFalsy();
	});

	it('should return false for a tier to be saved is not default', () => {
		const tiers = [
			tierDefaultPersonalSumsub,
			tierPersonalShufti,
			tierMerchantSumsub,
			tierMerchantShufti
		];
		const result = findExistingDefaultTier(tiers, tierPersonalShufti);
		expect(result).toBeFalsy();
	});
});

describe('getMinSec', () => {
	it('should return 05:08 <= 308', () => {
		expect(getMinSec(308)).toEqual('05:08');
	});

	it('should return 00:08 <= 8', () => {
		expect(getMinSec(8)).toEqual('00:08');
	});

	it('should return 00:00 <= 0', () => {
		expect(getMinSec(0)).toEqual('00:00');
	});

	it('should return 01:00 <= 60', () => {
		expect(getMinSec(60)).toEqual('01:00');
	});

	it('should return 00:00 <= -60', () => {
		expect(getMinSec(-60)).toEqual('00:00');
	});
});
