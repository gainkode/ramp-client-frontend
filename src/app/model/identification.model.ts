import { CommonTargetValue } from './common.model';
import { getCountryByCode3 } from './country-code.model';
import {
	KycProvider,
	SettingsKycLevel, SettingsKycLevelShort,
	SettingsKycTargetFilterType,
	SettingsKycTier,
	UserMode, UserType
} from './generated-models';
import {
	KycProviderList,
	KycTargetFilterList,
	UserModeList
} from './payment.model';


export class KycTier {
	id!: string;
	isDefault = false;
	amount: number | null = null;
	description!: string;
	name!: string;
	userType!: UserType;
	target: SettingsKycTargetFilterType | null = null;
	targetValues: Array<string> = [];
	kycProviders: Array<KycProvider> = [];
	userModes: Array<UserMode> = [];
	level!: SettingsKycLevel;
	levelId!: string;
	requireUserFullName = false;
	requireUserPhone = false;
	requireUserBirthday = false;
	requireUserAddress = false;
	requireUserFlatNumber = false;

	constructor(data: SettingsKycTier | null) {
		if (data !== null) {
			this.name = data.name;
			this.id = data.settingsKycTierId;
			this.isDefault = data.default ?? false;
			this.description = data.description ?? '';
			this.amount = data.amount ?? null;
			this.userType = data.targetUserType;
			this.requireUserFullName = data.requireUserFullName as boolean;
			this.requireUserPhone = data.requireUserPhone as boolean;
			this.requireUserBirthday = data.requireUserBirthday as boolean;
			this.requireUserAddress = data.requireUserAddress as boolean;
			this.requireUserFlatNumber = data.requireUserFlatNumber as boolean;
			if (data.level) {
				this.level = data.level;
				this.levelId = this.level.settingsKycLevelId;
			}
			data.targetKycProviders?.forEach(x => this.kycProviders.push(x as KycProvider));
			data.targetUserModes?.forEach(x => this.userModes.push(x as UserMode));
			this.target = data.targetFilterType as SettingsKycTargetFilterType | null;
			if (this.target === SettingsKycTargetFilterType.Country) {
				data.targetFilterValues?.forEach(x => {
					const c = getCountryByCode3(x);
					if (c != null) {
						this.targetValues.push(c.code3);
					}
				});
			} else {
				data.targetFilterValues?.forEach(x => this.targetValues.push(x));
			}
		}
	}

	setTarget(filter: SettingsKycTargetFilterType, values: CommonTargetValue[]): void {
		this.target = filter;
		this.targetValues = values.map(x => x.id);
	}

	get targetName(): string {
		return KycTargetFilterList.find(x => x.id === this.target)?.name as string;
	}

	get levelName(): string {
		return this.level ? this.level.name as string : '';
	}

	get amountExt(): string {
		return (this.amount !== undefined && this.amount !== null) ? this.amount.toString() : 'Unlimited';
	}

	get kycProviderList(): string {
		let s = '';
		let p = false;
		this.kycProviders.forEach(x => {
			const v = KycProviderList.find(t => t.id === x)?.name as string;
			s = `${s}${p ? ', ' : ''}${v}`;
			p = true;
		});
		return s;
	}

	get userModeList(): string {
		let s = '';
		let p = false;
		this.userModes.forEach(x => {
			const v = UserModeList.find(t => t.id === x)?.name as string;
			s = `${s}${p ? ', ' : ''}${v}`;
			p = true;
		});
		return s;
	}
}

export class KycLevelItem {
	name!: string;
	value!: string;
	description!: string;
}

export class KycLevel {
	id!: string;
	name!: string;
	description!: string;
	userType!: UserType;
	levelData!: KycLevelItem;
	flowData!: KycLevelItem;
	created!: Date;
	createdBy = '';

	constructor(data: SettingsKycLevel | null) {
		if (data !== null) {
			this.name = data.name as string;
			this.id = data.settingsKycLevelId;
			this.description = data.description as string;
			this.userType = data.userType as UserType;
			this.created = data.created;
			this.createdBy = data.createdBy as string;
			const content = JSON.parse(data.data as string);
			if (content !== undefined) {
				this.levelData = content.level;
				this.flowData = content.flow;
			}
		} else {
			this.levelData = new KycLevelItem();
			this.flowData = new KycLevelItem();
		}
	}

	getDataObject(): string {
		return JSON.stringify({
			level: {
				name: 'Level name',
				description: 'KYC verification level name.',
				value: this.levelData.value
			},
			flow: {
				name: 'Flow name',
				description: 'KYC verification flow name.',
				value: this.flowData.value
			}
		});
	}
}

export class KycLevelShort {
	id!: string;
	name!: string;
	description!: string;
	levelData!: KycLevelItem;
	flowData!: KycLevelItem;

	constructor(data: SettingsKycLevelShort | null) {
		if (data !== null) {
			this.name = data.name as string;
			this.id = data.settingsKycLevelId;
			this.description = data.description as string;
			const content = JSON.parse(data.data as string);
			if (content !== undefined) {
				this.levelData = content.level;
				this.flowData = content.flow;
			}
		} else {
			this.levelData = new KycLevelItem();
			this.flowData = new KycLevelItem();
		}
	}

	getDataObject(): string {
		return JSON.stringify({
			level: {
				name: 'Level name',
				description: 'KYC verification level name.',
				value: this.levelData.value
			},
			flow: {
				name: 'Flow name',
				description: 'KYC verification flow name.',
				value: this.flowData.value
			}
		});
	}
}

export class TierItem {
	name = '';
	limit = '';
	subtitle = '';
	description = '';
	flow = '';
	passed = false;
	companyLevelVerification = false;
}
