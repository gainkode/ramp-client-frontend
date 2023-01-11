import { SettingsKycTierShortExListResult, User } from "../model/generated-models";

export class KycTierResultData {
    levelName: string | null = '';
    required = false;
    showForm?: boolean;
}

export function getCurrentTierLevelName(tierId: string, tiersData: SettingsKycTierShortExListResult, user: User | null = null): KycTierResultData {
    const result: KycTierResultData = {
        levelName: null,
        required: false
    };
    const kycStatus = user?.kycStatus?.toLowerCase() ?? 'init';

    if ((tiersData.count ?? 0 > 0) && tiersData.list) {
        const newTier = tiersData.list[0];
        console.log(`Current tier: ${tierId}`, `New tier${newTier.settingsKycTierId}`)

        if(newTier.showForm){
            result.showForm = true;
        }

        if(kycStatus == 'waiting' && newTier.skipForWaiting){
            return result;
        }
        
        if (newTier.settingsKycTierId !== tierId) {
            result.levelName = newTier?.originalLevelName ?? null;
            result.required = (result.levelName !== null);
        }
    }
    return result;
}

export function isKycRequired(currentUser: User, tierData: KycTierResultData): [boolean | null, string] {
    let result = true;
    const kycStatus = currentUser.kycStatus?.toLowerCase() ?? 'init';
    let exceedTierName = '';
    if (tierData.required === true) {
        result = true;
        exceedTierName = tierData.levelName ?? '';
    } else {
        if (kycStatus !== 'init' && kycStatus !== 'unknown') {
            result = false;
        } else {
            // if kycStatus = 'init' or 'unknown'
            if (tierData.levelName !== null) {
                const valid = currentUser.kycValid ?? true;
                if (valid === true) {
                    result = false;
                } else if (valid === false) {
                    if (currentUser.kycReviewRejectedType?.toLowerCase() === 'final') {
                        return [null, ''];
                    } else {
                        exceedTierName = tierData.levelName ?? '';
                    }
                }
            } else {
                result = false;
            }
        }
    }
    return [result, exceedTierName];
}
