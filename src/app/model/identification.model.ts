import { CommonTargetValue } from './common.model';
import { getCountry, getCountryByCode3 } from './country-code.model';
import {
    SettingsKyc, SettingsKycTargetFilterType, KycProvider, UserMode, UserType, SettingsKycLevel
} from './generated-models';
import {
    KycTargetFilterList, UserTypeList, KycProviderList, UserModeList
} from './payment.model';

// temp
export const AccountIdFilterList: CommonTargetValue[] = [
    { title: '37d83fbg8954bf', imgClass: '', imgSource: '' },
    { title: '4g08bf7g6g89ec', imgClass: '', imgSource: '' },
    { title: '47g8534f87f3ee', imgClass: '', imgSource: '' },
    { title: 'bdeb95gaabab90', imgClass: '', imgSource: '' }
];
// temp

export class KycScheme {
    id!: string;
    isDefault = false;
    description!: string;
    name!: string;
    target: SettingsKycTargetFilterType | null = null;
    targetValues: Array<string> = [];
    userTypes: Array<UserType> = [];
    kycProviders: Array<KycProvider> = [];
    userModes: Array<UserMode> = [];
    levels: Array<SettingsKycLevel> = [];

    constructor(data: SettingsKyc | null) {
        if (data !== null) {
            this.name = data.name;
            this.id = data.settingsKycId;
            this.isDefault = data.default as boolean;
            this.description = data.description as string;
            data.levels?.forEach(x => this.levels.push(x as SettingsKycLevel));
            data.targetKycProviders?.forEach(x => this.kycProviders.push(x as KycProvider));
            data.targetUserModes?.forEach(x => this.userModes.push(x as UserMode));
            data.targetUserTypes?.forEach(x => this.userTypes.push(x as UserType));
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

    get userTypeList(): string {
        let s = '';
        let p = false;
        this.userTypes.forEach(x => {
            const v = UserTypeList.find(t => t.id === x)?.name as string;
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
    levelData!: KycLevelItem;
    flowData!: KycLevelItem;
    created!: Date;
    createdBy: string = '';

    constructor(data: SettingsKycLevel | null) {
        if (data !== null) {
            this.name = data.name as string;
            this.id = data.settingsKycLevelId;
            this.created = data.created;
            this.createdBy = data.createdBy as string;
            const content = JSON.parse(data.data as string);
            if (content !== undefined) {
                this.levelData = content.level;
                this.flowData = content.flow;
            }
        }
    }
}
