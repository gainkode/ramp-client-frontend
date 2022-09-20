import { KycProvider, SettingsKycTierShortEx, SettingsKycTierShortExListResult, User } from "../model/generated-models";
import { TierItem } from "../model/identification.model";

export function getTierBlocks(user: User, verifiedTierId: string, tiersData: SettingsKycTierShortExListResult): TierItem[] {
    let tiers: TierItem[] = [];
    if ((tiersData.count ?? 0 > 0) && tiersData.list) {
        const rawTiers = [...tiersData.list];
        const currentTierId = user.kycTierId;
        const sortedTiers = rawTiers.sort((a, b) => tierSortHandler(a, b));
        let beforeCurrentTier = (sortedTiers.find(x => x.settingsKycTierId === currentTierId) !== undefined);
        tiers = sortedTiers.map(val => {
            const defaultDescription = 'Start verification process to increase your limit up to this level.';
            const unlimitVal = (val.amount === undefined || val.amount === null);
            let tierPassed = false;
            if (beforeCurrentTier) {
                if (val.settingsKycTierId === currentTierId) {
                    beforeCurrentTier = false;
                    if (val.originalLevelName !== null) {
                        tierPassed = user.kycValid ?? true;
                        if (tierPassed === false && user.kycReviewRejectedType?.toLowerCase() === 'final') {
                            tierPassed = true;
                        }
                    } else {
                        tierPassed = true;
                    }
                } else {
                    tierPassed = true;
                }
            }
            if (val.settingsKycTierId === verifiedTierId) {
                tierPassed = true;
            }
            return {
                limit: (unlimitVal) ?
                    'Unlimited' :
                    new Intl.NumberFormat('de-DE', {
                        minimumFractionDigits: 0,
                        style: 'currency',
                        currency: 'EUR'
                    }).format(val.amount ?? 0),
                name: val.name,
                passed: tierPassed,
                subtitle: val.levelName ?? 'Identity',
                description: val.description ?? defaultDescription,
                flow: val.originalLevelName ?? ''
            } as TierItem;
        });
        // If the user's KYC provider is Shufti, set inactive all tiers but the first
        if (user.kycProvider === KycProvider.Shufti) {
            let passedFlag = false;
            let i = 0;
            while (i < tiers.length) {
                if (i > 0 && passedFlag) {
                    tiers[i].passed = true;
                }
                if (!tiers[i].passed) {
                    passedFlag = true;
                }
                i++;
            }
        }
    }
    return tiers;
}

function tierSortHandler(a: SettingsKycTierShortEx, b: SettingsKycTierShortEx): number {
    let aa = a.amount ?? 0;
    let ba = b.amount ?? 0;
    if ((a.amount === undefined || a.amount === null) && b.amount) {
        return 1;
    }
    if (a.amount && (b.amount === undefined || b.amount === null)) {
        return -1;
    }
    if (aa > ba) {
        return 1;
    }
    if (aa < ba) {
        return -1;
    }
    return 0;
}