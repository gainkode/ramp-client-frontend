import { KycProvider, User } from "../model/generated-models";
import { TierItem } from "../model/identification.model";
import { getTierBlocks } from "./profile.utils";

describe('getTierBlocks', () => {
    it('should return 2 sumsub tiers (all available)', () => {
        const data = {
            mySettingsKycTiers: {
                count: 2,
                list: [
                    {
                        settingsKycTierId: 'c9ef76b8-9814-4a96-9bdd-985d6ef62708',
                        name: 'Basic',
                        description: null,
                        amount: 100000,
                        levelName: 'Company Documents',
                        levelDescription: null,
                        originalLevelName: 'Basic-KYB',
                        originalFlowName: 'Basic-KYB',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    },
                    {
                        settingsKycTierId: 'a52780f5-16fd-4fb9-9d3f-28d526a87e19',
                        name: 'Pro',
                        description: '',
                        amount: null,
                        levelName: 'Company Questionnaire',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire',
                        originalFlowName: 'Pro-Questionnaire',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    }
                ]
            }
        };
        const user = {
            kycTierId: 'b1ef05b1-dad0-4a96-7ef1-985d6ef62708',
            kycValid: false,
            kycReviewRejectedType: null,
            kycProvider: KycProvider.SumSub
        } as User;
        const verifiedTierId = '';
        // Get tiers
        const result = getTierBlocks(user, verifiedTierId, data.mySettingsKycTiers);
        // Check results
        const tiers = [
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Basic-KYB',
                limit: '€100,000',
                name: 'Basic',
                passed: false,
                subtitle: 'Company Documents'
            } as TierItem,
            {
                description: '',
                flow: 'Pro-Questionnaire',
                limit: 'Unlimited',
                name: 'Pro',
                passed: false,
                subtitle: 'Company Questionnaire'
            } as TierItem
        ];
        expect(result).toEqual(tiers);
    });

    it('should return 2 shufti tiers (first available)', () => {
        const data = {
            mySettingsKycTiers: {
                count: 2,
                list: [
                    {
                        settingsKycTierId: 'c9ef76b8-9814-4a96-9bdd-985d6ef62708',
                        name: 'Basic',
                        description: null,
                        amount: 100000,
                        levelName: 'Company Documents',
                        levelDescription: null,
                        originalLevelName: 'Basic-KYB',
                        originalFlowName: 'Basic-KYB',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    },
                    {
                        settingsKycTierId: 'a52780f5-16fd-4fb9-9d3f-28d526a87e19',
                        name: 'Pro',
                        description: '',
                        amount: null,
                        levelName: 'Company Questionnaire',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire',
                        originalFlowName: 'Pro-Questionnaire',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    }
                ]
            }
        };
        const user = {
            kycTierId: 'b1ef05b1-dad0-4a96-7ef1-985d6ef62708',
            kycValid: false,
            kycReviewRejectedType: null,
            kycProvider: KycProvider.Shufti
        } as User;
        const verifiedTierId = '';
        // Get tiers
        const result = getTierBlocks(user, verifiedTierId, data.mySettingsKycTiers);
        // Check results
        const tiers = [
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Basic-KYB',
                limit: '€100,000',
                name: 'Basic',
                passed: false,
                subtitle: 'Company Documents'
            } as TierItem,
            {
                description: '',
                flow: 'Pro-Questionnaire',
                limit: 'Unlimited',
                name: 'Pro',
                passed: true,
                subtitle: 'Company Questionnaire'
            } as TierItem
        ];
        expect(result).toEqual(tiers);
    });

    it('should return 2 shufti tiers (first unavailable, second available) - KYC invalid', () => {
        const data = {
            mySettingsKycTiers: {
                count: 2,
                list: [
                    {
                        settingsKycTierId: 'c9ef76b8-9814-4a96-9bdd-985d6ef62708',
                        name: 'Basic',
                        description: null,
                        amount: 100000,
                        levelName: 'Company Documents',
                        levelDescription: null,
                        originalLevelName: 'Basic-KYB',
                        originalFlowName: 'Basic-KYB',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    },
                    {
                        settingsKycTierId: 'a52780f5-16fd-4fb9-9d3f-28d526a87e19',
                        name: 'Pro',
                        description: '',
                        amount: null,
                        levelName: 'Company Questionnaire',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire',
                        originalFlowName: 'Pro-Questionnaire',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    }
                ]
            }
        };
        const user = {
            kycTierId: 'c9ef76b8-9814-4a96-9bdd-985d6ef62708',
            kycValid: false,
            kycReviewRejectedType: null,
            kycProvider: KycProvider.Shufti
        } as User;
        const verifiedTierId = '';
        // Get tiers
        const result = getTierBlocks(user, verifiedTierId, data.mySettingsKycTiers);
        // Check results
        const tiers = [
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Basic-KYB',
                limit: '€100,000',
                name: 'Basic',
                passed: false,
                subtitle: 'Company Documents'
            } as TierItem,
            {
                description: '',
                flow: 'Pro-Questionnaire',
                limit: 'Unlimited',
                name: 'Pro',
                passed: true,
                subtitle: 'Company Questionnaire'
            } as TierItem
        ];
        expect(result).toEqual(tiers);
    });

    it('should return 2 shufti tiers (first unavailable, second available) - KYC valid', () => {
        const data = {
            mySettingsKycTiers: {
                count: 2,
                list: [
                    {
                        settingsKycTierId: 'e64c3572-92e9-46be-bd78-4beefa2e9fc1',
                        name: 'Basic Shufti',
                        description: null,
                        amount: 100000,
                        levelName: 'Company Questionnaire Shufti',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire Shufti',
                        originalFlowName: 'Pro-Questionnaire Shufti',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    },
                    {
                        settingsKycTierId: '3b965347-59bc-43fe-b857-83a817166156',
                        name: 'Basic Shufti Address',
                        description: null,
                        amount: null,
                        levelName: 'Company Questionnaire Shufti Address',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire Shufti Address',
                        originalFlowName: 'Pro-Questionnaire Shufti Address',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    }
                ]
            }
        };
        const user = {
            kycTierId: 'e64c3572-92e9-46be-bd78-4beefa2e9fc1',
            kycValid: true,
            kycReviewRejectedType: null,
            kycProvider: KycProvider.Shufti
        } as User;
        const verifiedTierId = '';
        // Get tiers
        const result = getTierBlocks(user, verifiedTierId, data.mySettingsKycTiers);
        // Check results
        const tiers = [
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Pro-Questionnaire Shufti',
                limit: '€100,000',
                name: 'Basic Shufti',
                passed: true,
                subtitle: 'Company Questionnaire Shufti'
            } as TierItem,
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Pro-Questionnaire Shufti Address',
                limit: 'Unlimited',
                name: 'Basic Shufti Address',
                passed: false,
                subtitle: 'Company Questionnaire Shufti Address'
            } as TierItem
        ];
        expect(result).toEqual(tiers);
    });

    it('should return 2 shufti tiers (first unavailable, second unavailable - validated) - KYC valid', () => {
        const data = {
            mySettingsKycTiers: {
                count: 2,
                list: [
                    {
                        settingsKycTierId: 'e64c3572-92e9-46be-bd78-4beefa2e9fc1',
                        name: 'Basic Shufti',
                        description: null,
                        amount: 100000,
                        levelName: 'Company Questionnaire Shufti',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire Shufti',
                        originalFlowName: 'Pro-Questionnaire Shufti',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    },
                    {
                        settingsKycTierId: '3b965347-59bc-43fe-b857-83a817166156',
                        name: 'Basic Shufti Address',
                        description: null,
                        amount: null,
                        levelName: 'Company Questionnaire Shufti Address',
                        levelDescription: null,
                        originalLevelName: 'Pro-Questionnaire Shufti Address',
                        originalFlowName: 'Pro-Questionnaire Shufti Address',
                        requireUserFullName: false,
                        requireUserPhone: false,
                        requireUserBirthday: false,
                        requireUserAddress: false,
                        requireUserFlatNumber: false
                    }
                ]
            }
        };
        const user = {
            kycTierId: '3b965347-59bc-43fe-b857-83a817166156',
            kycValid: true,
            kycReviewRejectedType: null,
            kycProvider: KycProvider.Shufti
        } as User;
        const verifiedTierId = '';
        // Get tiers
        const result = getTierBlocks(user, verifiedTierId, data.mySettingsKycTiers);
        // Check results
        const tiers = [
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Pro-Questionnaire Shufti',
                limit: '€100,000',
                name: 'Basic Shufti',
                passed: true,
                subtitle: 'Company Questionnaire Shufti'
            } as TierItem,
            {
                description: 'Start verification process to increase your limit up to this level.',
                flow: 'Pro-Questionnaire Shufti Address',
                limit: 'Unlimited',
                name: 'Basic Shufti Address',
                passed: true,
                subtitle: 'Company Questionnaire Shufti Address'
            } as TierItem
        ];
        expect(result).toEqual(tiers);
    });
});
