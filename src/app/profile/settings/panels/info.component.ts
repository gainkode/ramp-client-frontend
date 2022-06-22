import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { CommonTargetValue } from 'src/app/model/common.model';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { SettingsCurrencyWithDefaults, User, UserInput, UserType } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { EnvService } from 'src/app/services/env.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { getAvatarPath, getCryptoSymbol } from 'src/app/utils/utils';

enum ChangedDataType {
    Unknown = 'Unknown',
    Name = 'Name',
    Currency = 'Currency'
};

@Component({
    selector: 'app-profile-info-settings',
    templateUrl: './info.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss']
})
export class ProfileInfoSettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() onUpdateAvatar = new EventEmitter<string>();

    USER_TYPE: typeof UserType = UserType;
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
    uploadProgress: number | undefined = undefined;
    avatarPath = '';
    avatarError = false;
    kycApproved = false;

    private subscriptions: Subscription = new Subscription();
    private uploadSubscription: Subscription | undefined = undefined;

    constructor(
        private auth: AuthService,
        private commonService: CommonDataService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private http: HttpClient,
        private router: Router) {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.loadCurrencyData();
        if (this.auth.user?.kycValid && this.auth.user?.kycValid !== null) {
            this.kycApproved = this.auth.user?.kycValid;
        }
    }

    private loadAccountData(updateLocalAvatar: boolean): void {
        this.error.emit('');
        this.progressChange.emit(true);
        let avatarLoaded = false;
        const meQuery$ = this.profileService.getProfileData().valueChanges.pipe(take(1));
        this.progressChange.emit(false);
        this.subscriptions.add(
            meQuery$.subscribe(({ data }) => {
                this.progressChange.emit(false);
                if (data) {
                    const userData = data.me as User;
                    if (userData) {
                        this.user = userData;
                        this.userView = new UserItem(this.user);
                        if (avatarLoaded === false) {
                            avatarLoaded = true;
                            if (updateLocalAvatar) {
                                this.auth.setUserAvatar(this.user.avatar ?? '');
                            }
                            this.avatarPath = getAvatarPath(this.user.avatar ?? undefined);
                            this.onUpdateAvatar.emit(this.avatarPath);
                        }
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

    private loadCurrencyData(): void {
        this.fiatList = [];
        this.cryptoList = [];
        const currencyData = this.commonService.getSettingsCurrency().valueChanges.pipe(take(1));
        this.progressChange.emit(true);
        this.subscriptions.add(
            currencyData.subscribe(({ data }) => {
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
                            this.loadAccountData(false);
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
                        this.userView.firstName = resultData.firstName ?? '';
                        this.userView.lastName = resultData.lastName ?? '';
                        this.userView.setFullName();
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

    verifyKyc(): void {
        this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
            window.location.reload();
        });
    }

    uploadAvatar(event): void {
        this.error.emit('');
        this.avatarError = false;
        const file: File = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const formData = new FormData();
            formData.append("docs", file);

            const upload = this.http.post(`${EnvService.api_server}/rest/user/upload-avatar`, formData, {
                headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.auth.token),
                reportProgress: true,
                observe: 'events'
            }).pipe(
                finalize(() => this.onAvatarUploaded())
            );

            this.uploadProgress = 0;
            this.uploadSubscription = upload.subscribe(event => {
                if (event.type == HttpEventType.UploadProgress) {
                    const total = event.total ?? 0;
                    if (total > 0) {
                        this.uploadProgress = Math.round(100 * (event.loaded / total));
                    } else {
                        this.uploadProgress = 100;
                    }
                }
            }, (error) => {
                this.avatarError = true;
                this.error.emit(this.errorHandler.getError(error.message, 'Unable to save avatar'));
                this.uploadProgress = undefined;
            });
        }
    }

    onAvatarUploaded() {
        this.uploadProgress = undefined;
        this.uploadSubscription?.unsubscribe();
        this.uploadSubscription = undefined;
        if (this.avatarError === false) {
            this.loadAccountData(true);
        }
    }

    changeFirstName(data: string): void {
        const vars = {
            firstName: data
        };
        this.setUserData(vars, ChangedDataType.Name);
    }

    changeLastName(data: string): void {
        const vars = {
            lastName: data
        };
        this.setUserData(vars, ChangedDataType.Name);
    }

    changeBirthDate(data: Date | undefined): void {
        const vars = {
            birthday: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeStreet(data: string): void {
        const vars = {
            street: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeSubStreet(data: string): void {
        const vars = {
            subStreet: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeBuildingName(data: string): void {
        const vars = {
            buildingName: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeBuildingNumber(data: string): void {
        const vars = {
            buildingNumber: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeFlatNumber(data: string): void {
        const vars = {
            flatNumber: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeTown(data: string): void {
        const vars = {
            town: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changePostCode(data: string): void {
        const vars = {
            postCode: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeCountry(data: string): void {
        const country = getCountryByCode3(data);
        if (country) {
            const vars = {
                countryCode3: country.code3,
                countryCode2: country.code2
            }
            this.setUserData(vars, ChangedDataType.Unknown);
        }
    }

    changeState(data: string): void {
        const vars = {
            stateName: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changePhone(data: string): void {
        const vars = {
            phone: data
        };
        this.setUserData(vars, ChangedDataType.Unknown);
    }

    changeCrypto(data: string): void {
        const vars = {
            defaultCryptoCurrency: data
        };
        this.setUserData(vars, ChangedDataType.Currency);
    }

    changeFiat(data: string): void {
        const vars = {
            defaultFiatCurrency: data
        };
        this.setUserData(vars, ChangedDataType.Currency);
    }
}
