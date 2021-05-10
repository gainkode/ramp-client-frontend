import { CommonTargetValue } from './common.model';
import { getCountry, getCountryByCode3 } from './country-code.model';
import {
    SettingsKyc, SettingsKycTargetFilterType, KycProvider, UserMode, UserType, SettingsKycLevel, SettingsKycLevelShort
} from './generated-models';
import {
    KycTargetFilterList, UserTypeList, KycProviderList, UserModeList
} from './payment.model';

// temp
export const AccountIdFilterList: CommonTargetValue[] = [
    { title: '37d83fbg8954bf', imgClass: '', imgSource: '', id: '' },
    { title: '4g08bf7g6g89ec', imgClass: '', imgSource: '', id: '' },
    { title: '47g8534f87f3ee', imgClass: '', imgSource: '', id: '' },
    { title: 'bdeb95gaabab90', imgClass: '', imgSource: '', id: '' }
];
// temp

export class KycScheme {
    id!: string;
    isDefault = false;
    description!: string;
    name!: string;
    userType!: UserType;
    target: SettingsKycTargetFilterType | null = null;
    targetValues: Array<string> = [];
    kycProviders: Array<KycProvider> = [];
    userModes: Array<UserMode> = [];
    level!: SettingsKycLevel;
    levelId!: string;

    constructor(data: SettingsKyc | null) {
        if (data !== null) {
            this.name = data.name;
            this.id = data.settingsKycId;
            this.isDefault = data.default as boolean;
            this.description = data.description as string;
            this.userType = data.targetUserType;
            if (data.levels) {
                if (data.levels?.length > 0) {
                    this.level = data.levels[0];
                    this.levelId = this.level.settingsKycLevelId;
                }
            }
            data.targetKycProviders?.forEach(x => this.kycProviders.push(x as KycProvider));
            data.targetUserModes?.forEach(x => this.userModes.push(x as UserMode));
            this.target = data.targetFilterType as SettingsKycTargetFilterType | null;
            if (this.target === SettingsKycTargetFilterType.Country) {
                data.targetFilterValues?.forEach(x => {
                    const c = getCountryByCode3(x);
                    if (c != null) {
                        this.targetValues.push(c.name);
                    }
                });
            } else {
                data.targetFilterValues?.forEach(x => this.targetValues.push(x));
            }
        }
    }

    setTarget(filter: SettingsKycTargetFilterType, values: string[]): void {
        this.target = filter;
        values.forEach(x => {
            if (filter === SettingsKycTargetFilterType.Country) {
                const c = getCountry(x);
                if (c !== null) {
                    this.targetValues.push(c.code3);
                }
            } else {
                this.targetValues.push(x);
            }
        });
    }

    get targetName(): string {
        return KycTargetFilterList.find(x => x.id === this.target)?.name as string;
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
