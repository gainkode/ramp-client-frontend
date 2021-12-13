import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonTargetValue } from 'src/app/model/common.model';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { SettingsCurrency, SettingsCurrencyWithDefaults, User, UserInput } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { getCryptoSymbol } from 'src/app/utils/utils';

enum ChangedDataType {
    Unknown = 'Unknown',
    Name = 'Name',
    Currency = 'Currency',
    Avatar = 'Avatar'
};

@Component({
    selector: 'app-personal-info-settings',
    templateUrl: './personal-info.component.html',
    styleUrls: ['../../../../../assets/menu.scss', '../../../../../assets/button.scss', '../../../../../assets/profile.scss']
})
export class PersonalInfoSettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    user!: User;
    userView: UserItem = new UserItem(null);
    countryList: CommonTargetValue[] = Countries.map(val => {
        return {
            id: val.code3,
            title: val.name,
            imgClass: 'country-flag',
            imgSource: `assets/svg-country-flags/${val.code2.toLowerCase()}.svg`
        } as CommonTargetValue;
    });
    fiatList: CommonTargetValue[] = [];
    cryptoList: CommonTargetValue[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private commonService: CommonDataService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.loadCurrencyData();
    }

    private loadAccountData(): void {
        this.error.emit('');
        this.progressChange.emit(true);
        const meQuery = this.profileService.getProfileData();
        if (meQuery === null) {
            this.error.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.progressChange.emit(false);
            this.subscriptions.add(
                meQuery.valueChanges.subscribe(({ data }) => {
                    this.progressChange.emit(false);
                    if (data) {
                        const userData = data.me as User;
                        if (userData) {
                            this.user = userData;
                            this.userView = new UserItem(this.user);
                        }
                    } else {
                        this.router.navigateByUrl('/');
                    }
                }, (error) => {
                    this.progressChange.emit(false);
                    if (this.auth.token !== '') {
                        this.error.emit(this.errorHandler.getError(error.message, 'Unable to load user data'));
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private loadCurrencyData(): void {
        this.fiatList = [];
        this.cryptoList = [];
        const currencyData = this.commonService.getSettingsCurrency();
        if (currencyData === null) {
            this.error.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.progressChange.emit(true);
            this.subscriptions.add(
                currencyData.valueChanges.subscribe(({ data }) => {
                    this.progressChange.emit(false);
                    const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
                    let itemCount = 0;
                    if (currencySettings.settingsCurrency) {
                        itemCount = currencySettings.settingsCurrency.count as number;
                        if (itemCount > 0) {
                            if (currencySettings.settingsCurrency.list) {
                                this.fiatList = currencySettings.settingsCurrency.list.filter(x => x.fiat === true).map(val => {
                                    return {
                                        id: val.symbol,
                                        title: val.symbol,
                                        imgSource: ''
                                    } as CommonTargetValue;
                                });
                                this.cryptoList = currencySettings.settingsCurrency.list.filter(x => x.fiat === false).map(val => {
                                    return {
                                        id: val.symbol,
                                        title: val.symbol,
                                        imgClass: '__form-finance-combo-item-img',
                                        imgSource: `assets/svg-crypto/${getCryptoSymbol(val.symbol).toLowerCase()}.svg`
                                    } as CommonTargetValue;
                                });
                                this.loadAccountData();
                            }
                        }
                    }
                }, (error) => {
                    this.progressChange.emit(false);
                    if (this.auth.token !== '') {
                        this.error.emit(this.errorHandler.getError(error.message, 'Unable to load currency data'));
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    private setUserData(vars: UserInput, dataChanged: ChangedDataType): void {
        this.error.emit('');
        this.progressChange.emit(true);
        this.subscriptions.add(
            this.profileService.saveUserInfo(vars).subscribe(({ data }) => {
                this.progressChange.emit(false);
                const resultData = data.updateMe as User;
                if (!resultData) {
                    this.error.emit('Unable to save user data');
                } else {
                    this.user = resultData;
                    if (dataChanged === ChangedDataType.Name) {
                        this.auth.setUserName(resultData.firstName ?? '', resultData.lastName ?? '');
                    } else if (dataChanged === ChangedDataType.Currency) {
                        this.auth.setUserCurrencies(resultData.defaultCryptoCurrency ?? '', resultData.defaultFiatCurrency ?? '');
                    }
                }
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Unable to save user data'));
            })
        );
    }

    private getCurrentUserData(): UserInput {
        const result = {
            firstName: this.user.firstName ?? undefined,
            lastName: this.user.lastName ?? undefined,
            countryCode2: this.user.countryCode2 ?? undefined,
            countryCode3: this.user.countryCode3 ?? undefined,
            birthday: this.user.birthday ?? undefined,
            phone: this.user.phone ?? undefined,
            postCode: this.user.postCode ?? undefined,
            town: this.user.town ?? undefined,
            street: this.user.street ?? undefined,
            subStreet: this.user.subStreet ?? undefined,
            stateName: this.user.stateName ?? undefined,
            buildingName: this.user.buildingName ?? undefined,
            buildingNumber: this.user.buildingNumber ?? undefined,
            flatNumber: this.user.flatNumber ?? undefined,
            avatar: this.user.avatar ?? undefined,
            defaultFiatCurrency: this.user.defaultFiatCurrency ?? undefined,
            defaultCryptoCurrency: this.user.defaultCryptoCurrency ?? undefined
        } as UserInput;
        return result;
    }

    verifyKyc(): void {
        this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
            window.location.reload();
        });
    }

    setAvatar(): void {

    }

    changeFirstName(data: string): void {
        const vars = this.getCurrentUserData();
        vars.firstName = data;
        this.setUserData(vars, ChangedDataType.Name);
    }

    changeLastName(data: string): void {
        const vars = this.getCurrentUserData();
        vars.lastName = data;
        this.setUserData(vars, ChangedDataType.Name);
    }

    changeBirthDate(data: Date | undefined): void {
        const vars = this.getCurrentUserData();
        vars.birthday = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeStreet(data: string): void {
        const vars = this.getCurrentUserData();
        vars.street = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeSubStreet(data: string): void {
        const vars = this.getCurrentUserData();
        vars.subStreet = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeBuildingName(data: string): void {
        const vars = this.getCurrentUserData();
        vars.buildingName = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeBuildingNumber(data: string): void {
        const vars = this.getCurrentUserData();
        vars.buildingNumber = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeFlatNumber(data: string): void {
        const vars = this.getCurrentUserData();
        vars.flatNumber = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeTown(data: string): void {
        const vars = this.getCurrentUserData();
        vars.town = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changePostCode(data: string): void {
        const vars = this.getCurrentUserData();
        vars.postCode = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeCountry(data: string): void {
        const country = getCountryByCode3(data);
        if (country) {
            const vars = this.getCurrentUserData();
            vars.countryCode3 = country.code3;
            vars.countryCode2 = country.code2;
            this.setUserData(vars, ChangedDataType.Unknown);
        }
    }

    changeState(data: string): void {
        const vars = this.getCurrentUserData();
        vars.lastName = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changePhone(data: string): void {
        const vars = this.getCurrentUserData();
        vars.phone = data;
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeCrypto(data: string): void {
        const vars = this.getCurrentUserData();
        vars.defaultCryptoCurrency = data;
        this.setUserData(vars, ChangedDataType.Currency);
    }

    changeFiat(data: string): void {
        const vars = this.getCurrentUserData();
        vars.defaultFiatCurrency = data;
        this.setUserData(vars, ChangedDataType.Currency);
    }
}
