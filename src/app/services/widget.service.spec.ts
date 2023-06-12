import { SettingsKycTierShortEx, SettingsKycTierShortExListResult, User } from '../model/generated-models';
import { getCurrentTierLevelName, isKycRequired, KycTierResultData } from './widget.utils';

describe('getCurrentTierLevelName', () => {
	it('should return shufti-identity tier', () => {
		const payload = {
			count: 2,
			list: [
				{
					settingsKycTierId: '5fd94626-b7da-4ae0-922f-8f30746a45f9',
					name: 'Basic',
					description: '',
					amount: 10000,
					requireUserFullName: false,
					requireUserPhone: false,
					requireUserBirthday: false,
					requireUserAddress: false,
					requireUserFlatNumber: false,
					levelName: 'Identity Verification',
					levelDescription: 'ShuftiPro Identity Verification',
					originalLevelName: 'shufti-identity',
					originalFlowName: 'shufti-identity'
				} as SettingsKycTierShortEx,
				{
					settingsKycTierId: '9728b99b-9292-4a7a-8c65-047a972228db',
					name: 'Pro',
					description: 'Please upload supporting document to confirm the origin of your funds',
					amount: null,
					requireUserFullName: false,
					requireUserPhone: false,
					requireUserBirthday: false,
					requireUserAddress: false,
					requireUserFlatNumber: false,
					levelName: 'Selfie',
					levelDescription: null,
					originalLevelName: 'shufti-face',
					originalFlowName: 'shufti-face'
				} as SettingsKycTierShortEx
			]
		} as SettingsKycTierShortExListResult;
		const tierId = '1ab13a9b-1192-457a-dead-047a972228db';
		const result = getCurrentTierLevelName(tierId, payload);
		expect(result.levelName).toEqual('shufti-identity');
		expect(result.required).toBeTruthy();
	});

	it('should return no tier (current tier returned)', () => {
		const payload = {
			count: 2,
			list: [
				{
					settingsKycTierId: '5fd94626-b7da-4ae0-922f-8f30746a45f9',
					name: 'Basic',
					description: '',
					amount: 10000,
					requireUserFullName: false,
					requireUserPhone: false,
					requireUserBirthday: false,
					requireUserAddress: false,
					requireUserFlatNumber: false,
					levelName: 'Identity Verification',
					levelDescription: 'ShuftiPro Identity Verification',
					originalLevelName: 'shufti-identity',
					originalFlowName: 'shufti-identity'
				} as SettingsKycTierShortEx,
				{
					settingsKycTierId: '9728b99b-9292-4a7a-8c65-047a972228db',
					name: 'Pro',
					description: 'Please upload supporting document to confirm the origin of your funds',
					amount: null,
					requireUserFullName: false,
					requireUserPhone: false,
					requireUserBirthday: false,
					requireUserAddress: false,
					requireUserFlatNumber: false,
					levelName: 'Selfie',
					levelDescription: null,
					originalLevelName: 'shufti-face',
					originalFlowName: 'shufti-face'
				} as SettingsKycTierShortEx
			]
		} as SettingsKycTierShortExListResult;
		const tierId = '5fd94626-b7da-4ae0-922f-8f30746a45f9';
		const result = getCurrentTierLevelName(tierId, payload);
		expect(result.levelName).toEqual(null);
		expect(result.required).toBeFalsy();
	});

	it('should return no tier (no tiers provided)', () => {
		const payload = {
			count: 0,
			list: []
		} as SettingsKycTierShortExListResult;
		const tierId = '1ab13a9b-1192-457a-dead-047a972228db';
		const result = getCurrentTierLevelName(tierId, payload);
		expect(result.levelName).toEqual(null);
		expect(result.required).toBeFalsy();
	});
});


describe('isKycRequired', () => {
	it('should return required (not verified user, tier exists)', () => {
		const user = {
			kycStatus: 'init',
			kycValid: null,
			kycReviewRejectedType: null
		} as User;
		const tierData = {
			levelName: 'level-name',
			required: true
		} as KycTierResultData;
		const result = isKycRequired(user, tierData);
		expect(result[0]).toBeTruthy();
		expect(result[1]).toEqual('level-name');
	});

	it('should return not required (not verified user, no tiers)', () => {
		const user = {
			kycStatus: 'init',
			kycValid: null,
			kycReviewRejectedType: null
		} as User;
		const tierData = {
			levelName: null,
			required: false
		} as KycTierResultData;
		const result = isKycRequired(user, tierData);
		expect(result[0]).toBeFalsy();
		expect(result[1]).toEqual('');
	});

	it('should return not required (not verified user (pending), level-name tier)', () => {
		const user = {
			kycStatus: 'pending',
			kycValid: null,
			kycReviewRejectedType: null
		} as User;
		const tierData = {
			levelName: 'level-name',
			required: false
		} as KycTierResultData;
		const result = isKycRequired(user, tierData);
		expect(result[0]).toBeFalsy();
		expect(result[1]).toEqual('');
	});

	it('should return not required (not verified user, level-name tier)', () => {
		const user = {
			kycStatus: 'unknown',
			kycValid: null,
			kycReviewRejectedType: null
		} as User;
		const tierData = {
			levelName: 'level-name',
			required: false
		} as KycTierResultData;
		const result = isKycRequired(user, tierData);
		expect(result[0]).toBeFalsy();
		expect(result[1]).toEqual('');
	});

	it('should return required (user verification failed, level-name tier)', () => {
		const user = {
			kycStatus: 'unknown',
			kycValid: false,
			kycReviewRejectedType: null
		} as User;
		const tierData = {
			levelName: 'level-name',
			required: false
		} as KycTierResultData;
		const result = isKycRequired(user, tierData);
		expect(result[0]).toBeTruthy();
		expect(result[1]).toEqual('level-name');
	});

	it('should return not required (user verification failed, level-name tier, finally rejected)', () => {
		const user = {
			kycStatus: 'unknown',
			kycValid: false,
			kycReviewRejectedType: 'final'
		} as User;
		const tierData = {
			levelName: 'level-name',
			required: false
		} as KycTierResultData;
		const result = isKycRequired(user, tierData);
		expect(result[0]).toEqual(null);
		expect(result[1]).toEqual('');
	});
});
