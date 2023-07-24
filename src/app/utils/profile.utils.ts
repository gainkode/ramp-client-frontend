import { KycProvider, SettingsKycTierShortEx, SettingsKycTierShortExListResult, User } from '../model/generated-models';
import { TierItem } from '../model/identification.model';

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

			if (beforeCurrentTier && val.settingsKycTierId === currentTierId) {
				beforeCurrentTier = false;
				tierPassed = val.originalLevelName !== null ? user.kycValid : true;
			  } else {
				tierPassed = true;
			}

			return {
				limit: (unlimitVal) ?
					'Unlimited' :
					new Intl.NumberFormat('de-DE', {
						minimumFractionDigits: 0,
						style: 'currency',
						currency: val.currency ?? 'EUR'
					}).format(val.amount ?? 0),
				name: val.name,
				passed: tierPassed,
				subtitle: val.levelName ?? 'Identity',
				description: val.description ?? defaultDescription,
				flow: val.originalLevelName ?? '',
				companyLevelVerification: val.showForm
			} as TierItem;
		});
		// If the user's KYC provider is Shufti and Autentix, set inactive all tiers but the first
		if (user.kycProvider === KycProvider.Shufti || user.kycProvider === KycProvider.Au10tix) {
			for (let i = 1; i < tiers.length; i++) {
			  if (!tiers[i].passed) {
					tiers[i].passed = true;
			  }
			}
		}
	}
	return tiers;
}

export function tierSortHandler(a: SettingsKycTierShortEx, b: SettingsKycTierShortEx): number {
	const aa = a.amount ?? 0;
	const ba = b.amount ?? 0;
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